# Email Not Sending - Troubleshooting Guide

## Problem
Emails for orders, payments, and product requests are not being sent on the hosted cPanel server, but registration verification emails work fine.

## Why Registration Emails Work
Registration emails use Laravel's built-in `Registered` event which sends emails **synchronously** (not queued). All other emails are **queued** and require a queue worker to process them.

## Diagnostic Steps

### Step 1: Run the Diagnostic Script

Upload `diagnose-email-queue.php` to your server and run it:

```bash
cd ~/e-commerce.biruklemma.com/biruklir
php diagnose-email-queue.php
```

This will show you:
- Queue configuration
- Pending/failed jobs
- Queue worker status
- Event/listener registration
- Recent logs
- Mail configuration

### Step 2: Check Queue Worker

Verify the queue worker is running and processing **both** queues:

```bash
# Check if worker is running
ps aux | grep "queue:work" | grep -v grep

# Should show something like:
# biruklir 12345 ... php artisan queue:work --queue=emails,default ...
```

**CRITICAL**: The worker MUST process both `emails` and `default` queues because:
- **Listeners** are queued on the `default` queue
- **Mail jobs** are queued on the `emails` queue

If your worker only processes `emails`, listeners will never run, so mail jobs never get dispatched!

### Step 3: Check Pending Jobs

```bash
cd ~/e-commerce.biruklemma.com/biruklir
php artisan queue:work --queue=emails,default --once
```

This will process one job and show you what's happening.

### Step 4: Check Failed Jobs

```bash
php artisan queue:failed
```

If there are failed jobs, check the error:

```bash
php artisan queue:failed --json
```

### Step 5: Check Logs

```bash
# Check Laravel logs for listener activity
tail -f storage/logs/laravel.log | grep -E "(SendOrderNotifications|SendPaymentNotifications|SendProductRequestNotifications)"

# Check queue worker logs
tail -f storage/logs/queue-worker.log
```

Look for:
- `[SendOrderNotifications] Listener triggered`
- `[SendPaymentNotifications] Listener triggered`
- `[SendProductRequestNotifications] Listener triggered`
- Any error messages

### Step 6: Verify Events Are Being Fired

Check if events are actually being dispatched. Add temporary logging to your models:

**In `app/Models/Order.php`** (around line 89):
```php
static::created(function ($order) {
    \Log::info('OrderCreated event being fired', ['order_id' => $order->id]);
    event(new OrderCreated($order));
    // ... rest of code
});
```

**In `app/Http/Controllers/AdminPaymentController.php`** (around line 311):
```php
\Log::info('PaymentApproved event being fired', ['payment_id' => $payment->id]);
event(new PaymentApproved($payment->fresh(), $context));
```

Then check logs:
```bash
tail -f storage/logs/laravel.log
```

## Common Issues & Solutions

### Issue 1: Queue Worker Not Running
**Symptoms**: No emails sent, no jobs processed

**Solution**:
```bash
# Start worker manually (for testing)
cd ~/e-commerce.biruklemma.com/biruklir
php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600 >> storage/logs/queue-worker.log 2>&1 &

# Or set up cron job (recommended)
# In cPanel Cron Jobs, add:
* * * * * sleep $((RANDOM % 60)) && cd ~/e-commerce.biruklemma.com/biruklir && /opt/alt/php83/usr/bin/php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600 >> storage/logs/queue-worker.log 2>&1
```

### Issue 2: Worker Only Processing One Queue
**Symptoms**: Listeners queued but mail jobs never dispatched

**Solution**: Update cron job to process both queues:
```bash
--queue=emails,default
```

### Issue 3: Listeners Failing Silently
**Symptoms**: Events fired, listeners queued, but no mail jobs dispatched

**Solution**: Check logs for errors. The updated listeners now have comprehensive logging. Look for:
- `[SendOrderNotifications] Error processing event`
- `[SendPaymentNotifications] Error processing event`
- `[SendProductRequestNotifications] Error processing event`

### Issue 4: Database Connection Issues
**Symptoms**: Jobs queued but not processed, database errors in logs

**Solution**: Verify database connection in `.env`:
```bash
php artisan config:show database
```

### Issue 5: Missing Model Relationships
**Symptoms**: "Trying to get property of non-object" errors

**Solution**: Ensure models have proper relationships loaded. Check logs for specific errors.

### Issue 6: Mail Configuration Issues
**Symptoms**: Jobs processed but emails not sent

**Solution**: Test mail configuration:
```bash
php artisan tinker
>>> Mail::raw('Test email', function($msg) { $msg->to('your@email.com')->subject('Test'); });
```

## Quick Verification Commands

Run these commands to quickly check the system:

```bash
cd ~/e-commerce.biruklemma.com/biruklir

# 1. Check queue worker
ps aux | grep "queue:work" | grep -v grep

# 2. Check pending jobs
php artisan queue:work --queue=emails,default --once

# 3. Check failed jobs
php artisan queue:failed

# 4. Check recent logs
tail -n 50 storage/logs/laravel.log | grep -E "(SendOrderNotifications|SendPaymentNotifications|SendProductRequestNotifications|queue)"

# 5. Check queue table
php artisan tinker --execute="echo 'Pending: ' . DB::table('jobs')->count() . PHP_EOL; echo 'Failed: ' . DB::table('failed_jobs')->count() . PHP_EOL;"
```

## Testing the Fix

After fixing issues, test by:

1. **Create a test order** (if possible in your app)
2. **Watch the logs**:
   ```bash
   tail -f storage/logs/laravel.log | grep -E "(SendOrderNotifications|SendOrderConfirmationEmail)"
   ```
3. **Check the queue**:
   ```bash
   php artisan queue:work --queue=emails,default --once
   ```
4. **Verify email was sent** (check your email inbox)

## What Was Fixed

The listeners have been updated with:
1. **Explicit queue assignment** (`public $queue = 'default'`)
2. **Comprehensive logging** (all events, errors, warnings)
3. **Better error handling** (exceptions are logged and re-thrown)
4. **Null safety checks** (prevents "property of non-object" errors)

## Next Steps

1. **Upload the updated listener files** to your server
2. **Run the diagnostic script** to identify the issue
3. **Check the logs** for specific errors
4. **Verify queue worker** is processing both queues
5. **Test with a real order/payment** and monitor logs

## Still Not Working?

If emails still aren't sending after following this guide:

1. **Share the diagnostic script output**
2. **Share relevant log entries** (last 100 lines of laravel.log)
3. **Share queue:failed output** if there are failed jobs
4. **Share queue worker process info** (`ps aux | grep queue:work`)

This will help identify the specific issue.

