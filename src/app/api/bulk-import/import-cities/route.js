import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import * as xlsx from 'xlsx';
import { capitalizeFirstLetter, extractTokenData } from '@/utils/helper';
import { registerData, responseData } from '@/utils/message';
const prisma = new PrismaClient();
export const config = {
    api: {
        bodyParser: false,
    },
};
export async function POST(req) {
    try {
        const token = extractTokenData(req.headers);
        if (!token.id) {
            return NextResponse.json({ result: false, message: { tokenExpired: responseData.tokenExpired } });
        }
        const user = await prisma.user.findUnique({ where: { id: token.id, isDeleted: "N" } });
        if (!user.id) {
            return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
        }
        const formData = await req.formData();
        const file = formData.get('file');
        if (!file) {
            return NextResponse.json({ result: false, message: 'No file uploaded' });
        }
        const buffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(buffer);
        const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const cities = xlsx.utils.sheet_to_json(sheet);
        const countryId = formData.get('countryId');
        const stateId = formData.get('stateId');
        const emptyFieldErrors = {};
        if (!countryId) {
            emptyFieldErrors.districtCountryId = registerData.countryNameReq
        }
        if (!stateId) {
            emptyFieldErrors.districtStateId = registerData.stateNameReq
        }
        if (Object.keys(emptyFieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: emptyFieldErrors });
        }
        const countryData = await prisma.country.findUnique({ where: { id: +countryId } });
        const stateData = await prisma.state.findUnique({ where: { id: +stateId } });
        const createCity = cities.map(async (city) => {
            if (!city.name || !city.lgdCode || !city.shortname) {
                return { result: false, message: responseData.bulkImportReq };
            } else {
                const existingCity = await prisma.city.findFirst({
                    where: { name: city.name }
                });
                if (existingCity) {
                    const cityId = existingCity.id;
                    await prisma.city.update({
                        where: { id: cityId },
                        data: {
                            name: capitalizeFirstLetter(city.name),
                            shortname: city.shortname.toUpperCase(),
                            lgdCode: String(city.lgdCode),
                            countryId: +countryData.id,
                            country: capitalizeFirstLetter(countryData.name),
                            stateId: stateData.id,
                            state: capitalizeFirstLetter(stateData.name),
                            updatedUser: user.id
                        }
                    });
                } else {
                    await prisma.city.create({
                        data: {
                            name: capitalizeFirstLetter(city.name),
                            shortname: city.shortname.toUpperCase(),
                            lgdCode: String(city.lgdCode),
                            countryId: +countryData.id,
                            country: capitalizeFirstLetter(countryData.name),
                            stateId: stateData.id,
                            state: capitalizeFirstLetter(stateData.name),
                            createdUser: user.id
                        }
                    });
                }
            }
            return {
                result: true, message: responseData.districtUpdated

            };
        });
        const results = await Promise.all(createCity);
        const failedResult = results.find(result => result.result === false);
        if (failedResult) {
            return NextResponse.json(failedResult);
        }
        return NextResponse.json({ result: true, message: 'district uploaded successfully' });
    } catch (error) {
        return NextResponse.json({ result: false, message: 'Internal Server Error' });
    }
}
