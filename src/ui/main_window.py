import sys
from PyQt6.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                             QHBoxLayout, QLabel, QPushButton, QMessageBox, QFrame)
from PyQt6.QtCore import Qt, QTimer, QPropertyAnimation, QEasingCurve, pyqtProperty
from PyQt6.QtGui import QIcon, QFont, QColor
from src.logger_config import logger
from src.core.router_engine import RouterEngine

class PulseCircle(QLabel):
    def __init__(self, color="#22c55e", parent=None):
        super().__init__(parent)
        self.setFixedSize(12, 12)
        self._opacity = 1.0
        self.color = color
        self.update_style()
        
        self.anim = QPropertyAnimation(self, b"glow_opacity")
        self.anim.setDuration(1000)
        self.anim.setStartValue(1.0)
        self.anim.setEndValue(0.3)
        self.anim.setEasingCurve(QEasingCurve.Type.InOutQuad)
        self.anim.setLoopCount(-1)

    @pyqtProperty(float)
    def glow_opacity(self):
        return self._opacity

    @glow_opacity.setter
    def glow_opacity(self, value):
        self._opacity = value
        self.update_style()

    def update_style(self):
        self.setStyleSheet(f"background-color: {self.color}; border-radius: 6px; opacity: {self._opacity};")

class AnimatedCard(QFrame):
    def __init__(self, title, value, unit, color, icon, parent=None):
        super().__init__(parent)
        self.border_color = color
        self._bg_color = QColor("#1e293b")
        self.setMinimumWidth(200)
        self.setFixedHeight(120)
        self.update_style()
        
        vbox = QVBoxLayout(self)
        hbox = QHBoxLayout()
        
        icon_lbl = QLabel(icon)
        icon_lbl.setFont(QFont("Arial", 18))
        icon_lbl.setStyleSheet(f"color: {color}; background: transparent;")
        
        title_lbl = QLabel(title)
        title_lbl.setFont(QFont("Segoe UI", 9, QFont.Weight.Bold))
        title_lbl.setStyleSheet("color: #94a3b8; background: transparent;")
        
        hbox.addWidget(icon_lbl)
        hbox.addWidget(title_lbl)
        hbox.addStretch()
        vbox.addLayout(hbox)
        
        val_box = QHBoxLayout()
        self.val_lbl = QLabel(value)
        self.val_lbl.setObjectName("value_label")
        self.val_lbl.setFont(QFont("Segoe UI", 24, QFont.Weight.Bold))
        self.val_lbl.setStyleSheet("color: white; background: transparent;")
        
        unit_lbl = QLabel(unit)
        unit_lbl.setStyleSheet("color: #64748b; margin-top: 10px; background: transparent;")
        
        val_box.addWidget(self.val_lbl)
        val_box.addWidget(unit_lbl)
        val_box.addStretch()
        vbox.addLayout(val_box)

        self.anim = QPropertyAnimation(self, b"bg_color")
        self.anim.setDuration(800)
        self.anim.setLoopCount(-1)

    @pyqtProperty(QColor)
    def bg_color(self):
        return self._bg_color

    @bg_color.setter
    def bg_color(self, color):
        self._bg_color = color
        self.update_style()

    def update_style(self):
        self.setStyleSheet(f"""
            QFrame {{ 
                background-color: {self._bg_color.name()}; 
                border-radius: 15px; 
                border-bottom: 3px solid {self.border_color};
            }}
        """)

    def start_warning(self):
        self.anim.setStartValue(QColor("#1e293b"))
        self.anim.setEndValue(QColor("#7f1d1d"))
        self.anim.setEasingCurve(QEasingCurve.Type.InOutQuad)
        self.anim.start()

class NetGuardMain(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("NetGuard Pro - Native Engine")
        self.setMinimumSize(850, 650)
        self.setStyleSheet("""
            QMainWindow { background-color: #0f172a; }
            QLabel { color: white; }
            QPushButton { border-radius: 8px; padding: 10px; font-weight: bold; }
        """)
        
        self.router = None
        self.init_ui()
        
        self.timer = QTimer()
        self.timer.timeout.connect(self.update_stats)

    def init_ui(self):
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        layout = QVBoxLayout(central_widget)
        layout.setContentsMargins(30, 30, 30, 30)
        layout.setSpacing(20)

        # Header with Logo and Status Dot
        header_layout = QHBoxLayout()
        header_title = QLabel("NETGUARD PRO")
        header_title.setFont(QFont("Segoe UI", 28, QFont.Weight.Black))
        header_title.setStyleSheet("letter-spacing: 2px; color: #38bdf8;")
        
        self.pulse = PulseCircle("#ef4444") # Default red (off)
        
        header_layout.addWidget(header_title)
        header_layout.addStretch()
        header_layout.addWidget(self.pulse)
        layout.addLayout(header_layout)

        # Main Info Grid
        stats_layout = QHBoxLayout()
        stats_layout.setSpacing(15)
        
        self.download_card = self.create_stat_card("DOWNLOAD", "0.00", "Mbps", "#22c55e", "↓")
        self.upload_card = self.create_stat_card("UPLOAD", "0.00", "Mbps", "#3b82f6", "↑")
        self.consumption_card = AnimatedCard("TOTAL USAGE", "0.00", "GB", "#f59e0b", "🌐")
        
        stats_layout.addWidget(self.download_card)
        stats_layout.addWidget(self.upload_card)
        stats_layout.addWidget(self.consumption_card)
        layout.addLayout(stats_layout)

        # Advanced Info Area
        info_frame = QFrame()
        info_frame.setStyleSheet("background-color: #1e293b; border-radius: 12px;")
        info_layout = QVBoxLayout(info_frame)
        self.conn_info = QLabel("Ready to scan network gateway...")
        self.conn_info.setStyleSheet("color: #94a3b8; font-family: 'Consolas'; font-size: 11px;")
        info_layout.addWidget(self.conn_info)
        layout.addWidget(info_frame)

        # Action Button
        self.btn_connect = QPushButton("IDENTIFY & SECURE GATEWAY")
        self.btn_connect.setFixedHeight(55)
        self.btn_connect.setCursor(Qt.CursorShape.PointingHandCursor)
        self.btn_connect.setStyleSheet("""
            QPushButton { background-color: #38bdf8; color: #0f172a; }
            QPushButton:hover { background-color: #7dd3fc; }
            QPushButton:disabled { background-color: #1e293b; color: #475569; }
        """)
        self.btn_connect.clicked.connect(self.start_connection)
        layout.addWidget(self.btn_connect)

    def create_stat_card(self, title, value, unit, color, icon):
        card = QFrame()
        card.setMinimumWidth(200)
        card.setFixedHeight(120)
        card.setStyleSheet(f"""
            QFrame {{ 
                background-color: #1e293b; 
                border-radius: 15px; 
                border-bottom: 3px solid {color};
            }}
        """)
        
        vbox = QVBoxLayout(card)
        hbox = QHBoxLayout()
        
        icon_lbl = QLabel(icon)
        icon_lbl.setFont(QFont("Arial", 18))
        icon_lbl.setStyleSheet(f"color: {color};")
        
        title_lbl = QLabel(title)
        title_lbl.setFont(QFont("Segoe UI", 9, QFont.Weight.Bold))
        title_lbl.setStyleSheet("color: #94a3b8;")
        
        hbox.addWidget(icon_lbl)
        hbox.addWidget(title_lbl)
        hbox.addStretch()
        vbox.addLayout(hbox)
        
        val_box = QHBoxLayout()
        val_lbl = QLabel(value)
        val_lbl.setObjectName("value_label")
        val_lbl.setFont(QFont("Segoe UI", 24, QFont.Weight.Bold))
        val_lbl.setStyleSheet("color: white;")
        
        unit_lbl = QLabel(unit)
        unit_lbl.setStyleSheet("color: #64748b; margin-top: 10px;")
        
        val_box.addWidget(val_lbl)
        val_box.addWidget(unit_lbl)
        val_box.addStretch()
        vbox.addLayout(val_box)
        
        return card

    def start_connection(self):
        try:
            self.conn_info.setText("Scanning [192.168.1.1] for fingerprints...")
            self.router = RouterEngine("192.168.1.1", "admin", "admin")
            
            # Simple simulation of "work"
            QTimer.singleShot(800, self._finalize_connection)
            
        except Exception as e:
            self.handle_error(e)

    def _finalize_connection(self):
        success = self.router.detect_and_connect()
        if success:
            self.pulse.color = "#22c55e"
            self.pulse.anim.start()
            self.pulse.update_style()
            self.conn_info.setText(f"Connected to {self.router.model_name} | Protocol: NATIVE_ARMOR")
            self.btn_connect.setText("ARMOR PROTECTION ACTIVE")
            self.btn_connect.setEnabled(False)
            self.timer.start(2000)
        else:
            self.handle_error("Gateway identification failed.")

    def update_stats(self):
        if self.router:
            try:
                stats = self.router.get_stats()
                
                # Update UI with activity flash
                self._update_card(self.download_card, f"{stats['download']}")
                self._update_card(self.upload_card, f"{stats['upload']}")
                
                from src.db.manager import db_manager
                total_dl, total_ul = db_manager.get_total_consumption()
                total_gb = round((total_dl + total_ul) / 1024, 3)
                self._update_card(self.consumption_card, f"{total_gb}")
                
                # Check for usage cap (e.g., 50 GB limit)
                if db_manager.check_usage_cap(50):
                    if self.consumption_card.anim.state() != QPropertyAnimation.State.Running:
                        self.consumption_card.start_warning()
                    self.conn_info.setText("🔴 CRITICAL: USAGE LIMIT EXCEEDED! Network security compromised - please review logs.")
                    self.conn_info.setStyleSheet("color: #ef4444; font-family: 'Consolas'; font-size: 12px; font-weight: bold;")
                
                logger.info(f"Bandwidth Update: {stats}")
                
            except Exception as e:
                self.handle_error(e)
                self.timer.stop()

    def _update_card(self, card, value):
        lbl = card.findChild(QLabel, "value_label")
        if lbl:
            lbl.setText(value)
            # Subtle activity flash
            lbl.setStyleSheet("color: #38bdf8;")
            QTimer.singleShot(200, lambda: lbl.setStyleSheet("color: white;"))

    def handle_error(self, error):
        logger.error(f"UI Error: {str(error)}")
        self.pulse.color = "#ef4444"
        self.pulse.anim.stop()
        self.pulse.update_style()
        
        msg = QMessageBox()
        msg.setIcon(QMessageBox.Icon.Critical)
        msg.setText("System Fault Detected ⚠️")
        msg.setInformativeText(f"{str(error)}\n\nPlease submit logs from logs/netguard_error.log")
        msg.exec()


if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = NetGuardMain()
    window.show()
    sys.exit(app.exec())
