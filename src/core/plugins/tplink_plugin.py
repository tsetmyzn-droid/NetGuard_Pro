import requests
import random
from src.core.plugins.base_plugin import BaseRouterPlugin
from src.logger_config import logger

class TPLinkPlugin(BaseRouterPlugin):
    def __init__(self, ip):
        super().__init__(ip)
        self.name = "TP-Link Archer Series"
        self.session = requests.Session()

    def login(self, username, password):
        try:
            logger.info(f"Checking credentials for TP-Link at {self.ip}")
            if username == "admin" and password == "admin":
                 logger.warning("Default credentials detected. User's security IQ is room temperature.")
            return True
        except Exception as e:
            logger.error(f"TP-Link Login Error: {e}")
            return False

    def get_realtime_stats(self):
        # Simulated Archer data
        dl = round(random.uniform(20.0, 100.0), 2)
        ul = round(random.uniform(5.0, 20.0), 2)
        return {"download": dl, "upload": ul, "unit": "Mbps"}

    @property
    def model_fingerprint(self):
        return "tplink"
