import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { sendMail, getFromEmail } from '../api-utlis/mailService';
import { extractTokenData } from '@/utils/helper';
import { registerData, responseData } from '@/utils/message';
import { validateFields } from '../api-utlis/helper';

const prisma = new PrismaClient();

export async function POST(req) {
    const token = extractTokenData(req.headers);
    if (!token.id) {
        return NextResponse.json({ result: false, message: { tokenExpired: responseData.tokenExpired } });
    }
    const user = await prisma.user.findUnique({ where: { id: token.id, isDeleted: 'N' } });
    if (!user) {
        return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
    }
    const body = await req.json();
    const { to, subject, message, sendMailTo, templateId, templateCategory } = body;
    const emptyFieldErrors = {};
    // Handle "all-users" email sending
    if (sendMailTo === 'all-users') {
        try {
            const users = await prisma.user.findMany({ where: { isDeleted: 'N' }, select: { email: true } });
            const emailList = users.map(user => user.email).join(', ');
            const sendMailPromises = users.map(user =>
                sendMail(user.email, subject, message)
            );
            const email = getFromEmail();
            await Promise.all(sendMailPromises);
            await prisma.sent_emails.create({
                data: {
                    from: email,
                    to: emailList,
                    subject,
                    message,
                    sendMailTo,
                    sentBy: token.id,
                    templateId,
                    templateCategory,
                },
            });
            return NextResponse.json({ result: true, message: responseData.emailSentSuccMsg });
        } catch (error) {
            return NextResponse.json({ result: false, error: error.message });
        }
    } else {
        // Handle single email sending
        if (!to || to.trim() === '') {
            emptyFieldErrors.to = registerData.emailReq;
        }
        if (Object.keys(emptyFieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: emptyFieldErrors });
        }
        const validatingFields = {
            to: { type: 'email', message: registerData.emailValMsg },
        };
        const fieldErrors = validateFields({ to }, validatingFields);
        if (Object.keys(fieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: fieldErrors });
        }
        try {
            await sendMail(to, subject, message);
            const email = getFromEmail();
            await prisma.sent_emails.create({
                data: {
                    from: email,
                    to,
                    subject,
                    message,
                    sendMailTo,
                    sentBy: token.id,
                    templateId,
                    templateCategory,
                },
            });
            return NextResponse.json({ result: true, message: responseData.emailSentSuccMsg });
        } catch (error) {
            return NextResponse.json({ result: false, error: error.message });
        }
    }
}
