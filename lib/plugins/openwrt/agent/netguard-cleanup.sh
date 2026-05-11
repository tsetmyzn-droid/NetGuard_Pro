#!/bin/sh

# NetGuard Data Cleanup & Rotation Script
# Path: /usr/bin/netguard-cleanup

MAX_STORAGE_KB=5000
STATS_DIR="/etc/config/netguard_stats"

# Check storage usage
CURRENT_USAGE=$(du -s $STATS_DIR | awk '{print $1}')

if [ "$CURRENT_USAGE" -gt "$MAX_STORAGE_KB" ]; then
    echo "NetGuard: Storage limit exceeded ($CURRENT_USAGE KB). Cleaning up old logs..."
    # Remove logs older than 30 days
    find $STATS_DIR -name "*.json" -mtime +30 -delete
fi

# Rotate nlbw (if needed, nlbwmon usually handles its own rotating)
# but we can force a commit if we want to move data from /tmp to /etc
# nlbw commit
