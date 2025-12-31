"""
视频号数据存储模块
用于存储抓取的视频号数据
"""
import sqlite3
from typing import Dict, List, Any, Optional
from pathlib import Path
from datetime import datetime
from loguru import logger


class WechatChannelsStorage:
    """视频号数据存储"""

    def __init__(self, db_path: Optional[Path] = None):
        """
        初始化数据库

        Args:
            db_path: 数据库文件路径（默认使用主数据库）
        """
        if db_path is None:
            from fastapi_app.core.config import settings
            db_path = Path(settings.DATABASE_PATH)

        self.db_path = db_path
        self._init_tables()

    def _get_connection(self) -> sqlite3.Connection:
        """获取数据库连接"""
        conn = sqlite3.connect(str(self.db_path))
        conn.row_factory = sqlite3.Row
        return conn

    def _init_tables(self):
        """初始化数据库表"""
        conn = self._get_connection()
        cursor = conn.cursor()

        try:
            # 创建视频号视频表
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS wechat_channels_videos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    video_id TEXT UNIQUE,
                    account_id TEXT,
                    title TEXT,
                    description TEXT,
                    cover_url TEXT,
                    video_url TEXT,
                    duration TEXT,
                    play_count INTEGER,
                    like_count INTEGER,
                    comment_count INTEGER,
                    share_count INTEGER,
                    publish_time DATETIME,
                    category TEXT,
                    tags TEXT,
                    summary TEXT,
                    raw_html TEXT,
                    ai_enhanced INTEGER DEFAULT 0,
                    crawled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # 创建视频号账号表
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS wechat_channels_accounts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    account_id TEXT UNIQUE,
                    account_name TEXT,
                    nickname TEXT,
                    avatar_url TEXT,
                    description TEXT,
                    cookie_file TEXT,
                    status TEXT DEFAULT 'active',
                    total_videos INTEGER DEFAULT 0,
                    total_followers INTEGER DEFAULT 0,
                    total_likes INTEGER DEFAULT 0,
                    last_crawl_time DATETIME,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # 创建抓取任务表
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS wechat_channels_crawl_tasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    account_id TEXT,
                    task_type TEXT,
                    status TEXT DEFAULT 'pending',
                    max_pages INTEGER DEFAULT 3,
                    videos_count INTEGER DEFAULT 0,
                    ai_enhanced INTEGER DEFAULT 0,
                    error_message TEXT,
                    started_at DATETIME,
                    completed_at DATETIME,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)

            conn.commit()
            logger.info("✅ 视频号数据库表初始化成功")

        except Exception as e:
            logger.error(f"❌ 初始化视频号数据库表失败: {e}")
            conn.rollback()
        finally:
            conn.close()

    def save_video(self, video_data: Dict[str, Any]) -> int:
        """
        保存单个视频数据

        Args:
            video_data: 视频数据字典

        Returns:
            插入的视频ID
        """
        conn = self._get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute("""
                INSERT OR REPLACE INTO wechat_channels_videos (
                    video_id, account_id, title, description, cover_url, video_url,
                    duration, play_count, like_count, comment_count, share_count,
                    publish_time, category, tags, summary, raw_html, ai_enhanced,
                    crawled_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                video_data.get("video_id"),
                video_data.get("account_id"),
                video_data.get("title"),
                video_data.get("description"),
                video_data.get("cover_url"),
                video_data.get("video_url"),
                video_data.get("duration"),
                video_data.get("play_count"),
                video_data.get("like_count"),
                video_data.get("comment_count"),
                video_data.get("share_count"),
                video_data.get("publish_time"),
                video_data.get("category"),
                video_data.get("tags"),
                video_data.get("summary"),
                video_data.get("raw_html"),
                video_data.get("ai_enhanced", 0),
                video_data.get("crawled_at", datetime.now().isoformat()),
                datetime.now().isoformat()
            ))

            conn.commit()
            return cursor.lastrowid

        except Exception as e:
            logger.error(f"保存视频数据失败: {e}")
            conn.rollback()
            raise
        finally:
            conn.close()

    def save_videos_batch(self, videos: List[Dict[str, Any]]) -> int:
        """
        批量保存视频数据

        Args:
            videos: 视频数据列表

        Returns:
            成功保存的数量
        """
        saved_count = 0
        for video in videos:
            try:
                self.save_video(video)
                saved_count += 1
            except Exception as e:
                logger.warning(f"保存视频失败: {e}")
                continue

        return saved_count

    def get_videos_by_account(
        self,
        account_id: str,
        limit: int = 100,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """
        获取指定账号的视频列表

        Args:
            account_id: 账号ID
            limit: 返回数量限制
            offset: 偏移量

        Returns:
            视频列表
        """
        conn = self._get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute("""
                SELECT * FROM wechat_channels_videos
                WHERE account_id = ?
                ORDER BY crawled_at DESC
                LIMIT ? OFFSET ?
            """, (account_id, limit, offset))

            rows = cursor.fetchall()
            return [dict(row) for row in rows]

        finally:
            conn.close()

    def save_account(self, account_data: Dict[str, Any]) -> int:
        """
        保存账号信息

        Args:
            account_data: 账号数据

        Returns:
            账号ID
        """
        conn = self._get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute("""
                INSERT OR REPLACE INTO wechat_channels_accounts (
                    account_id, account_name, nickname, avatar_url, description,
                    cookie_file, status, total_videos, total_followers, total_likes,
                    last_crawl_time, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                account_data.get("account_id"),
                account_data.get("account_name"),
                account_data.get("nickname"),
                account_data.get("avatar_url"),
                account_data.get("description"),
                account_data.get("cookie_file"),
                account_data.get("status", "active"),
                account_data.get("total_videos", 0),
                account_data.get("total_followers", 0),
                account_data.get("total_likes", 0),
                account_data.get("last_crawl_time", datetime.now().isoformat()),
                datetime.now().isoformat()
            ))

            conn.commit()
            return cursor.lastrowid

        except Exception as e:
            logger.error(f"保存账号信息失败: {e}")
            conn.rollback()
            raise
        finally:
            conn.close()

    def get_all_accounts(self) -> List[Dict[str, Any]]:
        """
        获取所有视频号账号

        Returns:
            账号列表
        """
        conn = self._get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute("""
                SELECT * FROM wechat_channels_accounts
                ORDER BY last_crawl_time DESC
            """)

            rows = cursor.fetchall()
            return [dict(row) for row in rows]

        finally:
            conn.close()

    def create_crawl_task(self, task_data: Dict[str, Any]) -> int:
        """
        创建抓取任务

        Args:
            task_data: 任务数据

        Returns:
            任务ID
        """
        conn = self._get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute("""
                INSERT INTO wechat_channels_crawl_tasks (
                    account_id, task_type, max_pages, ai_enhanced, started_at
                ) VALUES (?, ?, ?, ?, ?)
            """, (
                task_data.get("account_id"),
                task_data.get("task_type", "fetch_videos"),
                task_data.get("max_pages", 3),
                task_data.get("ai_enhanced", 0),
                datetime.now().isoformat()
            ))

            conn.commit()
            return cursor.lastrowid

        except Exception as e:
            logger.error(f"创建抓取任务失败: {e}")
            conn.rollback()
            raise
        finally:
            conn.close()

    def update_crawl_task(
        self,
        task_id: int,
        status: str,
        videos_count: Optional[int] = None,
        error_message: Optional[str] = None
    ):
        """
        更新抓取任务状态

        Args:
            task_id: 任务ID
            status: 任务状态
            videos_count: 抓取到的视频数量
            error_message: 错误信息
        """
        conn = self._get_connection()
        cursor = conn.cursor()

        try:
            update_fields = ["status = ?"]
            params = [status]

            if videos_count is not None:
                update_fields.append("videos_count = ?")
                params.append(videos_count)

            if error_message is not None:
                update_fields.append("error_message = ?")
                params.append(error_message)

            if status in ["completed", "failed"]:
                update_fields.append("completed_at = ?")
                params.append(datetime.now().isoformat())

            params.append(task_id)

            cursor.execute(f"""
                UPDATE wechat_channels_crawl_tasks
                SET {', '.join(update_fields)}
                WHERE id = ?
            """, params)

            conn.commit()

        except Exception as e:
            logger.error(f"更新抓取任务失败: {e}")
            conn.rollback()
            raise
        finally:
            conn.close()

    def get_recent_tasks(self, limit: int = 20) -> List[Dict[str, Any]]:
        """
        获取最近的抓取任务

        Args:
            limit: 返回数量限制

        Returns:
            任务列表
        """
        conn = self._get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute("""
                SELECT * FROM wechat_channels_crawl_tasks
                ORDER BY created_at DESC
                LIMIT ?
            """, (limit,))

            rows = cursor.fetchall()
            return [dict(row) for row in rows]

        finally:
            conn.close()


# 全局存储实例
_storage: Optional[WechatChannelsStorage] = None


def get_wechat_channels_storage() -> WechatChannelsStorage:
    """获取视频号存储单例"""
    global _storage
    if _storage is None:
        _storage = WechatChannelsStorage()
    return _storage
