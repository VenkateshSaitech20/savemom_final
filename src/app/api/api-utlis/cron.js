import { NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import cron from 'node-cron';

// for 1 hr - 0 * * * *
// for 5 sec - */5 * * * * *
let cronJobScheduled = false;
const updateExpirayStatus = async () => {
    try {
        const endTime = Date.now();
        const expiredUsers = await prisma.user.findMany({
            where: {
                expirayDate: {
                    gte: new Date(endTime - 3600000),
                    lte: new Date(endTime),
                },
                isDeleted: "N",
                adminApprovalId: "2",
            },
        });

        console.log('expired', expiredUsers);
        if (expiredUsers.length > 0) {
            await prisma.user.updateMany({
                where: {
                    id: {
                        in: expiredUsers.map(user => user.id),
                    },
                },
                data: {
                    adminApprovalId: "3",
                    isExpired: "Y"
                },
            });
        }

        return NextResponse.json({ result: true, message: "User data has updated." });
    } catch (error) {
        return NextResponse.json({ result: false, message: error.message });
    }
}

const scheduleCronJob = () => {
    if (!cronJobScheduled) {
        cron.schedule('0 * * * *', async () => {
            console.log('Running cron job to update expired users...');
            try {
                await updateExpirayStatus();
            } catch (error) {
                console.error('Error running cron job:', error);
            }
        });
        cronJobScheduled = true;
    }
};

// Call this function in your main server file
scheduleCronJob();

