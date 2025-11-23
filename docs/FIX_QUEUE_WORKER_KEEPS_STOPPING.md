# Fix: Queue Worker Keeps Stopping

## Problem
The queue worker stops after running for a while (usually after 1 hour due to `--max-time=3600`), and the cron job isn't restarting it properly.

## Root Causes

1. **Worker hits `--max-time=3600` limit** (1 hour) and stops
2. **Cron job doesn't check if worker is already running** - may start multiple workers or fail to restart
3. **Cron job has wrong path or PHP version**
4. **Worker crashes due to errors** and cron doesn't restart it
5. **Cron job not running at all**

## Solution: Smart Cron Job Configuration

### Recommended: Option 1 - Check Before Starting (BEST)

This cron job only starts a worker if one isn't already running:

**In cPanel Cron Jobs:**

**Schedule:** Every 5 minutes
- Minute: `*/5`
- Hour: `*`
- Day: `*`
- Month: `*`
- Weekday: `*`

**Command:**
```bash
pgrep -f 'queue:work.*emails' > /dev/null || cd ~/e-commerce.biruklemma.com/biruklir && /opt/alt/php83/usr/bin/php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600 >> storage/logs/queue-worker.log 2>&1 &
```

**What it does:**
- `pgrep -f 'queue:work.*emails'` - Checks if worker is running
- `> /dev/null` - Suppresses output
- `||` - Only runs if check fails (worker not running)
- `&` - Runs in background

**Advantages:**
- ✅ Prevents multiple workers
- ✅ Auto-restarts if worker stops
- ✅ Runs every 5 minutes (checks frequently)
- ✅ Won't interfere with running worker

### Alternative: Option 2 - Every Minute with Random Delay

**Schedule:** Every minute
- Minute: `*`
- Hour: `*`
- Day: `*`
- Month: `*`
- Weekday: `*`

**Command:**
```bash
sleep $((RANDOM % 60)) && cd ~/e-commerce.biruklemma.com/biruklir && /opt/alt/php83/usr/bin/php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600 >> storage/logs/queue-worker.log 2>&1
```

**What it does:**
- Runs every minute with random 0-60 second delay
- Worker stops after 1 hour
- Cron restarts it within 1 minute

**Disadvantages:**
- ⚠️ May start multiple workers if timing overlaps
- ⚠️ Less efficient (runs even if worker is running)

## Step-by-Step Fix

### Step 1: Run Diagnostic
```bash
cd ~/e-commerce.biruklemma.com/biruklir
php diagnose-cron-queue-worker.php
```

This will show:
- Current cron job configuration
- Worker status
- Recent log activity
- Recommendations

### Step 2: Check Current Cron Job
```bash
crontab -l
```

Look for a line with `queue:work`. Note what it says.

### Step 3: Update Cron Job in cPanel

1. **Go to cPanel → Cron Jobs**
2. **Find your queue worker cron job** (or create new one)
3. **Edit it** with Option 1 (recommended) above
4. **Save**

### Step 4: Verify It's Working

Wait 5-10 minutes, then check:

```bash
# Check if worker is running
ps aux | grep "queue:work" | grep -v grep

# Check logs
tail -f storage/logs/queue-worker.log

# Check pending jobs
php artisan tinker --execute="echo 'Pending: ' . DB::table('jobs')->count() . PHP_EOL;"
```

## Troubleshooting

### Issue: Cron Job Not Running

**Check:**
```bash
# View cron jobs
crontab -l

# Check cron service (if accessible)
systemctl status crond
```

**Fix:**
- Verify cron job is saved in cPanel
- Check cron job syntax
- Verify paths are correct
- Check PHP path: `which php` or `/opt/alt/php83/usr/bin/php`

### Issue: Worker Still Stops

**Check logs:**
```bash
tail -n 100 storage/logs/queue-worker.log
tail -n 100 storage/logs/laravel.log | grep -i error
```

**Possible causes:**
- Memory limit exceeded
- PHP fatal error
- Timeout issues
- Database connection lost

**Fix:**
- Increase PHP memory limit in `.env`: `PHP_MEMORY_LIMIT=512M`
- Check for errors in logs
- Increase `--timeout` value
- Check database connection

### Issue: Multiple Workers Running

**Check:**
```bash
ps aux | grep "queue:work" | grep -v grep | wc -l
```

If count > 1, you have multiple workers.

**Fix:**
- Use Option 1 (pgrep check) instead of Option 2
- Kill extra workers: `pkill -f 'queue:work'`
- Restart with correct cron job

### Issue: Worker Not Processing Jobs

**Check:**
```bash
# Check pending jobs
php artisan tinker --execute="echo 'Pending: ' . DB::table('jobs')->count() . PHP_EOL;"

# Check job queue name
php artisan tinker --execute="DB::table('jobs')->select('queue')->distinct()->get();"
```

**Fix:**
- Verify worker queue matches job queue: `--queue=emails,default`
- Check if jobs are in correct queue
- Restart worker

## Best Practices

### 1. Use Smart Cron (Option 1)
Always use the `pgrep` check to prevent multiple workers.

### 2. Monitor Worker Health
Set up monitoring to alert if:
- Worker stops running
- Pending jobs accumulate
- Failed jobs increase

### 3. Regular Maintenance
```bash
# Clean old failed jobs (weekly)
php artisan queue:prune-failed --hours=168

# Check worker status (daily)
ps aux | grep "queue:work" | grep -v grep
```

### 4. Log Rotation
Ensure log files don't grow too large:
```bash
# Rotate logs (add to cron, weekly)
find storage/logs -name "*.log" -size +100M -exec truncate -s 50M {} \;
```

## Quick Reference

### Recommended Cron Job
```bash
*/5 * * * * pgrep -f 'queue:work.*emails' > /dev/null || cd ~/e-commerce.biruklemma.com/biruklir && /opt/alt/php83/usr/bin/php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600 >> storage/logs/queue-worker.log 2>&1 &
```

### Verify Worker
```bash
ps aux | grep "queue:work" | grep -v grep
```

### Check Logs
```bash
tail -f storage/logs/queue-worker.log
```

### Manual Start (for testing)
```bash
cd ~/e-commerce.biruklemma.com/biruklir
php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600 >> storage/logs/queue-worker.log 2>&1 &
```

## Expected Behavior

After fixing:
1. ✅ Worker runs continuously
2. ✅ Cron restarts worker if it stops (within 5 minutes)
3. ✅ Only one worker runs at a time
4. ✅ Jobs are processed automatically
5. ✅ Emails are sent successfully

## Next Steps

1. Run diagnostic: `php diagnose-cron-queue-worker.php`
2. Update cron job with Option 1
3. Wait 5-10 minutes
4. Verify worker is running
5. Test by creating an order/payment
6. Monitor logs for 24 hours

