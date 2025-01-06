import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { registerData, responseData } from '@/utils/message';
import { extractTokenData } from '@/utils/helper';
import { deleteFields, deleteFile, getFilePathFromUrl, saveFile, validateFields, validateImage } from '../api-utlis/helper';
const prisma = new PrismaClient();
const allowedTypes = process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES.split(',');
const maxSize = process.env.NEXT_PUBLIC_MAX_FILE_SIZE;

// Get System settings
export async function GET() {
    try {
        const systemSetting = await prisma.system_settings.findFirst({});
        deleteFields(systemSetting, ['createdAt', 'updatedAt', 'updatedUser']);
        return NextResponse.json({ result: true, message: systemSetting });
    } catch (error) {
        return NextResponse.json({ result: false, error: error.message });
    }
};

// Update System settings
export async function POST(req) {
    try {
        const token = extractTokenData(req.headers);
        if (!token.id) {
            return NextResponse.json({ result: false, message: { tokenExpired: responseData.tokenExpired } });
        }
        const user = await prisma.user.findUnique({ where: { id: token.id, isDeleted: "N" } });
        if (user === null) {
            return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
        }
        let userId = user.id;
        const formData = await req.formData();
        const fields = {};
        const errors = {};
        let profileImageUrl1 = null;
        let profileImageUrl2 = null;
        const uploadDir = `${process.env.MAIN_FOLDER_PATH}/${process.env.SYSTEM_IMAGE_FOLDER_PATH}`;
        for (const [key, value] of formData.entries()) {
            fields[key] = value;
        };
        const { systemName, id, description, metaTitle, email, contactNo } = fields;
        if (systemName.trim() === "") {
            errors.systemName = registerData.systemNameReq;
        }
        if (description.trim() === "") {
            errors.description = registerData.descriptionReq;
        }
        if (metaTitle.trim() === "") {
            errors.metaTitle = registerData.metaTitleReq;
        }
        if (email.trim() === "") {
            errors.email = registerData.emailReq;
        }
        if (contactNo.trim() === "") {
            errors.contactNo = registerData.phoneReq;
        }
        // const validatingFields = { systemName: "name", description: "nameWithDot", metaTitle: "name" };
        const validatingFields = {
            systemName: { type: "name", message: registerData.systemNameFieldVal },
            description: { type: "nameWithDot", message: registerData.metaDescFieldVal },
            metaTitle: { type: "metaTag", message: registerData.metaTagFieldVal },
            email: { type: "email", message: registerData.emailValMsg },
            contactNo: { type: "mobileNumber", message: registerData.phoneValMsg },
        }
        let fieldErrors = validateFields(fields, validatingFields);
        if (Object.keys(fieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: fieldErrors });
        };
        const file1 = formData.get('systemImage');
        const file2 = formData.get('navbarImage');
        const urlDir = `${process.env.SYSTEM_IMAGE_FOLDER_PATH}`;
        if (file1) {
            const validation = validateImage(file1, allowedTypes, maxSize);
            if (validation.isValid) {
                profileImageUrl1 = file1 ? await saveFile(file1, uploadDir, urlDir) : null;
            } else {
                errors.systemImage = validation.error
            }
        };
        if (file2) {
            const validation = validateImage(file2, allowedTypes, maxSize);
            if (validation.isValid) {
                profileImageUrl2 = file2 ? await saveFile(file2, uploadDir, urlDir) : null;
            } else {
                errors.navbarImage = validation.error
            }
        };
        if (Object.keys(errors).length > 0) {
            return NextResponse.json({ result: false, message: errors });
        }
        const data = {
            systemName,
            systemImage: profileImageUrl1,
            navbarImage: profileImageUrl2,
            description,
            metaTitle,
            email,
            contactNo
        };
        if (id) {
            const existingSettings = await prisma.system_settings.findUnique({ where: { id: id } });
            const oldSystemImageUrl = existingSettings.systemImage;
            const oldNavbarImageUrl = existingSettings.navbarImage;
            const baseDir = `${process.env.MAIN_FOLDER_PATH}`;
            data.updatedUser = userId;
            if (!existingSettings) {
                return NextResponse.json({ result: false, message: { notFound: responseData.systemSettingNotFound } })
            }
            if (file1 === null) {
                data.systemImage = existingSettings.systemImage;
            }
            if (file2 === null) {
                data.navbarImage = existingSettings.navbarImage;
            }
            await prisma.system_settings.update({
                where: { id: existingSettings.id },
                data,
            });
            if (file1) {
                if (oldSystemImageUrl) {
                    const oldImageFilePath1 = getFilePathFromUrl(oldSystemImageUrl, baseDir);
                    try {
                        await deleteFile(oldImageFilePath1);
                    } catch (error) {
                        console.error('Failed to delete old system image:', error);
                    }
                };
            }
            if (file2) {
                if (oldNavbarImageUrl) {
                    const oldImageFilePath2 = getFilePathFromUrl(oldNavbarImageUrl, baseDir);
                    try {
                        await deleteFile(oldImageFilePath2);
                    } catch (error) {
                        console.error('Failed to delete old navbar image:', error);
                    }
                };
            }
        } else {
            await prisma.system_settings.create({
                data,
            });
        }
        return NextResponse.json({ result: true, message: responseData.systemSettingsUpdated });
    } catch (error) {
        return NextResponse.json({ result: false, message: error });
    }
};
