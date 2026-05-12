#!/bin/sh

# NetGuard Pro: Watchdog Recovery Service
# Path: /www/cgi-bin/netguard/watchdog_recovery.sh

LOCK_FILE="/tmp/netguard_apply.lock"
TIMEOUT=90
SCOPE=$1  # e.g., "wireless" or "firewall"

if [ -z "$SCOPE" ]; then
    logger -t NetGuard "Watchdog: Error - No scope provided. Aborting."
    exit 1
fi

logger -t NetGuard "Watchdog: Monitoring transaction for [$SCOPE]. Timeout: ${TIMEOUT}s"

# الانتظار لفترة التهدئة
sleep $TIMEOUT

# التحقق من وجود القفل
if [ -f "$LOCK_FILE" ]; then
    logger -t NetGuard "Watchdog: HEARTBEAT LOST! Triggering emergency rollback for [$SCOPE]..."
    
    # استدعاء سكريبت الاستعادة (باستخدام Lua أو الأوامر المباشرة)
    /usr/bin/lua -e "local rb = dofile('/www/cgi-bin/netguard/modules/rollback_manager.lua'); rb.restore_snapshot('$SCOPE')"
    
    # إعادة تشغيل الخدمة المتأثرة لاستعادة الاتصال
    if [ "$SCOPE" = "wireless" ]; then
        wifi reload
    elif [ "$SCOPE" = "firewall" ]; then
        /etc/init.d/firewall restart
    elif [ "$SCOPE" = "network" ]; then
        /etc/init.d/network restart
    fi
    
    # حذف القفل بعد العملية
    rm -f "$LOCK_FILE"
    logger -t NetGuard "Watchdog: Rollback completed. Connectivity should be restored."
else
    logger -t NetGuard "Watchdog: Transaction for [$SCOPE] committed successfully. Exiting."
fi
