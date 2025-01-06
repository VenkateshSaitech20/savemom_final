import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { registerData, responseData } from '@/utils/message';
import { validateFields } from '../api-utlis/helper';

const prisma = new PrismaClient();

// Insert
export async function POST(req) {
    try {
        const body = await req.json();
        const { name, email, message } = body.data;
        const fields = { name, email, message };
        const emptyFieldErrors = {};
        if (name.trim() === "") {
            emptyFieldErrors.name = registerData.nameReq;
        }
        if (email.trim() === "") {
            emptyFieldErrors.email = registerData.emailReq;
        }
        if (message.trim() === "") {
            emptyFieldErrors.message = registerData.messageReq;
        }
        if (Object.keys(emptyFieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: emptyFieldErrors });
        };
        const validatingFields = {
            name: { type: "name", message: registerData.nameFieldVal },
            email: { type: "email", message: registerData.emailValMsg },
            message: { type: "nameWithDot", message: registerData.messageFieldVal },
        };
        let fieldErrors = validateFields(fields, validatingFields);
        if (Object.keys(fieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: fieldErrors });
        };

        await prisma.customer_enquiries.create({ data: fields });
        return NextResponse.json({ result: true, message: responseData.enquirySubmitted });
    } catch (error) {
        console.log("error:", error);
        return NextResponse.json({ result: false, message: error });
    }
};
