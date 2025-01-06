import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { registerData, responseData } from '@/utils/message';
import { extractTokenData } from '@/utils/helper';
import { deleteFields, validateFields } from '../../api-utlis/helper';
const prisma = new PrismaClient();

export async function GET() {
    try {
        const testimonailDetails = await prisma.testimonial.findFirst({});
        if (testimonailDetails) {
            deleteFields(testimonailDetails, ['createdAt', 'updatedAt', 'updatedUser']);
            return NextResponse.json({ result: true, message: testimonailDetails });
        }
        return NextResponse.json({ result: true, message: {} });
    } catch (error) {
        return NextResponse.json({ result: false, error: error });
    }
};

export async function POST(req) {
    try {
        const token = extractTokenData(req.headers);
        if (!token.id) {
            return NextResponse.json({ result: false, message: { tokenExpired: responseData.tokenExpired } });
        }
        const user = await prisma.user.findUnique({ where: { id: token.id, isDeleted: "N" } });
        if (!user) {
            return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
        }
        const body = await req.json();
        let { badgeTitle, title, description, id } = body;
        const emptyFieldErrors = {};
        if (badgeTitle.trim() === "") {
            emptyFieldErrors.badgeTitle = registerData.badgeTitleReq;
        }
        if (title.trim() === "") {
            emptyFieldErrors.title = registerData.titleReq;
        }
        if (description.trim() === "") {
            emptyFieldErrors.description = registerData.descriptionReq;
        }
        if (Object.keys(emptyFieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: emptyFieldErrors });
        };
        const fields = { badgeTitle, title, description };
        const validatingFields = {
            badgeTitle: { type: "name", message: registerData.badgeFieldVal },
            title: { type: "name", message: registerData.titleFieldVal },
            description: { type: "nameWithDot", message: registerData.descriptionFieldVal },
        };
        let fieldErrors = validateFields(fields, validatingFields);
        if (Object.keys(fieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: fieldErrors });
        };
        const data = { badgeTitle, title, description };
        if (id) {
            await prisma.testimonial.update({ where: { id }, data })
            return NextResponse.json({ result: true, message: responseData.dataUpdated });
        }
        await prisma.testimonial.create({ data });
        return NextResponse.json({ result: true, message: responseData.dataCreateded });
    } catch (error) {
        return NextResponse.json({ result: false, message: error });
    }
}
