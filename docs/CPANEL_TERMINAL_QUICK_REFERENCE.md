# cPanel Terminal - Quick Reference Card

## 🎯 Finding Terminal in cPanel

### Method 1: Search
1. Look for **Search box** at top of cPanel
2. Type: `terminal` or `ssh`
3. Click the result

### Method 2: Menu
1. Scroll to **"Advanced"** section
2. Click **"Terminal"** or **"SSH Access"**

---

## 📍 Essential Commands

### Navigation
```bash
pwd                          # Where am I?
ls                           # What's here?
ls -la                       # Detailed list
cd /path/to/directory        # Go to directory
cd ..                        # Go up one level
cd ~                         # Go to home
```

### Find Your Laravel App
```bash
cd ~/public_html             # Try this first
ls artisan                   # Check if Laravel is here
# OR
cd ~/domains/yourdomain.com/public_html
```

### Check Queue Worker
```bash
ps aux | grep queue:work     # Is it running?
tail -f storage/logs/queue-worker.log  # Watch logs
```

### Laravel Commands
```bash
php artisan --version        # Laravel version
php artisan config:clear     # Clear cache
php artisan queue:work --once # Test queue
php verify-queue-setup.php   # Run verification
```

---

## 🔍 Quick Checks

### Am I in the right place?
```bash
ls artisan
# If you see "artisan", you're in Laravel root ✓
```

### Is queue worker running?
```bash
ps aux | grep queue:work
# If you see output, it's running ✓
```

### Check logs
```bash
tail -n 50 storage/logs/queue-worker.log
# Shows last 50 lines
```

---

## ⚡ Common Tasks

### Run Verification Script
```bash
cd /path/to/your/app
php verify-queue-setup.php
```

### Find Application Path
```bash
pwd
# Copy this path for Cron Job setup
```

### View File
```bash
cat filename.txt
# OR
less filename.txt  # Press 'q' to quit
```

### Clear Screen
```bash
clear
# OR press Ctrl+L
```

---

## 🛑 Important Shortcuts

- **Ctrl+C** - Stop running command
- **Ctrl+L** - Clear screen
- **Up Arrow** - Previous command
- **Tab** - Auto-complete
- **Ctrl+Shift+C** - Copy (in terminal)
- **Ctrl+Shift+V** - Paste (in terminal)

---

## ⚠️ Safety

✅ **Safe to use:**
- `pwd`, `ls`, `cd`
- `php artisan --help`
- `tail`, `cat`

❌ **Be careful:**
- `rm` - Deletes files!
- `chmod` - Changes permissions
- Commands with `--force` flag

---

## 📋 Step-by-Step: First Time Setup

1. **Open Terminal**
   - Search for "terminal" in cPanel
   - Or go to Advanced → Terminal

2. **Find your app**
   ```bash
   cd ~/public_html
   ls artisan
   ```

3. **Note the path**
   ```bash
   pwd
   # Copy this path!
   ```

4. **Run verification**
   ```bash
   php verify-queue-setup.php
   ```

5. **Check queue worker**
   ```bash
   ps aux | grep queue:work
   ```

6. **If not running, set up Cron Job**
   - Use the path from step 3
   - See CPANEL_QUICK_SETUP_GUIDE.md

---

## 🆘 Troubleshooting

### "Command not found"
- Check spelling
- Make sure you're in right directory

### "Permission denied"
- Check file permissions: `ls -la`
- May need hosting support

### "No such file or directory"
- Check path: `pwd`
- List files: `ls -la`

### Terminal not available
- Contact hosting to enable SSH/Terminal
- Use File Manager as alternative

---

## 📚 Full Guides

- **CPANEL_TERMINAL_GUIDE.md** - Complete beginner guide
- **CPANEL_QUICK_SETUP_GUIDE.md** - Mail jobs setup
- **CPANEL_MAIL_JOBS_SETUP_CHECKLIST.md** - Full checklist

---

**Tip:** Keep this file open while working in Terminal! 🚀

