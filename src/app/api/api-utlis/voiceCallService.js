import twilio from 'twilio';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { responseData } from '@/utils/message';

const prisma = new PrismaClient();

let mobile = '';
let publicKey = '';
let authKey = '';
let voiceCallType = '';

export async function getVoiceCallCredential() {
    try {
        const voice_call_setting = await prisma.voice_call_setting.findFirst();
        if (voice_call_setting) {
            mobile = voice_call_setting.mobile;
            publicKey = voice_call_setting.publicKey;
            authKey = voice_call_setting.authKey;
            voiceCallType = voice_call_setting.voiceCallType;
        } else {
            throw new Error("No voice call settings found");
        }
    } catch (error) {
        return NextResponse.json({ result: false, error: error.message });
    }
}

export const getFromMobileNumber = () => {
    return mobile;
};

export const createCall = async (to, message) => {
    try {
        await getVoiceCallCredential();
        if (voiceCallType === "twilio") {
            const accountSid = publicKey;
            const authToken = authKey;
            if (accountSid && authToken) {
                const client = twilio(accountSid, authToken);
                await client.calls.create({
                    from: mobile,
                    to: to,
                    record: true,
                    // url: "http://demo.twilio.com/docs/voice.xml",
                    // twiml: "<Response><Say voice="woman">Ahoy, World! Hi how are you....</Say></Response>",
                    twiml: `<Response><Say voice="man">${message}</Say></Response>`,
                });
            } else {
                let errorMessage = responseData.inValidTwilioVoiceCallErrMSg;
                throw new Error(errorMessage);
            }
        } else {
            let errorMessage = responseData.inValidVoiceCallType;
            throw new Error(errorMessage);
        }
    } catch (error) {
        if (error.message.includes('Authenticate') || error.message.includes('Authentication Error')) {
            throw new Error(responseData.inValidTwilioVoiceCallErrMSg);
        } else {
            throw error;
        }
    }
};

