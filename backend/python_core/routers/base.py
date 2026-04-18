import httpx
from typing import Dict, Any, List

class BaseRouter:
    """
    Base class for all router drivers.
    Provides common networking and session management.
    """
    def __init__(self, ip: str, username: str, password: str):
        self.ip = ip
        self.username = username
        self.password = password
        self.is_logged_in = False
        self.client = httpx.AsyncClient(timeout=10.0)

    async def login(self) -> bool:
        """Subclasses must implement login logic."""
        raise NotImplementedError

    async def get_connected_devices(self) -> List[Dict[str, Any]]:
        """Subclasses must implement device discovery."""
        raise NotImplementedError

    async def get_dsl_stats(self) -> Dict[str, Any]:
        """Subclasses must implement stat fetching."""
        raise NotImplementedError

    async def close(self):
        """Cleanup resources."""
        await self.client.aclose()
