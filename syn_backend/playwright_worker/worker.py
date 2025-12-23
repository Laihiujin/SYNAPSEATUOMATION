"""
Playwright Worker 独立进程
专门处理浏览器自动化任务，与 FastAPI 解耦

架构优势：
1. 独立的事件循环，不受 uvicorn reload 影响
2. 稳定的 Playwright 运行环境
3. 支持长时间运行的浏览器会话
4. 可独立重启，不影响 API 服务
"""
import sys
import asyncio
import os
import platform
import contextlib
from pathlib import Path
from typing import Dict, Any
from loguru import logger
from fastapi import FastAPI
from pydantic import BaseModel, Field
from fastapi.responses import JSONResponse
import uvicorn
from dotenv import load_dotenv
import uuid


def _resolve_executable_path() -> str | None:
    try:
        from config.conf import LOCAL_CHROME_PATH  # type: ignore

        if LOCAL_CHROME_PATH and Path(str(LOCAL_CHROME_PATH)).exists():
            return str(LOCAL_CHROME_PATH)
    except Exception:
        return None
    return None

# 设置正确的事件循环策略（Windows）
# Playwright 需要 asyncio subprocess 支持（Windows 上由 ProactorEventLoop 提供）。
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    logger.info("[Worker] Set WindowsProactorEventLoopPolicy for Playwright")

# 添加项目根目录到路径
sys.path.insert(0, str(Path(__file__).parent.parent))

# 加载环境变量（根目录 `.env` 优先，`syn_backend/.env` 作为补充）
_BASE_DIR = Path(__file__).resolve().parent.parent  # syn_backend
_ROOT_ENV = _BASE_DIR.parent / ".env"
_LOCAL_ENV = _BASE_DIR / ".env"
if _ROOT_ENV.exists():
    load_dotenv(_ROOT_ENV, override=True)
if _LOCAL_ENV.exists():
    load_dotenv(_LOCAL_ENV, override=False)


def _env_bool(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    raw = raw.strip().lower()
    if raw in {"1", "true", "yes", "y", "on"}:
        return True
    if raw in {"0", "false", "no", "n", "off"}:
        return False
    return default

# 导入平台适配器
from app_new.platforms.tencent import TencentAdapter
from app_new.platforms.douyin import DouyinAdapter
from app_new.platforms.kuaishou import KuaishouAdapter
from app_new.platforms.xiaohongshu import XiaohongshuAdapter
from app_new.platforms.bilibili import BilibiliAdapter
from app_new.platforms.base import LoginStatus

# 创建 FastAPI 应用
app = FastAPI(title="Playwright Worker", version="1.0.0")

# Ensure bundled Playwright Chromium exists on worker host.
@app.on_event("startup")
async def _startup_bootstrap_playwright():
    try:
        from utils.playwright_bootstrap import ensure_playwright_chromium_installed

        auto_install = os.getenv("PLAYWRIGHT_AUTO_INSTALL", "1").strip().lower() not in {"0", "false", "no", "off"}
        r = await asyncio.to_thread(ensure_playwright_chromium_installed, auto_install=auto_install)
        logger.info(f"[Worker] PLAYWRIGHT_BROWSERS_PATH={r.browsers_path}")
        if not r.installed:
            logger.warning(f"[Worker] Chromium not ready: {r.error}")
    except Exception as e:
        logger.warning(f"[Worker] Playwright bootstrap failed (ignored): {e}")

# 全局会话存储
sessions: Dict[str, Dict[str, Any]] = {}
sessions_lock = asyncio.Lock()
_cleanup_task: asyncio.Task | None = None

# 平台适配器映射
PLATFORM_ADAPTERS = {
    "tencent": TencentAdapter,
    "channels": TencentAdapter,  # alias for WeChat Channels
    "douyin": DouyinAdapter,
    "kuaishou": KuaishouAdapter,
    "xiaohongshu": XiaohongshuAdapter,
    "bilibili": BilibiliAdapter,
}


class EnrichAccountRequest(BaseModel):
    platform: str = Field(..., description="平台名称 (tencent/douyin/kuaishou/xiaohongshu/bilibili)")
    storage_state: Dict[str, Any] = Field(..., description="Playwright storage_state JSON")
    account_id: str | None = Field(default=None, description="账号ID(用于设备指纹)")
    # None => 使用环境变量 `PLAYWRIGHT_HEADLESS` 的默认值
    headless: bool | None = Field(default=None, description="是否无头模式（None 表示使用 PLAYWRIGHT_HEADLESS）")
    timeout_ms: int = Field(default=30000, description="页面加载超时(ms)")


class OpenCreatorCenterRequest(BaseModel):
    platform: str = Field(..., description="平台名称 (tencent/channels/douyin/kuaishou/xiaohongshu/bilibili)")
    storage_state: Dict[str, Any] = Field(..., description="Playwright storage_state JSON")
    account_id: str | None = Field(default=None, description="账号ID(用于设备指纹)")
    apply_fingerprint: bool = Field(default=True, description="是否应用设备指纹")
    headless: bool | None = Field(default=None, description="是否无头模式（None 表示使用 PLAYWRIGHT_HEADLESS）")
    timeout_ms: int = Field(default=60000, description="页面加载超时(ms)")
    expires_in: int = Field(default=3600, description="会话保留时间(秒)")


_PLATFORM_PROFILE_URL = {
    "tencent": "https://channels.weixin.qq.com/platform",
    "channels": "https://channels.weixin.qq.com/platform",
    "douyin": "https://creator.douyin.com/creator-micro/home",
    "kuaishou": "https://cp.kuaishou.com/profile",
    "xiaohongshu": "https://creator.xiaohongshu.com/creator/home",
    "bilibili": "https://member.bilibili.com/platform/home",
}


@app.get("/health")
async def health_check():
    """健康检查"""
    try:
        loop = asyncio.get_running_loop()
        loop_type = loop.__class__.__name__
    except Exception:
        loop_type = "unknown"

    return {
        "status": "ok",
        "service": "playwright-worker",
        "pid": os.getpid(),
        "python": sys.version.split(" ")[0],
        "platform": platform.platform(),
        "event_loop_policy": asyncio.get_event_loop_policy().__class__.__name__,
        "event_loop": loop_type,
    }


@app.get("/debug/playwright")
async def debug_playwright(headless: bool | None = None):
    """
    调试：尝试启动并关闭一次 Chromium，用于定位 Playwright/浏览器环境问题。
    """
    try:
        if headless is None:
            headless = _env_bool("PLAYWRIGHT_HEADLESS", True)
        from playwright.async_api import async_playwright

        pw = await async_playwright().start()
        launch_kwargs: Dict[str, Any] = {"headless": headless}
        executable_path = _resolve_executable_path()
        if executable_path:
            launch_kwargs["executable_path"] = executable_path
        browser = await pw.chromium.launch(**launch_kwargs)
        await browser.close()
        await pw.stop()
        return {"success": True}
    except Exception as e:
        err = str(e) or repr(e) or type(e).__name__
        logger.error(f"[Worker] debug_playwright failed: {err}", exc_info=True)
        return JSONResponse(status_code=500, content={"success": False, "error": err})


@app.post("/creator/open")
async def open_creator_center(req: OpenCreatorCenterRequest):
    """
    打开创作者中心（使用 storage_state 复用登录态）。

    说明：该接口会在运行本服务的机器上打开浏览器窗口（headless=false 时）。
    """
    try:
        platform_code = (req.platform or "").strip().lower()
        profile_url = _PLATFORM_PROFILE_URL.get(platform_code)
        if not profile_url:
            return JSONResponse(status_code=400, content={"success": False, "error": f"Unsupported platform: {req.platform}"})

        headless = req.headless
        if headless is None:
            headless = _env_bool("PLAYWRIGHT_HEADLESS", True)

        from playwright.async_api import async_playwright
        from myUtils.browser_context import build_context_options, persistent_browser_manager
        from myUtils.fingerprint_policy import get_fingerprint_policy, resolve_proxy
        from utils.base_social_media import set_init_script

        policy = get_fingerprint_policy(req.account_id, platform_code)
        apply_fingerprint = bool(req.apply_fingerprint) and bool(policy.get("apply_fingerprint", True))
        apply_stealth = bool(policy.get("apply_stealth", True))
        use_persistent_profile = bool(policy.get("use_persistent_profile", True)) and bool(req.account_id)
        if (policy.get("tls_ja3") or {}).get("enabled"):
            logger.warning("[Worker] tls_ja3 is enabled in policy, but Playwright does not support JA3 spoofing.")

        pw = await async_playwright().start()
        launch_kwargs: Dict[str, Any] = {"headless": headless}
        executable_path = _resolve_executable_path()
        if executable_path:
            launch_kwargs["executable_path"] = executable_path
        proxy = resolve_proxy(policy)
        if proxy:
            launch_kwargs["proxy"] = proxy
        browser = None

        context_opts = build_context_options(storage_state=req.storage_state)
        fingerprint = None
        if apply_fingerprint and req.account_id:
            try:
                from myUtils.device_fingerprint import device_fingerprint_manager

                fingerprint = device_fingerprint_manager.get_or_create_fingerprint(
                    account_id=req.account_id,
                    platform=platform_code,
                    policy=policy,
                )
                context_opts = device_fingerprint_manager.apply_to_context(fingerprint, context_opts)
            except Exception as e:
                logger.warning(f"[Worker] Apply fingerprint failed (ignored): {e}")

        if use_persistent_profile:
            profile_root = policy.get("persistent_profile_dir") or "syn_backend/browser_profiles"
            try:
                from config.conf import BASE_DIR

                profile_root_path = Path(profile_root)
                if not profile_root_path.is_absolute():
                    profile_root_path = Path(BASE_DIR) / profile_root_path
            except Exception:
                profile_root_path = Path(profile_root)
            custom_manager = persistent_browser_manager
            if profile_root_path:
                try:
                    custom_manager = persistent_browser_manager.__class__(profile_root_path)
                except Exception:
                    custom_manager = persistent_browser_manager
            user_data_dir = custom_manager.get_user_data_dir(req.account_id, platform_code)
            context = await pw.chromium.launch_persistent_context(str(user_data_dir), **context_opts, **launch_kwargs)
            try:
                browser = context.browser()
            except Exception:
                browser = None
        else:
            browser = await pw.chromium.launch(**launch_kwargs)
            context = await browser.new_context(**context_opts)
        if fingerprint:
            try:
                from myUtils.device_fingerprint import device_fingerprint_manager

                await context.add_init_script(device_fingerprint_manager.get_init_script(fingerprint))
            except Exception as e:
                logger.warning(f"[Worker] Add fingerprint script failed (ignored): {e}")
        if apply_stealth:
            try:
                await set_init_script(context)
            except Exception as e:
                logger.warning(f"[Worker] Add stealth script failed (ignored): {e}")

        page = await context.new_page()
        await page.goto(profile_url, wait_until="domcontentloaded", timeout=req.timeout_ms)

        if platform_code == "bilibili":
            current_url = (page.url or "").lower()
            if "passport.bilibili.com" in current_url or "passport.bilibili" in current_url:
                with contextlib.suppress(Exception):
                    await page.close()
                with contextlib.suppress(Exception):
                    await context.close()
                with contextlib.suppress(Exception):
                    await browser.close()
                with contextlib.suppress(Exception):
                    await pw.stop()
                return JSONResponse(status_code=401, content={"success": False, "error": "Login required"})

        session_id = f"creator_{uuid.uuid4().hex[:12]}"
        now = asyncio.get_running_loop().time()
        async with sessions_lock:
            sessions[session_id] = {
                "type": "creator_center",
                "created_at": now,
                "expires_in": float(req.expires_in),
                "pw": pw,
                "browser": browser,
                "context": context,
                "page": page,
                "profile_url": profile_url,
                "persistent": bool(use_persistent_profile),
            }

        logger.info(f"[Worker] Creator center opened: platform={platform_code} session={session_id}")
        return {"success": True, "data": {"session_id": session_id, "url": profile_url}}

    except Exception as e:
        err = str(e) or type(e).__name__
        logger.error(f"[Worker] Open creator center failed: {err}", exc_info=True)
        return JSONResponse(status_code=500, content={"success": False, "error": err})


@app.delete("/creator/close/{session_id}")
async def close_creator_center(session_id: str):
    try:
        async with sessions_lock:
            s = sessions.get(session_id)
        if not s:
            return JSONResponse(status_code=404, content={"success": False, "error": "Session not found"})

        await _cleanup_session(session_id, s)
        async with sessions_lock:
            sessions.pop(session_id, None)
        return {"success": True}
    except Exception as e:
        err = str(e) or type(e).__name__
        logger.error(f"[Worker] Close creator center failed: {err}", exc_info=True)
        return JSONResponse(status_code=500, content={"success": False, "error": err})


async def _cleanup_session(session_id: str, session: Dict[str, Any]) -> None:
    # Creator-center sessions own their Playwright lifecycle.
    if session.get("type") == "creator_center":
        page = session.get("page")
        context = session.get("context")
        browser = session.get("browser")
        pw = session.get("pw")
        with contextlib.suppress(Exception):
            if page:
                await page.close()
        with contextlib.suppress(Exception):
            if context:
                await context.close()
        with contextlib.suppress(Exception):
            if browser:
                await browser.close()
        with contextlib.suppress(Exception):
            if pw:
                await pw.stop()
        logger.info(f"[Worker] Creator center session cleaned: {session_id}")
        return

    adapter = session.get("adapter")
    if adapter:
        await adapter.cleanup_session(session_id)


@app.post("/account/enrich")
async def enrich_account(req: EnrichAccountRequest):
    """
    使用 storage_state 重新打开平台页面，提取 user_id/name/avatar 等信息。
    用于“登录成功后信息补全”（DOM + Cookie），避免在 API 进程内运行 Playwright。
    """
    try:
        platform_code = (req.platform or "").lower()
        adapter_class = PLATFORM_ADAPTERS.get(platform_code)
        if not adapter_class:
            return JSONResponse(status_code=400, content={"success": False, "error": f"Unsupported platform: {req.platform}"})

        profile_url = _PLATFORM_PROFILE_URL.get(platform_code)
        if not profile_url:
            return JSONResponse(status_code=400, content={"success": False, "error": f"No profile url for platform: {req.platform}"})

        from playwright.async_api import async_playwright
        from myUtils.playwright_context_factory import create_context_with_policy
        import inspect

        headless = req.headless if req.headless is not None else _env_bool("PLAYWRIGHT_HEADLESS", True)
        adapter = adapter_class(config={"headless": headless, "account_id": req.account_id})

        pw = await async_playwright().start()
        browser = None
        context = None
        try:
            browser, context, _, _ = await create_context_with_policy(
                pw,
                platform=platform_code,
                account_id=req.account_id,
                headless=headless,
                storage_state=req.storage_state,
                launch_kwargs={"args": ["--no-sandbox"]},
            )
            page = await context.new_page()
            await page.goto(profile_url, timeout=req.timeout_ms, wait_until="domcontentloaded")
            await asyncio.sleep(2)

            cookies_list = await context.cookies()

            user_info = None
            extract_fn = getattr(adapter, "_extract_user_info", None)
            if extract_fn:
                try:
                    sig = inspect.signature(extract_fn)
                    if len(sig.parameters) >= 4:
                        user_info = await extract_fn(page, cookies_list, req.storage_state)
                    else:
                        user_info = await extract_fn(page, cookies_list)
                except TypeError:
                    user_info = await extract_fn(page, cookies_list)
            else:
                user_info = None

            if not user_info:
                return {"success": True, "data": {"user_id": None, "name": None, "avatar": None, "extra": None}}

            return {
                "success": True,
                "data": {
                    "user_id": user_info.user_id,
                    "name": user_info.name,
                    "avatar": user_info.avatar,
                    "extra": user_info.extra,
                },
            }
        finally:
            with contextlib.suppress(Exception):
                if context:
                    await context.close()
            with contextlib.suppress(Exception):
                if browser:
                    await browser.close()
            with contextlib.suppress(Exception):
                await pw.stop()

    except Exception as e:
        err = str(e) or repr(e) or type(e).__name__
        logger.error(f"[Worker] enrich_account failed: {err}", exc_info=True)
        return JSONResponse(status_code=500, content={"success": False, "error": err})


@app.post("/qrcode/generate")
async def generate_qrcode(platform: str, account_id: str, headless: bool | None = None):
    """
    生成登录二维码

    Args:
        platform: 平台名称 (tencent/douyin/kuaishou/xiaohongshu/bilibili)
        account_id: 账号ID
        headless: 是否无头模式
    """
    try:
        logger.info(f"[Worker] Generate QR: platform={platform} account={account_id}")

        # 获取平台适配器
        adapter_class = PLATFORM_ADAPTERS.get(platform)
        if not adapter_class:
            return JSONResponse(
                status_code=400,
                content={"success": False, "error": f"Unsupported platform: {platform}"}
            )

        if headless is None:
            headless = _env_bool("PLAYWRIGHT_HEADLESS", True)

        # 创建适配器实例
        adapter = adapter_class(config={"headless": headless, "account_id": account_id})

        # 生成二维码
        qr_data = await adapter.get_qrcode()

        # 存储会话信息
        async with sessions_lock:
            sessions[qr_data.session_id] = {
                "platform": platform,
                "account_id": account_id,
                "adapter": adapter,
                "qr_data": qr_data,
                "created_at": asyncio.get_running_loop().time(),
                "expires_in": int(qr_data.expires_in or 300),
            }

        logger.info(f"[Worker] QR generated: session={qr_data.session_id[:8]}")

        return {
            "success": True,
            "data": {
                "session_id": qr_data.session_id,
                "qr_url": qr_data.qr_url,
                "qr_image": qr_data.qr_image,
                "expires_in": qr_data.expires_in,
            }
        }

    except Exception as e:
        err = str(e) or type(e).__name__
        if isinstance(e, NotImplementedError) and sys.platform == "win32":
            err = (
                f"{err} (Windows asyncio subprocess 未启用；"
                f"policy={asyncio.get_event_loop_policy().__class__.__name__}；"
                "请使用 start_worker.bat 启动 Worker，勿用 reload)"
            )
        logger.error(f"[Worker] QR generation failed: {err}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": err}
        )


@app.get("/qrcode/status/{session_id}")
async def poll_qrcode_status(session_id: str):
    """
    轮询登录状态

    Args:
        session_id: 会话ID
    """
    try:
        # 检查会话是否存在
        async with sessions_lock:
            session = sessions.get(session_id)
        if not session:
            return JSONResponse(status_code=404, content={"success": False, "error": "Session not found or expired"})

        adapter = session["adapter"]

        # 轮询状态
        result = await adapter.poll_status(session_id)

        # 如果登录成功或失败，清理会话
        if result.status in (LoginStatus.CONFIRMED, LoginStatus.FAILED, LoginStatus.EXPIRED):
            try:
                await adapter.cleanup_session(session_id)
            finally:
                async with sessions_lock:
                    sessions.pop(session_id, None)
            logger.info(f"[Worker] Session cleaned: {session_id[:8]} status={result.status.value}")

        return {
            "success": True,
            "data": {
                "status": result.status.value,
                "message": result.message,
                "cookies": result.cookies,
                "user_info": {
                    "user_id": result.user_info.user_id if result.user_info else None,
                    "name": result.user_info.name if result.user_info else None,
                    "avatar": result.user_info.avatar if result.user_info else None,
                    "extra": result.user_info.extra if result.user_info else None,
                } if result.user_info else None,
                "full_state": result.full_state,
            }
        }

    except Exception as e:
        err = str(e) or type(e).__name__
        if isinstance(e, NotImplementedError) and sys.platform == "win32":
            err = (
                f"{err} (Windows asyncio subprocess 未启用；"
                f"policy={asyncio.get_event_loop_policy().__class__.__name__}；"
                "请使用 start_worker.bat 启动 Worker，勿用 reload)"
            )
        logger.error(f"[Worker] Poll status failed: {err}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": err}
        )


@app.delete("/qrcode/cancel/{session_id}")
async def cancel_qrcode(session_id: str):
    """
    取消登录会话

    Args:
        session_id: 会话ID
    """
    try:
        async with sessions_lock:
            session = sessions.get(session_id)
        if not session:
            return JSONResponse(status_code=404, content={"success": False, "error": "Session not found"})

        await _cleanup_session(session_id, session)
        async with sessions_lock:
            sessions.pop(session_id, None)

        logger.info(f"[Worker] Session cancelled: {session_id[:8]}")

        return {"success": True, "message": "Session cancelled"}

    except Exception as e:
        err = str(e) or type(e).__name__
        if isinstance(e, NotImplementedError) and sys.platform == "win32":
            err = (
                f"{err} (Windows asyncio subprocess 未启用；"
                f"policy={asyncio.get_event_loop_policy().__class__.__name__}；"
                "请使用 start_worker.bat 启动 Worker，勿用 reload)"
            )
        logger.error(f"[Worker] Cancel session failed: {err}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": err}
        )


@app.on_event("startup")
async def startup_event():
    """启动事件"""
    logger.info("=" * 60)
    logger.info("Playwright Worker Started")
    logger.info("=" * 60)
    logger.info(f"Event Loop Policy: {asyncio.get_event_loop_policy().__class__.__name__}")
    logger.info(f"Supported Platforms: {list(PLATFORM_ADAPTERS.keys())}")
    logger.info("=" * 60)

    async def _periodic_cleanup():
        while True:
            try:
                now = asyncio.get_running_loop().time()
                async with sessions_lock:
                    expired = [
                        (sid, s)
                        for sid, s in sessions.items()
                        if now - float(s.get("created_at", now)) > float(s.get("expires_in", 300))
                    ]
                for sid, s in expired:
                    try:
                        await _cleanup_session(sid, s)
                    except Exception as e:
                        logger.warning(f"[Worker] Periodic cleanup failed: {sid[:8]} {e}")
                    finally:
                        async with sessions_lock:
                            sessions.pop(sid, None)
                await asyncio.sleep(15)
            except asyncio.CancelledError:
                raise
            except Exception as e:
                logger.warning(f"[Worker] Periodic cleanup loop error: {e}")
                await asyncio.sleep(5)

    global _cleanup_task
    _cleanup_task = asyncio.create_task(_periodic_cleanup())


@app.on_event("shutdown")
async def shutdown_event():
    """关闭事件 - 清理所有会话"""
    logger.info("[Worker] Shutting down, cleaning up sessions...")

    global _cleanup_task
    if _cleanup_task:
        _cleanup_task.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await _cleanup_task
        _cleanup_task = None

    async with sessions_lock:
        items = list(sessions.items())

    for session_id, session in items:
        try:
            await _cleanup_session(session_id, session)
        except Exception as e:
            logger.error(f"[Worker] Cleanup failed for {session_id[:8]}: {e}")

    async with sessions_lock:
        sessions.clear()
    logger.info("[Worker] All sessions cleaned")


if __name__ == "__main__":
    # 配置
    HOST = "127.0.0.1"
    PORT = 7001  # 使用不同的端口，避免与 API 服务冲突

    logger.info(f"Starting Playwright Worker on http://{HOST}:{PORT}")

    # 启动服务（不使用 reload）
    uvicorn.run(
        app,
        host=HOST,
        port=PORT,
        log_level="info",
        loop="asyncio"  # 使用我们设置的事件循环策略
    )
