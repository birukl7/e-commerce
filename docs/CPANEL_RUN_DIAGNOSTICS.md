# Running Email Queue Diagnostics on cPanel

## Quick Start

### Step 1: Access Terminal
1. Log into cPanel
2. Find **Terminal** (usually under "Advanced" section)
3. Click to open terminal

### Step 2: Navigate to Application Directory
```bash
cd ~/e-commerce.biruklemma.com/biruklir
```

### Step 3: Run Diagnostic Script
```bash
php diagnose-email-queue.php
```

This will show you:
- ✅ Queue configuration
- ✅ Pending/failed jobs count
- ✅ Queue worker status
- ✅ Event/listener registration
- ✅ Recent logs
- ✅ Mail configuration
- ✅ Notification outbox status

## Quick Diagnostic Commands

### Check Queue Worker Status
```bash
ps aux | grep "queue:work" | grep -v grep
```

**Expected output**: Should show a process running with `--queue=emails,default`

### Check Pending Jobs
```bash
php artisan tinker --execute="echo 'Pending: ' . DB::table('jobs')->count() . PHP_EOL; echo 'Failed: ' . DB::table('failed_jobs')->count() . PHP_EOL;"
```

### Check Recent Logs for Listener Activity
```bash
tail -n 100 storage/logs/laravel.log | grep -E "(SendOrderNotifications|SendPaymentNotifications|SendProductRequestNotifications)"
```

### Check Queue Worker Logs
```bash
tail -f storage/logs/queue-worker.log
```

### Check Failed Jobs
```bash
php artisan queue:failed
```

## What to Look For

### ✅ Good Signs
- Queue worker is running
- Worker processes both `emails` and `default` queues
- Recent listener logs show "Listener triggered"
- Recent listener logs show "Dispatching [JobName]"
- No failed jobs (or old failed jobs only)

### ⚠️ Warning Signs
- Queue worker not running → **Start it**
- Worker only processing one queue → **Update cron job**
- No listener logs → **Events not being fired or listeners not queued**
- Many failed jobs → **Check error messages**
- Pending jobs not decreasing → **Worker not processing**

## Common Issues & Quick Fixes

### Issue: Queue Worker Not Running
```bash
# Start worker manually
cd ~/e-commerce.biruklemma.com/biruklir
php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600 >> storage/logs/queue-worker.log 2>&1 &
```

### Issue: Worker Only Processing One Queue
Check your cron job:
```bash
crontab -l
```

Should show:
```
* * * * * sleep $((RANDOM % 60)) && cd ~/e-commerce.biruklemma.com/biruklir && /opt/alt/php83/usr/bin/php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600 >> storage/logs/queue-worker.log 2>&1
```

### Issue: No Listener Logs
This means either:
1. Events aren't being fired (check if orders/payments are being created)
2. Listeners aren't being queued (check queue configuration)

Test by creating a test order and watching logs:
```bash
tail -f storage/logs/laravel.log
```

### Issue: Jobs Queued But Not Processing
```bash
# Process one job manually to see errors
php artisan queue:work --queue=emails,default --once
```

## Full Diagnostic Workflow

Run these commands in sequence:

```bash
# 1. Navigate to app directory
cd ~/e-commerce.biruklemma.com/biruklir

# 2. Run full diagnostic
php diagnose-email-queue.php

# 3. Check queue worker
ps aux | grep "queue:work" | grep -v grep

# 4. Check pending/failed jobs
php artisan queue:failed
php artisan tinker --execute="echo 'Pending: ' . DB::table('jobs')->count() . PHP_EOL;"

# 5. Check recent listener activity
tail -n 50 storage/logs/laravel.log | grep -E "(SendOrderNotifications|SendPaymentNotifications|SendProductRequestNotifications)"

# 6. Watch logs in real-time (Ctrl+C to stop)
tail -f storage/logs/laravel.log | grep -E "(SendOrderNotifications|SendPaymentNotifications|SendProductRequestNotifications|queue)"
```

## Testing Email Flow

After running diagnostics, test the email flow:

1. **Create a test order** (if possible in your app)
2. **Watch logs in real-time**:
   ```bash
   tail -f storage/logs/laravel.log
   ```
3. **Look for these log entries**:
   - `[SendOrderNotifications] Listener triggered`
   - `[SendOrderNotifications] Dispatching SendOrderConfirmationEmail`
   - `[SendOrderConfirmationEmail] Job started`
   - `[SendOrderConfirmationEmail] Job completed`

4. **Check if job was queued**:
   ```bash
   php artisan tinker --execute="DB::table('jobs')->orderBy('id', 'desc')->limit(5)->get(['id', 'queue', 'payload', 'created_at']);"
   ```

5. **Process jobs manually** (if needed):
   ```bash
   php artisan queue:work --queue=emails,default --once
   ```

## Next Steps

After running diagnostics:

1. **Share the diagnostic output** if you need help interpreting it
2. **Check the troubleshooting guide**: `docs/EMAIL_NOT_SENDING_TROUBLESHOOTING.md`
3. **Verify queue worker is running continuously** (via cron job)
4. **Test with a real order/payment** and monitor logs

## Quick Reference

| Command | Purpose |
|--------|---------|
| `php diagnose-email-queue.php` | Full diagnostic report |
| `ps aux \| grep queue:work` | Check if worker is running |
| `php artisan queue:failed` | List failed jobs |
| `tail -f storage/logs/laravel.log` | Watch logs in real-time |
| `php artisan queue:work --queue=emails,default --once` | Process one job manually |

