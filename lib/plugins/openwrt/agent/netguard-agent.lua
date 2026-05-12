#!/usr/bin/lua

-- NetGuard Agent System Core (Lua)
-- Location: /www/cgi-bin/netguard

local nixio = require "nixio"
local json = require "luci.jsonc"
local fs = require "nixio.fs"

-- Configuration
local SHARED_KEY_FILE = "/etc/config/netguard_agent.key"

-- Helper: Read Shared Key
local function get_shared_key()
    local f = io.open(SHARED_KEY_FILE, "r")
    if not f then return nil end
    local key = f:read("*all"):gsub("%s+", "")
    f:close()
    return key
end

-- Helper: HMAC SHA256 (Using nixio if available)
local function hmac_sha256(key, message)
    -- Note: If nixio.crypto isn't available, we might need an alternative
    -- handle = nixio.crypto.hmac("sha256", key)
    -- handle:update(message)
    -- return handle:final()
    
    -- Fallback/Simulation for build phase:
    -- In a real OpenWrt environment, we ensure 'libnixio' or 'openssl' is present.
    local cmd = string.format("echo -n '%s' | openssl dgst -sha256 -hmac '%s' -binary | hexdump -e '32/1 \"%%02x\"'", message:gsub("'", "'\\''"), key:gsub("'", "'\\''"))
    local f = io.popen(cmd)
    local result = f:read("*all"):gsub("%s+", "")
    f:close()
    return result
end

-- Helper: Response Wrapper
local function respond(code, data)
    print("Status: " .. code)
    print("Content-Type: application/json\n")
    print(json.stringify(data))
    os.exit(0)
end

-- --- Main Entry Point ---

local method = os.getenv("REQUEST_METHOD") or "GET"
local path = os.getenv("PATH_INFO") or "/stats"
local auth_header = os.getenv("HTTP_X_NETGUARD_SIGNATURE")
local timestamp = tonumber(os.getenv("HTTP_X_NETGUARD_TIMESTAMP") or 0)
local nonce = os.getenv("HTTP_X_NETGUARD_NONCE")

-- 1. Identity & Integrity Check
local shared_key = get_shared_key()
if not shared_key then
    respond("500 Internal Server Error", {error = "Agent not initialized (Key missing)"})
end

if not auth_header or not nonce or timestamp == 0 then
    respond("401 Unauthorized", {error = "Missing security headers"})
end

-- 2. Replay Protection & Security State
local sm = dofile("/www/cgi-bin/netguard/modules/session_manager.lua")
local tm = dofile("/www/cgi-bin/netguard/modules/threat_monitor.lua")

local client_ip = os.getenv("REMOTE_ADDR") or "unknown"
if tm.is_ip_blocked(client_ip) then
    respond("403 Forbidden", {error = "IP blocked due to suspicious activity", threat_level = sm.get_threat_level()})
end

local now = os.time()
if math.abs(now - timestamp) > 30 then
    respond("403 Forbidden", {error = "Request expired (Timestamp delta too large)"})
end

if not sm.verify_nonce(nonce) then
    respond("403 Forbidden", {error = "Nonce reused (Replay attack detected)"})
end

-- 3. HMAC Verification
local body = ""
if method == "POST" then
    body = io.read("*all")
end

local payload = table.concat({method, path, tostring(timestamp), nonce, body}, "|")
local expected_sig = hmac_sha256(shared_key, payload)

if auth_header ~= expected_sig then
    tm.report_auth_failure(client_ip)
    respond("403 Forbidden", {error = "Invalid signature"})
end

-- 4. Logic Handling (Filtering by Threat Level)
-- Apply risk based on path: 2 for admin-like actions, 1 for monitoring
local risk_level = 1
if path == "/apply" or path == "/commit" or path == "/rollback" then
    risk_level = 2
end

if not sm.can_execute(risk_level) then
    respond("403 Forbidden", {error = "Operation blocked by security policy", threat_level = sm.get_threat_level()})
end

if path == "/capabilities" then
    local success, caps_mod = pcall(require, "capability_registry")
    if success then
        respond("200 OK", caps_mod.get_all_capabilities())
    else
        -- Try relative path if global require fails
        local cap_reg = dofile("/www/cgi-bin/netguard/modules/capability_registry.lua")
        if cap_reg then
            respond("200 OK", cap_reg.get_all_capabilities())
        else
            respond("500 Internal Server Error", {error = "Capability module not found"})
        end
    end
elseif path == "/stats" then
    -- Get system info
    local uptime_f = io.popen("uptime")
    local uptime = uptime_f:read("*all"):gsub("\n", "")
    uptime_f:close()
    
    respond("200 OK", {
        status = "healthy",
        uptime = uptime,
        timestamp = os.time(),
        agent_version = "1.0.0"
    })
elseif path == "/traffic" then
    -- Task 3.1.1: Integrate nlbwmon
    local nlbw_f = io.popen("nlbw -c JSON")
    local nlbw_data = nlbw_f:read("*all")
    nlbw_f:close()
    
    local success, parsed = pcall(json.decode, nlbw_data)
    if success then
        respond("200 OK", {
            timestamp = os.time(),
            traffic_data = parsed
        })
    else
        respond("500 Internal Server Error", {error = "Failed to parse nlbw data"})
    end
elseif path == "/apply" then
    local data = json.decode(body)
    local scope = data.scope
    if not scope then respond("400 Bad Request", {error = "Scope missing"}) end

    local rb = dofile("/www/cgi-bin/netguard/modules/rollback_manager.lua")
    local ok, err = rb.create_snapshot(scope)
    if not ok then respond("500 Internal Server Error", {error = err}) end

    -- Create lock for watchdog
    local f = io.open("/tmp/netguard_apply.lock", "w")
    if f then 
        f:write(scope)
        f:close()
    end

    -- External command to start watchdog in background
    -- We use 'start-stop-daemon' or just '&' if the shell supports it
    os.execute("/www/cgi-bin/netguard/watchdog_recovery.sh " .. scope .. " &")

    respond("200 OK", {status = "applied", scope = scope, timeout = 90})

elseif path == "/commit" then
    os.remove("/tmp/netguard_apply.lock")
    local data = json.decode(body)
    if data and data.scope then
        local rb = dofile("/www/cgi-bin/netguard/modules/rollback_manager.lua")
        rb.cleanup(data.scope)
    end
    respond("200 OK", {status = "committed"})

elseif path == "/rollback" then
    local data = json.decode(body)
    local scope = data.scope
    if not scope then respond("400 Bad Request", {error = "Scope missing"}) end

    local rb = dofile("/www/cgi-bin/netguard/modules/rollback_manager.lua")
    local ok = rb.restore_snapshot(scope)
    os.remove("/tmp/netguard_apply.lock")
    
    if ok then
        respond("200 OK", {status = "rolled_back"})
    else
        respond("500 Internal Server Error", {error = "Rollback failed"})
    end
elseif path == "/forensics/list" then
    local fm = dofile("/www/cgi-bin/netguard/modules/forensics_manager.lua")
    respond("200 OK", fm.get_sync_manifest())

elseif path == "/forensics/pull" then
    local data = json.decode(body)
    if not data or not data.id then respond("400 Bad Request", {error = "Chunk ID missing"}) end
    
    local fm = dofile("/www/cgi-bin/netguard/modules/forensics_manager.lua")
    local content = fm.read_chunk(data.id)
    if content then
        respond("200 OK", {id = data.id, content = content})
    else
        respond("404 Not Found", {error = "Chunk not found"})
    end

elseif path == "/forensics/ack" then
    local data = json.decode(body)
    if not data or not data.id then respond("400 Bad Request", {error = "Chunk ID missing"}) end
    
    local fm = dofile("/www/cgi-bin/netguard/modules/forensics_manager.lua")
    if fm.acknowledge_chunk(data.id) then
        respond("200 OK", {status = "acknowledged", id = data.id})
    else
        respond("500 Internal Server Error", {error = "Failed to delete chunk"})
    end

elseif path == "/firewall/block" then
    local data = json.decode(body)
    if not data or not data.mac then respond("400 Bad Request", {error = "MAC missing"}) end
    
    local fc = dofile("/www/cgi-bin/netguard/modules/firewall_control.lua")
    fc.block_device(data.mac, data.hostname)
    respond("200 OK", {status = "blocked", mac = data.mac})

elseif path == "/firewall/unblock" then
    local data = json.decode(body)
    if not data or not data.mac then respond("400 Bad Request", {error = "MAC missing"}) end
    
    local fc = dofile("/www/cgi-bin/netguard/modules/firewall_control.lua")
    fc.unblock_device(data.mac)
    respond("200 OK", {status = "unblocked", mac = data.mac})

elseif path == "/wifi/update" then
    local data = json.decode(body)
    if not data or not data.ssid then respond("400 Bad Request", {error = "SSID missing"}) end
    
    local wc = dofile("/www/cgi-bin/netguard/modules/wifi_control.lua")
    local ok, err = wc.update_wifi(data.device or "radio0", data.ssid, data.password)
    if ok then
        respond("200 OK", {status = "updated", ssid = data.ssid})
    else
        respond("500 Internal Server Error", {error = err})
    end

elseif path == "/ping" then
    respond("200 OK", {pong = true})
else
    respond("404 Not Found", {error = "Unknown path"})
end
