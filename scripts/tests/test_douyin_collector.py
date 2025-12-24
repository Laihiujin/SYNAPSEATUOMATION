"""
测试抖音数据采集功能
"""
import asyncio
import sys
import os
from pathlib import Path

# 设置输出编码
if sys.platform == "win32":
    os.system("chcp 65001 >nul")
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# 添加项目根目录到路径
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "syn_backend"))

async def main():
    print("=" * 60)
    print("抖音数据采集测试")
    print("=" * 60)

    try:
        # 1. 导入采集器
        print("\n[1/4] 导入 VideoDataCollector...")
        from myUtils.video_collector import collector
        print("✅ 采集器导入成功")

        # 2. 获取账号列表
        print("\n[2/4] 获取抖音账号列表...")
        from myUtils.cookie_manager import cookie_manager
        accounts = cookie_manager.list_flat_accounts()

        douyin_accounts = [
            acc for acc in accounts
            if acc.get("platform") == "douyin" and acc.get("status") == "valid"
        ]

        if not douyin_accounts:
            print("❌ 未找到有效的抖音账号")
            print("\n可用账号列表:")
            for acc in accounts:
                print(f"  - {acc.get('name')} ({acc.get('platform')}) - {acc.get('status')}")
            return

        print(f"✅ 找到 {len(douyin_accounts)} 个有效抖音账号:")
        for acc in douyin_accounts:
            print(f"  - {acc.get('name')} (ID: {acc.get('account_id')})")

        # 3. 选择第一个账号进行测试
        test_account = douyin_accounts[0]
        print(f"\n[3/4] 测试账号: {test_account.get('name')}")
        print(f"  - account_id: {test_account.get('account_id')}")
        print(f"  - cookie_file: {test_account.get('cookie_file')}")
        print(f"  - user_id: {test_account.get('user_id')}")

        # 4. 执行采集
        print(f"\n[4/4] 开始采集抖音数据...")
        print("-" * 60)

        result = await collector.collect_douyin_data(
            cookie_file=test_account.get('cookie_file'),
            account_id=test_account.get('account_id')
        )

        print("-" * 60)
        print("\n采集结果:")
        print(f"  - 成功: {result.get('success')}")
        print(f"  - 视频数量: {result.get('count', 0)}")

        if result.get('success'):
            print(f"  ✅ 采集成功!")
            videos = result.get('videos', [])
            if videos:
                print(f"\n前 5 个视频:")
                for i, video in enumerate(videos[:5], 1):
                    print(f"    {i}. {video.get('title', '无标题')[:30]}")
                    print(f"       ID: {video.get('video_id', 'N/A')}")
                    print(f"       播放: {video.get('views', 0)}, 点赞: {video.get('likes', 0)}")
        else:
            print(f"  ❌ 采集失败: {result.get('error', '未知错误')}")

        # 5. 检查数据库
        print("\n" + "=" * 60)
        print("数据库验证")
        print("=" * 60)

        import sqlite3
        from fastapi_app.core.config import settings
        db_path = Path(settings.DATABASE_PATH)

        with sqlite3.connect(db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT COUNT(*) FROM video_analytics
                WHERE platform = 'douyin' AND account_id = ?
                """,
                (test_account.get('account_id'),)
            )
            count = cursor.fetchone()[0]
            print(f"✅ 数据库中该账号的抖音视频记录: {count} 条")

            # 显示最新的 3 条记录
            cursor.execute(
                """
                SELECT video_id, title, play_count, like_count, collected_at
                FROM video_analytics
                WHERE platform = 'douyin' AND account_id = ?
                ORDER BY collected_at DESC
                LIMIT 3
                """,
                (test_account.get('account_id'),)
            )
            rows = cursor.fetchall()
            if rows:
                print("\n最新采集的 3 条记录:")
                for row in rows:
                    print(f"  - {row[1][:40]}")
                    print(f"    ID: {row[0]}, 播放: {row[2]}, 点赞: {row[3]}")
                    print(f"    采集时间: {row[4]}")

        print("\n" + "=" * 60)
        print("测试完成")
        print("=" * 60)

    except Exception as e:
        print(f"\n❌ 测试过程中出错:")
        print(f"  {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

    asyncio.run(main())
