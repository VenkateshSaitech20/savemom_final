import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import Razorpay from 'razorpay';
import { registerData, responseData } from '@/utils/message';
import { extractTokenData } from '@/utils/helper';
// import { deleteFields, deleteFile, getFilePathFromUrl, processFiles, validateFields } from '../../api-utlis/helper';
const prisma = new PrismaClient();


export async function POST(req) {
    try {
        let userId;
        const token = extractTokenData(req.headers);
        if (!token) {
            return NextResponse.json({ result: false, message: { tokenExpired: responseData.tokenExpired } });
        }
        const user = await prisma.user.findUnique({ where: { id: token.id, isDeleted: "N" } });
        if (!user) {
            return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
        }
        if (user?.id) { userId = user.id }
        const body = await req.json();
        const { packagePlanId } = body;
        const packageDeatils = await prisma.package_plans.findUnique({ where: { id: packagePlanId, isDeleted: "N" } });
        let price = parseInt(packageDeatils.price)
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_API_KEY,
            key_secret: process.env.RAZORPAY_API_KEY,
        });
        const options = {
            amount: price,
            currency: 'INR',
            receipt: `receipt_order_${Math.random()}`,
            payment_capture: 1,
        };

        const order = await razorpay.orders.create(options);
        await prisma.subscription_details.create({
            data: {
                amount: price,
                status: 'pending',
                razorpayId: order.id,
                packagePlanId: packagePlanId,
            },
        });
        // return NextResponse.json({ result: true, message: packageDeatils });
        return NextResponse.json({ result: true, message: "Payment done" });

    } catch (error) {
        return NextResponse.json({ result: false, message: error });
    }
}
