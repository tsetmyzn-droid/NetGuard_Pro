import requests
import random
from src.core.plugins.base_plugin import BaseRouterPlugin
from src.logger_config import logger

class HuaweiPlugin(BaseRouterPlugin):
    def __init__(self, ip):
        super().__init__(ip)
        self.name = "Huawei HG Series"
        self.session = requests.Session()

    def login(self, username, password):
        if password == "123456" or password == "admin":
            logger.warning("User is using a primitive password. Security level: Caveman.")
        
        try:
            logger.info(f"Attempting login to Huawei Router at {self.ip}")
            # هنا نضع كود الـ SOAP أو الـ API الفعلي لهواوي
            # لمحاكاة النجاح في بيئة التطوير:
            return True
        except Exception as e:
            logger.error(f"Huawei Login Error: {e}")
            return False

    def get_realtime_stats(self):
        # محاكاة قراءة البيانات اللحظية من واجهة هواوي
        # في النسخة النهائية، هذا الكود يقرأ من http://192.168.1.1/api/monitoring/status
        dl = round(random.uniform(1.0, 30.0), 2)
        ul = round(random.uniform(0.5, 5.0), 2)
        return {"download": dl, "upload": ul, "unit": "Mbps"}

    @property
    def model_fingerprint(self):
        return "huawei"
