# Fix: Payment Rejection Reasons Table Missing

## Problem
Error when viewing payment details in admin dashboard:
```
SQLSTATE[42S02]: Base table or view not found: 1146 Table 'e-commerce.payment_rejection_reasons' doesn't exist
```

## Solution

The `payment_rejection_reasons` table migration hasn't been run on your cPanel server. You need to:

1. **Run the migration** to create the table
2. **Run the seeder** to populate default rejection reasons

## Steps to Fix on cPanel

### Option 1: Using cPanel Terminal (Recommended)

1. **Access cPanel Terminal**
   - Log into cPanel
   - Go to **Terminal** (under Advanced section)
   - Or use SSH if you have access

2. **Navigate to your project directory**
   ```bash
   cd ~/e-commerce.biruklemma.com/biruklir
   # Or your actual project path
   ```

3. **Run the migration**
   ```bash
   /opt/alt/php83/usr/bin/php artisan migrate
   ```
   (Replace `php83` with your PHP version if different - check with `which php`)

4. **Run the seeder to populate default rejection reasons**
   ```bash
   /opt/alt/php83/usr/bin/php artisan db:seed --class=PaymentRejectionReasonSeeder
   ```

### Option 2: Using cPanel Cron Job (One-time execution)

If you can't access Terminal, you can create a one-time cron job:

1. **Go to cPanel → Cron Jobs**
2. **Add New Cron Job** with:
   - **Minute:** `*` (or current minute)
   - **Hour:** `*` (or current hour)
   - **Day:** `*`
   - **Month:** `*`
   - **Weekday:** `*`
   - **Command:**
     ```bash
     cd ~/e-commerce.biruklemma.com/biruklir && /opt/alt/php83/usr/bin/php artisan migrate && /opt/alt/php83/usr/bin/php artisan db:seed --class=PaymentRejectionReasonSeeder
     ```
3. **Save** and wait a minute for it to run
4. **Delete the cron job** after it runs (it's a one-time fix)

### Option 3: Manual SQL (If Artisan doesn't work)

If you have phpMyAdmin access, you can run the SQL directly:

1. **Go to cPanel → phpMyAdmin**
2. **Select your database** (`e-commerce`)
3. **Click SQL tab**
4. **Run this SQL:**

```sql
CREATE TABLE `payment_rejection_reasons` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `reason_code` varchar(255) NOT NULL,
  `reason_text` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `applies_to` json DEFAULT '["both"]',
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payment_rejection_reasons_reason_code_unique` (`reason_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

5. **Then insert default data:**

```sql
INSERT INTO `payment_rejection_reasons` (`reason_code`, `reason_text`, `description`, `applies_to`, `is_active`, `sort_order`, `created_at`, `updated_at`) VALUES
('insufficient_funds', 'Insufficient Funds', 'Payment amount does not match the required amount or insufficient balance', '["both"]', 1, 1, NOW(), NOW()),
('invalid_payment_method', 'Invalid Payment Method', 'The payment method used is not valid or not supported', '["both"]', 1, 2, NOW(), NOW()),
('payment_proof_unclear', 'Payment Proof Unclear', 'The uploaded payment proof is unclear, incomplete, or cannot be verified', '["both"]', 1, 3, NOW(), NOW()),
('payment_mismatch', 'Payment Amount Mismatch', 'The payment amount does not match the order amount', '["both"]', 1, 4, NOW(), NOW()),
('suspicious_activity', 'Suspicious Activity', 'Payment flagged due to suspicious activity or security concerns', '["both"]', 1, 5, NOW(), NOW()),
('expired_payment', 'Payment Expired', 'Payment was not completed within the allowed time frame', '["both"]', 1, 6, NOW(), NOW()),
('duplicate_payment', 'Duplicate Payment', 'This payment appears to be a duplicate of another transaction', '["both"]', 1, 7, NOW(), NOW()),
('product_unavailable', 'Product No Longer Available', 'The requested product is no longer available for purchase', '["product_request"]', 1, 8, NOW(), NOW()),
('order_cancelled', 'Order Cancelled', 'The associated order has been cancelled', '["normal_purchase"]', 1, 9, NOW(), NOW()),
('other', 'Other Reason', 'Other reason not listed above', '["both"]', 1, 99, NOW(), NOW());
```

## Verify the Fix

After running the migration and seeder:

1. **Check the table exists:**
   ```bash
   /opt/alt/php83/usr/bin/php artisan tinker
   ```
   Then in tinker:
   ```php
   \App\Models\PaymentRejectionReason::count();
   ```
   Should return `10` (number of default rejection reasons)

2. **Or check in phpMyAdmin:**
   - Go to your database
   - Look for `payment_rejection_reasons` table
   - Should have 10 rows

3. **Test in the application:**
   - Go to Admin Dashboard → Sales Dashboard
   - Click "View Details" on any payment
   - Should work without errors now

## Related Migration

There's also a related migration that adds a foreign key column to `payment_transactions` table:
- `2025_11_09_163306_add_rejection_reason_code_to_payment_transactions_table.php`

This should run automatically when you run `php artisan migrate`, but if it fails, you may need to check if the `payment_transactions` table exists first.

## Notes

- The migration file is: `database/migrations/2025_11_09_163300_create_payment_rejection_reasons_table.php`
- The seeder file is: `database/seeders/PaymentRejectionReasonSeeder.php`
- Default rejection reasons are pre-configured for both product requests and normal purchases

