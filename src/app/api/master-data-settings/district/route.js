import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { registerData, responseData } from '@/utils/message';
import { extractTokenData, capitalizeFirstLetter } from '@/utils/helper';
import { deleteFields, validateFields } from '../../api-utlis/helper';
const prisma = new PrismaClient();
export async function GET() {
    try {
        const districts = await prisma.district.findMany({ where: { isDeleted: "N" } });
        deleteFields(districts, ['createdAt', 'updatedAt', 'updatedUser']);
        return NextResponse.json({ result: true, message: districts });
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
        const { name, lgdCode, countryId, stateId, cityId, isActive, id } = body;
        const emptyFieldErrors = {};
        if (!name || name?.trim() === "") {
            emptyFieldErrors.name = registerData.stateNameReq;
        }
        if (!lgdCode) {
            emptyFieldErrors.lgdCode = registerData.lgdCodeNameReq;
        }
        if (!countryId) {
            emptyFieldErrors.countryId = registerData.countryNameReq;
        }
        if (!stateId) {
            emptyFieldErrors.stateId = registerData.stateNameReq;
        }
        if (!cityId) {
            emptyFieldErrors.cityId = registerData.cityNameReq;
        }
        if (Object.keys(emptyFieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: emptyFieldErrors });
        };
        const validatingFields = {
            name: { type: "name", message: registerData.distFieldVal },
            lgdCode: { type: "number", message: registerData.lgdCodeFieldVal },
            countryId: { type: "number", message: registerData.countryIdFieldVal },
            stateId: { type: "number", message: registerData.stateFieldVal },
            cityId: { type: "number", message: registerData.cityFieldVal },
        };
        const fields = { name, lgdCode, countryId, stateId, cityId };
        let fieldErrors = validateFields(fields, validatingFields);
        if (Object.keys(fieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: fieldErrors });
        };
        const countryRow = await prisma.country.findFirst({ where: { id: countryId } });
        const country = countryRow.name;
        const stateRow = await prisma.state.findFirst({ where: { id: stateId } });
        const state = stateRow.name;
        const cityRow = await prisma.city.findFirst({ where: { id: cityId } });
        const city = cityRow.name;
        const data = { countryId, country, stateId, state, cityId, city, lgdCode, isActive };
        data.name = capitalizeFirstLetter(name);
        if (id) {
            data.updatedUser = userId;
            const existingRec = await prisma.district.findUnique({ where: { id: id } });
            if (!existingRec) {
                return NextResponse.json({ result: false, message: { notFound: responseData.noData } })
            }
            const updatedDist = await prisma.district.update({ where: { id: existingRec.id }, data });
            return NextResponse.json({ result: true, message: updatedDist });
        } else {
            const errors = {};
            const existingDist = await prisma.district.findFirst({ where: { name: name, isDeleted: "N" } });
            if (existingDist) {
                errors.name = responseData.distExists;
            }
            if (Object.keys(errors).length > 0) {
                return NextResponse.json({ result: false, message: errors });
            }
            await prisma.district.create({ data: { ...data, createdUser: userId } });
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
        await prisma.district.update({
            where: { id: id },
            data: { isDeleted: 'Y' }
        });
        return NextResponse.json({ result: true, message: responseData.delSuccess })
    } catch (error) {
        return NextResponse.json({ result: false, message: error });
    }
}
