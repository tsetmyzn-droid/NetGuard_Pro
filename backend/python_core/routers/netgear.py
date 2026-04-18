import base64
from .base import BaseRouter

class NetgearDriver(BaseRouter):
    """
    Driver for older Netgear routers (WNR, WNDR, and early Nighthawk series).
    These often use HTTP Basic Authentication.
    """
    async def login(self) -> bool:
        try:
            # Older Netgear routers often use Basic Auth on the index page
            # We test this by sending a request with the Authorization header
            auth_str = f"{self.username}:{self.password}"
            encoded_auth = base64.b64encode(auth_str.encode()).decode()
            
            headers = {
                "Authorization": f"Basic {encoded_auth}"
            }
            
            # Try to access the index page with credentials
            url = f"http://{self.ip}/index.htm"
            resp = await self.client.get(url, headers=headers)
            
            if resp.status_code == 200 and ("NETGEAR" in resp.text or "WNR" in resp.text):
                self.is_logged_in = True
                # Store the auth header for future requests
                self.auth_header = headers
                return True
            
            # Alternative: Some use a form-based login at /login.cgi
            login_url = f"http://{self.ip}/login.cgi"
            data = {
                "login_username": self.username,
                "login_password": self.password
            }
            resp = await self.client.post(login_url, data=data)
            if resp.status_code == 200 and "index.htm" in resp.text:
                self.is_logged_in = True
                return True
                
            return False
        except:
            return False

    async def get_connected_devices(self) -> list:
        if not self.is_logged_in: return []
        try:
            # Netgear often uses /DEV_device_info.htm or /attached_devices.htm
            url = f"http://{self.ip}/DEV_device_info.htm"
            headers = getattr(self, 'auth_header', {})
            resp = await self.client.get(url, headers=headers)
            # Parsing logic for Netgear's attached devices
            return []
        except:
            return []

    async def get_dsl_stats(self) -> dict:
        return {"status": "Connected"}
