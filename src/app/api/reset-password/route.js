import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const bcrypt = require('bcrypt');
import jwt from 'jsonwebtoken';
import { registerData } from '@/utils/message';
const prisma = new PrismaClient();

// Reset password
export async function POST(req) {
    try {
        const body = await req.json();
        const { token, newPassword, newConfirmPassword } = body;
        const emptyFieldErrors = {};
        if (token.trim() === "") {
            emptyFieldErrors.token = registerData.tokenReq;
        }
        if (newPassword.trim() === "") {
            emptyFieldErrors.newPassword = registerData.passwordReq;
        }
        if (newConfirmPassword.trim() === "") {
            emptyFieldErrors.newConfirmPassword = registerData.confirmPasswordReq;
        }
        if (Object.keys(emptyFieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: emptyFieldErrors });
        };
        if (newPassword != newConfirmPassword) {
            return NextResponse.json({ result: false, message: { newConfirmPassword: registerData.confirmPasswordValMsg } });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;
        const user = await prisma.user.findFirst({ where: { email } });
        if (!user.email) {
            return NextResponse.json({ result: false, message: 'User not found' });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });
        return NextResponse.json({ result: true, message: 'Password has been reset successfully' });
    } catch (error) {
        return NextResponse.json({ result: false, message: error });
    }
}
