# Troubleshooting Queue Worker

## Issue: Log File Doesn't Exist Yet

The `queue-worker.log` file won't exist until the queue worker actually runs and writes to it. This is normal!

---

## Step 1: Check if Queue Worker is Running

**In Terminal, run:**
```bash
ps aux | grep "queue:work" | grep -v grep
```

**Expected Results:**
- **If you see output:** Worker is running! ✓ (log will be created soon)
- **If no output:** Worker hasn't started yet (wait a bit, or see Step 2)

---

## Step 2: Wait and Check Again

Since your cron job has a random sleep (0-60 seconds), it might take up to a minute to start.

**Wait 1-2 minutes, then check again:**
```bash
ps aux | grep "queue:work" | grep -v grep
ls -lh storage/logs/queue-worker.log 2>/dev/null && echo "Log exists!" || echo "Log not created yet"
```

---

## Step 3: Manually Test the Command

To verify the command works, run it manually:

**In Terminal (make sure you're in the biruklir directory):**
```bash
cd ~/e-commerce.biruklemma.com/biruklir
/opt/alt/php83/usr/bin/php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600 >> storage/logs/queue-worker.log 2>&1 &
```

**This will:**
- Start the worker in the background
- Create the log file immediately
- Let you see if there are any errors

**Then check:**
```bash
ps aux | grep "queue:work" | grep -v grep
ls -lh storage/logs/queue-worker.log
tail -f storage/logs/queue-worker.log
```

**Press `Ctrl+C` to stop watching the log.**

---

## Step 4: Check for Errors

If the worker isn't starting, check for errors:

**Test the command without backgrounding:**
```bash
cd ~/e-commerce.biruklemma.com/biruklir
/opt/alt/php83/usr/bin/php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600
```

**Look for any error messages.**

**Common issues:**
- PHP path incorrect
- Database connection issues
- Missing dependencies
- Permission problems

---

## Step 5: Verify Cron Job Command

**Double-check your cron job command is correct:**

It should be:
```bash
sleep $((RANDOM % 60)) && cd ~/e-commerce.biruklemma.com/biruklir && /opt/alt/php83/usr/bin/php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600 >> storage/logs/queue-worker.log 2>&1
```

**Make sure:**
- The path `~/e-commerce.biruklemma.com/biruklir` is correct
- The PHP path `/opt/alt/php83/usr/bin/php` is correct
- The log path `storage/logs/queue-worker.log` is relative to the biruklir directory

---

## Step 6: Check Cron Job Logs

**In cPanel, check if cron jobs are running:**

1. Go to **Cron Jobs**
2. Look for **"Cron Email"** or **"Cron Log"** section
3. Check if there are any error emails from cron

**Or check system cron logs:**
```bash
grep CRON /var/log/cron 2>/dev/null | tail -20
```

---

## Step 7: Test with a Simpler Command First

**Try a simpler version to test:**

```bash
cd ~/e-commerce.biruklemma.com/biruklir && /opt/alt/php83/usr/bin/php artisan queue:work --queue=emails,default --once
```

**This will:**
- Process one job and exit
- Show any errors immediately
- Help verify the setup works

---

## Step 8: Check Laravel Logs

**Check the main Laravel log for errors:**
```bash
tail -n 50 storage/logs/laravel.log
```

**Look for:**
- Database connection errors
- Queue-related errors
- Permission errors

---

## Quick Diagnostic Commands

**Run these to get a full picture:**

```bash
# 1. Check if worker is running
ps aux | grep "queue:work" | grep -v grep

# 2. Check if log exists
ls -lh storage/logs/queue-worker.log 2>/dev/null || echo "Log not created yet"

# 3. Check Laravel log for errors
tail -n 20 storage/logs/laravel.log

# 4. Test queue connection
cd ~/e-commerce.biruklemma.com/biruklir
/opt/alt/php83/usr/bin/php artisan queue:work --once --queue=emails

# 5. Check database tables
/opt/alt/php83/usr/bin/php artisan tinker --execute="echo 'Jobs: ' . DB::table('jobs')->count() . PHP_EOL;"
```

---

## Expected Behavior

**Normal flow:**
1. Cron job runs every minute
2. Random sleep (0-60 seconds) prevents conflicts
3. Worker starts and creates log file
4. Worker processes jobs continuously
5. Worker restarts every hour (max-time=3600)

**Timeline:**
- **0-60 seconds:** Random sleep
- **After sleep:** Worker starts
- **Immediately:** Log file created
- **Ongoing:** Jobs processed as they come in

---

## If Still Not Working

1. **Verify PHP path:**
   ```bash
   which php
   /opt/alt/php83/usr/bin/php --version
   ```

2. **Verify Laravel works:**
   ```bash
   cd ~/e-commerce.biruklemma.com/biruklir
   /opt/alt/php83/usr/bin/php artisan --version
   ```

3. **Check permissions:**
   ```bash
   ls -la storage/logs/
   chmod -R 775 storage/
   ```

4. **Test database connection:**
   ```bash
   /opt/alt/php83/usr/bin/php artisan tinker --execute="DB::connection()->getPdo(); echo 'DB OK';"
   ```

---

## Alternative: Remove Random Sleep for Testing

**Temporarily modify cron job to remove random sleep for testing:**

```bash
cd ~/e-commerce.biruklemma.com/biruklir && /opt/alt/php83/usr/bin/php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600 >> storage/logs/queue-worker.log 2>&1
```

**This will start immediately every minute. Once confirmed working, add the random sleep back.**

