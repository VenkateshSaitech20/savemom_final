import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { deleteFields } from '@/app/api/api-utlis/helper';
import { responseData } from '@/utils/message';
import { extractTokenData } from '@/utils/helper';

const prisma = new PrismaClient();

export async function POST(req) {
    try {
        const token = extractTokenData(req.headers);
        if (!token.id) {
            return NextResponse.json({ result: false, message: { tokenExpired: responseData.tokenExpired } });
        }
        const user = await prisma.user.findUnique({ where: { id: token.id, isDeleted: "N" } });
        if (!user) {
            return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
        }
        const body = await req.json();
        const { id } = body;
        const templateDetails = await prisma.voice_call_templates.findUnique({ where: { id: parseInt(id), isDeleted: "N" } });
        if (templateDetails) {
            deleteFields(templateDetails, ['createdAt', 'updatedAt', 'updatedBy', "isDeleted"]);
            return NextResponse.json({ result: true, message: templateDetails });
        }
        return NextResponse.json({ result: true, message: {} });
    } catch (error) {
        return NextResponse.json({ result: false, error: error });
    }
};
