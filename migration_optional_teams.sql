-- Migration to make teams optional in matches
-- Run this in phpMyAdmin

ALTER TABLE `Match`
MODIFY COLUMN `team1Id` VARCHAR(191) NULL,
MODIFY COLUMN `team2Id` VARCHAR(191) NULL;
