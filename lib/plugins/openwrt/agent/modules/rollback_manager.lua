#!/usr/bin/lua

-- NetGuard Pro: Scoped Rollback & Snapshot Manager
-- Path: /www/cgi-bin/netguard/modules/rollback_manager.lua

local nixio = require "nixio"
local fs = require "nixio.fs"

local M = {}

local SNAPSHOT_DIR = "/etc/config/netguard_snapshots"

-- التأكد من وجود مجلد النسخ الاحتياطية
local function prepare_dir()
    if not fs.access(SNAPSHOT_DIR) then
        nixio.fs.mkdir(SNAPSHOT_DIR)
    end
end

-- إنشاء نسخة احتياطية لقسم محدد (e.g., wireless, network)
function M.create_snapshot(scope)
    prepare_dir()
    local source = "/etc/config/" .. scope
    local dest = SNAPSHOT_DIR .. "/" .. scope .. ".bak"
    
    if not fs.access(source) then
        return false, "Source config not found: " .. scope
    end

    -- التحقق من المساحة المتوفرة قبل النسخ
    local s = nixio.fs.statvfs("/")
    if s and (s.f_bfree * s.f_frsize) < 102400 then -- أقل من 100 كيلوبايت
        return false, "Insufficient flash space for snapshot"
    end

    local content = fs.readfile(source)
    if content then
        fs.writefile(dest, content)
        return true, dest
    end
    return false, "Failed to read source"
end

-- استعادة نسخة احتياطية
function M.restore_snapshot(scope)
    local backup = SNAPSHOT_DIR .. "/" .. scope .. ".bak"
    local dest = "/etc/config/" .. scope
    
    if not fs.access(backup) then
        return false, "No backup found for: " .. scope
    end

    local content = fs.readfile(backup)
    if content then
        fs.writefile(dest, content)
        -- مسح النسخة الاحتياطية بعد الاستعادة الناجحة لتوفير المساحة
        os.remove(backup)
        return true
    end
    return false, "Failed to restore"
end

-- التحقق من وجود نسخة احتياطية معلقة
function M.has_pending_rollback(scope)
    return fs.access(SNAPSHOT_DIR .. "/" .. scope .. ".bak")
end

-- تنظيف النسخ القديمة
function M.cleanup(scope)
    local backup = SNAPSHOT_DIR .. "/" .. scope .. ".bak"
    if fs.access(backup) then
        os.remove(backup)
    end
end

return M
