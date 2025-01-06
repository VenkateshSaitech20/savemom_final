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
        const states = xlsx.utils.sheet_to_json(sheet);
        const countryId = formData.get('countryId');
        if (!countryId) {
            return NextResponse.json({ result: false, message: registerData.countryNameReq });
        }
        const countryData = await prisma.country.findUnique({ where: { id: parseInt(countryId) } })
        const createState = states.map(async (state) => {
            if (!state.name || !state.lgdCode) {
                return { result: false, message: registerData.bulkImportReq };
            } else {
                const existingState = await prisma.state.findFirst({
                    where: { name: state.name }
                });
                if (existingState) {
                    const sid = existingState.id;
                    await prisma.state.update({
                        where: { id: sid },
                        data: {
                            name: capitalizeFirstLetter(state.name),
                            lgdCode: String(state.lgdCode),
                            countryId: countryData.id,
                            country: capitalizeFirstLetter(countryData.name),
                            updatedUser: user.id
                        },
                    });
                } else {
                    await prisma.state.create({
                        data: {
                            name: capitalizeFirstLetter(state.name),
                            lgdCode: String(state.lgdCode),
                            countryId: countryData.id,
                            country: capitalizeFirstLetter(countryData.name),
                            createdUser: user.id
                        },
                    });
                }
            }
            return { result: true, message: 'States uploaded successfully' };
        });
        const results = await Promise.all(createState);
        const failedResult = results.find(result => result.result === false);
        if (failedResult) {
            return NextResponse.json(failedResult);
        }
        return NextResponse.json({ result: true, message: 'States uploaded successfully' });
    } catch (error) {
        console.error('Error in POST:', error.message);
        return NextResponse.json({ result: false, message: 'Internal Server Error' });
    }
}
