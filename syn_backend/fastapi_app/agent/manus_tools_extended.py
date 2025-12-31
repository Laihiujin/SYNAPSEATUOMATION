"""
扩展的 OpenManus 工具集
包含数据采集、IP池管理、脚本执行等高级功能

NOTE: 此模块必须在 OpenManus Agent 初始化之后才能导入
"""
import os
import sys
from pathlib import Path
from typing import Any, Dict, Optional, List
import httpx
import json

# 添加 OpenManus-worker 到 Python 路径
OPENMANUS_PATH = Path(__file__).parent.parent.parent / "OpenManus-worker"
if str(OPENMANUS_PATH) not in sys.path:
    sys.path.insert(0, str(OPENMANUS_PATH))

from app.tool.base import BaseTool, ToolResult

# 后端 API 基础 URL（本地）
API_BASE_URL = os.getenv("MANUS_API_BASE_URL", "http://localhost:7000/api/v1")


# ============================================
# 数据采集工具
# ============================================

class MediaCrawlerTool(BaseTool):
    """MediaCrawler 数据采集工具"""

    name: str = "media_crawler"
    description: str = (
        "使用 MediaCrawler 采集社交媒体数据。"
        "支持抖音、小红书、快手、B站等平台的视频/笔记/评论采集。"
        "可配置关键词、数量、时间范围等参数。"
    )
    parameters: dict = {
        "type": "object",
        "properties": {
            "platform": {
                "type": "string",
                "enum": ["douyin", "xiaohongshu", "kuaishou", "bilibili"],
                "description": "采集平台"
            },
            "keywords": {
                "type": "array",
                "items": {"type": "string"},
                "description": "搜索关键词列表"
            },
            "max_count": {
                "type": "integer",
                "description": "每个关键词最大采集数量",
                "default": 20
            },
            "crawl_type": {
                "type": "string",
                "enum": ["search", "user", "video", "note"],
                "description": "采集类型",
                "default": "search"
            }
        },
        "required": ["platform", "keywords"]
    }

    async def execute(
        self,
        platform: str,
        keywords: List[str],
        max_count: int = 20,
        crawl_type: str = "search",
        **kwargs
    ) -> ToolResult:
        """执行数据采集"""
        try:
            async with httpx.AsyncClient(timeout=300.0) as client:
                crawl_data = {
                    "platform": platform,
                    "keywords": keywords,
                    "max_count": max_count,
                    "crawl_type": crawl_type
                }

                response = await client.post(
                    f"{API_BASE_URL}/mediacrawler/collect",
                    json=crawl_data
                )
                response.raise_for_status()
                result = response.json()

                task_id = result.get("data", {}).get("task_id")
                output = f"✅ 数据采集任务已启动！\n"
                output += f"- 任务 ID: {task_id}\n"
                output += f"- 平台: {platform}\n"
                output += f"- 关键词数: {len(keywords)}\n"
                output += f"- 关键词: {', '.join(keywords)}\n"

                return ToolResult(output=output)

        except Exception as e:
            return ToolResult(error=f"启动数据采集失败: {str(e)}")


class WechatChannelsCrawlerTool(BaseTool):
    """微信视频号数据采集工具"""

    name: str = "wechat_channels_crawler"
    description: str = (
        "采集微信视频号数据。"
        "支持根据关键词、用户ID采集视频信息。"
        "可配置采集数量、排序方式等。"
    )
    parameters: dict = {
        "type": "object",
        "properties": {
            "keyword": {
                "type": "string",
                "description": "搜索关键词"
            },
            "user_id": {
                "type": "string",
                "description": "用户ID（可选，用于采集特定用户的视频）"
            },
            "max_count": {
                "type": "integer",
                "description": "最大采集数量",
                "default": 20
            },
            "sort_type": {
                "type": "string",
                "enum": ["最新", "最热"],
                "description": "排序方式",
                "default": "最新"
            }
        },
        "required": []
    }

    async def execute(
        self,
        keyword: Optional[str] = None,
        user_id: Optional[str] = None,
        max_count: int = 20,
        sort_type: str = "最新",
        **kwargs
    ) -> ToolResult:
        """执行视频号采集"""
        try:
            async with httpx.AsyncClient(timeout=300.0) as client:
                crawl_data = {
                    "keyword": keyword,
                    "user_id": user_id,
                    "max_count": max_count,
                    "sort_type": sort_type
                }

                response = await client.post(
                    f"{API_BASE_URL}/wechat-channels/collect",
                    json=crawl_data
                )
                response.raise_for_status()
                result = response.json()

                task_id = result.get("data", {}).get("task_id")
                output = f"✅ 视频号采集任务已启动！\n"
                output += f"- 任务 ID: {task_id}\n"
                if keyword:
                    output += f"- 关键词: {keyword}\n"
                if user_id:
                    output += f"- 用户 ID: {user_id}\n"
                output += f"- 最大数量: {max_count}\n"

                return ToolResult(output=output)

        except Exception as e:
            return ToolResult(error=f"启动视频号采集失败: {str(e)}")


# ============================================
# IP 池管理工具
# ============================================

class IPPoolTool(BaseTool):
    """IP 池管理工具"""

    name: str = "ip_pool_manager"
    description: str = (
        "管理代理 IP 池。"
        "支持查询可用 IP、添加 IP、删除 IP、测试 IP 可用性等操作。"
    )
    parameters: dict = {
        "type": "object",
        "properties": {
            "action": {
                "type": "string",
                "enum": ["list", "add", "remove", "test"],
                "description": "操作类型"
            },
            "ip_address": {
                "type": "string",
                "description": "IP 地址（用于 add/remove/test）"
            },
            "port": {
                "type": "integer",
                "description": "端口号（用于 add）"
            },
            "username": {
                "type": "string",
                "description": "认证用户名（可选）"
            },
            "password": {
                "type": "string",
                "description": "认证密码（可选）"
            }
        },
        "required": ["action"]
    }

    async def execute(
        self,
        action: str,
        ip_address: Optional[str] = None,
        port: Optional[int] = None,
        username: Optional[str] = None,
        password: Optional[str] = None,
        **kwargs
    ) -> ToolResult:
        """执行 IP 池操作"""
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                if action == "list":
                    response = await client.get(f"{API_BASE_URL}/ip-pool")
                    response.raise_for_status()
                    result = response.json()
                    ips = result.get("data", [])
                    output = f"📋 IP 池列表（共 {len(ips)} 个）:\n"
                    for ip in ips:
                        output += f"- {ip.get('ip')}:{ip.get('port')} (状态: {ip.get('status')})\n"
                    return ToolResult(output=output)

                elif action == "add":
                    add_data = {
                        "ip": ip_address,
                        "port": port,
                        "username": username,
                        "password": password
                    }
                    response = await client.post(
                        f"{API_BASE_URL}/ip-pool",
                        json=add_data
                    )
                    response.raise_for_status()
                    return ToolResult(output=f"✅ IP {ip_address}:{port} 已添加到池中")

                elif action == "remove":
                    response = await client.delete(
                        f"{API_BASE_URL}/ip-pool/{ip_address}"
                    )
                    response.raise_for_status()
                    return ToolResult(output=f"✅ IP {ip_address} 已从池中移除")

                elif action == "test":
                    response = await client.post(
                        f"{API_BASE_URL}/ip-pool/test",
                        json={"ip": ip_address}
                    )
                    response.raise_for_status()
                    result = response.json()
                    is_valid = result.get("data", {}).get("valid", False)
                    msg = "可用" if is_valid else "不可用"
                    return ToolResult(output=f"IP {ip_address} 测试结果: {msg}")

        except Exception as e:
            return ToolResult(error=f"IP 池操作失败: {str(e)}")


# ============================================
# 平台账号登录工具
# ============================================

class PlatformLoginTool(BaseTool):
    """平台账号登录工具"""

    name: str = "platform_login"
    description: str = (
        "执行平台账号登录操作。"
        "支持抖音、快手、小红书、B站、视频号等平台。"
        "返回二维码或登录状态信息。"
    )
    parameters: dict = {
        "type": "object",
        "properties": {
            "platform": {
                "type": "string",
                "enum": ["douyin", "kuaishou", "xiaohongshu", "bilibili", "channels"],
                "description": "登录平台"
            },
            "account_id": {
                "type": "string",
                "description": "账号 ID（可选，新账号留空）"
            },
            "login_method": {
                "type": "string",
                "enum": ["qrcode", "sms", "password"],
                "description": "登录方式",
                "default": "qrcode"
            }
        },
        "required": ["platform"]
    }

    async def execute(
        self,
        platform: str,
        account_id: Optional[str] = None,
        login_method: str = "qrcode",
        **kwargs
    ) -> ToolResult:
        """执行平台登录"""
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                login_data = {
                    "platform": platform,
                    "account_id": account_id,
                    "login_method": login_method
                }

                response = await client.post(
                    f"{API_BASE_URL}/platforms/{platform}/login",
                    json=login_data
                )
                response.raise_for_status()
                result = response.json()

                data = result.get("data", {})
                session_id = data.get("session_id")
                qr_code_url = data.get("qr_code_url")
                status = data.get("status")

                output = f"✅ 登录会话已创建！\n"
                output += f"- 平台: {platform}\n"
                output += f"- 会话 ID: {session_id}\n"
                output += f"- 状态: {status}\n"

                if qr_code_url:
                    output += f"- 二维码地址: {qr_code_url}\n"
                    output += f"\n请使用手机 App 扫描二维码完成登录。"

                return ToolResult(output=output)

        except Exception as e:
            return ToolResult(error=f"平台登录失败: {str(e)}")


class CheckLoginStatusTool(BaseTool):
    """检查登录状态工具"""

    name: str = "check_login_status"
    description: str = (
        "检查平台账号的登录状态。"
        "用于确认扫码登录是否完成，或账号 Cookie 是否仍然有效。"
    )
    parameters: dict = {
        "type": "object",
        "properties": {
            "platform": {
                "type": "string",
                "enum": ["douyin", "kuaishou", "xiaohongshu", "bilibili", "channels"],
                "description": "平台名称"
            },
            "session_id": {
                "type": "string",
                "description": "会话 ID（登录时返回）"
            }
        },
        "required": ["platform", "session_id"]
    }

    async def execute(
        self,
        platform: str,
        session_id: str,
        **kwargs
    ) -> ToolResult:
        """检查登录状态"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{API_BASE_URL}/platforms/{platform}/login/status/{session_id}"
                )
                response.raise_for_status()
                result = response.json()

                data = result.get("data", {})
                status = data.get("status")
                account_info = data.get("account_info", {})

                output = f"📊 登录状态检查结果：\n"
                output += f"- 平台: {platform}\n"
                output += f"- 状态: {status}\n"

                if status == "success":
                    output += f"- 账号 ID: {account_info.get('account_id')}\n"
                    output += f"- 账号名: {account_info.get('username')}\n"
                    output += f"✅ 登录成功！"
                elif status == "pending":
                    output += "⏳ 等待扫码确认..."
                else:
                    output += "❌ 登录失败或超时"

                return ToolResult(output=output)

        except Exception as e:
            return ToolResult(error=f"检查登录状态失败: {str(e)}")


# ============================================
# 数据分析工具
# ============================================

class DataAnalyticsTool(BaseTool):
    """数据分析工具"""

    name: str = "data_analytics"
    description: str = (
        "获取数据分析报告。"
        "支持查看发布统计、互动数据、粉丝增长等指标。"
        "可按平台、时间范围筛选。"
    )
    parameters: dict = {
        "type": "object",
        "properties": {
            "report_type": {
                "type": "string",
                "enum": ["publish_stats", "engagement", "growth", "trends"],
                "description": "报告类型"
            },
            "platform": {
                "type": "string",
                "description": "平台筛选（可选）"
            },
            "start_date": {
                "type": "string",
                "description": "开始日期 (YYYY-MM-DD)"
            },
            "end_date": {
                "type": "string",
                "description": "结束日期 (YYYY-MM-DD)"
            }
        },
        "required": ["report_type"]
    }

    async def execute(
        self,
        report_type: str,
        platform: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        **kwargs
    ) -> ToolResult:
        """获取数据分析报告"""
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                params = {
                    "report_type": report_type
                }
                if platform:
                    params["platform"] = platform
                if start_date:
                    params["start_date"] = start_date
                if end_date:
                    params["end_date"] = end_date

                response = await client.get(
                    f"{API_BASE_URL}/analytics/report",
                    params=params
                )
                response.raise_for_status()
                result = response.json()

                data = result.get("data", {})

                output = f"📊 数据分析报告 - {report_type}\n\n"
                output += f"**时间范围**: {start_date or '全部'} ~ {end_date or '至今'}\n"
                if platform:
                    output += f"**平台**: {platform}\n"
                output += f"\n**统计数据**:\n"
                output += f"```json\n{json.dumps(data, ensure_ascii=False, indent=2)}\n```"

                return ToolResult(output=output)

        except Exception as e:
            return ToolResult(error=f"获取数据分析报告失败: {str(e)}")


# ============================================
# 脚本执行工具
# ============================================

class RunScriptTool(BaseTool):
    """运行后端脚本工具"""

    name: str = "run_backend_script"
    description: str = (
        "执行后端预定义的 Python 脚本。"
        "支持数据导出、批量处理、系统维护等操作。"
        "可传递参数给脚本。"
    )
    parameters: dict = {
        "type": "object",
        "properties": {
            "script_name": {
                "type": "string",
                "description": "脚本名称（不含 .py 后缀）"
            },
            "args": {
                "type": "object",
                "description": "脚本参数（键值对）"
            }
        },
        "required": ["script_name"]
    }

    async def execute(
        self,
        script_name: str,
        args: Optional[Dict[str, Any]] = None,
        **kwargs
    ) -> ToolResult:
        """执行后端脚本"""
        try:
            async with httpx.AsyncClient(timeout=300.0) as client:
                script_data = {
                    "script_name": script_name,
                    "args": args or {}
                }

                response = await client.post(
                    f"{API_BASE_URL}/scripts/run",
                    json=script_data
                )
                response.raise_for_status()
                result = response.json()

                data = result.get("data", {})
                task_id = data.get("task_id")
                status = data.get("status")

                output = f"✅ 脚本执行已启动！\n"
                output += f"- 脚本名称: {script_name}\n"
                output += f"- 任务 ID: {task_id}\n"
                output += f"- 状态: {status}\n"

                return ToolResult(output=output)

        except Exception as e:
            return ToolResult(error=f"脚本执行失败: {str(e)}")


# ============================================
# Cookie 管理工具
# ============================================

class CookieManagerTool(BaseTool):
    """Cookie 管理工具"""

    name: str = "cookie_manager"
    description: str = (
        "管理账号 Cookie。"
        "支持导入、导出、刷新 Cookie 等操作。"
        "用于账号状态维护和迁移。"
    )
    parameters: dict = {
        "type": "object",
        "properties": {
            "action": {
                "type": "string",
                "enum": ["list", "export", "import", "refresh"],
                "description": "操作类型"
            },
            "account_id": {
                "type": "string",
                "description": "账号 ID（用于 export/refresh）"
            },
            "platform": {
                "type": "string",
                "description": "平台名称（用于 list/import）"
            },
            "cookie_data": {
                "type": "string",
                "description": "Cookie 数据（JSON 字符串，用于 import）"
            }
        },
        "required": ["action"]
    }

    async def execute(
        self,
        action: str,
        account_id: Optional[str] = None,
        platform: Optional[str] = None,
        cookie_data: Optional[str] = None,
        **kwargs
    ) -> ToolResult:
        """执行 Cookie 操作"""
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                if action == "list":
                    params = {}
                    if platform:
                        params["platform"] = platform
                    response = await client.get(
                        f"{API_BASE_URL}/cookies",
                        params=params
                    )
                    response.raise_for_status()
                    result = response.json()
                    cookies = result.get("data", [])
                    output = f"📋 Cookie 列表（共 {len(cookies)} 个）:\n"
                    for cookie in cookies:
                        output += f"- {cookie.get('account_id')} ({cookie.get('platform')}) - 过期时间: {cookie.get('expires')}\n"
                    return ToolResult(output=output)

                elif action == "export":
                    response = await client.get(
                        f"{API_BASE_URL}/cookies/{account_id}/export"
                    )
                    response.raise_for_status()
                    result = response.json()
                    cookie_json = json.dumps(result.get("data", {}), ensure_ascii=False, indent=2)
                    return ToolResult(output=f"✅ Cookie 导出成功:\n```json\n{cookie_json}\n```")

                elif action == "import":
                    import_data = {
                        "platform": platform,
                        "cookie_data": json.loads(cookie_data) if cookie_data else {}
                    }
                    response = await client.post(
                        f"{API_BASE_URL}/cookies/import",
                        json=import_data
                    )
                    response.raise_for_status()
                    return ToolResult(output=f"✅ Cookie 已导入")

                elif action == "refresh":
                    response = await client.post(
                        f"{API_BASE_URL}/cookies/{account_id}/refresh"
                    )
                    response.raise_for_status()
                    result = response.json()
                    new_expires = result.get("data", {}).get("expires")
                    return ToolResult(output=f"✅ Cookie 已刷新，新过期时间: {new_expires}")

        except Exception as e:
            return ToolResult(error=f"Cookie 操作失败: {str(e)}")
