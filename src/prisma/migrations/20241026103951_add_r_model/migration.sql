-- CreateTable
CREATE TABLE `whats_app_setting` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mobile` VARCHAR(191) NULL,
    `whatsAppType` VARCHAR(191) NULL,
    `accountSid` VARCHAR(191) NULL,
    `authToken` VARCHAR(191) NULL,
    `createdBy` VARCHAR(191) NULL,
    `updatedBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
