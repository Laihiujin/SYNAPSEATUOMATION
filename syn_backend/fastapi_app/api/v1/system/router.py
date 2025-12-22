"""
系统维护与工具 API 路由
将原本的脚本功能通过 FastAPI 接口暴露
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, Dict, Any
import asyncio
import subprocess
from pathlib import Path

router = APIRouter(prefix="/system", tags=["系统维护"])

# 脚本路径配置
SCRIPTS_DIR = Path(__file__).parent.parent.parent.parent / "scripts"


class SyncDatabaseRequest(BaseModel):
    """数据库同步请求"""
    force: bool = False
    backup: bool = True


class ConfigCheckResponse(BaseModel):
    """配置检查响应"""
    status: str
    issues: list[str]
    recommendations: list[str]


@router.post("/sync-database", summary="同步数据库")
async def sync_database(request: SyncDatabaseRequest, background_tasks: BackgroundTasks):
    """
    执行数据库同步操作
    原脚本: syn_backend/sync_db_files.py
    """
    try:
        # 导入同步逻辑
        from myUtils.db_sync import sync_databases
        
        # 在后台执行同步
        background_tasks.add_task(
            sync_databases,
            force=request.force,
            backup=request.backup
        )
        
        return {
            "status": "success",
            "message": "数据库同步任务已启动",
            "task_id": "sync_db_" + str(asyncio.current_task().get_name())
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"同步失败: {str(e)}")


@router.get("/check-config", response_model=ConfigCheckResponse, summary="检查系统配置")
async def check_config():
    """
    检查系统配置完整性
    原脚本: syn_backend/check_config.py
    """
    try:
        issues = []
        recommendations = []
        
        # 检查环境变量
        from fastapi_app.core.config import settings
        
        # 检查数据库文件
        db_files = [
            settings.DATABASE_PATH,
            settings.COOKIE_DB_PATH,
            settings.AI_LOGS_DB_PATH
        ]
        
        for db_file in db_files:
            if not Path(db_file).exists():
                issues.append(f"数据库文件不存在: {db_file}")
        
        # 检查必要目录
        required_dirs = [
            settings.COOKIE_FILES_DIR,
            settings.VIDEO_FILES_DIR,
            settings.UPLOAD_DIR
        ]
        
        for dir_path in required_dirs:
            if not Path(dir_path).exists():
                issues.append(f"目录不存在: {dir_path}")
                recommendations.append(f"创建目录: mkdir -p {dir_path}")
        
        # 检查 Playwright Worker（浏览器自动化已进程级解耦）
        try:
            import httpx
            resp = httpx.get("http://127.0.0.1:7001/health", timeout=3.0)
            resp.raise_for_status()
            browser_ok = resp.json().get("status") == "ok"
        except Exception:
            browser_ok = False

        if not browser_ok:
            issues.append("Playwright Worker 未运行或不可用")
            recommendations.append("运行: scripts/launchers/start_worker.bat (Windows) 或 python syn_backend/playwright_worker/worker.py")
        
        status = "healthy" if not issues else "warning"
        
        return ConfigCheckResponse(
            status=status,
            issues=issues,
            recommendations=recommendations
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"配置检查失败: {str(e)}")


@router.post("/manual-sync", summary="手动触发账号同步")
async def manual_sync(background_tasks: BackgroundTasks):
    """
    手动触发账号Cookie同步
    原脚本: syn_backend/manual_sync.py
    """
    try:
        from myUtils.cookie_manager import cookie_manager
        
        # 在后台执行同步
        async def sync_task():
            accounts = cookie_manager.list_flat_accounts()
            results = []
            
            for account in accounts:
                if account['status'] == 'valid':
                    try:
                        # 验证并更新Cookie
                        result = await cookie_manager.verify_account(account['account_id'])
                        results.append({
                            "account_id": account['account_id'],
                            "status": "success" if result else "failed"
                        })
                    except Exception as e:
                        results.append({
                            "account_id": account['account_id'],
                            "status": "error",
                            "error": str(e)
                        })
            
            return results
        
        background_tasks.add_task(sync_task)
        
        return {
            "status": "success",
            "message": "账号同步任务已启动"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"同步失败: {str(e)}")


@router.get("/inspect-biliup", summary="检查 Biliup 配置")
async def inspect_biliup():
    """
    检查 Biliup 上传工具配置
    原脚本: syn_backend/inspect_biliup.py
    """
    try:
        import importlib.util
        
        # 检查 biliup 是否安装
        biliup_spec = importlib.util.find_spec("biliup")
        
        if biliup_spec is None:
            return {
                "status": "not_installed",
                "message": "Biliup 未安装",
                "recommendation": "pip install biliup"
            }
        
        # 检查配置文件
        config_path = Path.home() / ".biliup" / "config.json"
        
        return {
            "status": "installed",
            "version": "检测中",
            "config_exists": config_path.exists(),
            "config_path": str(config_path)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"检查失败: {str(e)}")


@router.post("/cleanup-old-files", summary="清理旧文件")
async def cleanup_old_files(days: int = 30):
    """
    清理指定天数前的临时文件和日志
    """
    try:
        from datetime import datetime, timedelta
        import os
        
        cutoff_date = datetime.now() - timedelta(days=days)
        cleaned_files = []
        
        # 清理临时上传文件
        from fastapi_app.core.config import settings
        upload_dir = Path(settings.UPLOAD_DIR)
        
        if upload_dir.exists():
            for file in upload_dir.rglob("*"):
                if file.is_file():
                    file_mtime = datetime.fromtimestamp(file.stat().st_mtime)
                    if file_mtime < cutoff_date:
                        try:
                            file.unlink()
                            cleaned_files.append(str(file))
                        except Exception:
                            pass
        
        return {
            "status": "success",
            "cleaned_count": len(cleaned_files),
            "files": cleaned_files[:10]  # 只返回前10个
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"清理失败: {str(e)}")


@router.get("/health-check", summary="系统健康检查")
async def system_health_check():
    """
    全面的系统健康检查
    """
    try:
        health_status = {
            "database": "unknown",
            "browser": "unknown",
            "ai_service": "unknown",
            "disk_space": "unknown"
        }
        
        # 检查数据库连接
        try:
            from fastapi_app.db.session import main_db_pool
            conn = main_db_pool.get_connection()
            conn.execute("SELECT 1")
            main_db_pool.return_connection(conn)
            health_status["database"] = "healthy"
        except Exception:
            health_status["database"] = "unhealthy"
        
        # 检查浏览器（通过 Playwright Worker）
        try:
            import httpx
            resp = httpx.get("http://127.0.0.1:7001/health", timeout=3.0)
            resp.raise_for_status()
            health_status["browser"] = "healthy" if resp.json().get("status") == "ok" else "unhealthy"
        except Exception:
            health_status["browser"] = "unhealthy"
        
        # 检查 AI 服务
        try:
            from ai_service import AIClient
            health_status["ai_service"] = "healthy"
        except Exception:
            health_status["ai_service"] = "not_available"
        
        # 检查磁盘空间
        try:
            import shutil
            from fastapi_app.core.config import settings
            total, used, free = shutil.disk_usage(settings.BASE_DIR)
            free_gb = free // (2**30)
            health_status["disk_space"] = f"{free_gb}GB free"
        except Exception:
            health_status["disk_space"] = "unknown"
        
        overall_status = "healthy" if all(
            v in ["healthy", "not_available"] or "GB" in str(v)
            for v in health_status.values()
        ) else "degraded"
        
        return {
            "status": overall_status,
            "components": health_status,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"健康检查失败: {str(e)}")


@router.get("/playwright-worker/health", summary="Playwright Worker 健康信息")
async def playwright_worker_health():
    """代理 Worker 的 /health（便于在 API Docs 里一键检查）。"""
    try:
        import httpx

        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get("http://127.0.0.1:7001/health")
            resp.raise_for_status()
            return resp.json()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Worker health failed: {str(e) or type(e).__name__}")


@router.get("/playwright-worker/debug/playwright", summary="调试 Playwright 启动")
async def playwright_worker_debug_playwright(headless: bool = True):
    """
    代理 Worker 的 /debug/playwright（用于定位 Playwright/浏览器环境问题）。

    说明：Worker 需要已启动在 7001 端口。
    """
    try:
        import httpx

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get("http://127.0.0.1:7001/debug/playwright", params={"headless": headless})
            if resp.status_code >= 400:
                # 尽量透传 Worker 的报错
                try:
                    payload = resp.json()
                except Exception:
                    payload = {"success": False, "error": resp.text}
                raise HTTPException(status_code=502, detail=payload)
            return resp.json()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Worker debug failed: {str(e) or type(e).__name__}")


@router.get("/build", summary="构建/导入信息（调试）")
async def build_info():
    """用于确认实际运行的代码版本与模块导入来源（排查“改了代码但没生效”）。"""
    try:
        import importlib
        import sys
        import time
        from pathlib import Path

        def file_meta(path: str):
            try:
                p = Path(path)
                stat = p.stat()
                return {
                    "path": str(p),
                    "mtime": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(stat.st_mtime)),
                    "size": stat.st_size,
                }
            except Exception:
                return {"path": path}

        auth_router = importlib.import_module("fastapi_app.api.v1.auth.router")
        worker_client = importlib.import_module("playwright_worker.client")

        return {
            "python": sys.version.split(" ")[0],
            "sys_path_0": sys.path[0] if sys.path else None,
            "system_router": file_meta(__file__),
            "auth_router": file_meta(getattr(auth_router, "__file__", "unknown")),
            "playwright_worker_client": file_meta(getattr(worker_client, "__file__", "unknown")),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"build info failed: {str(e) or type(e).__name__}")
