
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { responseData } from '@/utils/message';
import { extractTokenData } from '@/utils/helper';
import { deleteFields } from '../../api-utlis/helper';

const prisma = new PrismaClient();

// Get Seconnd Section
export async function GET() {
    try {
        const ourTeam = await prisma.contact_us.findFirst({});
        deleteFields(ourTeam, ['createdAt', 'updatedAt', 'updatedUser']);
        return NextResponse.json({ result: true, message: ourTeam });
    } catch (error) {
        return NextResponse.json({ result: false, error: error.message });
    }
};

// Insert / Update second section
export async function POST(req) {
    try {
        let userId;
        const token = extractTokenData(req.headers);
        if (!token) {
            return NextResponse.json({ result: false, message: { tokenExpired: responseData.tokenExpired } });
        }
        const user = await prisma.user.findUnique({ where: { id: token.id, isDeleted: "N" } });
        if (!user) {
            return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
        }
        if (user?.id) { userId = user.id }
        const data = await req.json();
        if (data.id) {
            data.updatedUser = userId;
            const existingRec = await prisma.contact_us.findUnique({ where: { id: data.id } });
            if (!existingRec) {
                return NextResponse.json({ result: false, message: { notFound: responseData.noData } })
            }
            await prisma.contact_us.update({ where: { id: existingRec.id }, data });
        } else {
            data.createdUser = userId;
            await prisma.contact_us.create({ data });
        }
        return NextResponse.json({ result: true, message: responseData.dataUpdated });
    } catch (error) {
        return NextResponse.json({ result: false, message: error });
    }
};
