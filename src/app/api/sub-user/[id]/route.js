import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req) {
    try {
        const url = new URL(req.url);
        const subUserId = url.searchParams.get('id');
        if (subUserId) {
            const role = await prisma.profile.findUnique({
                where: { userId: createdBy }
            });

            if (role) {
                return NextResponse.json({ result: true, message: role });
            } else {
                return NextResponse.json({ result: false, message: 'Roles not found' });
            }
        } else {
            return NextResponse.json({ result: false, message: 'ID not provided' });
        }
    } catch (error) {
        return NextResponse.json({ result: false, message: { roleError: error } });
    }
};

