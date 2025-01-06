import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { registerData, responseData } from '@/utils/message';
import { extractTokenData, generateSlug } from '@/utils/helper';
import { validateFields } from '../../api-utlis/helper';
const prisma = new PrismaClient();

export async function GET(req) {
    try {
        // let userId;
        const token = extractTokenData(req.headers);
        if (!token) {
            return NextResponse.json({ result: false, message: { tokenExpired: responseData.tokenExpired } });
        }
        const user = await prisma.user.findUnique({ where: { id: token.id, isDeleted: "N" } });
        if (!user) {
            return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
        }
        // if (user?.id) userId = user.id 
        const categories = await prisma.categories.findMany({ where: { isActive: "Y", isDeleted: "N" }, select: { id: true, categoryName: true, } });
        return NextResponse.json({ result: true, message: categories });
    } catch (error) {
        return NextResponse.json({ result: false, error: error.message });
    }
};

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
        if (user?.id) { userId = user.id }
        const body = await req.json();
        const { categoryName, isActive, id } = body;
        const emptyFieldErrors = {};
        if (!categoryName || categoryName?.trim() === "") {
            emptyFieldErrors.categoryName = registerData.categoryNameReq;
        }
        if (Object.keys(emptyFieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: emptyFieldErrors });
        };
        let slug = generateSlug(categoryName);
        // const isCategoryExist = await prisma.categories.findFirst({ where: { createdBy: user.id, slug: slug, isDeleted: "N", ...(id ? { NOT: { id: parseInt(id) } } : {}) } });
        const isCategoryExist = await prisma.categories.findFirst({ where: { slug: slug, isDeleted: "N", ...(id ? { NOT: { id: parseInt(id) } } : {}) } });
        if (isCategoryExist) {
            return NextResponse.json({ result: false, message: { 'categoryName': responseData.categoryAlreadyExist } });
        }
        const validatingFields = {
            categoryName: { type: "name", message: registerData.categoryFieldVal }
        };
        const fields = { categoryName, slug, isActive };
        let fieldErrors = validateFields(fields, validatingFields);
        if (Object.keys(fieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: fieldErrors });
        };
        if (id) {
            fields.updatedBy = userId;
            const updatedCategory = await prisma.categories.update({ where: { id: parseInt(id), isDeleted: "N" }, data: fields });
            if (updatedCategory) {
                return NextResponse.json({ result: true, message: updatedCategory });
            }
        } else {
            fields.createdBy = userId;
            await prisma.categories.create({ data: fields });
            return NextResponse.json({ result: true, message: responseData.dataCreateded });
        }
    } catch (error) {
        return NextResponse.json({ result: false, message: error });
    }
};

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
        const isContentExist = await prisma.contents.findFirst({ where: { categoryId: id.toString(), isDeleted: "N" } });
        if (isContentExist) {
            return NextResponse.json({ result: false, message: { categoryCannotDel: responseData.categoryCannotDel } })
        }
        await prisma.categories.update({
            where: { id: id, createdBy: user.id },
            data: { isDeleted: 'Y' }
        });
        return NextResponse.json({ result: true, message: responseData.delSuccess })
    } catch (error) {
        return NextResponse.json({ result: false, message: error });
    }
}
