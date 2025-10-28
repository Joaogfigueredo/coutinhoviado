-- Add archivedAt column to Account and related indexes
ALTER TABLE `Account`
  ADD COLUMN `archivedAt` DATETIME NULL AFTER `initialBalance`;

CREATE INDEX `Account_userId_isDefault_idx` ON `Account`(`userId`, `isDefault`);
CREATE INDEX `Account_userId_archivedAt_idx` ON `Account`(`userId`, `archivedAt`);

-- Add categoryId column to Transaction and related index
ALTER TABLE `Transaction`
  ADD COLUMN `categoryId` INT NULL AFTER `accountId`;

CREATE INDEX `Transaction_categoryId_idx` ON `Transaction`(`categoryId`);

-- Create Category table
CREATE TABLE `Category` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(80) NOT NULL,
  `color` VARCHAR(9) NULL,
  `userId` INT NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Category_userId_name_key` (`userId`, `name`),
  INDEX `Category_userId_idx` (`userId`),
  CONSTRAINT `Category_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Link transactions to categories
ALTER TABLE `Transaction`
  ADD CONSTRAINT `Transaction_categoryId_fkey`
    FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE SET NULL;
