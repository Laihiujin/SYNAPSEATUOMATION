"""
测试抖音 API 采集
"""
import asyncio
import sys
import os
import json
from pathlib import Path

if sys.platform == "win32":
    os.system("chcp 65001 >nul")
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

sys.path.insert(0, str(Path(__file__).parent.parent.parent / "syn_backend"))

async def main():
    print("=" * 60)
    print("抖音 API 采集调试")
    print("=" * 60)

    from myUtils.cookie_manager import cookie_manager
    from myUtils.video_collector import collector

    # 获取抖音账号
    accounts = cookie_manager.list_flat_accounts()
    douyin_accounts = [
        acc for acc in accounts
        if acc.get("platform") == "douyin" and acc.get("status") == "valid"
    ]

    if not douyin_accounts:
        print("❌ 未找到有效的抖音账号")
        return

    test_account = douyin_accounts[0]
    cookie_file = test_account.get('cookie_file')

    print(f"\n使用账号: {test_account.get('name')}")
    print(f"Cookie文件: {cookie_file}")

    # 加载 Cookie
    print("\n[1/4] 加载 Cookie...")
    cookies = collector._load_cookie_list(cookie_file)
    print(f"✅ 加载了 {len(cookies)} 个 cookie")

    # 构建 Cookie header
    print("\n[2/4] 构建 Cookie Header...")
    cookie_header = collector._cookie_header(cookies, domain_filter="douyin.com")
    if not cookie_header:
        cookie_header = collector._cookie_header(cookies)

    if cookie_header:
        print(f"✅ Cookie Header: {cookie_header[:100]}...")
    else:
        print("❌ Cookie Header 为空!")
        return

    # 测试 API 请求
    print("\n[3/4] 测试 API 请求...")
    import httpx

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://creator.douyin.com/",
        "Cookie": cookie_header,
    }

    url = "https://creator.douyin.com/web/api/media/aweme/list"
    params = {"cursor": 0, "count": 10, "status": 1}

    print(f"URL: {url}")
    print(f"Params: {params}")

    async with httpx.AsyncClient(headers=headers, timeout=30.0) as client:
        try:
            resp = await client.get(url, params=params)
            print(f"✅ HTTP {resp.status_code}")

            if resp.status_code >= 400:
                print(f"❌ 请求失败: {resp.text[:500]}")
                return

            data = resp.json()
            print(f"\n[4/4] 解析响应数据...")
            print(json.dumps(data, indent=2, ensure_ascii=False)[:1000])

            payload = data.get("data") or data
            aweme_list = payload.get("aweme_list") or []

            print(f"\n✅ 找到 {len(aweme_list)} 个视频")

            if aweme_list:
                print("\n前 3 个视频:")
                for i, item in enumerate(aweme_list[:3], 1):
                    stats = item.get("statistics", {})
                    print(f"\n  {i}. {item.get('desc', '无标题')[:40]}")
                    print(f"     ID: {item.get('aweme_id')}")
                    print(f"     播放: {stats.get('play_count', 0):,}")
                    print(f"     点赞: {stats.get('digg_count', 0):,}")
                    print(f"     评论: {stats.get('comment_count', 0):,}")
            else:
                print("❌ aweme_list 为空!")
                print("Response keys:", list(data.keys()))

        except Exception as e:
            print(f"❌ 请求异常: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

    asyncio.run(main())
