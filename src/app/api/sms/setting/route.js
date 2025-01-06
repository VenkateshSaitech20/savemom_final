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
        const sms_setting = await prisma.sms_setting.findFirst();
        if (sms_setting) {
            deleteFields(sms_setting, ['createdAt', 'updatedAt', 'createdUser', 'updatedUser']);
        }
        return NextResponse.json({ result: true, message: sms_setting });
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
        let { id, mobile, smsType, publicKey, authKey } = body;
        const emptyFieldErrors = {};
        if (mobile.trim() === "") {
            emptyFieldErrors.mobile = registerData.mobReq;
        }
        if (smsType.trim() === "") {
            emptyFieldErrors.smsType = registerData.smsTypeReq;
        }
        // if (authKey.trim() === "") {
        //     emptyFieldErrors.authKey = registerData.passwordReq;
        // }
        if (Object.keys(emptyFieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: emptyFieldErrors });
        };
        const fields = { mobile, smsType, publicKey, authKey };
        const validatingFields = {
            mobile: { type: "customMobileNumber", message: registerData.phoneValMsg },
        };
        let fieldErrors = validateFields(fields, validatingFields);
        if (Object.keys(fieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: fieldErrors });
        };
        if (id) {
            fields.updatedBy = userId;
            await prisma.sms_setting.update({ where: { id }, data: fields })
            return NextResponse.json({ result: true, message: responseData.dataUpdated });
        } else {
            fields.createdBy = userId;
            await prisma.sms_setting.create({ data: fields });
            return NextResponse.json({ result: true, message: responseData.dataCreateded });
        }
    } catch (error) {
        return NextResponse.json({ result: false, message: error });
    }
};
