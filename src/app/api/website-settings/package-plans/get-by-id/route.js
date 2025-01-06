import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { deleteFields } from '@/app/api/api-utlis/helper';
const prisma = new PrismaClient();

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
