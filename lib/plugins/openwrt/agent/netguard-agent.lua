#!/usr/bin/lua

-- NetGuard Agent System Core (Lua)
-- Location: /www/cgi-bin/netguard

local nixio = require "nixio"
local json = require "luci.jsonc"
local fs = require "nixio.fs"

-- Configuration
local SHARED_KEY_FILE = "/etc/config/netguard_agent.key"
local NONCE_CACHE_DIR = "/tmp/netguard_nonces"

-- Helper: Nonce Tracking (Replay Protection)
local function check_and_track_nonce(nonce)
    if not nixio.fs.access(NONCE_CACHE_DIR) then
        nixio.fs.mkdir(NONCE_CACHE_DIR)
    end
    
    local path = NONCE_CACHE_DIR .. "/" .. nonce
    if nixio.fs.access(path) then
        return false -- Nonce already used
    end
    
    local f = io.open(path, "w")
    if f then
        f:write(os.time())
        f:close()
    end
    
    -- Cleanup old nonces (optional: periodically via cron)
    return true
end

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

-- 2. Replay Protection & Nonce Tracking
local now = os.time()
if math.abs(now - timestamp) > 30 then
    respond("403 Forbidden", {error = "Request expired (Timestamp delta too large)"})
end

if not check_and_track_nonce(nonce) then
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
    respond("403 Forbidden", {error = "Invalid signature"})
end

-- 4. Logic Handling
if path == "/stats" then
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
elseif path == "/ping" then
    respond("200 OK", {pong = true})
else
    respond("404 Not Found", {error = "Unknown path"})
end
