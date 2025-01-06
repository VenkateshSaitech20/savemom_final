import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { registerData, responseData } from '@/utils/message';
import { extractTokenData } from '@/utils/helper';
import { deleteFields, deleteFile, getFilePathFromUrl, processFiles, validateFields } from '@/app/api/api-utlis/helper';
const prisma = new PrismaClient();
const baseDir = `${process.env.MAIN_FOLDER_PATH}`;

const uploadDir = `${process.env.MAIN_FOLDER_PATH}/${process.env.LANDING_PAGE_FOLDER_PATH}/${process.env.KEY_ACHIEVEMENTS_IMAGE_FOLDER_PATH}`;
const urlDir = `${process.env.LANDING_PAGE_FOLDER_PATH}/${process.env.KEY_ACHIEVEMENTS_IMAGE_FOLDER_PATH}`;

export async function GET() {
    try {
        const achievements = await prisma.key_achievements.findMany({ where: { isDeleted: "N" } });
        if (achievements) {
            deleteFields(achievements, ['createdAt', 'updatedAt']);
            return NextResponse.json({ result: true, message: achievements });
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
        const formData = await req.formData();
        const fields = {};
        for (const [key, value] of formData.entries()) {
            fields[key] = value;
        }
        const { keyMetric, highlight, id } = fields;
        const emptyFieldErrors = {};
        if (!keyMetric || keyMetric.trim() === "") {
            emptyFieldErrors.keyMetric = registerData.keyMetricReq;
        }
        if (!highlight || highlight.trim() === "") {
            emptyFieldErrors.highlight = registerData.highlightReq;
        }
        if (Object.keys(emptyFieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: emptyFieldErrors });
        }
        const validatingFields = {
            keyMetric: { type: "keyMatric", message: registerData.keyMetricFieldVal },
            highlight: { type: "name", message: registerData.highlightFieldVal }
        };
        let fieldErrors = validateFields(fields, validatingFields);
        if (Object.keys(fieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: fieldErrors });
        }
        const image = formData.get('image');
        const files = { image };
        const { profileImageUrls, errors } = await processFiles(files, uploadDir, urlDir);
        if (Object.keys(errors).length > 0) {
            return NextResponse.json({ result: false, message: errors });
        }
        const data = { keyMetric, highlight, postedBy: user.name, ...profileImageUrls };
        if (id) {
            const existingAchievement = await prisma.key_achievements.findUnique({
                where: { id: id }
            });
            if (!existingAchievement) {
                return NextResponse.json({ result: false, message: { notFound: responseData.notFound } });
            }

            const updatedAchievement = await prisma.key_achievements.update({
                where: { id: existingAchievement.id },
                data
            });

            const filteredFiles = Object.entries(files).filter(([key, file]) => file !== null);
            for (const [key, file] of filteredFiles) {
                if (file) {
                    const oldImageUrl = existingAchievement[key];
                    const oldFilePath = getFilePathFromUrl(oldImageUrl, baseDir);
                    try {
                        await deleteFile(oldFilePath);
                    } catch (error) {
                        console.error('Failed to delete old user image:', error);
                    }
                }
            }

            return NextResponse.json({ result: true, message: updatedAchievement });
        } else {
            await prisma.key_achievements.create({
                data
            });
            return NextResponse.json({ result: true, message: responseData.dataCreateded });
        }
    } catch (error) {
        console.error('Prisma error:', error);
        return NextResponse.json({ result: false, message: { error: error.message } });
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
        await prisma.key_achievements.update({
            where: { id: id },
            data: { isDeleted: 'Y' }
        });
        return NextResponse.json({ result: true, message: responseData.achievementDeleted })
    } catch (error) {
        return NextResponse.json({ result: false, message: error });
    }
}



