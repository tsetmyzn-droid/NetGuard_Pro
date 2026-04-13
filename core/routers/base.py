import httpx
import asyncio
from abc import ABC, abstractmethod

class BaseRouter(ABC):
    def __init__(self, ip, username, password):
        self.ip = ip
        self.username = username
        self.password = password
        self.client = httpx.AsyncClient(timeout=5.0, verify=False)
        self.is_logged_in = False

    @abstractmethod
    async def login(self) -> bool:
        pass

    @abstractmethod
    async def get_connected_devices(self) -> list:
        pass

    @abstractmethod
    async def get_dsl_stats(self) -> dict:
        pass

    async def close(self):
        await self.client.aclose()
