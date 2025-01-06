import { extractTokenData } from "@/utils/helper";
import { responseData } from "@/utils/message";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req) {
    try {
        const token = extractTokenData(req.headers);
        if (!token) {
            return NextResponse.json({ result: false, message: { tokenExpired: responseData.tokenExpired } });
        }
        const user = await prisma.user.findUnique({ where: { id: token.id, isDeleted: "N" } });
        if (!user) {
            return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
        }
        const body = await req.json();
        const { templateType } = body;
        const mailTemplate = await prisma.mail_templates.findFirst({ where: { templateType: templateType } });
        return NextResponse.json({ result: true, message: mailTemplate });
    } catch (error) {
        return NextResponse.json({ result: false, error: error });
    }
}
