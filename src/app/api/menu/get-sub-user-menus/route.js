import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { responseData } from '@/utils/message';
import { extractTokenData } from '@/utils/helper';
const prisma = new PrismaClient();

export async function POST(req) {
    try {
        const token = extractTokenData(req.headers);
        if (!token.id) {
            return NextResponse.json({ result: false, message: { invalidToken: responseData.invalidToken } });
        };
        let userId = token.id;
        const user = await prisma.user.findUnique({ where: { id: userId, isDeleted: "N" } });
        if (!user) {
            return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
        };
        const getUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!getUser) {
            return NextResponse.json({ result: false, message: responseData.userNotFound });
        }
        const roleId = getUser.roleId;
        const adminApprovalId = getUser.adminApprovalId;
        const getRole = await prisma.role.findUnique({ where: { id: roleId } });
        const menus = await prisma.menus.findMany({});
        //for guest user
        const customerMenus = await prisma.menus.findMany({
            where: {
                subMenu: {
                    in: ['Dashboard', 'Account Settings', 'My Plan']
                }
            }
        });

        const filteredMenusByRoleId = (roleId, menus) => {
            if (roleId === "1") {
                return menus;
            } else if (roleId === "3" || (adminApprovalId === '3' || adminApprovalId === '4')) {
                return customerMenus;
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
        // const fieldsToRemove = ['createdAt', 'slugName'];
        // deleteFields(filteredMenus, fieldsToRemove);
        // // deleteFields(filteredMenus, ['createdAt', 'updatedAt', 'slugName']);
        return NextResponse.json({ result: true, message: filteredMenus });
    } catch (error) {
        return NextResponse.json({ result: false, message: error.message });
    }
}
