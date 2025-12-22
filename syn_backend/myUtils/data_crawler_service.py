"""
数据抓取服务
集成 TkDataRecycle 项目的抓取能力
支持抖音、快手、小红书、B站等平台的数据抓取
"""
import httpx
from typing import Dict, List, Optional, Any
from loguru import logger


class DataCrawlerService:
    """数据抓取服务"""

    def __init__(self, tk_api_base_url: str = "http://localhost:7000"):
        """
        初始化数据抓取服务

        Args:
            tk_api_base_url: TkDataRecycle API 基础URL
        """
        self.tk_api_base_url = tk_api_base_url
        self.client = httpx.AsyncClient(timeout=30.0)

    async def close(self):
        """关闭HTTP客户端"""
        await self.client.aclose()

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()

    # ==================== 抖音数据抓取 ====================

    async def fetch_douyin_video(self, aweme_id: str) -> Dict[str, Any]:
        """
        获取抖音视频详情

        Args:
            aweme_id: 抖音视频ID

        Returns:
            视频详细信息
        """
        try:
            url = f"{self.tk_api_base_url}/api/douyin/fetch_one_video"
            response = await self.client.get(url, params={"aweme_id": aweme_id})
            response.raise_for_status()
            data = response.json()

            if data.get("code") == 200:
                return {
                    "success": True,
                    "data": data.get("data"),
                    "platform": "douyin"
                }
            else:
                logger.error(f"抖音视频抓取失败: {data}")
                return {
                    "success": False,
                    "error": "API返回错误",
                    "platform": "douyin"
                }

        except Exception as e:
            logger.error(f"抖音视频抓取异常: {e}")
            return {
                "success": False,
                "error": str(e),
                "platform": "douyin"
            }

    async def fetch_douyin_user_posts(
        self,
        sec_user_id: str,
        max_cursor: int = 0,
        count: int = 20
    ) -> Dict[str, Any]:
        """
        获取抖音用户发布的视频列表

        Args:
            sec_user_id: 用户ID
            max_cursor: 分页游标
            count: 每页数量

        Returns:
            视频列表
        """
        try:
            url = f"{self.tk_api_base_url}/api/douyin/fetch_user_post_videos"
            response = await self.client.get(
                url,
                params={
                    "sec_user_id": sec_user_id,
                    "max_cursor": max_cursor,
                    "count": count
                }
            )
            response.raise_for_status()
            data = response.json()

            if data.get("code") == 200:
                return {
                    "success": True,
                    "data": data.get("data"),
                    "platform": "douyin"
                }
            else:
                return {
                    "success": False,
                    "error": "API返回错误",
                    "platform": "douyin"
                }

        except Exception as e:
            logger.error(f"抖音用户视频抓取异常: {e}")
            return {
                "success": False,
                "error": str(e),
                "platform": "douyin"
            }

    async def fetch_douyin_video_comments(
        self,
        aweme_id: str,
        cursor: int = 0,
        count: int = 20
    ) -> Dict[str, Any]:
        """
        获取抖音视频评论

        Args:
            aweme_id: 视频ID
            cursor: 分页游标
            count: 每页数量

        Returns:
            评论列表
        """
        try:
            url = f"{self.tk_api_base_url}/api/douyin/fetch_video_comments"
            response = await self.client.get(
                url,
                params={
                    "aweme_id": aweme_id,
                    "cursor": cursor,
                    "count": count
                }
            )
            response.raise_for_status()
            data = response.json()

            if data.get("code") == 200:
                return {
                    "success": True,
                    "data": data.get("data"),
                    "platform": "douyin"
                }
            else:
                return {
                    "success": False,
                    "error": "API返回错误",
                    "platform": "douyin"
                }

        except Exception as e:
            logger.error(f"抖音评论抓取异常: {e}")
            return {
                "success": False,
                "error": str(e),
                "platform": "douyin"
            }

    async def fetch_douyin_hot_search(self) -> Dict[str, Any]:
        """
        获取抖音热榜

        Returns:
            热榜数据
        """
        try:
            url = f"{self.tk_api_base_url}/api/douyin/fetch_hot_search"
            response = await self.client.get(url)
            response.raise_for_status()
            data = response.json()

            if data.get("code") == 200:
                return {
                    "success": True,
                    "data": data.get("data"),
                    "platform": "douyin"
                }
            else:
                return {
                    "success": False,
                    "error": "API返回错误",
                    "platform": "douyin"
                }

        except Exception as e:
            logger.error(f"抖音热榜抓取异常: {e}")
            return {
                "success": False,
                "error": str(e),
                "platform": "douyin"
            }

    # ==================== B站数据抓取 ====================

    async def fetch_bilibili_video(self, bvid: str) -> Dict[str, Any]:
        """
        获取B站视频详情

        Args:
            bvid: B站视频BVID

        Returns:
            视频详细信息
        """
        try:
            url = f"{self.tk_api_base_url}/api/bilibili/fetch_one_video"
            response = await self.client.get(url, params={"bvid": bvid})
            response.raise_for_status()
            data = response.json()

            if data.get("code") == 200:
                return {
                    "success": True,
                    "data": data.get("data"),
                    "platform": "bilibili"
                }
            else:
                return {
                    "success": False,
                    "error": "API返回错误",
                    "platform": "bilibili"
                }

        except Exception as e:
            logger.error(f"B站视频抓取异常: {e}")
            return {
                "success": False,
                "error": str(e),
                "platform": "bilibili"
            }

    # ==================== 通用数据抓取 ====================

    async def fetch_video_by_url(self, video_url: str) -> Dict[str, Any]:
        """
        根据URL抓取视频信息（支持多平台）

        Args:
            video_url: 视频URL

        Returns:
            视频信息
        """
        try:
            # 识别平台
            platform = self._detect_platform(video_url)

            if platform == "douyin":
                # 从URL提取aweme_id
                aweme_id = self._extract_douyin_id(video_url)
                return await self.fetch_douyin_video(aweme_id)

            elif platform == "bilibili":
                # 从URL提取bvid
                bvid = self._extract_bilibili_id(video_url)
                return await self.fetch_bilibili_video(bvid)

            else:
                return {
                    "success": False,
                    "error": f"不支持的平台: {platform}",
                    "platform": "unknown"
                }

        except Exception as e:
            logger.error(f"URL视频抓取异常: {e}")
            return {
                "success": False,
                "error": str(e),
                "platform": "unknown"
            }

    def _detect_platform(self, url: str) -> str:
        """检测平台类型"""
        if "douyin.com" in url or "iesdouyin.com" in url:
            return "douyin"
        elif "bilibili.com" in url:
            return "bilibili"
        elif "xiaohongshu.com" in url or "xhslink.com" in url:
            return "xiaohongshu"
        elif "kuaishou.com" in url:
            return "kuaishou"
        else:
            return "unknown"

    def _extract_douyin_id(self, url: str) -> str:
        """从抖音URL提取视频ID"""
        # 简化实现，实际需要更复杂的解析
        import re
        match = re.search(r'/video/(\d+)', url)
        if match:
            return match.group(1)
        # 尝试其他格式
        match = re.search(r'aweme_id=(\d+)', url)
        if match:
            return match.group(1)
        raise ValueError("无法从URL提取视频ID")

    def _extract_bilibili_id(self, url: str) -> str:
        """从B站URL提取视频ID"""
        import re
        match = re.search(r'BV[a-zA-Z0-9]+', url)
        if match:
            return match.group(0)
        raise ValueError("无法从URL提取视频ID")


# 全局实例
_data_crawler_service = None


def get_data_crawler_service() -> DataCrawlerService:
    """获取数据抓取服务实例"""
    global _data_crawler_service
    if _data_crawler_service is None:
        _data_crawler_service = DataCrawlerService()
    return _data_crawler_service
