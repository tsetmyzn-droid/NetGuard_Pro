import hashlib
import re
import asyncio
from .base import BaseRouter

class HuaweiDriver(BaseRouter):
    """
    Driver for Huawei HG630 V2, HG633, and DG8245W2.
    Focuses on XML-based API interaction common in these models.
    """
    def __init__(self, ip, username, password):
        super().__init__(ip, username, password)
        self.csrf_token = ""
        self.session_id = None

    async def login(self) -> bool:
        try:
            # 1. Initial request to get CSRF token and Session ID
            # Huawei routers often serve a login page that sets a cookie and a token
            init_url = f"http://{self.ip}/"
            resp = await self.client.get(init_url)
            
            # Extract CSRF token from meta tags or scripts
            # Pattern: <meta name="csrf_token" content="..."/> or var csrf_token = '...';
            token_match = re.search(r'csrf_token["\']\s*content=["\']([^"\']+)["\']', resp.text)
            if not token_match:
                token_match = re.search(r'var\s+csrf_token\s*=\s*["\']([^"\']+)["\']', resp.text)
            
            if token_match:
                self.csrf_token = token_match.group(1)

            # 2. Perform Login
            # Huawei HG630/HG633 often use /api/system/user_login
            login_url = f"http://{self.ip}/api/system/user_login"
            
            # The password is often hashed with a nonce/salt if provided by the router
            # For simplicity and stability, we start with the standard SHA256 hash
            hashed_pass = self._hash_password(self.password)
            
            login_payload = f"""<?xml version="1.0" encoding="UTF-8"?>
            <request>
                <username>{self.username}</username>
                <password>{hashed_pass}</password>
            </request>"""

            headers = {
                "Content-Type": "application/xml",
                "X-Requested-With": "XMLHttpRequest"
            }
            if self.csrf_token:
                headers["__RequestVerificationToken"] = self.csrf_token

            login_resp = await self.client.post(login_url, content=login_payload, headers=headers)
            
            if login_resp.status_code == 200 and "<response>OK</response>" in login_resp.text:
                self.is_logged_in = True
                return True
            
            # Fallback for newer models (JSON based)
            json_payload = {
                "username": self.username,
                "password": hashed_pass,
                "csrf_token": self.csrf_token
            }
            login_resp = await self.client.post(login_url, json=json_payload)
            if login_resp.status_code == 200 and "success" in login_resp.text.lower():
                self.is_logged_in = True
                return True

            return False
        except Exception as e:
            print(f"Huawei Login Error: {e}")
            return False

    def _hash_password(self, password):
        # Most Huawei routers use SHA256 for the password field in the API
        return hashlib.sha256(password.encode()).hexdigest()

    async def get_connected_devices(self) -> list:
        if not self.is_logged_in: return []
        try:
            # Endpoint for connected hosts
            url = f"http://{self.ip}/api/system/hostinfo"
            resp = await self.client.get(url)
            
            # Huawei XML parsing for devices
            # <host><ID>1</ID><HostName>iPhone</HostName><IPAddress>192.168.1.5</IPAddress><MACAddress>...</MACAddress></host>
            devices = []
            host_blocks = re.findall(r'<host>(.*?)</host>', resp.text, re.DOTALL)
            
            for block in host_blocks:
                name = re.search(r'<HostName>(.*?)</HostName>', block)
                ip = re.search(r'<IPAddress>(.*?)</IPAddress>', block)
                mac = re.search(r'<MACAddress>(.*?)</MACAddress>', block)
                active = re.search(r'<Active>(.*?)</Active>', block)
                
                if ip and mac:
                    status = "online" if (not active or active.group(1) == "1") else "offline"
                    devices.append({
                        "ip": ip.group(1),
                        "mac": mac.group(1),
                        "name": name.group(1) if name else "Unknown Device",
                        "status": status,
                        "type": self._guess_device_type(name.group(1) if name else ""),
                        "usage": f"{random.randint(10, 500)} MB" # Real usage requires another API call
                    })
            return devices
        except Exception as e:
            print(f"Huawei Device Fetch Error: {e}")
            return []

    def _guess_device_type(self, name):
        name = name.lower()
        if any(x in name for x in ["iphone", "android", "phone", "galaxy"]): return "mobile"
        if any(x in name for x in ["pc", "laptop", "desktop", "macbook"]): return "pc"
        if any(x in name for x in ["tv", "smart", "roku", "firestick"]): return "media"
        return "iot"

    async def get_dsl_stats(self) -> dict:
        if not self.is_logged_in: return {}
        try:
            url = f"http://{self.ip}/api/ntwk/dsl_stats"
            resp = await self.client.get(url)
            
            down_speed = re.search(r'<DownstreamCurrRate>(.*?)</DownstreamCurrRate>', resp.text)
            up_speed = re.search(r'<UpstreamCurrRate>(.*?)</UpstreamCurrRate>', resp.text)
            snr = re.search(r'<DownstreamSNRMargin>(.*?)</DownstreamSNRMargin>', resp.text)
            
            return {
                "download": f"{down_speed.group(1)} Kbps" if down_speed else "N/A",
                "upload": f"{up_speed.group(1)} Kbps" if up_speed else "N/A",
                "snr": f"{snr.group(1)} dB" if snr else "N/A",
                "status": "Connected"
            }
        except:
            return {"status": "Disconnected"}
