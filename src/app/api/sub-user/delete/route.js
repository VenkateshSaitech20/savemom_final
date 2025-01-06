import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { responseData } from '@/utils/message';
import { extractTokenData } from '@/utils/helper';

const prisma = new PrismaClient();

// Delete user
export async function POST(req) {
    try {
        const token = extractTokenData(req.headers);
        if (!token.id) {
            return NextResponse.json({ result: false, message: { invalidToken: responseData.invalidToken } });
        };
        let id = token.id;
        const getUser = await prisma.user.findUnique({ where: { id: id, isDeleted: "N" } });
        if (!getUser) {
            return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
        }

        const body = await req.json();
        const { userId } = body;
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
        }
        await prisma.user.update({
            where: { id: userId },
            data: { isDeleted: 'Y' }
        });
        return NextResponse.json({ result: true, message: responseData.userDeleted })
    } catch (error) {
        return NextResponse.json({ result: false, message: error })
    }
}
