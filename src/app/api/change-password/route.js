import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { registerData, responseData } from '@/utils/message';
import { extractTokenData } from '@/utils/helper';

const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

export async function POST(req) {
    try {
        const token = extractTokenData(req.headers);
        if (!token.id) {
            return NextResponse.json({ result: false, message: { invalidToken: responseData.invalidToken } });
        };
        let userId = token.id;
        const getUser = await prisma.user.findUnique({ where: { id: userId, isDeleted: "N" } });
        if (!getUser) {
            return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
        }
        const body = await req.json();
        const { currentPassword, newPassword, confirmPassword } = body;
        const emptyFieldErrors = {};
        if (currentPassword.trim() === "") {
            emptyFieldErrors.currentPassword = registerData.currentPasswordReq;
        }
        if (newPassword.trim() === "") {
            emptyFieldErrors.newPassword = registerData.newPasswordReq;
        }
        if (confirmPassword.trim() === "") {
            emptyFieldErrors.confirmPassword = registerData.confirmPasswordReq;
        }
        if (Object.keys(emptyFieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: emptyFieldErrors });
        };
        if (newPassword !== confirmPassword) {
            return NextResponse.json({ result: false, message: { PasswordMisMatch: responseData.passwordMismatch } });
        } else {
            const isCurrentPasswordvalid = await bcrypt.compare(currentPassword, getUser.password);
            if (!isCurrentPasswordvalid) {
                return NextResponse.json({ result: false, message: { passwordNotValid: responseData.passwordNotValid } });
            } else {
                const hashedPassword = await bcrypt.hash(newPassword, 10);
                await prisma.user.update({
                    where: { id: userId },
                    data: { password: hashedPassword },
                });
                return NextResponse.json({ result: true, message: responseData.passwordChanged });
            }
        };
    } catch (error) {
        return NextResponse.json({ result: false, message: error });
    }
}
