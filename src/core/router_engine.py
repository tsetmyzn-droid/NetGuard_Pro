import requests
from src.logger_config import logger
from src.db.manager import db_manager
from src.core.plugins.huawei_plugin import HuaweiPlugin
from src.core.plugins.zte_plugin import ZTEPlugin
from src.core.plugins.tplink_plugin import TPLinkPlugin

class RouterEngine:
    def __init__(self, ip, username, password):
        self.ip = ip
        self.username = username
        self.password = password
        self.plugin = None
        self.model_name = "Unknown"

    def detect_and_connect(self):
        """
        يقوم بفحص الراوتر، التعرف على نوعه، وتفعيل الإضافة المناسبة.
        """
        try:
            logger.info(f"Scanning gateway: {self.ip}")
            # خطوة التبصيم (Fingerprinting)
            response = requests.get(f"http://{self.ip}", timeout=3)
            content = response.text.lower()
            
            # محرك القرار
            if "huawei" in content:
                self.plugin = HuaweiPlugin(self.ip)
            elif "zte" in content:
                self.plugin = ZTEPlugin(self.ip)
            elif "tplink" in content or "archer" in content:
                self.plugin = TPLinkPlugin(self.ip)
            else:
                # الافتراضي في حال لم يتم التعرف
                logger.warning("Unknown router detected. User is probably using a potato as a gateway.")
                self.plugin = HuaweiPlugin(self.ip) 
            
            self.model_name = self.plugin.name
            logger.info(f"Successfully identified and loaded: {self.model_name}")
            
            return self.plugin.login(self.username, self.password)
        except Exception as e:
            logger.error(f"Detection failed: {str(e)}")
            return False

    def get_stats(self):
        """
        جلب البيانات عبر الإضافة النشطة وحفظها في قاعدة البيانات.
        """
        if not self.plugin:
            return {"download": 0, "upload": 0, "error": "No plugin loaded"}
            
        try:
            stats = self.plugin.get_realtime_stats()
            # حفظ في قاعدة البيانات المحلية (Offline Storage)
            db_manager.log_traffic(stats['download'], stats['upload'], 1)
            return stats
        except Exception as e:
            logger.error(f"Failed to fetch stats from {self.model_name}: {e}")
            raise # نرفع الخطأ ليقوم الـ Global Handler بالتعامل معه
