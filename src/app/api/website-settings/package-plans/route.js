import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { registerData, responseData } from '@/utils/message';
import { extractTokenData } from '@/utils/helper';
import { deleteFields, deleteFile, getFilePathFromUrl, processFiles, validateFields } from '../../api-utlis/helper';
const prisma = new PrismaClient();

const uploadDir = `${process.env.MAIN_FOLDER_PATH}/${process.env.SUB_FOLDER_PATH}/${process.env.PRICING_IMAGE_FOLDER_PATH}`;
const urlDir = `${process.env.SUB_FOLDER_PATH}/${process.env.PRICING_IMAGE_FOLDER_PATH}`;
const baseDir = `${process.env.MAIN_FOLDER_PATH}`;

// Get all plans
export async function GET() {
    try {
        const pricingDetails = await prisma.package_plans.findMany({ where: { isDeleted: "N" }, orderBy: { monthlyPrice: 'asc' } });
        if (pricingDetails) {
            deleteFields(pricingDetails, ['createdAt', 'updatedAt']);
            return NextResponse.json({ result: true, message: pricingDetails });
        }
        return NextResponse.json({ result: true, message: {} });
    } catch (error) {
        return NextResponse.json({ result: false, error: error });
    }
};

// Add plan
export async function POST(req) {
    try {
        const discount = 25;
        let userId;
        let fields = {};
        const token = extractTokenData(req.headers);
        if (!token) {
            return NextResponse.json({ result: false, message: { tokenExpired: responseData.tokenExpired } });
        }
        const user = await prisma.user.findUnique({ where: { id: token.id, isDeleted: "N" } });
        if (!user) {
            return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
        }
        if (user?.id) { userId = user.id }
        const formData = await req.formData();

        for (const [key, value] of formData.entries()) {
            fields[key] = value;
        };
        const { title, subTitle, planBenefits } = fields;

        const emptyFieldErrors = {};
        if (!title || title?.trim() === "") {
            emptyFieldErrors.title = registerData.titleReq;
        }
        if (!subTitle || subTitle?.trim() === "") {
            emptyFieldErrors.subTitle = registerData.subTitleReq;
        }
        if (!fields.monthlyPrice || fields.monthlyPrice?.trim() === "") {
            emptyFieldErrors.monthlyPrice = registerData.monthlyPriceReq;
        }
        if (!planBenefits || planBenefits.length === 0) {
            emptyFieldErrors.planBenefits = registerData.planBenefitsReq;
        }
        if (Object.keys(emptyFieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: emptyFieldErrors });
        };
        const validatingFields = {
            title: { type: "name", message: registerData.titleFieldVal },
            subTitle: { type: "name", message: registerData.subTitleFieldVal },
            monthlyPrice: { type: "number", message: registerData.monthlyPriceFieldVal },
        };
        let fieldErrors = validateFields(fields, validatingFields);
        if (Object.keys(fieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: fieldErrors });
        };
        const image = formData.get('image');
        const files = { image };
        const { profileImageUrls, errors } = await processFiles(files, uploadDir, urlDir);
        if (Object.keys(errors).length > 0) {
            return NextResponse.json({ result: false, message: errors });
        };
        const monthlyPrice = parseFloat(fields.monthlyPrice);
        const discountMultiplier = 1 - (discount / 100);
        const discountedMonthlyPrice = (monthlyPrice * discountMultiplier).toFixed(2);
        const discountedAnnualPrice = (discountedMonthlyPrice * 12).toFixed(2);
        fields.yearlyPlan = JSON.stringify({
            monthly: discountedMonthlyPrice,
            annually: discountedAnnualPrice
        });
        const data = { ...fields, yearlyPlan: JSON.parse(fields.yearlyPlan), planBenefits: JSON.parse(fields.planBenefits), ...profileImageUrls }
        if (fields.id) {
            data.updatedUser = userId;
            const existingRec = await prisma.package_plans.findUnique({ where: { id: fields.id } });
            if (!existingRec) {
                return NextResponse.json({ result: false, message: { notFound: responseData.noData } })
            }
            const updatedPackage = await prisma.package_plans.update({ where: { id: existingRec.id }, data });

            const filteredFiles = Object.entries(files).filter(([key, file]) => file !== null);
            filteredFiles.map(async ([key, file]) => {
                if (file) {
                    const oldImageUrl = existingRec[key];
                    const oldFilePath = getFilePathFromUrl(oldImageUrl, baseDir);
                    try {
                        await deleteFile(oldFilePath);
                    } catch (error) {
                        console.error('Failed to delete old system image:', error);
                    }
                }
            })
            return NextResponse.json({ result: true, message: updatedPackage });
        } else {
            await prisma.package_plans.create({ data });
            return NextResponse.json({ result: true, message: responseData.dataCreateded });
        }
    } catch (error) {
        return NextResponse.json({ result: false, message: error });
    }
};

export async function PUT(req) {
    try {
        const token = extractTokenData(req.headers);
        if (!token.id) {
            return NextResponse.json({ result: false, message: { tokenExpired: responseData.tokenExpired } });
        }
        const user = await prisma.user.findUnique({ where: { id: token.id, isDeleted: "N" } });
        if (!user) {
            return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
        }
        const body = await req.json();
        const { id } = body;
        await prisma.package_plans.update({
            where: { id: id },
            data: { isDeleted: 'Y' }
        });
        return NextResponse.json({ result: true, message: responseData.packagePlanDeleted })
    } catch (error) {
        return NextResponse.json({ result: false, message: error });
    }
}
