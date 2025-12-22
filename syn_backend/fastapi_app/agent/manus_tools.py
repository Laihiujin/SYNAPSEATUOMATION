"""
自定义 OpenManus 工具
连接 SynapseAutomation 后端 API
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
# 通用 API 调用工具
# ============================================

class CallAPITool(BaseTool):
    """通用 API 调用工具 - 可以调用任何后端接口"""

    name: str = "call_api"
    description: str = (
        "调用 SynapseAutomation 后端的任何 API 接口。"
        "支持 GET、POST、PUT、DELETE 等方法。"
        "可以传递查询参数、请求体等。"
        "用于执行各种系统操作，如创建计划、查询数据、修改配置等。"
    )
    parameters: dict = {
        "type": "object",
        "properties": {
            "endpoint": {
                "type": "string",
                "description": "API 端点路径（如 '/accounts'、'/files/videos'、'/publish/plans'）"
            },
            "method": {
                "type": "string",
                "enum": ["GET", "POST", "PUT", "DELETE", "PATCH"],
                "description": "HTTP 方法",
                "default": "GET"
            },
            "params": {
                "type": "object",
                "description": "查询参数（用于 GET 请求）"
            },
            "json_data": {
                "type": "object",
                "description": "JSON 请求体（用于 POST/PUT/PATCH 请求）"
            }
        },
        "required": ["endpoint"]
    }

    async def execute(
        self,
        endpoint: str,
        method: str = "GET",
        params: Optional[Dict] = None,
        json_data: Optional[Dict] = None,
        **kwargs
    ) -> ToolResult:
        """执行 API 调用"""
        try:
            # 确保 endpoint 以 / 开头
            if not endpoint.startswith("/"):
                endpoint = "/" + endpoint

            url = f"{API_BASE_URL}{endpoint}"

            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.request(
                    method=method.upper(),
                    url=url,
                    params=params,
                    json=json_data
                )
                response.raise_for_status()
                result = response.json()

                # 格式化输出
                output = f"✅ API 调用成功\n"
                output += f"- 端点: {method} {endpoint}\n"
                output += f"- 状态码: {response.status_code}\n\n"
                output += f"**响应数据**:\n```json\n{json.dumps(result, ensure_ascii=False, indent=2)}\n```"

                return ToolResult(output=output)

        except httpx.HTTPStatusError as e:
            return ToolResult(
                error=f"API 调用失败 ({e.response.status_code}): {e.response.text[:200]}"
            )
        except Exception as e:
            return ToolResult(error=f"API 调用出错: {str(e)}")


# ============================================
# 账号管理工具
# ============================================

class ListAccountsTool(BaseTool):
    """列出账号工具"""

    name: str = "list_accounts"
    description: str = (
        "获取系统中所有可用的社交媒体账号列表。"
        "包含账号 ID、平台、状态等信息。"
        "用于规划多账号发布任务。"
    )
    parameters: dict = {
        "type": "object",
        "properties": {
            "platform": {
                "type": "string",
                "description": "筛选平台（可选）：douyin, kuaishou, bilibili, xiaohongshu, channels"
            },
            "status": {
                "type": "string",
                "enum": ["active", "inactive", "all"],
                "description": "筛选状态（默认 active）",
                "default": "active"
            }
        }
    }

    async def execute(
        self,
        platform: Optional[str] = None,
        status: str = "active",
        **kwargs
    ) -> ToolResult:
        """列出账号"""
        try:
            # 状态映射：工具层 -> API层
            status_map = {
                "active": "valid",      # 活跃 -> 有效
                "inactive": "expired",   # 不活跃 -> 过期
                "all": None             # 全部 -> 不过滤
            }

            async with httpx.AsyncClient(timeout=30.0) as client:
                params = {}
                if platform:
                    params["platform"] = platform

                # 使用映射后的状态值
                mapped_status = status_map.get(status, "valid")
                if mapped_status:  # 如果不是 None（all）
                    params["status"] = mapped_status

                response = await client.get(
                    f"{API_BASE_URL}/accounts",
                    params=params
                )
                response.raise_for_status()
                result = response.json()

                accounts = result.get("items", [])  # 修改：使用 items 而不是 data
                total = result.get("total", 0)

                # 格式化输出
                output_lines = [f"📋 找到 {total} 个账号：\n"]
                for acc in accounts:
                    output_lines.append(
                        f"- [ID: {acc.get('account_id')}] "
                        f"{acc.get('platform', 'unknown')} - "
                        f"{acc.get('name', acc.get('username', 'N/A'))} "
                        f"({acc.get('status', 'unknown')})"
                    )

                return ToolResult(output="\n".join(output_lines))

        except Exception as e:
            return ToolResult(error=f"获取账号列表时出错: {str(e)}")


# ============================================
# 素材管理工具
# ============================================

class ListAssetsTool(BaseTool):
    """列出素材工具"""

    name: str = "list_assets"
    description: str = (
        "获取素材库中的视频列表。"
        "包含视频 ID、标题、时长、路径等信息。"
        "用于选择要发布的视频素材。"
    )
    parameters: dict = {
        "type": "object",
        "properties": {
            "limit": {
                "type": "integer",
                "description": "返回数量限制（默认 20）",
                "default": 20
            },
            "keyword": {
                "type": "string",
                "description": "搜索关键词（可选）"
            },
            "status": {
                "type": "string",
                "enum": ["all", "pending", "published"],
                "description": "筛选状态",
                "default": "all"
            }
        }
    }

    async def execute(
        self,
        limit: int = 20,
        keyword: Optional[str] = None,
        status: str = "all",
        **kwargs
    ) -> ToolResult:
        """列出素材"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                params = {"limit": limit}
                if keyword:
                    params["keyword"] = keyword
                if status != "all":
                    params["status"] = status

                response = await client.get(
                    f"{API_BASE_URL}/files/",
                    params=params
                )
                response.raise_for_status()
                result = response.json()

                videos = result.get("items", [])

                # 格式化输出
                output_lines = [f"🎬 找到 {len(videos)} 个视频：\n"]
                for video in videos:
                    duration = video.get('duration', 0)
                    duration_str = f"{duration}s" if duration else "未知"
                    status_str = video.get('status', 'pending')
                    output_lines.append(
                        f"- [ID: {video.get('id', 'N/A')}] "
                        f"{video.get('title', '无标题')} "
                        f"({duration_str}, {status_str})"
                    )

                return ToolResult(output="\n".join(output_lines))

        except Exception as e:
            return ToolResult(error=f"获取素材列表时出错: {str(e)}")


# ============================================
# 发布计划工具
# ============================================

class PublishSingleVideoTool(BaseTool):
    """单个视频发布工具"""

    name: str = "publish_single_video"
    description: str = (
        "发布单个视频到指定平台和账号。"
        "这是执行实际发布操作的核心工具。"
        "支持定时发布和立即发布。"
    )
    parameters: dict = {
        "type": "object",
        "properties": {
            "file_id": {
                "type": "integer",
                "description": "视频文件ID（从素材库获取）"
            },
            "accounts": {
                "type": "array",
                "items": {"type": "string"},
                "description": "账号ID列表"
            },
            "platform": {
                "type": "integer",
                "description": "平台代码: 1=小红书, 2=视频号, 3=抖音, 4=快手, 5=B站"
            },
            "title": {
                "type": "string",
                "description": "视频标题"
            },
            "description": {
                "type": "string",
                "description": "视频描述"
            },
            "topics": {
                "type": "array",
                "items": {"type": "string"},
                "description": "话题标签"
            },
            "scheduled_time": {
                "type": "string",
                "description": "定时发布时间（ISO格式），不填则立即发布"
            }
        },
        "required": ["file_id", "accounts", "platform", "title"]
    }

    async def execute(
        self,
        file_id: int,
        accounts: List[str],
        platform: int,
        title: str,
        description: Optional[str] = "",
        topics: Optional[List[str]] = None,
        scheduled_time: Optional[str] = None,
        **kwargs
    ) -> ToolResult:
        """发布单个视频"""
        try:
            publish_data = {
                "file_ids": [file_id],
                "accounts": accounts,
                "platform": platform,
                "title": title,
                "description": description or "",
                "topics": topics or [],
                "scheduled_time": scheduled_time,
            }

            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    f"{API_BASE_URL}/publish/batch",
                    json=publish_data
                )
                response.raise_for_status()
                result = response.json()

                task_info = result.get("data", {})

                output = f"✅ 发布任务已创建！\n"
                output += f"- 任务 ID: {task_info.get('task_id')}\n"
                output += f"- 视频: {file_id}\n"
                output += f"- 平台: {task_info.get('platform')}\n"
                output += f"- 账号数: {len(accounts)}\n"
                output += f"- 状态: {task_info.get('status')}\n"
                if scheduled_time:
                    output += f"- 定时发布: {scheduled_time}\n"

                return ToolResult(output=output)

        except Exception as e:
            return ToolResult(error=f"发布视频时出错: {str(e)}")


class PublishBatchVideosTool(BaseTool):
    """批量视频发布工具"""

    name: str = "publish_batch_videos"
    description: str = (
        "批量发布多个视频。"
        "支持将多个视频发布到多个账号。"
        "可以指定平台或自动根据账号平台分配。"
        "适合大规模发布操作。"
    )
    parameters: dict = {
        "type": "object",
        "properties": {
            "file_ids": {
                "type": "array",
                "items": {"type": "integer"},
                "description": "视频文件ID列表"
            },
            "accounts": {
                "type": "array",
                "items": {"type": "string"},
                "description": "账号ID列表"
            },
            "platform": {
                "type": "integer",
                "description": "平台代码（可选）: 1=小红书, 2=视频号, 3=抖音, 4=快手, 5=B站。不填则根据账号自动分配"
            },
            "title": {
                "type": "string",
                "description": "统一标题"
            },
            "description": {
                "type": "string",
                "description": "统一描述"
            },
            "topics": {
                "type": "array",
                "items": {"type": "string"},
                "description": "统一话题标签"
            },
            "priority": {
                "type": "integer",
                "description": "任务优先级（1-10，数字越大优先级越高）",
                "default": 5
            }
        },
        "required": ["file_ids", "accounts", "title"]
    }

    async def execute(
        self,
        file_ids: List[int],
        accounts: List[str],
        title: str,
        platform: Optional[int] = None,
        description: Optional[str] = "",
        topics: Optional[List[str]] = None,
        priority: int = 5,
        **kwargs
    ) -> ToolResult:
        """批量发布视频"""
        try:
            batch_data = {
                "file_ids": file_ids,
                "accounts": accounts,
                "title": title,
                "description": description or "",
                "topics": topics or [],
                "priority": priority
            }

            if platform is not None:
                batch_data["platform"] = platform

            async with httpx.AsyncClient(timeout=180.0) as client:
                response = await client.post(
                    f"{API_BASE_URL}/publish/batch",
                    json=batch_data
                )
                response.raise_for_status()
                result = response.json()

                batch_info = result.get("data", {})

                output = f"✅ 批量发布任务已创建！\n"
                output += f"- 批次 ID: {batch_info.get('batch_id')}\n"
                output += f"- 总任务数: {batch_info.get('total_tasks')}\n"
                output += f"- 成功: {batch_info.get('success_count')}\n"
                output += f"- 失败: {batch_info.get('failed_count')}\n"
                output += f"- 视频数: {len(file_ids)}\n"
                output += f"- 账号数: {len(accounts)}\n"

                return ToolResult(output=output)

        except Exception as e:
            return ToolResult(error=f"批量发布视频时出错: {str(e)}")


class UsePresetToPublishTool(BaseTool):
    """使用预设发布工具"""

    name: str = "use_preset_to_publish"
    description: str = (
        "使用已有的发布预设来发布视频。"
        "预设包含了预配置的平台、账号、标题模板等。"
        "可以覆盖部分预设参数。"
    )
    parameters: dict = {
        "type": "object",
        "properties": {
            "preset_id": {
                "type": "integer",
                "description": "预设ID"
            },
            "file_ids": {
                "type": "array",
                "items": {"type": "integer"},
                "description": "视频文件ID列表"
            },
            "override_title": {
                "type": "string",
                "description": "覆盖预设中的标题（可选）"
            },
            "override_accounts": {
                "type": "array",
                "items": {"type": "string"},
                "description": "覆盖预设中的账号列表（可选）"
            }
        },
        "required": ["preset_id", "file_ids"]
    }

    async def execute(
        self,
        preset_id: int,
        file_ids: List[int],
        override_title: Optional[str] = None,
        override_accounts: Optional[List[str]] = None,
        **kwargs
    ) -> ToolResult:
        """使用预设发布"""
        try:
            params = {"file_ids": file_ids}
            if override_title:
                params["override_title"] = override_title
            if override_accounts:
                params["override_accounts"] = override_accounts

            async with httpx.AsyncClient(timeout=180.0) as client:
                response = await client.post(
                    f"{API_BASE_URL}/publish/presets/{preset_id}/use",
                    params=params
                )
                response.raise_for_status()
                result = response.json()

                batch_info = result.get("data", {})

                output = f"✅ 使用预设发布成功！\n"
                output += f"- 预设 ID: {preset_id}\n"
                output += f"- 成功任务: {batch_info.get('success_count')}\n"
                output += f"- 失败任务: {batch_info.get('failed_count')}\n"

                return ToolResult(output=output)

        except Exception as e:
            return ToolResult(error=f"使用预设发布时出错: {str(e)}")


class CreatePublishPlanTool(BaseTool):
    """创建发布预设工具"""

    name: str = "create_publish_preset"
    description: str = (
        "创建一个新的发布预设（Preset）。"
        "发布预设定义了发布配置模板，包含平台、账号、标题模板、话题标签等。"
        "预设创建后可以用于快速批量发布视频。"
    )
    parameters: dict = {
        "type": "object",
        "properties": {
            "name": {
                "type": "string",
                "description": "预设名称"
            },
            "platform": {
                "type": "integer",
                "description": "平台代码: 1=小红书, 2=视频号, 3=抖音, 4=快手, 5=B站"
            },
            "accounts": {
                "type": "array",
                "items": {"type": "string"},
                "description": "账号ID列表"
            },
            "default_title_template": {
                "type": "string",
                "description": "默认标题模板"
            },
            "default_description": {
                "type": "string",
                "description": "默认描述"
            },
            "default_topics": {
                "type": "array",
                "items": {"type": "string"},
                "description": "默认话题标签"
            },
            "schedule_enabled": {
                "type": "boolean",
                "description": "是否启用定时发布",
                "default": False
            }
        },
        "required": ["name", "platform", "accounts"]
    }

    async def execute(
        self,
        name: str,
        platform: int,
        accounts: List[str],
        default_title_template: Optional[str] = "",
        default_description: Optional[str] = "",
        default_topics: Optional[List[str]] = None,
        schedule_enabled: bool = False,
        **kwargs
    ) -> ToolResult:
        """创建发布预设"""
        try:
            # 构建预设数据
            preset_data = {
                "name": name,
                "platform": platform,
                "accounts": accounts,
                "default_title_template": default_title_template or "",
                "default_description": default_description or "",
                "default_topics": default_topics or [],
                "schedule_enabled": schedule_enabled,
                "videos_per_day": 1,
                "schedule_date": "",
                "time_point": ""
            }

            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{API_BASE_URL}/publish/presets",
                    json=preset_data
                )
                response.raise_for_status()
                result = response.json()

                preset_id = result.get("data", {}).get("id")

                output = f"✅ 发布预设创建成功！\n"
                output += f"- 预设名称: {name}\n"
                output += f"- 预设 ID: {preset_id}\n"
                output += f"- 平台: {platform}\n"
                output += f"- 账号数量: {len(accounts)}\n"

                return ToolResult(output=output)

        except Exception as e:
            return ToolResult(error=f"创建发布预设时出错: {str(e)}")


class ListPublishPlansTool(BaseTool):
    """列出发布预设工具"""

    name: str = "list_publish_presets"
    description: str = (
        "获取所有发布预设列表。"
        "可以查看预设配置、关联的平台和账号等信息。"
    )
    parameters: dict = {
        "type": "object",
        "properties": {}
    }

    async def execute(self, **kwargs) -> ToolResult:
        """列出发布预设"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(f"{API_BASE_URL}/publish/presets")
                response.raise_for_status()
                result = response.json()

                presets = result.get("data", [])

                output_lines = [f"📋 找到 {len(presets)} 个发布预设：\n"]
                for preset in presets:
                    output_lines.append(
                        f"- [ID: {preset.get('id')}] "
                        f"{preset.get('name', '未命名')} "
                        f"(平台: {preset.get('platform')}, 账号数: {len(preset.get('accounts', []))})"
                    )

                return ToolResult(output="\n".join(output_lines))

        except Exception as e:
            return ToolResult(error=f"获取发布预设列表时出错: {str(e)}")


# ============================================
# 任务管理工具
# ============================================

class GetTaskStatusTool(BaseTool):
    """获取任务状态工具"""

    name: str = "get_task_status"
    description: str = (
        "获取指定任务的执行状态。"
        "可以查看任务进度、结果、错误信息等。"
    )
    parameters: dict = {
        "type": "object",
        "properties": {
            "task_id": {
                "type": "string",
                "description": "任务 ID"
            }
        },
        "required": ["task_id"]
    }

    async def execute(self, task_id: str, **kwargs) -> ToolResult:
        """获取任务状态"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{API_BASE_URL}/tasks/{task_id}"
                )
                response.raise_for_status()
                result = response.json()

                task = result.get("data", {})

                output = f"📊 任务状态：\n"
                output += f"- 任务 ID: {task_id}\n"
                output += f"- 状态: {task.get('status', 'unknown')}\n"
                output += f"- 进度: {task.get('progress', 0)}%\n"

                if task.get('error'):
                    output += f"- 错误: {task.get('error')}\n"

                return ToolResult(output=output)

        except Exception as e:
            return ToolResult(error=f"获取任务状态时出错: {str(e)}")


# ============================================
# 系统信息工具
# ============================================

class GetSystemContextTool(BaseTool):
    """获取系统上下文工具"""

    name: str = "get_system_context"
    description: str = (
        "获取完整的系统上下文信息。"
        "包含所有可用账号、素材、历史发布记录等。"
        "用于全面了解系统状态，规划发布任务。"
    )
    parameters: dict = {
        "type": "object",
        "properties": {}
    }

    async def execute(self, **kwargs) -> ToolResult:
        """获取系统上下文"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(f"{API_BASE_URL}/agent/context")
                response.raise_for_status()
                result = response.json()

                context = result.get("data", {})
                accounts = context.get("accounts", [])
                videos = context.get("videos", [])

                # 格式化输出
                output = (
                    f"📊 系统上下文信息：\n\n"
                    f"**账号统计**：\n"
                    f"- 总数: {len(accounts)}\n"
                )

                # 按平台分组统计
                platform_counts = {}
                for acc in accounts:
                    platform = acc.get("platform", "unknown")
                    platform_counts[platform] = platform_counts.get(platform, 0) + 1

                for platform, count in platform_counts.items():
                    output += f"  - {platform}: {count}\n"

                output += (
                    f"\n**素材统计**：\n"
                    f"- 总数: {len(videos)}\n"
                )

                # 添加详细的 JSON 数据供后续使用
                output += f"\n**详细数据（JSON）**：\n```json\n{json.dumps(context, ensure_ascii=False, indent=2)}\n```"

                return ToolResult(output=output)

        except Exception as e:
            return ToolResult(error=f"获取系统上下文时出错: {str(e)}")


# ============================================
# 矩阵发布工具
# ============================================

class GenerateMatrixTasksTool(BaseTool):
    """生成矩阵发布任务工具"""

    name: str = "generate_matrix_tasks"
    description: str = (
        "生成多平台、多账号、多素材的矩阵发布任务。"
        "适用于大规模批量发布场景。"
        "支持指定平台列表(douyin/kuaishou/xiaohongshu/channels/bilibili)，"
        "可以自动分配素材到不同账号和平台，避免重复。"
        "返回生成的任务数量和批次ID。"
    )
    parameters: dict = {
        "type": "object",
        "properties": {
            "platforms": {
                "type": "array",
                "items": {"type": "string"},
                "description": "平台名称列表: douyin, kuaishou, xiaohongshu, channels, bilibili"
            },
            "material_ids": {
                "type": "array",
                "items": {"type": "string"},
                "description": "素材ID列表（文件ID）"
            },
            "title": {
                "type": "string",
                "description": "统一标题"
            },
            "description": {
                "type": "string",
                "description": "统一描述"
            },
            "topics": {
                "type": "array",
                "items": {"type": "string"},
                "description": "话题标签"
            },
            "cover_path": {
                "type": "string",
                "description": "封面路径（可选）"
            },
            "batch_name": {
                "type": "string",
                "description": "批次名称（可选）"
            }
        },
        "required": ["platforms", "material_ids", "title"]
    }

    async def execute(
        self,
        platforms: List[str],
        material_ids: List[str],
        title: str,
        description: Optional[str] = "",
        topics: Optional[List[str]] = None,
        cover_path: Optional[str] = None,
        batch_name: Optional[str] = None,
        **kwargs
    ) -> ToolResult:
        """生成矩阵任务"""
        try:
            import time

            # 1. 获取所有账号并按平台分组
            async with httpx.AsyncClient(timeout=60.0) as client:
                # 获取账号列表
                acc_response = await client.get(f"{API_BASE_URL}/accounts/")
                acc_response.raise_for_status()
                accounts_data = acc_response.json()
                all_accounts = accounts_data.get("data", []) if isinstance(accounts_data.get("data"), list) else accounts_data.get("data", {}).get("items", [])

                # 按平台分组账号
                accounts_by_platform = {}
                for platform in platforms:
                    platform_accounts = [
                        acc.get("account_id") for acc in all_accounts
                        if acc.get("platform") == platform and acc.get("status") == "valid"
                    ]
                    accounts_by_platform[platform] = platform_accounts

                # 检查是否有可用账号
                total_accounts = sum(len(accs) for accs in accounts_by_platform.values())
                if total_accounts == 0:
                    return ToolResult(error="没有找到可用的账号，请先添加账号")

                # 2. 构建矩阵任务请求
                matrix_data = {
                    "platforms": platforms,
                    "accounts": accounts_by_platform,
                    "materials": material_ids,
                    "title": title,
                    "description": description or "",
                    "topics": topics or [],
                    "cover_path": cover_path,
                    "material_configs": None,
                    "batch_name": batch_name or f"manus_matrix_{int(time.time())}"
                }

                # 3. 调用矩阵任务生成API
                response = await client.post(
                    f"{API_BASE_URL}/matrix/generate_tasks",
                    json=matrix_data
                )
                response.raise_for_status()
                result = response.json()

                task_data = result.get("data", {})
                tasks_count = task_data.get("count", 0)
                batch_id = task_data.get("batch_id", "unknown")

                # 格式化输出
                output = f"✅ 矩阵任务已生成成功！\n\n"
                output += f"**批次信息**：\n"
                output += f"- 批次 ID: {batch_id}\n"
                output += f"- 批次名称: {matrix_data['batch_name']}\n\n"
                output += f"**任务统计**：\n"
                output += f"- 总任务数: {tasks_count}\n"
                output += f"- 平台数: {len(platforms)}\n"
                output += f"- 账号数: {total_accounts}\n"
                output += f"- 素材数: {len(material_ids)}\n\n"
                output += f"**平台分布**：\n"
                for platform, accs in accounts_by_platform.items():
                    output += f"  - {platform}: {len(accs)} 个账号\n"

                return ToolResult(output=output)

        except httpx.HTTPStatusError as e:
            error_detail = e.response.text[:300] if e.response.text else str(e)
            return ToolResult(error=f"生成矩阵任务失败 (HTTP {e.response.status_code}): {error_detail}")
        except Exception as e:
            return ToolResult(error=f"生成矩阵任务时出错: {str(e)}")


class GetMatrixStatusTool(BaseTool):
    """获取矩阵任务状态工具"""

    name: str = "get_matrix_status"
    description: str = (
        "获取矩阵任务的执行状态和统计信息。"
        "用于监控批量发布进度，查看有多少任务待处理、运行中、已完成、失败等。"
    )
    parameters: dict = {
        "type": "object",
        "properties": {}
    }

    async def execute(self, **kwargs) -> ToolResult:
        """获取矩阵状态"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                # 获取统计信息
                response = await client.get(f"{API_BASE_URL}/matrix/stats")
                response.raise_for_status()
                result = response.json()
                stats = result.get("data", {})

                output = f"📊 矩阵任务状态统计：\n\n"
                output += f"- 总任务数: {stats.get('total', 0)}\n"
                output += f"- 待处理: {stats.get('pending', 0)}\n"
                output += f"- 运行中: {stats.get('running', 0)}\n"
                output += f"- 已完成: {stats.get('finished', 0)}\n"
                output += f"- 失败: {stats.get('failed', 0)}\n"
                output += f"- 重试中: {stats.get('retry', 0)}\n"

                return ToolResult(output=output)

        except httpx.HTTPStatusError as e:
            return ToolResult(error=f"获取矩阵状态失败 (HTTP {e.response.status_code}): {e.response.text[:200]}")
        except Exception as e:
            return ToolResult(error=f"获取矩阵状态时出错: {str(e)}")


class ExecuteMatrixTaskTool(BaseTool):
    """执行矩阵任务工具"""

    name: str = "execute_matrix_task"
    description: str = (
        "从矩阵任务队列中弹出并执行下一个任务。"
        "这个工具会实际触发视频发布操作。"
        "任务执行后会自动更新状态（成功/失败/重试）。"
        "建议在调用前先使用 get_matrix_status 查看队列状态。"
    )
    parameters: dict = {
        "type": "object",
        "properties": {}
    }

    async def execute(self, **kwargs) -> ToolResult:
        """执行下一个矩阵任务"""
        try:
            async with httpx.AsyncClient(timeout=180.0) as client:
                # 1. 弹出下一个任务
                pop_response = await client.post(f"{API_BASE_URL}/matrix/tasks/pop")
                pop_response.raise_for_status()
                pop_result = pop_response.json()

                task = pop_result.get("task")
                if not task:
                    return ToolResult(output="⚠️ 当前没有待执行的任务")

                task_id = task.get("task_id")
                platform = task.get("platform")
                account_id = task.get("account_id")
                material_id = task.get("material_id")
                title = task.get("title")

                output = f"🚀 开始执行矩阵任务:\n\n"
                output += f"- 任务 ID: {task_id}\n"
                output += f"- 平台: {platform}\n"
                output += f"- 账号: {account_id}\n"
                output += f"- 素材: {material_id}\n"
                output += f"- 标题: {title}\n\n"

                # 2. 执行发布（调用发布API）
                # 构建平台代码映射
                platform_code_map = {
                    "xiaohongshu": 1,
                    "channels": 2,
                    "douyin": 3,
                    "kuaishou": 4,
                    "bilibili": 5
                }

                publish_data = {
                    "file_ids": [int(material_id)],
                    "accounts": [account_id],
                    "platform": platform_code_map.get(platform, 3),
                    "title": task.get("title", ""),
                    "description": task.get("description", ""),
                    "topics": task.get("topics", []),
                    "cover_path": task.get("cover_path"),
                    "scheduled_time": None,
                }

                try:
                    # 调用发布API
                    publish_response = await client.post(
                        f"{API_BASE_URL}/publish/batch",
                        json=publish_data,
                        timeout=120.0
                    )
                    publish_response.raise_for_status()
                    publish_result = publish_response.json()

                    # 3. 上报成功
                    report_data = {
                        "task_id": task_id,
                        "status": "success",
                        "message": "发布成功"
                    }
                    report_response = await client.post(
                        f"{API_BASE_URL}/matrix/tasks/report",
                        json=report_data
                    )
                    report_response.raise_for_status()

                    output += "✅ 任务执行成功！\n"
                    output += f"- 发布任务 ID: {publish_result.get('data', {}).get('task_id', 'N/A')}\n"

                    return ToolResult(output=output)

                except httpx.HTTPStatusError as e:
                    # 发布失败，上报失败状态
                    error_msg = e.response.text[:200] if e.response.text else str(e)
                    report_data = {
                        "task_id": task_id,
                        "status": "fail",
                        "message": f"发布失败: {error_msg}"
                    }
                    await client.post(
                        f"{API_BASE_URL}/matrix/tasks/report",
                        json=report_data
                    )

                    output += f"❌ 任务执行失败: {error_msg}\n"
                    output += "- 任务已标记为失败/重试\n"
                    return ToolResult(output=output)

        except httpx.HTTPStatusError as e:
            return ToolResult(error=f"执行矩阵任务失败 (HTTP {e.response.status_code}): {e.response.text[:200]}")
        except Exception as e:
            return ToolResult(error=f"执行矩阵任务时出错: {str(e)}")


class ExecuteAllMatrixTasksTool(BaseTool):
    """批量执行所有矩阵任务工具"""

    name: str = "execute_all_matrix_tasks"
    description: str = (
        "执行队列中的所有待处理矩阵任务。"
        "会循环执行直到队列为空或遇到错误。"
        "适合批量处理大量任务的场景。"
        "⚠️ 这是一个长时间运行的操作，可能需要几分钟到几小时。"
    )
    parameters: dict = {
        "type": "object",
        "properties": {
            "max_tasks": {
                "type": "integer",
                "description": "最大执行任务数（防止无限循环），默认100",
                "default": 100
            }
        }
    }

    async def execute(self, max_tasks: int = 100, **kwargs) -> ToolResult:
        """批量执行所有矩阵任务"""
        try:
            async with httpx.AsyncClient(timeout=300.0) as client:
                # 获取初始状态
                stats_response = await client.get(f"{API_BASE_URL}/matrix/stats")
                stats_response.raise_for_status()
                initial_stats = stats_response.json().get("data", {})

                total_pending = initial_stats.get("pending", 0) + initial_stats.get("retry", 0)

                if total_pending == 0:
                    return ToolResult(output="⚠️ 没有待执行的任务")

                output = f"🚀 开始批量执行矩阵任务\n\n"
                output += f"**初始状态**：\n"
                output += f"- 待处理任务: {total_pending}\n"
                output += f"- 最大执行数: {max_tasks}\n\n"

                success_count = 0
                fail_count = 0
                executed = 0

                # 循环执行任务
                for i in range(min(max_tasks, total_pending)):
                    # 弹出任务
                    pop_response = await client.post(f"{API_BASE_URL}/matrix/tasks/pop")
                    pop_response.raise_for_status()
                    pop_result = pop_response.json()

                    task = pop_result.get("task")
                    if not task:
                        output += f"\n✅ 所有任务已执行完毕 (执行了 {executed} 个任务)\n"
                        break

                    task_id = task.get("task_id")
                    platform = task.get("platform")
                    account_id = task.get("account_id")
                    material_id = task.get("material_id")

                    # 执行发布
                    platform_code_map = {
                        "xiaohongshu": 1,
                        "channels": 2,
                        "douyin": 3,
                        "kuaishou": 4,
                        "bilibili": 5
                    }

                    publish_data = {
                        "file_ids": [int(material_id)],
                        "accounts": [account_id],
                        "platform": platform_code_map.get(platform, 3),
                        "title": task.get("title", ""),
                        "description": task.get("description", ""),
                        "topics": task.get("topics", []),
                        "cover_path": task.get("cover_path"),
                    }

                    try:
                        publish_response = await client.post(
                            f"{API_BASE_URL}/publish/batch",
                            json=publish_data,
                            timeout=120.0
                        )
                        publish_response.raise_for_status()

                        # 上报成功
                        await client.post(
                            f"{API_BASE_URL}/matrix/tasks/report",
                            json={"task_id": task_id, "status": "success", "message": "发布成功"}
                        )
                        success_count += 1

                    except Exception as e:
                        # 上报失败
                        await client.post(
                            f"{API_BASE_URL}/matrix/tasks/report",
                            json={"task_id": task_id, "status": "fail", "message": str(e)[:200]}
                        )
                        fail_count += 1

                    executed += 1

                    # 每10个任务输出一次进度
                    if executed % 10 == 0:
                        output += f"- 已执行 {executed} 个任务...\n"

                # 获取最终状态
                final_stats_response = await client.get(f"{API_BASE_URL}/matrix/stats")
                final_stats_response.raise_for_status()
                final_stats = final_stats_response.json().get("data", {})

                output += f"\n**执行完成**：\n"
                output += f"- 成功: {success_count}\n"
                output += f"- 失败: {fail_count}\n"
                output += f"- 总执行: {executed}\n\n"
                output += f"**最终状态**：\n"
                output += f"- 待处理: {final_stats.get('pending', 0)}\n"
                output += f"- 已完成: {final_stats.get('finished', 0)}\n"
                output += f"- 失败: {final_stats.get('failed', 0)}\n"

                return ToolResult(output=output)

        except Exception as e:
            return ToolResult(error=f"批量执行矩阵任务时出错: {str(e)}")


# ============================================
# Dashboard 统计工具
# ============================================

class GetDashboardStatsTool(BaseTool):
    """获取Dashboard统计数据工具"""

    name: str = "get_dashboard_stats"
    description: str = (
        "获取系统整体统计数据，包括账号数量、素材数量、发布统计等。"
        "适合在开始任务前了解系统整体状态。"
    )
    parameters: dict = {
        "type": "object",
        "properties": {}
    }

    async def execute(self, **kwargs) -> ToolResult:
        """获取Dashboard统计"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(f"{API_BASE_URL}/dashboard/stats")
                response.raise_for_status()
                result = response.json()
                stats = result.get("data", {})

                output = f"📊 系统统计数据：\n\n"
                output += f"**账号统计**：\n"
                output += f"- 总账号数: {stats.get('total_accounts', 0)}\n"
                output += f"- 有效账号: {stats.get('valid_accounts', 0)}\n\n"

                output += f"**素材统计**：\n"
                output += f"- 总素材数: {stats.get('total_materials', 0)}\n"
                output += f"- 待发布: {stats.get('pending_materials', 0)}\n\n"

                output += f"**发布统计**：\n"
                output += f"- 总发布数: {stats.get('total_published', 0)}\n"
                output += f"- 今日发布: {stats.get('today_published', 0)}\n"
                output += f"- 待处理任务: {stats.get('pending_tasks', 0)}\n"

                return ToolResult(output=output)

        except httpx.HTTPStatusError as e:
            return ToolResult(error=f"获取Dashboard统计失败 (HTTP {e.response.status_code}): {e.response.text[:200]}")
        except Exception as e:
            return ToolResult(error=f"获取Dashboard统计时出错: {str(e)}")


class ListFilesTool(BaseTool):
    """列出文件/素材工具"""

    name: str = "list_files"
    description: str = (
        "获取素材库中的文件列表（视频、图片等）。"
        "可以根据类型、状态进行筛选。"
        "用于查找可用于发布的素材。"
    )
    parameters: dict = {
        "type": "object",
        "properties": {
            "file_type": {
                "type": "string",
                "description": "文件类型筛选：video, image, audio, all（默认all）",
                "default": "all"
            },
            "limit": {
                "type": "integer",
                "description": "返回数量限制（默认20）",
                "default": 20
            },
            "keyword": {
                "type": "string",
                "description": "搜索关键词（可选）"
            }
        }
    }

    async def execute(
        self,
        file_type: str = "all",
        limit: int = 20,
        keyword: Optional[str] = None,
        **kwargs
    ) -> ToolResult:
        """列出文件"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                params = {"limit": limit}
                if file_type and file_type != "all":
                    params["file_type"] = file_type
                if keyword:
                    params["keyword"] = keyword

                response = await client.get(
                    f"{API_BASE_URL}/files",
                    params=params
                )
                response.raise_for_status()
                result = response.json()

                files_data = result.get("data", {})
                files = files_data.get("items", []) if isinstance(files_data, dict) else files_data

                # 格式化输出
                output_lines = [f"📁 找到 {len(files)} 个文件：\n"]
                for file in files:
                    file_id = file.get('id', 'N/A')
                    filename = file.get('filename', '未命名')
                    file_type_str = file.get('file_type', 'unknown')
                    size = file.get('size', 0)
                    size_mb = f"{size / 1024 / 1024:.2f} MB" if size else "未知"

                    output_lines.append(
                        f"- [ID: {file_id}] {filename} ({file_type_str}, {size_mb})"
                    )

                return ToolResult(output="\n".join(output_lines))

        except httpx.HTTPStatusError as e:
            return ToolResult(error=f"获取文件列表失败 (HTTP {e.response.status_code}): {e.response.text[:200]}")
        except Exception as e:
            return ToolResult(error=f"获取文件列表时出错: {str(e)}")


class GetFileDetailTool(BaseTool):
    """获取文件详情工具"""

    name: str = "get_file_detail"
    description: str = (
        "获取指定文件的详细信息。"
        "包含文件路径、大小、时长（视频）、状态等。"
    )
    parameters: dict = {
        "type": "object",
        "properties": {
            "file_id": {
                "type": "integer",
                "description": "文件ID"
            }
        },
        "required": ["file_id"]
    }

    async def execute(self, file_id: int, **kwargs) -> ToolResult:
        """获取文件详情"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(f"{API_BASE_URL}/files/{file_id}")
                response.raise_for_status()
                result = response.json()
                file_data = result.get("data", {})

                output = f"📄 文件详情：\n\n"
                output += f"- ID: {file_data.get('id')}\n"
                output += f"- 文件名: {file_data.get('filename')}\n"
                output += f"- 类型: {file_data.get('file_type')}\n"
                output += f"- 路径: {file_data.get('file_path')}\n"
                output += f"- 大小: {file_data.get('size', 0) / 1024 / 1024:.2f} MB\n"

                if file_data.get('duration'):
                    output += f"- 时长: {file_data.get('duration')}秒\n"

                output += f"- 状态: {file_data.get('status', 'unknown')}\n"
                output += f"- 上传时间: {file_data.get('created_at', 'N/A')}\n"

                return ToolResult(output=output)

        except httpx.HTTPStatusError as e:
            return ToolResult(error=f"获取文件详情失败 (HTTP {e.response.status_code}): {e.response.text[:200]}")
        except Exception as e:
            return ToolResult(error=f"获取文件详情时出错: {str(e)}")


class ListTasksStatusTool(BaseTool):
    """列出任务状态工具"""

    name: str = "list_tasks_status"
    description: str = (
        "获取发布任务队列的状态列表。"
        "可以查看所有任务的执行情况、进度、错误信息等。"
        "支持按状态筛选（pending, running, success, error）。"
    )
    parameters: dict = {
        "type": "object",
        "properties": {
            "status": {
                "type": "string",
                "description": "状态筛选：pending, running, success, error, all（默认all）",
                "default": "all"
            },
            "limit": {
                "type": "integer",
                "description": "返回数量限制（默认20）",
                "default": 20
            }
        }
    }

    async def execute(
        self,
        status: str = "all",
        limit: int = 20,
        **kwargs
    ) -> ToolResult:
        """列出任务状态"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                params = {"limit": limit}
                if status and status != "all":
                    params["status"] = status

                response = await client.get(
                    f"{API_BASE_URL}/tasks",
                    params=params
                )
                response.raise_for_status()
                result = response.json()

                tasks_data = result.get("data", {})
                tasks = tasks_data.get("items", []) if isinstance(tasks_data, dict) else tasks_data

                # 格式化输出
                output_lines = [f"📋 找到 {len(tasks)} 个任务：\n"]
                for task in tasks:
                    task_id = task.get('task_id', 'N/A')
                    platform = task.get('platform', 'unknown')
                    task_status = task.get('status', 'unknown')
                    progress = task.get('progress', 0)

                    status_icon = "✅" if task_status == "success" else "❌" if task_status == "error" else "🔄"

                    output_lines.append(
                        f"{status_icon} [ID: {task_id}] {platform} - {task_status} ({progress}%)"
                    )

                    if task.get('error_message'):
                        output_lines.append(f"   错误: {task.get('error_message')[:100]}")

                return ToolResult(output="\n".join(output_lines))

        except httpx.HTTPStatusError as e:
            return ToolResult(error=f"获取任务列表失败 (HTTP {e.response.status_code}): {e.response.text[:200]}")
        except Exception as e:
            return ToolResult(error=f"获取任务列表时出错: {str(e)}")


# ============================================
# 脚本执行工具
# ============================================

class ExecutePythonScriptTool(BaseTool):
    """执行Python脚本工具"""

    name: str = "execute_python_script"
    description: str = (
        "执行Python脚本代码。"
        "可以用于复杂的数据处理、批量操作等。"
        "⚠️ 谨慎使用，确保代码安全。"
    )
    parameters: dict = {
        "type": "object",
        "properties": {
            "code": {
                "type": "string",
                "description": "要执行的Python代码"
            },
            "description": {
                "type": "string",
                "description": "代码功能描述"
            }
        },
        "required": ["code", "description"]
    }

    async def execute(
        self,
        code: str,
        description: str,
        **kwargs
    ) -> ToolResult:
        """执行Python脚本"""
        try:
            import sys
            from io import StringIO

            # 捕获输出
            old_stdout = sys.stdout
            sys.stdout = captured_output = StringIO()

            # 创建执行环境
            exec_globals = {
                "__builtins__": __builtins__,
                "requests": __import__("requests"),
                "json": __import__("json"),
                "time": __import__("time"),
                "datetime": __import__("datetime"),
            }

            # 执行代码
            exec(code, exec_globals)

            # 恢复输出
            sys.stdout = old_stdout
            output_text = captured_output.getvalue()

            return ToolResult(
                output=f"✅ 脚本执行完成\n\n**描述**: {description}\n\n**输出**:\n```\n{output_text}\n```"
            )

        except Exception as e:
            sys.stdout = old_stdout
            return ToolResult(error=f"脚本执行失败: {str(e)}")


# ============================================
# 系统信息工具
# ============================================
