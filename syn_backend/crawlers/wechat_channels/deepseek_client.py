"""
DeepSeek API 集成模块
用于使用 AI 解析和增强视频号爬取的数据
"""
import httpx
from typing import Dict, Any, Optional, List
from loguru import logger


class DeepSeekClient:
    """DeepSeek API 客户端（支持 SiliconFlow）"""

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: str = "https://api.siliconflow.cn/v1",
        use_siliconflow: bool = True
    ):
        """
        初始化 DeepSeek 客户端

        Args:
            api_key: API Key（如果为 None，则从环境变量读取 SILICONFLOW_API_KEY 或 DEEPSEEK_API_KEY）
            base_url: API 基础 URL（默认使用 SiliconFlow）
            use_siliconflow: 是否使用 SiliconFlow（默认 True）
        """
        import os
        if use_siliconflow:
            self.api_key = api_key or os.getenv("SILICONFLOW_API_KEY")
            self.base_url = "https://api.siliconflow.cn/v1"
        else:
            self.api_key = api_key or os.getenv("DEEPSEEK_API_KEY")
            self.base_url = base_url

        self.client = httpx.AsyncClient(timeout=60.0)

    async def close(self):
        """关闭 HTTP 客户端"""
        await self.client.aclose()

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()

    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: str = "deepseek-ai/DeepSeek-V3",
        temperature: float = 0.7,
        max_tokens: int = 2000
    ) -> Dict[str, Any]:
        """
        调用 DeepSeek Chat Completion API

        Args:
            messages: 对话消息列表
            model: 模型名称
            temperature: 温度参数
            max_tokens: 最大 token 数

        Returns:
            API 响应
        """
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }

            payload = {
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens
            }

            response = await self.client.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload
            )
            response.raise_for_status()

            data = response.json()
            return {
                "success": True,
                "data": data
            }

        except Exception as e:
            logger.error(f"DeepSeek API 调用失败: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    async def parse_video_content(self, raw_html: str) -> Dict[str, Any]:
        """
        使用 DeepSeek 解析视频原始 HTML，提取结构化数据

        Args:
            raw_html: 视频项的原始 HTML

        Returns:
            解析后的结构化数据
        """
        prompt = f"""
你是一个专业的数据解析助手。请分析以下微信视频号的 HTML 片段，提取出视频的关键信息。

HTML 内容：
{raw_html}

请以 JSON 格式返回以下信息（如果某些字段无法提取，返回 null）：
{{
    "title": "视频标题",
    "description": "视频描述",
    "cover_url": "封面图片 URL",
    "duration": "视频时长",
    "play_count": "播放量",
    "like_count": "点赞数",
    "comment_count": "评论数",
    "publish_time": "发布时间",
    "video_id": "视频ID（如果有）",
    "video_url": "视频链接（如果有）"
}}

只返回 JSON，不要包含任何其他文字说明。
"""

        messages = [
            {"role": "system", "content": "你是一个专业的数据解析助手，擅长从 HTML 中提取结构化数据。"},
            {"role": "user", "content": prompt}
        ]

        result = await self.chat_completion(messages, temperature=0.3)

        if not result["success"]:
            return {
                "success": False,
                "error": result.get("error", "DeepSeek 解析失败")
            }

        try:
            # 提取 AI 返回的文本
            content = result["data"]["choices"][0]["message"]["content"]

            # 尝试解析为 JSON
            import json
            parsed_data = json.loads(content)

            return {
                "success": True,
                "data": parsed_data
            }

        except Exception as e:
            logger.error(f"解析 DeepSeek 响应失败: {e}")
            return {
                "success": False,
                "error": f"解析响应失败: {e}"
            }

    async def enhance_video_metadata(self, video_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        使用 DeepSeek 增强视频元数据（如生成标签、摘要等）

        Args:
            video_data: 原始视频数据

        Returns:
            增强后的视频数据
        """
        title = video_data.get("title", "")
        description = video_data.get("description", "")

        if not title and not description:
            return {
                "success": False,
                "error": "标题和描述都为空，无法增强元数据"
            }

        prompt = f"""
请分析以下视频号视频的信息，生成标签和摘要。

标题：{title}
描述：{description}

请以 JSON 格式返回：
{{
    "tags": ["标签1", "标签2", "标签3"],
    "summary": "一句话摘要（不超过50字）",
    "category": "视频分类（如：娱乐、教育、美食、科技等）"
}}

只返回 JSON，不要包含其他文字。
"""

        messages = [
            {"role": "system", "content": "你是一个专业的内容分析助手，擅长提取关键信息和生成标签。"},
            {"role": "user", "content": prompt}
        ]

        result = await self.chat_completion(messages, temperature=0.5)

        if not result["success"]:
            return {
                "success": False,
                "error": result.get("error", "DeepSeek 增强失败")
            }

        try:
            import json
            content = result["data"]["choices"][0]["message"]["content"]
            enhanced_data = json.loads(content)

            # 合并原始数据和增强数据
            return {
                "success": True,
                "data": {**video_data, **enhanced_data}
            }

        except Exception as e:
            logger.error(f"解析 DeepSeek 增强响应失败: {e}")
            return {
                "success": False,
                "error": f"解析响应失败: {e}"
            }

    async def batch_parse_videos(
        self,
        raw_video_items: List[str],
        max_concurrent: int = 3
    ) -> List[Dict[str, Any]]:
        """
        批量解析多个视频的 HTML

        Args:
            raw_video_items: 原始 HTML 列表
            max_concurrent: 最大并发数

        Returns:
            解析结果列表
        """
        import asyncio

        # 使用 Semaphore 控制并发
        semaphore = asyncio.Semaphore(max_concurrent)

        async def parse_with_semaphore(html: str):
            async with semaphore:
                return await self.parse_video_content(html)

        tasks = [parse_with_semaphore(html) for html in raw_video_items]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # 过滤异常结果
        parsed_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(f"解析第 {i+1} 个视频时出错: {result}")
                parsed_results.append({
                    "success": False,
                    "error": str(result)
                })
            else:
                parsed_results.append(result)

        return parsed_results
