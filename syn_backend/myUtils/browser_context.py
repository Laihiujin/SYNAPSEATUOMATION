from typing import Dict, Any, Optional
import os
from pathlib import Path

DEFAULT_CONTEXT_OPTS: Dict[str, Any] = {
    # 禁用位置权限（不在 permissions 列表中 = 拒绝）
    # 移除 geolocation 以禁止浏览器请求位置信息
    # "permissions": ["geolocation"],  # 已禁用
    # "geolocation": {"longitude": 0, "latitude": 0},  # 已禁用
    "locale": "zh-CN",
    "timezone_id": "Asia/Shanghai",
    # 忽略HTTPS错误（某些平台可能需要）
    "ignore_https_errors": True,
}


def build_context_options(**overrides: Any) -> Dict[str, Any]:
    """返回带默认权限/时区的 context 配置，可用 storage_state 等覆盖。"""
    opts = DEFAULT_CONTEXT_OPTS.copy()
    opts.update(overrides)
    return opts



def build_browser_args() -> Dict[str, Any]:
    """
    返回 Playwright browser.launch() 的参数配置
    包括代理绕过设置以解决 ERR_PROXY_CONNECTION_FAILED
    """
    args = {
        "headless": False,
        "args": [
            "--disable-blink-features=AutomationControlled",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            # 禁用地理位置相关功能
            "--disable-features=Geolocation",
            "--disable-geolocation",
        ],
    }

    # 如果环境变量中没有明确设置代理，则禁用代理
    # 这样可以避免 ERR_PROXY_CONNECTION_FAILED 错误
    if not os.getenv("HTTP_PROXY") and not os.getenv("HTTPS_PROXY"):
        args["args"].extend([
            "--no-proxy-server",
            "--proxy-bypass-list=*",
        ])

    # 自动配置 Chrome for Testing 路径（支持相对路径）
    # 优先使用配置文件中的 LOCAL_CHROME_PATH
    try:
        from config.conf import LOCAL_CHROME_PATH, BASE_DIR
        if LOCAL_CHROME_PATH:
            chrome_path = Path(str(LOCAL_CHROME_PATH))

            # 如果是相对路径，从项目根目录解析
            if not chrome_path.is_absolute():
                chrome_path = Path(BASE_DIR) / chrome_path

            if chrome_path.is_file():
                args["executable_path"] = str(chrome_path.resolve())
                print(f"✅ 使用 Chrome for Testing（相对项目路径）")
            else:
                print(f"⚠️ LOCAL_CHROME_PATH 路径无效: {LOCAL_CHROME_PATH}")
        else:
            print("ℹ️ LOCAL_CHROME_PATH 未配置，将使用 Playwright 默认的 Chromium")
    except Exception as e:
        print(f"⚠️ 加载 LOCAL_CHROME_PATH 配置失败: {e}")

    return args


# ============================================
# 单账号绑定持久化浏览器
# ============================================

class PersistentBrowserManager:
    """
    持久化浏览器管理器
    为每个账号创建独立的浏览器用户数据目录，实现持久化

    特点：
    - 每个账号有独立的 user_data_dir
    - 保留 Cookie、LocalStorage、登录状态等
    - 自动集成设备指纹
    """

    def __init__(self, base_dir: Optional[Path] = None):
        if base_dir is None:
            from config.conf import BASE_DIR
            base_dir = Path(BASE_DIR) / "syn_backend" / "browser_profiles"

        self.base_dir = base_dir
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def get_user_data_dir(self, account_id: str, platform: str) -> Path:
        """
        获取账号的持久化浏览器数据目录

        Args:
            account_id: 账号 ID
            platform: 平台名称

        Returns:
            Path: 用户数据目录路径
        """
        # 为每个账号创建独立的目录
        user_dir = self.base_dir / f"{platform}_{account_id}"
        user_dir.mkdir(parents=True, exist_ok=True)

        return user_dir

    def build_persistent_context_options(
        self,
        account_id: str,
        platform: str,
        apply_fingerprint: bool = True,
        **overrides: Any
    ) -> Dict[str, Any]:
        """
        构建持久化浏览器上下文配置

        Args:
            account_id: 账号 ID
            platform: 平台名称
            apply_fingerprint: 是否应用设备指纹
            **overrides: 额外的配置覆盖

        Returns:
            Dict: Playwright 上下文配置
        """
        # 基础配置
        opts = DEFAULT_CONTEXT_OPTS.copy()

        # 应用设备指纹
        if apply_fingerprint:
            try:
                from myUtils.device_fingerprint import device_fingerprint_manager

                fingerprint = device_fingerprint_manager.get_or_create_fingerprint(
                    account_id=account_id,
                    platform=platform
                )

                opts = device_fingerprint_manager.apply_to_context(fingerprint, opts)
            except Exception as e:
                print(f"⚠️ 应用设备指纹失败: {e}")

        # 应用额外配置
        opts.update(overrides)

        return opts

    async def get_init_scripts(
        self,
        account_id: str,
        platform: str
    ) -> list[str]:
        """
        获取需要注入的初始化脚本

        Args:
            account_id: 账号 ID
            platform: 平台名称

        Returns:
            List[str]: 初始化脚本列表
        """
        scripts = []

        # 添加设备指纹脚本
        try:
            from myUtils.device_fingerprint import device_fingerprint_manager

            fingerprint = device_fingerprint_manager.get_or_create_fingerprint(
                account_id=account_id,
                platform=platform
            )

            script = device_fingerprint_manager.get_init_script(fingerprint)
            scripts.append(script)
        except Exception as e:
            print(f"⚠️ 获取设备指纹脚本失败: {e}")

        return scripts

    def cleanup_user_data(self, account_id: str, platform: str) -> bool:
        """
        清理账号的浏览器数据（谨慎使用）

        Args:
            account_id: 账号 ID
            platform: 平台名称

        Returns:
            bool: 是否成功
        """
        import shutil

        user_dir = self.get_user_data_dir(account_id, platform)

        try:
            if user_dir.exists():
                shutil.rmtree(user_dir)
                return True
            return False
        except Exception as e:
            print(f"❌ 清理浏览器数据失败: {e}")
            return False


# 全局实例
persistent_browser_manager = PersistentBrowserManager()

