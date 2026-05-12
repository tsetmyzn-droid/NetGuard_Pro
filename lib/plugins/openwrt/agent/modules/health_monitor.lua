#!/usr/bin/lua

-- NetGuard Pro: Health Monitor & Resource Tracking
-- Path: /www/cgi-bin/netguard/modules/health_monitor.lua

local M = {}

-- 1. الحصول على حمل المعالج (Load Average)
function M.get_load_avg()
    local f = io.open("/proc/loadavg", "r")
    if not f then return "0.00 0.00 0.00" end
    local content = f:read("*all")
    f:close()
    return content:match("^(%d+%.%d+%s+%d+%.%d+%s+%d+%.%d+)")
end

-- 2. الحصول على درجة الحرارة (إذا كان الجهاز يدعمها)
function M.get_temperature()
    -- محاولة القراءة من مسارات شائعة في OpenWrt
    local thermal_paths = {
        "/sys/class/thermal/thermal_zone0/temp",
        "/sys/class/hwmon/hwmon0/temp1_input",
        "/sys/class/hwmon/hwmon0/device/temp"
    }
    
    for _, path in ipairs(thermal_paths) do
        local f = io.open(path, "r")
        if f then
            local temp = tonumber(f:read("*all"))
            f:close()
            if temp then
                return temp / 1000 -- Convert to Celsius
            end
        end
    end
    return nil -- غير متوفر
end

-- 3. الحصول على وقت التشغيل (Uptime)
function M.get_uptime()
    local f = io.open("/proc/uptime", "r")
    if not f then return 0 end
    local content = f:read("*all")
    f:close()
    return tonumber(content:match("^(%d+)")) or 0
end

-- 4. التقرير الكامل للصحة
function M.get_health_report()
    return {
        load_avg = M.get_load_avg(),
        temp = M.get_temperature(),
        uptime = M.get_uptime(),
        timestamp = os.time()
    }
end

return M
