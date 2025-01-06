import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { responseData } from '@/utils/message';
import { generateSlug } from '@/utils/helper';
const prisma = new PrismaClient();

export async function POST(req) {
    try {
        const body = await req.json();
        const { menuId, menu, subMenu, path, permission, sequence } = body;
        const slugName = generateSlug(subMenu);
        const existingMenu = await prisma.menus.findFirst({
            where: { subMenu }
        });
        if (existingMenu) {
            return NextResponse.json({ result: false, message: responseData.menuExists });
        }
        await prisma.menus.create({
            data: { menuId, menu, subMenu, path, slugName, permission, sequence }
        });
        return NextResponse.json({ result: true, message: responseData.menuAdded });
    } catch (error) {
        console.log("error:", error);
        return NextResponse.json({ result: false, message: error });
    }
};    
