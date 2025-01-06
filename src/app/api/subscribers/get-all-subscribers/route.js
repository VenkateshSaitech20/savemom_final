import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { responseData } from '@/utils/message';
import { extractTokenData } from '@/utils/helper';

const prisma = new PrismaClient();

// Get All subscribers
export async function POST(req) {
    try {
        const token = extractTokenData(req.headers);
        if (!token.id) {
            return NextResponse.json({ result: false, message: { invalidToken: responseData.invalidToken } });
        };
        let userId = token.id;
        const user = await prisma.user.findUnique({ where: { id: userId, isDeleted: "N" } });
        if (!user) {
            return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
        }
        const body = await req.json();
        const { searchText, page, pageSize } = body;
        let skip = (page - 1) * pageSize;
        let queryFilter = {
            AND: [
                ...(searchText ? [{ email: { contains: searchText } }] : [])
            ]
        };
        const totalCount = await prisma.subscribers.count({ where: queryFilter });
        if (skip >= totalCount) {
            skip = totalCount - pageSize;
        }
        if (skip < 0) skip = 0;
        const totalPages = Math.ceil(totalCount / pageSize);
        const subscribers = await prisma.subscribers.findMany({ where: queryFilter, skip, take: pageSize, orderBy: { id: 'desc' } });
        return NextResponse.json({ result: true, message: subscribers, totalPages });
    } catch (error) {
        return NextResponse.json({ result: false, error: error.message });
    }
};
