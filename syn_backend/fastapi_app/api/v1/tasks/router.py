"""
任务队列路由（FastAPI 迁移版）
"""
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, Query, Request
from pydantic import BaseModel, Field
from loguru import logger

router = APIRouter(prefix="/tasks", tags=["任务队列"])


def _get_task_manager(request: Request):
    """从app.state获取task_manager"""
    tm = getattr(request.app.state, "task_manager", None)
    if not tm:
        raise HTTPException(status_code=503, detail="任务队列服务未启用")
    return tm


def _summarize_tasks(tasks: List[Dict[str, Any]]) -> Dict[str, int]:
    summary = {
        "pending": 0,
        "running": 0,
        "success": 0,
        "failed": 0,
        "cancelled": 0,
        "retry": 0,
        "total": len(tasks),
    }
    for task in tasks:
        status = (task.get("status") or "").lower()
        if status in ("pending", "retry"):
            summary["pending"] += 1
            if status == "retry":
                summary["retry"] += 1
        elif status == "running":
            summary["running"] += 1
        elif status == "success":
            summary["success"] += 1
        elif status == "failed":
            summary["failed"] += 1
        elif status == "cancelled":
            summary["cancelled"] += 1
    return summary


@router.get("/health")
async def health(request: Request):
    tm = getattr(request.app.state, "task_manager", None)
    return {"status": "success", "enabled": tm is not None}


@router.get("/status/{task_id}")
async def task_status(task_id: str, request: Request):
    tm = _get_task_manager(request)
    status = tm.get_task_status(task_id)
    if status:
        return {"success": True, "data": status}
    raise HTTPException(status_code=404, detail="任务不存在")


@router.post("/cancel/{task_id}")
async def task_cancel(
    task_id: str,
    request: Request,
    force: bool = Query(False, description="强制取消（包括正在运行的任务）")
):
    """
    取消任务

    Args:
        task_id: 任务ID
        force: 是否强制取消（默认False，仅取消pending/retry任务；True时可取消running任务）
    """
    from fastapi_app.tasks.task_state_manager import task_state_manager

    # 优先使用 Redis TaskStateManager
    task_status = task_state_manager.get_task_state(task_id)
    if task_status:
        # 使用 Redis
        ok = task_state_manager.cancel_task(task_id)
        if ok:
            return {"success": True, "message": f"任务已取消"}
        raise HTTPException(status_code=400, detail="无法取消任务")

    # 回退到 SQLite
    tm = _get_task_manager(request)
    task_status = tm.get_task_status(task_id)
    if not task_status:
        raise HTTPException(status_code=404, detail="任务不存在")

    ok = tm.cancel_task(task_id, force=force) if hasattr(tm, 'cancel_task') else False
    if ok:
        return {"success": True, "message": f"任务已取消 (force={force})"}
    raise HTTPException(status_code=400, detail="无法取消任务（任务可能已完成或不存在）")


@router.get("/stats")
async def task_stats(request: Request):
    tm = _get_task_manager(request)
    stats = tm.get_queue_stats() if hasattr(tm, "get_queue_stats") else {}
    return {"success": True, "data": stats}


@router.get("/", include_in_schema=True)
@router.get("", include_in_schema=False)
async def list_tasks(
    request: Request,
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = Query(None, description="过滤状态：pending/running/success/failed/cancelled")
):
    # 优先使用 Redis TaskStateManager，如果不可用则回退到旧的 SQLite task_manager
    from fastapi_app.tasks.task_state_manager import task_state_manager

    try:
        # 从 Redis 获取任务列表
        tasks = task_state_manager.list_tasks(status=status, limit=limit)
        summary = _summarize_tasks(tasks)

        # 添加 stats 字段（从 TaskStateManager 获取）
        stats = task_state_manager.get_queue_stats()

        return {
            "success": True,
            "data": tasks,
            "total": len(tasks),
            "summary": summary,
            "stats": stats,
        }
    except Exception as e:
        # 回退到旧的 SQLite 任务管理器
        logger.warning(f"[Tasks] Redis unavailable, falling back to SQLite: {e}")
        tm = _get_task_manager(request)
        tasks = tm.list_tasks(limit=limit, status=status)
        summary = _summarize_tasks(tasks)
        stats = tm.get_queue_stats() if hasattr(tm, "get_queue_stats") else {}
        return {
            "success": True,
            "data": tasks,
            "total": len(tasks),
            "summary": summary,
            "stats": stats,
        }


@router.get("/list")
async def list_tasks_alias(
    request: Request,
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = Query(None, description="过滤状态：pending/running/success/failed/cancelled")
):
    """兼容前端 /api/tasks/list 调用"""
    return await list_tasks(request, limit, status)


@router.get("/{task_id}")
async def task_detail(task_id: str, request: Request):
    tm = _get_task_manager(request)
    data = tm.get_task_status(task_id)
    if not data:
        raise HTTPException(status_code=404, detail="任务不存在")
    return {"success": True, "data": data}


@router.get("/{task_id}/cancel")
async def task_cancel_alias(task_id: str, request: Request):
    # 兼容旧路由
    return await task_cancel(task_id, request)


@router.get("/logs/recent")
async def task_logs(request: Request, limit: int = Query(200, ge=1, le=2000)):
    tm = _get_task_manager(request)
    tasks = tm.list_tasks(limit=limit)
    logs = [
        {
            "task_id": t.get("task_id"),
            "task_type": t.get("task_type"),
            "status": t.get("status"),
            "result": t.get("result"),
            "error_message": t.get("error_message"),
            "created_at": t.get("created_at"),
            "completed_at": t.get("completed_at"),
        }
        for t in tasks
    ]
    return {"success": True, "data": logs, "total": len(logs)}


@router.post("/retry/{task_id}")
async def retry_failed_task(task_id: str, request: Request):
    """
    重试任务
    支持重试失败(failed)和待处理(pending)的任务
    """
    tm = _get_task_manager(request)

    print(f"[DEBUG] 开始重试任务: {task_id}")

    # 获取任务状态
    task_status = tm.get_task_status(task_id)
    if not task_status:
        print(f"[DEBUG] 任务不存在: {task_id}")
        raise HTTPException(status_code=404, detail="任务不存在")

    current_status = task_status.get("status")
    print(f"[DEBUG] 任务状态: {current_status}")

    # 允许重试 failed、pending、retry 状态的任务
    if current_status not in ["failed", "pending", "retry"]:
        print(f"[DEBUG] 任务状态 {current_status} 不允许重试")
        raise HTTPException(status_code=400, detail=f"只能重试失败或待处理的任务，当前状态: {current_status}")

    # 重新添加任务到队列
    try:
        from myUtils.task_queue_manager import Task, TaskType

        # 创建新的任务（使用原任务数据）
        original_data = task_status.get("data", {})
        new_task_id = f"{task_id}_retry_{int(__import__('time').time())}"

        print(f"[DEBUG] 创建新任务: {new_task_id}")
        print(f"[DEBUG] 原始数据: {original_data}")

        new_task = Task(
            task_id=new_task_id,
            task_type=TaskType.PUBLISH,
            data=original_data,
            priority=task_status.get("priority", 5),
            max_retries=0  # 保持禁用自动重试
        )

        success = tm.add_task(new_task)
        print(f"[DEBUG] 添加任务结果: {success}")

        if success:
            # 如果原任务是 pending 状态，删除旧任务避免重复执行
            if current_status in ["pending", "retry"]:
                print(f"[DEBUG] 删除原 pending 任务: {task_id}")
                tm.delete_task(task_id)

            return {
                "success": True,
                "message": "任务已重新添加到队列",
                "new_task_id": new_task_id,
                "original_task_id": task_id
            }
        else:
            raise HTTPException(status_code=500, detail="无法添加任务到队列")

    except HTTPException:
        raise
    except Exception as e:
        print(f"[DEBUG] 重试任务异常: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"重试任务失败: {str(e)}")


@router.delete("/{task_id}")
async def delete_task(task_id: str, request: Request):
    """
    删除任务记录
    注意：这只会从记录中删除，不会影响正在运行的任务
    """
    from fastapi_app.tasks.task_state_manager import task_state_manager

    # 优先使用 Redis TaskStateManager
    task_status = task_state_manager.get_task_state(task_id)
    if task_status:
        # 如果任务正在运行，先取消
        if task_status.get("status") == "running":
            task_state_manager.cancel_task(task_id)

        # 删除任务记录
        try:
            ok = task_state_manager.delete_task(task_id)
            if ok:
                return {"success": True, "message": "任务已删除"}
            raise HTTPException(status_code=500, detail="删除任务失败")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"删除任务失败: {str(e)}")

    # 回退到 SQLite
    tm = _get_task_manager(request)
    task_status = tm.get_task_status(task_id)
    if not task_status:
        raise HTTPException(status_code=404, detail="任务不存在")

    # 如果任务正在运行，先取消
    if task_status.get("status") == "running":
        if hasattr(tm, 'cancel_task'):
            tm.cancel_task(task_id)

    # 删除任务记录
    try:
        if hasattr(tm, 'delete_task'):
            tm.delete_task(task_id)
            return {"success": True, "message": "任务已删除"}
        else:
            return {"success": True, "message": "任务已取消（记录保留）"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除任务失败: {str(e)}")


@router.post("/clear/pending")
async def clear_pending_tasks(request: Request):
    """
    清理所有待处理（pending/retry）的任务
    """
    tm = _get_task_manager(request)

    try:
        # 获取所有待处理的任务
        pending_tasks = tm.list_tasks(limit=1000, status="pending")
        retry_tasks = tm.list_tasks(limit=1000, status="retry")
        all_pending = pending_tasks + retry_tasks
        deleted_count = 0

        for task in all_pending:
            task_id = task.get("task_id")
            if task_id and hasattr(tm, 'delete_task'):
                try:
                    tm.delete_task(task_id)
                    deleted_count += 1
                except Exception as e:
                    print(f"删除任务 {task_id} 失败: {e}")

        return {
            "success": True,
            "message": f"已清理 {deleted_count} 个待处理任务",
            "deleted_count": deleted_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"清理待处理任务失败: {str(e)}")


@router.post("/clear/all")
async def clear_all_tasks(request: Request):
    """
    清理所有任务（包括成功、失败、待处理等所有状态）- 强制删除
    """
    tm = _get_task_manager(request)
    if tm.list_tasks(limit=1, status="pending") or tm.list_tasks(limit=1, status="retry"):
        raise HTTPException(status_code=400, detail="存在等待中的任务，不允许清理")

    try:
        import sqlite3

        db_path = tm.db_path
        print(f"[DEBUG] 强制清理所有任务，数据库: {db_path}")

        with sqlite3.connect(db_path) as conn:
            cursor = conn.cursor()

            # 查询所有任务
            cursor.execute("SELECT COUNT(*) FROM task_queue")
            total_count = cursor.fetchone()[0]
            print(f"[DEBUG] 数据库中共有 {total_count} 个任务")

            # 强制删除所有任务
            cursor.execute("DELETE FROM task_queue")
            deleted_count = cursor.rowcount
            conn.commit()

            print(f"[DEBUG] 已删除 {deleted_count} 个任务")

            # 清理内存中的活跃任务
            with tm.lock:
                tm.active_tasks.clear()
                print(f"[DEBUG] 已清理内存中的活跃任务")

        return {
            "success": True,
            "message": f"已强制清理 {deleted_count} 个任务",
            "deleted_count": deleted_count
        }
    except Exception as e:
        print(f"[DEBUG] 清理所有任务异常: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"清理任务失败: {str(e)}")


@router.post("/clear/failed")
async def clear_failed_tasks(request: Request):
    """
    清理所有失败的任务
    """
    tm = _get_task_manager(request)

    try:
        # 获取所有失败的任务
        failed_tasks = tm.list_tasks(limit=1000, status="failed")
        deleted_count = 0

        for task in failed_tasks:
            task_id = task.get("task_id")
            if task_id and hasattr(tm, 'delete_task'):
                try:
                    tm.delete_task(task_id)
                    deleted_count += 1
                except Exception as e:
                    print(f"删除任务 {task_id} 失败: {e}")

        return {
            "success": True,
            "message": f"已清理 {deleted_count} 个失败任务",
            "deleted_count": deleted_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"清理失败任务失败: {str(e)}")


@router.post("/clear/success")
async def clear_success_tasks(request: Request):
    """
    清理所有成功的任务
    """
    tm = _get_task_manager(request)

    try:
        # 获取所有成功的任务
        success_tasks = tm.list_tasks(limit=1000, status="success")
        deleted_count = 0

        for task in success_tasks:
            task_id = task.get("task_id")
            if task_id and hasattr(tm, 'delete_task'):
                try:
                    tm.delete_task(task_id)
                    deleted_count += 1
                except Exception as e:
                    print(f"删除任务 {task_id} 失败: {e}")

        return {
            "success": True,
            "message": f"已清理 {deleted_count} 个成功任务",
            "deleted_count": deleted_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"清理成功任务失败: {str(e)}")


class BatchTaskRequest(BaseModel):
    task_ids: List[str] = Field(..., description="任务ID列表")


@router.post("/batch/delete")
async def batch_delete_tasks(req: BatchTaskRequest, request: Request):
    """
    批量删除任务 - 强制删除
    """
    from fastapi_app.tasks.task_state_manager import task_state_manager

    success_count = 0
    failed_count = 0
    errors = []

    for task_id in req.task_ids:
        try:
            # 优先使用 Redis
            task_status = task_state_manager.get_task_state(task_id)
            if task_status:
                # Redis 任务
                ok = task_state_manager.delete_task(task_id)
                if ok:
                    success_count += 1
                    logger.info(f"[Tasks] Deleted task from Redis: {task_id}")
                else:
                    failed_count += 1
                    errors.append(f"删除任务 {task_id} 失败")
            else:
                # 回退到 SQLite
                tm = _get_task_manager(request)
                import sqlite3

                with sqlite3.connect(tm.db_path) as conn:
                    cursor = conn.cursor()
                    cursor.execute("DELETE FROM task_queue WHERE task_id = ?", (task_id,))
                    if cursor.rowcount > 0:
                        success_count += 1
                        logger.info(f"[Tasks] Deleted task from SQLite: {task_id}")
                    else:
                        failed_count += 1
                        errors.append(f"任务 {task_id} 不存在")
                    conn.commit()

        except Exception as e:
            failed_count += 1
            errors.append(f"删除任务 {task_id} 失败: {str(e)}")
            logger.error(f"[Tasks] Delete failed: {task_id} - {e}")

    return {
        "success": True,
        "message": f"批量删除完成: 成功 {success_count} 个，失败 {failed_count} 个",
        "success_count": success_count,
        "failed_count": failed_count,
        "errors": errors if errors else None
    }


@router.post("/batch/retry")
async def batch_retry_tasks(req: BatchTaskRequest, request: Request):
    """
    批量重试任务
    支持重试失败(failed)和待处理(pending)的任务
    """
    tm = _get_task_manager(request)

    success_count = 0
    failed_count = 0
    errors = []
    new_task_ids = []

    for task_id in req.task_ids:
        try:
            # 获取任务状态
            task_status = tm.get_task_status(task_id)
            if not task_status:
                failed_count += 1
                errors.append(f"任务 {task_id} 不存在")
                continue

            current_status = task_status.get("status")

            # 允许重试 failed、pending、retry 状态的任务
            if current_status not in ["failed", "pending", "retry"]:
                failed_count += 1
                errors.append(f"任务 {task_id} 状态为 {current_status}，只能重试失败或待处理的任务")
                continue

            # 创建新任务
            from myUtils.task_queue_manager import Task, TaskType

            original_data = task_status.get("data", {})
            new_task_id = f"{task_id}_retry_{int(__import__('time').time())}"

            new_task = Task(
                task_id=new_task_id,
                task_type=TaskType.PUBLISH,
                data=original_data,
                priority=task_status.get("priority", 5),
                max_retries=0
            )

            if tm.add_task(new_task):
                success_count += 1
                new_task_ids.append(new_task_id)

                # 如果原任务是 pending 状态，删除旧任务避免重复执行
                if current_status in ["pending", "retry"]:
                    tm.delete_task(task_id)
            else:
                failed_count += 1
                errors.append(f"任务 {task_id} 无法添加到队列")

        except Exception as e:
            failed_count += 1
            errors.append(f"重试任务 {task_id} 失败: {str(e)}")

    return {
        "success": True,
        "message": f"批量重试完成: 成功 {success_count} 个，失败 {failed_count} 个",
        "success_count": success_count,
        "failed_count": failed_count,
        "new_task_ids": new_task_ids,
        "errors": errors if errors else None
    }


@router.post("/batch/cancel")
async def batch_cancel_tasks(
    req: BatchTaskRequest,
    request: Request,
    force: bool = Query(False, description="强制取消（包括正在运行的任务）")
):
    """
    批量取消任务

    Args:
        req: 包含task_ids列表的请求
        force: 是否强制取消（默认False，仅取消pending/retry任务；True时可取消running任务）
    """
    from fastapi_app.tasks.task_state_manager import task_state_manager

    success_count = 0
    failed_count = 0
    errors = []

    for task_id in req.task_ids:
        try:
            # 优先使用 Redis
            task_status = task_state_manager.get_task_state(task_id)
            if task_status:
                # Redis 任务
                ok = task_state_manager.cancel_task(task_id)
                if ok:
                    success_count += 1
                    logger.info(f"[Tasks] Cancelled task from Redis: {task_id}")
                else:
                    failed_count += 1
                    errors.append(f"无法取消任务 {task_id}")
            else:
                # 回退到 SQLite
                tm = _get_task_manager(request)
                if hasattr(tm, 'cancel_task') and tm.cancel_task(task_id, force=force):
                    success_count += 1
                    logger.info(f"[Tasks] Cancelled task from SQLite: {task_id}")
                else:
                    failed_count += 1
                    errors.append(f"无法取消任务 {task_id}")

        except Exception as e:
            failed_count += 1
            errors.append(f"取消任务 {task_id} 失败: {str(e)}")
            logger.error(f"[Tasks] Cancel failed: {task_id} - {e}")

    return {
        "success": True,
        "message": f"批量取消完成 (force={force}): 成功 {success_count} 个，失败 {failed_count} 个",
        "success_count": success_count,
        "failed_count": failed_count,
        "errors": errors if errors else None
    }
