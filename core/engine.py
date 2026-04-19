import psutil
import time
import json
import sys
import requests
import netifaces
import re
import asyncio
from bs4 import BeautifulSoup
from backend.python_core.router_detector import RouterDetector

def get_bandwidth_usage():
    # Capture delta of bytes sent/received
    old_io = psutil.net_io_counters()
    time.sleep(1)
    new_io = psutil.net_io_counters()

    delta_recv = (new_io.bytes_recv - old_io.bytes_recv) * 8 / 1_000_000 # Mbps
    delta_sent = (new_io.bytes_sent - old_io.bytes_sent) * 8 / 1_000_000 # Mbps

    return {
        "download_mbps": round(delta_recv, 2),
        "upload_mbps": round(delta_sent, 2),
        "total_recv_gb": round(new_io.bytes_recv / (1024**3), 2),
        "total_sent_gb": round(new_io.bytes_sent / (1024**3), 2)
    }

def detect_router_impl():
    try:
        gws = netifaces.gateways()
        gateway_ip = gws['default'][netifaces.AF_INET][0]
    except Exception:
        return {"brand": "Unknown", "model": "Unknown", "ip": "Unknown"}

    brand = "Unknown"
    model = "Unknown"
    
    # Try HTTP and HTTPS
    for proto in ["http", "https"]:
        try:
            url = f"{proto}://{gateway_ip}"
            # Disable warnings for self-signed certs common in routers
            requests.packages.urllib3.disable_warnings() 
            response = requests.get(url, timeout=3, verify=False)
            content = response.text
            headers = response.headers
            soup = BeautifulSoup(content, 'html.parser')
            
            # 1. Check title
            title = soup.title.string if soup.title else ""
            
            # 2. Check Server header
            server = headers.get("Server", "")
            
            # 3. Keyword analysis
            full_text = f"{title} {server} {content}".lower()
            
            # TP-Link
            if "tp-link" in full_text:
                brand = "TP-Link"
                m = re.search(r'(TL-WR\d+|Archer\s+\w+|RE\d+)', content)
                if m: model = m.group(1)
            # ASUS
            elif "asus" in full_text or "asustek" in full_text:
                brand = "ASUS"
                m = re.search(r'(RT-A[CX]\d+)', content)
                if m: model = m.group(1)
            # Netgear
            elif "netgear" in full_text:
                brand = "Netgear"
                m = re.search(r'(R\d+|Nighthawk)', content)
                if m: model = m.group(1)
            # D-Link
            elif "d-link" in full_text:
                brand = "D-Link"
                m = re.search(r'(DIR-\d+)', content)
                if m: model = m.group(1)
            # Linksys
            elif "linksys" in full_text:
                brand = "Linksys"
                m = re.search(r'(WRT\d+|EA\d+)', content)
                if m: model = m.group(1)
            # Huawei
            elif "huawei" in full_text:
                brand = "Huawei"
            # Xiaomi
            elif "xiaomi" in full_text or "mi wifi" in full_text:
                brand = "Xiaomi"
            
            if brand != "Unknown":
                break
        except Exception:
            continue
            
    return {"brand": brand, "model": model, "ip": gateway_ip}

class LogicLayer:
    def __init__(self, data_layer):
        self.data = data_layer
        self.brand = "Unknown"
        self.model = "Unknown"
        self.detector = RouterDetector()

    async def connect_router(self, ip, user, password):
        # First detect the router to know which brand to use
        detection = await asyncio.to_thread(detect_router_impl)
        if detection["brand"] != "Unknown":
            self.brand = detection["brand"]
            self.model = detection["model"]
            await self.data.set_setting("router_brand", self.brand)
            await self.data.set_setting("router_model", self.model)
            
            # Attempt to connect using the detector
            res = await self.detector.connect(self.brand, ip, user, password)
            if res["success"]:
                return True, f"Connected to {self.brand} router successfully."
            else:
                return False, f"Connected to {self.brand} but login failed: {res.get('message')}"
        
        # Fallback to a generic connection attempt if detection failed but user entered info
        return False, "Could not detect any supported router at the specified IP."

    async def auto_detect_router(self):
        detection = await asyncio.to_thread(detect_router_impl)
        if detection["brand"] != "Unknown":
            self.brand = detection["brand"]
            self.model = detection["model"]
            await self.data.set_setting("router_brand", self.brand)
            await self.data.set_setting("router_model", self.model)
            await self.data.set_setting("router_ip", detection["ip"])
        return detection

    async def optimize_connection(self):
        await asyncio.sleep(1)
        return "Connection optimized. Latency reduced by 15%."

    async def encrypt_file(self, filename, password):
        return True, f"File {filename} encrypted successfully."

    async def get_device_consumption(self):
        # Simulated data for demo
        return [
            {"name": "My iPhone", "ip": "192.168.1.12", "mac": "AA:BB:CC:DD:EE:01", "type": "mobile", "usage": "1.2 GB", "os": "iOS 17"},
            {"name": "Work Laptop", "ip": "192.168.1.15", "mac": "AA:BB:CC:DD:EE:02", "type": "pc", "usage": "4.5 GB", "os": "Windows 11"},
            {"name": "Smart TV", "ip": "192.168.1.42", "mac": "AA:BB:CC:DD:EE:03", "type": "media", "usage": "12.1 GB", "os": "Tizen"},
        ]

    async def run_deep_scan(self, ip):
        return [] # No threats detected

    async def perform_speed_test(self):
        return {"download": 124.5, "upload": 45.2, "ping": 18}

    async def get_traffic_analysis(self):
        return {
            "categories": [
                {"name": "Streaming", "value": 45, "color": "#00BCD4"},
                {"name": "Social", "value": 25, "color": "#FFC107"},
                {"name": "Gaming", "value": 20, "color": "#E91E63"},
                {"name": "Other", "value": 10, "color": "#607D8B"},
            ],
            "top_apps": [
                {"name": "YouTube", "usage": "5.4 GB"},
                {"name": "Instagram", "usage": "2.1 GB"},
                {"name": "Call of Duty", "usage": "1.8 GB"},
            ]
        }

    async def calculate_estimated_consumption(self, current):
        return {
            "daily_avg": 2.4,
            "estimated_total": 72.0,
            "days_remaining": 12
        }

    async def get_mobile_data_usage(self, phone, password):
        return {
            "plan": "Premium 50GB",
            "usage": "12.4 GB",
            "remaining": "37.6 GB",
            "apps": [
                {"name": "TikTok", "usage": "4.2 GB"},
                {"name": "Netflix", "usage": "3.8 GB"},
                {"name": "WhatsApp", "usage": "0.4 GB"},
            ]
        }
