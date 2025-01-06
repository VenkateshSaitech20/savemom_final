import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { registerData, responseData } from '@/utils/message';
import { extractTokenData } from '@/utils/helper';
import { deleteFields, deleteFile, getFilePathFromUrl, processFiles, validateFields } from '../api-utlis/helper';
const prisma = new PrismaClient();

const uploadDir = `${process.env.MAIN_FOLDER_PATH}/${process.env.LANDING_PAGE_FOLDER_PATH}/${process.env.PRICING_IMAGE_FOLDER_PATH}`;
const urlDir = `${process.env.LANDING_PAGE_FOLDER_PATH}/${process.env.PRICING_IMAGE_FOLDER_PATH}`;
const baseDir = `${process.env.MAIN_FOLDER_PATH}`;

// Get all plans
export async function GET() {
    try {
        const token = extractTokenData(req.headers);
        if (!token) {
            return NextResponse.json({ result: false, message: { tokenExpired: responseData.tokenExpired } });
        }
        const user = await prisma.user.findUnique({ where: { id: token.id, isDeleted: "N" } });
        if (!user) {
            return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
        }
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
        const { title, subTitle, planBenefits, id, roleId, roleName } = fields;

        const emptyFieldErrors = {};
        if (!title || title?.trim() === "") {
            emptyFieldErrors.title = registerData.titleReq;
        }
        if (!subTitle || subTitle?.trim() === "") {
            emptyFieldErrors.subTitle = registerData.subTitleReq;
        }
        if (!roleName || roleName?.trim() === "") {
            emptyFieldErrors.roleName = registerData.roleNameReq;
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
            roleName: { type: "name", message: registerData.roleFieldVal },
            monthlyPrice: { type: "number", message: registerData.monthlyPriceFieldVal },
        };
        let fieldErrors = validateFields(fields, validatingFields);
        if (Object.keys(fieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: fieldErrors });
        };

        let existsErrors = {};
        const existsTitle = await prisma.package_plans.findFirst({ where: { id: { not: id }, title: title, isDeleted: "N" } });
        if (existsTitle && existsTitle != "") {
            existsErrors.title = responseData.titleExists;
        }
        if (Object.keys(existsErrors).length > 0) {
            return NextResponse.json({ result: false, message: existsErrors });
        }
        const image = formData.get('image');
        const files = { image };
        const { profileImageUrls, errors } = await processFiles(files, uploadDir, urlDir);
        if (Object.keys(errors).length > 0) {
            return NextResponse.json({ result: false, message: errors });
        };
        let planDiscount = await prisma.section_content.findFirst({ where: { sectionType: 'plans' } });
        const discount = planDiscount?.discount ? parseInt(planDiscount.discount, 10) : 0;
        const monthlyPrice = parseFloat(fields.monthlyPrice);
        const discountMultiplier = 1 - (discount / 100);
        const discountedMonthlyPrice = monthlyPrice * discountMultiplier;
        const discountedAnnualPrice = discountedMonthlyPrice * 12;
        fields.yearlyPlan = JSON.stringify({
            monthly: Math.round(discountedMonthlyPrice),
            annually: Math.round(discountedAnnualPrice)
        });
        const data = { ...fields, yearlyPlan: JSON.parse(fields.yearlyPlan), planBenefits: JSON.parse(fields.planBenefits), ...profileImageUrls }
        if (fields.id) {
            data.updatedUser = userId;
            const existingRec = await prisma.package_plans.findUnique({ where: { id: fields.id } });
            if (!existingRec) {
                return NextResponse.json({ result: false, message: { notFound: responseData.noData } })
            }
            await prisma.role.update({ where: { id: existingRec.roleId }, data: { isAssigned: "N" } });
            await prisma.role.update({ where: { id: roleId }, data: { isAssigned: "Y" } });
            const updatedPackage = await prisma.package_plans.update({ where: { id: existingRec.id }, data });

            const filteredFiles = Object.entries(files).filter(([key, file]) => file !== null);
            filteredFiles.forEach(async ([key, file]) => {
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
            data.createdUser = userId;
            await prisma.package_plans.create({ data });
            await prisma.role.update({ where: { id: roleId }, data: { isAssigned: "Y" } });
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
        if (!id) {
            return NextResponse.json({ result: false, message: registerData.idReq })
        }
        const assignedUser = await prisma.user.findMany({ where: { packageId: id, isDeleted: 'N' } });
        if (assignedUser.length > 0) {
            return NextResponse.json({ result: false, message: { delError: responseData.planDelmsg } });
        } else {
            const packagePlan = await prisma.package_plans.findUnique({ where: { id, isDeleted: "N" }, select: { roleId: true } });
            await prisma.role.update({ where: { id: packagePlan.roleId }, data: { isAssigned: "N" } });
            await prisma.package_plans.update({
                where: { id: id },
                data: { isDeleted: 'Y', updatedUser: user.id }
            });
            return NextResponse.json({ result: true, message: responseData.packagePlanDeleted })
        }
    } catch (error) {
        return NextResponse.json({ result: false, message: error });
    }
}
