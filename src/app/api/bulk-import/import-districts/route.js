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
            return NextResponse.json({
                result: false,
                message: { tokenExpired: responseData.tokenExpired },
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: token.id, isDeleted: "N" },
        });
        if (!user) {
            return NextResponse.json({
                result: false,
                message: { userNotFound: responseData.userNotFound },
            });
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
        const districts = xlsx.utils.sheet_to_json(sheet);

        const countryId = formData.get('countryId');
        const stateId = formData.get('stateId');
        const cityId = formData.get('cityId');

        const emptyFieldErrors = {};
        if (!countryId) {
            emptyFieldErrors.cityCountryId = registerData.countryNameReq;
        }
        if (!stateId) {
            emptyFieldErrors.cityStateId = registerData.stateNameReq;
        }
        if (!cityId) {
            emptyFieldErrors.cityDistrictId = registerData.districtNameReq;
        }
        if (Object.keys(emptyFieldErrors).length > 0) {
            return NextResponse.json({
                result: false,
                message: emptyFieldErrors,
            });
        }
        const countryData = await prisma.country.findUnique({ where: { id: +countryId } });
        const stateData = await prisma.state.findUnique({ where: { id: +stateId } });
        const cityData = await prisma.city.findUnique({ where: { id: +cityId } });
        if (!countryData || !stateData || !cityData) {
            return NextResponse.json({
                result: false,
                message: { cityErr: responseData.cityValidFieldErr },
            });
        }
        const createDistrictPromises = districts.map(async (district) => {
            if (!district.name || !district.lgdCode) {
                return { result: false, message: { cityErr: responseData.cityMissingFieldErr } };
            }
            const existingDist = await prisma.district.findFirst({
                where: { name: district.name },
            });

            if (existingDist) {
                const distId = existingDist.id;
                await prisma.district.update({
                    where: { id: distId },
                    data: {
                        name: capitalizeFirstLetter(district.name),
                        lgdCode: String(district.lgdCode),
                        countryId: +countryData.id,
                        country: capitalizeFirstLetter(countryData.name),
                        stateId: stateData.id,
                        state: capitalizeFirstLetter(stateData.name),
                        cityId: cityData.id,
                        city: capitalizeFirstLetter(cityData.name),
                    },
                });
            } else {
                await prisma.district.create({
                    data: {
                        name: capitalizeFirstLetter(district.name),
                        lgdCode: String(district.lgdCode),
                        countryId: +countryData.id,
                        country: capitalizeFirstLetter(countryData.name),
                        stateId: stateData.id,
                        state: capitalizeFirstLetter(stateData.name),
                        cityId: cityData.id,
                        city: capitalizeFirstLetter(cityData.name),
                        createdUser: user.id,
                    },
                });
            }

            return {
                result: true, message: responseData.cityUpdated
            };
        });
        const results = await Promise.all(createDistrictPromises);
        const failedResult = results.find((result) => result.result === false);
        if (failedResult) {
            return NextResponse.json(failedResult);
        }
        return NextResponse.json({ result: true, message: 'City uploaded successfully' });
    } catch (error) {
        console.error('Error in POST:', error.message);
        return NextResponse.json({ result: false, message: 'Internal Server Error' });
    }
}
