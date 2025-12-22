"""测试OpenManus Agent工具"""
import asyncio
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))

from fastapi_app.agent.manus_tools import ListAssetsTool


async def test_list_assets():
    """测试list_assets工具"""
    print("=" * 60)
    print("测试 ListAssetsTool")
    print("=" * 60)

    tool = ListAssetsTool()

    # 测试1: 列出最新10个视频
    print("\n[测试1] 列出最新10个视频:")
    result = await tool.execute(limit=10)

    if result.error:
        print(f"[ERROR] {result.error}")
    else:
        print(f"[SUCCESS]")
        print(result.output)

    # 测试2: 只列出pending状态的视频
    print("\n[Test 2] List pending videos:")
    result = await tool.execute(limit=10, status="pending")

    if result.error:
        print(f"[ERROR] {result.error}")
    else:
        print(f"[SUCCESS]")
        print(result.output)


if __name__ == "__main__":
    asyncio.run(test_list_assets())
