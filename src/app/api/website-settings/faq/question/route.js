import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { registerData, responseData } from '@/utils/message';
import { extractTokenData } from '@/utils/helper';
import { deleteFields, validateFields } from '@/app/api/api-utlis/helper';
const prisma = new PrismaClient();

export async function GET() {
    try {
        const faqQuestionAnswer = await prisma.questionanswer.findMany({ where: { isDeleted: 'N' } });
        if (faqQuestionAnswer) {
            deleteFields(faqQuestionAnswer, ['createdAt', 'updatedAt', 'updatedUser']);
            return NextResponse.json({ result: true, message: faqQuestionAnswer });
        }
        return NextResponse.json({ result: true, message: {} });

    } catch (error) {
        return NextResponse.json({ result: false, error: error });
    }
};
export async function POST(req) {
    try {
        const token = extractTokenData(req.headers);

        if (!token.id) {
            return NextResponse.json({ result: false, message: { tokenExpired: responseData.tokenExpired } });
        }
        const user = await prisma.user.findUnique({ where: { id: token.id, isDeleted: "N" } });
        if (!user) {
            return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
        }
        const body = await req.json();
        let { question, answer, id } = body;
        const emptyFieldErrors = {};
        if (question.trim() === "") {
            emptyFieldErrors.question = registerData.quesReq;
        }
        if (answer.trim() === "") {
            emptyFieldErrors.answer = registerData.ansReq;
        }

        if (Object.keys(emptyFieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: emptyFieldErrors });
        };
        const fields = { question, answer };
        const validatingFields = {
            question: { type: "question", message: registerData.questionFieldVal },
            answer: { type: "nameWithDot", message: registerData.answerFieldVal },
        };
        let fieldErrors = validateFields(fields, validatingFields);
        if (Object.keys(fieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: fieldErrors });
        };
        const data = { question, answer };
        if (id) {
            await prisma.questionanswer.update({ where: { id }, data })
            return NextResponse.json({ result: true, message: responseData.dataUpdated });
        }
        await prisma.questionanswer.create({ data });
        return NextResponse.json({ result: true, message: responseData.dataCreateded });
    } catch (error) {
        return NextResponse.json({ result: false, message: error });
    }
}

export async function PUT(req) {
    try {
        const token = extractTokenData(req.headers);
        if (!token.id) {
            return NextResponse.json({ result: false, message: { tokenExpired: responseData.tokenExpired } });
        }
        const user = await prisma.user.findUnique({ where: { id: token.id, isDeleted: "N" } });
        if (!user) {
            return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
        }
        const body = await req.json();
        const { id } = body;
        await prisma.questionanswer.update({
            where: { id: id },
            data: { isDeleted: 'Y' }
        });
        return NextResponse.json({ result: true, message: responseData.faqDeleted })
    } catch (error) {
        return NextResponse.json({ result: false, message: error });
    }
}  
