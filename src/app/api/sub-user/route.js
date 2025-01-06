import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { registerData, responseData } from '@/utils/message';
import { extractTokenData } from '@/utils/helper';
import { validateFields } from '../api-utlis/helper';
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

// Create sub user
export async function POST(req) {
    const saltRounds = 10;
    async function hashPassword(password) {
        return bcrypt.hash(password, saltRounds);
    }
    try {
        const token = extractTokenData(req.headers);
        if (!token.id) {
            return NextResponse.json({ result: false, message: { invalidToken: responseData.invalidToken } });
        };
        let createdBy = token.id;
        const user = await prisma.user.findUnique({ where: { id: createdBy, isDeleted: "N" } });
        const { packageId, packageName, packageValidity, purchaseDate, expirayDate, paymentMethod, isExpired, amount, currency, paymentStatus, paymentId, adminApprovalId } = user;
        if (!user) {
            return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
        }
        const body = await req.json();
        let { name, company, contactNo, countryId, email, profileStatus, roleId, password, roleName } = body;
        const emptyFieldErrors = {};
        if (name.trim() === "") {
            emptyFieldErrors.name = registerData.nameReq;
        }
        if (email.trim() === "") {
            emptyFieldErrors.email = registerData.emailReq;
        }
        if (password.trim() === "") {
            emptyFieldErrors.password = registerData.passwordReq;
        }
        if (!countryId) {
            emptyFieldErrors.countryId = registerData.countryNameReq;
        }
        if (roleId === "" || roleName === "") {
            emptyFieldErrors.roleId = registerData.roleNameReq;
        }
        if (profileStatus.trim() === "") {
            emptyFieldErrors.profileStatus = registerData.profileStatusReq;
        }
        if (Object.keys(emptyFieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: emptyFieldErrors });
        };
        const fields = { name, company, contactNo, countryId, email, profileStatus, roleName };
        const validatingFields = {
            name: { type: "name", message: registerData.nameFieldVal },
            email: { type: "email", message: registerData.emailValMsg },
            company: { type: "name", message: registerData.companyFieldVal },
            contactNo: { type: "mobileNumber", message: registerData.phoneValMsg },
            countryId: { type: "number", message: registerData.countryIdFieldVal },
            profileStatus: { type: "name", message: registerData.statusFieldVal },
            roleName: { type: "name", message: registerData.roleFieldVal }
        };
        let fieldErrors = validateFields(fields, validatingFields);
        if (Object.keys(fieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: fieldErrors });
        };
        const countryRow = await prisma.country.findFirst({ select: { name: true, phoneCode: true }, where: { id: countryId } });
        const country = countryRow.name;
        const phoneCode = countryRow.phoneCode;
        const hashedPassword = await hashPassword(password);
        const errors = {};
        const getUser = await prisma.user.findUnique({ where: { id: createdBy } });
        if (getUser.roleId !== "1") {
            createdBy = getUser.createdBy;
        }
        const existsEmail = await prisma.user.findFirst({ where: { email: email, isDeleted: "N" } });
        const contactNoExists = await prisma.user.findFirst({
            where: { contactNo: contactNo, isDeleted: "N" }
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
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                roleId,
                createdBy,
                companyName: getUser.name,
                contactNo,
                country,
                countryId,
                phoneCode,
                profileStatus: profileStatus.toLowerCase(),
                roleName,
                packageId, packageName, packageValidity, purchaseDate, expirayDate, paymentMethod, isExpired, amount, currency, paymentStatus, paymentId, adminApprovalId
            }
        });
        return NextResponse.json({ result: true, message: responseData.userCreated });
    } catch (error) {
        return NextResponse.json({ result: false, message: error });
    }
}
