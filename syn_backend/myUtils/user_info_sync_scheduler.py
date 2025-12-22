"""
用户信息同步调度器
定时抓取所有账号的用户信息(name, avatar, user_id)
"""
import schedule
import time
import threading
from datetime import datetime
from loguru import logger
from myUtils.fetch_user_info_service import fetch_all_user_info_sync


class UserInfoSyncScheduler:
    """用户信息同步调度器"""

    def __init__(self):
        self.running = False
        self.scheduler_thread = None

    def sync_user_info(self):
        """执行用户信息同步"""
        try:
            logger.info(f"[UserInfoSync] 开始定时同步用户信息 - {datetime.now().isoformat()}")
            stats = fetch_all_user_info_sync()
            logger.info(f"[UserInfoSync] 同步完成: {stats}")
            return stats
        except Exception as e:
            logger.error(f"[UserInfoSync] 同步失败: {e}")
            return None

    def setup_schedules(self):
        """设置定时任务"""
        # 每30分钟执行一次
        schedule.every(30).minutes.do(self.sync_user_info)
        logger.info("✅ [UserInfoSync] 定时任务已设置: 每30分钟同步一次")

    def start(self):
        """启动调度器"""
        if self.running:
            logger.warning("⚠️ [UserInfoSync] 调度器已在运行")
            return

        self.running = True
        logger.info("🚀 [UserInfoSync] 启动用户信息同步调度器...")

        # 设置调度
        self.setup_schedules()

        # 启动调度线程
        def run_scheduler():
            while self.running:
                schedule.run_pending()
                time.sleep(60)  # 每分钟检查一次

        self.scheduler_thread = threading.Thread(target=run_scheduler, daemon=True)
        self.scheduler_thread.start()

        logger.info("✅ [UserInfoSync] 调度器已启动")

    def stop(self):
        """停止调度器"""
        logger.info("🛑 [UserInfoSync] 停止调度器...")
        self.running = False

        if self.scheduler_thread:
            self.scheduler_thread.join(timeout=5)

        schedule.clear()
        logger.info("✅ [UserInfoSync] 调度器已停止")

    def trigger_now(self):
        """立即触发一次同步"""
        logger.info("🔄 [UserInfoSync] 手动触发同步...")
        return self.sync_user_info()


# 全局实例
user_info_sync_scheduler = UserInfoSyncScheduler()


if __name__ == "__main__":
    # 测试运行
    scheduler = UserInfoSyncScheduler()
    try:
        scheduler.start()
        print("调度器已启动，按 Ctrl+C 停止...")
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        scheduler.stop()
        print("\n程序已退出")
