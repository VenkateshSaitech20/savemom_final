import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { responseData } from '@/utils/message';
import { extractTokenData } from '@/utils/helper';
import { deleteFields, processFiles, deleteFile, getFilePathFromUrl, } from '../../api-utlis/helper';

const prisma = new PrismaClient();

// Get Seconnd Section
export async function GET() {
    try {
        const ourTeam = await prisma.key_achievements.findMany({});
        deleteFields(ourTeam, ['createdAt', 'updatedAt', 'updatedUser']);
        return NextResponse.json({ result: true, message: ourTeam });
    } catch (error) {
        return NextResponse.json({ result: false, error: error });
    }
};

// Insert / Update second section
export async function POST(req) {
    try {
        let userId;
        let data = {};
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
        const uploadDir = `${process.env.MAIN_FOLDER_PATH}/${process.env.LANDING_PAGE_FOLDER_PATH}/${process.env.KEY_ACHIEVEMENTS_IMAGE_FOLDER_PATH}`;
        const urlDir = `${process.env.LANDING_PAGE_FOLDER_PATH}/${process.env.KEY_ACHIEVEMENTS_IMAGE_FOLDER_PATH}`;
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        };
        const imageOne = formData.get('imageOne');
        const imageTwo = formData.get('imageTwo');
        const imageThree = formData.get('imageThree');
        const imageFour = formData.get('imageFour');
        const files = { imageOne, imageTwo, imageThree, imageFour };
        const { profileImageUrls, errors } = await processFiles(files, uploadDir, urlDir);
        if (Object.keys(errors).length > 0) {
            return NextResponse.json({ result: false, message: errors });
        };
        data = {
            ...data,
            ...profileImageUrls
        }
        if (data.id) {
            data.updatedUser = userId;
            const existingRec = await prisma.key_achievements.findUnique({ where: { id: data.id } });
            if (!existingRec) {
                return NextResponse.json({ result: false, message: { notFound: responseData.noData } })
            }
            await prisma.key_achievements.update({ where: { id: existingRec.id }, data });

            const baseDir = `${process.env.MAIN_FOLDER_PATH}`;
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
        } else {
            await prisma.key_achievements.create({ data });
        }
        return NextResponse.json({ result: true, message: responseData.dataUpdated });
    } catch (error) {
        return NextResponse.json({ result: false, message: error });
    }
};
