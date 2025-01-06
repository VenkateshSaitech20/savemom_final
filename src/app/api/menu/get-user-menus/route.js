import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { extractTokenData } from '@/utils/helper';
import { responseData } from '@/utils/message';
const prisma = new PrismaClient();

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
        const getUserMenus = await prisma.menus.findMany({});
        getUserMenus.sort((a, b) => a.sequence - b.sequence);
        const adminApprovalId = user.adminApprovalId;
        if (adminApprovalId === "1") {
            return NextResponse.json({ result: true, message: getUserMenus });
        }
        else if (adminApprovalId == "2") {
            const isSubUser = user.id !== user.createdBy;
            const adminUser = await prisma.user.findUnique({ where: { id: user.createdBy, isDeleted: 'N' } });
            const role = await prisma.role.findUnique({ where: { id: isSubUser ? adminUser.roleId : user.roleId, isDeleted: "N" } });
            if (!role) {
                return NextResponse.json({ result: false, message: responseData.notFound });
            };
            const currentPermissions = role.permissions;
            const filteredMenus = getUserMenus.filter(menu => {
                const menuId = menu.menuId;
                const hasRead = currentPermissions.hasRead.includes(menuId);
                const hasWrite = currentPermissions.hasWrite.includes(menuId);
                const hasEdit = currentPermissions.hasEdit.includes(menuId);
                const hasDelete = currentPermissions.hasDelete.includes(menuId);
                return hasRead || hasWrite || hasEdit || hasDelete;
            });
            return NextResponse.json({ result: true, message: filteredMenus });
        } else {
            return NextResponse.json({ result: false, message: responseData.roleAccessRestrict });
        }
    } catch (error) {
        return NextResponse.json({ result: false, message: error });
    }
}    
