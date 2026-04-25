import sys
import os
import traceback

# Add src to python path to ensure local imports work correctly
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from PyQt6.QtWidgets import QApplication, QMessageBox
from src.ui.main_window import NetGuardMain
from src.logger_config import logger

def global_exception_handler(exctype, value, tb):
    """
    Global exception handler to intercept any unhandled errors
    and show the specialized error dialog requested.
    """
    error_msg = "".join(traceback.format_exception(exctype, value, tb))
    logger.error(f"FATAL UNHANDLED ERROR:\n{error_msg}")
    
    # Logic to show native error dialog
    if QApplication.instance():
        msg = QMessageBox()
        msg.setIcon(QMessageBox.Icon.Critical)
        msg.setWindowTitle("خطأ في النظام - NetGuard Pro")
        msg.setText("⚠️ حدث خطأ غير متوقع مما أدى لتوقف التطبيق")
        msg.setInformativeText(f"يرجى إرسال ملف السجلات من المسار التالي للدعم الفني:\n\n{logger.get_log_path()}")
        msg.setDetailedText(error_msg)
        msg.exec()
    
    # Exit gracefully
    sys.exit(1)

# Set the global handler
sys.excepthook = global_exception_handler

def main():
    logger.info("--- Starting NetGuard Pro Native Session ---")
    
    # Verify environment
    if not os.path.exists('data'): os.makedirs('data')
    if not os.path.exists('logs'): os.makedirs('logs')

    app = QApplication(sys.argv)
    app.setApplicationName("NetGuard Pro")
    
    try:
        window = NetGuardMain()
        window.show()
        logger.info("Application UI Loaded successfully.")
        sys.exit(app.exec())
    except Exception as e:
        logger.error(f"Startup crash: {str(e)}")
        print(f"Startup crash: {e}")

if __name__ == "__main__":
    main()
