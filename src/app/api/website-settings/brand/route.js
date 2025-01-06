import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { registerData, responseData } from '@/utils/message';
import { extractTokenData } from '@/utils/helper';
import { deleteFields, deleteFile, getFilePathFromUrl, processFiles } from '@/app/api/api-utlis/helper';
const prisma = new PrismaClient();
const baseDir = `${process.env.MAIN_FOLDER_PATH}`;

const urlDir = `${process.env.LANDING_PAGE_FOLDER_PATH}/${process.env.BRAND_IMAGE_FOLDER_PATH}`;
const uploadDir = `${process.env.MAIN_FOLDER_PATH}/${process.env.LANDING_PAGE_FOLDER_PATH}/${process.env.BRAND_IMAGE_FOLDER_PATH}`;

export async function GET() {
    try {
        const brandSection = await prisma.brands.findMany({});
        deleteFields(brandSection, ['createdAt', 'updatedAt', 'updatedUser']);
        return NextResponse.json({ result: true, message: brandSection });
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
        const formData = await req.formData();
        const imageOne = formData.get('imageOne');
        const imageTwo = formData.get('imageTwo');
        const imageThree = formData.get('imageThree');
        const imageFour = formData.get('imageFour');
        const imageFive = formData.get('imageFive');
        const id = formData.get('id');
        const files = { imageOne, imageTwo, imageThree, imageFour, imageFive };
        const { profileImageUrls, errors } = await processFiles(files, uploadDir, urlDir);
        if (Object.keys(errors).length > 0) {
            return NextResponse.json({ result: false, message: errors });
        };
        const data = { ...profileImageUrls };
        if (id) {
            const existingBrandDetails = await prisma.brands.findUnique({ where: { id: id } });
            if (existingBrandDetails === null) {
                return NextResponse.json({ result: false, message: { notFound: responseData.notFound } });
            }
            await prisma.brands.update({
                where: { id: existingBrandDetails.id },
                data
            })
            const filteredFiles = Object.entries(files).filter(([key, file]) => file !== null);
            filteredFiles.map(async ([key, file]) => {
                if (file) {
                    const oldImageUrl = existingBrandDetails[key];
                    const oldFilePath = getFilePathFromUrl(oldImageUrl, baseDir);
                    try {
                        await deleteFile(oldFilePath);
                    } catch (error) {
                        console.error('Failed to delete old testimonial image:', error);
                    }
                }
            })
            return NextResponse.json({ result: true, message: responseData.dataUpdated })
        } else {
            data.createdUser = user.id;
            await prisma.brands.create({
                data
            })
            return NextResponse.json({ result: true, message: responseData.dataCreateded })
        }
    } catch (error) {
        return NextResponse.json({ result: false, message: error })
    }
}
