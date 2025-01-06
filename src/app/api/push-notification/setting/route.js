import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { registerData, responseData } from '@/utils/message';
import { extractTokenData } from '@/utils/helper';
import { deleteFields } from '../../api-utlis/helper';

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
        const push_notification_setting = await prisma.push_notification_setting.findFirst();
        if (push_notification_setting) {
            deleteFields(push_notification_setting, ['createdAt', 'updatedAt', 'createdBy', 'updatedBy']);
        }
        return NextResponse.json({ result: true, message: push_notification_setting });
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
        let userId = user.id;
        const body = await req.json();
        let { id, pushNotificationType, type, projectId, privateKeyId, privateKey, clientEmail, clientId, authUri, tokenUri, authProviderCertUrl, clientCertUrl, universeDomain, vapidKey } = body;
        const emptyFieldErrors = {};
        if (pushNotificationType.trim() === "") {
            emptyFieldErrors.pushNotificationType = registerData.pushNotificationTypeReq;
        }
        if (Object.keys(emptyFieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: emptyFieldErrors });
        };
        const fields = { pushNotificationType, type, projectId, privateKeyId, privateKey, clientEmail, clientId, authUri, tokenUri, authProviderCertUrl, clientCertUrl, universeDomain, vapidKey };
        if (id) {
            fields.updatedBy = userId;
            await prisma.push_notification_setting.update({ where: { id }, data: fields })
            return NextResponse.json({ result: true, message: responseData.dataUpdated });
        } else {
            fields.createdBy = userId;
            await prisma.push_notification_setting.create({ data: fields });
            return NextResponse.json({ result: true, message: responseData.dataCreateded });
        }
    } catch (error) {
        return NextResponse.json({ result: false, message: error });
    }
};
