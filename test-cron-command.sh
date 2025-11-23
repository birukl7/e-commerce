#!/bin/bash

# Test script to verify the cron command works
# Run this manually to test: bash test-cron-command.sh

echo "=== Testing Cron Command ==="
echo ""

# Check if worker is already running
echo "1. Checking if worker is already running..."
if pgrep -f 'queue:work.*emails' > /dev/null; then
    echo "   ✓ Worker is already running"
    ps aux | grep "queue:work.*emails" | grep -v grep
    exit 0
else
    echo "   ✗ No worker running - will start one"
fi

echo ""
echo "2. Changing to application directory..."
cd ~/e-commerce.biruklemma.com/biruklir || {
    echo "   ✗ Failed to change directory"
    exit 1
}
echo "   ✓ Changed to: $(pwd)"

echo ""
echo "3. Checking PHP path..."
if [ -f "/opt/alt/php83/usr/bin/php" ]; then
    echo "   ✓ PHP found: /opt/alt/php83/usr/bin/php"
    /opt/alt/php83/usr/bin/php --version | head -1
else
    echo "   ✗ PHP not found at /opt/alt/php83/usr/bin/php"
    echo "   Trying: which php"
    which php
fi

echo ""
echo "4. Testing queue:work command..."
/opt/alt/php83/usr/bin/php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600 --once

echo ""
echo "5. If above worked, starting worker in background..."
nohup /opt/alt/php83/usr/bin/php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 --max-time=3600 >> storage/logs/queue-worker.log 2>&1 &

echo ""
echo "6. Waiting 2 seconds, then checking if worker started..."
sleep 2
if pgrep -f 'queue:work.*emails' > /dev/null; then
    echo "   ✓ Worker started successfully!"
    ps aux | grep "queue:work.*emails" | grep -v grep
else
    echo "   ✗ Worker failed to start"
    echo "   Check logs: tail -n 20 storage/logs/queue-worker.log"
fi

