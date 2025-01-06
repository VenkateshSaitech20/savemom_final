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
        console.log(user);
        
        if (!user.id) {
            return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
        }
        const formData = await req.formData();
        const file = formData.get('file');
        console.log(file);
        
        if (!file) {
            return NextResponse.json({ result: false, message: 'No file uploaded' });
        }
        const buffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(buffer);
        const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const countries = xlsx.utils.sheet_to_json(sheet);
        const createCountry = countries.map(async (country) => {
            if (!country.name || !country.shortname || !country.phoneCode) {
                return { result: false, message: registerData.bulkImportReq };
            } else {
                const existingCountry = await prisma.country.findFirst({
                    where: { name: country.name }
                });
                if (existingCountry) {
                    const cid = existingCountry.id;
                    await prisma.country.update({
                        where: { id: cid },
                        data: {
                            name: capitalizeFirstLetter(country.name),
                            shortname: country.shortname.toUpperCase(),
                            phoneCode: String(country.phoneCode),
                            updatedUser: user.id
                        }
                    });
                } else {
                    await prisma.country.create({
                        data: {
                            name: capitalizeFirstLetter(country.name),
                            shortname: country.shortname.toUpperCase(),
                            phoneCode: String(country.phoneCode),
                            createdUser: user.id
                        },
                    });
                }
            }
            return { result: true, message: responseData.countryUpdated };
        });
        const results = await Promise.all(createCountry);
        const failedResult = results.find(result => result.result === false);
        if (failedResult) {
            return NextResponse.json(failedResult);
        }
        return NextResponse.json({ result: true, message: responseData.countryUpdated });
    } catch (error) {
        console.error('Error in POST:', error.message);
        return NextResponse.json({ result: false, message: 'Internal Server Error' });
    }
}

// import { PrismaClient } from '@prisma/client';
// import { NextResponse } from 'next/server';
// import * as xlsx from 'xlsx';
// import { capitalizeFirstLetter, extractTokenData } from '@/utils/helper';
// import { registerData, responseData } from '@/utils/message';

// const prisma = new PrismaClient();
// export const config = {
//     api: {
//         bodyParser: false,
//     },
// };

// export async function POST(req) {
//     try {
//         const token = extractTokenData(req.headers);
//         if (!token.id) {
//             return NextResponse.json({ result: false, message: { tokenExpired: responseData.tokenExpired } });
//         }

//         const user = await prisma.user.findUnique({ where: { id: token.id, isDeleted: "N" } });
//         if (!user) {
//             return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
//         }

//         const formData = await req.formData();
//         const file = formData.get('file');

//         if (!file || !file.type.startsWith('application/vnd.openxmlformats-officedocument')) {
//             return NextResponse.json({ result: false, message: 'Invalid file type' });
//         }

//         const buffer = await file.arrayBuffer();
//         const fileBuffer = Buffer.from(buffer);
//         const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
//         const sheetName = workbook.SheetNames[0];
//         const sheet = workbook.Sheets[sheetName];
//         const countries = xlsx.utils.sheet_to_json(sheet);

//         const createCountry = countries.map(async (country) => {
//             if (!country.name || !country.shortname || !country.phoneCode) {
//                 return { result: false, message: registerData.bulkImportReq };
//             } else {
//                 const existingCountry = await prisma.country.findFirst({
//                     where: { name: country.name }
//                 });
//                 if (existingCountry) {
//                     await prisma.country.update({
//                         where: { id: existingCountry.id },
//                         data: {
//                             name: capitalizeFirstLetter(country.name),
//                             shortname: country.shortname.toUpperCase(),
//                             phoneCode: String(country.phoneCode),
//                             updatedUser: user.id
//                         }
//                     });
//                 } else {
//                     await prisma.country.create({
//                         data: {
//                             name: capitalizeFirstLetter(country.name),
//                             shortname: country.shortname.toUpperCase(),
//                             phoneCode: String(country.phoneCode),
//                             createdUser: user.id
//                         },
//                     });
//                 }
//             }
//             return { result: true, message: responseData.countryUpdated };
//         });

//         const results = await Promise.all(createCountry);
//         const failedResult = results.find(result => result.result === false);
//         if (failedResult) {
//             return NextResponse.json(failedResult);
//         }

//         return NextResponse.json({ result: true, message: responseData.countryUpdated });
//     } catch (error) {
//         console.error('Error in POST:', error);  // Log full error for debugging
//         return NextResponse.json({ result: false, message: 'Internal Server Error' });
//     }
// }

