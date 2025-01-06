-- CreateTable
CREATE TABLE `push_notification_templates` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `category` VARCHAR(191) NULL,
    `slugCategory` VARCHAR(191) NULL,
    `message` LONGTEXT NULL,
    `isActive` VARCHAR(191) NULL,
    `isDeleted` VARCHAR(191) NULL DEFAULT 'N',
    `createdBy` VARCHAR(191) NULL,
    `updatedBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
