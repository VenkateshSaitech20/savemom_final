import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function POST(req) {
    try {
        const body = await req.json();
        let { page, pageSize } = body;
        const queryFilter = {
            AND: [
                { isDeleted: 'N' }
            ]
        };
        let skip = (page - 1) * pageSize;
        const totalCount = await prisma.contents.count({ where: queryFilter });
        if (skip >= totalCount) {
            skip = totalCount - pageSize;
        }
        if (skip < 0) skip = 0;
        const totalPages = Math.ceil(totalCount / pageSize);
        const contents = await prisma.contents.findMany({
            where: queryFilter,
            orderBy: { id: 'desc' },
            select: {
                id: true,
                title: true,
                image: true,
                categoryName: true,
                slug: true,
                shortContent: true,
                postedBy: true,
                updatedAt: true
            },
            skip,
            take: pageSize
        });
        return NextResponse.json({ result: true, message: contents, totalPages });
    } catch (error) {
        console.log("error:", error);
        return NextResponse.json({ result: false, message: { roleError: error } });
    }
}
