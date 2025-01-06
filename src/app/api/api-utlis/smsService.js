
import twilio from 'twilio';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { responseData } from '@/utils/message';
import axios from 'axios';

const prisma = new PrismaClient();
const errorPhrases = [
    'Authentication',
    'failure',
    'Some Parameter are missing',
    "few parameter's value are empty : message"
];
const errorWords = errorPhrases.flatMap(phrase => phrase.toLowerCase().split(/\s+/));

let mobile = '';
let publicKey = '';
let authKey = '';
let smsType = '';

export async function getSMSCredential() {
    try {
        const sms_setting = await prisma.sms_setting.findFirst();
        if (sms_setting) {
            mobile = sms_setting.mobile;
            publicKey = sms_setting.publicKey;
            authKey = sms_setting.authKey;
            smsType = sms_setting.smsType;
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

export const sendSms = async (to, message, phoneCode) => {
    try {
        await getSMSCredential();
        if (smsType === "twilio") {
            const accountSid = publicKey;
            const authToken = authKey;
            if (accountSid && authToken) {
                const client = twilio(accountSid, authToken);
                await client.messages.create({
                    from: mobile,
                    to: to,
                    body: message,
                });
            } else {
                let errorMessage = responseData.inValidTwilioErrMSg;
                throw new Error(errorMessage);
            }
        } else if (smsType === "msg91") {
            const accountSid = publicKey;
            const authToken = authKey;
            if (accountSid && authToken) {
                const url = 'https://api.msg91.com/api/sendhttp.php';
                const requestData = {
                    authkey: accountSid,
                    mobiles: to.replace('+', ''),
                    message: message,
                    sender: authToken,
                    route: '4',
                    country: phoneCode
                };
                const response = await axios.get(url, { params: requestData });
                console.log('response', response.data)
                const responseWords = response.data.toLowerCase().split(/\s+/);
                if (errorWords.some(keyword => responseWords.includes(keyword))) {
                    throw new Error(response.data);
                }
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
};

