import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { extractTokenData } from '@/utils/helper';
import { responseData } from '@/utils/message';

const prisma = new PrismaClient();

export async function POST(req) {
    try {
        const token = extractTokenData(req.headers);
        const body = await req.json();
        let { searchText, page, pageSize } = body;
        if (!token.id) {
            return NextResponse.json({ result: false, message: { invalidToken: responseData.invalidToken } });
        };
        let userId = token.id;
        const user = await prisma.user.findUnique({ where: { id: userId, isDeleted: "N" } });
        if (!user) {
            return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
        }
        let queryFilter;
        if (user.roleId !== "1") {
            userId = user.createdBy;
            const roles = await prisma.user.findMany({
                where: { createdBy: userId, isDeleted: "N" },
            });
            let roleSubUserIds = roles.map(role => role.id);
            roleSubUserIds = roleSubUserIds.filter(id => id !== user.id);
            queryFilter = {
                AND: [
                    { id: { in: roleSubUserIds } },
                    { isDeleted: 'N' },
                    ...(searchText ? [{
                        OR: [
                            { name: { contains: searchText } },
                            { roleName: { contains: searchText } },
                            { paymentStatus: { contains: searchText } },
                            { profileStatus: { contains: searchText } },
                        ]
                    }] : [])
                ]
            };
        } else {
            queryFilter = {
                AND: [
                    { isDeleted: 'N' },
                    { roleId: { not: "1" } },
                    ...(searchText ? [{
                        OR: [
                            { name: { contains: searchText } },
                            { roleName: { contains: searchText } },
                            { profileStatus: { contains: searchText } },
                            { companyName: { contains: searchText } },
                        ]
                    }] : [])
                ]
            }
        }
        let skip = (page - 1) * pageSize;
        const totalCount = await prisma.user.count({
            where: queryFilter
        });
        if (skip >= totalCount) {
            skip = totalCount - pageSize;
        }
        if (skip < 0) skip = 0;
        const totalPages = Math.ceil(totalCount / pageSize);
        const users = await prisma.user.findMany({
            where: queryFilter,
            select: {
                id: true,
                createdBy: true,
                name: true,
                roleName: true,
                profileStatus: true,
                adminApprovalId: true,
                packageId: true,
                companyName: true
            },
            skip,
            take: pageSize
        });
        return NextResponse.json({ result: true, message: users, totalPages });
    } catch (error) {
        return NextResponse.json({ result: false, message: { roleError: error } });
    }
}
