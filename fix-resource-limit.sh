#!/bin/bash

###############################################################################
# Fix Resource Limit Issues
# 
# This script helps clean up processes when you hit CloudLinux limits
# 
# Run: bash fix-resource-limit.sh
###############################################################################

echo "=== Resource Limit Fix ==="
echo ""

# 1. Check current processes
echo "1. Current Processes:"
PROCESS_COUNT=$(ps aux | wc -l)
echo "   Total processes: $PROCESS_COUNT"
echo ""

# 2. Find all queue workers
echo "2. Queue Workers:"
QUEUE_WORKERS=$(pgrep -f 'queue:work' | wc -l)
echo "   Queue worker processes: $QUEUE_WORKERS"

if [ "$QUEUE_WORKERS" -gt 1 ]; then
    echo "   ⚠️  Multiple workers found! Killing extras..."
    # Kill all but keep the first one
    pgrep -f 'queue:work' | tail -n +2 | xargs kill 2>/dev/null
    sleep 2
    echo "   ✓ Cleaned up extra workers"
fi

# Show remaining workers
pgrep -f 'queue:work' | while read pid; do
    ps -p $pid -o pid,etime,cmd --no-headers 2>/dev/null | sed 's/^/   PID: /'
done
echo ""

# 3. Check for stuck PHP processes
echo "3. PHP Processes:"
PHP_COUNT=$(pgrep -f 'php' | wc -l)
echo "   PHP processes: $PHP_COUNT"

if [ "$PHP_COUNT" -gt 10 ]; then
    echo "   ⚠️  High number of PHP processes"
    echo "   Listing PHP processes:"
    ps aux | grep php | grep -v grep | head -n 10 | sed 's/^/   /'
fi
echo ""

# 4. Check memory usage
echo "4. Memory Usage:"
if command -v free >/dev/null 2>&1; then
    free -h | grep Mem | awk '{print "   Total: " $2 ", Used: " $3 ", Free: " $4}'
fi
echo ""

# 5. Kill any zombie/stuck queue workers
echo "5. Cleaning Up:"
# Kill any queue workers that might be stuck
pkill -9 -f 'queue:work.*emails' 2>/dev/null
sleep 1
echo "   ✓ Cleaned up any stuck workers"
echo ""

# 6. Recommendations
echo "=== Recommendations ==="
echo ""
echo "If you're still hitting limits:"
echo "1. Wait a few minutes for processes to clear"
echo "2. Restart queue worker manually:"
echo "   cd ~/e-commerce.biruklemma.com/biruklir"
echo "   php artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300 >> storage/logs/queue-worker.log 2>&1 &"
echo ""
echo "3. Check with hosting if limits are too low"
echo "4. Consider reducing --timeout or --tries in queue worker"
echo ""

echo "=== Fix Complete ==="

