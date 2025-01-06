-- CreateTable
CREATE TABLE `user` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `contactNo` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `zipCode` VARCHAR(191) NULL,
    `countryId` INTEGER NULL,
    `country` VARCHAR(191) NULL,
    `stateId` INTEGER NULL,
    `phoneCode` VARCHAR(8) NULL,
    `language` VARCHAR(191) NULL,
    `companyName` VARCHAR(191) NULL,
    `roleId` VARCHAR(191) NULL DEFAULT '3',
    `roleName` VARCHAR(191) NULL DEFAULT 'customer',
    `profileStatus` VARCHAR(191) NULL,
    `image` VARCHAR(191) NULL,
    `isDeleted` VARCHAR(191) NULL DEFAULT 'N',
    `createdBy` VARCHAR(191) NULL,
    `packageId` VARCHAR(191) NULL,
    `packageName` VARCHAR(191) NULL,
    `packageValidity` VARCHAR(191) NULL,
    `purchaseDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expirayDate` DATETIME(3) NULL,
    `paymentMethod` VARCHAR(191) NULL,
    `isExpired` VARCHAR(191) NULL,
    `amount` VARCHAR(191) NULL,
    `currency` VARCHAR(191) NULL,
    `paymentStatus` VARCHAR(191) NULL,
    `paymentId` VARCHAR(191) NULL,
    `adminApprovalId` VARCHAR(191) NULL DEFAULT '3',
    `deviceToken` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `verification_token` (
    `identifier` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `VerificationToken_token_key`(`token`),
    UNIQUE INDEX `VerificationToken_identifier_token_key`(`identifier`, `token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `roleName` VARCHAR(191) NULL,
    `permissions` JSON NOT NULL,
    `name` VARCHAR(191) NULL,
    `isAssigned` VARCHAR(191) NULL DEFAULT 'N',
    `createdBy` VARCHAR(191) NULL,
    `createdUserId` VARCHAR(191) NULL,
    `isDeleted` VARCHAR(191) NULL DEFAULT 'N',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `menus` (
    `id` VARCHAR(191) NOT NULL,
    `menuId` VARCHAR(191) NULL,
    `menu` VARCHAR(191) NULL,
    `subMenu` VARCHAR(191) NULL,
    `slugName` VARCHAR(191) NULL,
    `permission` JSON NULL,
    `path` VARCHAR(191) NULL,
    `sequence` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_settings` (
    `id` VARCHAR(191) NOT NULL,
    `systemName` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `systemImage` VARCHAR(191) NULL,
    `navbarImage` VARCHAR(191) NULL,
    `metaTitle` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `contactNo` VARCHAR(191) NULL,
    `updatedUser` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `features` (
    `id` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `title` VARCHAR(191) NULL,
    `description` VARCHAR(512) NULL,
    `updatedUser` VARCHAR(191) NULL,
    `isDeleted` VARCHAR(191) NULL DEFAULT 'N',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `our_team` (
    `id` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `title` VARCHAR(191) NULL,
    `description` VARCHAR(512) NULL,
    `updatedUser` VARCHAR(191) NULL,
    `isDeleted` VARCHAR(191) NULL DEFAULT 'N',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `key_achievements` (
    `id` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `keyMetric` VARCHAR(191) NULL,
    `highlight` VARCHAR(191) NULL,
    `isDeleted` VARCHAR(191) NULL DEFAULT 'N',
    `createdUser` VARCHAR(191) NULL,
    `updatedUser` VARCHAR(191) NULL,
    `postedBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `faq` (
    `id` VARCHAR(191) NOT NULL,
    `badgeTitle` VARCHAR(191) NULL,
    `title` VARCHAR(191) NULL,
    `description` LONGTEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `questionanswer` (
    `id` VARCHAR(191) NOT NULL,
    `question` VARCHAR(191) NULL,
    `answer` VARCHAR(191) NULL,
    `isDeleted` VARCHAR(191) NULL DEFAULT 'N',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `testimonial_reviews` (
    `id` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `description` LONGTEXT NULL,
    `rating` VARCHAR(191) NULL,
    `postedBy` VARCHAR(191) NULL,
    `designation` VARCHAR(191) NULL,
    `isDeleted` VARCHAR(191) NULL DEFAULT 'N',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contact_us` (
    `id` VARCHAR(191) NOT NULL,
    `badgeTitle` LONGTEXT NULL,
    `title` LONGTEXT NULL,
    `description` LONGTEXT NULL,
    `cardTitle` LONGTEXT NULL,
    `cardDescription` LONGTEXT NULL,
    `isfrontendvisible` VARCHAR(191) NULL,
    `createdUser` VARCHAR(191) NULL,
    `updatedUser` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer_enquiries` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `message` LONGTEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `brands` (
    `id` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscribers` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `country` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `shortname` VARCHAR(3) NOT NULL,
    `phoneCode` VARCHAR(8) NOT NULL,
    `createdUser` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedUser` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `isDeleted` VARCHAR(191) NOT NULL DEFAULT 'N',
    `isActive` VARCHAR(191) NOT NULL DEFAULT 'Y',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `state` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `countryId` INTEGER NOT NULL,
    `country` VARCHAR(191) NULL,
    `lgdCode` VARCHAR(191) NULL,
    `createdUser` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedUser` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `isDeleted` VARCHAR(191) NOT NULL DEFAULT 'N',
    `isActive` VARCHAR(191) NOT NULL DEFAULT 'Y',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `city` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `lgdCode` VARCHAR(191) NULL,
    `country` VARCHAR(191) NOT NULL,
    `countryId` INTEGER NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `stateId` INTEGER NOT NULL,
    `createdUser` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedUser` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `isDeleted` VARCHAR(191) NOT NULL DEFAULT 'N',
    `isActive` VARCHAR(191) NOT NULL DEFAULT 'Y',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `district` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `countryId` INTEGER NOT NULL,
    `country` VARCHAR(191) NOT NULL,
    `stateId` INTEGER NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `cityId` INTEGER NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `createdUser` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedUser` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `isDeleted` VARCHAR(191) NOT NULL DEFAULT 'N',
    `isActive` VARCHAR(191) NOT NULL DEFAULT 'Y',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `section_content` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sectionType` VARCHAR(191) NULL,
    `badgeTitle` VARCHAR(191) NULL,
    `title` VARCHAR(191) NULL,
    `description` VARCHAR(512) NULL,
    `image1` VARCHAR(191) NULL,
    `image2` VARCHAR(191) NULL,
    `isfrontendvisible` VARCHAR(191) NULL DEFAULT 'Y',
    `discount` VARCHAR(191) NULL,
    `createdUser` VARCHAR(191) NULL,
    `updatedUser` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `package_plans` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NULL,
    `subTitle` VARCHAR(191) NULL,
    `monthlyPrice` VARCHAR(191) NULL,
    `yearlyPlan` JSON NULL,
    `popularPlan` VARCHAR(191) NULL,
    `planBenefits` JSON NULL,
    `image` VARCHAR(191) NULL,
    `roleId` VARCHAR(191) NULL,
    `roleName` VARCHAR(191) NULL,
    `createdUser` VARCHAR(191) NULL,
    `updatedUser` VARCHAR(191) NULL,
    `isDeleted` VARCHAR(191) NULL DEFAULT 'N',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_setting` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NULL,
    `emailCompany` VARCHAR(191) NULL,
    `emailType` VARCHAR(191) NULL,
    `apiKey` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `createdUserId` VARCHAR(191) NULL,
    `updatedUserId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sent_emails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `from` VARCHAR(191) NULL,
    `to` LONGTEXT NULL,
    `subject` LONGTEXT NULL,
    `message` LONGTEXT NULL,
    `templateId` INTEGER NULL,
    `templateCategory` VARCHAR(191) NULL,
    `sentBy` VARCHAR(191) NULL,
    `sendMailTo` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_templates` (
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

-- CreateTable
CREATE TABLE `configure_subscription` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `publicKey` VARCHAR(191) NULL,
    `privateKey` VARCHAR(191) NULL,
    `isActive` VARCHAR(191) NULL DEFAULT 'N',
    `type` VARCHAR(191) NULL,
    `createdUser` VARCHAR(191) NULL,
    `updatedUser` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sms_setting` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mobile` VARCHAR(191) NULL,
    `smsType` VARCHAR(191) NULL,
    `publicKey` VARCHAR(191) NULL,
    `authKey` VARCHAR(191) NULL,
    `createdBy` VARCHAR(191) NULL,
    `updatedBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sent_sms` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `from` VARCHAR(191) NULL,
    `to` LONGTEXT NULL,
    `message` LONGTEXT NULL,
    `templateId` INTEGER NULL,
    `templateCategory` VARCHAR(191) NULL,
    `sentBy` VARCHAR(191) NULL,
    `sendSMSTo` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sms_templates` (
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

-- CreateTable
CREATE TABLE `voice_call_setting` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mobile` VARCHAR(191) NULL,
    `voiceCallType` VARCHAR(191) NULL,
    `publicKey` VARCHAR(191) NULL,
    `authKey` VARCHAR(191) NULL,
    `createdBy` VARCHAR(191) NULL,
    `updatedBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `push_notification_setting` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `notificationType` VARCHAR(191) NULL,
    `type` VARCHAR(191) NULL,
    `project_id` VARCHAR(191) NULL,
    `private_key_id` VARCHAR(191) NULL,
    `private_key` VARCHAR(191) NULL,
    `client_email` VARCHAR(191) NULL,
    `client_id` VARCHAR(191) NULL,
    `auth_uri` VARCHAR(191) NULL,
    `token_uri` VARCHAR(191) NULL,
    `auth_provider_x509_cert_url` VARCHAR(191) NULL,
    `client_x509_cert_url` VARCHAR(191) NULL,
    `universe_domain` VARCHAR(191) NULL,
    `createdBy` VARCHAR(191) NULL,
    `updatedBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sent_voice_call` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `from` VARCHAR(191) NULL,
    `to` LONGTEXT NULL,
    `message` LONGTEXT NULL,
    `templateId` INTEGER NULL,
    `templateCategory` VARCHAR(191) NULL,
    `sentBy` VARCHAR(191) NULL,
    `sendVoiceCallTo` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `voice_call_templates` (
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

-- CreateTable
CREATE TABLE `subscription_list` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `contactNo` VARCHAR(191) NULL,
    `packageId` VARCHAR(191) NULL,
    `packageName` VARCHAR(191) NULL,
    `packageValidity` VARCHAR(191) NULL,
    `purchaseDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expirayDate` DATETIME(3) NULL,
    `paymentMethod` VARCHAR(191) NULL,
    `isExpired` VARCHAR(191) NULL,
    `amount` VARCHAR(191) NULL,
    `currency` VARCHAR(191) NULL,
    `paymentStatus` VARCHAR(191) NULL,
    `paymentId` VARCHAR(191) NULL,
    `roleId` VARCHAR(191) NULL,
    `roleName` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `categoryName` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NULL,
    `isActive` VARCHAR(191) NOT NULL DEFAULT 'Y',
    `isDeleted` VARCHAR(191) NULL DEFAULT 'N',
    `createdBy` VARCHAR(191) NULL,
    `updatedBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contents` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `image` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NULL,
    `categoryName` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NULL,
    `shortContent` VARCHAR(300) NULL,
    `content` VARCHAR(3000) NULL,
    `postedBy` VARCHAR(191) NULL,
    `isDeleted` VARCHAR(191) NULL DEFAULT 'N',
    `createdBy` VARCHAR(191) NULL,
    `updatedBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mail_templates` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `subject` VARCHAR(191) NOT NULL,
    `message` VARCHAR(3000) NULL,
    `templateType` VARCHAR(191) NULL,
    `createdBy` VARCHAR(191) NULL,
    `updatedBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
