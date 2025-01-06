import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { extractTokenData } from '@/utils/helper';
import { responseData } from '@/utils/message';
const prisma = new PrismaClient();

export async function POST(req) {
    try {
        const token = extractTokenData(req.headers);
        const body = await req.json();
        let { searchImage, page, pageSize } = body;
        if (!token.id) {
            return NextResponse.json({ result: false, message: { invalidToken: responseData.invalidToken } });
        };
        let userId = token.id;
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
        }
        const queryFilter = {
            AND: [
                ...(searchImage ? [{
                    OR: [
                        { image: { contains: searchImage } },
                    ]
                }] : [])
            ]
        };

        let skip = (page - 1) * pageSize;
        const totalCount = await prisma.brands.count({
            where: queryFilter
        });
        if (skip >= totalCount) {
            skip = totalCount - pageSize;
        }
        if (skip < 0) skip = 0;
        const totalPages = Math.ceil(totalCount / pageSize);
        const users = await prisma.brands.findMany({

            where: queryFilter,
            select: {
                id: true,
                image: true,
            },
            skip,
            take: pageSize
        });
        return NextResponse.json({ result: true, message: users, totalPages });
    } catch (error) {
        return NextResponse.json({ result: false, message: { roleError: error } });
    }
}


