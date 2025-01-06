import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { deleteFields } from '@/app/api/api-utlis/helper';
const prisma = new PrismaClient();

export async function POST(req) {
    try {
        const body = await req.json();
        const { id } = body;
        const teamDetails = await prisma.our_team.findUnique({ where: { id, isDeleted: "N" } });
        if (teamDetails) {
            deleteFields(teamDetails, ['createdAt', 'updatedAt', 'updatedUser', "isDeleted"]);
            return NextResponse.json({ result: true, message: teamDetails });
        }
        return NextResponse.json({ result: true, message: {} });
    } catch (error) {
        return NextResponse.json({ result: false, error: error });
    }
};
