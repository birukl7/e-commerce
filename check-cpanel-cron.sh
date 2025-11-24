#!/bin/bash

###############################################################################
# Check cPanel Cron Jobs
# 
# This checks both system crontab AND cPanel-specific locations
###############################################################################

echo "=== Checking cPanel Cron Jobs ==="
echo ""

# 1. Check system crontab (what terminal sees)
echo "1. System Crontab (crontab -l):"
echo "----------------------------------------"
SYSTEM_CRON=$(crontab -l 2>/dev/null)
if [ -z "$SYSTEM_CRON" ]; then
    echo "   (Empty - no cron jobs in system crontab)"
else
    echo "$SYSTEM_CRON" | grep -v '^#' | grep -v '^$' | nl -v 1 | sed 's/^/   /'
fi
echo ""

# 2. Check cPanel cron directory (if accessible)
echo "2. cPanel Cron Directory:"
echo "----------------------------------------"
CPANEL_CRON_DIR="$HOME/.cpanel/cron"
if [ -d "$CPANEL_CRON_DIR" ]; then
    echo "   ✓ cPanel cron directory exists"
    ls -la "$CPANEL_CRON_DIR" 2>/dev/null | sed 's/^/   /' || echo "   (Cannot list)"
else
    echo "   (cPanel cron directory not accessible via terminal)"
fi
echo ""

# 3. Check for queue-related in system crontab
echo "3. Queue-Related Jobs (in system crontab):"
echo "----------------------------------------"
if [ -n "$SYSTEM_CRON" ]; then
    echo "$SYSTEM_CRON" | grep -i "queue" | sed 's/^/   /' || echo "   (None found)"
else
    echo "   (No system crontab to check)"
fi
echo ""

# 4. Important note
echo "=== IMPORTANT ==="
echo ""
echo "cPanel cron jobs are managed in the cPanel interface."
echo "They may not immediately appear in 'crontab -l'."
echo ""
echo "To verify your cron jobs:"
echo "1. Go to cPanel → Cron Jobs (Advanced section)"
echo "2. You should see a list of all your cron jobs there"
echo "3. If they're missing, you need to recreate them"
echo ""
echo "If cron jobs exist in cPanel but not in crontab -l:"
echo "- They may not have synced yet (wait a few minutes)"
echo "- Or there may be a cPanel configuration issue"
echo ""

