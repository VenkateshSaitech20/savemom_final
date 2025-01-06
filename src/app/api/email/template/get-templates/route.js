import { NextResponse } from "next/server";
import { responseData } from "@/utils/message";
import { PrismaClient } from "@prisma/client";
import { extractTokenData } from "@/utils/helper";

const prisma = new PrismaClient();

// Get Templates
export async function POST(req) {
    try {
        const token = extractTokenData(req.headers);
        if (!token.id) {
            return NextResponse.json({ result: false, message: { tokenExpired: responseData.tokenExpired } });
        }
        const user = await prisma.user.findUnique({ where: { id: token.id, isDeleted: "N" } });
        if (!user) {
            return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
        }
        let userId = token.id;
        const body = await req.json();
        const { searchText, page, pageSize } = body;
        if (page && pageSize) {
            let skip = (page - 1) * pageSize;
            const queryFilter = {
                AND: [
                    { createdBy: userId },
                    { isDeleted: 'N' },
                    ...(searchText ? [
                        {
                            OR: [
                                { category: { contains: searchText } },
                                { message: { contains: searchText } }
                            ]
                        }
                    ] : [])
                ]
            };
            const totalCount = await prisma.email_templates.count({ where: queryFilter });
            if (skip >= totalCount) {
                skip = totalCount - pageSize
            }
            if (skip < 0) skip = 0
            const totalPages = Math.ceil(totalCount / pageSize);
            const templates = await prisma.email_templates.findMany({ where: queryFilter, skip, take: pageSize, orderBy: { id: 'desc' } });
            if (templates) {
                return NextResponse.json({ result: true, message: templates, totalPages });
            } else {
                return NextResponse.json({ result: true, message: responseData.notFound });
            }
        } else {
            // For dropdown list
            const templates = await prisma.email_templates.findMany({
                where: {
                    createdBy: userId,
                    isDeleted: 'N',
                    isActive: 'Y'
                },
                orderBy: {
                    id: 'desc',
                },
                select: {
                    id: true,
                    category: true,
                    slugCategory: true,
                    message: true,
                },
            });
            if (templates) {
                return NextResponse.json({ result: true, message: templates });
            } else {
                return NextResponse.json({ result: true, message: responseData.notFound });
            }
        }
    }
    catch (error) {
        return NextResponse.json({ result: false, message: error });
    }
}
