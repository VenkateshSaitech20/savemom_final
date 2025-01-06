import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { registerData, responseData } from '@/utils/message';
import path from 'path';
import { extractTokenData } from '@/utils/helper';
import { deleteFields, deleteFile, getFilePathFromUrl, validateFields, writeFile } from '../api-utlis/helper';
const prisma = new PrismaClient();

// Get Profile details
export async function GET(req) {
    try {
        const token = extractTokenData(req.headers);
        if (!token) {
            return NextResponse.json({ result: false, message: { tokenExpired: responseData.tokenExpired } });
        }
        const user = await prisma.user.findUnique({ where: { id: token.id, isDeleted: "N" } });
        let userId = user.id;
        deleteFields(user, ['createdAt', 'updatedAt', 'password', 'language', 'roleId', 'isDeleted', 'createdBy', 'subscriptionPlan',])
        if (!userId) {
            return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
        } else {
            return NextResponse.json({
                result: true,
                message: user
            });
        }
    } catch (error) {
        return NextResponse.json({ error: error.message });
    }
};

// Profile update
export async function PUT(req) {
    try {
        const token = extractTokenData(req.headers);
        if (!token) {
            return NextResponse.json({ result: false, message: { tokenExpired: responseData.tokenExpired } });
        }
        const user = await prisma.user.findUnique({ where: { id: token.id, isDeleted: "N" } });
        let userId = user.id;
        const oldImageUrl = user.image;

        if (!userId) {
            return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
        }
        const formData = await req.formData();
        const fields = {};
        const file = formData.get('image');
        let profileImageUrl = '';

        for (const [key, value] of formData.entries()) {
            fields[key] = value;
        }
        const { name, email, contactNo, address, stateId, zipCode, countryId, companyName } = fields;
        const emptyFieldErrors = {};
        if (name.trim() === "") {
            emptyFieldErrors.name = registerData.nameReq;
        }
        if (email.trim() === "") {
            emptyFieldErrors.email = registerData.emailReq;
        }
        if (Object.keys(emptyFieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: emptyFieldErrors });
        }
        const validatingFields = {
            name: { type: "name", message: registerData.nameFieldVal },
            email: { type: "email", message: registerData.emailValMsg },
            contactNo: { type: "mobileNumber", message: registerData.phoneValMsg },
            address: { type: "address", message: registerData.addressValMsg },
            zipCode: { type: "number", message: registerData.zipFieldVal },
            companyName: { type: "name", message: registerData.companyFieldVal },
        }
        let fieldErrors = validateFields(fields, validatingFields);
        if (Object.keys(fieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: fieldErrors });
        }
        let country = "";
        let phoneCode = "";
        let state = "";
        let countryIdInt = null;
        let stateIdInt = null;
        if (countryId) {
            countryIdInt = parseInt(countryId, 10);
            const countryDetail = await prisma.country.findFirst({ select: { name: true, phoneCode: true }, where: { id: countryIdInt } });
            country = countryDetail.name;
            phoneCode = countryDetail.phoneCode;
        }
        if (stateId) {
            stateIdInt = parseInt(stateId, 10);
            const stateDetail = await prisma.state.findFirst({ where: { id: stateIdInt } });
            state = stateDetail.name;
        }
        const errors = {};
        const existsEmail = await prisma.user.findFirst({
            where: {
                AND: [
                    { email: email },
                    { id: { not: userId } },
                    { isDeleted: 'N' }
                ]
            }
        });
        const contactNoExists = await prisma.user.findFirst({
            where: { contactNo: contactNo, isDeleted: 'N', id: { not: userId } }
        });
        if (existsEmail && existsEmail != "") {
            errors.email = responseData.emailExists;
        }
        if (contactNoExists && contactNoExists.contactNo != "") {
            errors.contactNo = responseData.contactNoExists;
        }
        if (Object.keys(errors).length > 0) {
            return NextResponse.json({ result: false, message: errors });
        }
        if (file) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const filename = Date.now() + '_' + file.name.replace(/\s+/g, '_');
            const localFilePath = path.join(process.cwd(), process.env.MAIN_FOLDER_PATH, process.env.PROFILE_IMAGE_FOLDER_PATH, filename);
            await writeFile(localFilePath, buffer);
            profileImageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${process.env.PROFILE_IMAGE_FOLDER_PATH}/${filename}`;
        }
        if (name !== user.name) {
            if (user.adminApprovalId === "2") {
                if (user.roleId !== "1" && user.id === user.createdBy) {
                    await prisma.role.updateMany({ where: { createdUserId: user.id }, data: { name: name, createdBy: name } });
                    const subUserRoles = await prisma.user.findMany({ where: { createdBy: user.id } });
                    for (const subUser of subUserRoles) {
                        await prisma.role.updateMany({
                            where: { userId: subUser.id },
                            data: { name: name }
                        });
                    }
                } else if (user.roleId !== "1" && user.id !== user.createdBy) {
                    await prisma.role.updateMany({ where: { createdUserId: user.id }, data: { createdBy: name } });
                    await prisma.user.updateMany({ where: { createdBy: user.id }, data: { companyName: name } });
                }
            }
        };
        await prisma.user.update({
            where: { id: userId },
            data: {
                name,
                email,
                contactNo,
                address,
                state,
                stateId: stateIdInt,
                zipCode,
                country,
                phoneCode,
                countryId: countryIdInt,
                companyName,
                image: profileImageUrl || oldImageUrl
            }
        });
        const baseDir = `${process.env.MAIN_FOLDER_PATH}`;
        if (file && oldImageUrl) {
            const oldImageFilePath = getFilePathFromUrl(oldImageUrl, baseDir);
            try {
                await deleteFile(oldImageFilePath);
            } catch (error) {
                console.error('Failed to delete old image:', error);
            }
        }

        return NextResponse.json({ result: true, message: responseData.profileUpdated });
    } catch (error) {
        console.log("ERROR IN PUT: ", error.message);
        return NextResponse.json({ result: false, message: error.message });
    }
}

