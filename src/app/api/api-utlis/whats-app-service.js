import twilio from 'twilio';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { responseData } from '@/utils/message';

const prisma = new PrismaClient();

let mobile = '';
let publicKey = '';
let authKey = '';
let whatsAppType = '';
export async function getWhatsAppCredential() {
    try {
        const whats_app_setting = await prisma.whats_app_setting.findFirst();
        if (whats_app_setting) {
            mobile = whats_app_setting.mobile;
            publicKey = whats_app_setting.publicKey;
            authKey = whats_app_setting.authKey;
            whatsAppType = whats_app_setting.whatsAppType;
        } else {
            throw new Error("No sms settings found");
        }
    } catch (error) {
        return NextResponse.json({ result: false, error: error.message });
    }
}

export const getFromMobileNumber = () => {
    return mobile;
};

export const sendWhatsApp = async (to, message) => {
    try {
        await getWhatsAppCredential();
        if (whatsAppType === "twilio") {
            const accountSid = publicKey;
            const authToken = authKey;
            if (accountSid && authToken) {
                const client = twilio(accountSid, authToken);
                await client.messages.create({
                    from: `whatsapp:${mobile}`,
                    to: `whatsapp:${to}`,
                    body: message,
                });
            } else {
                let errorMessage = responseData.inValidTwilioErrMSg;
                throw new Error(errorMessage);
            }
        } else {
            let errorMessage = responseData.inValidSMSType;
            throw new Error(errorMessage);
        }
    } catch (error) {
        if (error.message.includes('Authenticate') || error.message.includes('Authentication Error')) {
            throw new Error(responseData.inValidTwilioErrMSg);
        } else {
            throw error;
        }
    }
}
