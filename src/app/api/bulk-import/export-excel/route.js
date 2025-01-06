import { utils, write } from 'xlsx';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export async function POST(req) {
    try {
        const { fileType } = await req.json();
        const queryFilter = {
            AND: [
                { isDeleted: 'N' },
            ]
        };
        if (fileType === "users") {
            const worksheetData = [
                ['name', 'email', 'password', 'contactNo', 'country', 'companyName']
            ];
            const worksheet = utils.aoa_to_sheet(worksheetData);
            const workbook = utils.book_new();
            utils.book_append_sheet(workbook, worksheet, 'Users');
            const excelBuffer = write(workbook, { type: 'buffer', bookType: 'xlsx' });
            return new Response(excelBuffer, {
                headers: {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition': 'attachment; filename="users.xlsx"'
                }
            });
        } else if (fileType === "countries") {
            const countries = await prisma.country.findMany({
                where: queryFilter,
                select: {
                    id: true,
                    name: true,
                    shortname: true,
                    phoneCode: true,
                }
            });
            const worksheetData = [
                ['id', 'name', 'shortname', 'phoneCode'],
                ...countries.map(country => [
                    country.id,
                    country.name,
                    country.shortname,
                    country.phoneCode
                ])
            ];
            const worksheet = utils.aoa_to_sheet(worksheetData);
            const workbook = utils.book_new();
            utils.book_append_sheet(workbook, worksheet, 'Countries');
            const excelBuffer = write(workbook, { type: 'buffer', bookType: 'xlsx' });
            return new Response(excelBuffer, {
                headers: {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition': 'attachment; filename="countries.xlsx"'
                }
            });
        } else if (fileType === "states") {
            const states = await prisma.state.findMany({
                where: queryFilter,
                select: {
                    id: true,
                    lgdCode: true,
                    name: true,
                    countryId: true,
                    country: true,
                }
            });
            const worksheetData = [
                ['id', 'lgdCode', 'name', 'countryId', 'country'],
                ...states.map(state => [
                    state.id,
                    state.lgdCode,
                    state.name,
                    state.countryId,
                    state.country,
                ])
            ];
            const worksheet = utils.aoa_to_sheet(worksheetData);
            const workbook = utils.book_new();
            utils.book_append_sheet(workbook, worksheet, 'States');
            const excelBuffer = write(workbook, { type: 'buffer', bookType: 'xlsx' });
            return new Response(excelBuffer, {
                headers: {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition': 'attachment; filename="states.xlsx"'
                }
            });
        } else if (fileType === "districts") {
            const cities = await prisma.city.findMany({
                where: queryFilter,
                select: {
                    id: true,
                    name: true,
                    countryId: true,
                    country: true,
                    stateId: true,
                    state: true,
                }
            });
            const worksheetData = [
                ['id', 'name', 'lgdCode', 'shortname', 'countryId', 'country', 'stateId', 'state'],
                ...cities.map(city => [
                    city.id,
                    city.name,
                    city.countryId,
                    city.country,
                    city.stateId,
                    city.state
                ])
            ];
            const worksheet = utils.aoa_to_sheet(worksheetData);
            const workbook = utils.book_new();
            utils.book_append_sheet(workbook, worksheet, 'Cities');
            const excelBuffer = write(workbook, { type: 'buffer', bookType: 'xlsx' });
            return new Response(excelBuffer, {
                headers: {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition': 'attachment; filename="cities.xlsx"'
                }
            });
        } else {
            const districts = await prisma.district.findMany({
                where: queryFilter,
                select: {
                    id: true,
                    name: true,
                    countryId: true,
                    country: true,
                    stateId: true,
                    state: true,
                    cityId: true,
                    city: true,
                }
            });
            const worksheetData = [
                ['id', 'name', 'lgdCode', 'countryId', 'country', 'stateId', 'state', 'cityId', 'city'],
                ...districts.map(dist => [
                    dist.id,
                    dist.name,
                    dist.countryId,
                    dist.country,
                    dist.stateId,
                    dist.state,
                    dist.cityId,
                    dist.city,
                ])
            ];
            const worksheet = utils.aoa_to_sheet(worksheetData);
            const workbook = utils.book_new();
            utils.book_append_sheet(workbook, worksheet, 'Districts');
            const excelBuffer = write(workbook, { type: 'buffer', bookType: 'xlsx' });
            return new Response(excelBuffer, {
                headers: {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition': 'attachment; filename="districts.xlsx"'
                }
            });
        }
    } catch (error) {
        return new Response(JSON.stringify({ result: false, message: { roleError: error.message } }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
