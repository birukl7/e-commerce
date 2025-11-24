# Setting Up Cron Jobs in cPanel

## Step-by-Step: Add Queue Worker Manager Cron Job

### Step 1: Access Cron Jobs
1. **Login to cPanel**
2. **Scroll down** to **"Advanced"** section
3. **Click "Cron Jobs"** (clock icon)
   - Or search for "cron" in the search box

### Step 2: Add New Cron Job
1. **Click "Add New Cron Job"** or **"Create New Cron Job"** button
2. You'll see a form with:
   - **Common Settings** (dropdown)
   - **Minute, Hour, Day, Month, Weekday** fields
   - **Command** field

### Step 3: Configure Schedule
**Option A: Use Common Settings Dropdown**
- Select **"Every 2 Minutes"** from dropdown

**Option B: Manual Entry**
- **Minute:** `*/2`
- **Hour:** `*`
- **Day:** `*`
- **Month:** `*`
- **Weekday:** `*`

### Step 4: Enter Command
In the **Command** field, paste:

```bash
cd ~/e-commerce.biruklemma.com/biruklir && bash queue-worker-manager.sh >> storage/logs/queue-manager.log 2>&1
```

### Step 5: Save
- Click **"Add New Cron Job"** or **"Save"** button
- You should see a success message

### Step 6: Verify
1. **Check the cron jobs list** - you should see your new job
2. **Wait 5 minutes**
3. **Check manager logs:**
   ```bash
   cd ~/e-commerce.biruklemma.com/biruklir
   tail -n 10 storage/logs/queue-manager.log
   ```
   Should show entries every 2 minutes

## If Your Cron Jobs Disappeared

### Why They Might Be Gone
- cPanel update/reset
- Account changes
- Manual deletion
- Hosting provider maintenance
- cPanel bug/glitch

### How to Check
1. **Go to cPanel → Cron Jobs**
2. **Look at the list** - are your cron jobs there?
3. If **empty or missing**, they were deleted

### How to Recreate
Just follow **Step 1-6** above to add them back.

## Multiple Cron Jobs

If you need multiple cron jobs:

### Cron Job 1: Queue Worker Manager
- **Schedule:** Every 2 minutes (`*/2 * * * *`)
- **Command:** 
  ```bash
  cd ~/e-commerce.biruklemma.com/biruklir && bash queue-worker-manager.sh >> storage/logs/queue-manager.log 2>&1
  ```

### Cron Job 2: Laravel Scheduler (if you use it)
- **Schedule:** Every minute (`* * * * *`)
- **Command:**
  ```bash
  cd ~/e-commerce.biruklemma.com/biruklir && /opt/alt/php83/usr/bin/php artisan schedule:run >> /dev/null 2>&1
  ```

## Troubleshooting

### Cron Job Not Running
1. **Check it exists** in cPanel → Cron Jobs
2. **Check command is correct** (no typos)
3. **Check paths** (use `~` or full paths)
4. **Wait 5-10 minutes** for first run
5. **Check logs** for errors

### Cron Job Running But Not Working
1. **Check manager logs:** `tail -f storage/logs/queue-manager.log`
2. **Test command manually:** Run the command in terminal
3. **Check permissions:** Script must be executable
4. **Check paths:** All paths must be correct

## Quick Verification Commands

After setting up cron job, wait 5 minutes then:

```bash
cd ~/e-commerce.biruklemma.com/biruklir

# Check manager logs (should show activity every 2 min)
tail -n 20 storage/logs/queue-manager.log

# Check if worker is running
ps aux | grep "queue:work" | grep -v grep

# Run diagnostic
bash diagnose-queue-manager.sh
```

