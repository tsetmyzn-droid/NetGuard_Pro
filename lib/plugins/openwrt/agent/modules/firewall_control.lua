#!/usr/bin/lua

-- NetGuard Pro: Firewall & Device Control Module
-- Path: /www/cgi-bin/netguard/modules/firewall_control.lua

local uci = require "uci"
local cursor = uci.cursor()

local M = {}

-- 1. حظر جهاز محدد (MAC Blocking)
function M.block_device(mac, hostname)
    hostname = hostname or "Blocked_Device"
    local name = "netguard_block_" .. mac:gsub(":", "")
    
    -- إضافة قاعدة في جدار الحماية
    cursor:section("firewall", "rule", name, {
        src = "lan",
        dest = "wan",
        src_mac = mac,
        target = "REJECT",
        name = "NetGuard: Block " .. hostname
    })
    
    cursor:save("firewall")
    return true
end

-- 2. إلغاء حظر جهاز
function M.unblock_device(mac)
    local name = "netguard_block_" .. mac:gsub(":", "")
    cursor:delete("firewall", name)
    cursor:save("firewall")
    return true
end

-- 3. جدولة الإنترنت (Internet Scheduling)
-- days: list of days (e.g., {"mon", "tue"})
-- start_time: "HH:MM"
-- stop_time: "HH:MM"
function M.set_schedule(mac, days, start_time, stop_time)
    local name = "netguard_sched_" .. mac:gsub(":", "")
    
    cursor:section("firewall", "rule", name, {
        src = "lan",
        dest = "wan",
        src_mac = mac,
        target = "REJECT",
        extra = "--weekdays " .. table.concat(days, ",") .. " --timestart " .. start_time .. " --timestop " .. stop_time,
        name = "NetGuard: Schedule " .. mac
    })
    
    cursor:save("firewall")
    return true
end

-- 4. إزالة الجدولة
function M.remove_schedule(mac)
    local name = "netguard_sched_" .. mac:gsub(":", "")
    cursor:delete("firewall", name)
    cursor:save("firewall")
    return true
end

-- 5. جرد القواعد النشطة (Audit)
function M.get_active_restrictions()
    local restrictions = {}
    cursor:foreach("firewall", "rule", function(s)
        if s.name and s.name:match("^NetGuard:") then
            table.insert(restrictions, {
                id = s[".name"],
                mac = s.src_mac,
                name = s.name,
                target = s.target
            })
        end
    end)
    return restrictions
end

return M
