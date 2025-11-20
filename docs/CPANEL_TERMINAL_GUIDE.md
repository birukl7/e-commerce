# cPanel Terminal Guide for Beginners

A step-by-step guide to finding and using the Terminal in cPanel.

---

## Step 1: Accessing cPanel

1. **Login to cPanel**
   - Usually: `https://yourdomain.com/cpanel` or `https://yourdomain.com:2083`
   - Or your hosting provider's login page
   - Enter your username and password

2. **You should see the cPanel dashboard** with various icons and sections

---

## Step 2: Finding the Terminal

### Method 1: Using Search (Easiest)

1. **Look for a search box** at the top of cPanel
   - Usually says "Search" or has a magnifying glass icon
   - Or press `Ctrl+F` (Windows) or `Cmd+F` (Mac) to search the page

2. **Type:** `terminal` or `ssh`

3. **Click on the result** that says "Terminal" or "SSH Access"

### Method 2: Using Menu Sections

1. **Look for the "Advanced" section**
   - Scroll down on the cPanel dashboard
   - Find the section labeled "Advanced" (usually has a gear icon)

2. **Click on "Terminal"** or "SSH Access"
   - Icon might look like a computer screen or command prompt
   - May also be labeled "Terminal" or "SSH Terminal"

### Method 3: Alternative Names

Depending on your cPanel version, it might be called:
- **Terminal**
- **SSH Access**
- **SSH Terminal**
- **Web Terminal**
- **Command Line**

**Note:** If you can't find Terminal, your hosting provider might not have it enabled. Contact support to enable it, or use SSH access instead.

---

## Step 3: Using the Terminal

### 3.1 Opening the Terminal

1. **Click on "Terminal"** or "SSH Access"
2. **A new window or tab will open** with a command prompt
3. **You should see something like:**
   ```
   [username@server ~]$
   ```
   or
   ```
   username@server:~/public_html$
   ```

### 3.2 Understanding the Terminal

**What you see:**
- **Prompt:** The text before the cursor (e.g., `[username@server ~]$`)
- **Cursor:** The blinking line where you type
- **Current directory:** Usually shown in the prompt

**Basic concepts:**
- **Commands:** Instructions you type and press Enter
- **Directory/Folder:** Same thing - a location in the file system
- **Path:** The location of a file or folder (e.g., `/home/username/public_html`)

---

## Step 4: Basic Terminal Commands

### 4.1 Navigation Commands

**See where you are:**
```bash
pwd
```
**Output:** Shows current directory path (e.g., `/home/username/public_html`)

**List files and folders:**
```bash
ls
```
**Output:** Shows files and folders in current directory

**List with details:**
```bash
ls -la
```
**Output:** Shows files with permissions, sizes, dates

**Change directory:**
```bash
cd /path/to/directory
```
**Example:**
```bash
cd public_html
```
**To go back:**
```bash
cd ..
```
**To go home:**
```bash
cd ~
```

### 4.2 Finding Your Application

**Find your Laravel application:**
```bash
# Usually in one of these locations:
cd ~/public_html
# OR
cd ~/domains/yourdomain.com/public_html
# OR
cd ~/www
```

**Check if you're in the right place:**
```bash
ls -la
```
**Look for:** `artisan` file (this means you're in Laravel root)

**If you see `artisan`:**
```bash
# You're in the right place!
pwd
```
**Note this path** - you'll need it for Cron Jobs

---

## Step 5: Running Verification Script

### 5.1 Navigate to Your Application

```bash
# Replace with your actual path
cd /home/YOUR_USERNAME/public_html
```

**To find your username:**
```bash
whoami
```

**To find your path:**
```bash
pwd
```

### 5.2 Run Verification Script

```bash
php verify-queue-setup.php
```

**What happens:**
- Script checks your setup
- Shows ✓ for things that are OK
- Shows ❌ for errors
- Shows ⚠️ for warnings

**Example output:**
```
=== Laravel Mail Jobs Setup Verification ===

✓ Running from Laravel root directory

1. Checking .env file...
  ✓ .env file exists
  ✓ QUEUE_CONNECTION=database
  ✓ MAIL_MAILER=smtp

2. Checking database tables...
  ✓ jobs table exists (pending jobs: 0)
  ✓ failed_jobs table exists (failed jobs: 0)
  ✓ notification_outbox table exists (notifications: 5)

...
```

---

## Step 6: Checking Queue Worker

### 6.1 Check if Queue Worker is Running

```bash
ps aux | grep "queue:work"
```

**What to look for:**
- **If you see output:** Queue worker is running ✓
- **If you see nothing:** Queue worker is NOT running ❌

**Example of running worker:**
```
username 12345 ... php artisan queue:work --queue=emails,default ...
```

### 6.2 Check Queue Worker Log

```bash
tail -f storage/logs/queue-worker.log
```

**What this does:**
- Shows the last few lines of the log
- `-f` means "follow" - it will show new lines as they appear
- **Press `Ctrl+C` to stop** watching the log

**To see last 50 lines:**
```bash
tail -n 50 storage/logs/queue-worker.log
```

---

## Step 7: Common Terminal Tasks

### 7.1 View File Contents

**View a file:**
```bash
cat filename.txt
```

**View with pagination (for long files):**
```bash
less filename.txt
# Press Space to scroll down
# Press 'q' to quit
```

**View last lines of a file:**
```bash
tail filename.txt
```

### 7.2 Edit Files

**Note:** Terminal text editors can be tricky for beginners. It's often easier to use cPanel File Manager.

**If you need to edit in Terminal:**
```bash
nano filename.txt
# Make changes
# Press Ctrl+X to exit
# Press Y to save
# Press Enter to confirm
```

### 7.3 Check File Permissions

```bash
ls -la
```

**Understanding permissions:**
- `drwxr-xr-x` = directory with permissions
- `-rw-r--r--` = file with permissions
- First character: `d` = directory, `-` = file
- Next 9 characters: permissions (read, write, execute)

**Fix permissions:**
```bash
chmod -R 775 storage/
chmod -R 775 bootstrap/cache/
```

### 7.4 Clear Laravel Cache

```bash
php artisan config:clear
php artisan cache:clear
php artisan view:clear
```

---

## Step 8: Finding Your Application Path

### 8.1 Method 1: Using Terminal

```bash
# Start from home directory
cd ~

# List directories
ls -la

# Common locations:
cd public_html
# OR
cd domains
ls -la
cd yourdomain.com
cd public_html

# Check if Laravel is here
ls -la | grep artisan
```

### 8.2 Method 2: Using File Manager

1. **In cPanel, go to:** `Files` → `File Manager`
2. **Navigate to your application**
3. **Look for:** `artisan` file (Laravel root)
4. **Right-click on `artisan`** → `Properties`
5. **Note the full path** shown

### 8.3 Method 3: Check .htaccess

1. **In File Manager, open:** `public/.htaccess`
2. **Look for paths** in the file
3. **Or check:** `public/index.php` for application path

---

## Step 9: Setting Up Cron Job (Using Terminal Info)

Once you know your application path from Terminal:

1. **Go back to cPanel dashboard**
2. **Navigate to:** `Advanced` → `Cron Jobs`
3. **Use the path you found:**
   ```bash
   cd /home/YOUR_USERNAME/public_html && php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600 >> storage/logs/queue-worker.log 2>&1
   ```

---

## Step 10: Terminal Tips for Beginners

### 10.1 Copy and Paste

- **Copy:** Select text with mouse, or `Ctrl+Shift+C`
- **Paste:** Right-click, or `Ctrl+Shift+V`
- **Note:** Regular `Ctrl+C` stops a running command!

### 10.2 Stop a Running Command

- **Press:** `Ctrl+C`
- This stops whatever command is running

### 10.3 Clear the Screen

```bash
clear
```
or press `Ctrl+L`

### 10.4 See Command History

- **Press:** `Up Arrow` to see previous commands
- **Press:** `Down Arrow` to go forward
- **Press:** `Ctrl+R` to search history

### 10.5 Auto-complete

- **Press:** `Tab` key
- Terminal will try to complete file/folder names
- Press `Tab` twice to see all options

### 10.6 Getting Help

**For any command:**
```bash
command --help
# Example:
php --help
ls --help
```

---

## Step 11: Troubleshooting Terminal Issues

### Issue: Terminal Not Available

**Solution:**
- Contact your hosting provider to enable Terminal/SSH
- Or use cPanel File Manager instead
- Or use FTP client with SSH support

### Issue: Permission Denied

**Error:** `Permission denied`

**Solution:**
```bash
# Check current user
whoami

# Check file ownership
ls -la

# You may need to contact hosting support
```

### Issue: Command Not Found

**Error:** `command not found`

**Possible reasons:**
- Typo in command
- Command not installed
- Wrong directory

**Solution:**
- Check spelling
- Use `which php` to find PHP location
- Make sure you're in the right directory

### Issue: Can't Find Application

**Solution:**
```bash
# Search for artisan file
find ~ -name "artisan" -type f 2>/dev/null

# This will show all Laravel applications
```

---

## Step 12: Quick Reference Commands

### Navigation
```bash
pwd                    # Show current directory
ls                     # List files
ls -la                 # List with details
cd /path               # Change directory
cd ..                  # Go up one level
cd ~                   # Go to home
```

### Laravel Commands
```bash
php artisan --version          # Check Laravel version
php artisan config:clear       # Clear config cache
php artisan cache:clear        # Clear application cache
php artisan queue:work --once  # Process one queue job
php artisan queue:failed       # Show failed jobs
```

### Queue Worker
```bash
ps aux | grep queue:work       # Check if running
tail -f storage/logs/queue-worker.log  # Watch logs
```

### File Operations
```bash
cat filename.txt       # View file
less filename.txt      # View file (scrollable)
tail filename.txt      # View last lines
chmod 775 directory/   # Change permissions
```

### Information
```bash
whoami                 # Show current user
php -v                 # Show PHP version
php -m                 # Show PHP modules
```

---

## Step 13: Visual Guide to cPanel Layout

```
┌─────────────────────────────────────┐
│  cPanel Dashboard                   │
├─────────────────────────────────────┤
│  [Search Box] 🔍                    │
│                                     │
│  ┌──────────┐  ┌──────────┐        │
│  │ Files    │  │ Databases│        │
│  │          │  │          │        │
│  └──────────┘  └──────────┘        │
│                                     │
│  ┌──────────┐  ┌──────────┐        │
│  │ Email    │  │ Domains  │        │
│  │          │  │          │        │
│  └──────────┘  └──────────┘        │
│                                     │
│  ... (scroll down) ...              │
│                                     │
│  ┌──────────┐  ┌──────────┐        │
│  │ Advanced │  │ Security │        │
│  │          │  │          │        │
│  │ [Terminal]│  │          │        │
│  │ [Cron]   │  │          │        │
│  └──────────┘  └──────────┘        │
└─────────────────────────────────────┘
```

---

## Step 14: Practice Exercise

Try these commands in order:

```bash
# 1. See where you are
pwd

# 2. See what's here
ls -la

# 3. Go to home
cd ~

# 4. List directories
ls -la

# 5. Try to find your application
cd public_html
ls -la

# 6. Check if artisan exists
ls artisan

# 7. If found, run verification
php verify-queue-setup.php

# 8. Check queue worker
ps aux | grep queue:work
```

---

## Need More Help?

1. **cPanel Documentation:** Check your hosting provider's docs
2. **Laravel Docs:** https://laravel.com/docs
3. **Terminal Tutorial:** Search "Linux terminal basics" online
4. **Hosting Support:** Contact your hosting provider

---

## Safety Tips

⚠️ **Be Careful:**
- Don't delete files unless you're sure
- Don't run commands you don't understand
- Always backup before making changes
- Test commands in a safe environment first

✅ **Safe Commands:**
- `pwd`, `ls`, `cd` - Navigation (safe)
- `php artisan --help` - Help commands (safe)
- `tail`, `cat` - Viewing files (safe)

❌ **Be Careful With:**
- `rm` - Deletes files (dangerous!)
- `chmod` - Changes permissions (can break things)
- `chown` - Changes ownership (needs care)

---

## Next Steps

After you're comfortable with Terminal:

1. ✅ Run verification script
2. ✅ Check queue worker status
3. ✅ Set up Cron Job
4. ✅ Monitor logs
5. ✅ Test email sending

Good luck! 🚀

