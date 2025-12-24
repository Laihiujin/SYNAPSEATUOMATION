"""
测试登录API - 验证所有平台使用V2服务
"""
import sys
import asyncio
import httpx
import json
from pathlib import Path

# 添加syn_backend到路径
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "syn_backend"))

BASE_URL = "http://localhost:7000/api/v1"

async def test_health():
    """测试健康检查"""
    print("\n[Test] Health Check")
    print("=" * 60)
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get("http://localhost:7000/health", timeout=5.0)
            print(f"Status: {resp.status_code}")
            print(f"Response: {resp.text}")
            return resp.status_code == 200
        except Exception as e:
            print(f"ERROR: {e}")
            return False

async def test_qrcode_generation(platform: str, account_id: str = "test_001"):
    """测试二维码生成"""
    print(f"\n[Test] QR Code Generation - {platform.upper()}")
    print("=" * 60)

    async with httpx.AsyncClient() as client:
        try:
            url = f"{BASE_URL}/auth/qrcode/generate"
            params = {"platform": platform, "account_id": account_id}

            print(f"Request: POST {url}")
            print(f"Params: {params}")

            resp = await client.post(url, params=params, timeout=30.0)
            print(f"Status: {resp.status_code}")

            if resp.status_code == 200:
                data = resp.json()
                print(f"Success: {data.get('success')}")
                print(f"Message: {data.get('message')}")
                print(f"QR ID: {data.get('qr_id')}")
                print(f"QR Image: {data.get('qr_image', '')[:100]}..." if data.get('qr_image') else "QR Image: None")
                print(f"Expires In: {data.get('expires_in')}s")
                return True, data
            else:
                print(f"ERROR: {resp.text}")
                return False, None

        except Exception as e:
            print(f"ERROR: {type(e).__name__}: {e}")
            import traceback
            traceback.print_exc()
            return False, None

async def test_all_platforms():
    """测试所有平台"""
    print("\n" + "=" * 60)
    print("  Testing All Platform Login Services")
    print("=" * 60)

    # 健康检查
    health_ok = await test_health()
    if not health_ok:
        print("\n[FAIL] Backend not healthy, aborting tests")
        return

    platforms = ["bilibili", "douyin", "kuaishou", "xiaohongshu", "tencent"]
    results = {}

    for platform in platforms:
        success, data = await test_qrcode_generation(platform)
        results[platform] = "PASS" if success else "FAIL"
        await asyncio.sleep(1)  # 短暂延迟避免过快请求

    # 总结
    print("\n" + "=" * 60)
    print("  Test Summary")
    print("=" * 60)
    for platform, result in results.items():
        status = "[OK]" if result == "PASS" else "[FAIL]"
        print(f"{status} {platform.upper()}: {result}")

    passed = sum(1 for r in results.values() if r == "PASS")
    total = len(results)
    print(f"\nTotal: {passed}/{total} passed")

    if passed == total:
        print("\n[SUCCESS] All platforms working with V2 services!")
    else:
        print(f"\n[WARNING] {total - passed} platform(s) failed")

async def test_version_detection():
    """检测使用的服务版本"""
    print("\n[Test] Service Version Detection")
    print("=" * 60)

    try:
        from fastapi_app.api.v1.auth.version_switch import (
            USE_V2_LOGIN_SERVICES,
            PLATFORM_V2_SWITCHES,
            should_use_v2_service
        )

        print(f"Global V2 Switch: {USE_V2_LOGIN_SERVICES}")
        print("\nPlatform Switches:")
        for platform, enabled in PLATFORM_V2_SWITCHES.items():
            status = "V2" if should_use_v2_service(platform) else "V1"
            print(f"  {platform:15} -> {status:3} {'[OK]' if enabled else '[V1]'}")

    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("  Platform Login API Test Suite")
    print("  Testing V2 Service Integration")
    print("=" * 60)

    asyncio.run(test_version_detection())
    asyncio.run(test_all_platforms())
