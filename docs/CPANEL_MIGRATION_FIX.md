# cPanel Migration Fix - Product Request Orders

## Problem
Orders from product request advance payments don't appear because the migration to make `product_id` nullable hasn't been run on cPanel.

## Error
```
SQLSTATE[23000]: Integrity constraint violation: 1048 Column 'product_id' cannot be null
```

## Solution

### Step 1: Run the Migration on cPanel

SSH into your cPanel server and run:

```bash
cd /home/biruklir/e-commerce.biruklemma.com/biruklir
php artisan migrate
```

Or if you need to run a specific migration:

```bash
php artisan migrate --path=database/migrations/2025_11_30_131809_make_product_id_nullable_in_order_items_table.php
```

### Step 2: Verify Migration

Check that the migration ran successfully:

```bash
php artisan migrate:status | grep "make_product_id_nullable"
```

You should see:
```
2025_11_30_131809_make_product_id_nullable_in_order_items_table ... [X] Ran
```

### Step 3: Verify Database Schema

Check that `product_id` is now nullable:

```sql
DESCRIBE order_items;
```

The `product_id` column should show `YES` in the `Null` column.

Or via Laravel:

```bash
php artisan tinker
>>> Schema::getColumnType('order_items', 'product_id');
```

### Step 4: Test Order Creation

After running the migration, test creating a product request order:

1. Create a product request
2. Pay advance payment
3. Admin approves payment
4. Check if order appears in orders list

## Why This Happened

The migration `2025_11_30_131809_make_product_id_nullable_in_order_items_table` was created locally but never run on the cPanel production server. When the code tries to create an OrderItem with `product_id => null` (for product requests), the database rejects it because the column is still NOT NULL.

## Prevention

Always run migrations on production after deploying code changes:

```bash
# After git pull/deploy
php artisan migrate
```

Or set up automatic migrations in your deployment script.

