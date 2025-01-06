import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { sendMail } from '../api-utlis/mailService';
import { responseData } from '@/utils/message';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json();
    const { email } = body;
    const user = await prisma.user.findFirst({ where: { email, isDeleted: "N" } });
    if (!user) {
      return NextResponse.json({ result: false, message: 'User not found' });
    }
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/en/pages/auth/reset-password-v1?token=${token}`;
    const getForgotMailTemplate = await prisma.mail_templates.findFirst({ where: { templateType: 'forgot-password-mail' } });
    if (getForgotMailTemplate) {
      const subject = getForgotMailTemplate.subject;
      const message = `${getForgotMailTemplate.message} <a href="${resetLink}">Reset your password</a>`;
      await sendMail(email, subject, message);
      return NextResponse.json({ result: true, message: 'Password Reset link sent to your email', resetLink });
    } else {
      return NextResponse.json({ result: false, message: responseData.somethingWentWrongErrMsg });
    }
  } catch (error) {
    // return NextResponse.json({ result: false, message: error });
    return NextResponse.json({ result: false, message: responseData.somethingWentWrongErrMsg });
  }
}
