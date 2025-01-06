import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { extractTokenData } from '@/utils/helper';
import { responseData } from '@/utils/message';
const prisma = new PrismaClient();

export async function POST(req) {
    try {
        const token = extractTokenData(req.headers);
        const body = await req.json();
        let { searchText, page, pageSize } = body;
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
                { isDeleted: 'N' },
                ...(searchText ? [{
                    OR: [
                        { title: { contains: searchText } },
                        { subTitle: { contains: searchText } },
                        // { postedBy: { contains: searchText } },
                        // { designation: { contains: searchText } },
                    ]
                }] : [])
            ]
        };

        let skip = (page - 1) * pageSize;
        const totalCount = await prisma.package_plans.count({
            where: queryFilter
        });
        if (skip >= totalCount) {
            skip = totalCount - pageSize;
        }
        if (skip < 0) skip = 0;
        const totalPages = Math.ceil(totalCount / pageSize);
        const users = await prisma.package_plans.findMany({
            where: queryFilter,
            select: {
                id: true,
                image: true,
                title: true,
                subTitle: true,
                monthlyPrice: true,
                yearlyPlan: true,
                popularPlan: true,
                planBenefits: true,
            },
            skip,
            take: pageSize
        });
        return NextResponse.json({ result: true, message: users, totalPages });
    } catch (error) {
        return NextResponse.json({ result: false, message: { roleError: error } });
    }
}


