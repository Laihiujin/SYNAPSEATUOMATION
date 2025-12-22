"""
OTP验证码路由（FastAPI版）
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import sys
from pathlib import Path
from loguru import logger

# 添加platforms模块到路径
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent.parent))

from platforms.verification import verification_manager

router = APIRouter(prefix="/verification", tags=["验证码"])


class SubmitCodeRequest(BaseModel):
    """提交验证码请求"""
    account_id: str
    code: str


@router.get("/otp-events")
async def get_otp_events():
    """
    获取待处理的OTP验证码事件
    前端通过轮询此接口获取需要用户输入验证码的事件
    """
    try:
        events = verification_manager.get_pending_events()
        return {
            "success": True,
            "events": events,
            "count": len(events)
        }
    except Exception as e:
        logger.error(f"获取OTP事件失败: {e}")
        return {
            "success": False,
            "events": [],
            "count": 0,
            "error": str(e)
        }


@router.post("/submit-code")
async def submit_verification_code(request: SubmitCodeRequest):
    """
    提交验证码
    前端用户输入验证码后调用此接口
    """
    success = verification_manager.submit_code(
        account_id=request.account_id,
        code=request.code
    )

    if success:
        return {
            "success": True,
            "message": "验证码已提交"
        }
    else:
        raise HTTPException(
            status_code=400,
            detail="提交验证码失败"
        )
