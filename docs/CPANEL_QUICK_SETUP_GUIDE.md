# cPanel Mail Jobs Quick Setup Guide

A step-by-step guide to verify and set up mail jobs in cPanel.

---

## Step 1: Verify Queue Worker is Running

### Option A: Via cPanel Terminal

1. **Login to cPanel**
2. **Navigate to:** `Advanced` → `Terminal` (or `SSH Access`)
3. **Run command:**
   ```bash
   ps aux | grep "queue:work"
   ```
4. **Expected:** Should see a process running
5. **If NOT running:** Proceed to Step 2

### Option B: Via SSH (if you have SSH access)

```bash
ssh username@yourdomain.com
ps aux | grep "queue:work"
```

---

## Step 2: Set Up Queue Worker via Cron Job

### 2.1 Access Cron Jobs

1. **Login to cPanel**
2. **Navigate to:** `Advanced` → `Cron Jobs`
3. **Click:** `Add New Cron Job`

### 2.2 Configure Cron Job

**Settings:**
- **Minute:** `*` (every minute)
- **Hour:** `*`
- **Day:** `*`
- **Month:** `*`
- **Weekday:** `*`

**Command:**
```bash
cd /home/YOUR_CPANEL_USERNAME/public_html && php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600 >> storage/logs/queue-worker.log 2>&1
```

**Important:** Replace `YOUR_CPANEL_USERNAME` with your actual cPanel username.

**To find your username:**
- Check cPanel URL (usually shows username)
- Or run in Terminal: `whoami`

**To find your application path:**
- Usually: `/home/username/public_html`
- Or: `/home/username/domains/yourdomain.com/public_html`
- Check in cPanel File Manager

### 2.3 Save Cron Job

Click `Add New Cron Job` button.

---

## Step 3: Verify Database Tables

### 3.1 Access phpMyAdmin

1. **Login to cPanel**
2. **Navigate to:** `Databases` → `phpMyAdmin`
3. **Select your database** (usually matches your cPanel username)

### 3.2 Check Tables

**Run these queries:**

```sql
-- Check if tables exist
SHOW TABLES LIKE 'jobs';
SHOW TABLES LIKE 'failed_jobs';
SHOW TABLES LIKE 'notification_outbox';
```

**All three should return results.**

### 3.3 Check Jobs Table

```sql
SELECT COUNT(*) as pending_jobs FROM jobs;
```

**If count > 0:** Jobs are queued (good sign)
**If count = 0:** No jobs queued (normal if no activity)

### 3.4 Check Failed Jobs

```sql
SELECT COUNT(*) as failed_count FROM failed_jobs;
SELECT * FROM failed_jobs ORDER BY failed_at DESC LIMIT 5;
```

**If failed jobs exist:** Review the `exception` column for errors.

---

## Step 4: Verify Email Configuration

### 4.1 Check .env File

1. **Login to cPanel**
2. **Navigate to:** `Files` → `File Manager`
3. **Go to application root** (usually `public_html`)
4. **Open `.env` file**

### 4.2 Verify Settings

**Queue:**
```env
QUEUE_CONNECTION=database
```

**Mail (using cPanel email):**
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

**To get cPanel email settings:**
1. Go to: `Email` → `Email Accounts`
2. Create or use existing email account
3. Note the email and password

### 4.3 Save and Clear Cache

**Via Terminal:**
```bash
cd /home/YOUR_CPANEL_USERNAME/public_html
php artisan config:clear
php artisan cache:clear
```

---

## Step 5: Test Email Sending

### 5.1 Via Terminal

1. **Open cPanel Terminal**
2. **Navigate to application:**
   ```bash
   cd /home/YOUR_CPANEL_USERNAME/public_html
   ```
3. **Run tinker:**
   ```bash
   php artisan tinker
   ```
4. **Test email:**
   ```php
   Mail::raw('Test email from queue system', function($message) {
       $message->to('your-test-email@example.com')
               ->subject('Queue System Test');
   });
   ```
5. **Check if email was sent**

### 5.2 Check Queue Worker Log

**Via File Manager:**
1. Navigate to `storage/logs/`
2. Open `queue-worker.log`
3. Check for recent activity

**Via Terminal:**
```bash
tail -f storage/logs/queue-worker.log
```

---

## Step 6: Monitor Queue Status

### 6.1 Check Queue Worker Process

**Via Terminal:**
```bash
ps aux | grep "queue:work"
```

**Should show:** Process running with `queue:work` command

### 6.2 Check Queue Logs

**Via File Manager:**
- `storage/logs/queue-worker.log` - Queue worker activity
- `storage/logs/laravel.log` - Application logs

**Look for:**
- ✅ Recent log entries
- ✅ Job processing messages
- ❌ Error messages

### 6.3 Check Jobs in Database

**Via phpMyAdmin:**
```sql
-- Pending jobs
SELECT * FROM jobs ORDER BY id DESC LIMIT 10;

-- Failed jobs
SELECT * FROM failed_jobs ORDER BY failed_at DESC LIMIT 10;
```

---

## Step 7: Set Up Monitoring (Optional but Recommended)

### 7.1 Add Monitoring Cron Job

1. **Go to:** `Advanced` → `Cron Jobs`
2. **Add New Cron Job:**

**Settings:**
- **Minute:** `*/5` (every 5 minutes)
- **Hour:** `*`
- **Day:** `*`
- **Month:** `*`
- **Weekday:** `*`

**Command:**
```bash
pgrep -f "queue:work.*emails" > /dev/null || cd /home/YOUR_CPANEL_USERNAME/public_html && nohup php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 >> storage/logs/queue-worker.log 2>&1 &
```

**This will:** Restart queue worker if it's not running

---

## Step 8: Verify Everything Works

### 8.1 Test Queue System

**Via Terminal:**
```bash
cd /home/YOUR_CPANEL_USERNAME/public_html
php artisan queue:work --once --queue=emails
```

**Expected:** Processes one job or shows "No jobs available"

### 8.2 Test Email Job

**Via Terminal (tinker):**
```bash
php artisan tinker
```

```php
use App\Models\Order;
use App\Jobs\SendOrderConfirmationEmail;

$order = Order::first();
if ($order && $order->user) {
    SendOrderConfirmationEmail::dispatch($order);
    echo "Email job dispatched! Check queue worker log.";
}
```

**Then check:**
- Queue worker log for processing
- Email inbox for received email

---

## Common Issues & Quick Fixes

### Issue: Queue Worker Not Running

**Fix:**
1. Check Cron Job is set up (Step 2)
2. Verify command path is correct
3. Check file permissions:
   ```bash
   chmod -R 775 storage/
   chmod -R 775 bootstrap/cache/
   ```

### Issue: Jobs Not Processing

**Fix:**
1. Verify queue worker is running
2. Check database connection in `.env`
3. Verify `QUEUE_CONNECTION=database` in `.env`
4. Clear config cache:
   ```bash
   php artisan config:clear
   ```

### Issue: Emails Not Sending

**Fix:**
1. Verify SMTP credentials in `.env`
2. Test SMTP connection (Step 5)
3. Check email account exists in cPanel
4. Verify `MAIL_FROM_ADDRESS` matches email account

### Issue: Permission Denied

**Fix:**
```bash
chmod -R 775 storage/
chmod -R 775 bootstrap/cache/
chown -R YOUR_CPANEL_USERNAME:YOUR_CPANEL_USERNAME storage/
chown -R YOUR_CPANEL_USERNAME:YOUR_CPANEL_USERNAME bootstrap/cache/
```

---

## Quick Verification Checklist

After setup, verify:

- [ ] Queue worker process is running (`ps aux | grep queue:work`)
- [ ] Cron job is configured and active
- [ ] Database tables exist (`jobs`, `failed_jobs`, `notification_outbox`)
- [ ] `.env` has correct `QUEUE_CONNECTION=database`
- [ ] `.env` has correct SMTP settings
- [ ] `storage/logs/queue-worker.log` has recent entries
- [ ] Test email can be sent successfully
- [ ] Jobs table shows jobs being processed (or empty if no activity)

---

## Need Help?

1. Check full checklist: `CPANEL_MAIL_JOBS_SETUP_CHECKLIST.md`
2. Review Laravel queue documentation
3. Check cPanel error logs
4. Contact hosting support if server issues

