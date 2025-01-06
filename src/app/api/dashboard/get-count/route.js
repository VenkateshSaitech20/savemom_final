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
        const user = await prisma.user.findUnique({ where: { id: token.id, isDeleted: "N" } });
        if (!user) {
            return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
        }
        let roleId = user.roleId;
        let roleCnt = 0; let userCnt = 0; let planCnt = 0; let enqCnt = 0; let subscribeCnt = 0;
        if (roleId === '1') {
            roleCnt = await prisma.role.count({ where: { isDeleted: "N" } });
            userCnt = await prisma.user.count({ where: { isDeleted: "N" } });
            planCnt = await prisma.package_plans.count({ where: { isDeleted: "N" } });
            enqCnt = await prisma.customer_enquiries.count({});
            subscribeCnt = await prisma.subscribers.count({});
        } else if (roleId !== '1' && roleId !== '3') {
            roleCnt = await prisma.role.count({ where: { userId: user.createdBy, isDeleted: "N" } });
            userCnt = await prisma.user.count({ where: { createdBy: user.createdBy, isDeleted: "N" } });
            // planCnt = await prisma.package_plans.count({ where: { createdUser: user.id, isDeleted: "N" } });
            planCnt = null;
        }
        return NextResponse.json({
            result: true,
            message: 'Dashboard Data',
            roleCnt: roleCnt,
            userCnt: userCnt,
            planCnt: planCnt,
            enqCnt: enqCnt,
            subscribeCnt: subscribeCnt,
        });
    } catch (error) {
        return NextResponse.json({ error: error.message });
    }
};
