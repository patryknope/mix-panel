-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `steamId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `avatar` VARCHAR(191) NULL,
    `role` ENUM('USER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN') NOT NULL DEFAULT 'USER',
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE INDEX `User_steamId_key`(`steamId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Team` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `tag` VARCHAR(191) NULL,
    `flag` VARCHAR(191) NULL,
    `logo` VARCHAR(191) NULL,
    `creatorId` VARCHAR(191) NOT NULL,
    `public` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TeamPlayer` (
    `id` VARCHAR(191) NOT NULL,
    `teamId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `captain` BOOLEAN NOT NULL DEFAULT false,
    `coach` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE INDEX `TeamPlayer_teamId_userId_key`(`teamId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Server` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `ip` VARCHAR(191) NOT NULL,
    `port` INTEGER NOT NULL,
    `rconPassword` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `public` BOOLEAN NOT NULL DEFAULT false,
    `inUse` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE INDEX `Server_ip_port_key`(`ip`, `port`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Match` (
    `id` VARCHAR(191) NOT NULL,
    `serverId` VARCHAR(191) NULL,
    `team1Id` VARCHAR(191) NOT NULL,
    `team2Id` VARCHAR(191) NOT NULL,
    `creatorId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'LIVE', 'FINISHED', 'CANCELED') NOT NULL DEFAULT 'PENDING',
    `series` ENUM('BO1', 'BO2', 'BO3', 'BO5') NOT NULL DEFAULT 'BO1',
    `apiKey` VARCHAR(191) NOT NULL,
    `mapPool` JSON NOT NULL,
    `mapBans` JSON NOT NULL,
    `mapPicks` JSON NOT NULL,
    `sideChoice` VARCHAR(191) NULL,
    `knifeRound` BOOLEAN NOT NULL DEFAULT true,
    `overtime` BOOLEAN NOT NULL DEFAULT true,
    `team1Score` INTEGER NOT NULL DEFAULT 0,
    `team2Score` INTEGER NOT NULL DEFAULT 0,
    `winner` VARCHAR(191) NULL,
    `canceledAt` DATETIME NULL,
    `startedAt` DATETIME NULL,
    `endedAt` DATETIME NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE INDEX `Match_apiKey_key`(`apiKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MapStat` (
    `id` VARCHAR(191) NOT NULL,
    `matchId` VARCHAR(191) NOT NULL,
    `mapNumber` INTEGER NOT NULL,
    `mapName` VARCHAR(191) NOT NULL,
    `team1Score` INTEGER NOT NULL DEFAULT 0,
    `team2Score` INTEGER NOT NULL DEFAULT 0,
    `winner` VARCHAR(191) NULL,
    `startedAt` DATETIME NULL,
    `endedAt` DATETIME NULL,
    UNIQUE INDEX `MapStat_matchId_mapNumber_key`(`matchId`, `mapNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlayerStat` (
    `id` VARCHAR(191) NOT NULL,
    `matchId` VARCHAR(191) NOT NULL,
    `steamId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `teamId` VARCHAR(191) NOT NULL,
    `mapNumber` INTEGER NULL,
    `kills` INTEGER NOT NULL DEFAULT 0,
    `deaths` INTEGER NOT NULL DEFAULT 0,
    `assists` INTEGER NOT NULL DEFAULT 0,
    `flashAssists` INTEGER NOT NULL DEFAULT 0,
    `headshots` INTEGER NOT NULL DEFAULT 0,
    `damage` INTEGER NOT NULL DEFAULT 0,
    `rating` DOUBLE NOT NULL DEFAULT 0,
    `adr` DOUBLE NOT NULL DEFAULT 0,
    `kast` DOUBLE NOT NULL DEFAULT 0,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `PlayerStat_matchId_steamId_idx`(`matchId`, `steamId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Team` ADD CONSTRAINT `Team_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeamPlayer` ADD CONSTRAINT `TeamPlayer_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeamPlayer` ADD CONSTRAINT `TeamPlayer_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Server` ADD CONSTRAINT `Server_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_serverId_fkey` FOREIGN KEY (`serverId`) REFERENCES `Server`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_team1Id_fkey` FOREIGN KEY (`team1Id`) REFERENCES `Team`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_team2Id_fkey` FOREIGN KEY (`team2Id`) REFERENCES `Team`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MapStat` ADD CONSTRAINT `MapStat_matchId_fkey` FOREIGN KEY (`matchId`) REFERENCES `Match`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlayerStat` ADD CONSTRAINT `PlayerStat_matchId_fkey` FOREIGN KEY (`matchId`) REFERENCES `Match`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
