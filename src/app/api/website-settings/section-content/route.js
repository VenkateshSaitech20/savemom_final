import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { registerData, responseData } from '@/utils/message';
import { extractTokenData } from '@/utils/helper';
import { validateFields, deleteFields } from '../../api-utlis/helper';

const prisma = new PrismaClient();

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const sectionType = searchParams.get('sectionType');
        const section_content = await prisma.section_content.findFirst({
            where: {
                sectionType: sectionType
            }
        });
        deleteFields(section_content, ['createdAt', 'updatedAt']);
        return NextResponse.json({ result: true, message: section_content });
    } catch (error) {
        return NextResponse.json({ result: false, error: error.message });
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
        let userId = user.id;
        const body = await req.json();
        let { badgeTitle, title, description, sectionType, id, isfrontendvisible, discount } = body;
        if (sectionType === "brand" || sectionType === "key_achievements") {
            const data = { sectionType, isfrontendvisible };
            if (id) {
                data.updatedUser = userId;
                await prisma.section_content.update({ where: { id }, data })
                return NextResponse.json({ result: true, message: responseData.dataUpdated });
            } else {
                data.createdUser = userId;
                await prisma.section_content.create({ data });
                return NextResponse.json({ result: true, message: responseData.dataCreateded });
            }
        }
        const emptyFieldErrors = {};
        if (badgeTitle.trim() === "") {
            emptyFieldErrors.badgeTitle = registerData.badgeTitleReq;
        }
        if (title.trim() === "") {
            emptyFieldErrors.title = registerData.titleReq;
        }
        if (description.trim() === "") {
            emptyFieldErrors.description = registerData.descriptionReq;
        }
        if (Object.keys(emptyFieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: emptyFieldErrors });
        }
        let fields = { badgeTitle, title, description, sectionType, isfrontendvisible };
        let validatingFields = {
            badgeTitle: { type: "name", message: registerData.badgeFieldVal },
            title: { type: "name", message: registerData.titleFieldVal },
            description: { type: "description", message: registerData.descriptionFieldVal },
        };
        if (sectionType === "plans") {
            fields = { ...fields, discount };
            validatingFields = {
                ...validatingFields,
                discount: { type: "discount", message: registerData.discountFieldVal }
            };
        }
        let fieldErrors = validateFields(fields, validatingFields);
        if (Object.keys(fieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: fieldErrors });
        }
        let data = { badgeTitle, title, description, sectionType, isfrontendvisible };
        if (sectionType === "plans") {
            data = { ...data, discount };
        }
        if (id) {
            data.updatedUser = userId;
            await prisma.section_content.update({ where: { id }, data });
            return NextResponse.json({ result: true, message: responseData.dataUpdated });
        }
        data.createdUser = userId;
        await prisma.section_content.create({ data });
        return NextResponse.json({ result: true, message: responseData.dataCreateded });
    } catch (error) {
        return NextResponse.json({ result: false, message: error.message });
    }
}
