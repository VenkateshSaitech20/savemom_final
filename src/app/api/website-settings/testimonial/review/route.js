import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { registerData, responseData } from '@/utils/message';
import { extractTokenData } from '@/utils/helper';
import { deleteFields, deleteFile, getFilePathFromUrl, processFiles, validateFields } from '@/app/api/api-utlis/helper';
const prisma = new PrismaClient();
const baseDir = `${process.env.MAIN_FOLDER_PATH}`;

const urlDir = `${process.env.LANDING_PAGE_FOLDER_PATH}/${process.env.TESTIMONIAL_IMAGE_FOLDER_PATH}`;
const uploadDir = `${process.env.MAIN_FOLDER_PATH}/${process.env.LANDING_PAGE_FOLDER_PATH}/${process.env.TESTIMONIAL_IMAGE_FOLDER_PATH}`;

export async function GET() {
    try {
        const testimonialReviews = await prisma.testimonial_reviews.findMany({ where: { isDeleted: "N" } });
        if (testimonialReviews) {
            deleteFields(testimonialReviews, ['createdAt', 'updatedAt']);
            return NextResponse.json({ result: true, message: testimonialReviews });
        }
        return NextResponse.json({ result: true, message: {} });
    } catch (error) {
        return NextResponse.json({ result: false, error: error });
    }
};

export async function POST(req) {
    try {
        const token = extractTokenData(req.headers);
        if (!token.id) {
            return NextResponse.json({ result: false, message: { tokenExpired: responseData.tokenExpired } });
        }
        const user = await prisma.user.findUnique({ where: { id: token.id, isDeleted: "N" } });
        if (!user) {
            return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
        }
        const formData = await req.formData();
        const fields = {};

        for (const [key, value] of formData.entries()) {
            fields[key] = value;
        };
        const { description, rating, designation, id } = fields;
        const emptyFieldErrors = {};
        if (!description || description?.trim() === "") {
            emptyFieldErrors.description = registerData.descriptionReq;
        }
        if (!rating || rating?.trim() === "") {
            emptyFieldErrors.rating = registerData.ratingReq;
        }
        // if (!postedBy || postedBy?.trim() === "") {
        //     emptyFieldErrors.postedBy = registerData.postedByReq;
        // }
        if (!designation || designation?.trim() === "") {
            emptyFieldErrors.designation = registerData.designationReq;
        }
        if (Object.keys(emptyFieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: emptyFieldErrors });
        };

        const validatingFields = {
            description: { type: "nameWithDot", message: registerData.descriptionFieldVal },
            rating: { type: "rating", message: registerData.ratingFieldVal },
            designation: { type: "name", message: registerData.designationFieldVal },
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
        const data = { description, rating, designation, postedBy: user.name, ...profileImageUrls };
        if (id) {
            const existingTestimonialDetails = await prisma.testimonial_reviews.findUnique({ where: { id: id } });
            if (existingTestimonialDetails === null) {
                return NextResponse.json({ result: false, message: { notFound: responseData.notFound } });
            }
            const updatedtestimonial = await prisma.testimonial_reviews.update({
                where: { id: existingTestimonialDetails.id },
                data
            })
            const filteredFiles = Object.entries(files).filter(([key, file]) => file !== null);
            filteredFiles.map(async ([key, file]) => {
                if (file) {
                    const oldImageUrl = existingTestimonialDetails[key];
                    const oldFilePath = getFilePathFromUrl(oldImageUrl, baseDir);
                    try {
                        await deleteFile(oldFilePath);
                    } catch (error) {
                        console.error('Failed to delete old testimonial image:', error);
                    }
                }
            })
            return NextResponse.json({ result: true, message: updatedtestimonial })
        } else {
            await prisma.testimonial_reviews.create({
                data
            })
            return NextResponse.json({ result: true, message: responseData.dataCreateded })
        }
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
        if (!user) {
            return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
        }
        const body = await req.json();
        const { id } = body;
        await prisma.testimonial_reviews.update({
            where: { id: id },
            data: { isDeleted: 'Y' }
        });
        return NextResponse.json({ result: true, message: responseData.testimonialDeleted })
    } catch (error) {
        return NextResponse.json({ result: false, message: error });
    }
}    
