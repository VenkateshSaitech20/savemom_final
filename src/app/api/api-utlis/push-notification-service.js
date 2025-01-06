import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { responseData } from '@/utils/message';
import admin from 'firebase-admin';
const prisma = new PrismaClient();

export async function getPushNotificationCredential() {
    try {
        let push_notification_setting = await prisma.push_notification_setting.findFirst();
        let { type, projectId, privateKeyId, privateKey, clientEmail, clientId, authUri, tokenUri, authProviderCertUrl, clientCertUrl, universeDomain, pushNotificationType } = push_notification_setting;
        pushNotificationType = push_notification_setting.pushNotificationType;
        if (push_notification_setting) {
            const adminSDK = {
                type: type,
                project_id: projectId,
                private_key_id: privateKeyId,
                private_key: privateKey.replace(/\\n/g, '\n'),
                client_email: clientEmail,
                client_id: clientId,
                auth_uri: authUri,
                token_uri: tokenUri,
                auth_provider_x509_cert_url: authProviderCertUrl,
                client_x509_cert_url: clientCertUrl,
                universe_domain: universeDomain,
            }
            if (!admin.apps.length) {
                admin.initializeApp({
                    credential: admin.credential.cert(adminSDK),
                });
            };
            return pushNotificationType;
        } else {
            throw new Error("No sms settings found");
        }
    } catch (error) {
        return NextResponse.json({ result: false, error: error.message });
    }
};

export const sendPushNotificationService = async (message) => {
    try {
        const pushNotificationType = await getPushNotificationCredential();
        if (pushNotificationType === "firebase") {
            await admin.messaging().send(message);
            if (admin) {
                await admin.messaging().send(message);
            } else {
                let errorMessage = responseData.inValidFirebaseErrMSg;
                throw new Error(errorMessage);
            }
        } else {
            let errorMessage = responseData.inValidPushNotificationType;
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
