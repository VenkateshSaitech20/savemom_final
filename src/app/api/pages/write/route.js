import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
    const userData = await prisma.user.findMany()
    return NextResponse.json(userData);
};

export async function POST(req, res) {
    try {
        const body = await req.json();
        const { name, email } = body;
        const newUser = await prisma.user.create({
            data: { name, email },
        });
        return NextResponse.json(newUser);
    } catch (error) {
        return NextResponse.json({ error: error.message });
    }
};

