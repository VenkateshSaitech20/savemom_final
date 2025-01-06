import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { registerData, responseData } from '@/utils/message';
import { extractTokenData, generateSlug } from '@/utils/helper';
import { deleteFields, deleteFile, getFilePathFromUrl, processFiles, validateFields } from '../../api-utlis/helper';
const prisma = new PrismaClient();

const uploadDir = `${process.env.MAIN_FOLDER_PATH}/${process.env.BLOG_IMAGE_FOLDER_PATH}`;
const urlDir = `${process.env.BLOG_IMAGE_FOLDER_PATH}`;
const baseDir = `${process.env.MAIN_FOLDER_PATH}`;

// Get all contents by user
export async function GET() {
    try {
        const token = extractTokenData(req.headers);
        if (!token) {
            return NextResponse.json({ result: false, message: { tokenExpired: responseData.tokenExpired } });
        }
        const user = await prisma.user.findUnique({ where: { id: token.id, isDeleted: "N" } });
        if (!user) {
            return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
        }
        const contentData = await prisma.contents.findMany({ where: { isDeleted: "N" }, orderBy: { id: 'asc' } });
        if (contentData) {
            deleteFields(contentData, ['createdAt', 'updatedAt']);
            return NextResponse.json({ result: true, message: contentData });
        }
        return NextResponse.json({ result: true, message: {} });
    } catch (error) {
        return NextResponse.json({ result: false, error: error });
    }
};

// Add & update content
export async function POST(req) {
    try {
        let userId;
        let fields = {};
        const token = extractTokenData(req.headers);
        if (!token) {
            return NextResponse.json({ result: false, message: { tokenExpired: responseData.tokenExpired } });
        }
        const user = await prisma.user.findUnique({ where: { id: token.id, isDeleted: "N" } });
        if (!user) {
            return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
        }
        if (user?.id) { userId = user.id }
        const formData = await req.formData();
        for (const [key, value] of formData.entries()) {
            fields[key] = value;
        };
        const { title, categoryId, shortContent, content, id } = fields;
        const emptyFieldErrors = {};
        if (!title || title?.trim() === "") {
            emptyFieldErrors.title = registerData.titleReq;
        }
        if (!shortContent || shortContent?.trim() === "") {
            emptyFieldErrors.shortContent = registerData.shortContentReq;
        }
        if (!content || content?.trim() === "") {
            emptyFieldErrors.content = registerData.contentReq;
        }
        if (!categoryId || categoryId?.trim() === "") {
            emptyFieldErrors.categoryId = registerData.categoryReq;
        }
        if (Object.keys(emptyFieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: emptyFieldErrors });
        };
        const validatingFields = {
            title: { type: "title", message: registerData.titleFieldVal },
            shortContent: { type: "shortContent", message: registerData.contentFieldVal },
            // content: { type: "descriptionXL", message: registerData.contentFieldVal },
        };
        let fieldErrors = validateFields(fields, validatingFields);
        if (Object.keys(fieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: fieldErrors });
        };
        let categoryName = await prisma.categories.findFirst({ where: { id: parseInt(categoryId) }, select: { categoryName: true } });
        fields.categoryName = categoryName.categoryName;
        fields.postedBy = user.name;
        let existsErrors = {};
        let slug = generateSlug(title);
        fields.slug = slug;
        const existsTitle = await prisma.contents.findFirst({ where: { slug: slug, isDeleted: "N", ...(id ? { NOT: { id: parseInt(id) } } : {}) } });
        if (existsTitle && existsTitle != "") {
            existsErrors.title = responseData.titleExists;
        }
        if (Object.keys(existsErrors).length > 0) {
            return NextResponse.json({ result: false, message: existsErrors });
        }
        const image = formData.get('image');
        const files = { image };
        const { profileImageUrls, errors } = await processFiles(files, uploadDir, urlDir);
        if (Object.keys(errors).length > 0) {
            return NextResponse.json({ result: false, message: errors });
        };
        const data = { ...fields, ...profileImageUrls }
        if (fields.id) {
            data.updatedBy = userId;
            const existingRec = await prisma.contents.findUnique({ where: { id: parseInt(fields.id) } });
            if (!existingRec) {
                return NextResponse.json({ result: false, message: { notFound: responseData.noData } })
            }
            delete data.id;
            const updatedContent = await prisma.contents.update({ where: { id: parseInt(existingRec.id) }, data });

            const filteredFiles = Object.entries(files).filter(([key, file]) => file !== null);
            filteredFiles.forEach(async ([key, file]) => {
                if (file) {
                    const oldImageUrl = existingRec[key];
                    const oldFilePath = getFilePathFromUrl(oldImageUrl, baseDir);
                    try {
                        await deleteFile(oldFilePath);
                    } catch (error) {
                        console.error('Failed to delete old system image:', error);
                    }
                }
            })
            return NextResponse.json({ result: true, message: updatedContent });
        } else {
            data.createdBy = userId;
            await prisma.contents.create({ data });
            return NextResponse.json({ result: true, message: responseData.dataCreateded });
        }
    } catch (error) {
        return NextResponse.json({ result: false, message: error });
    }
};

// Delete content
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
        await prisma.contents.update({
            where: { id: id },
            data: { isDeleted: 'Y', updatedBy: user.id }
        });
        return NextResponse.json({ result: true, message: responseData.packagePlanDeleted })
    } catch (error) {
        return NextResponse.json({ result: false, message: error });
    }
}
