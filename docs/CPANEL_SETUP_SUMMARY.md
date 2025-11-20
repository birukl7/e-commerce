# cPanel Mail Jobs Setup - Summary

## Quick Start

1. **New to cPanel Terminal?** → Read `CPANEL_TERMINAL_GUIDE.md` first
2. **Quick Terminal Reference?** → See `CPANEL_TERMINAL_QUICK_REFERENCE.md`
3. **Read:** `CPANEL_QUICK_SETUP_GUIDE.md` - Step-by-step instructions
4. **Reference:** `CPANEL_MAIL_JOBS_SETUP_CHECKLIST.md` - Comprehensive checklist
5. **Verify:** Run `php verify-queue-setup.php` in cPanel Terminal

---

## Critical Steps

### 1. Set Up Queue Worker (MOST IMPORTANT)

**Via cPanel Cron Jobs:**
- Path: `Advanced` → `Cron Jobs`
- Command: 
  ```bash
  cd /home/YOUR_USERNAME/public_html && php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600 >> storage/logs/queue-worker.log 2>&1
  ```
- Schedule: Every minute (`* * * * *`)

### 2. Verify Database Tables

**Via phpMyAdmin:**
- Check tables exist: `jobs`, `failed_jobs`, `notification_outbox`
- Verify `notification_outbox.key` has unique constraint

### 3. Configure Email Settings

**In .env file:**
```env
QUEUE_CONNECTION=database
MAIL_MAILER=smtp
MAIL_HOST=mail.yourdomain.com
MAIL_PORT=587
MAIL_USERNAME=noreply@yourdomain.com
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourdomain.com
```

### 4. Verify Queue Worker is Running

**Via Terminal:**
```bash
ps aux | grep "queue:work"
```

Should show a running process.

---

## Files Created

1. **CPANEL_TERMINAL_GUIDE.md** - Complete beginner guide to using Terminal in cPanel
2. **CPANEL_TERMINAL_QUICK_REFERENCE.md** - Quick command reference card
3. **CPANEL_QUICK_SETUP_GUIDE.md** - Step-by-step mail jobs setup guide
4. **CPANEL_MAIL_JOBS_SETUP_CHECKLIST.md** - Comprehensive checklist
5. **verify-queue-setup.php** - Automated verification script

---

## Quick Verification

Run this in cPanel Terminal:
```bash
cd /path/to/application
php verify-queue-setup.php
```

This will check:
- ✅ .env configuration
- ✅ Database tables
- ✅ Queue worker process
- ✅ Storage permissions
- ✅ Log files
- ✅ Mail configuration

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Queue worker not running | Set up Cron Job (see Step 1) |
| Jobs not processing | Check database connection, verify QUEUE_CONNECTION=database |
| Emails not sending | Verify SMTP credentials in .env |
| Permission errors | Run: `chmod -R 775 storage/ bootstrap/cache/` |

---

## Next Steps

1. **If new to Terminal:** Read `CPANEL_TERMINAL_GUIDE.md`
2. **Find Terminal in cPanel:** Use search or go to Advanced → Terminal
3. **Find your application path:** Use `pwd` command in Terminal
4. **Run verification:** `php verify-queue-setup.php`
5. **Set up Cron Job:** Follow `CPANEL_QUICK_SETUP_GUIDE.md`
6. **Test email sending**
7. **Monitor queue worker logs**

