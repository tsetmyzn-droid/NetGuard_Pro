#!/usr/bin/lua

-- NetGuard Pro: WiFi Management Module
-- Path: /www/cgi-bin/netguard/modules/wifi_control.lua

local uci = require "uci"
local cursor = uci.cursor()

local M = {}

-- 1. تغيير إعدادات الواي فاي (SSID/Password)
function M.update_wifi(device, ssid, password)
    local found = false
    cursor:foreach("wireless", "wifi-iface", function(s)
        if s.device == device then
            cursor:set("wireless", s[".name"], "ssid", ssid)
            if password and #password >= 8 then
                cursor:set("wireless", s[".name"], "key", password)
                cursor:set("wireless", s[".name"], "encryption", "psk2")
            end
            found = true
        end
    end)
    
    if found then
        cursor:save("wireless")
        return true
    end
    return false, "Device not found"
end

-- 2. جلب المعلومات الحالية
function M.get_wifi_status()
    local status = {}
    cursor:foreach("wireless", "wifi-iface", function(s)
        table.insert(status, {
            device = s.device,
            ssid = s.ssid,
            encryption = s.encryption,
            disabled = s.disabled or "0"
        })
    end)
    return status
end

-- 3. تفعيل/تعطيل الراديو
function M.set_radio_state(device, disabled)
    cursor:set("wireless", device, "disabled", disabled and "1" or "0")
    cursor:save("wireless")
    return true
end

return M
