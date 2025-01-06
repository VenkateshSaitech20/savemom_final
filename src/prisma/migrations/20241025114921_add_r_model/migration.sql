-- CreateTable
CREATE TABLE `sent_push_notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `from` VARCHAR(191) NULL,
    `to` LONGTEXT NULL,
    `title` VARCHAR(191) NULL,
    `message` LONGTEXT NULL,
    `templateId` INTEGER NULL,
    `templateCategory` VARCHAR(191) NULL,
    `sentBy` VARCHAR(191) NULL,
    `sendPushNotificationTo` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
