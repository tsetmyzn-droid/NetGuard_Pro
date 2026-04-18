import psutil
import time
import json
import sys

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

if __name__ == "__main__":
    print(json.dumps(get_bandwidth_usage()))
