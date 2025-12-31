"""
视频号数据采集 API 路由
"""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

from .services import get_wechat_channels_service


router = APIRouter(prefix="/wechat-channels", tags=["视频号数据采集"])


class FetchVideosRequest(BaseModel):
    """抓取视频列表请求"""
    account_cookie_file: str = Field(..., description="Cookie 文件名（在 cookiesFile 目录下）")
    max_pages: int = Field(3, ge=1, le=10, description="最多抓取页数")
    use_ai_enhance: bool = Field(False, description="是否使用 AI 增强数据")


class FetchVideoDetailRequest(BaseModel):
    """抓取视频详情请求"""
    video_url: str = Field(..., description="视频 URL")
    account_cookie_file: str = Field(..., description="Cookie 文件名")


class ParseVideoRequest(BaseModel):
    """AI 解析视频请求"""
    raw_html: str = Field(..., description="视频项的原始 HTML")


@router.post("/fetch-videos")
async def fetch_account_videos(request: FetchVideosRequest):
    """
    抓取视频号账号的视频列表

    - **account_cookie_file**: Cookie 文件名（例如：wechat_channels_account1.json）
    - **max_pages**: 最多抓取多少页（默认 3 页）
    - **use_ai_enhance**: 是否使用 DeepSeek AI 增强数据（默认 False）

    返回示例：
    ```json
    {
        "success": true,
        "data": {
            "videos": [
                {
                    "title": "视频标题",
                    "cover_url": "封面URL",
                    "stats": "播放量/点赞数等统计",
                    "crawled_at": "2025-12-31T12:00:00"
                }
            ],
            "total": 15,
            "crawled_at": "2025-12-31T12:00:00",
            "ai_enhanced": false
        },
        "platform": "wechat_channels"
    }
    ```
    """
    service = get_wechat_channels_service()

    result = await service.fetch_account_videos(
        account_cookie_file=request.account_cookie_file,
        max_pages=request.max_pages,
        use_ai_enhance=request.use_ai_enhance
    )

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result.get("error", "抓取失败"))

    return result


@router.post("/fetch-video-detail")
async def fetch_video_detail(request: FetchVideoDetailRequest):
    """
    抓取单个视频详情

    - **video_url**: 视频详情页 URL
    - **account_cookie_file**: Cookie 文件名

    返回示例：
    ```json
    {
        "success": true,
        "data": {
            "title": "视频标题",
            "description": "视频描述",
            "play_count": 12345,
            "like_count": 678,
            "comment_count": 90
        },
        "platform": "wechat_channels"
    }
    ```
    """
    service = get_wechat_channels_service()

    result = await service.fetch_video_detail(
        video_url=request.video_url,
        account_cookie_file=request.account_cookie_file
    )

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result.get("error", "抓取失败"))

    return result


@router.post("/parse-video-html")
async def parse_video_html(request: ParseVideoRequest):
    """
    使用 DeepSeek AI 解析视频原始 HTML

    - **raw_html**: 视频项的原始 HTML 代码

    返回示例：
    ```json
    {
        "success": true,
        "data": {
            "title": "视频标题",
            "description": "视频描述",
            "cover_url": "封面URL",
            "play_count": "播放量",
            "like_count": "点赞数",
            "comment_count": "评论数",
            "publish_time": "发布时间"
        }
    }
    ```
    """
    service = get_wechat_channels_service()

    result = await service.parse_video_with_ai(raw_html=request.raw_html)

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result.get("error", "解析失败"))

    return result


@router.get("/accounts")
async def list_accounts():
    """
    获取所有可用的视频号账号列表

    返回示例：
    ```json
    [
        {
            "cookie_file": "wechat_channels_account1.json",
            "account_name": "账号名称",
            "status": "valid",
            "last_updated": "2025-12-31T12:00:00"
        }
    ]
    ```
    """
    service = get_wechat_channels_service()
    accounts = service.list_available_accounts()
    return accounts


@router.get("/health")
async def health_check():
    """
    健康检查接口

    返回示例：
    ```json
    {
        "status": "ok",
        "service": "wechat_channels",
        "version": "1.0.0"
    }
    ```
    """
    return {
        "status": "ok",
        "service": "wechat_channels",
        "version": "1.0.0"
    }
