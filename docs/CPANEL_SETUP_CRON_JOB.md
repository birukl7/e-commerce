# Setting Up Queue Worker Cron Job in cPanel

Your verification shows everything is configured correctly, but the queue worker isn't running. Let's set it up!

---

## ⚠️ Already Have Cron Jobs? Modify Existing One!

If you already have cron jobs set up (especially one for your e-commerce app), **modify it instead of creating a new one**.

**Current Issue:** Your existing cron jobs use `--stop-when-empty`, which means the worker stops after processing all jobs. For continuous email processing, we need the worker to keep running.

**Solution:** Modify your existing e-commerce cron job to use continuous processing.

### Quick Fix for Existing Cron Job

1. **In cPanel Cron Jobs**, find the cron job for your e-commerce app:
   ```
   sleep $((RANDOM % 60)) && /opt/alt/php83/usr/bin/php ~/e-commerce.biruklemma.com/biruklir/artisan queue:work --stop-when-empty
   ```

2. **Click "Edit" or the edit icon** next to that cron job

3. **Replace the Command with:**
   ```bash
   sleep $((RANDOM % 60)) && cd ~/e-commerce.biruklemma.com/biruklir && /opt/alt/php83/usr/bin/php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600 >> storage/logs/queue-worker.log 2>&1
   ```

4. **Save the changes**

**What Changed:**
- ✅ Removed `--stop-when-empty` (worker now runs continuously)
- ✅ Added `--queue=emails,default` (processes email queue first)
- ✅ Added proper retry and timeout settings
- ✅ Added logging to `queue-worker.log`
- ✅ Added `cd` to ensure we're in the right directory

**The random sleep is fine** - it helps prevent multiple workers from starting at the same time.

---

## Step 1: Get Your Application Path

**In Terminal, run:**
```bash
pwd
```

**Copy the full path** that's shown (e.g., `/home/username/public_html` or `/home/username/domains/yourdomain.com/public_html`)

**You'll need this path for the Cron Job command.**

---

## Step 2: Access Cron Jobs in cPanel

1. **Go back to cPanel dashboard** (click the cPanel logo or navigate back)
2. **Scroll down** to find the **"Advanced"** section
3. **Click on "Cron Jobs"** (might have a clock icon)
   - If you can't find it, use the search box at the top and type "cron"

---

## Step 3: Add New Cron Job

1. **Click "Add New Cron Job"** or "Create a New Cron Job" button
2. **You'll see a form with these fields:**
   - Common Settings (dropdown)
   - Minute
   - Hour
   - Day
   - Month
   - Weekday
   - Command

---

## Step 4: Configure the Cron Job

### Option A: Using "Common Settings" Dropdown (Easiest)

1. **Select "Every Minute"** from the "Common Settings" dropdown
   - This automatically fills in: `* * * * *`

2. **In the "Command" field, paste this:**
   ```bash
   cd /YOUR_APPLICATION_PATH && php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600 >> storage/logs/queue-worker.log 2>&1
   ```
   
   **Replace `/YOUR_APPLICATION_PATH`** with the path from Step 1 (the `pwd` output)

   **Example:**
   ```bash
   cd /home/myusername/public_html && php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600 >> storage/logs/queue-worker.log 2>&1
   ```

### Option B: Manual Configuration

If the dropdown doesn't work, fill in manually:

- **Minute:** `*`
- **Hour:** `*`
- **Day:** `*`
- **Month:** `*`
- **Weekday:** `*`
- **Command:** (same as above)

---

## Step 5: Save the Cron Job

1. **Click "Add New Cron Job"** or "Create" button
2. **You should see a success message**
3. **The Cron Job should appear in your list**

---

## Step 6: Verify It's Working

### Wait 1-2 minutes, then check:

**In Terminal, run:**
```bash
ps aux | grep "queue:work" | grep -v grep
```

**Expected:** You should now see a process running!

**Also check the log:**
```bash
ls -lh storage/logs/queue-worker.log
tail -n 20 storage/logs/queue-worker.log
```

**Expected:** Log file should exist and show activity

---

## Step 7: Test the Queue System

**In Terminal:**
```bash
php artisan queue:work --once --queue=emails
```

**Expected:** 
- If jobs are queued: Processes one job
- If no jobs: Shows "No jobs available" (this is OK - means no emails to send right now)

---

## Troubleshooting

### Issue: Cron Job Not Running

**Check:**
1. Verify the path in the command is correct
2. Make sure PHP path is correct (some servers use `/usr/bin/php` instead of `php`)
3. Try using full PHP path:
   ```bash
   cd /YOUR_APPLICATION_PATH && /usr/bin/php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600 >> storage/logs/queue-worker.log 2>&1
   ```

**To find PHP path:**
```bash
which php
```

### Issue: Permission Denied

**Check file permissions:**
```bash
chmod -R 775 storage/
chmod -R 775 bootstrap/cache/
```

### Issue: Log File Not Created

**Wait a few minutes** - Cron Jobs run on schedule (every minute in this case)

**Or manually test:**
```bash
cd /YOUR_APPLICATION_PATH
php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600 >> storage/logs/queue-worker.log 2>&1 &
```

**Then check:**
```bash
ps aux | grep queue:work
ls -lh storage/logs/queue-worker.log
```

---

## Alternative: Manual Start (For Testing)

If you want to test before setting up Cron Job:

**In Terminal:**
```bash
cd /YOUR_APPLICATION_PATH
nohup php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600 >> storage/logs/queue-worker.log 2>&1 &
```

**This starts the worker in the background.**
**Note:** This will stop if your Terminal session ends. Cron Job is better for production.

---

## Understanding the Command

Let's break down what the Cron Job command does:

```bash
cd /YOUR_APPLICATION_PATH
```
- Changes to your Laravel application directory

```bash
php artisan queue:work
```
- Runs Laravel's queue worker

```bash
--queue=emails,default
```
- Processes jobs from 'emails' queue first, then 'default' queue

```bash
--sleep=3
```
- Waits 3 seconds between checking for new jobs

```bash
--tries=5
```
- Retries failed jobs up to 5 times

```bash
--timeout=300
```
- Each job can run for up to 5 minutes (300 seconds)

```bash
--max-time=3600
```
- Worker restarts after 1 hour (3600 seconds) to prevent memory leaks

```bash
>> storage/logs/queue-worker.log 2>&1
```
- Sends all output (including errors) to the log file

---

## Monitoring Your Queue Worker

### Check if it's running:
```bash
ps aux | grep queue:work
```

### Watch the log in real-time:
```bash
tail -f storage/logs/queue-worker.log
```
(Press `Ctrl+C` to stop watching)

### Check for failed jobs:
```bash
php artisan queue:failed
```

### Retry failed jobs:
```bash
php artisan queue:retry all
```

---

## Next Steps

After setting up the Cron Job:

1. ✅ Wait 1-2 minutes
2. ✅ Verify worker is running: `ps aux | grep queue:work`
3. ✅ Check log file: `ls -lh storage/logs/queue-worker.log`
4. ✅ Test email sending (create an order, etc.)
5. ✅ Monitor logs: `tail -f storage/logs/queue-worker.log`

---

## Quick Reference

**Cron Job Command:**
```bash
cd /YOUR_APPLICATION_PATH && php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600 >> storage/logs/queue-worker.log 2>&1
```

**Schedule:** Every minute (`* * * * *`)

**Verify:**
```bash
ps aux | grep queue:work
tail -f storage/logs/queue-worker.log
```

---

**You're almost done! Just set up the Cron Job and your mail jobs will start working! 🚀**

