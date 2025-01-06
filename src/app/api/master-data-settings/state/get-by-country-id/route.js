import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { deleteFields } from '@/app/api/api-utlis/helper';
const prisma = new PrismaClient();
export async function POST(req) {
    try {
        const body = await req.json();
        const { countryId } = body;
        const stateDetails = await prisma.state.findMany({ where: { countryId, isDeleted: "N" } });
        if (stateDetails) {
            deleteFields(stateDetails, ['createdAt', 'updatedAt', 'updatedUser', "isDeleted"]);
            return NextResponse.json({ result: true, message: stateDetails });
        }
        return NextResponse.json({ result: true, message: {} });
    } catch (error) {
        return NextResponse.json({ result: false, error: error });
    }
};
