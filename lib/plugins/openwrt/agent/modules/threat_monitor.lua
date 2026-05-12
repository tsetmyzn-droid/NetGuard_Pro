#!/usr/bin/lua

-- NetGuard Pro: Threat Monitor & Anomaly Detection
-- Path: /www/cgi-bin/netguard/modules/threat_monitor.lua

local M = {}

local FAIL_LOG = "/tmp/netguard_auth_fails"
local MAX_FAILS = 5
local LOCKOUT_TIME = 300 -- 5 minutes

function M.report_auth_failure(ip)
    local f = io.open(FAIL_LOG, "a")
    if f then
        f:write(os.time() .. "," .. ip .. "\n")
        f:close()
    end
    
    -- التحقق من تكرار الفشل
    local count = 0
    local now = os.time()
    for line in io.lines(FAIL_LOG) do
        local ts, fail_ip = line:match("(%d+),(.+)")
        if fail_ip == ip and (now - tonumber(ts)) < LOCKOUT_TIME then
            count = count + 1
        end
    end
    
    if count >= MAX_FAILS then
        -- تصعيد مستوى التهديد تلقائياً لـ Level 2
        local sm = require "session_manager"
        sm.set_threat_level(2)
        return true -- IP should be blocked
    end
    return false
end

function M.is_ip_blocked(ip)
    -- Simple check for now
    local count = 0
    local now = os.time()
    local f = io.open(FAIL_LOG, "r")
    if not f then return false end
    
    for line in f:lines() do
        local ts, fail_ip = line:match("(%d+),(.+)")
        if fail_ip == ip and (now - tonumber(ts)) < LOCKOUT_TIME then
            count = count + 1
        end
    end
    f:close()
    
    return count >= MAX_FAILS
end

return M
