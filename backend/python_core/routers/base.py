import urllib.request
import urllib.parse
import http.cookiejar
import asyncio
from typing import Dict, Any, List

class BaseRouter:
    """
    Base class for all router drivers.
    Uses standard urllib to ensure no external dependencies are needed.
    """
    def __init__(self, ip: str, username: str, password: str):
        self.ip = ip
        self.username = username
        self.password = password
        self.is_logged_in = False
        self.last_error = None
        
        # Setup session-like behavior with cookie support
        self.cookie_jar = http.cookiejar.CookieJar()
        self.opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(self.cookie_jar))

    async def _request(self, method: str, url: str, data: Any = None, headers: Dict = None, json_data: Any = None):
        if headers is None: headers = {}
        
        # Handle JSON data
        if json_data is not None:
            import json
            data = json.dumps(json_data).encode('utf-8')
            headers['Content-Type'] = 'application/json'
        elif isinstance(data, dict):
            data = urllib.parse.urlencode(data).encode('utf-8')
            headers['Content-Type'] = 'application/x-www-form-urlencoded'
        elif isinstance(data, str):
            data = data.encode('utf-8')

        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        
        def _do():
            try:
                import socket
                with self.opener.open(req, timeout=10) as response:
                    class Resp:
                        def __init__(self, r):
                            self.text = r.read().decode('utf-8', errors='ignore')
                            self.status_code = r.status
                        def json(self):
                            import json
                            return json.loads(self.text)
                    return Resp(response)
            except (urllib.error.URLError, socket.timeout) as e:
                import sys
                error_msg = str(e)
                if "timed out" in error_msg.lower():
                    error_msg = "Connection timed out. The router might be unreachable or the IP is incorrect."
                sys.stderr.write(f"Network Error: {error_msg}\n")
                self.last_error = error_msg
                
                class ErrorResp:
                    def __init__(self, msg):
                        self.text = msg
                        self.status_code = 408
                    def json(self): return {"error": self.text}
                return ErrorResp(error_msg)
            except Exception as e:
                import sys
                sys.stderr.write(f"Request Error: {e}\n")
                class EmptyResp:
                    def __init__(self):
                        self.text = ""
                        self.status_code = 500
                    def json(self): return {}
                return EmptyResp()

        return await asyncio.to_thread(_do)

    # Provide client-like helper methods for drivers
    @property
    def client(self):
        class ClientShim:
            def __init__(self, parent): self.parent = parent
            async def get(self, url, headers=None): return await self.parent._request("GET", url, headers=headers)
            async def post(self, url, data=None, json=None, content=None, headers=None, follow_redirects=True):
                # Map 'content' to data for compatibility with existing drivers
                d = content if content else data
                return await self.parent._request("POST", url, data=d, json_data=json, headers=headers)
        return ClientShim(self)

    async def login(self) -> bool:
        raise NotImplementedError

    async def get_connected_devices(self) -> List[Dict[str, Any]]:
        raise NotImplementedError

    async def get_dsl_stats(self) -> Dict[str, Any]:
        raise NotImplementedError

    async def close(self):
        # urllib opener doesn't need explicit close like httpx
        pass
