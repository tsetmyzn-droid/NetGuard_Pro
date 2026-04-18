import hashlib
import json
import base64
from .base import BaseRouter

class TPLinkDriver(BaseRouter):
    """
    Driver for TP-Link Archer Series (C6, C7, AX10, AX50, etc.)
    Uses the modern JSON-based API.
    """
    async def login(self) -> bool:
        try:
            # 1. Get encrypted password format
            # TP-Link often requires the password to be sent in a specific format
            # For Archer AX series, it's often a simple base64 or a custom hash
            login_url = f"http://{self.ip}/cgi-bin/luci/;stok=/login?form=login"
            
            # This is a representative structure for TP-Link Archer login
            # Real implementation would handle the 'stok' (Session Token)
            payload = {
                "method": "login",
                "params": {
                    "username": self.username,
                    "password": self._encrypt_password(self.password)
                }
            }
            
            resp = await self.client.post(login_url, json=payload)
            data = resp.json()
            
            if data.get("error_code") == 0:
                self.stok = data.get("result", {}).get("stok")
                self.is_logged_in = True
                return True
            return False
        except:
            return False

    def _encrypt_password(self, password):
        # Simplified representation of TP-Link's password handling
        return base64.b64encode(password.encode()).decode()

    async def get_connected_devices(self) -> list:
        if not self.is_logged_in: return []
        try:
            url = f"http://{self.ip}/cgi-bin/luci/;stok={self.stok}/admin/device?form=list"
            payload = {"method": "get", "params": {"table": "device_list"}}
            resp = await self.client.post(url, json=payload)
            data = resp.json()
            
            devices = []
            for dev in data.get("result", {}).get("device_list", []):
                devices.append({
                    "ip": dev.get("ip"),
                    "mac": dev.get("mac"),
                    "name": dev.get("name", "Unknown Device"),
                    "status": "online" if dev.get("active") else "offline",
                    "type": "unknown",
                    "usage": "N/A"
                })
            return devices
        except:
            return []

    async def get_dsl_stats(self) -> dict:
        return {"status": "Connected"}
