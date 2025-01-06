import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { registerData, responseData } from '@/utils/message';
import { extractTokenData } from '@/utils/helper';
import { deleteFields, processFiles, deleteFile, getFilePathFromUrl, validateFields } from '../../api-utlis/helper';

const prisma = new PrismaClient();
const baseDir = `${process.env.MAIN_FOLDER_PATH}`;
const urlDir = `${process.env.LANDING_PAGE_FOLDER_PATH}/${process.env.FEATURES_FOLDER_PATH}`;
const uploadDir = `${process.env.MAIN_FOLDER_PATH}/${process.env.LANDING_PAGE_FOLDER_PATH}/${process.env.FEATURES_FOLDER_PATH}`;

export async function GET() {
    try {
        const features = await prisma.features.findMany({ where: { isDeleted: "N" } });
        deleteFields(features, ['createdAt', 'updatedAt', 'updatedUser']);
        return NextResponse.json({ result: true, message: features });
    } catch (error) {
        return NextResponse.json({ result: false, error: error.message });
    }
};

export async function POST(req) {
    try {
        const token = extractTokenData(req.headers);
        if (!token.id) {
            console.log("Token expired or invalid:", token); // Log the token for debugging
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
        };
        const { title, description, id } = fields;
        console.log("Received form fields:", fields); // Log the form data fields for debugging
        const emptyFieldErrors = {};
        if (!description || description?.trim() === "") {
            emptyFieldErrors.description = registerData.descriptionReq;
        }
        if (!title || title?.trim() === "") {
            emptyFieldErrors.title = registerData.titleReq;
        }
        if (Object.keys(emptyFieldErrors).length > 0) {
            console.log("Validation errors:", emptyFieldErrors); // Log the errors to debug
            return NextResponse.json({ result: false, message: emptyFieldErrors });
        }

        const validatingFields = {
            title: { type: "name", message: registerData.titleFieldVal },
            description: { type: "nameWithDot", message: registerData.descriptionFieldVal },
        };
        let fieldErrors = validateFields(fields, validatingFields);
        if (Object.keys(fieldErrors).length > 0) {
            console.log("Field validation errors:", fieldErrors); // Log the errors to debug
            return NextResponse.json({ result: false, message: fieldErrors });
        }

        const image = formData.get('image');
        const files = { image };
        const { profileImageUrls, errors } = await processFiles(files, uploadDir, urlDir);
        if (Object.keys(errors).length > 0) {
            console.log("File processing errors:", errors); // Log the file processing errors for debugging
            return NextResponse.json({ result: false, message: errors });
        }

        const data = { title, description, updatedUser: user.id, ...profileImageUrls };
        if (id) {
            const existingFeatureDetails = await prisma.features.findUnique({ where: { id: id } });
            if (existingFeatureDetails === null) {
                return NextResponse.json({ result: false, message: { notFound: responseData.notFound } });
            }
            const updatedFeature = await prisma.features.update({
                where: { id: existingFeatureDetails.id },
                data
            })
            const filteredFiles = Object.entries(files).filter(([key, file]) => file !== null);
            filteredFiles.map(async ([key, file]) => {
                if (file) {
                    const oldImageUrl = existingFeatureDetails[key];
                    const oldFilePath = getFilePathFromUrl(oldImageUrl, baseDir);
                    try {
                        await deleteFile(oldFilePath);
                    } catch (error) {
                        console.error('Failed to delete old feature image:', error);
                    }
                }
            })
            return NextResponse.json({ result: true, message: updatedFeature })
        } else {
            await prisma.features.create({
                data
            })
            return NextResponse.json({ result: true, message: responseData.dataCreateded })
        }
    } catch (error) {
        console.error("Error in POST /api/website-settings/second-section:", error); // Add this line for logging
        return NextResponse.json({ result: false, message: error.message || 'Unknown error' }); // Ensure you send the error message
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
        await prisma.features.update({
            where: { id: id },
            data: { isDeleted: 'Y' }
        });
        return NextResponse.json({ result: true, message: responseData.delSuccess })
    } catch (error) {
        return NextResponse.json({ result: false, message: error });
    }
} 
