# Quick Fix: Queue Worker Not Restarting

## Is Removing Max-Time Risky?

**Short answer: NO, it's safe to remove it.**

### Why Max-Time Exists
- Prevents memory leaks in PHP processes that run for days/weeks
- Forces a fresh restart every hour

### Why It's Safe to Remove (With Manager)
- ✅ Manager script will restart worker if it crashes
- ✅ Manager runs every 2 minutes, so quick recovery
- ✅ Modern PHP/Laravel handle memory well
- ✅ You'll have continuous operation without hourly stops

### Recommendation
**Remove `--max-time`** - The manager script makes it unnecessary.

## How to Remove Max-Time

The script is already configured with `USE_MAX_TIME=false` by default, so **max-time is already disabled**.

If you want to verify, check line 23 in `queue-worker-manager.sh`:
```bash
USE_MAX_TIME=false  # This means NO max-time limit
```

## If Manager Isn't Restarting Worker

### Step 1: Run Diagnostic

Upload `diagnose-queue-manager.sh` to your cPanel server, then:

```bash
cd ~/e-commerce.biruklemma.com/biruklir
chmod +x diagnose-queue-manager.sh
bash diagnose-queue-manager.sh
```

This will tell you exactly what's wrong.

### Step 2: Common Issues & Fixes

#### Issue 1: Cron Job Not Running
**Symptoms:**
- Manager logs show no recent activity
- Worker stops and doesn't restart

**Fix:**
1. Go to cPanel → Cron Jobs
2. Verify cron job exists:
   - Schedule: `*/2 * * * *`
   - Command: `cd ~/e-commerce.biruklemma.com/biruklir && bash queue-worker-manager.sh >> storage/logs/queue-manager.log 2>&1`
3. If missing, add it
4. If exists, check if cron service is running (contact hosting if needed)

#### Issue 2: Script Not Executable
**Symptoms:**
- Diagnostic shows "Script is NOT executable"
- Cron runs but nothing happens

**Fix:**
```bash
cd ~/e-commerce.biruklemma.com/biruklir
chmod +x queue-worker-manager.sh
```

#### Issue 3: Wrong PHP Path
**Symptoms:**
- Manager logs show "PHP binary not found"
- Worker doesn't start

**Fix:**
1. Find your PHP path:
   ```bash
   which php
   # Or
   /opt/alt/php83/usr/bin/php -v
   ```

2. Edit `queue-worker-manager.sh` line 20:
   ```bash
   PHP_BIN="/opt/alt/php83/usr/bin/php"  # Update this path
   ```

#### Issue 4: Wrong Project Path
**Symptoms:**
- Manager logs show "Cannot access project directory"

**Fix:**
1. Find your actual project path:
   ```bash
   pwd
   # Should show something like: /home/username/e-commerce.biruklemma.com/biruklir
   ```

2. Edit `queue-worker-manager.sh` line 19:
   ```bash
   PROJECT_DIR="$HOME/e-commerce.biruklemma.com/biruklir"  # Update this path
   ```

#### Issue 5: Cron Job Path Issues
**Symptoms:**
- Cron runs but can't find script
- Manager logs show errors

**Fix:**
Make sure cron command uses full path or `cd` first:
```bash
# Good (uses cd):
cd ~/e-commerce.biruklemma.com/biruklir && bash queue-worker-manager.sh >> storage/logs/queue-manager.log 2>&1

# Also good (full path):
bash ~/e-commerce.biruklemma.com/biruklir/queue-worker-manager.sh >> ~/e-commerce.biruklemma.com/biruklir/storage/logs/queue-manager.log 2>&1
```

### Step 3: Test Manually

After fixing issues, test the manager:

```bash
cd ~/e-commerce.biruklemma.com/biruklir
bash queue-worker-manager.sh
```

You should see:
```
[2025-11-23 21:30:00] Queue worker is not running. Starting...
[2025-11-23 21:30:02] ✓ Queue worker started successfully (PID: 12345)
```

### Step 4: Verify Cron is Running

Wait 5 minutes, then check:

```bash
# Check manager logs (should show activity every 2 minutes)
tail -n 20 storage/logs/queue-manager.log

# Check if worker is running
ps aux | grep "queue:work" | grep -v grep
```

## Summary

1. **Max-time is already disabled** in the script (`USE_MAX_TIME=false`)
2. **Run diagnostic** to find why manager isn't restarting
3. **Most common issue**: Cron job not set up correctly
4. **Quick test**: Run manager manually to verify it works

The manager script will keep your worker running indefinitely without the 1-hour restart cycle!

