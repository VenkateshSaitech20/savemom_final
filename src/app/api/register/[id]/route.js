import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
  const { id } = params;
  try {
    const body = await request.json();
    const { name, email } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: { name, email },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Delete user
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
