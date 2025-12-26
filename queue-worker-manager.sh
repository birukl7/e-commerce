#!/bin/bash

###############################################################################
# Queue Worker Manager Script
# 
# This script ensures the queue worker is always running.
# It checks if a worker is running, and starts one if not.
# 
# Designed to be run frequently via cron (every 1-2 minutes)
# 
# Usage:
#   bash queue-worker-manager.sh
# 
# Configuration:
#   Set USE_MAX_TIME=true to limit worker to 1 hour (prevents memory leaks)
#   Set USE_MAX_TIME=false to run indefinitely (manager will restart if it crashes)
# 
# Cron job (every 2 minutes):
#   */2 * * * * cd ~/e-commerce.biruklemma.com/biruklir && bash queue-worker-manager.sh >> storage/logs/queue-manager.log 2>&1
###############################################################################

# Configuration
PROJECT_DIR="$HOME/e-commerce.biruklemma.com/biruklir"
PHP_BIN="/opt/cpanel/ea-php81/root/usr/bin/php"
LOG_FILE="$PROJECT_DIR/storage/logs/queue-manager.log"
WORKER_LOG="$PROJECT_DIR/storage/logs/queue-worker.log"
MAX_WORKERS=1  # Only allow one worker at a time
USE_MAX_TIME=false  # Set to true to limit worker to 1 hour, false to run indefinitely (RECOMMENDED: false)

# Colors for output (if terminal supports it)
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Navigate to project directory
cd "$PROJECT_DIR" || {
    log "ERROR: Cannot access project directory: $PROJECT_DIR"
    exit 1
}

# Check if PHP is available
if [ ! -f "$PHP_BIN" ]; then
    log "ERROR: PHP binary not found: $PHP_BIN"
    exit 1
fi

# Function to check if worker is running
is_worker_running() {
    pgrep -f 'queue:work.*emails' > /dev/null 2>&1
}

# Function to count running workers
count_workers() {
    pgrep -f 'queue:work.*emails' | wc -l
}

# Function to kill all workers (cleanup)
kill_all_workers() {
    pkill -f 'queue:work.*emails' 2>/dev/null
    sleep 1
}

# Function to start worker
start_worker() {
    log "Starting queue worker..."
    
    # Build command
    WORKER_CMD="$PHP_BIN artisan queue:work --queue=emails,default --sleep=3 --tries=5 --timeout=300"
    
    # Add max-time only if enabled
    if [ "$USE_MAX_TIME" = "true" ]; then
        WORKER_CMD="$WORKER_CMD --max-time=3600"
        log "  Using max-time=3600 (worker will restart after 1 hour)"
    else
        log "  Running indefinitely (no max-time limit)"
    fi
    
    # Start worker in background
    nohup $WORKER_CMD >> "$WORKER_LOG" 2>&1 &
    
    # Wait a moment for it to start
    sleep 2
    
    # Verify it started
    if is_worker_running; then
        WORKER_PID=$(pgrep -f 'queue:work.*emails' | head -n1)
        log "✓ Queue worker started successfully (PID: $WORKER_PID)"
        return 0
    else
        log "ERROR: Failed to start queue worker"
        log "Check worker log: tail -n 50 $WORKER_LOG"
        return 1
    fi
}

# Main logic
main() {
    # Check current status
    if is_worker_running; then
        WORKER_COUNT=$(count_workers)
        
        if [ "$WORKER_COUNT" -gt "$MAX_WORKERS" ]; then
            log "WARNING: Multiple workers detected ($WORKER_COUNT). Cleaning up..."
            kill_all_workers
            sleep 2
            start_worker
        else
            WORKER_PID=$(pgrep -f 'queue:work.*emails' | head -n1)
            # Check if process is actually running (not zombie)
            if ps -p "$WORKER_PID" > /dev/null 2>&1; then
                log "✓ Queue worker is running (PID: $WORKER_PID)"
                
                # Check worker uptime
                RUNTIME=$(ps -o etime= -p "$WORKER_PID" 2>/dev/null | tr -d ' ')
                if [ -n "$RUNTIME" ]; then
                    log "  Worker uptime: $RUNTIME"
                fi
                
                # Check pending jobs
                PENDING=$(cd "$PROJECT_DIR" && "$PHP_BIN" artisan tinker --execute="echo DB::table('jobs')->count();" 2>/dev/null | tail -n1 | tr -d ' ')
                if [ -n "$PENDING" ] && [ "$PENDING" != "0" ]; then
                    log "  Pending jobs: $PENDING"
                fi
                
                return 0
            else
                log "WARNING: Worker PID found but process is not running. Restarting..."
                start_worker
            fi
        fi
    else
        log "Queue worker is not running. Starting..."
        start_worker
    fi
}

# Run main function
main

exit $?

