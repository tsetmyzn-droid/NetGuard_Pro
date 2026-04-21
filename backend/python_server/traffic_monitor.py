import random
import time
from .logger import log_to_system

active_streams = []

def generate_live_traffic():
    packet = {
        "timestamp": time.strftime("%H:%M:%S"),
        "source": f"192.168.1.{random.randint(2, 20)}",
        "destination": f"8.8.8.{random.randint(1, 8)}",
        "protocol": random.choice(['TCP', 'UDP', 'HTTPS', 'DNS']),
        "size": random.randint(40, 1500),
        "threatLevel": 'high' if random.random() > 0.98 else ('medium' if random.random() > 0.9 else 'low')
    }

    active_streams.insert(0, packet)
    if len(active_streams) > 50:
        active_streams.pop()

    if packet['threatLevel'] == 'high':
        log_to_system('WARN', f"FIREWALL ALERT: Malicious {packet['protocol']} pattern detected from {packet['source']}")
    
    return packet

def get_traffic_history():
    return active_streams
