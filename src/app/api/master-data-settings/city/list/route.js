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
        const queryFilter = {
            AND: [
                { isDeleted: 'N' },
                ...(searchText ? [{
                    OR: [
                        { name: { contains: searchText } },
                        { country: { contains: searchText } },
                        { state: { contains: searchText } },
                        { shortname: { contains: searchText } },
                        { lgdCode: { contains: searchText } }
                    ]
                }] : [])
            ]
        };
        let skip = (page - 1) * pageSize;
        const totalCount = await prisma.city.count({
            where: queryFilter
        });
        if (skip >= totalCount) {
            skip = totalCount - pageSize;
        }
        if (skip < 0) skip = 0;
        const totalPages = Math.ceil(totalCount / pageSize);
        const cities = await prisma.city.findMany({
            where: queryFilter,
            select: {
                id: true,
                name: true,
                country: true,
                lgdCode: true,
                shortname: true,
                state: true,
                isActive: true,
            },
            skip,
            take: pageSize
        });
        return NextResponse.json({ result: true, message: cities, totalPages });
    } catch (error) {
        return NextResponse.json({ result: false, message: { roleError: error } });
    }
}
