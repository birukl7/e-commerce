#!/bin/bash

###############################################################################
# Check All Cron Jobs
# 
# This script shows ALL cron jobs, not just queue-worker-manager
###############################################################################

echo "=== Checking All Cron Jobs ==="
echo ""

# Check system crontab
echo "1. System Crontab (crontab -l):"
echo "----------------------------------------"
crontab -l 2>/dev/null
if [ $? -ne 0 ]; then
    echo "   (No cron jobs found in user crontab)"
fi
echo ""

# Check for queue-related cron jobs
echo "2. Queue-Related Cron Jobs:"
echo "----------------------------------------"
crontab -l 2>/dev/null | grep -i "queue" || echo "   (No queue-related cron jobs found)"
echo ""

# Check for any artisan cron jobs
echo "3. Artisan-Related Cron Jobs:"
echo "----------------------------------------"
crontab -l 2>/dev/null | grep -i "artisan" || echo "   (No artisan-related cron jobs found)"
echo ""

# Show all cron jobs with line numbers
echo "4. All Cron Jobs (with line numbers):"
echo "----------------------------------------"
crontab -l 2>/dev/null | nl -v 1 || echo "   (No cron jobs found)"
echo ""

# Check if cron service is running (if accessible)
echo "5. Cron Service Status:"
echo "----------------------------------------"
if command -v systemctl >/dev/null 2>&1; then
    systemctl status crond 2>/dev/null | head -n 3 || echo "   (Cannot check - may need root access)"
else
    echo "   (systemctl not available)"
fi
echo ""

echo "=== How to Add Cron Jobs in cPanel ==="
echo ""
echo "1. Go to cPanel → Cron Jobs (under Advanced section)"
echo "2. You should see a list of existing cron jobs"
echo "3. If list is empty, click 'Add New Cron Job'"
echo ""
echo "For Queue Worker Manager:"
echo "  Schedule: */2 * * * * (Every 2 minutes)"
echo "  Command: cd ~/e-commerce.biruklemma.com/biruklir && bash queue-worker-manager.sh >> storage/logs/queue-manager.log 2>&1"
echo ""
echo "For Laravel Scheduler (if needed):"
echo "  Schedule: * * * * * (Every minute)"
echo "  Command: cd ~/e-commerce.biruklemma.com/biruklir && /opt/alt/php83/usr/bin/php artisan schedule:run >> /dev/null 2>&1"
echo ""

