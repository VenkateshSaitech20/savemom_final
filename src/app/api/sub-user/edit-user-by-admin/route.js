import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { registerData, responseData } from '@/utils/message';
import { extractTokenData } from '@/utils/helper';
import { validateFields } from '../../api-utlis/helper';

const prisma = new PrismaClient();

// Edit sub user
export async function POST(req) {
    try {
        const token = extractTokenData(req.headers);
        if (!token.id) {
            return NextResponse.json({ result: false, message: { invalidToken: responseData.invalidToken } });
        };
        let userId = token.id;
        const user = await prisma.user.findUnique({ where: { id: userId, isDeleted: "N" } });
        if (!user) {
            return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
        }
        const body = await req.json();
        const { name, id, profileStatus, contactNo, countryId, roleId, roleName } = body;
        const emptyFieldErrors = {};
        if (name.trim() === "") {
            emptyFieldErrors.name = registerData.nameReq;
        }
        if (profileStatus.trim() === "") {
            emptyFieldErrors.profileStatus = registerData.profileStatusReq;
        }
        if (!countryId) {
            emptyFieldErrors.countryId = registerData.countryNameReq;
        }
        if (roleId === "" || roleName === "") {
            emptyFieldErrors.roleId = registerData.roleNameReq;
        }
        if (Object.keys(emptyFieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: emptyFieldErrors });
        };
        const fields = { name, profileStatus, contactNo, roleName, countryId };
        const validatingFields = {
            name: { type: "name", message: registerData.nameFieldVal },
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
        const contactNoExists = await prisma.user.findFirst({
            where: { contactNo: contactNo, id: { not: id }, isDeleted: "N" }
        });
        if (contactNoExists && contactNoExists.contactNo !== "") {
            return NextResponse.json({ result: false, message: { contactNo: responseData.contactNoExists } });
        }
        const updatedProfile = await prisma.user.update({ where: { id: id }, data: { name, profileStatus, contactNo, country, countryId, phoneCode, roleId, roleName } });
        return NextResponse.json({ result: true, message: updatedProfile });
    } catch (error) {
        return NextResponse.json({ result: false, message: error });
    }
}
