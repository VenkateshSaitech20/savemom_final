import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { responseData } from '@/utils/message';
const prisma = new PrismaClient();

export async function POST(req) {
    try {
        const body = await req.json();
        const { userId } = body;
        const getUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!getUser) {
            return NextResponse.json({ result: false, message: responseData.userNotFound });
        }
        const roleId = getUser.roleId;
        const getRole = await prisma.role.findUnique({ where: { id: roleId } });
        const menus = await prisma.menus.findMany({});

        const filteredMenusByRoleId = (roleId, menus) => {
            if (roleId === "1") {
                return menus;
            } else {
                const permissions = getRole.permissions;
                if (!permissions) {
                    return [];
                }
                const filterMenusByPermissions = (menus, permissions) => {
                    return menus.filter(menuItem => {
                        const menuId = menuItem.menuId.toString();
                        return (
                            (permissions.hasRead && permissions.hasRead.includes(menuId)) ||
                            (permissions.hasWrite && permissions.hasWrite.includes(menuId)) ||
                            (permissions.hasEdit && permissions.hasEdit.includes(menuId)) ||
                            (permissions.hasDelete && permissions.hasDelete.includes(menuId))
                        );
                    });
                };
                const finalMenus = filterMenusByPermissions(menus, permissions);
                return finalMenus;
            }
        };
        const filteredMenus = filteredMenusByRoleId(roleId, menus);
        return NextResponse.json({ result: true, message: filteredMenus });
    } catch (error) {
        return NextResponse.json({ result: false, message: error.message });
    }
}
