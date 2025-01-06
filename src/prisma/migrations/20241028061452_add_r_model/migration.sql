/*
  Warnings:

  - Added the required column `shortname` to the `city` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `city` ADD COLUMN `shortname` VARCHAR(3) NOT NULL;

-- AlterTable
ALTER TABLE `district` ADD COLUMN `lgdCode` VARCHAR(191) NULL;
