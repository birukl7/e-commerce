# Emergency: Terminal Stuck - Resource Limit Hit

## Quick Fix (Run These Commands)

If your terminal is stuck, try these commands in a NEW terminal session:

### Step 1: Kill Stuck Processes

```bash
# Kill all queue workers (they'll restart via cron)
pkill -9 -f 'queue:work'

# Wait a moment
sleep 2

# Check if terminal is responsive now
echo "Terminal test"
```

### Step 2: Check What's Running

```bash
# Count your processes
ps aux | wc -l

# See queue workers
ps aux | grep "queue:work" | grep -v grep

# See all PHP processes
ps aux | grep php | grep -v grep
```

### Step 3: Clean Up

```bash
# Kill duplicate queue workers (keep only one)
pgrep -f 'queue:work' | tail -n +2 | xargs kill 2>/dev/null

# Kill any stuck PHP processes (be careful!)
# Only kill if you see many duplicates
ps aux | grep php | grep -v grep | awk '{print $2}' | tail -n +5 | xargs kill 2>/dev/null
```

### Step 4: Restart Worker (If Needed)

```bash
cd ~/e-commerce.biruklemma.com/biruklir

# Start worker (only one!)
php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 >> storage/logs/queue-worker.log 2>&1 &

# Verify only one is running
ps aux | grep "queue:work" | grep -v grep
```

## Why This Happened

CloudLinux limits:
- **PMEM**: Process memory limit
- **Process count**: Maximum number of processes
- **NPROC**: Number of processes per user

Common causes:
1. Multiple queue workers running (should only be one)
2. Worker spawning too many child processes
3. Stuck/zombie processes not cleaned up
4. Memory leak in PHP processes

## Prevention

The manager script should prevent this by:
- ✅ Only allowing one worker at a time
- ✅ Killing duplicates automatically
- ✅ Restarting cleanly

But if you manually started workers or had multiple cron jobs, you can hit limits.

## Long-Term Solution

1. **Use the manager script** (which prevents multiple workers)
2. **Set up cron job** (so manager auto-restarts)
3. **Don't manually start workers** (let manager handle it)
4. **Monitor process count** occasionally

## If Terminal is Completely Stuck

1. **Close the terminal** (it's stuck anyway)
2. **Open a NEW terminal** in cPanel
3. **Run cleanup commands** above
4. **Wait 5-10 minutes** for processes to clear
5. **Then restart worker** if needed

## Check Your Limits

Ask your hosting provider about:
- Current PMEM limit
- Current process limit (NPROC)
- If limits can be increased

