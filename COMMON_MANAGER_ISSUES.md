# Common Issues: Why Manager Isn't Restarting Worker

## Top 5 Reasons Manager Fails to Restart Worker

### 1. ❌ Cron Job Not Set Up or Not Running

**Symptoms:**
- Manager logs show no recent activity
- Worker stops and never restarts
- `crontab -l` shows no queue-worker-manager entry

**Diagnosis:**
```bash
crontab -l | grep queue-worker-manager
# Should show your cron job
```

**Fix:**
1. Go to cPanel → Cron Jobs
2. Add/Edit cron job:
   - **Schedule:** `*/2 * * * *` (every 2 minutes)
   - **Command:** `cd ~/e-commerce.biruklemma.com/biruklir && bash queue-worker-manager.sh >> storage/logs/queue-manager.log 2>&1`
3. Save

**Verify:**
```bash
# Wait 5 minutes, then check
tail -n 10 storage/logs/queue-manager.log
# Should show entries every 2 minutes
```

---

### 2. ❌ Script Not Executable

**Symptoms:**
- Cron runs but nothing happens
- Manager logs are empty or show "Permission denied"

**Diagnosis:**
```bash
ls -la queue-worker-manager.sh
# Should show: -rwxr-xr-x (x = executable)
```

**Fix:**
```bash
chmod +x queue-worker-manager.sh
```

**Verify:**
```bash
ls -la queue-worker-manager.sh | grep -q "^-rwx" && echo "✓ Executable" || echo "❌ Not executable"
```

---

### 3. ❌ Wrong Paths in Script

**Symptoms:**
- Manager logs show "Cannot access project directory"
- Manager logs show "PHP binary not found"
- Script runs but can't find files

**Diagnosis:**
Check the paths in `queue-worker-manager.sh`:
```bash
grep "PROJECT_DIR\|PHP_BIN" queue-worker-manager.sh
```

**Fix:**

1. **Find your actual project path:**
   ```bash
   pwd
   # When you're in your project root
   ```

2. **Find your PHP path:**
   ```bash
   which php
   # Or
   /opt/alt/php83/usr/bin/php -v
   ```

3. **Edit queue-worker-manager.sh:**
   ```bash
   # Line 19 - Update PROJECT_DIR
   PROJECT_DIR="$HOME/e-commerce.biruklemma.com/biruklir"
   
   # Line 20 - Update PHP_BIN
   PHP_BIN="/opt/alt/php83/usr/bin/php"
   ```

**Verify:**
```bash
# Test paths
cd "$PROJECT_DIR" && echo "✓ Project dir works"
"$PHP_BIN" -v && echo "✓ PHP works"
```

---

### 4. ❌ Cron Environment Different from Shell

**Symptoms:**
- Script works when run manually but fails in cron
- Manager logs show "command not found" errors
- Paths work in terminal but not in cron

**Why:**
Cron runs with minimal environment (no $HOME, limited PATH)

**Fix:**

Use absolute paths in cron command:
```bash
# Instead of:
cd ~/e-commerce.biruklemma.com/biruklir && bash queue-worker-manager.sh

# Use full path:
bash /home/username/e-commerce.biruklemma.com/biruklir/queue-worker-manager.sh >> /home/username/e-commerce.biruklemma.com/biruklir/storage/logs/queue-manager.log 2>&1
```

Or ensure script uses absolute paths internally (which it does with $HOME).

**Verify:**
```bash
# Test in minimal environment (simulates cron)
env -i HOME=$HOME bash queue-worker-manager.sh
```

---

### 5. ❌ Manager Script Has Errors

**Symptoms:**
- Manager runs but exits immediately
- Manager logs show errors
- Worker never starts

**Diagnosis:**
```bash
# Run manager and capture all output
bash -x queue-worker-manager.sh 2>&1 | tee test-output.log

# Check for errors
grep -i "error\|failed\|cannot" test-output.log
```

**Common Errors:**

**Error: "Cannot access project directory"**
- Fix: Update PROJECT_DIR path

**Error: "PHP binary not found"**
- Fix: Update PHP_BIN path

**Error: "artisan: command not found"**
- Fix: Make sure you're in project root, or use full path to artisan

**Error: "Permission denied"**
- Fix: `chmod +x queue-worker-manager.sh`

**Fix:**
1. Read the error message in manager logs
2. Fix the specific issue (path, permission, etc.)
3. Test manually: `bash queue-worker-manager.sh`

---

## Quick Diagnostic Checklist

Run this to check all common issues:

```bash
cd ~/e-commerce.biruklemma.com/biruklir

# 1. Check cron job exists
echo "1. Cron job:"
crontab -l | grep queue-worker-manager || echo "   ❌ NOT FOUND"

# 2. Check script exists and is executable
echo "2. Script:"
[ -f queue-worker-manager.sh ] && echo "   ✓ Exists" || echo "   ❌ NOT FOUND"
[ -x queue-worker-manager.sh ] && echo "   ✓ Executable" || echo "   ❌ NOT EXECUTABLE"

# 3. Check paths in script
echo "3. Paths:"
grep "PROJECT_DIR=" queue-worker-manager.sh
grep "PHP_BIN=" queue-worker-manager.sh

# 4. Test paths work
echo "4. Path test:"
PROJECT_DIR=$(grep "PROJECT_DIR=" queue-worker-manager.sh | cut -d'"' -f2)
PHP_BIN=$(grep "PHP_BIN=" queue-worker-manager.sh | cut -d'"' -f2)
[ -d "$PROJECT_DIR" ] && echo "   ✓ Project dir exists" || echo "   ❌ Project dir NOT FOUND"
[ -f "$PHP_BIN" ] && echo "   ✓ PHP exists" || echo "   ❌ PHP NOT FOUND"

# 5. Check recent manager activity
echo "5. Manager logs:"
if [ -f storage/logs/queue-manager.log ]; then
    tail -n 1 storage/logs/queue-manager.log
else
    echo "   ⚠️  Log file doesn't exist (manager hasn't run)"
fi

# 6. Check if worker is running
echo "6. Worker status:"
pgrep -f 'queue:work.*emails' > /dev/null && echo "   ✓ Running" || echo "   ❌ NOT RUNNING"
```

---

## Most Likely Issue

**90% of the time, it's one of these:**

1. **Cron job not set up** (most common)
2. **Script not executable** (very common)
3. **Wrong paths** (common on cPanel)

Run the diagnostic script to find out which one:
```bash
bash diagnose-queue-manager.sh
```

