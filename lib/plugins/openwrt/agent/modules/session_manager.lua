#!/usr/bin/lua

-- NetGuard Pro: Session & Security State Manager
-- Path: /www/cgi-bin/netguard/modules/session_manager.lua

local nixio = require "nixio"
local fs = require "nixio.fs"

local M = {}

local SESSION_DIR = "/tmp/netguard_sessions"
local NONCE_CACHE = "/tmp/netguard_nonces"
local THREAT_STATE_FILE = "/tmp/netguard_threat_level"

-- تهيئة مجلدات الأمان
local function init_security_dirs()
    if not fs.access(SESSION_DIR) then nixio.fs.mkdir(SESSION_DIR) end
    if not fs.access(NONCE_CACHE) then nixio.fs.mkdir(NONCE_CACHE) end
end

-- 1. إدارة الـ Nonce (منع هجمات الإعادة)
function M.verify_nonce(nonce)
    init_security_dirs()
    local path = NONCE_CACHE .. "/" .. nonce
    if fs.access(path) then
        return false -- Nonce used!
    end
    
    -- تخزين الـ Nonce مع وقت الصلاحية
    local f = io.open(path, "w")
    if f then
        f:write(os.time())
        f:close()
    end
    return true
end

-- 2. إدارة الجلسة (Session Lifecycle)
function M.create_session(user_id)
    init_security_dirs()
    local sid = nixio.bin.hexlify(nixio.crypto.hash("sha1", tostring(os.time()) .. user_id))
    local path = SESSION_DIR .. "/" .. sid
    local f = io.open(path, "w")
    if f then
        f:write(json.encode({
            user_id = user_id,
            created_at = os.time(),
            last_seen = os.time(),
            level = 1 -- Default trust level
        }))
        f:close()
        return sid
    end
    return nil
end

-- 3. نظام مستويات التهديد (Threat Escalation)
function M.get_threat_level()
    local f = io.open(THREAT_STATE_FILE, "r")
    if not f then return 1 end
    local level = tonumber(f:read("*all")) or 1
    f:close()
    return level
end

function M.set_threat_level(level)
    local f = io.open(THREAT_STATE_FILE, "w")
    if f then
        f:write(tostring(level))
        f:close()
        return true
    end
    return false
end

-- التحقق من صلاحية العمليات بناءً على مستوى التهديد
function M.can_execute(operation_risk)
    local current_level = M.get_threat_level()
    -- Risk: 1 (Low), 2 (Med), 3 (High)
    if current_level >= 3 and operation_risk >= 2 then
        return false -- Blocked due to high threat state
    end
    return true
end

return M
