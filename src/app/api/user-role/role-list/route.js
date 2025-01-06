import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { extractTokenData } from '@/utils/helper';
import { responseData } from '@/utils/message';
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
        }
        const getUser = await prisma.user.findUnique({ where: { id: userId } });
        if (getUser.roleId !== "1") {
            userId = getUser.createdBy
        }
        const getUsers = await prisma.user.findMany({
            where: { createdBy: userId, isDeleted: "N" },
        });
        const roles = await prisma.role.findMany({
            where: { userId, isDeleted: "N" }
        });
        const roleMap = {};
        roles.forEach(role => {
            roleMap[role.id] = {
                id: role.id,
                roleName: role.roleName,
                avatars: [],
                totalUsers: 0
            };
        });
        getUsers.forEach(user => {
            const role = roleMap[user.roleId];
            if (role) {
                // role.avatars.push(`${user.name.toLowerCase()}.png`);
                role.totalUsers += 1;
            }
        });
        const transformedData = Object.values(roleMap).map(role => ({
            id: role.id,
            title: role.roleName,
            totalUsers: role.totalUsers,
            avatars: role.avatars
        }));
        return NextResponse.json({ result: true, message: transformedData });
    } catch (error) {
        return NextResponse.json({ result: false, message: error.message });
    }
};
