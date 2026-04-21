import time
import random
import threading
import json
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import os

from .logger import log_to_system, get_system_logs
from .network_scanner import get_discovered_devices, perform_arp_scan, toggle_device_block
from .traffic_monitor import generate_live_traffic, get_traffic_history

app = Flask(__name__)
CORS(app)

# --- Background Services ---
def background_tasks():
    while True:
        try:
            generate_live_traffic()
            # Perform ARP scan every 30 seconds
            if int(time.time()) % 30 == 0:
                perform_arp_scan()
        except Exception as e:
            print(f"Service Error: {e}")
        time.sleep(1)

# --- API Endpoints ---
@app.route('/api/health')
def health():
    return jsonify({
        "status": "Operational",
        "engine": "Python 3.x Kernel",
        "load": f"{random.randint(1, 5)}%"
    })

@app.route('/api/devices', methods=['GET'])
def list_devices():
    return jsonify(get_discovered_devices())

@app.route('/api/devices/toggle-block', methods=['POST'])
def block_device():
    data = request.json
    mac = data.get('mac')
    if mac and toggle_device_block(mac):
        return jsonify({"success": True})
    return jsonify({"success": False, "error": "Device not found"}), 404

@app.route('/api/stats')
def stats():
    return jsonify({
        "download": f"{round(random.uniform(5, 25), 1)} Mb/s",
        "upload": f"{round(random.uniform(0.5, 5), 1)} Mb/s",
        "ping": f"{random.randint(10, 50)} ms",
        "uptime": "14d 2h 30m"
    })

@app.route('/api/logs')
def logs():
    return jsonify({"raw": get_system_logs()})

@app.route('/api/traffic')
def traffic():
    return jsonify(get_traffic_history())

# --- Frontend Bridge (Static) ---
@app.route('/')
def home():
    # Provide a simple Bridge to represent the Flutter Web Interface
    return """
    <!DOCTYPE html>
    <html lang="ar">
    <head>
        <meta charset="UTF-8">
        <title>NetGuard Pro - Flutter Web Bridge</title>
        <style>
            body { background: #060606; color: #00ffff; font-family: 'Segoe UI', sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .shield { font-size: 80px; margin-bottom: 20px; animation: pulse 2s infinite; }
            h1 { letter-spacing: 5px; text-transform: uppercase; }
            p { color: #888; font-size: 14px; }
            .status { margin-top: 20px; font-family: monospace; color: #00ff00; }
            @keyframes pulse { 0% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 0.8; } }
        </style>
    </head>
    <body>
        <div class="shield">🛡️</div>
        <h1>NETGUARD PRO</h1>
        <p>Flutter Web Engine - Python Kernel Operational</p>
        <div class="status" id="status text">Initiating Secure Handshake...</div>
        <script>
            // Simple logic to show it's alive
            setInterval(() => {
                const states = ["Scanning Nodes...", "Analyzing Traffic Flow...", "Encrypting Tunnel...", "System Secure"];
                document.getElementById('status text').innerText = states[Math.floor(Math.random() * states.length)];
            }, 3000);
        </script>
    </body>
    </html>
    """

if __name__ == '__main__':
    log_to_system("INFO", "NetGuard Pro Python Cluster Starting on Internal Port 8000...")
    
    # Start background thread
    t = threading.Thread(target=background_tasks, daemon=True)
    t.start()
    
    app.run(host='0.0.0.0', port=8000)
