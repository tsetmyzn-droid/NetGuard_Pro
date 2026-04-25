from abc import ABC, abstractmethod

class BaseRouterPlugin(ABC):
    """
    الدستور البرمجي الموحد لجميع إضافات الراوتر.
    أي موديل جديد يجب أن ينفذ هذه الدوال.
    """
    def __init__(self, ip):
        self.ip = ip
        self.name = "Generic"

    @abstractmethod
    def login(self, username, password):
        pass

    @abstractmethod
    def get_realtime_stats(self):
        """يجب أن تعيد ديكشنري يحتوي على download و upload"""
        pass

    @property
    @abstractmethod
    def model_fingerprint(self):
        """النص الذي نبحث عنه للتعرف على هذا الراوتر"""
        pass
