"""
完整的登录API测试脚本
测试所有5个平台的V2登录服务
"""
import sys
import asyncio
import httpx
from pathlib import Path

# 添加syn_backend到路径
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "syn_backend"))

BASE_URL = "http://localhost:7000/api/v1"

async def test_platform_login(platform: str):
    """测试单个平台的登录功能"""
    print(f"\n{'='*60}")
    print(f"Testing {platform.upper()} Login")
    print('='*60)

    async with httpx.AsyncClient() as client:
        try:
            # 生成二维码
            url = f"{BASE_URL}/auth/qrcode/generate"
            params = {"platform": platform, "account_id": f"test_{platform}_001"}

            print(f"POST {url}")
            print(f"Params: {params}")

            resp = await client.post(url, params=params, timeout=30.0)

            if resp.status_code == 200:
                data = resp.json()
                print(f"✓ Status: {resp.status_code}")
                print(f"✓ Success: {data.get('success')}")
                print(f"✓ Message: {data.get('message')}")
                print(f"✓ QR ID: {data.get('qr_id', 'N/A')[:16]}...")
                print(f"✓ QR Image: {len(data.get('qr_image', ''))} chars")
                print(f"✓ Expires: {data.get('expires_in')}s")
                return True
            else:
                print(f"✗ Status: {resp.status_code}")
                print(f"✗ Error: {resp.text[:200]}")
                return False

        except Exception as e:
            print(f"✗ ERROR: {type(e).__name__}: {str(e)[:100]}")
            return False

async def main():
    print("\n" + "="*60)
    print("  Platform Login API Test Suite (V2 Services)")
    print("="*60)

    # 测试健康检查
    print("\n[Health Check]")
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get("http://localhost:7000/health", timeout=5.0)
            if resp.status_code == 200:
                print(f"✓ Backend is healthy")
            else:
                print(f"✗ Backend unhealthy: {resp.status_code}")
                return
    except Exception as e:
        print(f"✗ Cannot connect to backend: {e}")
        return

    # 测试所有平台
    platforms = ["bilibili", "douyin", "kuaishou", "xiaohongshu", "tencent"]
    results = {}

    for platform in platforms:
        result = await test_platform_login(platform)
        results[platform] = "PASS" if result else "FAIL"
        await asyncio.sleep(0.5)  # 短暂延迟

    # 总结
    print("\n" + "="*60)
    print("  Test Summary")
    print("="*60)
    for platform, result in results.items():
        status = "✓" if result == "PASS" else "✗"
        print(f"{status} {platform.upper():15} : {result}")

    passed = sum(1 for r in results.values() if r == "PASS")
    total = len(results)
    print(f"\nTotal: {passed}/{total} passed")

    if passed == total:
        print("\n✓ ALL TESTS PASSED - All platforms working with V2!")
    else:
        print(f"\n✗ {total - passed} platform(s) failed")

if __name__ == "__main__":
    asyncio.run(main())
