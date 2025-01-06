import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req) {
    try {
        const url = new URL(req.url);
        const id = url.searchParams.get('id');

        if (id) {
            const role = await prisma.role.findUnique({
                where: { id }
            });

            if (role) {
                return NextResponse.json({ result: true, message: role });
            } else {
                return NextResponse.json({ result: false, message: 'Role not found' });
            }
        } else {
            return NextResponse.json({ result: false, message: 'ID not provided' });
        }
    } catch (error) {
        return NextResponse.json({ result: false, message: { roleError: error.message } });
    }
};

