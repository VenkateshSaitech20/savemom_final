import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { extractTokenData, getDate } from '@/utils/helper';
import { responseData } from '@/utils/message';
import { utils, write } from 'xlsx';

const prisma = new PrismaClient();

export async function POST(req) {
    try {
        const token = extractTokenData(req.headers);
        const body = await req.json();
        let { searchText } = body;
        if (!token.id) {
            return NextResponse.json({ result: false, message: { invalidToken: responseData.invalidToken } });
        };
        let userId = token.id;
        const user = await prisma.user.findUnique({ where: { id: userId, isDeleted: "N" } });
        if (!user) {
            return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
        }
        const queryFilter = {
            AND: [
                ...(searchText ? [{
                    OR: [
                        { name: { contains: searchText } },
                        { email: { contains: searchText } },
                        { contactNo: { contains: searchText } },
                        { packageName: { contains: searchText } },
                        { paymentMethod: { contains: searchText } },
                        { paymentStatus: { contains: searchText } },
                        { currency: { contains: searchText } },
                        { paymentId: { contains: searchText } },
                        { packageValidity: { contains: searchText } },
                        { amount: { contains: searchText } },
                    ]
                }] : [])
            ]
        };
        const subscriptionHistory = await prisma.subscription_list.findMany({ where: queryFilter });
        const worksheetData = [
            ['Name', 'Email', 'Phone Number', 'Price', 'Package Name', "Payment Id", 'Payment Method', 'Payment Status', 'Purchase Date', 'Expiray Date', 'Validity', 'Currency'],
            ...subscriptionHistory.map(item => [
                item.name,
                item.email,
                item.contactNo,
                item.amount,
                item.packageName,
                item.paymentId,
                item.paymentMethod,
                item.paymentStatus,
                getDate(item.purchaseDate),
                getDate(item.expirayDate),
                item.packageValidity,
                item.currency,
            ])
        ];
        const worksheet = utils.aoa_to_sheet(worksheetData);
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, 'Subscription History');
        const excelBuffer = write(workbook, { type: 'buffer', bookType: 'xlsx' });
        return new NextResponse(excelBuffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename="subscription_history_report.xlsx"'
            }
        });
    } catch (error) {
        return NextResponse.json({ result: false, message: error });
    }
};

