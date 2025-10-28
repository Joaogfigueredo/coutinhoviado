-- Migration: add_account_currency
-- Adds a currency column to Account with default 'BRL'

ALTER TABLE `Account`
  ADD COLUMN `currency` VARCHAR(3) NOT NULL DEFAULT 'BRL' AFTER `initialBalance`;

-- If you need to set specific currency per account, run an UPDATE afterwards.
