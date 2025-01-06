import { extractTokenData } from "@/utils/helper";
import { responseData } from "@/utils/message";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// Get whats-app by userid
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
        let skip = (page - 1) * pageSize;
        const queryFilter = {
            AND: [
                { sentBy: userId },
                ...(searchText ? [
                    {
                        OR: [
                            { to: { contains: searchText } },
                            { message: { contains: searchText } }
                        ]
                    }
                ] : [])
            ]
        };
        const totalCount = await prisma.sent_whats_app.count({ where: queryFilter });
        if (skip >= totalCount) {
            skip = totalCount - pageSize;
        }
        if (skip < 0) skip = 0;
        const totalPages = Math.ceil(totalCount / pageSize);
        const whatsApp = await prisma.sent_whats_app.findMany({ where: queryFilter, skip, take: pageSize, orderBy: { id: 'desc' } });
        if (whatsApp) {
            return NextResponse.json({ result: true, message: whatsApp, totalPages });
        } else {
            return NextResponse.json({ result: true, message: responseData.noWhatsAppFound });
        }
    } catch (error) {
        return NextResponse.json({ result: false, message: { roleError: error } });
    }
}
