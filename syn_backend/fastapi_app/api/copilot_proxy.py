"""
兼容 social-media-copilot 的 /cookies 与 /request 接口，统一走后端 7000 端口。
"""
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from fastapi_app.services.social_media_copilot import get_social_media_copilot_client


class CopilotCookieItem(BaseModel):
    domain: Optional[str] = None
    name: Optional[str] = None
    value: str
    path: Optional[str] = "/"
    expirationDate: Optional[int] = None
    httpOnly: Optional[bool] = None
    secure: Optional[bool] = None
    sameSite: Optional[str] = None
    storeId: Optional[str] = None
    partitionKey: Optional[Dict[str, Any]] = None


class CopilotCookieRequest(BaseModel):
    url: str = Field(..., description="与 Cookie 关联的 URL")
    cookies: List[CopilotCookieItem]


class CopilotRawRequest(BaseModel):
    url: str = Field(..., description="请求地址")
    method: str = Field("GET", description="HTTP 方法，默认 GET")
    params: Optional[Dict[str, Any]] = None
    data: Optional[Any] = None
    headers: Optional[Dict[str, Any]] = None


router = APIRouter()


@router.post("/cookies", tags=["copilot-proxy"])
async def proxy_cookies(payload: CopilotCookieRequest):
    """
    兼容 copilot 的 /cookies，转发到插件端。
    """
    client = get_social_media_copilot_client()
    cookies = [item.model_dump(exclude_none=True) for item in payload.cookies]
    result = await client.set_cookies(payload.url, cookies)

    if result.get("success"):
        return {"success": True, "data": result.get("data"), "message": "Cookie 设置成功"}
    raise HTTPException(
        status_code=result.get("status_code", 500),
        detail=result.get("error", "Cookie 写入失败"),
    )


@router.post("/request", tags=["copilot-proxy"])
async def proxy_request(payload: CopilotRawRequest):
    """
    兼容 copilot 的 /request，转发到插件端。
    """
    client = get_social_media_copilot_client()
    config = payload.model_dump(exclude_none=True)
    config["method"] = config.get("method", "GET").upper()
    result = await client.proxy_request(config)

    if result.get("success"):
        return {"success": True, "data": result.get("data"), "message": "请求代理成功"}
    raise HTTPException(
        status_code=result.get("status_code", 500),
        detail=result.get("error", "请求代理失败"),
    )
