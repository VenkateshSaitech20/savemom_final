import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { deleteFields } from '@/app/api/api-utlis/helper';
const prisma = new PrismaClient();

export async function POST(req) {
    try {
        const body = await req.json();
        const { slug } = body;
        const contentDetails = await prisma.contents.findFirst({ where: { slug: slug, isDeleted: "N" } });
        if (contentDetails) {
            deleteFields(contentDetails, ['createdBy', "isDeleted"]);
            return NextResponse.json({ result: true, message: contentDetails });
        }
        return NextResponse.json({ result: true, message: {} });
    } catch (error) {
        return NextResponse.json({ result: false, error: error });
    }
};
