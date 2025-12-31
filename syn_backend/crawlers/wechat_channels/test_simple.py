"""
视频号数据采集测试脚本（简化版）
测试基础爬取功能，不使用 AI
"""
import asyncio
import sys
from pathlib import Path

# 添加项目路径
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from crawlers.wechat_channels.channels_crawler import WechatChannelsCrawler
from crawlers.wechat_channels.storage import get_wechat_channels_storage
from loguru import logger


async def test_crawl_single_page():
    """测试爬取单页数据"""
    logger.info("=" * 60)
    logger.info("🚀 视频号数据采集测试")
    logger.info("=" * 60)
    logger.info("")

    # 查找视频号 Cookie 文件
    import json
    from pathlib import Path
    cookies_dir = Path(__file__).parent.parent.parent / "cookiesFile"

    # 查找 channels_*.json 文件
    channels_cookies = list(cookies_dir.glob("channels_*.json"))

    if not channels_cookies:
        logger.error("❌ 未找到视频号 Cookie 文件")
        logger.info("支持的文件名格式: channels_<account_id>.json")
        return None

    # 显示所有可用账号
    logger.info(f"📋 找到 {len(channels_cookies)} 个视频号账号：")
    logger.info("")

    account_list = []
    for i, cookie_file in enumerate(channels_cookies, 1):
        try:
            with open(cookie_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                user_info = data.get("user_info", {})
                account_name = user_info.get("name", "未知")
                account_id = user_info.get("user_id", cookie_file.stem)

                # 如果 user_info 为空，从 cookies 中获取 wxuin
                if not user_info:
                    cookies_list = data.get("cookies", [])
                    for cookie in cookies_list:
                        if cookie.get("name") == "wxuin":
                            account_id = cookie.get("value", account_id)
                            break

                account_list.append({
                    "file": cookie_file.name,
                    "name": account_name,
                    "id": account_id
                })

                logger.info(f"  {i}. 📁 {cookie_file.name}")
                logger.info(f"     👤 {account_name} (ID: {account_id})")
                logger.info("")
        except Exception as e:
            logger.warning(f"读取 {cookie_file.name} 失败: {e}")

    # 使用第一个账号（默认）
    if account_list:
        selected_account = account_list[0]
        cookie_file = selected_account["file"]

        logger.info("=" * 60)
        logger.info(f"✅ 使用账号: {selected_account['name']} (ID: {selected_account['id']})")
        logger.info(f"📁 Cookie 文件: {cookie_file}")
        logger.info("🌐 正在访问视频号创作者平台...")
        logger.info("")

    try:
        crawler = WechatChannelsCrawler()
        result = await crawler.start(
            account_cookie_file=cookie_file,
            max_pages=1  # 只抓取第一页
        )

        if result["success"]:
            data = result["data"]
            logger.success("✅ 爬取成功！\n")

            logger.info("=" * 60)
            logger.info("账号信息")
            logger.info("=" * 60)
            logger.info(f"账号ID: {data.get('account_id', 'N/A')}")
            logger.info(f"账号名称: {data.get('account_name', 'N/A')}")
            logger.info(f"视频数量: {data.get('total', 0)}")
            logger.info(f"抓取时间: {data.get('crawled_at', 'N/A')}")
            logger.info("")

            videos = data.get("videos", [])
            if videos:
                logger.info("=" * 60)
                logger.info(f"视频列表（共 {len(videos)} 个）")
                logger.info("=" * 60)

                for i, video in enumerate(videos[:5], 1):  # 只显示前 5 个
                    logger.info(f"\n📹 视频 {i}:")
                    logger.info(f"  标题: {video.get('title', 'N/A')}")
                    logger.info(f"  封面: {video.get('cover_url', 'N/A')[:60]}...")
                    logger.info(f"  统计: {video.get('stats', 'N/A')}")
                    logger.info(f"  链接: {video.get('video_url', 'N/A')}")
                    logger.info(f"  ID: {video.get('video_id', 'N/A')}")

                if len(videos) > 5:
                    logger.info(f"\n... 还有 {len(videos) - 5} 个视频未显示")

            logger.info("\n" + "=" * 60)
            logger.success("🎉 测试完成！")
            logger.info("=" * 60)

            return result

        else:
            logger.error(f"\n❌ 爬取失败: {result.get('error')}")
            logger.info("\n可能的原因:")
            logger.info("  1. Cookie 已过期，请重新获取")
            logger.info("  2. 网络连接问题")
            logger.info("  3. 视频号平台 HTML 结构发生变化")
            return None

    except Exception as e:
        logger.error(f"\n❌ 测试异常: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return None


async def test_save_to_database(result):
    """测试保存到数据库"""
    if not result or not result.get("success"):
        logger.warning("跳过数据库测试（因为爬取失败）")
        return

    logger.info("\n" + "=" * 60)
    logger.info("💾 测试数据库存储")
    logger.info("=" * 60)

    try:
        storage = get_wechat_channels_storage()
        data = result["data"]
        videos = data.get("videos", [])

        if not videos:
            logger.warning("没有视频数据，跳过存储")
            return

        # 为视频添加 account_id
        account_id = data.get("account_id")
        for video in videos:
            video["account_id"] = account_id

        # 保存到数据库
        saved_count = storage.save_videos_batch(videos)
        logger.success(f"✅ 已保存 {saved_count}/{len(videos)} 个视频到数据库")

        # 从数据库读取验证
        db_videos = storage.get_videos_by_account(account_id, limit=3)
        logger.info(f"✅ 从数据库读取了 {len(db_videos)} 个视频（验证成功）")

        if db_videos:
            logger.info("\n最新的 3 个视频:")
            for i, video in enumerate(db_videos, 1):
                logger.info(f"  {i}. {video.get('title', 'N/A')}")

    except Exception as e:
        logger.error(f"❌ 数据库测试失败: {e}")
        import traceback
        logger.error(traceback.format_exc())


async def main():
    """主测试流程"""
    logger.info("\n")
    logger.info("╔" + "=" * 58 + "╗")
    logger.info("║" + " " * 15 + "视频号数据采集功能测试" + " " * 15 + "║")
    logger.info("╚" + "=" * 58 + "╝")
    logger.info("\n")

    # 测试 1: 爬取数据
    result = await test_crawl_single_page()

    # 测试 2: 保存到数据库
    if result:
        await test_save_to_database(result)

    logger.info("\n" + "=" * 60)
    logger.info("提示:")
    logger.info("  - 如果爬取失败，请检查 Cookie 是否过期")
    logger.info("  - 可以访问 FastAPI 文档测试 API: http://localhost:7000/api/docs")
    logger.info("  - 搜索 'wechat-channels' 可以找到相关接口")
    logger.info("=" * 60)
    logger.info("")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.warning("\n⚠️  测试被用户中断")
    except Exception as e:
        logger.error(f"\n❌ 测试失败: {e}")
        import traceback
        logger.error(traceback.format_exc())
