"""
视频号数据采集服务
"""
from typing import Dict, Any, Optional, List
from loguru import logger
from pathlib import Path

from crawlers.wechat_channels.channels_crawler import WechatChannelsCrawler
from crawlers.wechat_channels.deepseek_client import DeepSeekClient
from crawlers.wechat_channels.storage import get_wechat_channels_storage


class WechatChannelsService:
    """视频号数据采集服务"""

    def __init__(self):
        self._base_dir = Path(__file__).resolve().parent.parent.parent.parent
        self._cookies_dir = self._base_dir / "cookiesFile"
        self.storage = get_wechat_channels_storage()

    async def fetch_account_videos(
        self,
        account_cookie_file: str,
        max_pages: int = 3,
        use_ai_enhance: bool = False,
        save_to_db: bool = True
    ) -> Dict[str, Any]:
        """
        抓取账号的视频列表

        Args:
            account_cookie_file: Cookie 文件名
            max_pages: 最多抓取多少页
            use_ai_enhance: 是否使用 AI 增强数据
            save_to_db: 是否保存到数据库

        Returns:
            抓取结果
        """
        task_id = None

        try:
            # 创建抓取任务记录
            if save_to_db:
                task_id = self.storage.create_crawl_task({
                    "account_id": account_cookie_file.replace(".json", ""),
                    "task_type": "fetch_videos",
                    "max_pages": max_pages,
                    "ai_enhanced": 1 if use_ai_enhance else 0
                })

            # 初始化爬虫
            crawler = WechatChannelsCrawler()
            result = await crawler.start(account_cookie_file)

            if not result["success"]:
                if save_to_db and task_id:
                    self.storage.update_crawl_task(
                        task_id,
                        status="failed",
                        error_message=result.get("error", "抓取失败")
                    )
                return result

            videos = result["data"]["videos"]

            # 如果启用 AI 增强
            if use_ai_enhance and videos:
                logger.info(f"🤖 使用 DeepSeek AI 增强视频元数据...")
                async with DeepSeekClient() as deepseek:
                    enhanced_videos = []
                    for video in videos:
                        if video.get("raw_html"):
                            # 解析原始 HTML
                            parsed = await deepseek.parse_video_content(video["raw_html"])
                            if parsed["success"]:
                                # 合并解析结果
                                video.update(parsed["data"])
                                video["ai_enhanced"] = 1
                        enhanced_videos.append(video)

                    result["data"]["videos"] = enhanced_videos
                    result["data"]["ai_enhanced"] = True

            # 保存到数据库
            if save_to_db:
                saved_count = self.storage.save_videos_batch(result["data"]["videos"])
                logger.info(f"💾 已保存 {saved_count} 个视频到数据库")
                result["data"]["saved_count"] = saved_count

                # 更新任务状态
                if task_id:
                    self.storage.update_crawl_task(
                        task_id,
                        status="completed",
                        videos_count=saved_count
                    )

            return result

        except Exception as e:
            logger.error(f"视频号数据采集失败: {e}")
            if save_to_db and task_id:
                self.storage.update_crawl_task(
                    task_id,
                    status="failed",
                    error_message=str(e)
                )
            return {
                "success": False,
                "error": str(e),
                "platform": "wechat_channels"
            }

    async def fetch_video_detail(
        self,
        video_url: str,
        account_cookie_file: str
    ) -> Dict[str, Any]:
        """
        抓取单个视频详情

        Args:
            video_url: 视频 URL
            account_cookie_file: Cookie 文件名

        Returns:
            视频详情
        """
        try:
            crawler = WechatChannelsCrawler()
            result = await crawler.fetch_video_detail(video_url)
            return result

        except Exception as e:
            logger.error(f"视频详情抓取失败: {e}")
            return {
                "success": False,
                "error": str(e),
                "platform": "wechat_channels"
            }

    async def parse_video_with_ai(
        self,
        raw_html: str
    ) -> Dict[str, Any]:
        """
        使用 AI 解析视频 HTML

        Args:
            raw_html: 原始 HTML

        Returns:
            解析结果
        """
        try:
            async with DeepSeekClient() as deepseek:
                result = await deepseek.parse_video_content(raw_html)
                return result

        except Exception as e:
            logger.error(f"AI 解析失败: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    def list_available_accounts(self) -> List[Dict[str, Any]]:
        """
        列出所有可用的视频号账号

        Returns:
            账号列表
        """
        try:
            accounts = []

            # 查找两种格式的 Cookie 文件
            # 1. tencent_account_*.json（新格式）
            for cookie_file in self._cookies_dir.glob("tencent_account_*.json"):
                try:
                    import json
                    with cookie_file.open("r", encoding="utf-8") as fp:
                        data = json.load(fp)
                        user_info = data.get("user_info", {})
                        accounts.append({
                            "cookie_file": cookie_file.name,
                            "account_id": user_info.get("user_id", "unknown"),
                            "account_name": user_info.get("name", "未命名"),
                            "format": "tencent_account",
                            "status": "valid",
                            "last_updated": cookie_file.stat().st_mtime
                        })
                except Exception as e:
                    logger.warning(f"读取 Cookie 文件失败 {cookie_file.name}: {e}")

            # 2. channels_*.json（旧格式）
            for cookie_file in self._cookies_dir.glob("channels_*.json"):
                try:
                    import json
                    with cookie_file.open("r", encoding="utf-8") as fp:
                        data = json.load(fp)
                        user_info = data.get("user_info", {})
                        accounts.append({
                            "cookie_file": cookie_file.name,
                            "account_id": user_info.get("user_id", "unknown"),
                            "account_name": user_info.get("name", data.get("account_name", "未命名")),
                            "format": "channels",
                            "status": data.get("status", "unknown"),
                            "last_updated": data.get("last_updated", "")
                        })
                except Exception as e:
                    logger.warning(f"读取 Cookie 文件失败 {cookie_file.name}: {e}")

            return accounts

        except Exception as e:
            logger.error(f"获取账号列表失败: {e}")
            return []


# 全局服务实例
_wechat_channels_service: Optional[WechatChannelsService] = None


def get_wechat_channels_service() -> WechatChannelsService:
    """获取视频号服务单例"""
    global _wechat_channels_service
    if _wechat_channels_service is None:
        _wechat_channels_service = WechatChannelsService()
    return _wechat_channels_service
