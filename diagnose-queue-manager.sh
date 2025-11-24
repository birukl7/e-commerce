#!/bin/bash

###############################################################################
# Queue Manager Diagnostic Script
# 
# This script helps diagnose why the queue manager isn't restarting workers
# 
# Run this if your worker keeps stopping:
#   bash diagnose-queue-manager.sh
###############################################################################

# Try to detect project directory
if [ -f "artisan" ]; then
    PROJECT_DIR=$(pwd)
elif [ -d "$HOME/e-commerce.biruklemma.com/biruklir" ]; then
    PROJECT_DIR="$HOME/e-commerce.biruklemma.com/biruklir"
else
    PROJECT_DIR=""
fi

# Try to detect PHP
if command -v php83 >/dev/null 2>&1; then
    PHP_BIN=$(which php83)
elif [ -f "/opt/alt/php83/usr/bin/php" ]; then
    PHP_BIN="/opt/alt/php83/usr/bin/php"
elif command -v php >/dev/null 2>&1; then
    PHP_BIN=$(which php)
else
    PHP_BIN=""
fi

echo "=== Queue Manager Diagnostic ==="
echo ""
echo "Project Directory: ${PROJECT_DIR:-NOT FOUND}"
echo "PHP Binary: ${PHP_BIN:-NOT FOUND}"
echo ""

# 1. Check if manager script exists
echo "1. Manager Script:"
if [ -f "$PROJECT_DIR/queue-worker-manager.sh" ]; then
    echo "   ✓ Script exists: queue-worker-manager.sh"
    
    # Check permissions
    if [ -x "$PROJECT_DIR/queue-worker-manager.sh" ]; then
        echo "   ✓ Script is executable"
    else
        echo "   ❌ Script is NOT executable!"
        echo "   → Fix: chmod +x queue-worker-manager.sh"
    fi
else
    echo "   ❌ Script NOT found!"
    echo "   → Upload queue-worker-manager.sh to project root"
fi
echo ""

# 2. Check cron job
echo "2. Cron Job Configuration:"
echo "   Checking crontab..."
CRONTAB_OUTPUT=$(crontab -l 2>/dev/null)

if [ -z "$CRONTAB_OUTPUT" ]; then
    echo "   ❌ No cron jobs found at all!"
    echo "   → Your cron jobs may have been deleted"
    echo "   → Go to cPanel → Cron Jobs to add them back"
else
    echo "   Total cron jobs found: $(echo "$CRONTAB_OUTPUT" | grep -v '^#' | grep -v '^$' | wc -l)"
    echo ""
    echo "   All cron jobs:"
    echo "$CRONTAB_OUTPUT" | grep -v '^#' | grep -v '^$' | nl -v 1 | sed 's/^/     /'
    echo ""
    
    # Check for queue-worker-manager
    if echo "$CRONTAB_OUTPUT" | grep -q "queue-worker-manager"; then
        echo "   ✓ Queue worker manager cron job found"
        echo "   Manager cron job:"
        echo "$CRONTAB_OUTPUT" | grep "queue-worker-manager" | sed 's/^/     /'
        
        # Check if it's running frequently enough
        CRON_SCHEDULE=$(echo "$CRONTAB_OUTPUT" | grep "queue-worker-manager" | awk '{print $1}')
        if [[ "$CRON_SCHEDULE" == "*/2"* ]] || [[ "$CRON_SCHEDULE" == "*"* ]]; then
            echo "   ✓ Running frequently (every 2 min or every minute)"
        else
            echo "   ⚠️  May not run frequently enough: $CRON_SCHEDULE"
            echo "   → Should be */2 * * * * (every 2 minutes) or * * * * * (every minute)"
        fi
    else
        echo "   ❌ Queue worker manager cron job NOT found!"
        echo "   → Add cron job in cPanel:"
        echo "     Schedule: */2 * * * *"
        echo "     Command: cd ~/e-commerce.biruklemma.com/biruklir && bash queue-worker-manager.sh >> storage/logs/queue-manager.log 2>&1"
    fi
    
    # Check for other queue-related cron jobs
    if echo "$CRONTAB_OUTPUT" | grep -q "queue:work"; then
        echo ""
        echo "   ⚠️  Found direct queue:work cron job (may conflict with manager):"
        echo "$CRONTAB_OUTPUT" | grep "queue:work" | sed 's/^/     /'
        echo "   → Consider removing this and using the manager script instead"
    fi
fi
echo ""

# 3. Check manager logs
echo "3. Manager Logs:"
if [ -f "$PROJECT_DIR/storage/logs/queue-manager.log" ]; then
    echo "   ✓ Log file exists"
    
    # Check recent activity
    LAST_LOG=$(tail -n 1 "$PROJECT_DIR/storage/logs/queue-manager.log" 2>/dev/null)
    if [ -n "$LAST_LOG" ]; then
        echo "   Last entry:"
        echo "   $LAST_LOG"
        
        # Check if recent (last 10 minutes)
        LOG_TIME=$(echo "$LAST_LOG" | grep -oP '\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}' | head -n1)
        if [ -n "$LOG_TIME" ]; then
            LOG_TIMESTAMP=$(date -d "$LOG_TIME" +%s 2>/dev/null || echo "0")
            NOW=$(date +%s)
            DIFF=$((NOW - LOG_TIMESTAMP))
            
            if [ $DIFF -lt 600 ]; then
                echo "   ✓ Recent activity (last 10 minutes)"
            else
                echo "   ⚠️  Last activity was $((DIFF / 60)) minutes ago"
                echo "   → Cron may not be running the manager"
            fi
        fi
    else
        echo "   ⚠️  Log file is empty"
        echo "   → Manager hasn't run yet or cron isn't executing it"
    fi
else
    echo "   ⚠️  Log file not found"
    echo "   → Manager hasn't run yet"
fi
echo ""

# 4. Check worker status
echo "4. Worker Status:"
if pgrep -f 'queue:work.*emails' > /dev/null; then
    WORKER_PID=$(pgrep -f 'queue:work.*emails' | head -n1)
    echo "   ✓ Worker is running (PID: $WORKER_PID)"
    
    # Check uptime
    RUNTIME=$(ps -o etime= -p "$WORKER_PID" 2>/dev/null | tr -d ' ')
    if [ -n "$RUNTIME" ]; then
        echo "   Uptime: $RUNTIME"
    fi
else
    echo "   ❌ Worker is NOT running"
    echo "   → Manager should start it (check manager logs above)"
fi
echo ""

# 5. Check PHP path
echo "5. PHP Configuration:"
if [ -f "$PHP_BIN" ]; then
    echo "   ✓ PHP found: $PHP_BIN"
    PHP_VERSION=$("$PHP_BIN" -v 2>/dev/null | head -n1)
    echo "   $PHP_VERSION"
else
    echo "   ❌ PHP NOT found: $PHP_BIN"
    echo "   → Check PHP path in queue-worker-manager.sh"
    echo "   → Find PHP: which php"
fi
echo ""

# 6. Test manager script manually
echo "6. Test Manager Script:"
if [ -z "$PROJECT_DIR" ] || [ ! -d "$PROJECT_DIR" ]; then
    echo "   ❌ Cannot access project directory"
    echo "   → Run this script from your project root, or set PROJECT_DIR"
else
    cd "$PROJECT_DIR" 2>/dev/null || {
        echo "   ❌ Cannot cd to project directory: $PROJECT_DIR"
    }
    
    if [ -f "queue-worker-manager.sh" ]; then
        echo "   Testing if manager can run..."
        
        # Try to run manager (capture output)
        TEST_OUTPUT=$(bash queue-worker-manager.sh 2>&1)
        TEST_EXIT=$?
        
        if [ $TEST_EXIT -eq 0 ]; then
            echo "   ✓ Manager script runs successfully"
            echo "   Last 3 lines of output:"
            echo "$TEST_OUTPUT" | tail -n 3 | sed 's/^/   /'
        else
            echo "   ❌ Manager script failed!"
            echo "   Exit code: $TEST_EXIT"
            echo "   Error output:"
            echo "$TEST_OUTPUT" | sed 's/^/   /' | tail -n 10
        fi
    else
        echo "   ❌ Manager script not found in: $PROJECT_DIR"
    fi
fi
echo ""

# 7. Check environment (cron vs shell)
echo "7. Environment Check:"
echo "   Current user: $(whoami)"
echo "   HOME: $HOME"
echo "   PATH: $PATH"
echo "   SHELL: $SHELL"
echo "   PWD: $(pwd)"
echo ""

# 8. Check if cron can access files
echo "8. File Access Check:"
if [ -n "$PROJECT_DIR" ] && [ -d "$PROJECT_DIR" ]; then
    cd "$PROJECT_DIR"
    
    FILES_TO_CHECK=(
        "queue-worker-manager.sh"
        "artisan"
        "storage/logs"
    )
    
    for file in "${FILES_TO_CHECK[@]}"; do
        if [ -e "$file" ]; then
            if [ -r "$file" ]; then
                echo "   ✓ $file exists and is readable"
            else
                echo "   ❌ $file exists but NOT readable"
            fi
        else
            echo "   ❌ $file NOT found"
        fi
    done
else
    echo "   ⚠️  Cannot check (project directory not found)"
fi
echo ""

# 9. Common Issues Summary
echo "=== Common Issues & Fixes ==="
echo ""

ISSUES_FOUND=0

# Check each potential issue
if ! crontab -l 2>/dev/null | grep -q "queue-worker-manager"; then
    echo "❌ ISSUE #1: Cron job not found"
    echo "   Fix: Add cron job in cPanel"
    echo "   Schedule: */2 * * * *"
    echo "   Command: cd ~/e-commerce.biruklemma.com/biruklir && bash queue-worker-manager.sh >> storage/logs/queue-manager.log 2>&1"
    echo ""
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

if [ -n "$PROJECT_DIR" ] && [ -f "$PROJECT_DIR/queue-worker-manager.sh" ] && [ ! -x "$PROJECT_DIR/queue-worker-manager.sh" ]; then
    echo "❌ ISSUE #2: Script not executable"
    echo "   Fix: chmod +x queue-worker-manager.sh"
    echo ""
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

if [ -z "$PHP_BIN" ] || [ ! -f "$PHP_BIN" ]; then
    echo "❌ ISSUE #3: PHP binary not found"
    echo "   Fix: Update PHP_BIN in queue-worker-manager.sh"
    echo "   Find PHP: which php"
    echo "   Or: /opt/alt/php83/usr/bin/php -v"
    echo ""
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

if [ -z "$PROJECT_DIR" ] || [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ ISSUE #4: Project directory not found"
    echo "   Fix: Update PROJECT_DIR in queue-worker-manager.sh"
    echo "   Find path: pwd (when in project root)"
    echo ""
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Check if manager logs show errors
if [ -n "$PROJECT_DIR" ] && [ -f "$PROJECT_DIR/storage/logs/queue-manager.log" ]; then
    ERROR_COUNT=$(grep -i "error\|failed\|cannot" "$PROJECT_DIR/storage/logs/queue-manager.log" 2>/dev/null | wc -l)
    if [ "$ERROR_COUNT" -gt 0 ]; then
        echo "⚠️  ISSUE #5: Errors found in manager logs"
        echo "   Check: tail -n 50 storage/logs/queue-manager.log"
        echo "   Recent errors:"
        grep -i "error\|failed\|cannot" "$PROJECT_DIR/storage/logs/queue-manager.log" 2>/dev/null | tail -n 3 | sed 's/^/   /'
        echo ""
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
fi

# Check if cron is actually running
if ! pgrep -f 'queue:work.*emails' > /dev/null; then
    # Check when manager last ran
    if [ -n "$PROJECT_DIR" ] && [ -f "$PROJECT_DIR/storage/logs/queue-manager.log" ]; then
        LAST_RUN=$(tail -n 1 "$PROJECT_DIR/storage/logs/queue-manager.log" 2>/dev/null | grep -oP '\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}' | head -n1)
        if [ -n "$LAST_RUN" ]; then
            LAST_TIMESTAMP=$(date -d "$LAST_RUN" +%s 2>/dev/null || echo "0")
            NOW=$(date +%s)
            MINUTES_AGO=$(( (NOW - LAST_TIMESTAMP) / 60 ))
            
            if [ $MINUTES_AGO -gt 5 ]; then
                echo "⚠️  ISSUE #6: Manager hasn't run recently"
                echo "   Last run: $MINUTES_AGO minutes ago"
                echo "   → Cron may not be executing the script"
                echo "   → Check cron service or test manually: bash queue-worker-manager.sh"
                echo ""
                ISSUES_FOUND=$((ISSUES_FOUND + 1))
            fi
        fi
    fi
fi

if [ $ISSUES_FOUND -eq 0 ]; then
    echo "✓ No obvious issues found"
    echo ""
    echo "If worker still isn't restarting:"
    echo "1. Check manager logs: tail -f storage/logs/queue-manager.log"
    echo "2. Test manager manually: bash queue-worker-manager.sh"
    echo "3. Check cron is running: systemctl status crond (if you have access)"
    echo ""
else
    echo "Found $ISSUES_FOUND potential issue(s) above."
    echo ""
fi

echo "=== Diagnostic Complete ==="

