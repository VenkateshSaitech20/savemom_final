import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { extractTokenData } from '@/utils/helper';
import { responseData } from '@/utils/message';

const prisma = new PrismaClient();

export async function POST(req) {
    try {
        const token = extractTokenData(req.headers);
        const body = await req.json();
        let { id, value } = body;
        if (!token.id) {
            return NextResponse.json({ result: false, message: { invalidToken: responseData.invalidToken } });
        };
        let userId = token.id;
        const user = await prisma.user.findUnique({ where: { id: userId, isDeleted: "N" } });
        if (!user) {
            return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
        }
        if (user.roleId === "1") {
            await prisma.user.update({ where: { id }, data: { adminApprovalId: value } });
            await prisma.user.updateMany({ where: { createdBy: id }, data: { adminApprovalId: value } });
            return NextResponse.json({ result: true, message: responseData.statusChanged });
        } else {
            return NextResponse.json({ result: false, message: "You can't change the role" });
        }
    } catch (error) {
        return NextResponse.json({ result: false, message: error });
    }
}
