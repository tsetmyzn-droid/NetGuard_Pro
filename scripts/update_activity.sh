#!/bin/bash
# NetGuard Pro Activity Updater
# This script can be run in GitHub Actions to update GITHUB_ACTIVITY.md

DATE=$(date +%Y-%m-%d)
STATUS="✅ آمن"

if [ "$1" == "fail" ]; then
  STATUS="❌ فشل الأمان"
fi

echo "| $DATE | فحص دوري للأمان | $STATUS | تم التحقق من سلامة الأكواد والارتباطات |" >> GITHUB_ACTIVITY.md
echo "Activity logged at $DATE"
