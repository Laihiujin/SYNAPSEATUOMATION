"""
视频号数据采集测试脚本
测试完整的抓取流程
"""
import asyncio
import sys
from pathlib import Path

# 添加项目路径
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from crawlers.wechat_channels.channels_crawler import WechatChannelsCrawler
from crawlers.wechat_channels.storage import get_wechat_channels_storage
from loguru import logger


async def test_basic_crawl():
    """测试基础爬取功能（不使用 AI）"""
    logger.info("=" * 50)
    logger.info("测试 1: 基础爬取功能")
    logger.info("=" * 50)

    # 使用第一个 Cookie 文件
    cookie_file = "channels_sphjscpkHodFygw.json"

    crawler = WechatChannelsCrawler()
    result = await crawler.start(
        account_cookie_file=cookie_file,
        max_pages=1  # 只抓取第一页用于测试
    )

    if result["success"]:
        logger.success(f"✅ 基础爬取成功！")
        logger.info(f"账号ID: {result['data'].get('account_id')}")
        logger.info(f"账号名称: {result['data'].get('account_name')}")
        logger.info(f"视频数量: {result['data']['total']}")

        # 显示前 3 个视频
        videos = result["data"]["videos"]
        for i, video in enumerate(videos[:3], 1):
            logger.info(f"\n视频 {i}:")
            logger.info(f"  标题: {video.get('title', 'N/A')}")
            logger.info(f"  封面: {video.get('cover_url', 'N/A')[:50]}...")
            logger.info(f"  统计: {video.get('stats', 'N/A')}")
    else:
        logger.error(f"❌ 基础爬取失败: {result.get('error')}")

    return result


async def test_with_storage():
    """测试数据存储功能"""
    logger.info("\n" + "=" * 50)
    logger.info("测试 2: 数据存储功能")
    logger.info("=" * 50)

    cookie_file = "channels_sphjscpkHodFygw.json"

    # 初始化存储
    storage = get_wechat_channels_storage()

    # 创建抓取任务
    task_id = storage.create_crawl_task({
        "account_id": "sphjscpkHodFygw",
        "task_type": "fetch_videos",
        "max_pages": 1
    })
    logger.info(f"✅ 创建抓取任务，ID: {task_id}")

    # 执行爬取
    crawler = WechatChannelsCrawler()
    result = await crawler.start(cookie_file, max_pages=1)

    if result["success"]:
        videos = result["data"]["videos"]

        # 为视频添加 account_id
        for video in videos:
            video["account_id"] = result["data"].get("account_id")

        # 保存到数据库
        saved_count = storage.save_videos_batch(videos)
        logger.success(f"✅ 已保存 {saved_count} 个视频到数据库")

        # 更新任务状态
        storage.update_crawl_task(task_id, status="completed", videos_count=saved_count)
        logger.success(f"✅ 任务状态已更新")

        # 从数据库读取
        db_videos = storage.get_videos_by_account("sphjscpkHodFygw", limit=5)
        logger.info(f"📚 从数据库读取了 {len(db_videos)} 个视频")

    else:
        storage.update_crawl_task(
            task_id,
            status="failed",
            error_message=result.get("error", "未知错误")
        )
        logger.error(f"❌ 爬取失败: {result.get('error')}")


async def test_api_endpoint():
    """测试 API 接口"""
    logger.info("\n" + "=" * 50)
    logger.info("测试 3: API 接口调用")
    logger.info("=" * 50)

    try:
        import httpx

        async with httpx.AsyncClient(timeout=120.0) as client:
            # 测试健康检查
            logger.info("🔍 测试健康检查接口...")
            response = await client.get("http://localhost:7000/api/v1/wechat-channels/health")
            logger.info(f"健康检查: {response.json()}")

            # 测试抓取接口
            logger.info("\n🔍 测试抓取接口...")
            response = await client.post(
                "http://localhost:7000/api/v1/wechat-channels/fetch-videos",
                json={
                    "account_cookie_file": "channels_sphjscpkHodFygw.json",
                    "max_pages": 1,
                    "use_ai_enhance": False
                }
            )

            if response.status_code == 200:
                data = response.json()
                if data["success"]:
                    logger.success(f"✅ API 调用成功！")
                    logger.info(f"视频数量: {data['data']['total']}")
                    logger.info(f"已保存: {data['data'].get('saved_count', 0)} 个")
                else:
                    logger.error(f"❌ API 返回错误: {data.get('error')}")
            else:
                logger.error(f"❌ HTTP 错误: {response.status_code}")
                logger.error(f"响应: {response.text}")

    except httpx.ConnectError:
        logger.warning("⚠️  FastAPI 服务未运行，跳过 API 测试")
        logger.info("提示: 请先运行 FastAPI 服务: python fastapi_app/main.py")
    except Exception as e:
        logger.error(f"❌ API 测试失败: {e}")


async def main():
    """主测试流程"""
    logger.info("🚀 开始视频号数据采集功能测试\n")

    # 测试 1: 基础爬取
    await test_basic_crawl()

    # 测试 2: 数据存储
    await test_with_storage()

    # 测试 3: API 接口（需要 FastAPI 服务运行）
    await test_api_endpoint()

    logger.info("\n" + "=" * 50)
    logger.success("🎉 所有测试完成！")
    logger.info("=" * 50)


if __name__ == "__main__":
    asyncio.run(main())
