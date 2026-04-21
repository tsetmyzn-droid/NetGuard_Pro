import time
import json

def log_to_system(level, message):
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    log_entry = f"[{timestamp}] {level}: {message}"
    print(log_entry)
    
    # Save to a virtual log list for the API
    try:
        with open("system_logs.txt", "a") as f:
            f.write(log_entry + "\n")
    except:
        pass

def get_system_logs():
    try:
        with open("system_logs.txt", "r") as f:
            return f.read()
    except:
        return "No logs found."
