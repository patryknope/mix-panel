-- Migration to add Discord webhook support
-- Run this in phpMyAdmin

ALTER TABLE `Match`
ADD COLUMN `discordWebhook` VARCHAR(191) NULL;
