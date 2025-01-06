import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { responseData } from '@/utils/message';
import { extractTokenData } from '@/utils/helper';
const prisma = new PrismaClient();
export async function GET(req) {
    try {
        const token = extractTokenData(req.headers);
        if (!token) {
            return NextResponse.json({ result: false, message: { tokenExpired: responseData.tokenExpired } });
        }
        const user = await prisma.user.findUnique({
            where: { id: token.id, isDeleted: "N" }
        });
        if (!user) {
            return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
        }
        let respData = {
            result: true,
            message: "Dashboard Table Data"
        };
        if (user.roleId === "1") {
            const payMethods = await prisma.configure_subscription.findMany({
                select: { id: true, name: true, type: true, isActive: true }
            });
            const landPageContent = await prisma.section_content.findMany({
                select: { id: true, sectionType: true, badgeTitle: true, isfrontendvisible: true }
            });
            respData.payMethods = payMethods;
            respData.landPageContent = landPageContent;
        }
        return NextResponse.json(respData);
    } catch (error) {
        return NextResponse.json({ error: error.message });
    }
}
