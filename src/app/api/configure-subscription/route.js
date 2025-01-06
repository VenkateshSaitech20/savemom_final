import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { registerData, responseData } from '@/utils/message';
import { extractTokenData } from '@/utils/helper';
import { deleteFields, validateFields } from '../api-utlis/helper';
const prisma = new PrismaClient();

export async function GET(req) {
    try {
        const token = extractTokenData(req.headers);
        if (!token.id) {
            return NextResponse.json({ result: false, message: { tokenExpired: responseData.tokenExpired } });
        }
        const user = await prisma.user.findUnique({ where: { id: token.id, isDeleted: "N" } });
        if (!user.id) {
            return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
        }
        const paymentGatewayDetails = await prisma.configure_subscription.findMany();
        if (paymentGatewayDetails) {
            deleteFields(paymentGatewayDetails, ['createdAt', 'updatedAt', 'updatedUser']);
            return NextResponse.json({ result: true, message: paymentGatewayDetails });
        }
        return NextResponse.json({ result: true, message: paymentGatewayDetails });
    } catch (error) {
        return NextResponse.json({ result: false, message: error });
    }
};

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
        const body = await req.json();
        let { name, publicKey, privateKey, type, id } = body;
        const emptyFieldErrors = {};
        if (name.trim() === "") {
            emptyFieldErrors.name = registerData.nameReq;
        }
        if (publicKey.trim() === "") {
            emptyFieldErrors.publicKey = registerData.publicKeyReq;
        }
        if (privateKey.trim() === "") {
            emptyFieldErrors.privateKey = registerData.privateKeyReq;
        }
        if (type.trim() === "") {
            emptyFieldErrors.type = registerData.typeReq;
        }
        if (Object.keys(emptyFieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: emptyFieldErrors });
        };
        const fields = { name, publicKey, privateKey, type };
        const validatingFields = {
            name: { type: "name", message: registerData.nameFieldVal },
            type: { type: "name", message: registerData.typeFieldVal },
        };
        let fieldErrors = validateFields(fields, validatingFields);
        if (Object.keys(fieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: fieldErrors });
        };
        const data = { name, publicKey, privateKey, type };
        const paymentGatewayCount = await prisma.configure_subscription.count();
        if (paymentGatewayCount < 1) { data.isActive = "Y" }
        if (id) {
            data.updatedUser = user.id;
            const updatedDetails = await prisma.configure_subscription.update({ where: { id }, data })
            return NextResponse.json({ result: true, message: updatedDetails });
        }
        await prisma.configure_subscription.create({ data: { ...data, createdUser: user.id } });
        return NextResponse.json({ result: true, message: responseData.dataCreateded });
    } catch (error) {
        return NextResponse.json({ result: false, message: error });
    }
}

export async function PUT(req) {
    try {
        const token = extractTokenData(req.headers);
        if (!token.id) {
            return NextResponse.json({ result: false, message: { tokenExpired: responseData.tokenExpired } });
        }
        const user = await prisma.user.findUnique({ where: { id: token.id, isDeleted: "N" } });
        if (!user.id) {
            return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
        }
        const body = await req.json();
        const { id } = body;
        if (!id) {
            return NextResponse.json({ result: false, message: responseData.notFound })
        }
        const data = { isActive: "Y", updatedUser: user.id };
        await prisma.configure_subscription.update({ where: { id }, data });
        await prisma.configure_subscription.updateMany({
            where: {
                id: { not: id },
                isActive: "Y"
            },
            data: { isActive: "N" }
        });
        return NextResponse.json({ result: true, message: responseData.statusChanged })
    } catch (error) {
        return NextResponse.json({ result: false, message: error });
    }
}

export async function DELETE(req) {
    try {
        const token = extractTokenData(req.headers);
        if (!token.id) {
            return NextResponse.json({ result: false, message: { tokenExpired: responseData.tokenExpired } });
        }
        const user = await prisma.user.findUnique({ where: { id: token.id, isDeleted: "N" } });
        if (!user.id) {
            return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
        }
        const body = await req.json();
        const { id } = body;
        if (!id) {
            return NextResponse.json({ result: false, message: responseData.notFound })
        }
        const paymentGatewayDetail = await prisma.configure_subscription.findUnique({ where: { id: id } });
        const getAllpaymentDetail = await prisma.configure_subscription.findMany();
        if (paymentGatewayDetail.isActive === "Y" || getAllpaymentDetail.length < 1) {
            return NextResponse.json({ result: false, message: { delError: registerData.paymentgatewayMsg } })
        }
        await prisma.configure_subscription.delete({ where: { id } });
        return NextResponse.json({ result: true, message: responseData.delSuccess })
    } catch (error) {
        return NextResponse.json({ result: false, message: error })
    }
}
