#!/usr/bin/lua

-- NetGuard Pro: Capability Registry & Resource Discovery
-- Path: /www/cgi-bin/netguard/modules/capability_registry.lua

local nixio = require "nixio"
local fs = require "nixio.fs"

local M = {}

-- اكتشاف موارد الذاكرة (RAM)
function M.get_ram_info()
    local f = io.open("/proc/meminfo", "r")
    if not f then return { total = 0, free = 0 } end
    local content = f:read("*all")
    f:close()
    
    local total = tonumber(content:match("MemTotal:%s+(%d+)")) or 0
    local free = tonumber(content:match("MemFree:%s+(%d+)")) or 0
    return { total_kb = total, free_kb = free }
end

-- اكتشاف مساحة التخزين (Flash)
function M.get_flash_info()
    local s = nixio.fs.statvfs("/")
    if not s then return { total = 0, free = 0 } end
    return {
        total_kb = math.floor(s.f_blocks * s.f_frsize / 1024),
        free_kb = math.floor(s.f_bfree * s.f_frsize / 1024)
    }
end

-- اكتشاف نظام جدار الحماية (nftables vs iptables)
function M.get_firewall_type()
    if os.execute("command -v nft >/dev/null 2>&1") == 0 then
        return "nftables"
    else
        return "iptables"
    end
end

-- اكتشاف إصدار النظام (OpenWrt Version)
function M.get_os_info()
    local f = io.open("/etc/openwrt_release", "r")
    if not f then return "unknown" end
    local content = f:read("*all")
    f:close()
    return content:match("DISTRIB_RELEASE='([^']+)'") or "unknown"
end

-- تجميع كافة الأعلام (Flags)
function M.get_all_capabilities()
    local ram = M.get_ram_info()
    local flash = M.get_flash_info()
    local fw = M.get_firewall_type()
    
    local flags = {}
    
    -- Network Flags
    table.insert(flags, fw == "nftables" and "NET_MOD_NFT" or "NET_MOD_IPT")
    table.insert(flags, "NET_TRAFFIC_MON")
    
    -- Resource Flags
    if ram.total_kb < 65536 then table.insert(flags, "RES_LOW_RAM") end
    if flash.free_kb < 2048 then table.insert(flags, "RES_LOW_FLASH") end
    
    -- Security Flags (Base support)
    table.insert(flags, "SEC_HMAC_V2")
    table.insert(flags, "SEC_WATCHDOG")
    
    return {
        os_version = M.get_os_info(),
        ram = ram,
        flash = flash,
        firewall = fw,
        flags = flags
    }
end

return M
