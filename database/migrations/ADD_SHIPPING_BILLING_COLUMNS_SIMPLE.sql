-- Simple SQL to add shipping and billing columns to orders table
-- Run this in phpMyAdmin or MySQL command line
-- If a column already exists, you'll get an error - just ignore it and continue

ALTER TABLE `orders` 
ADD COLUMN `shipping_fullname` VARCHAR(255) NULL AFTER `shipping_method`,
ADD COLUMN `shipping_email` VARCHAR(255) NULL AFTER `shipping_fullname`,
ADD COLUMN `shipping_phone` VARCHAR(255) NULL AFTER `shipping_email`,
ADD COLUMN `shipping_address` TEXT NULL AFTER `shipping_phone`,
ADD COLUMN `shipping_city` VARCHAR(255) NULL AFTER `shipping_address`,
ADD COLUMN `shipping_country` VARCHAR(255) NULL AFTER `shipping_city`,
ADD COLUMN `billing_fullname` VARCHAR(255) NULL AFTER `shipping_country`,
ADD COLUMN `billing_email` VARCHAR(255) NULL AFTER `billing_fullname`,
ADD COLUMN `billing_phone` VARCHAR(255) NULL AFTER `billing_email`,
ADD COLUMN `billing_address` TEXT NULL AFTER `billing_phone`,
ADD COLUMN `billing_city` VARCHAR(255) NULL AFTER `billing_address`,
ADD COLUMN `billing_country` VARCHAR(255) NULL AFTER `billing_city`;

