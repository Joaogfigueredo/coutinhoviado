-- Migration: add goals table

CREATE TABLE `Goal` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(120) NOT NULL,
  `description` VARCHAR(500),
  `targetAmount` DECIMAL(12,2) NOT NULL,
  `currentAmount` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `currency` VARCHAR(3) NOT NULL DEFAULT 'BRL',
  `dueDate` DATE NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'active',
  `userId` INT NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_goal_user` (`userId`),
  CONSTRAINT `fk_goal_user` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Note: Prisma enum stored as string. Valid values: active, completed, cancelled
