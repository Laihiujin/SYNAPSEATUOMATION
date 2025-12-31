"""列出所有视频号 Cookie 账号"""
from pathlib import Path
import json
from loguru import logger

def list_accounts():
    cookies_dir = Path(__file__).parent.parent.parent / "cookiesFile"

    # 查找所有 channels_*.json 文件
    channels_files = sorted(cookies_dir.glob("channels_*.json"), reverse=True)

    if not channels_files:
        logger.warning("❌ 未找到任何 channels_*.json 文件")
        return

    logger.info(f"📋 找到 {len(channels_files)} 个视频号 Cookie 文件：")
    logger.info("=" * 60)

    for i, cookie_file in enumerate(channels_files, 1):
        try:
            with open(cookie_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                user_info = data.get("user_info", {})

                # 尝试获取账号信息
                account_name = user_info.get("name", "未知")
                account_id = user_info.get("user_id", cookie_file.stem)

                # 如果 user_info 为空，尝试从 cookies 中获取
                if not user_info:
                    cookies = data.get("cookies", [])
                    for cookie in cookies:
                        if cookie.get("name") == "wxuin":
                            account_id = cookie.get("value", account_id)
                            break

                logger.info(f"{i}. 📁 {cookie_file.name}")
                logger.info(f"   👤 账号名称: {account_name}")
                logger.info(f"   🆔 账号ID: {account_id}")
                logger.info(f"   🍪 Cookie数量: {len(data.get('cookies', []))}")
                logger.info("")
        except Exception as e:
            logger.error(f"读取 {cookie_file.name} 失败: {e}")

if __name__ == "__main__":
    list_accounts()
