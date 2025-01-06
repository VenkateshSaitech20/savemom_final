import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { registerData, responseData } from '@/utils/message';
import { extractTokenData } from '@/utils/helper';
import { deleteFields, deleteFile, getFilePathFromUrl, processFiles, validateFields } from '../../api-utlis/helper';
const prisma = new PrismaClient();
const urlDir = `${process.env.LANDING_PAGE_FOLDER_PATH}/${process.env.BANNER_IMAGE_FOLDER_PATH}`;
// Get System settings
export async function GET() {
    try {
        const bannerDetails = await prisma.section_content.findFirst({ where: { sectionType: 'banner_section' } });
        deleteFields(bannerDetails, ['createdAt', 'updatedAt', 'updatedUser']);
        return NextResponse.json({ result: true, message: bannerDetails });
    } catch (error) {
        return NextResponse.json({ result: false, error: error });
    }
};
export async function POST(req) {
    try {
        const token = extractTokenData(req.headers);
        if (!token) {
            return NextResponse.json({ result: false, message: { tokenExpired: responseData.tokenExpired } });
        }
        const user = await prisma.user.findUnique({ where: { id: token.id, isDeleted: "N" } });
        if (!user) {
            return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
        }
        let userId = user.id;
        const formData = await req.formData();
        const fields = {};
        const uploadDir = `${process.env.MAIN_FOLDER_PATH}/${process.env.LANDING_PAGE_FOLDER_PATH}/${process.env.BANNER_IMAGE_FOLDER_PATH}`;
        for (const [key, value] of formData.entries()) {
            fields[key] = value;
        };
        const { bannerText, bannerSubText, buttonText, sectionType, id, isfrontendvisible } = fields;
        const emptyFieldErrors = {};
        if (bannerText.trim() === "") {
            emptyFieldErrors.bannerText = registerData.titleReq;
        }
        if (buttonText.trim() === "") {
            emptyFieldErrors.buttonText = registerData.buttonNameReq;
        }
        if (bannerSubText.trim() === "") {
            emptyFieldErrors.bannerSubText = registerData.descriptionReq;
        }
        if (Object.keys(emptyFieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: emptyFieldErrors });
        };
        const validatingFields = {
            bannerText: { type: "name", message: registerData.titleFieldVal },
            bannerSubText: { type: "metaTag", message: registerData.descriptionFieldVal },
            buttonText: { type: "name", message: registerData.buttonFieldVal },
        };
        let fieldErrors = validateFields(fields, validatingFields);
        if (Object.keys(fieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: fieldErrors });
        };
        const image1 = formData.get('dashboardImageLight');
        const image2 = formData.get('dashboardImageDark');
        const files = { image1, image2 };
        const { profileImageUrls, errors } = await processFiles(files, uploadDir, urlDir);
        if (Object.keys(errors).length > 0) {
            console.log("File processing errors:", errors);
            return NextResponse.json({ result: false, message: errors });
        }
        const data = {
            title: bannerText,
            description: bannerSubText,
            badgeTitle: buttonText,
            sectionType: sectionType,
            image1: profileImageUrls.image1 ? profileImageUrls.image1 : null,
            image2: profileImageUrls.image2 ? profileImageUrls.image2 : null,
            isfrontendvisible
        }
        if (id) {
            data.updatedUser = userId;
            const existingBannerDetails = await prisma.section_content.findUnique({ where: { id: parseInt(id) } });
            if (!existingBannerDetails) {
                return NextResponse.json({ result: false, message: { notFound: responseData.bannerNotFound } });
            }
            await prisma.section_content.update({
                where: { id: existingBannerDetails.id },
                data
            });
            const baseDir = `${process.env.MAIN_FOLDER_PATH}`;
            const filteredFiles = Object.entries(files).filter(([key, file]) => file !== null);
            filteredFiles.forEach(async ([key, file]) => {
                if (file) {
                    const oldImageUrl = existingBannerDetails[key];
                    try {
                        if (oldImageUrl !== null || !oldImageUrl) {
                            const oldFilePath = getFilePathFromUrl(oldImageUrl, baseDir);
                            await deleteFile(oldFilePath);
                        }
                    } catch (error) {
                        console.error('Failed to delete old system image:', error);
                    }
                }
            })
            return NextResponse.json({ result: true, message: responseData.bannerDetailsUpdated })
        } else {
            data.createdUser = userId;
            await prisma.section_content.create({
                data
            })
            return NextResponse.json({ result: true, message: responseData.bannerDetailsCreated })
        }
    } catch (error) {
        return NextResponse.json({ result: false, message: error });
    }
}
