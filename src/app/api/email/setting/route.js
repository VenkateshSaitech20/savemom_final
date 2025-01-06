import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { registerData, responseData } from '@/utils/message';
import { extractTokenData } from '@/utils/helper';
import { validateFields, deleteFields } from '../../api-utlis/helper';

const prisma = new PrismaClient();

export async function GET(req) {
    try {
        const token = extractTokenData(req.headers);
        if (!token.id) {
            return NextResponse.json({ result: false, message: { tokenExpired: responseData.tokenExpired } });
        }
        const user = await prisma.user.findUnique({ where: { id: token.id, isDeleted: "N" } });
        if (!user) {
            return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
        }
        const email_setting = await prisma.email_setting.findFirst();
        if (email_setting) {
            deleteFields(email_setting, ['createdAt', 'updatedAt', 'createdUser', 'updatedUser']);
        }
        return NextResponse.json({ result: true, message: email_setting });
    } catch (error) {
        return NextResponse.json({ result: false, error: error.message });
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
        let userId = user.id;
        const body = await req.json();
        let { email, password, id, emailType, emailCompany, apiKey, templateId } = body;
        const emptyFieldErrors = {};
        if (email.trim() === "") {
            emptyFieldErrors.email = registerData.emailReq;
        }
        if (emailType.trim() === "") {
            emptyFieldErrors.emailType = registerData.emailTypeReq;
        }
        if (Object.keys(emptyFieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: emptyFieldErrors });
        };
        const fields = { email, password, emailType, apiKey, emailCompany, templateId };
        const validatingFields = {
            email: { type: "email", message: registerData.emailValMsg },
        };
        let fieldErrors = validateFields(fields, validatingFields);
        if (Object.keys(fieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: fieldErrors });
        };
        if (id) {
            fields.updatedUserId = userId;
            await prisma.email_setting.update({ where: { id }, data: fields })
            return NextResponse.json({ result: true, message: responseData.dataUpdated });
        } else {
            fields.createdUserId = userId;
            await prisma.email_setting.create({ data: fields });
            return NextResponse.json({ result: true, message: responseData.dataCreateded });
        }
    } catch (error) {
        return NextResponse.json({ result: false, message: error });
    }
};
