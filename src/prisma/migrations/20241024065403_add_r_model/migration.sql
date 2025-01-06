/*
  Warnings:

  - You are about to drop the column `auth_provider_x509_cert_url` on the `push_notification_setting` table. All the data in the column will be lost.
  - You are about to drop the column `auth_uri` on the `push_notification_setting` table. All the data in the column will be lost.
  - You are about to drop the column `client_email` on the `push_notification_setting` table. All the data in the column will be lost.
  - You are about to drop the column `client_id` on the `push_notification_setting` table. All the data in the column will be lost.
  - You are about to drop the column `client_x509_cert_url` on the `push_notification_setting` table. All the data in the column will be lost.
  - You are about to drop the column `notificationType` on the `push_notification_setting` table. All the data in the column will be lost.
  - You are about to drop the column `private_key` on the `push_notification_setting` table. All the data in the column will be lost.
  - You are about to drop the column `private_key_id` on the `push_notification_setting` table. All the data in the column will be lost.
  - You are about to drop the column `project_id` on the `push_notification_setting` table. All the data in the column will be lost.
  - You are about to drop the column `token_uri` on the `push_notification_setting` table. All the data in the column will be lost.
  - You are about to drop the column `universe_domain` on the `push_notification_setting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `push_notification_setting` DROP COLUMN `auth_provider_x509_cert_url`,
    DROP COLUMN `auth_uri`,
    DROP COLUMN `client_email`,
    DROP COLUMN `client_id`,
    DROP COLUMN `client_x509_cert_url`,
    DROP COLUMN `notificationType`,
    DROP COLUMN `private_key`,
    DROP COLUMN `private_key_id`,
    DROP COLUMN `project_id`,
    DROP COLUMN `token_uri`,
    DROP COLUMN `universe_domain`,
    ADD COLUMN `authProviderCertUrl` VARCHAR(191) NULL,
    ADD COLUMN `authUri` VARCHAR(191) NULL,
    ADD COLUMN `clientCertUrl` VARCHAR(191) NULL,
    ADD COLUMN `clientEmail` VARCHAR(191) NULL,
    ADD COLUMN `clientId` VARCHAR(191) NULL,
    ADD COLUMN `privateKey` VARCHAR(191) NULL,
    ADD COLUMN `privateKeyId` VARCHAR(191) NULL,
    ADD COLUMN `projectId` VARCHAR(191) NULL,
    ADD COLUMN `pushNotificationType` VARCHAR(191) NULL,
    ADD COLUMN `tokenUri` VARCHAR(191) NULL,
    ADD COLUMN `universeDomain` VARCHAR(191) NULL;
