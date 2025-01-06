import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { registerData, responseData } from '@/utils/message';
import { extractTokenData, capitalizeFirstLetter } from '@/utils/helper';
import { deleteFields, validateFields } from '../../api-utlis/helper';
const prisma = new PrismaClient();
export async function GET() {
    try {
        const states = await prisma.state.findMany({ where: { isDeleted: "N" } });
        deleteFields(states, ['createdAt', 'updatedAt', 'updatedUser']);
        return NextResponse.json({ result: true, message: states });
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
        const { name, countryId, lgdCode, isActive, id } = body;

        const emptyFieldErrors = {};
        if (!name || name?.trim() === "") {
            emptyFieldErrors.name = registerData.stateNameReq;
        }
        if (!countryId) {
            emptyFieldErrors.countryId = registerData.countryNameReq;
        }
        if (!lgdCode) {
            emptyFieldErrors.lgdCode = registerData.lgdCodeNameReq;
        }
        if (Object.keys(emptyFieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: emptyFieldErrors });
        };
        const validatingFields = {
            name: { type: "name", message: registerData.stateFieldVal },
            lgdCode: { type: "number", message: registerData.lgdCodeFieldVal }
        };
        const fields = { name, countryId, lgdCode };
        let fieldErrors = validateFields(fields, validatingFields);
        if (Object.keys(fieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: fieldErrors });
        };
        console.log('fieldErrors', fieldErrors)
        const countryRow = await prisma.country.findFirst({ where: { id: countryId } });
        if (!countryRow) {
            return NextResponse.json({ result: false, message: { countryNotFound: responseData.countryNotFound } });
        }
        const country = countryRow.name;
        const data = { countryId, country, isActive, lgdCode };

        data.name = capitalizeFirstLetter(name);
        console.log('data', data)
        if (id) {
            data.updatedUser = userId;
            const existingRec = await prisma.state.findUnique({ where: { id: id } });
            if (!existingRec) {
                return NextResponse.json({ result: false, message: { notFound: responseData.noData } })
            }
            const updatedState = await prisma.state.update({ where: { id: existingRec.id }, data });
            return NextResponse.json({ result: true, message: updatedState });
        } else {
            const errors = {};
            const existStateName = await prisma.state.findFirst({ where: { name: name, isDeleted: "N" } });
            if (existStateName) {
                errors.name = responseData.stateExists;
            }
            if (Object.keys(errors).length > 0) {
                return NextResponse.json({ result: false, message: errors });
            }
            await prisma.state.create({ data: { ...data, createdUser: userId } });
            return NextResponse.json({ result: true, message: responseData.dataCreateded });
        }
    } catch (error) {
        console.log("Error in POST: ", error.message);
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
        await prisma.state.update({
            where: { id: id },
            data: { isDeleted: 'Y' }
        });
        return NextResponse.json({ result: true, message: responseData.delSuccess })
    } catch (error) {
        return NextResponse.json({ result: false, message: error });
    }
}
