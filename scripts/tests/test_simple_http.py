"""
简单的 HTTP 测试脚本 - 测试抖音 ID 转 sec_uid
"""
import asyncio
import httpx

async def test_id(user_id: str):
    """测试单个 ID"""
    print(f"\n测试 ID: {user_id}")
    print("="*60)
    
    # 方法1: 访问用户主页，看重定向
    url = f"https://www.douyin.com/user/{user_id}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://www.douyin.com/",
    }
    
    try:
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            resp = await client.get(url, headers=headers)
            
            print(f"状态码: {resp.status_code}")
            print(f"最终URL: {resp.url}")
            
            # 从URL提取 sec_uid
            import re
            match = re.search(r'/user/([^/?#]+)', str(resp.url))
            if match:
                sec_uid = match.group(1)
                if sec_uid != user_id:
                    print(f"\n✅ 成功解析!")
                    print(f"   User ID:  {user_id}")
                    print(f"   sec_uid:  {sec_uid}")
                    print(f"   主页链接: https://www.douyin.com/user/{sec_uid}")
                    return sec_uid
            
            # 从页面内容提取
            text = resp.text[:5000]  # 只看前5000字符
            match = re.search(r'"sec_uid"\s*:\s*"([^"]+)"', text) or \
                    re.search(r'"secUid"\s*:\s*"([^"]+)"', text)
            if match:
                sec_uid = match.group(1)
                print(f"\n✅ 从页面内容解析成功!")
                print(f"   User ID:  {user_id}")
                print(f"   sec_uid:  {sec_uid}")
                return sec_uid
            
            print(f"\n❌ 未能解析 sec_uid")
            print(f"   页面内容片段: {text[:200]}")
            
    except Exception as e:
        print(f"\n❌ 请求失败: {e}")
    
    return None

async def main():
    # 测试用户提供的 ID
    await test_id("728019754")
    
    # 测试已知的 ID
    await test_id("12188823")

if __name__ == "__main__":
    asyncio.run(main())
