import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { registerData, responseData } from '@/utils/message';
import { extractTokenData, capitalizeFirstLetter } from '@/utils/helper';
import { deleteFields, validateFields } from '../../api-utlis/helper';
const prisma = new PrismaClient();
export async function GET() {
    try {
        const countries = await prisma.country.findMany({ where: { isDeleted: "N" } });
        deleteFields(countries, ['createdAt', 'updatedAt', 'updatedUser']);
        return NextResponse.json({ result: true, message: countries });
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
        const body = await req.json();
        const { name, shortname, phoneCode, isActive, id } = body;
        const emptyFieldErrors = {};
        if (!name || name?.trim() === "") {
            emptyFieldErrors.name = registerData.countryNameReq;
        }
        if (!shortname || shortname?.trim() === "") {
            emptyFieldErrors.shortname = registerData.shortNameReq;
        }
        if (!phoneCode || phoneCode?.trim() === "") {
            emptyFieldErrors.phoneCode = registerData.phnCodeReq;
        }
        if (Object.keys(emptyFieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: emptyFieldErrors });
        };
        const validatingFields = {
            name: { type: "name", message: registerData.countryFieldVal },
            shortname: { type: "shortname", message: registerData.shortnameFieldVal },
            phoneCode: { type: "number", message: registerData.phoneCodeFieldVal },
        };
        const fields = { name, shortname, phoneCode };
        let fieldErrors = validateFields(fields, validatingFields);
        if (Object.keys(fieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: fieldErrors });
        };
        const data = { phoneCode, isActive };
        data.name = capitalizeFirstLetter(name);
        data.shortname = shortname.toUpperCase();
        if (id) {
            data.updatedUser = userId;
            const existingRec = await prisma.country.findUnique({ where: { id: id } });
            if (!existingRec) {
                return NextResponse.json({ result: false, message: { notFound: responseData.noData } })
            }
            console.log('dataf', data)
            const updatedCountry = await prisma.country.update({ where: { id: existingRec.id }, data });
            return NextResponse.json({ result: true, message: updatedCountry });
        } else {
            console.log('datas', data)

            const errors = {};
            const existCountry = await prisma.country.findFirst({ where: { name: name, isDeleted: "N" } });
            if (existCountry) {
                errors.name = responseData.countryExists;
            }
            const existShortName = await prisma.country.findFirst({ where: { shortname: shortname, isDeleted: "N" } });
            if (existShortName) {
                errors.shortname = responseData.shortnameExists;
            }
            const existPhoneCode = await prisma.country.findFirst({ where: { phoneCode: phoneCode, isDeleted: "N" } });
            if (existPhoneCode) {
                errors.phoneCode = responseData.phnCodeExists;
            }
            if (Object.keys(errors).length > 0) {
                return NextResponse.json({ result: false, message: errors });
            }
            await prisma.country.create({ data: { ...data, createdUser: userId } });
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
        await prisma.country.update({
            where: { id: id },
            data: { isDeleted: 'Y' }
        });
        return NextResponse.json({ result: true, message: responseData.delSuccess })
    } catch (error) {
        return NextResponse.json({ result: false, message: error });
    }
}
