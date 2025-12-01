# cPanel Order Diagnostic Guide

## Issue
Orders created from product request advance payments don't appear in the orders list on cPanel-hosted environment.

## Diagnostic Steps

1. **Run the diagnostic script:**
   ```bash
   php diagnose-product-request-orders.php
   ```

2. **Check Laravel logs:**
   ```bash
   tail -n 100 storage/logs/laravel.log | grep -i "order\|product request\|error"
   ```

3. **Check database directly:**
   ```sql
   -- Check if orders exist
   SELECT id, order_number, user_id, notes, created_at 
   FROM orders 
   WHERE notes LIKE '%product request%' 
   ORDER BY created_at DESC 
   LIMIT 10;
   
   -- Check if order items exist
   SELECT oi.id, oi.order_id, oi.product_id, oi.product_snapshot
   FROM order_items oi
   JOIN orders o ON oi.order_id = o.id
   WHERE o.notes LIKE '%product request%'
   LIMIT 10;
   
   -- Check product requests with orders
   SELECT id, order_id, product_name, user_id
   FROM product_requests
   WHERE order_id IS NOT NULL
   ORDER BY id DESC
   LIMIT 10;
   ```

## Common Issues on cPanel

### 1. Transaction Isolation Level
cPanel MySQL might have different transaction isolation settings. The transaction might be failing silently.

**Solution:** Check MySQL transaction isolation:
```sql
SHOW VARIABLES LIKE 'transaction_isolation';
```

### 2. Database Connection Issues
cPanel might have connection pooling or persistent connections that cause transaction issues.

**Solution:** Check database configuration in `config/database.php`

### 3. Error Logging
Errors might be logged but not visible. Check:
- Laravel logs: `storage/logs/laravel.log`
- PHP error logs: Check cPanel error logs
- MySQL error logs: Check cPanel MySQL logs

### 4. Permission Issues
The database user might not have proper permissions for transactions.

**Solution:** Verify database user has proper permissions:
```sql
SHOW GRANTS FOR CURRENT_USER();
```

## Enhanced Logging

The updated `ProductRequest::createOrder()` method now includes comprehensive logging:
- Transaction start
- Order save
- Order item creation
- Product request update
- Transaction completion
- Error logging with full stack trace

Check logs for:
- "Starting order creation transaction"
- "Order saved in transaction"
- "Order item created in transaction"
- "Order creation transaction failed"

## Next Steps

1. Run diagnostic script
2. Check logs for errors
3. Verify database transactions are working
4. Check if orders are being created but filtered out by query
5. Verify user_id matches between order and authenticated user

