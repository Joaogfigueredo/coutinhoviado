-- CreateTable
CREATE TABLE `Transaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `descricao` VARCHAR(180) NOT NULL,
    `valor` DECIMAL(12, 2) NOT NULL,
    `tipo` ENUM('receita', 'despesa') NOT NULL,
    `categoria` VARCHAR(80) NOT NULL,
    `status` ENUM('confirmado', 'pendente') NOT NULL DEFAULT 'confirmado',
    `data` DATE NOT NULL,
    `observacao` VARCHAR(500) NULL,
    `accountId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Transaction_accountId_data_idx`(`accountId`, `data`),
    INDEX `Transaction_tipo_idx`(`tipo`),
    INDEX `Transaction_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
