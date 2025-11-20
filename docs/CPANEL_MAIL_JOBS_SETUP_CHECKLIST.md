# cPanel Mail Jobs Setup Checklist

This document provides a comprehensive checklist for verifying and configuring mail jobs in cPanel.

## Prerequisites

- Access to cPanel
- SSH access (recommended) or Terminal access in cPanel
- Database access (phpMyAdmin or similar)
- File Manager access

---

## 1. Queue Worker Configuration (CRITICAL)

### 1.1 Check if Queue Worker is Running

**Via SSH/Terminal:**
```bash
# Check if queue worker process is running
ps aux | grep "queue:work"

# Or check for specific queue
ps aux | grep "queue:work.*emails"
```

**Expected Output:**
Should show a process like:
```
user 12345 ... php artisan queue:work --queue=emails,default ...
```

**If NOT running:** Queue worker needs to be started (see section 1.3)

### 1.2 Check Queue Worker Logs

**Location:** `storage/logs/queue-worker.log`

**Via cPanel File Manager:**
1. Navigate to `storage/logs/`
2. Open `queue-worker.log`
3. Check for errors or recent activity

**Via SSH:**
```bash
tail -f storage/logs/queue-worker.log
```

**What to Look For:**
- ✅ Recent log entries (within last few minutes)
- ✅ No error messages
- ✅ Job processing messages
- ❌ "Queue worker stopped" messages
- ❌ PHP errors or exceptions

### 1.3 Set Up Queue Worker via Cron Job (RECOMMENDED)

**Why:** Ensures queue worker restarts automatically if it crashes

**Via cPanel Cron Jobs:**

1. **Login to cPanel**
2. **Navigate to:** `Advanced` → `Cron Jobs`
3. **Add New Cron Job:**

   **Option A: Keep Worker Running (Recommended)**
   ```
   Command: cd /home/username/public_html && php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600 >> storage/logs/queue-worker.log 2>&1
   ```
   - **Minute:** `*`
   - **Hour:** `*`
   - **Day:** `*`
   - **Month:** `*`
   - **Weekday:** `*`
   - **Note:** This runs every minute but only starts if not already running

   **Option B: Restart Worker Periodically (Alternative)**
   ```
   Command: cd /home/username/public_html && /bin/bash restart-queue.sh
   ```
   - **Minute:** `*/5` (every 5 minutes)
   - **Hour:** `*`
   - **Day:** `*`
   - **Month:** `*`
   - **Weekday:** `*`

   **Option C: Use Supervisor (Best for Production)**
   - Requires root access or VPS
   - See section 1.4

**Important:** Replace `/home/username/public_html` with your actual application path.

### 1.4 Alternative: Supervisor Configuration (If Available)

If you have root/VPS access, Supervisor is the best option:

**Create:** `/etc/supervisor/conf.d/laravel-worker.conf`
```ini
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /home/username/public_html/artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=username
numprocs=2
redirect_stderr=true
stdout_logfile=/home/username/public_html/storage/logs/queue-worker.log
stopwaitsecs=3600
```

Then:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start laravel-worker:*
```

---

## 2. Database Tables Verification

### 2.1 Check Required Tables Exist

**Via phpMyAdmin or Database Tool:**

1. **Login to phpMyAdmin** (cPanel → Databases → phpMyAdmin)
2. **Select your database**
3. **Verify these tables exist:**

   - ✅ `jobs` - Active queue jobs
   - ✅ `failed_jobs` - Failed queue jobs
   - ✅ `notification_outbox` - Idempotency tracking

### 2.2 Check Jobs Table

**Query:**
```sql
SELECT COUNT(*) as pending_jobs FROM jobs;
SELECT * FROM jobs ORDER BY id DESC LIMIT 10;
```

**What to Check:**
- ✅ Table exists
- ✅ Has recent job entries (if jobs are being queued)
- ⚠️ If many jobs stuck: Queue worker may not be running

### 2.3 Check Failed Jobs Table

**Query:**
```sql
SELECT COUNT(*) as failed_count FROM failed_jobs;
SELECT * FROM failed_jobs ORDER BY failed_at DESC LIMIT 10;
```

**What to Check:**
- ✅ Table exists
- ⚠️ If failed jobs exist: Review errors and fix issues
- ⚠️ Check `exception` column for error details

### 2.4 Check Notification Outbox Table

**Query:**
```sql
SELECT COUNT(*) as total_notifications FROM notification_outbox;
SELECT * FROM notification_outbox ORDER BY created_at DESC LIMIT 10;
```

**What to Check:**
- ✅ Table exists
- ✅ Has unique constraint on `key` column
- ✅ Recent entries indicate emails are being processed

**Verify Unique Constraint:**
```sql
SHOW CREATE TABLE notification_outbox;
```
Should show: `UNIQUE KEY` on `key` column

---

## 3. Environment Configuration

### 3.1 Check .env File

**Via cPanel File Manager:**
1. Navigate to application root
2. Open `.env` file
3. Verify these settings:

**Queue Configuration:**
```env
QUEUE_CONNECTION=database
```

**Mail Configuration:**
```env
MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host.com
MAIL_PORT=587
MAIL_USERNAME=your-email@domain.com
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="${APP_NAME}"
```

**Database Configuration:**
```env
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### 3.2 Verify Environment Variables

**Via SSH:**
```bash
cd /path/to/application
php artisan config:show queue
php artisan config:show mail
```

**Or test queue connection:**
```bash
php artisan queue:work --once --queue=emails
```

---

## 4. Email/SMTP Configuration

### 4.1 Check cPanel Email Accounts

**Via cPanel:**
1. Navigate to: `Email` → `Email Accounts`
2. Verify email account exists for sending emails
3. Note the email address and password

### 4.2 Configure SMTP Settings

**In .env file, use cPanel email account:**
```env
MAIL_MAILER=smtp
MAIL_HOST=mail.yourdomain.com
MAIL_PORT=587
MAIL_USERNAME=noreply@yourdomain.com
MAIL_PASSWORD=your-email-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="Your App Name"
```

**Alternative: Use cPanel SMTP:**
```env
MAIL_HOST=localhost
MAIL_PORT=25
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
```

### 4.3 Test Email Sending

**Via SSH:**
```bash
php artisan tinker
```

Then:
```php
Mail::raw('Test email', function($message) {
    $message->to('your-test-email@example.com')
            ->subject('Test Email');
});
```

**Or use test route:**
Visit: `https://yourdomain.com/test-queue-email` (if route exists)

---

## 5. File Permissions

### 5.1 Check Storage Permissions

**Via SSH:**
```bash
cd /path/to/application
ls -la storage/
ls -la storage/logs/
ls -la bootstrap/cache/
```

**Required Permissions:**
- `storage/` - 775
- `storage/logs/` - 775
- `bootstrap/cache/` - 775

**Fix Permissions:**
```bash
chmod -R 775 storage/
chmod -R 775 bootstrap/cache/
chown -R username:username storage/
chown -R username:username bootstrap/cache/
```

**Via cPanel File Manager:**
1. Right-click `storage/` folder
2. Select `Change Permissions`
3. Set to `775`
4. Check `Recurse into subdirectories`
5. Repeat for `bootstrap/cache/`

---

## 6. PHP Configuration

### 6.1 Check PHP Version

**Via cPanel:**
1. Navigate to: `Software` → `Select PHP Version`
2. Verify PHP version (Laravel 11+ requires PHP 8.2+)

### 6.2 Check PHP Extensions

**Required Extensions:**
- ✅ `pdo_mysql`
- ✅ `mbstring`
- ✅ `openssl`
- ✅ `tokenizer`
- ✅ `json`
- ✅ `curl`
- ✅ `zip`

**Via SSH:**
```bash
php -m | grep -E "pdo_mysql|mbstring|openssl"
```

**Via cPanel:**
1. Navigate to: `Software` → `Select PHP Version` → `Extensions`
2. Enable required extensions

### 6.3 Check PHP Memory Limit

**Via SSH:**
```bash
php -i | grep memory_limit
```

**Should be:** At least `256M` (recommended: `512M`)

**Set in .env or php.ini:**
```ini
memory_limit = 512M
```

---

## 7. Application Logs

### 7.1 Check Laravel Logs

**Location:** `storage/logs/laravel.log`

**Via cPanel File Manager:**
1. Navigate to `storage/logs/`
2. Open `laravel.log`
3. Check for email-related errors

**Via SSH:**
```bash
tail -n 100 storage/logs/laravel.log | grep -i "mail\|email\|queue"
```

**What to Look For:**
- ✅ No email sending errors
- ✅ Queue job processing messages
- ❌ SMTP connection errors
- ❌ Queue worker errors

### 7.2 Check Queue Worker Logs

**Location:** `storage/logs/queue-worker.log`

**Via SSH:**
```bash
tail -f storage/logs/queue-worker.log
```

**What to Look For:**
- ✅ Job processing messages
- ✅ Email sending confirmations
- ❌ Job failures
- ❌ Timeout errors

---

## 8. Testing Queue System

### 8.1 Test Queue Connection

**Via SSH:**
```bash
cd /path/to/application
php artisan queue:work --once --queue=emails
```

**Expected:** Should process one job or show "No jobs available"

### 8.2 Test Job Dispatch

**Via SSH (tinker):**
```bash
php artisan tinker
```

```php
use App\Jobs\TestQueueJob;
TestQueueJob::dispatch();
```

Then check:
```bash
# Check if job was queued
php artisan queue:work --once

# Check logs
tail storage/logs/queue-worker.log
```

### 8.3 Test Email Job

**Via SSH (tinker):**
```bash
php artisan tinker
```

```php
use App\Models\Order;
use App\Jobs\SendOrderConfirmationEmail;

$order = Order::first();
if ($order) {
    SendOrderConfirmationEmail::dispatch($order);
    echo "Email job dispatched!";
}
```

Then check queue worker processes it.

---

## 9. Monitoring & Maintenance

### 9.1 Monitor Queue Status

**Create monitoring script:** `check-queue-status.sh`
```bash
#!/bin/bash
if ! pgrep -f "queue:work.*emails" > /dev/null; then
    echo "Queue worker is NOT running!"
    # Optionally restart it
    cd /path/to/application && php artisan queue:work --queue=emails,default --daemon &
fi
```

**Add to Cron (every 5 minutes):**
```
*/5 * * * * /path/to/check-queue-status.sh
```

### 9.2 Check Failed Jobs Regularly

**Query:**
```sql
SELECT COUNT(*) as failed_count, 
       DATE(failed_at) as date,
       exception
FROM failed_jobs 
WHERE failed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY DATE(failed_at), exception
ORDER BY failed_at DESC;
```

### 9.3 Clean Up Old Jobs

**Via SSH:**
```bash
php artisan queue:prune-failed --hours=168  # Remove failed jobs older than 7 days
php artisan queue:flush  # Clear all failed jobs (use with caution)
```

---

## 10. Troubleshooting Common Issues

### Issue 1: Queue Worker Not Running

**Symptoms:**
- Jobs stuck in `jobs` table
- No queue worker process
- No logs in `queue-worker.log`

**Solution:**
1. Start queue worker manually:
   ```bash
   cd /path/to/application
   nohup php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 >> storage/logs/queue-worker.log 2>&1 &
   ```
2. Set up Cron Job (see section 1.3)

### Issue 2: Jobs Failing

**Symptoms:**
- Jobs in `failed_jobs` table
- Error messages in logs

**Solution:**
1. Check failed jobs:
   ```bash
   php artisan queue:failed
   ```
2. Review exception in `failed_jobs` table
3. Fix the issue and retry:
   ```bash
   php artisan queue:retry all
   ```

### Issue 3: Emails Not Sending

**Symptoms:**
- Jobs process successfully
- No emails received
- SMTP errors in logs

**Solution:**
1. Check SMTP credentials in `.env`
2. Test SMTP connection:
   ```bash
   php artisan tinker
   Mail::raw('Test', function($m) { $m->to('test@example.com')->subject('Test'); });
   ```
3. Check cPanel email account settings
4. Verify SPF/DKIM records (if using custom domain)

### Issue 4: Queue Worker Crashes

**Symptoms:**
- Queue worker stops running
- Jobs accumulate in queue

**Solution:**
1. Check PHP memory limit (increase if needed)
2. Check timeout settings
3. Use Supervisor or Cron to auto-restart
4. Review logs for crash reasons

---

## 11. Quick Verification Checklist

Use this quick checklist when checking cPanel:

- [ ] Queue worker process is running (`ps aux | grep queue:work`)
- [ ] Cron job is set up for queue worker
- [ ] Database tables exist (`jobs`, `failed_jobs`, `notification_outbox`)
- [ ] `.env` file has correct queue and mail settings
- [ ] SMTP credentials are correct
- [ ] Storage permissions are correct (775)
- [ ] PHP version is compatible (8.2+)
- [ ] Required PHP extensions are enabled
- [ ] Queue worker log exists and has recent entries
- [ ] Laravel log has no email errors
- [ ] Test email can be sent successfully
- [ ] Jobs table has jobs being processed (or is empty if no jobs)
- [ ] Failed jobs table is monitored

---

## 12. Recommended cPanel Cron Job Setup

**Best Practice:** Use a combination approach

**Cron Job 1: Keep Worker Running (Every Minute)**
```
* * * * * cd /home/username/public_html && php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600 >> storage/logs/queue-worker.log 2>&1
```

**Cron Job 2: Monitor and Restart (Every 5 Minutes)**
```
*/5 * * * * pgrep -f "queue:work.*emails" > /dev/null || cd /home/username/public_html && nohup php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 >> storage/logs/queue-worker.log 2>&1 &
```

**Cron Job 3: Clean Up Failed Jobs (Daily)**
```
0 2 * * * cd /home/username/public_html && php artisan queue:prune-failed --hours=168
```

---

## 13. Security Considerations

### 13.1 Protect .env File

**Via cPanel File Manager:**
1. Right-click `.env` file
2. Set permissions to `600` (owner read/write only)

**Via SSH:**
```bash
chmod 600 .env
```

### 13.2 Secure Queue Worker Scripts

Ensure queue worker scripts are not publicly accessible:
- Keep scripts outside `public/` directory
- Use proper file permissions

### 13.3 Email Credentials

- Use strong passwords for email accounts
- Consider using app-specific passwords
- Rotate passwords regularly

---

## 14. Performance Optimization

### 14.1 Queue Worker Settings

**Recommended settings:**
```bash
php artisan queue:work \
    --queue=emails,default \
    --sleep=3 \
    --tries=5 \
    --timeout=300 \
    --max-time=3600 \
    --max-jobs=1000
```

### 14.2 Database Optimization

**Index on jobs table:**
```sql
CREATE INDEX idx_jobs_queue ON jobs(queue);
CREATE INDEX idx_jobs_reserved_at ON jobs(reserved_at);
```

**Index on notification_outbox:**
```sql
-- Already has unique index on 'key', but verify:
SHOW INDEX FROM notification_outbox;
```

---

## 15. Contact Information

If issues persist:
1. Check Laravel documentation: https://laravel.com/docs/queues
2. Review cPanel documentation
3. Contact hosting support if server-level issues

---

## Quick Reference Commands

```bash
# Check if queue worker is running
ps aux | grep "queue:work"

# Start queue worker
cd /path/to/app && php artisan queue:work --queue=emails,default &

# Check queue status
php artisan queue:work --once

# View failed jobs
php artisan queue:failed

# Retry failed jobs
php artisan queue:retry all

# Clear failed jobs
php artisan queue:flush

# Check logs
tail -f storage/logs/queue-worker.log
tail -f storage/logs/laravel.log

# Test email
php artisan tinker
# Then: Mail::raw('Test', function($m) { $m->to('test@example.com')->subject('Test'); });
```

