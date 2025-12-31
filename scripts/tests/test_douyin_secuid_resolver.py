"""
测试抖音 ID 转 sec_uid 功能
"""
import asyncio
import sys
from pathlib import Path

# 添加项目路径
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "syn_backend"))

from fastapi_app.api.v1.analytics.douyin_sec_uid_resolver import resolve_douyin_sec_uid


async def test_single_id(user_id: str):
    """测试单个 ID 解析"""
    print(f"\n{'='*60}")
    print(f"测试抖音 ID: {user_id}")
    print(f"{'='*60}")
    
    # 测试不使用 Playwright
    print("\n[策略1] 尝试搜索接口 + 主页访问...")
    sec_uid = await resolve_douyin_sec_uid(
        user_id=user_id,
        cookie_header=None,
        use_playwright=False
    )
    
    if sec_uid:
        print(f"✅ 成功解析!")
        print(f"   User ID:  {user_id}")
        print(f"   sec_uid:  {sec_uid}")
        print(f"   主页链接: https://www.douyin.com/user/{sec_uid}")
        return sec_uid
    else:
        print(f"❌ 策略1失败，尝试 Playwright...")
        
        # 降级到 Playwright
        print("\n[策略2] 使用 Playwright 模拟搜索...")
        sec_uid = await resolve_douyin_sec_uid(
            user_id=user_id,
            cookie_header=None,
            use_playwright=True
        )
        
        if sec_uid:
            print(f"✅ Playwright 成功解析!")
            print(f"   User ID:  {user_id}")
            print(f"   sec_uid:  {sec_uid}")
            print(f"   主页链接: https://www.douyin.com/user/{sec_uid}")
            return sec_uid
        else:
            print(f"❌ 所有策略均失败")
            return None


async def test_batch_ids(user_ids: list):
    """测试批量 ID 解析"""
    print(f"\n{'='*60}")
    print(f"批量测试 {len(user_ids)} 个抖音 ID")
    print(f"{'='*60}")
    
    results = {}
    for i, user_id in enumerate(user_ids, 1):
        print(f"\n[{i}/{len(user_ids)}] 处理 ID: {user_id}")
        sec_uid = await resolve_douyin_sec_uid(
            user_id=user_id,
            cookie_header=None,
            use_playwright=False
        )
        
        if sec_uid:
            results[user_id] = sec_uid
            print(f"   ✅ {sec_uid}")
        else:
            results[user_id] = None
            print(f"   ❌ 解析失败")
        
        # 避免请求过快
        await asyncio.sleep(1)
    
    print(f"\n{'='*60}")
    print(f"批量测试完成")
    print(f"{'='*60}")
    print(f"成功: {sum(1 for v in results.values() if v)} / {len(user_ids)}")
    print(f"失败: {sum(1 for v in results.values() if not v)} / {len(user_ids)}")
    
    return results


async def main():
    """主测试函数"""
    print("\n🚀 抖音 sec_uid 解析器测试")
    
    # 测试用户提供的 ID
    test_id = "728019754"
    await test_single_id(test_id)
    
    # 可选：测试更多 ID
    print("\n\n是否要测试更多 ID？")
    print("1. 测试已知的 ID: 12188823")
    print("2. 批量测试多个 ID")
    print("3. 退出")
    
    # 自动测试已知 ID
    print("\n自动测试已知 ID: 12188823")
    await test_single_id("12188823")


if __name__ == "__main__":
    asyncio.run(main())
