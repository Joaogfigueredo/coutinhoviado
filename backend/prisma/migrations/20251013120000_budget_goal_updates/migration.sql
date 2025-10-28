-- Add optional relation between budgets and categories
ALTER TABLE `Budget`
  ADD COLUMN `categoryId` INT NULL,
  ADD INDEX `Budget_userId_categoryId_idx` (`userId`, `categoryId`);

ALTER TABLE `Budget`
  ADD CONSTRAINT `Budget_categoryId_fkey`
  FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Goal contributions history
CREATE TABLE `GoalContribution` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `goalId` INT NOT NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `description` VARCHAR(180) NULL,
  `contributedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `GoalContribution_goalId_idx` (`goalId`),
  CONSTRAINT `GoalContribution_goalId_fkey`
    FOREIGN KEY (`goalId`) REFERENCES `Goal`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
);
