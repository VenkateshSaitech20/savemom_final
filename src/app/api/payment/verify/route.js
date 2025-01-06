import { NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client";
import { extractTokenData } from '@/utils/helper';
const prisma = new PrismaClient();
import crypto from 'crypto';
import { responseData } from '@/utils/message';

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
        const keySecret = await prisma.configure_subscription.findFirst({
            where: { name: { contains: "razorpay" }, isActive: "Y" }
        });
        if (keySecret === null) {
            return NextResponse.json({ result: false, message: { secretKey: "Secret key not found" } })
        }
        const generatedSignature = async (razorpayOrderId, razorpayPaymentId) => {
            const sig = crypto
                .createHmac('sha256', keySecret.privateKey)
                .update(razorpayOrderId + '|' + razorpayPaymentId)
                .digest('hex');
            return sig;
        };
        const body = await req.json();
        const paymentConfigureDetails = await prisma.configure_subscription.findFirst({ where: { isActive: "Y" } });
        const { orderCreationId, razorpayPaymentId, razorpaySignature, id } = body;
        const isAllreadyPurchased = user.roleId !== "1" && user.id === user.createdBy && user.paymentId !== "" && user.paymentStatus === "Completed";
        const adminApprovalId = (user.adminApprovalId === "3" && !isAllreadyPurchased) ? "4" : "2";
        const getPlanDetail = await prisma.package_plans.findUnique({ where: { id: id } });
        if (paymentConfigureDetails.name.match(/razorpay/i)) {
            const signature = await generatedSignature(orderCreationId, razorpayPaymentId);
            if (signature !== razorpaySignature) {
                return NextResponse.json({ result: false, message: responseData.paymentVerifyFailed });
            }
            await prisma.subscription_list.updateMany({
                where: { paymentId: orderCreationId },
                data: { paymentStatus: 'Completed' }
            });
            const { packageId, packageName, packageValidity, expirayDate, paymentMethod, isExpired, amount, paymentStatus, paymentId, currency } = await prisma.subscription_list.findFirst({ where: { paymentId: orderCreationId } });
            const data = { packageId, packageName, packageValidity, expirayDate, paymentMethod, isExpired, amount, paymentStatus, paymentId, currency, roleId: getPlanDetail.roleId, roleName: getPlanDetail.roleName, adminApprovalId };
            await prisma.user.update({ where: { id: user.id }, data: data });
            if (isAllreadyPurchased) {
                await prisma.user.updateMany({ where: { createdBy: user.id }, data: { adminApprovalId: adminApprovalId, isExpired: "N" } });
            }
            delete data.roleId;
            delete data.roleName;
            const getSubscriptionRole = await prisma.role.findUnique({ where: { id: getPlanDetail.roleId } });
            const subscribedMenu = getSubscriptionRole.permissions;
            const subusers = await prisma.user.findMany({ where: { createdBy: user.id }, select: { roleId: true } });
            const updatePromises = subusers.map(async (subuser) => {
                const role = await prisma.role.findUnique({ where: { id: subuser.roleId }, select: { permissions: true } });
                const updatedPermissions = {
                    hasRead: role.permissions.hasRead.filter(menuId => subscribedMenu.hasRead.includes(menuId)),
                    hasWrite: role.permissions.hasWrite.filter(menuId => subscribedMenu.hasWrite.includes(menuId)),
                    hasEdit: role.permissions.hasEdit.filter(menuId => subscribedMenu.hasEdit.includes(menuId)),
                    hasDelete: role.permissions.hasDelete.filter(menuId => subscribedMenu.hasDelete.includes(menuId)),
                };
                return prisma.role.update({
                    where: { id: subuser.roleId },
                    data: { permissions: updatedPermissions },
                });
            });
            await Promise.all(updatePromises);
            return NextResponse.json({ result: true, message: responseData.paymentVerifySuccess });
        } else if (paymentConfigureDetails.name.match(/phonepe/i)) {
            const merchantTransactionId = req.query.id;
            const merchantId = "PGTESTPAYUAT";
            const salt_key = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
            const keyIndex = 1;
            const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + salt_key;
            const sha256 = crypto.createHash('sha256').update(string).digest('hex');
            const checksum = sha256 + "###" + keyIndex;

            const options = {
                method: 'GET',
                url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${merchantTransactionId}`,
                headers: {
                    accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-VERIFY': checksum,
                    'X-MERCHANT-ID': `${merchantId}`
                }
            };

            // CHECK PAYMENT TATUS
            axios.request(options).then(async (response) => {
                if (response.data.success === true) {
                    const url = `http://localhost:3000/success`
                    return res.redirect(url)
                } else {
                    const url = `http://localhost:3000/failure`
                    return res.redirect(url)
                }
            })
                .catch((error) => {
                    console.error(error);
                });
        }

    } catch (error) {
        return NextResponse.json({ result: false, message: error })
    }
};
