import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { extractTokenData } from '@/utils/helper';

const prisma = new PrismaClient();

export async function POST(req) {
    try {
        const body = await req.json();
        const { id } = body;
        const token = extractTokenData(req.headers);
        if (!token.id) {
            return NextResponse.json({ result: false, message: { tokenExpired: responseData.tokenExpired } });
        }
        const user = await prisma.user.findUnique({ where: { id: token.id, isDeleted: "N" } });
        let userId = user.id;
        if (!userId) {
            return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
        } else {
            const subUser = await prisma.user.findUnique({ where: { id: id, isDeleted: "N" } });
            return NextResponse.json({ result: true, message: subUser });
        }
    } catch (error) {
        return NextResponse.json({ result: false, message: { error: error } });
    }
};

