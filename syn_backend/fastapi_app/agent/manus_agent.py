"""
OpenManus Agent 集成模块
将 OpenManus 作为底层智能体，赋予 AI 助手工具调用能力
"""
import sys
import os
from pathlib import Path
from typing import Dict, Any, Optional
import asyncio
import logging
from fastapi_app.core.config import settings

# 添加 OpenManus-worker 到 Python 路径
OPENMANUS_PATH = Path(__file__).parent.parent.parent / "OpenManus-worker"
if str(OPENMANUS_PATH) not in sys.path:
    sys.path.insert(0, str(OPENMANUS_PATH))

# NOTE: 不要在模块导入阶段 import OpenManus 内部模块（它们会读取 config.toml）。
# 否则一旦 config.toml 写坏（例如重复 [browser]），整个 FastAPI 进程会在 import 时直接崩。
manus_logger = logging.getLogger("openmanus_integration")

# 导入自定义工具
from .manus_tools import (
    CallAPITool,
    ListAccountsTool,
    ListAssetsTool,
    PublishBatchVideosTool,
    UsePresetToPublishTool,
    CreatePublishPlanTool,
    ListPublishPlansTool,
    GetTaskStatusTool,
    GetSystemContextTool,
    GenerateMatrixTasksTool,
    GetMatrixStatusTool,
    ExecuteMatrixTaskTool,
    ExecuteAllMatrixTasksTool,
    GetDashboardStatsTool,
    ListFilesTool,
    GetFileDetailTool,
    ListTasksStatusTool,
    ExecutePythonScriptTool
)

# 扩展工具将在 initialize() 方法中延迟导入


class ManusAgentWrapper:
    """OpenManus Agent 包装器"""

    def __init__(self):
        self._agent: Optional[Any] = None
        self._initialized = False

    async def initialize(self):
        """初始化 OpenManus Agent，加载独立的 LLM 配置"""
        if self._initialized:
            return

        try:
            import toml

            manus_logger.info("正在初始化 OpenManus Agent...")

            # 统一读取 headless 配置（会自动 load .env -> os.environ）
            try:
                from config.conf import PLAYWRIGHT_HEADLESS as CONF_PLAYWRIGHT_HEADLESS  # type: ignore
            except Exception:
                CONF_PLAYWRIGHT_HEADLESS = os.getenv("PLAYWRIGHT_HEADLESS", "true").strip().lower() not in {"0", "false", "no", "n", "off"}

            # 1. 尝试从数据库读取配置
            db_config = None
            try:
                import sqlite3
                conn = sqlite3.connect(settings.DATABASE_PATH)
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM ai_model_configs WHERE service_type = 'function_calling' AND is_active = 1")
                row = cursor.fetchone()
                if row:
                    db_config = dict(row)
                conn.close()
            except Exception as e:
                manus_logger.warning(f"从数据库读取 OpenManus 配置失败: {e}")

            # 2. 如果数据库有配置，直接更新 config.toml 文件
            if db_config:
                provider = db_config['provider']
                api_key = db_config['api_key']
                base_url = db_config.get('base_url')
                model = db_config.get('model_name')
                PLAYWRIGHT_HEADLESS = bool(CONF_PLAYWRIGHT_HEADLESS)

                # 直接更新 config.toml 文件
                config_path = OPENMANUS_PATH / "config" / "config.toml"
                try:
                    # 读取现有配置
                    if config_path.exists():
                        with open(config_path, "r", encoding="utf-8") as f:
                            content = f.read()
                    else:
                        content = ""

                    # 构建新的 LLM 配置
                    new_llm_config = f"""[llm]
provider = "{provider}"
model = "{model or 'gpt-4o'}"
api_key = "{api_key}"
base_url = "{base_url or 'https://api.openai.com/v1'}"
max_tokens = 16384
temperature = 0.6
"""

                    # 如果文件有其他配置（browser, search等），保留它们
                    import re

                    def _remove_table_block(raw: str, table_name: str) -> str:
                        # 只移除顶层 table（例如 [browser]），避免误删 [browser.xxx] 之类的子表
                        pattern = rf"(?ms)^\[{re.escape(table_name)}\]\s*.*?(?=^\[|\Z)"
                        return re.sub(pattern, "", raw)

                    # 移除现有的 [llm] 配置块
                    content_without_llm = _remove_table_block(content, "llm")

                    # 同步 browser.headless（让 OpenManus 的可视/无头跟随全局设置）
                    desired_headless = "true" if PLAYWRIGHT_HEADLESS else "false"
                    # NOTE: TOML 不允许重复声明同一个 table（例如 [browser] 出现两次会直接报错）。
                    # 这里采用幂等写法：先移除所有现存的 [browser] block，然后把规范化 block 放到安全位置：
                    # - 若存在 [browser.xxx] 子表，则必须把 [browser] 放到它们之前（避免“父表在子表之后声明”导致 TOML 解析失败）
                    # - 否则追加到末尾即可
                    content_without_browser = _remove_table_block(content_without_llm, "browser")
                    browser_block = f"[browser]\nheadless = {desired_headless}\n"

                    subtable_match = re.search(r"(?m)^\[browser\.[^\]]+\]\s*$", content_without_browser)
                    if subtable_match:
                        insert_at = subtable_match.start()
                        before = content_without_browser[:insert_at].rstrip()
                        after = content_without_browser[insert_at:].lstrip()
                        combined = (before + "\n\n" + browser_block + "\n" + after).strip() + "\n"
                        content_without_llm = combined
                    else:
                        content_without_llm = (content_without_browser.strip() + "\n\n" + browser_block).strip() + "\n"

                    # 写入新配置
                    with open(config_path, "w", encoding="utf-8") as f:
                        f.write(new_llm_config)
                        if content_without_llm.strip():
                            f.write("\n" + content_without_llm.strip() + "\n")

                    manus_logger.info(f"✅ 已将数据库配置写入 config.toml: {provider} / {model}")

                except Exception as e:
                    manus_logger.error(f"更新 config.toml 失败: {e}")

            else:
                # 如果没有数据库配置，检查 config.toml 是否存在（作为验证）
                config_path = OPENMANUS_PATH / "config" / "config.toml"
                if not config_path.exists():
                     # 注意：如果 config.toml 不存在，app.config 导入时可能已经报错了
                     # 这里只是为了提供更友好的错误信息
                     manus_logger.warning(f"未找到 OpenManus 配置文件: {config_path}，且数据库中无配置。")
                else:
                    # 即便不写入 llm，也要确保 config.toml 不会因为重复 [browser] 而解析失败
                    try:
                        import re

                        content = config_path.read_text(encoding="utf-8")
                        desired_headless = "true" if bool(CONF_PLAYWRIGHT_HEADLESS) else "false"

                        def _remove_table_block(raw: str, table_name: str) -> str:
                            pattern = rf"(?ms)^\[{re.escape(table_name)}\]\s*.*?(?=^\[|\Z)"
                            return re.sub(pattern, "", raw)

                        content_without_browser = _remove_table_block(content, "browser")
                        browser_block = f"[browser]\nheadless = {desired_headless}\n"
                        subtable_match = re.search(r"(?m)^\[browser\.[^\]]+\]\s*$", content_without_browser)
                        if subtable_match:
                            insert_at = subtable_match.start()
                            before = content_without_browser[:insert_at].rstrip()
                            after = content_without_browser[insert_at:].lstrip()
                            cleaned = (before + "\n\n" + browser_block + "\n" + after).strip() + "\n"
                        else:
                            cleaned = (content_without_browser.strip() + "\n\n" + browser_block).strip() + "\n"
                        if cleaned != content:
                            config_path.write_text(cleaned, encoding="utf-8")
                            manus_logger.info("✅ 已清理 config.toml 中重复的 [browser] 配置")
                    except Exception as e:
                        manus_logger.warning(f"清理 config.toml 的 [browser] 配置失败（可忽略）: {e}")

            # 重新加载配置（因为 config.toml 可能已更新）
            # 重要：保持 Config 单例实例不变，只做“原地重载”，否则其它模块（例如 app.agent.manus）持有旧引用会继续用旧配置。
            from app.config import Config
            try:
                Config._initialized = False
                Config()  # 触发 __init__ 重新加载
            except Exception as e:
                manus_logger.warning(f"重载 OpenManus 配置失败（可忽略）: {e}")

            # 清除 LLM 单例缓存
            from app.llm import LLM
            LLM._instances.clear()
            manus_logger.info("已清除所有配置缓存，强制重新初始化")

            # 依赖 config 的模块必须在 config 重载之后再导入
            from app.agent.manus import Manus
            from app.tool.tool_collection import ToolCollection

            # 创建基础 Manus agent（会自动使用更新后的 config）
            self._agent = await Manus.create()

            # Web 场景下禁用阻塞式 ask_human（其实现会 input() 阻塞服务进程）
            try:
                if hasattr(self._agent, "available_tools") and hasattr(self._agent.available_tools, "tools"):
                    filtered = tuple(
                        tool for tool in self._agent.available_tools.tools
                        if getattr(tool, "name", "") != "ask_human"
                    )
                    self._agent.available_tools = ToolCollection(*filtered)
            except Exception as e:
                manus_logger.warning(f"移除 ask_human 工具失败（可忽略）: {e}")

            # 导入扩展工具（必须在 OpenManus 初始化之后）
            from .manus_tools_extended import (
                MediaCrawlerTool,
                WechatChannelsCrawlerTool,
                IPPoolTool,
                PlatformLoginTool,
                CheckLoginStatusTool,
                DataAnalyticsTool,
                RunScriptTool,
                CookieManagerTool
            )

            # 添加自定义工具
            custom_tools = ToolCollection(
                # 通用API工具
                CallAPITool(),

                # 账号管理工具
                ListAccountsTool(),

                # 素材管理工具
                ListAssetsTool(),
                ListFilesTool(),
                GetFileDetailTool(),

                # 发布管理工具（仅保留批量发布）
                PublishBatchVideosTool(),
                UsePresetToPublishTool(),
                CreatePublishPlanTool(),
                ListPublishPlansTool(),

                # 任务管理工具
                GetTaskStatusTool(),
                ListTasksStatusTool(),

                # 矩阵发布工具
                GenerateMatrixTasksTool(),
                GetMatrixStatusTool(),
                ExecuteMatrixTaskTool(),
                ExecuteAllMatrixTasksTool(),

                # 系统工具
                GetSystemContextTool(),
                GetDashboardStatsTool(),
                ExecutePythonScriptTool(),

                # 扩展工具 - 数据采集
                MediaCrawlerTool(),
                WechatChannelsCrawlerTool(),

                # 扩展工具 - 基础设施
                IPPoolTool(),
                CookieManagerTool(),

                # 扩展工具 - 平台操作
                PlatformLoginTool(),
                CheckLoginStatusTool(),

                # 扩展工具 - 数据分析
                DataAnalyticsTool(),

                # 扩展工具 - 脚本执行
                RunScriptTool()
            )

            # 将自定义工具添加到 agent
            for tool in custom_tools.tools:
                self._agent.available_tools.add_tool(tool)

            self._initialized = True

            # 获取当前配置信息用于日志
            from app.config import config
            current_llm = config.llm["default"]
            api_key_masked = current_llm.api_key[:8] + "***" if len(current_llm.api_key) > 8 else "***"

            manus_logger.info(
                f"✅ OpenManus Agent 初始化成功 - "
                f"Model: {current_llm.model}, "
                f"Base URL: {current_llm.base_url}, "
                f"API Key: {api_key_masked}, "
                f"工具数量: {len(self._agent.available_tools.tools)}"
            )

        except ValueError as e:
            # 配置错误，友好提示
            manus_logger.error(f"OpenManus 配置错误: {e}")
            raise ValueError(str(e))
        except Exception as e:
            manus_logger.error(f"OpenManus Agent 初始化失败: {e}", exc_info=True)
            raise

    async def run_goal(self, goal: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        运行 OpenManus Agent 执行目标

        Args:
            goal: 自然语言目标描述
            context: 额外上下文信息（可选）

        Returns:
            {
                "success": bool,
                "result": str,
                "steps": List[Dict],
                "error": Optional[str]
            }
        """
        if not self._initialized:
            await self.initialize()

        try:
            manus_logger.info(f"🚀 开始执行目标: {goal}")

            # 构建完整的 prompt
            full_prompt = goal
            if context:
                context_str = "\n\n## 上下文信息:\n"
                for key, value in context.items():
                    context_str += f"- {key}: {value}\n"
                full_prompt = f"{goal}{context_str}"

            # 运行 agent
            result = await self._agent.run(full_prompt)

            # 提取执行步骤
            steps = []
            if hasattr(self._agent, 'history'):
                for msg in self._agent.history:
                    if msg.get('role') == 'assistant' and msg.get('tool_calls'):
                        for tool_call in msg['tool_calls']:
                            steps.append({
                                "tool": tool_call.get('function', {}).get('name'),
                                "arguments": tool_call.get('function', {}).get('arguments'),
                            })

            manus_logger.info(f"✅ 目标执行完成，共执行 {len(steps)} 个步骤")

            return {
                "success": True,
                "result": str(result) if result else "执行完成",
                "steps": steps,
                "error": None
            }

        except Exception as e:
            manus_logger.error(f"❌ 目标执行失败: {e}", exc_info=True)
            return {
                "success": False,
                "result": "",
                "steps": [],
                "error": str(e)
            }

    async def cleanup(self):
        """清理资源"""
        if self._agent:
            try:
                await self._agent.cleanup()
                manus_logger.info("OpenManus Agent 资源已清理")
            except Exception as e:
                manus_logger.error(f"清理 OpenManus Agent 资源时出错: {e}")


# 全局单例
_manus_agent_instance: Optional[ManusAgentWrapper] = None


async def get_manus_agent() -> ManusAgentWrapper:
    """
    获取全局 OpenManus Agent 实例

    NOTE: 应该在应用启动时(main.py startup_event)预先初始化,
    避免首次请求时的延迟。
    """
    global _manus_agent_instance

    if _manus_agent_instance is None:
        _manus_agent_instance = ManusAgentWrapper()
        await _manus_agent_instance.initialize()

    return _manus_agent_instance


async def run_goal(goal: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    快捷方法：运行 OpenManus Agent 执行目标

    Args:
        goal: 自然语言目标描述
        context: 额外上下文信息

    Returns:
        执行结果
    """
    agent = await get_manus_agent()
    return await agent.run_goal(goal, context)
