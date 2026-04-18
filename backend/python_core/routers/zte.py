from backend.python_core.routers.base import BaseRouter

class ZTEDriver(BaseRouter):
    """
    Driver for ZTE H168N and H188A.
    Commonly used by ISPs like WE, Orange, and Vodafone.
    """
    async def login(self) -> bool:
        try:
            # ZTE often uses a form-based login on the root or /login.gch
            login_url = f"http://{self.ip}/login.gch"
            data = {
                "Username": self.username,
                "Password": self.password,
                "Action": "login"
            }
            resp = await self.client.post(login_url, data=data)
            
            if resp.status_code == 200 and "main.gch" in resp.text:
                self.is_logged_in = True
                return True
            return False
        except:
            return False

    async def get_connected_devices(self) -> list:
        if not self.is_logged_in: return []
        # ZTE uses /net_user_info.gch or similar for device lists
        return []

    async def get_dsl_stats(self) -> dict:
        return {"status": "Connected"}
