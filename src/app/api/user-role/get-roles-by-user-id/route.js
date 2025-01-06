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
        }
        let userId = token.id;
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const isSubUser = user.id !== user.createdBy;
        if (isSubUser) {
            const adminUser = await prisma.user.findUnique({ where: { id: user.createdBy } });
            userId = adminUser.id
        };
        if (!user) {
            return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
        }
        const queryFilter = {
            AND: [
                { isDeleted: 'N' }
            ]
        };
        if (user.roleId !== '1') {
            queryFilter.AND.push({ userId });
        }
        if (searchText) {
            queryFilter.AND.push({
                OR: [
                    { roleName: { contains: searchText } },
                    { name: { contains: searchText } },
                    { createdBy: { contains: searchText } },
                ]
            });
        }
        if (page && pageSize) {
            let skip = (page - 1) * pageSize;
            const totalCount = await prisma.role.count({
                where: queryFilter
            });
            if (skip >= totalCount) {
                skip = totalCount - pageSize;
            }
            if (skip < 0) skip = 0;
            const getRoles = await prisma.role.findMany({
                where: queryFilter,
                select: {
                    id: true,
                    userId: true,
                    roleName: true,
                    name: true,
                    createdBy: true,
                    isAssigned: true,
                },
                skip,
                take: pageSize
            });
            const totalPages = Math.ceil(totalCount / pageSize);
            return NextResponse.json({
                result: true,
                message: getRoles,
                totalPages
            });
        } else {
            const getRoles = await prisma.role.findMany({
                where: queryFilter,
                select: {
                    id: true,
                    userId: true,
                    roleName: true,
                    name: true,
                    createdBy: true,
                    isAssigned: true,
                }
            });
            return NextResponse.json({
                result: true,
                message: getRoles
            });
        }
    } catch (error) {
        return NextResponse.json({ result: false, message: error.message });
    }
}
