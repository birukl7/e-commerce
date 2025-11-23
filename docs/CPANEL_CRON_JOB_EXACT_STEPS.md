# Exact Steps to Fix Cron Job in cPanel

## Current Problem
Your cron job runs every minute, but the worker stops after 1 hour and isn't being restarted properly.

## Solution: Update Cron Job

### Step 1: Access cPanel Cron Jobs

1. **Login to cPanel**
2. **Scroll down** to find **"Advanced"** section
3. **Click "Cron Jobs"** (clock icon)
   - Or search for "cron" in the search box

### Step 2: Find Your Queue Worker Cron Job

1. **Look for a cron job** with `queue:work` in the command
2. **Click the "Edit" button** (pencil icon) next to it
   - Or click on the cron job row to edit

### Step 3: Update the Cron Job

You'll see a form with these fields. Update them as follows:

#### Option A: Every 5 Minutes (Recommended)

**Common Settings:** Select "Every 5 Minutes" from dropdown
- OR manually set:
  - **Minute:** `*/5`
  - **Hour:** `*`
  - **Day:** `*`
  - **Month:** `*`
  - **Weekday:** `*`

**Command:**
```bash
pgrep -f 'queue:work.*emails' > /dev/null || cd ~/e-commerce.biruklemma.com/biruklir && /opt/alt/php83/usr/bin/php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600 >> storage/logs/queue-worker.log 2>&1 &
```

#### Option B: Every Minute (Alternative)

**Common Settings:** Select "Every Minute" from dropdown
- OR manually set:
  - **Minute:** `*`
  - **Hour:** `*`
  - **Day:** `*`
  - **Month:** `*`
  - **Weekday:** `*`

**Command:**
```bash
pgrep -f 'queue:work.*emails' > /dev/null || sleep $((RANDOM % 60)) && cd ~/e-commerce.biruklemma.com/biruklir && /opt/alt/php83/usr/bin/php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600 >> storage/logs/queue-worker.log 2>&1 &
```

### Step 4: Save

1. **Click "Edit Cron Job"** or **"Update"** button
2. **You should see a success message**

### Step 5: Verify (Wait 5-10 Minutes)

After saving, wait 5-10 minutes, then check:

**In Terminal:**
```bash
# Check if worker is running
ps aux | grep "queue:work" | grep -v grep

# Check logs
tail -f storage/logs/queue-worker.log
```

**Expected:**
- You should see a worker process running
- Logs should show "Processing jobs from the [emails,default] queues."

## What Changed?

### Before (Your Current Setup):
```bash
* * * * * sleep $((RANDOM % 60)) && cd ~/e-commerce.biruklemma.com/biruklir && /opt/alt/php83/usr/bin/php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600 >> storage/logs/queue-worker.log 2>&1
```

**Problems:**
- ❌ No check if worker is already running
- ❌ May start multiple workers
- ❌ Worker stops after 1 hour, cron may not restart it properly

### After (Fixed):
```bash
*/5 * * * * pgrep -f 'queue:work.*emails' > /dev/null || cd ~/e-commerce.biruklemma.com/biruklir && /opt/alt/php83/usr/bin/php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600 >> storage/logs/queue-worker.log 2>&1 &
```

**Improvements:**
- ✅ Checks if worker is running (`pgrep`)
- ✅ Only starts if not running (`||`)
- ✅ Prevents multiple workers
- ✅ Auto-restarts reliably
- ✅ Runs in background (`&`)

## Understanding the Command

```bash
pgrep -f 'queue:work.*emails' > /dev/null || cd ~/e-commerce.biruklemma.com/biruklir && /opt/alt/php83/usr/bin/php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600 >> storage/logs/queue-worker.log 2>&1 &
```

**Breaking it down:**
- `pgrep -f 'queue:work.*emails'` - Searches for running queue worker process
- `> /dev/null` - Hides output (we don't need to see it)
- `||` - Logical OR: only runs next command if pgrep fails (no worker found)
- `cd ~/e-commerce.biruklemma.com/biruklir` - Changes to app directory
- `&&` - Logical AND: runs next command only if cd succeeds
- `/opt/alt/php83/usr/bin/php artisan queue:work ...` - Starts the worker
- `>> storage/logs/queue-worker.log 2>&1` - Logs output
- `&` - Runs in background

## Troubleshooting

### Issue: Cron Job Not Saving

**Check:**
- Make sure you're using the correct PHP path (`/opt/alt/php83/usr/bin/php`)
- Verify the application path is correct
- Check for syntax errors in the command

**To find PHP path:**
```bash
which php
# Or
/opt/alt/php83/usr/bin/php --version
```

### Issue: Worker Still Not Starting

**Check cron job is running:**
```bash
# View cron jobs
crontab -l

# Check cron service (if accessible)
systemctl status crond
```

**Manual test:**
```bash
# Run the command manually to test
cd ~/e-commerce.biruklemma.com/biruklir
pgrep -f 'queue:work.*emails' > /dev/null || /opt/alt/php83/usr/bin/php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600 >> storage/logs/queue-worker.log 2>&1 &
```

### Issue: Multiple Workers

**Check:**
```bash
ps aux | grep "queue:work" | grep -v grep | wc -l
```

If count > 1, you have multiple workers.

**Fix:**
```bash
# Kill all workers
pkill -f 'queue:work'

# Wait a minute, then check cron job restarts one
ps aux | grep "queue:work" | grep -v grep
```

## Quick Reference

**Recommended Cron Job:**
- **Schedule:** Every 5 minutes (`*/5 * * * *`)
- **Command:** See Option A above

**Verify:**
```bash
ps aux | grep "queue:work" | grep -v grep
tail -f storage/logs/queue-worker.log
```

## Next Steps

1. ✅ Update cron job in cPanel
2. ✅ Wait 5-10 minutes
3. ✅ Verify worker is running
4. ✅ Check logs for activity
5. ✅ Test by creating an order/payment

