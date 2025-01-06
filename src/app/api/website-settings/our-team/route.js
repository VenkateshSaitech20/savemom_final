import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { registerData, responseData } from '@/utils/message';
import { extractTokenData } from '@/utils/helper';
import { deleteFields, processFiles, deleteFile, getFilePathFromUrl, validateFields } from '../../api-utlis/helper';
const prisma = new PrismaClient();
const baseDir = `${process.env.MAIN_FOLDER_PATH}`;
const uploadDir = `${process.env.MAIN_FOLDER_PATH}/${process.env.LANDING_PAGE_FOLDER_PATH}/${process.env.OUR_TEAM_IMAGE_FOLDER_PATH}`;
const urlDir = `${process.env.LANDING_PAGE_FOLDER_PATH}/${process.env.OUR_TEAM_IMAGE_FOLDER_PATH}`;
export async function GET() {
    try {
        const ourTeam = await prisma.our_team.findMany({ where: { isDeleted: "N" } });
        deleteFields(ourTeam, ['createdAt', 'updatedAt', 'updatedUser']);
        return NextResponse.json({ result: true, message: ourTeam });
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
        const formData = await req.formData();
        const fields = {};
        for (const [key, value] of formData.entries()) {
            fields[key] = value;
        };
        const { title, description, id } = fields;
        const emptyFieldErrors = {};
        if (!title || title?.trim() === "") {
            emptyFieldErrors.title = registerData.titleReq;
        }
        if (!description || description?.trim() === "") {
            emptyFieldErrors.description = registerData.descriptionReq;
        }
        if (Object.keys(emptyFieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: emptyFieldErrors });
        };
        const validatingFields = {
            title: { type: "name", message: registerData.titleFieldVal },
            description: { type: "description", message: registerData.descriptionFieldVal },
        };
        let fieldErrors = validateFields(fields, validatingFields);
        if (Object.keys(fieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: fieldErrors });
        };
        const image = formData.get('image');
        const files = { image };
        const { profileImageUrls, errors } = await processFiles(files, uploadDir, urlDir);
        if (Object.keys(errors).length > 0) {
            return NextResponse.json({ result: false, message: errors });
        };
        const data = { title, description, ...profileImageUrls };
        if (id) {
            data.updatedUser = userId;
            const existingRec = await prisma.our_team.findUnique({ where: { id: id } });
            if (!existingRec) {
                return NextResponse.json({ result: false, message: { notFound: responseData.noData } })
            }
            const updatedTeam = await prisma.our_team.update({ where: { id: existingRec.id }, data });
            const filteredFiles = Object.entries(files).filter(([key, file]) => file !== null);
            filteredFiles.map(async ([key, file]) => {
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
            return NextResponse.json({ result: true, message: updatedTeam })
        } else {
            await prisma.our_team.create({ data });
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
        await prisma.our_team.update({
            where: { id: id },
            data: { isDeleted: 'Y' }
        });
        return NextResponse.json({ result: true, message: responseData.delSuccess })
    } catch (error) {
        return NextResponse.json({ result: false, message: error });
    }
} 
