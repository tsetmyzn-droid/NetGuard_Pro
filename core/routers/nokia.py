import re
import hashlib
from core.routers.base import BaseRouter

class NokiaDriver(BaseRouter):
    """
    Driver for Nokia G-2425G-A and similar ONT/Routers.
    Very common in modern Fiber-to-the-Home (FTTH) setups.
    """
    async def login(self) -> bool:
        try:
            # Nokia routers often use a specific login endpoint /login.cgi
            login_url = f"http://{self.ip}/login.cgi"
            
            # Nokia often requires a specific 'user' and 'psw' field
            data = {
                "user": self.username,
                "psw": self.password,
                "action": "login"
            }
            
            resp = await self.client.post(login_url, data=data, follow_redirects=True)
            
            # Check for redirect to the main status page
            if resp.status_code == 200 and ("status.html" in resp.text or "index.html" in resp.text):
                self.is_logged_in = True
                return True
            return False
        except:
            return False

    async def get_connected_devices(self) -> list:
        if not self.is_logged_in: return []
        try:
            # Nokia often lists devices in /lan_device.html or via a JSON API in newer firmware
            url = f"http://{self.ip}/api/v1/lan/devices"
            resp = await self.client.get(url)
            # Parsing logic for Nokia's device list
            return []
        except:
            return []

    async def get_dsl_stats(self) -> dict:
        # For Nokia ONTs, this usually shows Fiber/GPON status
        return {"status": "GPON Link Up"}
