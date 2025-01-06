import { extractTokenData } from '@/utils/helper';
import { NextResponse } from 'next/server';
import { registerData, responseData } from '@/utils/message';
import { PrismaClient } from '@prisma/client';
import { removeHtmlTagsExceptBr, validateFields } from '../api-utlis/helper';
import { createCall, getFromMobileNumber } from '../api-utlis/voiceCallService';

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
    const { to, message, sendVoiceCallTo, templateId, templateCategory } = body;
    const emptyFieldErrors = {};
    let fromMobileNumber;
    const formattedMessage = removeHtmlTagsExceptBr(message);
    // For all-users
    if (sendVoiceCallTo === "all-users") {
        const userContactNos = await prisma.user.findMany({
            where: {
                isDeleted: "N",
                AND: [
                    { contactNo: { not: null } },
                    { phoneCode: { not: null } },
                    { contactNo: { not: '' } },
                    { phoneCode: { not: '' } }
                ]
            },
            select: {
                contactNo: true,
                phoneCode: true
            }
        });
        // const contactNoList = userContactNos.map(userContactNo => userContactNo.contactNo);
        const sendVoiceCallPromises = userContactNos.map(async ({ contactNo, phoneCode }) => {
            try {
                let callTo = '+' + phoneCode + contactNo;
                await createCall(callTo, formattedMessage);
                fromMobileNumber = getFromMobileNumber();
            } catch (error) {
                return `Failed to call ${contactNo}: ${error.message}`;
            }
        });
        const results = await Promise.all(sendVoiceCallPromises);
        const errors = results.filter(result => result !== undefined);
        if (errors.length > 0) {
            let err = errors[0];
            return NextResponse.json({ result: false, message: { error: err } });
        }
        const contactNoList = userContactNos.map(({ contactNo, phoneCode }) => `${phoneCode}${contactNo}`);
        await prisma.sent_voice_call.create({
            data: {
                from: fromMobileNumber,
                to: contactNoList.join(", "),
                message: message,
                sendVoiceCallTo: sendVoiceCallTo,
                sentBy: userId,
                templateId: templateId,
                templateCategory: templateCategory
            },
        });
        return NextResponse.json({ result: true, message: responseData.voiceCallSentSuccMsg });
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
            await createCall(to, formattedMessage);
            fromMobileNumber = getFromMobileNumber();
            await prisma.sent_voice_call.create({
                data: {
                    from: fromMobileNumber,
                    to: to,
                    message: message,
                    sendVoiceCallTo: sendVoiceCallTo,
                    sentBy: userId,
                    templateId: templateId,
                    templateCategory: templateCategory
                },
            });
            return NextResponse.json({ result: true, message: responseData.voiceCallSentSuccMsg });
        } catch (error) {
            return NextResponse.json({ result: false, error: error.message });
        }
    }
}
