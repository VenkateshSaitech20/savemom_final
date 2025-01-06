import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { registerData, responseData } from '@/utils/message';
import { extractTokenData, capitalizeFirstLetter } from '@/utils/helper';
import { deleteFields, validateFields } from '../../api-utlis/helper';
const prisma = new PrismaClient();
export async function GET() {
    try {
        const cities = await prisma.city.findMany({ where: { isDeleted: "N" } });
        deleteFields(cities, ['createdAt', 'updatedAt', 'updatedUser']);
        return NextResponse.json({ result: true, message: cities });
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
        const { name, lgdCode, shortname, countryId, stateId, isActive, id } = body;
        const emptyFieldErrors = {};
        if (!name || name?.trim() === "") {
            emptyFieldErrors.name = registerData.stateNameReq;
        }
        if (!lgdCode) {
            emptyFieldErrors.lgdCode = registerData.lgdCodeNameReq;
        }
        if (!shortname) {
            emptyFieldErrors.shortname = registerData.shortNameReq;
        }
        if (!countryId) {
            emptyFieldErrors.countryId = registerData.countryNameReq;
        }
        if (!stateId) {
            emptyFieldErrors.stateId = registerData.stateNameReq;
        }
        if (Object.keys(emptyFieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: emptyFieldErrors });
        };
        const validatingFields = {
            name: { type: "name", message: registerData.stateFieldVal },
            countryId: { type: "number", message: registerData.countryIdFieldVal },
            stateId: { type: "number", message: registerData.stateFieldVal },
            lgdCode: { type: "number", message: registerData.lgdCodeFieldVal },
            shortname: { type: "name", message: registerData.shortnameFieldVal },
        };
        const fields = { name, countryId, stateId, lgdCode, shortname };
        let fieldErrors = validateFields(fields, validatingFields);
        if (Object.keys(fieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: fieldErrors });
        };
        const countryRow = await prisma.country.findFirst({ where: { id: countryId } });
        const country = countryRow.name;
        const stateRow = await prisma.state.findFirst({ where: { id: stateId } });
        const state = stateRow.name;
        const data = { countryId, country, lgdCode, shortname, stateId, state, isActive };
        data.name = capitalizeFirstLetter(name);
        if (id) {
            data.updatedUser = userId;
            const existingRec = await prisma.city.findUnique({ where: { id: id } });
            if (!existingRec) {
                return NextResponse.json({ result: false, message: { notFound: responseData.noData } })
            }
            const updatedCity = await prisma.city.update({ where: { id: existingRec.id }, data });
            return NextResponse.json({ result: true, message: updatedCity });
        } else {
            const errors = {};
            const existCityName = await prisma.city.findFirst({ where: { name: name, isDeleted: "N" } });
            if (existCityName) {
                errors.name = responseData.cityExists;
            }
            if (Object.keys(errors).length > 0) {
                return NextResponse.json({ result: false, message: errors });
            }
            await prisma.city.create({ data: { ...data, createdUser: userId } });
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
        await prisma.city.update({
            where: { id: id },
            data: { isDeleted: 'Y' }
        });
        return NextResponse.json({ result: true, message: responseData.delSuccess })
    } catch (error) {
        return NextResponse.json({ result: false, message: error });
    }
}
