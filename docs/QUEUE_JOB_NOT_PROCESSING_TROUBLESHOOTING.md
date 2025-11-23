# Queue Job Not Processing - Troubleshooting Guide

## Problem
A job appears in the `jobs` table but isn't being processed, or an expected email isn't being sent.

## Quick Diagnosis

Run the diagnostic script:
```bash
cd ~/e-commerce.biruklemma.com/biruklir
php diagnose-queue-job.php
```

Or check a specific job:
```bash
php diagnose-queue-job.php {job_id}
```

## Common Issues

### 1. Queue Worker Not Running
**Symptom:** Jobs in database but no worker process

**Check:**
```bash
ps aux | grep "queue:work" | grep -v grep
```

**Fix:**
```bash
cd ~/e-commerce.biruklemma.com/biruklir
php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600 >> storage/logs/queue-worker.log 2>&1 &
```

### 2. Job in Wrong Queue
**Symptom:** Job exists but worker isn't processing it

**Check:**
```bash
# Check job queue
php artisan tinker
DB::table('jobs')->select('id', 'queue', 'payload')->get();

# Check worker queues
ps aux | grep "queue:work"
```

**Fix:** Ensure worker processes the correct queue:
```bash
php artisan queue:work --queue=emails,default ...
```

### 3. Job Stuck (Reserved but Not Processing)
**Symptom:** Job has `reserved_at` timestamp but isn't being processed

**Check:**
```bash
php artisan tinker
$job = DB::table('jobs')->find({job_id});
echo "Reserved: " . ($job->reserved_at ? date('Y-m-d H:i:s', $job->reserved_at) : 'No') . "\n";
echo "Age: " . ($job->reserved_at ? (time() - $job->reserved_at) . " seconds" : 'N/A') . "\n";
```

**Fix:**
```bash
# Restart queue worker (releases stuck jobs)
php artisan queue:restart

# Or manually release
php artisan tinker
DB::table('jobs')->where('id', {job_id})->update(['reserved_at' => null]);
```

### 4. Job Failed Silently
**Symptom:** Job disappeared from `jobs` table but email wasn't sent

**Check:**
```bash
php artisan queue:failed
```

**Fix:**
```bash
# Retry failed job
php artisan queue:retry {id}

# Or retry all
php artisan queue:retry all
```

### 5. Payment Email Flow Issue
**Important:** The payment email flow is designed to wait for admin approval:

- **PaymentCompleted event:** No customer email sent (intentional)
- **PaymentApproved event:** Customer email sent (`SendPaymentApprovedEmail`)

**If you expect an email immediately after payment:**
- This is by design - emails are sent only after admin approval
- The job in the database is likely the `SendPaymentNotifications` listener, which processed successfully but didn't send an email (as designed)

**To verify:**
```bash
# Check what job is in the database
php artisan tinker
$job = DB::table('jobs')->orderBy('id', 'desc')->first();
$payload = json_decode($job->payload, true);
echo $payload['displayName'] ?? 'Unknown';
```

## Step-by-Step Diagnosis

### Step 1: Check Queue Worker
```bash
ps aux | grep "queue:work" | grep -v grep
```

**If not running:**
- Start the worker (see Quick Fixes below)
- Check cron job is configured correctly

### Step 2: Check Pending Jobs
```bash
php artisan tinker
echo "Pending: " . DB::table('jobs')->count() . "\n";
```

**If jobs exist:**
- Check job details (queue, class, attempts)
- Verify worker is processing the correct queue

### Step 3: Check Failed Jobs
```bash
php artisan queue:failed
```

**If failed jobs exist:**
- Review error messages
- Retry if appropriate

### Step 4: Check Logs
```bash
# Queue worker logs
tail -f storage/logs/queue-worker.log

# Laravel logs
tail -f storage/logs/laravel.log | grep -E "(job|queue|SendPayment|SendOrder)"
```

### Step 5: Check Job Details
```bash
php artisan tinker
$job = DB::table('jobs')->find({job_id});
$payload = json_decode($job->payload, true);
print_r([
    'class' => $payload['displayName'] ?? 'Unknown',
    'queue' => $job->queue ?? 'default',
    'attempts' => $job->attempts ?? 0,
    'reserved_at' => $job->reserved_at ? date('Y-m-d H:i:s', $job->reserved_at) : null,
    'created_at' => $job->created_at ?? null,
]);
```

## Quick Fixes

### Fix 1: Start Queue Worker
```bash
cd ~/e-commerce.biruklemma.com/biruklir
php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600 >> storage/logs/queue-worker.log 2>&1 &
```

### Fix 2: Restart Queue Worker (Releases Stuck Jobs)
```bash
php artisan queue:restart
# Wait a few seconds, then start worker again
```

### Fix 3: Retry Failed Jobs
```bash
php artisan queue:retry all
```

### Fix 4: Clear Stuck Jobs
```bash
php artisan tinker
# Release all reserved jobs older than 5 minutes
DB::table('jobs')
    ->where('reserved_at', '<', time() - 300)
    ->update(['reserved_at' => null, 'attempts' => 0]);
```

### Fix 5: Process Jobs Manually (One-Time)
```bash
php artisan queue:work --once --queue=emails,default
```

## Understanding Payment Email Flow

### Current Design:
1. **User pays** → `PaymentCompleted` event fired
2. **Listener processes** → Intentionally does NOT send customer email
3. **Admin approves** → `PaymentApproved` event fired
4. **Email sent** → `SendPaymentApprovedEmail` dispatched

### Why This Design?
- Prevents sending emails for payments that might be rejected
- Ensures customers only get emails for approved payments
- Reduces confusion and support requests

### If You Want Immediate Emails:
You would need to modify `SendPaymentNotifications` to send a confirmation email on `PaymentCompleted` (before admin approval). However, this is not recommended as it can confuse customers if payment is later rejected.

## Monitoring

### Check Queue Health
```bash
# Pending jobs count
php artisan tinker --execute="echo 'Pending: ' . DB::table('jobs')->count() . PHP_EOL;"

# Failed jobs count
php artisan tinker --execute="echo 'Failed: ' . DB::table('failed_jobs')->count() . PHP_EOL;"

# Worker status
ps aux | grep "queue:work" | grep -v grep | wc -l
```

### Set Up Alerts
Monitor:
- Pending job count (should stay low)
- Failed job count (should be 0)
- Queue worker process (should always be running)

## Related Files

- `app/Listeners/SendPaymentNotifications.php` - Payment email listener
- `app/Jobs/SendPaymentApprovedEmail.php` - Payment approved email job
- `app/Jobs/SendPaymentConfirmationEmail.php` - Payment confirmation email job
- `diagnose-queue-job.php` - Diagnostic script

