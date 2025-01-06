import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { capitalizeFirstLetter } from '@/utils/helper';
import * as xlsx from 'xlsx';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();
export const config = {
    api: {
        bodyParser: false,
    },
};
export async function POST(req) {
    try {
        const saltRounds = 10;
        const hashPassword = async (password) => {
            return bcrypt.hash(password, saltRounds);
        };
        const formData = await req.formData();
        const file = formData.get('file');
        if (!file) {
            return NextResponse.json({ result: false, message: 'No file uploaded' });
        }
        const buffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(buffer);
        const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const users = xlsx.utils.sheet_to_json(sheet);
        const createUsers = users.map(async (user) => {
            const hashedPassword = await hashPassword(user.password);
            if (!user.email) {
                return { result: false, message: 'Email field is required' };
            } else {
                const existingUser = await prisma.user.findFirst({
                    where: { email: user.email }
                });
                if (existingUser) {
                    const userId = existingUser.id;
                    await prisma.user.update({
                        where: { id: userId },
                        data: {
                            name: capitalizeFirstLetter(user.name),
                            password: hashedPassword,
                            contactNo: String(user.contactNo),
                            country: capitalizeFirstLetter(user.country),
                            companyName: capitalizeFirstLetter(user.companyName)
                        },
                    });
                } else {
                    await prisma.user.create({
                        data: {
                            name: capitalizeFirstLetter(user.name),
                            email: user.email,
                            password: hashedPassword,
                            contactNo: String(user.contactNo),
                            country: capitalizeFirstLetter(user.country),
                            companyName: capitalizeFirstLetter(user.companyName),
                            roleId: user.roleId,
                            roleName: capitalizeFirstLetter(user.roleName),
                            profileStatus: 'Pending'
                        },
                    });
                }
                return { result: true, message: 'Users uploaded successfully' };
            }
        });
        const results = await Promise.all(createUsers);
        const failedResult = results.find(result => result.result === false);
        if (failedResult) {
            return NextResponse.json(failedResult);
        }
        return NextResponse.json({ result: true, message: 'Users uploaded successfully' });
    } catch (error) {
        console.error('Error in POST:', error.message);
        return NextResponse.json({ result: false, message: 'Some Went Wrong! Check your excel data' });
    }
}
