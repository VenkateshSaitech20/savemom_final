import { extractTokenData } from '@/utils/helper';
import { NextResponse } from 'next/server';
import { registerData, responseData } from '@/utils/message';
import { PrismaClient } from '@prisma/client';
import { removeHtmlTagsExceptBr, validateFields } from '../api-utlis/helper';
import { sendWhatsApp, getFromMobileNumber } from '../api-utlis/whats-app-service';

const prisma = new PrismaClient();

// Send sms
export async function POST(req) {
    const token = extractTokenData(req.headers);
    if (!token.id) {
        return NextResponse.json({ result: false, message: { tokenExpired: responseData.tokenExpired } });
    }
    const user = await prisma.user.findUnique({ where: { id: token.id, isDeleted: "N" } });
    if (!user) {
        return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
    }
    let userId = token.id;
    const body = await req.json();
    const { to, message, sendWhatsAppTo, templateId, templateCategory } = body;
    const emptyFieldErrors = {};
    const formattedMessage = removeHtmlTagsExceptBr(message);
    let fromMobileNumber;
    // For all-users
    if (sendWhatsAppTo === "all-users") {
        const userContactNos = await prisma.user.findMany({
            where: {
                isDeleted: "N",
                AND: [
                    { contactNo: { not: null } },
                    { phoneCode: { not: null } },
                    { contactNo: { not: '' } },
                    { phoneCode: { not: '' } },
                    { roleId: { not: '1' } }
                ]
            },
            select: {
                contactNo: true,
                phoneCode: true
            }
        });
        // const contactNoList = userContactNos.map(userContactNo => userContactNo.contactNo);
        const sendWhatsAppPromises = userContactNos.map(async ({ contactNo, phoneCode }) => {
            try {
                let whatsAppTo = phoneCode + contactNo;
                await sendWhatsApp(whatsAppTo, formattedMessage);
                fromMobileNumber = getFromMobileNumber();
            } catch (error) {
                return `Failed to send SMS to ${contactNo}: ${error.message}`;
            }
        });
        const results = await Promise.all(sendWhatsAppPromises);
        const errors = results.filter(result => result !== undefined);
        if (errors.length > 0) {
            let err = errors[0];
            // return NextResponse.json({ result: false, message: { errors } });
            return NextResponse.json({ result: false, message: { error: err } });
        }
        const contactNoList = userContactNos.map(({ contactNo, phoneCode }) => `${phoneCode}${contactNo}`);
        await prisma.sent_whats_app.create({
            data: {
                from: fromMobileNumber,
                to: contactNoList.join(", "),
                message: message,
                sendWhatsAppTo: sendWhatsAppTo,
                sentBy: userId,
                templateId: templateId,
                templateCategory: templateCategory
            },
        });
        return NextResponse.json({ result: true, message: responseData.whatsAppSentSuccMsg });
    } else {
        // For single user
        if (!to || to.trim() === "") {
            emptyFieldErrors.to = registerData.mobReq;
        }
        if (!message || message.trim() === "") {
            emptyFieldErrors.message = registerData.messageReq;
        }
        if (Object.keys(emptyFieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: emptyFieldErrors });
        }
        const validatingFields = {
            to: { type: "customMobileNumber", message: registerData.phoneValMsg },
        };
        let fieldErrors = validateFields({ to }, validatingFields);
        if (Object.keys(fieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: fieldErrors });
        }
        try {
            await sendWhatsApp(to, formattedMessage);
            fromMobileNumber = getFromMobileNumber();
            await prisma.sent_whats_app.create({
                data: {
                    from: fromMobileNumber,
                    to: to,
                    message: message,
                    sendWhatsAppTo: sendWhatsAppTo,
                    sentBy: userId,
                    templateId: templateId,
                    templateCategory: templateCategory
                },
            });
            return NextResponse.json({ result: true, message: responseData.whatsAppSentSuccMsg });
        } catch (error) {
            return NextResponse.json({ result: false, error: error.message });
        }
    }
}
