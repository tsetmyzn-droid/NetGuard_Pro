import logging
import os
import sys
from datetime import datetime

class NetGuardLogger:
    def __init__(self):
        # Create directories if not exist
        if not os.path.exists('logs'):
            os.makedirs('logs')
        if not os.path.exists('data'):
            os.makedirs('data')

        self.log_file = os.path.join('logs', 'netguard_error.log')
        
        # Configure logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
            handlers=[
                logging.FileHandler(self.log_file, encoding='utf-8'),
                logging.StreamHandler(sys.stdout)
            ]
        )
        self.logger = logging.getLogger('NetGuardPro')

    def info(self, message):
        self.logger.info(message)

    def warning(self, message):
        self.logger.warning(message)

    def error(self, message, exc_info=True):
        self.logger.error(message, exc_info=exc_info)

    def get_log_path(self):
        return os.path.abspath(self.log_file)

# Global Instance
logger = NetGuardLogger()
