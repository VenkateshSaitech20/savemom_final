import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { deleteFields } from '@/app/api/api-utlis/helper';
const prisma = new PrismaClient();
export async function POST(req) {
    try {
        const body = await req.json();
        const { stateId } = body;
        const cityDetails = await prisma.city.findMany({ where: { stateId, isDeleted: "N" } });
        if (cityDetails) {
            deleteFields(cityDetails, ['createdAt', 'updatedAt', 'updatedUser', "isDeleted"]);
            return NextResponse.json({ result: true, message: cityDetails });
        }
        return NextResponse.json({ result: true, message: {} });
    } catch (error) {
        return NextResponse.json({ result: false, error: error });
    }
};
