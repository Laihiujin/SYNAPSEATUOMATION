"""
数据抓取路由
提供视频、用户、评论等数据的抓取接口
"""
from fastapi import APIRouter, Query, HTTPException
from datetime import datetime, timedelta
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field
from myUtils.campaign_manager import campaign_manager
from myUtils.data_crawler_service import get_data_crawler_service
from myUtils.cookie_manager import cookie_manager
from fastapi_app.services.social_media_copilot import get_social_media_copilot_client
from fastapi_app.core.config import settings
from pathlib import Path
import sqlite3
from fastapi_app.services.analytics_extract import extract_video_info
from myUtils.analytics_db import ensure_analytics_schema, upsert_video_analytics_by_key
import re
from urllib.parse import urlparse
import httpx

router = APIRouter(prefix="/data", tags=["data"])


def _extract_first_url(text: str) -> str:
    if not text:
        return ""
    m = re.search(r"https?://\\S+", text)
    if not m:
        return ""
    url = m.group(0).strip().rstrip(")】】>。,，")
    return url


def _parse_douyin_aweme_id_from_url(url: str) -> str:
    try:
        u = urlparse(url)
    except Exception:
        return ""

    # common patterns:
    # - https://www.douyin.com/video/<aweme_id>
    # - https://www.iesdouyin.com/share/video/<aweme_id>
    path = u.path or ""
    parts = [p for p in path.split("/") if p]
    for i, p in enumerate(parts):
        if p in {"video", "share"} and i + 1 < len(parts):
            cand = parts[i + 1]
            if cand.isdigit():
                return cand
        if p == "video" and i + 1 < len(parts) and parts[i + 1].isdigit():
            return parts[i + 1]
    # try any long digit segment in path
    for seg in parts:
        if seg.isdigit() and len(seg) >= 10:
            return seg
    # query param fallback
    qs = u.query or ""
    for key in ("aweme_id=", "item_id="):
        idx = qs.find(key)
        if idx >= 0:
            rest = qs[idx + len(key):]
            digits = ""
            for ch in rest:
                if ch.isdigit():
                    digits += ch
                else:
                    break
            if digits:
                return digits
    return ""


async def _resolve_douyin_aweme_id(value: str) -> str:
    """
    Accepts:
    - aweme_id digits
    - full video url
    - v.douyin.com short url
    - share text containing a url
    Returns aweme_id if resolvable.
    """
    raw = (value or "").strip()
    if not raw:
        return ""
    if raw.isdigit():
        return raw

    url = raw
    if "http" not in raw:
        # could be pasted with other text, try find url
        url = _extract_first_url(raw)
    else:
        extracted = _extract_first_url(raw)
        if extracted:
            url = extracted

    if not url:
        return ""

    direct = _parse_douyin_aweme_id_from_url(url)
    if direct:
        return direct

    # Follow redirects for v.douyin.com / short links
    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=15.0) as client:
            resp = await client.get(url, headers={"User-Agent": "Mozilla/5.0"})
            final_url = str(resp.url)
            aweme_id = _parse_douyin_aweme_id_from_url(final_url)
            if aweme_id:
                return aweme_id
    except Exception:
        pass

    return ""


def _normalize_cookies(cookie_data: Any) -> List[Dict[str, Any]]:
    """Convert stored cookie formats (Playwright storage or list) into setCookie payloads."""
    cookies: List[Dict[str, Any]] = []
    source = cookie_data
    if isinstance(source, dict):
        if "cookies" in source and isinstance(source["cookies"], list):
            source = source["cookies"]
        elif "origins" in source and isinstance(source["origins"], list):
            items = []
            for origin in source["origins"]:
                items.extend(origin.get("cookies", []))
            source = items
    if isinstance(source, list):
        for c in source:
            if not isinstance(c, dict):
                continue
            item = {
                "domain": c.get("domain"),
                "name": c.get("name"),
                "value": c.get("value"),
                "path": c.get("path", "/"),
                "secure": c.get("secure"),
                "httpOnly": c.get("httpOnly"),
                "sameSite": c.get("sameSite"),
                "storeId": c.get("storeId"),
            }
            expires = c.get("expirationDate") or c.get("expires")
            if expires:
                try:
                    item["expirationDate"] = int(expires)
                except Exception:
                    pass
            cookies.append({k: v for k, v in item.items() if v is not None})
    return cookies


def _load_account_cookies(account_id: str) -> List[Dict[str, Any]]:
    """Load cookies from backend account store by account_id."""
    account = cookie_manager.get_account_by_id(account_id)
    if not account:
        return []
    cookie_data = account.get("cookie") or {}
    return _normalize_cookies(cookie_data)


def _pick_account_id_for_platform(platform: str, user_id: Optional[str] = None) -> Optional[str]:
    """
    Pick a backend-bound account_id for the given platform.

    - If user_id provided, try exact match first.
    - Otherwise pick first valid account.
    """
    platform = (platform or "").lower()
    try:
        accounts = cookie_manager.list_flat_accounts()
    except Exception:
        return None

    # Prefer exact user_id match (cookie_accounts.user_id)
    if user_id:
        for acc in accounts:
            if acc.get("status") != "valid":
                continue
            if (acc.get("platform") or "").lower() != platform:
                continue
            if str(acc.get("user_id") or "") == str(user_id):
                return acc.get("account_id")

    # Fallback: first valid account of platform
    for acc in accounts:
        if acc.get("status") != "valid":
            continue
        if (acc.get("platform") or "").lower() != platform:
            continue
        return acc.get("account_id")

    return None


async def _set_copilot_cookies_for_platform(
    *,
    client: Any,
    platform: str,
    platform_url_map: Dict[str, str],
    account_id: Optional[str] = None,
    user_id: Optional[str] = None,
) -> Optional[str]:
    """
    Ensure copilot has cookies for this platform.
    Returns the chosen account_id, or None if no cookie available.
    """
    chosen_account_id = account_id or _pick_account_id_for_platform(platform, user_id=user_id)
    if not chosen_account_id:
        return None

    cookies = _load_account_cookies(chosen_account_id)
    if not cookies:
        return None

    cookie_result = await client.set_cookies(platform_url_map[platform], cookies)
    if not cookie_result.get("success"):
        raise HTTPException(
            status_code=cookie_result.get("status_code", 500),
            detail=cookie_result.get("error", "Cookie 写入失败"),
        )
    return chosen_account_id


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
    url: str = Field(..., description="Cookie 关联的站点 URL")
    cookies: List[CopilotCookieItem]


class CopilotRawRequest(BaseModel):
    url: str = Field(..., description="需要代理的请求地址")
    method: str = Field("GET", description="HTTP 方法，默认为 GET")
    params: Optional[Dict[str, Any]] = None
    data: Optional[Any] = None
    headers: Optional[Dict[str, Any]] = None


class CopilotWorkRequest(BaseModel):
    platform: Literal["douyin", "xiaohongshu", "kuaishou"]
    work_id: str = Field(..., description="作品 ID，如 aweme_id/note_id/photoId")
    account_id: Optional[str] = Field(None, description="可选：使用后端账户库中的账号 Cookie")
    params_override: Optional[Dict[str, Any]] = None
    data_override: Optional[Any] = None
    headers: Optional[Dict[str, Any]] = None


@router.get("/health")
async def data_health():
    """健康检查"""
    return {"status": "success", "message": "data module ready"}


@router.get("/copilot/status", summary="返回各平台已绑定 Cookie 账号状态")
async def copilot_status():
    """
    用于前端判断是否已绑定同平台账号 Cookie（否则抓取会失败）。
    """
    try:
        accounts = cookie_manager.list_flat_accounts()
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"读取账号库失败: {exc}")

    summary: Dict[str, Any] = {}
    for acc in accounts:
        platform = (acc.get("platform") or "").lower() or "unknown"
        item = summary.setdefault(platform, {"total": 0, "valid": 0, "examples": []})
        item["total"] += 1
        if acc.get("status") == "valid":
            item["valid"] += 1
            if len(item["examples"]) < 3:
                item["examples"].append(
                    {
                        "account_id": acc.get("account_id"),
                        "user_id": acc.get("user_id"),
                        "nickname": acc.get("nickname"),
                    }
                )

    return {"status": "success", "data": summary}


def _db_path() -> Path:
    return Path(settings.BASE_DIR) / "db" / "database.db"


@router.get("/work-ids", summary="按账号返回作品ID列表（用于 copilot/work）")
async def list_work_ids(
    account_id: str = Query(..., description="账号ID（account_xxx）"),
    platform: Literal["douyin", "xiaohongshu", "kuaishou", "channels"] = Query("douyin"),
    limit: int = Query(50, ge=1, le=500, description="返回数量"),
    refresh: bool = Query(False, description="是否先刷新采集（会打开浏览器/请求接口）"),
):
    """
    返回某账号在某平台的已发布作品 ID 列表，方便前端逐个调用 `/api/v1/data/copilot/work` 抓取详情。

    - `refresh=true`：会先跑一次 `myUtils.video_collector` 采集并写库，然后再从库中返回 work_ids。
    - work_id 对应：抖音 aweme_id、小红书 note_id、快手 photoId。
    """
    if refresh:
        try:
            from myUtils.video_collector import collector

            await collector.collect_all_accounts(
                account_ids=[account_id],
                platform_filter=platform if platform != "channels" else "channels",
            )
        except Exception as exc:  # noqa: BLE001
            raise HTTPException(status_code=500, detail=f"Refresh failed: {exc}")

    db = _db_path()
    try:
        with sqlite3.connect(db) as conn:
            conn.row_factory = sqlite3.Row
            cur = conn.cursor()
            cur.execute(
                """
                SELECT video_id, title, publish_time, collected_at
                FROM video_analytics
                WHERE platform = ?
                  AND account_id = ?
                  AND video_id IS NOT NULL
                  AND TRIM(video_id) != ''
                ORDER BY COALESCE(collected_at, last_updated) DESC
                LIMIT ?
                """,
                (platform, account_id, limit),
            )
            rows = [dict(r) for r in cur.fetchall()]
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"DB query failed: {exc}")

    work_ids = [r.get("video_id") for r in rows if r.get("video_id")]
    return {
        "status": "success",
        "data": {
            "account_id": account_id,
            "platform": platform,
            "count": len(work_ids),
            "work_ids": work_ids,
            "items": rows,
        },
    }


class CopilotWorksBatchRequest(BaseModel):
    platform: Literal["douyin", "xiaohongshu", "kuaishou"] = Field(..., description="平台")
    account_id: Optional[str] = Field(None, description="可选：账号ID（用于写入 cookies 到 copilot）")
    user_id: Optional[str] = Field(None, description="可选：平台用户ID（抖音为 sec_uid），用于自动匹配已绑定账号")
    work_ids: Optional[List[str]] = Field(None, description="可选：指定作品ID列表；不传则从库里读取")
    limit: int = Field(50, ge=1, le=500, description="从库读取时的最大数量")
    refresh_work_ids: bool = Field(False, description="先刷新采集作品ID（会打开浏览器/请求接口）")


@router.post("/copilot/works-batch", summary="批量抓取作品详情并写入 analytics")
async def copilot_fetch_works_batch(payload: CopilotWorksBatchRequest):
    """
    给定 `account_id + platform`：
    - 获取 work_ids（可指定；或从库读取；可选先 refresh 采集）
    - 通过 social-media-copilot 抓取每个作品详情
    - 解析出标题/发布时间/数据并 upsert 到 analytics 的 `video_analytics` 表
    """
    db = _db_path()
    ensure_analytics_schema(db)

    raw_work_inputs = [str(w).strip() for w in (payload.work_ids or []) if str(w).strip()]
    work_ids: List[str] = []
    if payload.platform == "douyin":
        for w in raw_work_inputs:
            resolved = await _resolve_douyin_aweme_id(w)
            if resolved:
                work_ids.append(resolved)
    else:
        work_ids = raw_work_inputs
    if not work_ids:
        # Optionally refresh ids first
        if payload.refresh_work_ids:
            effective_account_id = payload.account_id or _pick_account_id_for_platform(payload.platform, user_id=payload.user_id)
            if not effective_account_id:
                raise HTTPException(status_code=404, detail="未找到同平台已绑定账号（无法刷新作品ID）")
            from myUtils.video_collector import collector

            await collector.collect_all_accounts(
                account_ids=[effective_account_id],
                platform_filter=payload.platform,
            )

        with sqlite3.connect(db) as conn:
            conn.row_factory = sqlite3.Row
            cur = conn.cursor()
            cur.execute(
                """
                SELECT video_id
                FROM video_analytics
                WHERE platform = ?
                  AND account_id = ?
                  AND video_id IS NOT NULL
                  AND TRIM(video_id) != ''
                ORDER BY COALESCE(collected_at, last_updated) DESC
                LIMIT ?
                """,
                (payload.platform, (payload.account_id or _pick_account_id_for_platform(payload.platform, user_id=payload.user_id) or ""), int(payload.limit)),
            )
            work_ids = [str(r["video_id"]).strip() for r in cur.fetchall() if str(r["video_id"]).strip()]

    if not work_ids:
        raise HTTPException(status_code=404, detail="No work_ids found for this account/platform")

    client = get_social_media_copilot_client()
    try:
        platform_url_map = {
            "douyin": "https://www.douyin.com",
            "xiaohongshu": "https://www.xiaohongshu.com",
            "kuaishou": "https://www.kuaishou.com",
        }

        chosen_account_id = await _set_copilot_cookies_for_platform(
            client=client,
            platform=payload.platform,
            platform_url_map=platform_url_map,
            account_id=payload.account_id,
            user_id=payload.user_id,
        )
        if not chosen_account_id:
            raise HTTPException(status_code=404, detail="未找到同平台已绑定账号 Cookie（请先扫码绑定一个账号）")

        ok = 0
        failed: List[Dict[str, Any]] = []
        ids_processed: List[str] = []

        for wid in work_ids:
            try:
                result = await client.fetch_work(platform=payload.platform, work_id=wid)
                if not result.get("success"):
                    failed.append({"work_id": wid, "error": result.get("error")})
                    continue

                record = extract_video_info(payload.platform, result.get("data") or {}, wid)
                record["account_id"] = payload.account_id or chosen_account_id
                upsert_video_analytics_by_key(
                    db,
                    platform=record.get("platform") or payload.platform,
                    video_id=record.get("video_id") or wid,
                    data=record,
                )
                ok += 1
                ids_processed.append(wid)
            except Exception as exc:  # noqa: BLE001
                failed.append({"work_id": wid, "error": str(exc)})

        return {
            "status": "success" if not failed else "partial",
            "data": {
                "account_id": payload.account_id,
                "platform": payload.platform,
                "requested": len(work_ids),
                "success": ok,
                "failed": len(failed),
                "processed_work_ids": ids_processed,
                "errors": failed,
            },
        }
    finally:
        try:
            await client.close()
        except Exception:
            pass


class CopilotWorkCommentsRequest(BaseModel):
    platform: Literal["douyin"] = Field(..., description="平台（目前先支持抖音）")
    work_id: str = Field(..., description="作品ID（抖音 aweme_id）")
    account_id: Optional[str] = Field(None, description="可选：账号ID（用于写入 cookies 到 copilot）")
    user_id: Optional[str] = Field(None, description="可选：平台用户ID（抖音为 sec_uid），用于自动匹配已绑定账号")
    limit: int = Field(50, ge=1, le=200, description="评论数量（单页）")
    cursor: int = Field(0, ge=0, description="分页游标")


@router.post("/copilot/work-comments", summary="抓取指定作品的评论（目前支持抖音）")
async def copilot_fetch_work_comments(payload: CopilotWorkCommentsRequest):
    client = get_social_media_copilot_client()
    try:
        resolved_work_id = await _resolve_douyin_aweme_id(payload.work_id)
        if not resolved_work_id:
            raise HTTPException(status_code=400, detail="无法解析 work_id（请粘贴抖音视频链接或 aweme_id）")

        platform_url_map = {"douyin": "https://www.douyin.com"}
        chosen_account_id = await _set_copilot_cookies_for_platform(
            client=client,
            platform="douyin",
            platform_url_map=platform_url_map,
            account_id=payload.account_id,
            user_id=payload.user_id,
        )
        if not chosen_account_id:
            raise HTTPException(status_code=404, detail="未找到抖音已绑定账号 Cookie（请先扫码绑定一个账号）")

        result = await client.fetch_work_comments(
            platform=payload.platform,
            work_id=resolved_work_id,
            limit=payload.limit,
            cursor=payload.cursor,
        )
        if not result.get("success"):
            raise HTTPException(status_code=result.get("status_code", 500), detail=result.get("error", "评论抓取失败"))

        return {"status": "success", "data": result.get("data")}
    finally:
        try:
            await client.close()
        except Exception:
            pass


class CopilotUserRequest(BaseModel):
    platform: Literal["douyin"] = Field(..., description="平台（目前先支持抖音）")
    user_id: str = Field(..., description="用户ID（抖音 sec_uid）")
    account_id: Optional[str] = Field(None, description="可选：账号ID（用于写入 cookies 到 copilot）")


@router.post("/copilot/user-info", summary="抓取指定创作者数据（目前支持抖音）")
async def copilot_fetch_user_info(payload: CopilotUserRequest):
    client = get_social_media_copilot_client()
    try:
        platform_url_map = {"douyin": "https://www.douyin.com"}
        chosen_account_id = await _set_copilot_cookies_for_platform(
            client=client,
            platform="douyin",
            platform_url_map=platform_url_map,
            account_id=payload.account_id,
            user_id=payload.user_id,
        )
        if not chosen_account_id:
            raise HTTPException(status_code=404, detail="未找到抖音已绑定账号 Cookie（请先扫码绑定一个账号）")

        result = await client.fetch_user_info(platform=payload.platform, user_id=payload.user_id)
        if not result.get("success"):
            raise HTTPException(status_code=result.get("status_code", 500), detail=result.get("error", "用户信息抓取失败"))

        return {"status": "success", "data": result.get("data")}
    finally:
        try:
            await client.close()
        except Exception:
            pass


class CopilotUserWorksRequest(BaseModel):
    platform: Literal["douyin"] = Field(..., description="平台（目前先支持抖音）")
    user_id: str = Field(..., description="用户ID（抖音 sec_uid）")
    account_id: Optional[str] = Field(None, description="可选：账号ID（用于写入 cookies 到 copilot）")
    limit: int = Field(20, ge=1, le=50, description="作品数量（单页）")
    cursor: int = Field(0, ge=0, description="分页游标（max_cursor）")


@router.post("/copilot/user-works", summary="抓取指定创作者的作品列表（目前支持抖音）")
async def copilot_fetch_user_works(payload: CopilotUserWorksRequest):
    client = get_social_media_copilot_client()
    try:
        platform_url_map = {"douyin": "https://www.douyin.com"}
        chosen_account_id = await _set_copilot_cookies_for_platform(
            client=client,
            platform="douyin",
            platform_url_map=platform_url_map,
            account_id=payload.account_id,
            user_id=payload.user_id,
        )
        if not chosen_account_id:
            raise HTTPException(status_code=404, detail="未找到抖音已绑定账号 Cookie（请先扫码绑定一个账号）")

        result = await client.fetch_user_works(
            platform=payload.platform,
            user_id=payload.user_id,
            limit=payload.limit,
            cursor=payload.cursor,
        )
        if not result.get("success"):
            raise HTTPException(status_code=result.get("status_code", 500), detail=result.get("error", "用户作品抓取失败"))

        return {"status": "success", "data": result.get("data")}
    finally:
        try:
            await client.close()
        except Exception:
            pass


# ==================== 数据中心统计 ====================

@router.get("/center")
async def data_center_summary():
    """数据中心概览"""
    now = datetime.utcnow()
    summary = {
        "updated_at": now.isoformat(),
        "totals": {
            "videos": 0,
            "views": 0,
            "likes": 0,
            "comments": 0,
            "shares": 0,
        },
    }
    return {"status": "success", "data": summary}


@router.get("/videos")
async def data_videos():
    """视频数据列表"""
    items = []
    return {"status": "success", "items": items}


@router.get("/trends")
async def data_trends():
    """数据趋势"""
    now = datetime.utcnow()
    series = []
    for i in range(7):
        day = now - timedelta(days=i)
        series.append(
            {
                "date": day.date().isoformat(),
                "views": 0,
                "likes": 0,
                "comments": 0,
                "shares": 0,
            }
        )
    return {"status": "success", "series": list(reversed(series))}


@router.get("/publish-status")
async def data_publish_status():
    """
    任务管理中心：统计计划状态
    """
    plans = campaign_manager.get_all_plans() or []
    summary = {
        "published": 0,
        "pending": 0,
        "failed": 0,
        "deleted": 0,
        "total": len(plans),
        "raw": {},
    }
    for p in plans:
        status = (p.get("status") or "").lower()
        summary["raw"][status] = summary["raw"].get(status, 0) + 1
        if status in ("completed", "finished", "done"):
            summary["published"] += 1
        elif status in ("draft", "running", "pending", "in_progress"):
            summary["pending"] += 1
        elif status in ("failed", "error"):
            summary["failed"] += 1
        elif status in ("deleted", "archived"):
            summary["deleted"] += 1
        else:
            summary["pending"] += 1
    return {"status": "success", "data": summary}


# ==================== 抖音数据抓取 ====================

@router.get("/douyin/video")
async def fetch_douyin_video(
    aweme_id: str = Query(..., description="抖音视频ID")
):
    """
    获取抖音视频详情

    Args:
        aweme_id: 抖音视频ID

    Returns:
        视频详细信息
    """
    try:
        crawler = get_data_crawler_service()
        result = await crawler.fetch_douyin_video(aweme_id)

        if result.get("success"):
            return {
                "status": "success",
                "data": result.get("data"),
                "message": "视频信息获取成功"
            }
        else:
            raise HTTPException(
                status_code=400,
                detail=result.get("error", "视频信息获取失败")
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/douyin/user/posts")
async def fetch_douyin_user_posts(
    sec_user_id: str = Query(..., description="用户ID"),
    max_cursor: int = Query(0, description="分页游标"),
    count: int = Query(20, ge=1, le=100, description="每页数量")
):
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
        crawler = get_data_crawler_service()
        result = await crawler.fetch_douyin_user_posts(sec_user_id, max_cursor, count)

        if result.get("success"):
            return {
                "status": "success",
                "data": result.get("data"),
                "message": "用户视频列表获取成功"
            }
        else:
            raise HTTPException(
                status_code=400,
                detail=result.get("error", "用户视频列表获取失败")
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/douyin/video/comments")
async def fetch_douyin_video_comments(
    aweme_id: str = Query(..., description="视频ID"),
    cursor: int = Query(0, description="分页游标"),
    count: int = Query(20, ge=1, le=100, description="每页数量")
):
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
        crawler = get_data_crawler_service()
        result = await crawler.fetch_douyin_video_comments(aweme_id, cursor, count)

        if result.get("success"):
            return {
                "status": "success",
                "data": result.get("data"),
                "message": "视频评论获取成功"
            }
        else:
            raise HTTPException(
                status_code=400,
                detail=result.get("error", "视频评论获取失败")
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/douyin/hot-search")
async def fetch_douyin_hot_search():
    """
    获取抖音热榜

    Returns:
        热榜数据
    """
    try:
        crawler = get_data_crawler_service()
        result = await crawler.fetch_douyin_hot_search()

        if result.get("success"):
            return {
                "status": "success",
                "data": result.get("data"),
                "message": "抖音热榜获取成功"
            }
        else:
            raise HTTPException(
                status_code=400,
                detail=result.get("error", "抖音热榜获取失败")
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== B站数据抓取 ====================

@router.get("/bilibili/video")
async def fetch_bilibili_video(
    bvid: str = Query(..., description="B站视频BVID")
):
    """
    获取B站视频详情

    Args:
        bvid: B站视频BVID

    Returns:
        视频详细信息
    """
    try:
        crawler = get_data_crawler_service()
        result = await crawler.fetch_bilibili_video(bvid)

        if result.get("success"):
            return {
                "status": "success",
                "data": result.get("data"),
                "message": "视频信息获取成功"
            }
        else:
            raise HTTPException(
                status_code=400,
                detail=result.get("error", "视频信息获取失败")
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== 通用数据抓取 ====================

@router.get("/video/parse")
async def parse_video_url(
    url: str = Query(..., description="视频URL，支持抖音/B站/小红书/快手")
):
    """
    根据URL解析视频信息（支持多平台）

    Args:
        url: 视频URL

    Returns:
        视频信息
    """
    try:
        crawler = get_data_crawler_service()
        result = await crawler.fetch_video_by_url(url)

        if result.get("success"):
            return {
                "status": "success",
                "data": result.get("data"),
                "platform": result.get("platform"),
                "message": "视频信息解析成功"
            }
        else:
            raise HTTPException(
                status_code=400,
                detail=result.get("error", "视频信息解析失败")
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Social Media Copilot 集成 ====================

@router.post("/copilot/cookies")
async def copilot_set_cookies(payload: CopilotCookieRequest):
    """
    将 Cookie 写入 social-media-copilot 插件端，保持平台会话。
    """
    client = get_social_media_copilot_client()
    try:
        cookies = [item.model_dump(exclude_none=True) for item in payload.cookies]
        result = await client.set_cookies(payload.url, cookies)

        if result.get("success"):
            return {
                "status": "success",
                "data": result.get("data"),
                "message": "Cookie 写入成功"
            }
        raise HTTPException(
            status_code=result.get("status_code", 500),
            detail=result.get("error", "Cookie 写入失败")
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        try:
            await client.close()
        except Exception:
            pass


# 兼容路径别名：直接 /cookies 也转发到 copilot（用于旧代码或外部工具调用）
@router.post("/cookies")
async def copilot_set_cookies_alias(payload: CopilotCookieRequest):
    """Cookie 设置的兼容路径，转发到 /copilot/cookies"""
    return await copilot_set_cookies(payload)


@router.post("/copilot/request")
async def copilot_proxy_request(payload: CopilotRawRequest):
    """
    通过 social-media-copilot 代理任意请求（用于调试或非标准数据抓取）。
    """
    client = get_social_media_copilot_client()
    try:
        request_config = payload.model_dump(exclude_none=True)
        request_config["method"] = request_config.get("method", "GET").upper()
        result = await client.proxy_request(request_config)

        if result.get("success"):
            return {
                "status": "success",
                "data": result.get("data"),
                "message": "请求代理成功"
            }
        raise HTTPException(
            status_code=result.get("status_code", 500),
            detail=result.get("error", "请求代理失败")
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        try:
            await client.close()
        except Exception:
            pass


@router.post("/copilot/work")
async def copilot_fetch_work(payload: CopilotWorkRequest):
    """
    按作品 ID 调用 social-media-copilot 获取 Douyin/小红书/快手 作品数据。
    """
    client = get_social_media_copilot_client()
    try:
        platform_url_map = {
            "douyin": "https://www.douyin.com",
            "xiaohongshu": "https://www.xiaohongshu.com",
            "kuaishou": "https://www.kuaishou.com",
        }

        # 如果传入 account_id，则从后端账户库读取 Cookie 并先写入插件端
        if payload.account_id:
            cookies = _load_account_cookies(payload.account_id)
            if not cookies:
                raise HTTPException(status_code=404, detail="账号 Cookie 不存在或为空")
            cookie_result = await client.set_cookies(
                platform_url_map.get(payload.platform, "https://www.douyin.com"),
                cookies,
            )
            if not cookie_result.get("success"):
                raise HTTPException(
                    status_code=cookie_result.get("status_code", 500),
                    detail=cookie_result.get("error", "Cookie 写入失败"),
                )

        result = await client.fetch_work(
            platform=payload.platform,
            work_id=payload.work_id,
            params_override=payload.params_override,
            data_override=payload.data_override,
            headers=payload.headers,
        )

        if result.get("success"):
            return {
                "status": "success",
                "data": result.get("data"),
                "message": "作品数据获取成功"
            }
        raise HTTPException(
            status_code=result.get("status_code", 500),
            detail=result.get("error", "作品数据获取失败")
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        try:
            await client.close()
        except Exception:
            pass
