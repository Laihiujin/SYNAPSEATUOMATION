"""
账号管理API路由
"""
from fastapi import APIRouter, HTTPException, status, Depends
from typing import Optional
import json
from pathlib import Path

from ....schemas.account import (
    AccountResponse,
    AccountListResponse,
    AccountCreate,
    AccountUpdate,
    AccountStatsResponse,
    DeepSyncResponse,
    AccountFilterRequest
)
from ....schemas.common import Response, StatusResponse
from .services import account_service
from ....core.logger import logger
from ....core.exceptions import NotFoundException, BadRequestException
from .tools import router as tools_router
from myUtils.cookie_manager import cookie_manager
from platforms.path_utils import resolve_cookie_file


router = APIRouter(tags=["账号管理"])

# 包含工具路由
router.include_router(tools_router)


@router.get("", response_model=AccountListResponse, include_in_schema=False)
@router.get("/", response_model=AccountListResponse)
async def list_accounts(
    platform: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
):
    """
    获取账号列表

    - **platform**: 平台过滤（xiaohongshu/channels/douyin/kuaishou/bilibili）
    - **status**: 状态过滤（valid/expired/error/file_missing）
    - **skip**: 跳过数量
    - **limit**: 限制数量（最大1000）
    """
    try:
        result = await account_service.list_accounts(platform, status, skip, limit)
        return AccountListResponse(
            success=True,
            total=result["total"],
            items=result["items"]
        )
    except Exception as e:
        logger.error(f"获取账号列表失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{account_id}", response_model=Response[AccountResponse])
async def get_account(account_id: str):
    """
    获取账号详情

    - **account_id**: 账号ID
    """
    try:
        account = await account_service.get_account(account_id)
        return Response(success=True, data=account)
    except NotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"获取账号详情失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{account_id}/creator-center/open", response_model=Response[dict])
async def open_creator_center(account_id: str):
    """
    打开该账号对应平台的创作中心（使用该账号 cookie 登录态）。

    说明：会在运行 Worker 的机器上打开浏览器窗口（需要 `scripts/launchers/start_worker.bat` 已启动）。
    """
    try:
        account = cookie_manager.get_account_by_id(account_id)
        if not account:
            raise NotFoundException(f"账号不存在: {account_id}")

        platform = (account.get("platform") or "").strip().lower()
        cookie_file = account.get("cookie_file") or account.get("cookieFile")
        if not cookie_file:
            raise BadRequestException("该账号缺少 cookie_file，无法打开创作中心")

        cookie_path = resolve_cookie_file(cookie_file)
        p = Path(cookie_path)
        if not p.exists():
            raise BadRequestException(f"Cookie 文件不存在: {cookie_path}")

        storage_state = json.loads(p.read_text(encoding="utf-8"))

        from playwright_worker.client import get_worker_client
        client = get_worker_client()
        data = await client.open_creator_center(platform=platform, storage_state=storage_state, headless=False)
        return Response(success=True, data=data)

    except NotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except BadRequestException as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"打开创作中心失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", response_model=StatusResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
@router.post("/", response_model=StatusResponse, status_code=status.HTTP_201_CREATED)
async def create_account(account_data: AccountCreate):
    """
    创建账号

    需要提供完整的账号信息和Cookie数据
    """
    try:
        result = await account_service.create_account(account_data.dict())
        return StatusResponse(**result)
    except BadRequestException as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"创建账号失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{account_id}", response_model=StatusResponse)
async def update_account(account_id: str, update_data: AccountUpdate):
    """
    更新账号信息

    - **account_id**: 账号ID
    - 可更新字段: name, note, status, avatar, original_name
    """
    try:
        # 只包含非None的字段
        data = update_data.dict(exclude_unset=True)
        result = await account_service.update_account(account_id, data)
        return StatusResponse(**result)
    except NotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except BadRequestException as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"更新账号失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{account_id}", response_model=StatusResponse)
async def delete_account(account_id: str):
    """
    删除账号

    - **account_id**: 账号ID
    - 会同时删除Cookie文件
    """
    try:
        result = await account_service.delete_account(account_id)
        return StatusResponse(**result)
    except NotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"删除账号失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))





# DISABLED: deep-sync 会导致账号数据混乱，已禁用
# @router.post("/deep-sync", response_model=DeepSyncResponse)
# async def deep_sync_accounts():
#     """
#     深度同步账号
#
#     - 备份现有Cookie文件
#     - 扫描磁盘文件，添加未入库的账号
#     - 标记文件丢失的账号
#     - 清理超过7天的备份
#     """
#     try:
#         result = await account_service.deep_sync()
#         return DeepSyncResponse(**result)
#     except Exception as e:
#         logger.error(f"深度同步失败: {e}")
#         raise HTTPException(status_code=500, detail=str(e))


@router.delete("/invalid", response_model=StatusResponse)
async def delete_invalid_accounts():
    """
    删除所有失效账号

    - 删除状态不为'valid'的账号
    - 同时删除对应的Cookie文件
    """
    try:
        result = await account_service.delete_invalid_accounts()
        return StatusResponse(**result)
    except Exception as e:
        logger.error(f"删除失效账号失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats/summary", response_model=Response[AccountStatsResponse])
async def get_account_stats():
    """
    获取账号统计信息

    - 总数、各状态数量
    - 按平台分组统计
    """
    try:
        stats = await account_service.get_stats()
        return Response(success=True, data=stats)
    except Exception as e:
        logger.error(f"获取统计失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/filter", response_model=AccountListResponse)
async def filter_accounts(filter_req: AccountFilterRequest):
    """
    高级筛选账号

    - 支持多条件组合筛选
    - 支持分页
    """
    try:
        result = await account_service.list_accounts(
            platform=filter_req.platform,
            status=filter_req.status,
            skip=filter_req.skip,
            limit=filter_req.limit
        )
        return AccountListResponse(
            success=True,
            total=result["total"],
            items=result["items"]
        )
    except Exception as e:
        logger.error(f"筛选账号失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# DISABLED: sync-user-info 功能暂时关闭（等待优化）
# @router.post("/sync-user-info", response_model=Response[dict])
# async def sync_user_info():
#     """
#     同步所有账号的用户信息
#
#     - 通过访问平台页面抓取最新的用户名、头像、ID
#     - 更新cookie文件和数据库
#     - 支持平台: 快手、抖音、视频号、小红书、B站
#     """
#     try:
#         result = await account_service.sync_user_info()
#         return Response(success=True, data=result)
#     except Exception as e:
#         logger.error(f"同步用户信息失败: {e}")
#         raise HTTPException(status_code=500, detail=str(e))

