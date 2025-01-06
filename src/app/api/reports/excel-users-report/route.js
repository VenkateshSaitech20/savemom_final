import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { extractTokenData } from '@/utils/helper';
import { responseData } from '@/utils/message';
import { utils, write } from 'xlsx'; // Import xlsx functions

const prisma = new PrismaClient();

export async function POST(req) {
    try {
        const token = extractTokenData(req.headers);
        const body = await req.json();
        const { type } = body;
        if (!token.id) {
            return NextResponse.json({ result: false, message: { invalidToken: responseData.invalidToken } });
        }
        let userId = token.id;
        const user = await prisma.user.findUnique({ where: { id: userId, isDeleted: "N" } });
        if (!user) {
            return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
        }
        if (user.roleId !== "1") {
            userId = user.createdBy;
        }
        const queryFilter = {
            AND: [
                { isDeleted: 'N' },
                { profileStatus: type },
                { id: { not: user.id } },
                { roleId: { not: "1" } }
            ]
        };
        if (user.roleId !== "1") {
            queryFilter.AND.push({ createdBy: userId });
        }
        const users = await prisma.user.findMany({
            where: queryFilter,
            select: {
                id: true,
                createdBy: true,
                name: true,
                email: true,
                contactNo: true,
                roleName: true,
                address: true,
                state: true,
                country: true,
            }
        });
        const worksheetData = [
            ['Name', 'Email', 'Phone Number', 'Role Name', 'Address', 'State', 'Country'],
            ...users.map(user => [
                user.name,
                user.email,
                user.contactNo,
                user.roleName,
                user.address,
                user.state,
                user.country
            ])
        ];
        const worksheet = utils.aoa_to_sheet(worksheetData);
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, 'Active Users');
        const excelBuffer = write(workbook, { type: 'buffer', bookType: 'xlsx' });
        return new NextResponse(excelBuffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename="active_users_report.xlsx"'
            }
        });
    } catch (error) {
        return NextResponse.json({ result: false, message: { roleError: error.message } });
    }
}
