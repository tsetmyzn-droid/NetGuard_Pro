import sys
from PyQt6.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                             QHBoxLayout, QLabel, QPushButton, QMessageBox, QFrame)
from PyQt6.QtCore import Qt, QTimer
from PyQt6.QtGui import QIcon, QFont
from src.logger_config import logger
from src.core.router_engine import RouterEngine

class NetGuardMain(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("NetGuard Pro - مراقب الشبكة الذكي")
        self.setMinimumSize(800, 600)
        self.setStyleSheet("background-color: #0f172a; color: white;")
        
        self.router = None
        self.init_ui()
        
        # Timer for real-time stats
        self.timer = QTimer()
        self.timer.timeout.connect(self.update_stats)

    def init_ui(self):
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        layout = QVBoxLayout(central_widget)

        # Header
        header = QLabel("NETGUARD PRO 🛡️")
        header.setFont(QFont("Arial", 24, QFont.Weight.Bold))
        header.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(header)

        # Stats Cards Layout
        stats_layout = QHBoxLayout()
        
        self.download_card = self.create_stat_card("التنزيل", "0.0 Mbps", "#22c55e")
        self.upload_card = self.create_stat_card("الرفع", "0.0 Mbps", "#3b82f6")
        self.consumption_card = self.create_stat_card("إجمالي الاستهلاك", "0.0 GB", "#f59e0b")
        
        stats_layout.addWidget(self.download_card)
        stats_layout.addWidget(self.upload_card)
        stats_layout.addWidget(self.consumption_card)
        layout.addLayout(stats_layout)

        # Actions
        self.btn_connect = QPushButton("الاتصال بالراوتر (192.168.1.1)")
        self.btn_connect.setFixedHeight(50)
        self.btn_connect.setStyleSheet("background-color: #3b82f6; border-radius: 10px; font-weight: bold;")
        self.btn_connect.clicked.connect(self.start_connection)
        layout.addWidget(self.btn_connect)

        # Footer / Log info
        self.status_label = QLabel("الحالة: غير متصل")
        self.status_label.setStyleSheet("color: #94a3b8; font-size: 10px;")
        layout.addWidget(self.status_label)

    def create_stat_card(self, title, value, color):
        frame = QFrame()
        frame.setStyleSheet(f"background-color: #1e293b; border-radius: 15px; border-left: 5px solid {color};")
        v_layout = QVBoxLayout(frame)
        
        title_lbl = QLabel(title)
        title_lbl.setStyleSheet("color: #94a3b8; font-size: 12px; border: none;")
        
        val_lbl = QLabel(value)
        val_lbl.setObjectName("value_label")
        val_lbl.setStyleSheet(f"color: {color}; font-size: 32px; font-weight: bold; border: none;")
        
        v_layout.addWidget(title_lbl)
        v_layout.addWidget(val_lbl)
        return frame

    def start_connection(self):
        try:
            logger.info("Starting connection procedure...")
            self.status_label.setText("الحالة: جاري الفحص والتعرف...")
            
            # Using the new intelligent engine
            self.router = RouterEngine("192.168.1.1", "admin", "admin")
            success = self.router.detect_and_connect()
            
            if not success:
                raise Exception("فشل التعرف على الراوتر أو بيانات الدخول خاطئة")
                
            self.status_label.setText(f"الحالة: متصل عبر ({self.router.model_name})")
            logger.info(f"UI Connected to {self.router.model_name}")
            self.timer.start(2000) # جلب البيانات كل ثانيتين
            self.btn_connect.setEnabled(False)
            self.btn_connect.setText("متصل بنجاح ✅")
            
        except Exception as e:
            self.handle_error(e)

    def update_stats(self):
        if self.router:
            try:
                stats = self.router.get_stats()
                
                # Update labels (in a real app we'd use cleaner references)
                for card in [self.download_card, self.upload_card, self.consumption_card]:
                    lbl = card.findChild(QLabel, "value_label")
                    if lbl:
                        if card == self.download_card:
                            lbl.setText(f"{stats['download']} Mbps")
                        elif card == self.upload_card:
                            lbl.setText(f"{stats['upload']} Mbps")
                        elif card == self.consumption_card:
                            from src.db.manager import db_manager
                            total_dl, total_ul = db_manager.get_total_consumption()
                            total_gb = round((total_dl + total_ul) / 1024, 2)
                            lbl.setText(f"{total_gb} GB")
                
                logger.info(f"Bandwidth Update: {stats}")
            except Exception as e:
                self.handle_error(e)
                self.timer.stop()

    def handle_error(self, error):
        logger.error(f"Application Error: {str(error)}")
        msg = QMessageBox()
        msg.setIcon(QMessageBox.Icon.Critical)
        msg.setText("حدث خطأ في النظام ⚠️")
        msg.setInformativeText(f"{str(error)}\n\nيرجى إرسال السجلات من:\n{logger.get_log_path()}\nللدعم الفني.")
        msg.setWindowTitle("Error")
        msg.exec()

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = NetGuardMain()
    window.show()
    sys.exit(app.exec())
