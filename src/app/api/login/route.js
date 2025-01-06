import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { registerData, responseData } from '@/utils/message';
import jwt from 'jsonwebtoken';
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

const secret = process.env.JWT_SECRET || 'Savemom-Admin';

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password, deviceToken } = body;
    const user = await prisma.user.findFirst({ where: { email: email, isDeleted: "N" } });
    if (!user) {
      return NextResponse.json({ result: false, message: { message: responseData.userNotFound } });
    };
    if (user) {
      if (user.profileStatus === "Pending" || user.profileStatus === "pending") {
        return NextResponse.json({ result: false, message: { message: registerData.accountPendingMsg } });
      }
      if (user.profileStatus === "Inactive" || user.profileStatus === "inactive") {
        return NextResponse.json({ result: false, message: { message: registerData.accountInactiveMsg } });
      };
      if (password) {
        const isPasswordvalid = await bcrypt.compare(password, user.password);
        if (isPasswordvalid) {
          let userDetail = {
            id: user.id,
            name: user.name,
            email: user.email,
            roleId: user.roleId,
            createdBy: user.createdBy,
            subscriptionPlan: user.subscriptionPlan
          }
          const token = jwt.sign({ userDetail }, secret, { expiresIn: '30d' });
          await prisma.user.update({ where: { id: user.id, isDeleted: "N" }, data: { deviceToken } });
          return NextResponse.json({ result: true, message: { message: "Loggedin successfully", token: token } });
        } else {
          return NextResponse.json({ result: false, message: { message: responseData.invalidCredentials } });
        }
      };
    }
  } catch (error) {
    return NextResponse.json({ result: false, message: error });
  }
}
