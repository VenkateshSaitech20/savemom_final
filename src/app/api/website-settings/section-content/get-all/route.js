
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { deleteFields } from '@/app/api/api-utlis/helper';
const prisma = new PrismaClient();

export async function GET() {
    try {
        const sectionContent = await prisma.section_content.findMany({});
        deleteFields(sectionContent, ['updatedAt', 'createdAt', 'createdUser', 'updatedUser']);
        return NextResponse.json({ result: true, message: sectionContent });
    } catch (error) {
        return NextResponse.json({ result: false, error: error });
    }
};
