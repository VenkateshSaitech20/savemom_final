import { extractTokenData } from "@/utils/helper";
import { registerData, responseData } from "@/utils/message";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { validateFields } from "../api-utlis/helper";

const prisma = new PrismaClient();

export async function POST(req) {
    try {
        let userId;
        const token = extractTokenData(req.headers);
        if (!token) {
            return NextResponse.json({ result: false, message: { tokenExpired: responseData.tokenExpired } });
        }
        const user = await prisma.user.findUnique({ where: { id: token.id, isDeleted: "N" } });
        if (!user) {
            return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
        }
        if (user?.id) userId = user.id
        const body = await req.json();
        const { subject, message, templateType, id } = body;
        const emptyFieldErrors = {};
        if (!subject || subject?.trim() === "") {
            emptyFieldErrors.subject = registerData.subjectReq;
        }
        if (!message || message?.trim() === "") {
            emptyFieldErrors.message = registerData.messageReq;
        }
        if (Object.keys(emptyFieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: emptyFieldErrors });
        };
        const validatingFields = {
            subject: { type: "title", message: registerData.subjectFieldVal }
        };
        let fieldErrors = validateFields(body, validatingFields);
        if (Object.keys(fieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: fieldErrors });
        };
        if (id) {
            body.updatedBy = userId;
            await prisma.mail_templates.update({ where: { id: parseInt(id), templateType: templateType }, data: body });
            return NextResponse.json({ result: true, message: responseData.dataUpdated });
        } else {
            body.createdBy = userId;
            await prisma.mail_templates.create({ data: body });
            return NextResponse.json({ result: true, message: responseData.dataCreateded });
        }
    } catch (error) {
        return NextResponse.json({ result: false, error: error });
    }
}
