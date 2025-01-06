import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { extractTokenData } from '@/utils/helper';
import { responseData } from '@/utils/message';

const prisma = new PrismaClient();

export async function POST(req) {
    try {
        const token = extractTokenData(req.headers);
        const body = await req.json();
        let { searchText, page, pageSize, type } = body;
        if (!token.id) {
            return NextResponse.json({ result: false, message: { invalidToken: responseData.invalidToken } });
        };
        let userId = token.id;
        const user = await prisma.user.findUnique({ where: { id: userId, isDeleted: "N" } });
        if (!user) {
            return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
        }
        if (user.roleId !== "1") {
            userId = user.createdBy
        }
        const queryFilter = {
            AND: [
                { isDeleted: 'N' },
                { profileStatus: type },
                { id: { not: user.id } },
                { roleId: { not: "1" } }
            ]
        };
        if (user.roleId !== "1") {
            queryFilter.AND.push({ createdBy: userId });
        }
        if (searchText) {
            queryFilter.AND.push({
                name: {
                    contains: searchText,
                }
            });
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
                email: true,
                contactNo: true,
                roleName: true,
                address: true,
                state: true,
                country: true,
            },
            skip,
            take: pageSize
        });
        return NextResponse.json({ result: true, message: users, totalPages });
    } catch (error) {
        return NextResponse.json({ result: false, message: { roleError: error } });
    }
}
