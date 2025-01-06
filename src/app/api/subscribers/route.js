import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { registerData, responseData, validations } from '@/utils/message';
// import { extractTokenData } from '@/utils/helper';

const prisma = new PrismaClient();

// Get All subscribers
// export async function GET(req) {
//     try {
//         const token = extractTokenData(req.headers);
//         if (!token.id) {
//             return NextResponse.json({ result: false, message: { invalidToken: responseData.invalidToken } });
//         };
//         let userId = token.id;
//         const user = await prisma.user.findUnique({ where: { id: userId, isDeleted: "N" } });
//         if (!user) {
//             return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
//         }
//         const subscribers = await prisma.subscribers.findMany({});
//         return NextResponse.json({ result: true, message: subscribers });
//     } catch (error) {
//         return NextResponse.json({ result: false, error: error.message });
//     }
// };

// Add Subscribers
export async function POST(req) {
    try {
        const body = await req.json();
        const { email } = body;
        if (email?.trim() === "") {
            return NextResponse.json({ result: false, message: { email: registerData.emailReq } });
        }
        if (!email || !validations.emailPattern.test(email)) {
            return NextResponse.json({ result: false, message: { email: registerData.emailValMsg } });
        }
        const existingEmail = await prisma.subscribers.findFirst({ where: { email } });

        if (existingEmail) {
            return NextResponse.json({ result: false, message: { email: responseData.existSubscribed } });
        }
        await prisma.subscribers.create({ data: { email } });
        return NextResponse.json({ result: true, message: responseData.emailSubscribed });
    } catch (error) {
        return NextResponse.json({ result: false, message: error });
    }
};
