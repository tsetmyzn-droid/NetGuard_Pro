#!/usr/bin/lua

-- NetGuard Pro: Forensic Manager & Buffered Logging
-- Path: /www/cgi-bin/netguard/modules/forensics_manager.lua

local nixio = require "nixio"
local fs = require "nixio.fs"

local M = {}

local FORENSIC_LOG_DIR = "/tmp/netguard_forensics"
local MAX_CHUNKS = 10
local CHUNK_SIZE_LIMIT = 51200 -- 50KB

local function init_dir()
    if not fs.access(FORENSIC_LOG_DIR) then
        nixio.fs.mkdir(FORENSIC_LOG_DIR)
    end
end

-- 1. جمع السجلات (Forensic Capture)
-- يقوم بجمع سجلات النظام وأحداث الأمان وتخزينها في chunks
function M.capture_event(category, message)
    init_dir()
    local timestamp = os.time()
    local current_chunk = FORENSIC_LOG_DIR .. "/active.log"
    
    local f = io.open(current_chunk, "a")
    if f then
        -- Redaction logic: mask IPs/MACs in common formats
        local safe_msg = message:gsub("(%d+%.%d+%.%d+%.)%d+", "%1xxx")
        safe_msg = safe_msg:gsub("(%x%x:%x%x:%x%x:%x%x:%x%x:)(%x%x)", "%1xx")
        
        f:write(string.format("[%d] [%s] %s\n", timestamp, category, safe_msg))
        f:close()
    end
    
    -- تحقق من حجم الـ chunk الحالي للتدوير (Rotate)
    local s = fs.stat(current_chunk)
    if s and s.size > CHUNK_SIZE_LIMIT then
        M.rotate_chunks()
    end
end

-- 2. تدوير الملفات (Rotate)
function M.rotate_chunks()
    local active = FORENSIC_LOG_DIR .. "/active.log"
    if not fs.access(active) then return end
    
    local new_chunk = FORENSIC_LOG_DIR .. "/chunk_" .. os.time() .. ".log"
    os.rename(active, new_chunk)
    
    -- حذف الأقدم إذا تجاوزنا العدد المسموح
    local files = {}
    for f in nixio.fs.dir(FORENSIC_LOG_DIR) do
        if f:match("^chunk_") then table.insert(files, f) end
    end
    table.sort(files)
    
    while #files > MAX_CHUNKS do
        os.remove(FORENSIC_LOG_DIR .. "/" .. files[1])
        table.remove(files, 1)
    end
end

-- 3. جلب الميتا-داتا للـ chunks المتاحة للمزامنة
function M.get_sync_manifest()
    local chunks = {}
    if not fs.access(FORENSIC_LOG_DIR) then return chunks end
    
    for f in nixio.fs.dir(FORENSIC_LOG_DIR) do
        if f:match("^chunk_") then
            local s = fs.stat(FORENSIC_LOG_DIR .. "/" .. f)
            table.insert(chunks, {
                id = f,
                size = s.size,
                ts = f:match("chunk_(%d+)")
            })
        end
    end
    return chunks
end

-- 4. قراءة محتوى chunk محدد
function M.read_chunk(id)
    local path = FORENSIC_LOG_DIR .. "/" .. id
    if not fs.access(path) then return nil end
    return fs.readfile(path)
end

-- 5. تأكيد الاستلام والحذف (ACK)
function M.acknowledge_chunk(id)
    local path = FORENSIC_LOG_DIR .. "/" .. id
    if fs.access(path) then
        os.remove(path)
        return true
    end
    return false
end

return M
