import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
    const { id } = params;
    try {
        // Parse the JSON body from the request
        const body = await request.json();
        const { name, email } = body;

        // Ensure that 'id' is provided and valid
        if (!id) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Update the user in the database
        const updatedUser = await prisma.user.update({
            where: { id: id }, // Ensure 'id' is an integer
            data: { name, email },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const { id } = params;

    try {
        if (!id) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Delete the user in the database
        const deletedUser = await prisma.user.delete({
            where: { id: id },
        });

        return NextResponse.json(deletedUser);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
