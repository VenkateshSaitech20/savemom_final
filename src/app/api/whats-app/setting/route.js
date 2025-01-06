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
        const whats_app_setting = await prisma.whats_app_setting.findFirst();
        if (whats_app_setting) {
            deleteFields(whats_app_setting, ['createdAt', 'updatedAt', 'createdBy', 'updatedBy']);
        }
        return NextResponse.json({ result: true, message: whats_app_setting });
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
        let { id, mobile, whatsAppType, publicKey, authKey } = body;
        const emptyFieldErrors = {};
        if (mobile.trim() === "") {
            emptyFieldErrors.mobile = registerData.mobReq;
        }
        if (whatsAppType.trim() === "") {
            emptyFieldErrors.whatsAppType = registerData.smsTypeReq;
        }
        // if (authKey.trim() === "") {
        //     emptyFieldErrors.authKey = registerData.passwordReq;
        // }
        if (Object.keys(emptyFieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: emptyFieldErrors });
        };
        const fields = { mobile, whatsAppType, publicKey, authKey };
        // const validatingFields = {
        //     mobile: { type: "customMobileNumber", message: registerData.phoneValMsg },
        // };
        // let fieldErrors = validateFields(fields, validatingFields);
        // if (Object.keys(fieldErrors).length > 0) {
        //     return NextResponse.json({ result: false, message: fieldErrors });
        // };
        if (id) {
            fields.updatedBy = userId;
            await prisma.whats_app_setting.update({ where: { id }, data: fields })
            return NextResponse.json({ result: true, message: responseData.dataUpdated });
        } else {
            fields.createdBy = userId;
            await prisma.whats_app_setting.create({ data: fields });
            return NextResponse.json({ result: true, message: responseData.dataCreateded });
        }
    } catch (error) {
        return NextResponse.json({ result: false, message: error });
    }
};
