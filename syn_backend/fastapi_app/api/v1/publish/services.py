"""
发布模块业务逻辑层
集成任务队列、预设管理、文件验证、账号验证
"""
import sys
import json
import uuid
import re
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor
import asyncio
import warnings

from sqlalchemy import text

# 添加路径以导入现有模块
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent.parent))

from myUtils.task_queue_manager import TaskQueueManager, Task, TaskType, TaskStatus
from myUtils.preset_manager import PresetManager
from myUtils.cookie_manager import cookie_manager
from myUtils.platform_metadata_adapter import format_metadata_for_platform
from fastapi_app.core.logger import logger
from fastapi_app.core.exceptions import NotFoundException, BadRequestException
from fastapi_app.db.runtime import mysql_enabled, sa_connection
from platforms.path_utils import resolve_video_file


class PublishService:
    """发布服务"""

    # 平台代码映射
    PLATFORM_MAP = {
        1: "xiaohongshu",
        2: "channels",
        3: "douyin",
        4: "kuaishou",
        5: "bilibili"
    }

    def __init__(self, task_manager: TaskQueueManager):
        self.task_manager = task_manager
        self.preset_manager = PresetManager()
        self.executor = ThreadPoolExecutor(max_workers=3)

    def _portable_video_path(self, raw: str) -> str:
        """
        Make the stored `file_path` resilient to repo moves.

        If DB stores an absolute path that no longer exists (e.g. D:\\... from an old location),
        enqueue a portable filename/relative path so `resolve_video_file()` can map it on the worker host.
        """
        if not raw:
            return raw
        try:
            p = Path(str(raw))
            if p.exists():
                return str(p)
            resolved = resolve_video_file(str(raw))
            if resolved and Path(resolved).exists():
                return str(resolved)
            # If absolute but missing, enqueue basename so resolver can find it under syn_backend/videoFile.
            if p.is_absolute():
                return p.name
        except Exception:
            pass
        return str(raw)

    async def validate_file(self, db, file_id: int) -> Dict[str, Any]:
        """验证文件是否存在"""
        if mysql_enabled():
            warnings.warn("SQLite publish/file path is deprecated; using MySQL via DATABASE_URL", DeprecationWarning)
            with sa_connection() as conn:
                row = conn.execute(
                    text("SELECT * FROM file_records WHERE id = :id"),
                    {"id": file_id},
                ).mappings().first()
            if not row:
                raise NotFoundException(f"文件不存在 ID {file_id}")
            return dict(row)

        cursor = db.cursor()
        cursor.execute("SELECT * FROM file_records WHERE id = ?", (file_id,))
        row = cursor.fetchone()

        if not row:
            raise NotFoundException(f"文件不存在: ID {file_id}")

        return dict(row)

    async def validate_accounts(self, account_ids: List[str], platform_code: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        验证账号是否存在且有效
        如果 platform_code 为 None，则不验证平台匹配（用于多平台发布）
        """
        valid_accounts = []

        for account_id in account_ids:
            account = cookie_manager.get_account_by_id(account_id)
            if not account:
                raise NotFoundException(f"账号不存在: {account_id}")

            # 检查 cookie_file 是否存在
            if not account.get('cookie_file'):
                logger.error(f"账号 {account_id} 的 cookie_file 为空")
                raise BadRequestException(
                    f"账号 {account_id} 的 Cookie 文件路径为空，无法发布。"
                    f"请重新导入该账号或联系管理员。"
                )

            # 如果指定了平台，检查平台是否匹配
            if platform_code is not None and account.get('platform_code') != platform_code:
                raise BadRequestException(
                    f"账号 {account_id} 平台不匹配 (期望: {self.PLATFORM_MAP[platform_code]}, "
                    f"实际: {account.get('platform')})"
                )

            # 检查账号状态
            if account.get('status') != 'valid':
                logger.warning(f"账号 {account_id} 状态为 {account.get('status')}, 可能无法发布")

            logger.info(f"✅ 验证账号: {account_id} - Cookie文件: {account.get('cookie_file')}")
            valid_accounts.append(account)

        return valid_accounts

    async def publish_batch(
        self,
        db,
        file_ids: List[int],
        accounts: List[str],
        platform: Optional[int] = None,
        title: str = "",
        description: Optional[str] = None,
        topics: Optional[List[str]] = None,
        cover_path: Optional[str] = None,
        scheduled_time: Optional[str] = None,
        interval_control_enabled: bool = False,
        interval_mode: Optional[str] = None,
        interval_seconds: Optional[int] = 300,
        priority: int = 5,
        items: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        批量发布
        支持单平台和多平台发布
        - 如果指定了 platform，则只发布到该平台（验证账号必须属于该平台）
        - 如果未指定 platform，则支持多平台发布（自动按账号平台分组）
        """
        batch_id = f"batch_{uuid.uuid4().hex[:12]}"
        results = {
            "batch_id": batch_id,
            "total_tasks": 0,
            "success_count": 0,
            "failed_count": 0,
            "pending_count": 0,
            "tasks": []
        }

        # 定时发布：批量任务会立即执行，但在平台侧设置“定时发布”时间
        timer_config = None
        if scheduled_time:
            timer_config = self._parse_schedule_time(scheduled_time)
            logger.info(f"批量定时发布配置: {timer_config}")

        # 验证账号（如果指定了平台则验证平台匹配，否则不验证）
        try:
            valid_accounts = await self.validate_accounts(accounts, platform)
        except Exception as e:
            logger.error(f"批量发布账号验证失败: {e}")
            raise

        # 如果是多平台发布，按平台分组账号
        if platform is None:
            # 按平台分组
            from collections import defaultdict
            accounts_by_platform = defaultdict(list)
            for account in valid_accounts:
                acc_platform = account.get('platform_code')
                if acc_platform:
                    accounts_by_platform[acc_platform].append(account)

            logger.info(f"多平台发布: 检测到 {len(accounts_by_platform)} 个平台")

            # 为每个平台创建任务
            for plat_code, plat_accounts in accounts_by_platform.items():
                await self._create_batch_tasks(
                    db, batch_id, file_ids, plat_accounts, plat_code,
                    title,
                    description,
                    topics,
                    cover_path,
                    priority,
                    items,
                    results,
                    timer_config,
                    interval_control_enabled=interval_control_enabled,
                    interval_mode=interval_mode,
                    interval_seconds=interval_seconds,
                )
        else:
            # 单平台发布
            await self._create_batch_tasks(
                db, batch_id, file_ids, valid_accounts, platform,
                title,
                description,
                topics,
                cover_path,
                priority,
                items,
                results,
                timer_config,
                interval_control_enabled=interval_control_enabled,
                interval_mode=interval_mode,
                interval_seconds=interval_seconds,
            )

        logger.info(
            f"批量发布任务创建完成: batch_id={batch_id}, "
            f"成功={results['success_count']}, 失败={results['failed_count']}"
        )

        return results

    async def _create_batch_tasks(
        self,
        db,
        batch_id: str,
        file_ids: List[int],
        accounts: List[Dict[str, Any]],
        platform: int,
        title: str,
        description: Optional[str],
        topics: Optional[List[str]],
        cover_path: Optional[str],
        priority: int,
        items: Optional[List[Dict[str, Any]]],
        results: Dict[str, Any],
        timer_config: Optional[Dict[str, Any]] = None,
        *,
        interval_control_enabled: bool = False,
        interval_mode: Optional[str] = None,
        interval_seconds: Optional[int] = 300,
    ):
        """创建批量发布任务的内部方法"""
        base_time = datetime.now()
        interval_s = int(interval_seconds or 0)
        mode = (interval_mode or "").strip()
        # 为每个文件和每个账号创建独立任务
        for file_idx, file_id in enumerate(file_ids):
            try:
                # 验证文件
                file_record = await self.validate_file(db, file_id)

                # Material metadata (from素材库), used as defaults when request doesn't override.
                stored_title = file_record.get("ai_title") or file_record.get("title")
                stored_desc = file_record.get("ai_description") or file_record.get("description")
                stored_cover = file_record.get("cover_image") or file_record.get("cover")

                stored_tags: List[str] = []
                raw_tags_field = file_record.get("tags")
                if raw_tags_field:
                    try:
                        if isinstance(raw_tags_field, str):
                            parsed = json.loads(raw_tags_field)
                            if isinstance(parsed, list):
                                stored_tags = [str(t) for t in parsed if str(t).strip()]
                            else:
                                # Accept common separators (comma/space/Chinese comma) and strip leading '#'
                                parts = [p for p in re.split(r"[\s,，]+", raw_tags_field) if p and p.strip()]
                                stored_tags = [p.lstrip("#").strip() for p in parts if p.lstrip("#").strip()]
                        elif isinstance(raw_tags_field, list):
                            stored_tags = [str(t) for t in raw_tags_field if str(t).strip()]
                    except Exception:
                        parts = [p for p in re.split(r"[\s,，]+", str(raw_tags_field)) if p and p.strip()]
                        stored_tags = [p.lstrip("#").strip() for p in parts if p.lstrip("#").strip()]

                parsed_ai_tags: List[str] = []
                if file_record.get('ai_tags'):
                    try:
                        raw_tags = file_record.get('ai_tags')
                        parsed = json.loads(raw_tags) if isinstance(raw_tags, str) else raw_tags
                        if isinstance(parsed, list):
                            parsed_ai_tags = [str(tag) for tag in parsed if str(tag).strip()]
                    except Exception as e:
                        logger.warning(f"Failed to parse ai_tags for file {file_id}: {e}")

                # 查找是否有独立配置
                item_config = next((i for i in (items or []) if (i.file_id if hasattr(i, 'file_id') else i.get('file_id')) == file_id), None)

                # 调试日志
                logger.info(f"📝 [Publish Debug] file_id={file_id}")
                logger.info(f"📝 [Publish Debug] item_config={item_config}")
                logger.info(f"📝 [Publish Debug] global title={title}")
                logger.info(f"📝 [Publish Debug] global description={description}")

                # 确定最终参数（优先使用 item_config，否则使用统一参数）
                # 支持 Pydantic 模型和字典两种格式
                if item_config:
                    if hasattr(item_config, 'title'):
                        # Pydantic 模型
                        final_title = item_config.title if item_config.title else (title or stored_title or Path(file_record['file_path']).stem)
                        final_desc = item_config.description if item_config.description is not None else (description or stored_desc or "")
                        final_topics = item_config.topics if item_config.topics is not None else (topics or stored_tags or [])
                        final_cover = item_config.cover_path if item_config.cover_path else (cover_path or stored_cover or "")
                    else:
                        # 字典格式
                        final_title = item_config.get('title') if item_config.get('title') else (title or stored_title or Path(file_record['file_path']).stem)
                        final_desc = item_config.get('description') if item_config.get('description') is not None else (description or stored_desc or "")
                        final_topics = item_config.get('topics') if item_config.get('topics') is not None else (topics or stored_tags or [])
                        final_cover = item_config.get('cover_path') if item_config.get('cover_path') else (cover_path or stored_cover or "")
                else:
                    final_title = title or stored_title or Path(file_record['file_path']).stem
                    final_desc = description or stored_desc or ""
                    final_topics = topics or stored_tags or []
                    final_cover = cover_path or stored_cover or ""

                if (not final_topics) and parsed_ai_tags:
                    final_topics = parsed_ai_tags

                logger.info(f"✅ [Publish Debug] final_title={final_title}")
                logger.info(f"✅ [Publish Debug] final_desc={final_desc}")
                logger.info(f"✅ [Publish Debug] final_topics={final_topics}")

                # 🆕 使用平台适配器格式化元数据
                formatted_metadata = format_metadata_for_platform(
                    platform_code=platform,
                    metadata={
                        "title": final_title,
                        "description": final_desc,
                        "topics": final_topics
                    }
                )
                logger.info(f"🎯 [Platform Adapter] Formatted metadata for platform {platform}: {formatted_metadata}")

                # 为每个账号创建独立任务
                for account_idx, account in enumerate(accounts):
                    # 调试：记录文件路径信息
                    raw_file_path = file_record.get("file_path") or ""
                    portable_path = self._portable_video_path(raw_file_path)
                    logger.info(f"[PublishService] file_id={file_id}, raw_path={raw_file_path}, portable_path={portable_path}")
                    logger.info(f"[PublishService] Path exists: {Path(portable_path).exists() if portable_path else False}")

                    # 创建任务数据（单个账号），使用格式化后的元数据
                    task_data = {
                        "batch_id": batch_id,
                        "file_id": file_id,
                        "video_path": portable_path,
                        "account_id": account['account_id'],
                        "account_name": account.get("original_name") or account.get("name") or account.get("account_id"),
                        "cookie_file": account['cookie_file'],
                        "platform": platform,
                        "title": formatted_metadata.get("title", final_title),
                        "description": formatted_metadata.get("description", final_desc),
                        "tags": formatted_metadata.get("tags", final_topics),
                        "publish_date": (timer_config or {}).get("scheduled_time") or 0,
                        "thumbnail_path": final_cover or "",
                    }

                    # Optional interval control: delay task execution by setting `not_before`.
                    if interval_control_enabled and interval_s > 0 and mode in ("account_first", "video_first"):
                        if mode == "video_first":
                            offset = file_idx * interval_s
                        else:
                            # account_first: stagger accounts and keep each account's files sequential.
                            offset = (account_idx * interval_s) + (file_idx * interval_s * max(len(accounts), 1))
                        task_data["not_before"] = (base_time + timedelta(seconds=offset)).isoformat()

                    task_id = f"publish_{batch_id}_{file_id}_{account['account_id']}"
                    task = Task(
                        task_id=task_id,
                        task_type=TaskType.PUBLISH,
                        data=task_data,
                        priority=priority,
                        max_retries=0  # 禁用自动重试，失败任务需手动处理
                    )

                    success = self.task_manager.add_task(task)
                    results["total_tasks"] += 1

                    if success:
                        results["success_count"] += 1
                        results["pending_count"] += 1
                        results["tasks"].append({
                            "task_id": task_id,
                            "file_id": file_id,
                            "platform": platform,
                            "account_id": account['account_id'],
                            "status": "pending"
                        })
                    else:
                        results["failed_count"] += 1
                        results["tasks"].append({
                            "task_id": task_id,
                            "file_id": file_id,
                            "platform": platform,
                            "account_id": account['account_id'],
                            "status": "failed",
                            "error_message": "无法添加到任务队列"
                        })

            except Exception as e:
                logger.error(f"批量发布文件 {file_id} 失败: {e}")
                results["failed_count"] += 1
                results["total_tasks"] += 1
                results["tasks"].append({
                    "task_id": f"failed_{file_id}",
                    "file_id": file_id,
                    "platform": platform,
                    "status": "failed",
                    "error_message": str(e)
                })

    async def list_presets(self) -> List[Dict[str, Any]]:
        """获取所有发布预设"""
        loop = asyncio.get_event_loop()
        presets = await loop.run_in_executor(
            self.executor,
            self.preset_manager.get_all_presets
        )
        return presets

    async def create_preset(self, preset_data: Dict[str, Any]) -> Dict[str, Any]:
        """创建发布预设"""
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            self.executor,
            self.preset_manager.create_preset,
            preset_data
        )

        if not result.get('success'):
            raise BadRequestException(f"创建预设失败: {result.get('error')}")

        logger.info(f"预设创建成功: {preset_data.get('name')} (ID: {result.get('id')})")
        return result

    async def update_preset(self, preset_id: int, preset_data: Dict[str, Any]) -> Dict[str, Any]:
        """更新发布预设"""
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            self.executor,
            self.preset_manager.update_preset,
            preset_id,
            preset_data
        )

        if not result.get('success'):
            raise BadRequestException(f"更新预设失败: {result.get('error')}")

        logger.info(f"预设更新成功: ID {preset_id}")
        return result

    async def delete_preset(self, preset_id: int) -> Dict[str, Any]:
        """删除发布预设"""
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            self.executor,
            self.preset_manager.delete_preset,
            preset_id
        )

        if not result.get('success'):
            raise NotFoundException(f"预设不存在: ID {preset_id}")

        logger.info(f"预设删除成功: ID {preset_id}")
        return result

    async def use_preset(
        self,
        db,
        preset_id: int,
        file_ids: List[int],
        override_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        使用预设发布
        支持覆盖预设中的部分参数
        """
        # 获取预设
        loop = asyncio.get_event_loop()
        presets = await loop.run_in_executor(
            self.executor,
            self.preset_manager.get_all_presets
        )

        preset = next((p for p in presets if p['id'] == preset_id), None)
        if not preset:
            raise NotFoundException(f"预设不存在: ID {preset_id}")

        # 增加使用次数
        await loop.run_in_executor(
            self.executor,
            self.preset_manager.increment_usage,
            preset_id
        )

        # 构建发布参数
        publish_params = {
            "file_ids": file_ids,
            "accounts": preset.get('accounts', []),
            "platform": preset.get('platform'),
            "title": preset.get('default_title') or preset.get('title', ''),
            "description": preset.get('description', ''),
            "topics": preset.get('tags', [])
        }

        # 应用覆盖参数
        if override_data:
            publish_params.update(override_data)

        # 批量发布
        result = await self.publish_batch(db, **publish_params)

        logger.info(f"使用预设发布: preset_id={preset_id}, batch_id={result.get('batch_id')}")
        return result

    async def get_publish_history(
        self,
        db,
        platform: Optional[int] = None,
        status: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """获取发布历史"""
        if mysql_enabled():
            warnings.warn("SQLite publish_tasks path is deprecated; using MySQL via DATABASE_URL", DeprecationWarning)
            where = ["1=1"]
            params: dict = {"limit": int(limit)}

            if platform:
                where.append("platform = :platform")
                params["platform"] = str(platform)
            if status:
                where.append("status = :status")
                params["status"] = status

            where_sql = " AND ".join(where)
            with sa_connection() as conn:
                rows = conn.execute(
                    text(f"SELECT * FROM publish_tasks WHERE {where_sql} ORDER BY created_at DESC LIMIT :limit"),
                    params,
                ).mappings().all()
            return [dict(r) for r in rows]

        cursor = db.cursor()

        query = "SELECT * FROM publish_tasks WHERE 1=1"
        params = []

        if platform:
            query += " AND platform = ?"
            params.append(str(platform))

        if status:
            query += " AND status = ?"
            params.append(status)

        query += " ORDER BY created_at DESC LIMIT ?"
        params.append(limit)

        cursor.execute(query, params)
        rows = cursor.fetchall()

        history = []
        for row in rows:
            history.append(dict(row))

        return history

    def _parse_schedule_time(self, scheduled_time: str) -> Dict[str, Any]:
        """
        解析定时发布时间
        格式: "YYYY-MM-DD HH:MM" 或 "HH:MM"
        """
        try:
            # 尝试解析完整日期时间
            if " " in scheduled_time:
                target_time = datetime.strptime(scheduled_time, "%Y-%m-%d %H:%M")
            else:
                # 只有时间，使用今天或明天的日期
                time_obj = datetime.strptime(scheduled_time, "%H:%M")
                now = datetime.now()
                target_time = now.replace(
                    hour=time_obj.hour,
                    minute=time_obj.minute,
                    second=0,
                    microsecond=0
                )

                # 如果时间已过，设置为明天
                if target_time < now:
                    target_time += timedelta(days=1)

            # 计算延迟秒数
            delay_seconds = (target_time - datetime.now()).total_seconds()

            if delay_seconds < 0:
                raise ValueError("定时时间不能早于当前时间")

            return {
                "scheduled_time": target_time.isoformat(),
                "delay_seconds": int(delay_seconds),
                "enable_timer": True
            }

        except ValueError as e:
            raise BadRequestException(f"定时时间格式错误: {str(e)}")


# 全局服务实例工厂
def get_publish_service(task_manager: TaskQueueManager) -> PublishService:
    """获取发布服务实例"""
    return PublishService(task_manager)
