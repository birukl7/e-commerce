# Permanent Queue Worker Solution

## Problem
Queue worker keeps stopping and cron jobs aren't reliably restarting it.

## Root Causes
1. **Worker stops after 1 hour** (`--max-time=3600`)
2. **Cron job doesn't check if worker is already running** - may fail to restart
3. **Worker crashes** due to errors and cron doesn't detect it
4. **Multiple workers** can start if cron runs while worker is still running

## Solution: Smart Queue Worker Manager

I've created a robust manager script that:
- ✅ Checks if worker is running before starting
- ✅ Prevents multiple workers
- ✅ Handles worker crashes
- ✅ Provides detailed logging
- ✅ Can be run frequently (every 1-2 minutes)

## Setup Instructions

### Step 1: Upload the Manager Script

Upload `queue-worker-manager.sh` to your project root on cPanel.

### Step 2: Make it Executable

In cPanel Terminal:
```bash
cd ~/e-commerce.biruklemma.com/biruklir
chmod +x queue-worker-manager.sh
```

### Step 3: Test It Manually

```bash
bash queue-worker-manager.sh
```

You should see:
```
[2025-11-23 21:30:00] Queue worker is not running. Starting...
[2025-11-23 21:30:02] ✓ Queue worker started successfully (PID: 12345)
```

### Step 4: Set Up Cron Job

**Go to cPanel → Cron Jobs**

**Option A: Every 2 Minutes (Recommended)**
- **Minute:** `*/2`
- **Hour:** `*`
- **Day:** `*`
- **Month:** `*`
- **Weekday:** `*`

**Command:**
```bash
cd ~/e-commerce.biruklemma.com/biruklir && bash queue-worker-manager.sh >> storage/logs/queue-manager.log 2>&1
```

**Option B: Every Minute (More Frequent)**
- **Minute:** `*`
- **Hour:** `*`
- **Day:** `*`
- **Month:** `*`
- **Weekday:** `*`

**Command:**
```bash
cd ~/e-commerce.biruklemma.com/biruklir && bash queue-worker-manager.sh >> storage/logs/queue-manager.log 2>&1
```

### Step 5: Verify It's Working

Wait 5 minutes, then check:

```bash
# Check if worker is running
ps aux | grep "queue:work" | grep -v grep

# Check manager logs
tail -n 20 storage/logs/queue-manager.log

# Check worker logs
tail -n 20 storage/logs/queue-worker.log
```

## How It Works

1. **Every 2 minutes**, cron runs the manager script
2. **Manager checks** if worker is running
3. **If running**: Logs status and exits
4. **If not running**: Starts a new worker
5. **If multiple workers**: Kills extras and starts one
6. **All actions logged** to `storage/logs/queue-manager.log`

## Monitoring

### Check Manager Logs
```bash
tail -f storage/logs/queue-manager.log
```

### Check Worker Status
```bash
ps aux | grep "queue:work" | grep -v grep
```

### Check Pending Jobs
```bash
php artisan tinker --execute="echo 'Pending: ' . DB::table('jobs')->count() . PHP_EOL;"
```

## Troubleshooting

### Worker Still Not Starting

1. **Check PHP path** in the script:
   ```bash
   which php
   # Or
   /opt/alt/php83/usr/bin/php -v
   ```

2. **Check permissions**:
   ```bash
   ls -la queue-worker-manager.sh
   chmod +x queue-worker-manager.sh
   ```

3. **Check manager logs**:
   ```bash
   tail -n 50 storage/logs/queue-manager.log
   ```

4. **Test manually**:
   ```bash
   bash queue-worker-manager.sh
   ```

### Multiple Workers Starting

The script should prevent this, but if it happens:
```bash
# Kill all workers
pkill -f 'queue:work.*emails'

# Wait a moment
sleep 2

# Let cron restart it
```

### Cron Job Not Running

1. **Check cron job exists**:
   ```bash
   crontab -l
   ```

2. **Check cron service** (if you have access):
   ```bash
   systemctl status crond
   ```

3. **Test cron manually**:
   ```bash
   cd ~/e-commerce.biruklemma.com/biruklir && bash queue-worker-manager.sh
   ```

## Why This Solution is Better

### Old Approach (Problematic)
- Cron runs `queue:work` directly
- No check if worker already running
- Worker stops after 1 hour
- Cron may not restart it in time
- Multiple workers can start

### New Approach (Robust)
- Manager script checks before starting
- Prevents multiple workers
- Handles crashes gracefully
- Detailed logging for debugging
- Runs frequently (every 2 min) for quick recovery

## Expected Behavior

1. **Worker runs for 1 hour** (due to `--max-time=3600`)
2. **Worker stops** after 1 hour
3. **Within 2 minutes**, cron runs manager script
4. **Manager detects** worker is stopped
5. **Manager starts** new worker
6. **Process repeats** automatically

## Configuration: Max-Time Limit

The script has a `USE_MAX_TIME` setting that controls whether the worker stops after 1 hour:

### Option 1: Run Indefinitely (Recommended with Manager)

Edit `queue-worker-manager.sh` and set:
```bash
USE_MAX_TIME=false  # Run indefinitely
```

**Pros:**
- ✅ Worker runs continuously without interruption
- ✅ No 1-hour restart cycle
- ✅ Manager will restart it if it crashes anyway

**Cons:**
- ⚠️ Potential memory leaks over very long periods (weeks/months)
- ⚠️ PHP processes can accumulate memory over time

### Option 2: 1-Hour Limit (Safer for Long-Term)

Keep default:
```bash
USE_MAX_TIME=true  # Restart after 1 hour
```

**Pros:**
- ✅ Prevents memory leaks
- ✅ Fresh PHP process every hour
- ✅ More stable for long-term operation

**Cons:**
- ⚠️ Worker stops every hour (but manager restarts it within 2 minutes)

### Recommendation

**With the manager script running every 2 minutes, you can safely set `USE_MAX_TIME=false`** because:
- The manager will restart the worker if it crashes
- The manager will restart it if it stops for any reason
- Modern PHP and Laravel handle memory well
- You get continuous operation without hourly interruptions

If you notice memory issues after weeks/months, switch back to `USE_MAX_TIME=true`.

