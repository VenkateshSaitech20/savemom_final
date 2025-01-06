/*
  Warnings:

  - You are about to drop the column `accountSid` on the `whats_app_setting` table. All the data in the column will be lost.
  - You are about to drop the column `authToken` on the `whats_app_setting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `whats_app_setting` DROP COLUMN `accountSid`,
    DROP COLUMN `authToken`,
    ADD COLUMN `authKey` VARCHAR(191) NULL,
    ADD COLUMN `publicKey` VARCHAR(191) NULL;
