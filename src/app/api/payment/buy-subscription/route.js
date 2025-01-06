import { NextResponse } from 'next/server';
import Razorpay from "razorpay";
import { PrismaClient } from "@prisma/client";
import { extractTokenData } from '@/utils/helper';
import { responseData, validity } from '@/utils/message';
import axios from 'axios';
import uniqid from 'uniqid';
import sha256 from 'sha256';

const prisma = new PrismaClient();
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(req) {
    try {
        const token = extractTokenData(req.headers);
        if (!token.id) {
            return NextResponse.json({ result: false, message: { tokenExpired: responseData.tokenExpired } });
        }
        const user = await prisma.user.findUnique({ where: { id: token.id, isDeleted: "N" } });
        if (user === null) {
            return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
        }
        const { id, name, email, contactNo, } = user;
        const body = await req.json();
        const { currency, packagePlanId, packagePlanType } = body;
        const packagePlanDetail = await prisma.package_plans.findUnique({ where: { id: packagePlanId, isDeleted: "N" } });
        if (packagePlanDetail === null) {
            return NextResponse.json({ result: false, message: responseData.packageNotFound });
        }
        const { title, monthlyPrice, yearlyPlan, } = packagePlanDetail;
        const prices = { monthly: +monthlyPrice, annually: yearlyPlan.annually };
        const packageValidity = validity[packagePlanType] || 0;
        const currentDate = new Date();
        const expirationDate = new Date(currentDate);
        expirationDate.setDate(currentDate.getDate() + parseInt(packageValidity));
        const paymentConfigureDetails = await prisma.configure_subscription.findFirst({ where: { isActive: "Y" } });
        await delay(2000);
        if (/razorpay/i.exec(paymentConfigureDetails.name)) {
            const razorpay = new Razorpay({
                key_id: paymentConfigureDetails.publicKey,
                key_secret: paymentConfigureDetails.privateKey,
            });
            const options = {
                amount: prices[packagePlanType] * 100 || 0,
                currency,
                receipt: Math.random().toString(36).substring(7),
            };
            const order = await razorpay.orders.create(options);
            const data = {
                userId: id,
                name,
                email,
                contactNo,
                packageId: packagePlanDetail.id,
                packageName: title,
                packageValidity: validity[packagePlanType],
                expirayDate: expirationDate,
                paymentMethod: paymentConfigureDetails.name,
                isExpired: "N",
                amount: (prices[packagePlanType] || 0).toString(),
                currency,
                paymentStatus: "Pending",
                paymentId: order?.id,
            }
            await prisma.subscription_list.create({ data });
            return NextResponse.json({ result: true, message: data });
        }
        if (paymentConfigureDetails.name.match(/phonepe/i)) {
            const merchant_id = 'PGTESTPAYUAT86';
            const salt_key = "96434309-7796-489d-8924-ab56988a6076";
            const SALT_INDEX = 1;
            const merchantTransactionId = uniqid();
            const data = {
                merchantId: merchant_id,
                merchantTransactionId: merchantTransactionId,
                merchantUserId: "MUID123",
                // name: name,
                amount: prices[packagePlanType] * 100 || 0,
                redirectUrl: `http://localhost:3000/payment/verify/?id=${merchantTransactionId}`,
                redirectMode: 'REDIRECT',
                mobileNumber: contactNo,
                paymentInstrument: {
                    type: 'PAY_PAGE'
                }
            };
            let bufferObj = Buffer.from(JSON.stringify(data), "utf8");
            let base64EncodedPayload = bufferObj.toString("base64");
            let string = base64EncodedPayload + "/pg/v1/pay" + salt_key;
            let sha256_val = sha256(string);
            let xVerifyChecksum = sha256_val + "###" + SALT_INDEX;
            // const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay"
            const prod_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay"

            try {
                const response = await axios.post(
                    prod_URL,
                    { request: base64EncodedPayload },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "X-VERIFY": xVerifyChecksum,
                            accept: "application/json",
                        },
                    }
                );

                console.log("response->", response.data);
                return NextResponse.redirect(response.data.data.instrumentResponse.redirectInfo.url);

            } catch (error) {
                console.error("Error occurred:", error.response.data);
                return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
            }
        }
    } catch (error) {
        return NextResponse.json({ result: false, message: error });
    }
}
