import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { deleteFields, deleteArrayFields } from '@/app/api/api-utlis/helper';
import { responseData } from '@/utils/message';
import { extractTokenData } from '@/utils/helper';
const prisma = new PrismaClient();

export async function GET(req) {
    const token = extractTokenData(req.headers);
    if (!token) {
        return NextResponse.json({ result: false, message: { tokenExpired: responseData.tokenExpired } });
    }
    const user = await prisma.user.findUnique({ where: { id: token.id, isDeleted: "N" } });
    if (!user) {
        return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
    }
    if (user.roleId === '1') {
        const mainRoles = await prisma.role.findMany({
            where: {
                userId: user.id,
                isDeleted: "N"
            },
            select: {
                id: true,
                userId: true,
                roleName: true,
                isAssigned: true,
            }
        });
        if (mainRoles) {
            return NextResponse.json({ result: true, message: mainRoles });
        } else {
            return NextResponse.json({ result: false, message: responseData.notFound });
        }
    }
    return NextResponse.json({ result: false, message: error });
}
export async function POST(req) {
    try {
        const body = await req.json();
        const { id } = body;
        const planDetails = await prisma.package_plans.findUnique({ where: { id, isDeleted: "N" } });
        if (planDetails) {
            deleteFields(planDetails, ['createdAt', 'updatedAt', 'updatedUser', "isDeleted"]);
            return NextResponse.json({ result: true, message: planDetails });
        }
        return NextResponse.json({ result: true, message: {} });
    } catch (error) {
        return NextResponse.json({ result: false, error: error });
    }
};
