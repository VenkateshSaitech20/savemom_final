import { extractTokenData } from '@/utils/helper';
import { NextResponse } from 'next/server';
import { registerData, responseData } from '@/utils/message';
import { PrismaClient } from '@prisma/client';
import { validateFields } from '../../api-utlis/helper';
import { sendPushNotificationService } from '../../api-utlis/push-notification-service';
const prisma = new PrismaClient();

// Get vapid key
export async function GET() {
    try {
        const push_notification_setting = await prisma.push_notification_setting.findFirst({ select: { vapidKey: true } });
        if (!push_notification_setting) {
            return NextResponse.json({ result: false, message: responseData.notFound });
        } else {
            return NextResponse.json({ result: true, message: push_notification_setting });
        }
    } catch (error) {
        return NextResponse.json({ result: false, error: error });
    }
}
// Send push notification
export async function POST(req) {
    const token = extractTokenData(req.headers);
    if (!token.id) {
        return NextResponse.json({ result: false, message: { tokenExpired: responseData.tokenExpired } });
    }
    const user = await prisma.user.findUnique({ where: { id: token.id, isDeleted: "N" } });
    if (!user) {
        return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
    }
    const body = await req.json();
    const { sendPushNotificationTo, to, message, title, templateId, templateCategory } = body;
    let emptyFieldErrors = {};
    if (!title || title.trim() === "") {
        emptyFieldErrors.title = registerData.titleReq;
    }
    if (!message || message.trim() === "") {
        emptyFieldErrors.message = registerData.messageReq;
    }
    const notificationContent = {
        notification: {
            title: title,
            body: message,
        },
        webpush: {
            notification: {
                title: title,
                body: message,
            },
        },
    }
    if (sendPushNotificationTo === "all-users") {
        if (Object.keys(emptyFieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: emptyFieldErrors });
        }
        const allUsersToken = await prisma.user.findMany({
            where: { isDeleted: "N" },
            select: { deviceToken: true, email: true }
        });

        const deviceTokens = allUsersToken
            .map(user => user.deviceToken)
            .filter(token => token);
        if (deviceTokens.length === 0) {
            return NextResponse.json({ result: false, message: { noTokens: "No device tokens found." } });
        }
        const sendMessage = deviceTokens.map(token => ({
            token: token,
            ...notificationContent
        }));

        try {
            const responses = await Promise.all(sendMessage.map(message =>
                sendPushNotificationService(message)
            ));
            // Check for errors in responses
            // const failedResponses = responses.filter(res => !res.result);
            // if (failedResponses.length > 0) {
            //     return NextResponse.json({ result: false, message: failedResponses });
            // }
            const emailList = allUsersToken.map((user) => (user.email));
            await prisma.sent_push_notification.create({
                data: {
                    from: user.email,
                    to: emailList.join(", "),
                    title: title,
                    message: message,
                    sendPushNotificationTo: sendPushNotificationTo,
                    sentBy: user.id,
                    templateId: templateId,
                    templateCategory: templateCategory
                },
            });
            return NextResponse.json({ result: true, message: responseData.pushNotificationSentSuccMsg });
        } catch (error) {
            return NextResponse.json({ result: false, error: error.message });
        }
    } else if (sendPushNotificationTo === "single-user") {
        if (!to || to.trim() === "") {
            emptyFieldErrors.to = registerData.emailReq;
        }
        if (Object.keys(emptyFieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: emptyFieldErrors });
        }
        const validatingFields = {
            to: { type: "email", message: registerData.emailValMsg },
            title: { type: "name", message: registerData.titleFieldVal },
        };
        let fieldErrors = validateFields({ to }, validatingFields);
        if (Object.keys(fieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: fieldErrors });
        }
        const sendUser = await prisma.user.findFirst({
            where: { email: to, isDeleted: "N" },
            select: { deviceToken: true }
        });
        if (!sendUser) {
            return NextResponse.json({ result: false, message: { to: responseData.userNotFound } })
        } else if (sendUser.deviceToken === "") {
            return NextResponse.json({ result: false, message: { to: "FCM Token not found" } })
        }
        else {
            const sendMessage = {
                token: sendUser.deviceToken,
                ...notificationContent
            };
            try {
                await sendPushNotificationService(sendMessage);
                await prisma.sent_push_notification.create({
                    data: {
                        from: user.email,
                        to: to,
                        title: title,
                        message: message,
                        sendPushNotificationTo: sendPushNotificationTo,
                        sentBy: user.id,
                        templateId: templateId,
                        templateCategory: templateCategory
                    },
                });
                return NextResponse.json({ result: true, message: "Send successfully" });
            } catch (error) {
                return NextResponse.json({ result: false, message: error });
            }
        }
    }
}
