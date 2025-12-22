#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
B站登录功能测试脚本
测试使用biliup.exe的登录集成
"""
import asyncio
import sys
from pathlib import Path

# 添加项目路径
sys.path.insert(0, str(Path(__file__).parent))

from myUtils.login_bilibili_biliup import get_bilibili_cookie_with_biliup
from queue import Queue as ThreadQueue


async def test_bilibili_login():
    """测试B站登录功能"""

    print("=" * 60)
    print("B站登录功能测试 (使用biliup.exe)")
    print("=" * 60)

    # 测试账号ID
    test_account_id = "test_bilibili_account"

    print(f"\n账号ID: {test_account_id}")
    print("准备启动登录流程，请准备扫描二维码...")
    print()

    # 创建状态队列
    status_queue = ThreadQueue()

    try:
        # 执行登录
        success = await get_bilibili_cookie_with_biliup(test_account_id, status_queue)

        # 获取状态消息
        print("\n状态消息:")
        while not status_queue.empty():
            msg = status_queue.get()
            print(f"  - {msg}")

        print("\n" + "=" * 60)
        if success:
            print("✅ 测试成功！B站登录完成")
            print(f"Cookie已保存到: cookiesFile/bilibili_{test_account_id}.json")
            print("=" * 60)
            return True
        else:
            print("❌ 测试失败：登录未成功")
            print("=" * 60)
            return False

    except Exception as e:
        print("\n" + "=" * 60)
        print(f"❌ 测试异常: {str(e)}")
        print("=" * 60)
        import traceback
        traceback.print_exc()
        return False


async def test_biliup_check():
    """测试biliup.exe可用性检查"""

    print("\n检查biliup.exe工具...")

    from pathlib import Path
    BASE_DIR = Path(__file__).resolve().parent
    BILIUP_EXE = BASE_DIR / "uploader" / "bilibili_uploader" / "biliup.exe"

    if BILIUP_EXE.exists():
        print(f"✅ biliup.exe存在: {BILIUP_EXE}")
        return True
    else:
        print(f"❌ biliup.exe不存在: {BILIUP_EXE}")
        print("请从 https://github.com/Laihiujin/biliup-app 下载biliup.exe")
        return False


def main():
    """主函数"""
    print("\n" + "=" * 60)
    print("B站登录集成测试")
    print("=" * 60 + "\n")

    # 检查biliup.exe
    if not asyncio.run(test_biliup_check()):
        print("\n❌ biliup.exe不可用，无法继续测试")
        sys.exit(1)

    print("\n使用说明:")
    print("1. 登录过程中会在控制台显示二维码")
    print("2. 使用手机B站APP扫描二维码")
    print("3. 等待登录完成\n")

    input("按回车键开始测试...")

    # 运行登录测试
    success = asyncio.run(test_bilibili_login())

    if success:
        print("\n✅ 所有测试通过！")
        sys.exit(0)
    else:
        print("\n❌ 测试失败")
        sys.exit(1)


if __name__ == "__main__":
    main()
