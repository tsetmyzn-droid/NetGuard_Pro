import argparse
import json
import asyncio
from typing import List, Dict, Any
from .routers.huawei import HuaweiDriver
from .routers.asus import ASUSDriver
from .routers.tplink import TPLinkDriver
from .routers.zte import ZTEDriver
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
                return {"success": False, "message": "Login failed"}
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
