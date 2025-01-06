import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
const prisma = new PrismaClient();

let email = '';
let pass = '';
let emailType = '';

export async function nodemailerCredential() {
    try {
        const email_setting = await prisma.email_setting.findFirst();
        if (email_setting) {
            email = email_setting.email;
            pass = email_setting.password;
            emailType = email_setting.emailType;
            return email;
        } else {
            throw new Error("No email settings found");
        }
    } catch (error) {
        return NextResponse.json({ result: false, error: error.message });
    }
}

export async function createTransporter() {
    await nodemailerCredential();
    const transporter = nodemailer.createTransport({
        // service: 'gmail',
        service: emailType,
        auth: {
            user: email,
            pass: pass
        }
    });
    return transporter;
}

export const mailOptions = (to, subject, message) => ({
    from: email,
    to,
    subject,
    html: message,
});
