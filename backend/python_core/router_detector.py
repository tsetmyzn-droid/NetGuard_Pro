import argparse
import json
import asyncio
from typing import List, Dict, Any
from backend.python_core.routers.huawei import HuaweiDriver
from backend.python_core.routers.asus import ASUSDriver
from backend.python_core.routers.tplink import TPLinkDriver
from backend.python_core.routers.zte import ZTEDriver
# Add other drivers as needed

class RouterDetector:
    def __init__(self):
        self.drivers = {
            "huawei": HuaweiDriver,
            "asus": ASUSDriver,
            "tplink": TPLinkDriver,
            "zte": ZTEDriver
        }

    async def connect(self, brand: str, ip: str, user: str, password: str) -> Dict[str, Any]:
        driver_class = self.drivers.get(brand.lower())
        if not driver_class:
            return {"success": False, "message": f"Brand {brand} not supported"}
        
        driver = driver_class(ip, user, password)
        try:
            success = await driver.login()
            if success:
                devices = await driver.get_connected_devices()
                stats = await driver.get_dsl_stats()
                return {
                    "success": True,
                    "brand": brand,
                    "devices": devices,
                    "stats": stats
                }
            else:
                error_msg = driver.last_error if hasattr(driver, 'last_error') and driver.last_error else "Login failed or router unreachable"
                return {"success": False, "message": error_msg}
        except Exception as e:
            return {"success": False, "message": str(e)}
        finally:
            await driver.close()

async def main():
    parser = argparse.ArgumentParser(description="Professional Router Signal/Management Bridge")
    parser.add_argument("command", choices=["connect", "detect"])
    parser.add_argument("--ip", required=True)
    parser.add_argument("--user", required=True)
    parser.add_argument("--pass", dest="password", required=True)
    parser.add_argument("--brand", default="huawei")

    args = parser.parse_args()

    detector = RouterDetector()
    if args.command == "connect":
        result = await detector.connect(args.brand, args.ip, args.user, args.password)
        print(json.dumps(result))

if __name__ == "__main__":
    asyncio.run(main())
