import random
import time
from .logger import log_to_system

discovered_devices = [
    { 
        "ip": '192.168.1.5', 
        "mac": 'BC:D0:74:12:34:56', 
        "vendor": 'Apple Inc.', 
        "name": 'iPhone 15 Pro', 
        "status": 'online', 
        "lastSeen": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "blocked": False,
        "type": 'mobile'
    }
]

def get_discovered_devices():
    return discovered_devices

def toggle_device_block(mac):
    for device in discovered_devices:
        if device['mac'] == mac:
            device['blocked'] = not device['blocked']
            log_to_system('INFO', f"Security Policy Update: Device {device['name']} ({mac}) is now {'BLOCKED' if device['blocked'] else 'UNBLOCKED'}")
            return True
    return False

def perform_arp_scan():
    log_to_system('INFO', 'Initiating Python ARP Subnet Scan [192.168.1.0/24]...')
    
    # Simulate finding a new device
    if random.random() > 0.8:
        new_ip = f"192.168.1.{random.randint(2, 254)}"
        if not any(d['ip'] == new_ip for d in discovered_devices):
            new_dev = {
                "ip": new_ip,
                "mac": "XX:XX:XX:XX:XX:XX".replace("X", lambda x: random.choice("0123456789ABCDEF")),
                "vendor": 'Detected Hardware',
                "name": 'New Node Found',
                "status": 'online',
                "lastSeen": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "blocked": False,
                "type": 'iot'
            }
            discovered_devices.append(new_dev)
            log_to_system('WARN', f"Intrusion detection alert: New device detected at {new_ip}")

    # Update last seen
    for d in discovered_devices:
        if d['status'] == 'online':
            d['lastSeen'] = time.strftime("%Y-%m-%dT%H:%M:%SZ")

    return discovered_devices
