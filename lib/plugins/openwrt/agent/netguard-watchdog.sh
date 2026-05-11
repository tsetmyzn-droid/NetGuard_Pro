#!/bin/sh

# NetGuard Watchdog Service
# Checks if the agent is responsive and healthy

AGENT_URL="http://localhost/cgi-bin/netguard/ping"
DISABLED_FLAG="/etc/config/netguard_disabled"

if [ -f "$DISABLED_FLAG" ]; then
    exit 0
fi

# Try to ping the agent (internal check might bypass HMAC if configured, 
# or use a local key)
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$AGENT_URL")

if [ "$HTTP_CODE" != "200" ]; then
    logger -t NetGuard "Watchdog: Agent not responding (Code $HTTP_CODE). Attempting restart..."
    # Logic to restart or fix services
    # /etc/init.d/uhttpd restart
fi
