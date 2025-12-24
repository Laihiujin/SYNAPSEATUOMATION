#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""测试 Chrome for Testing 路径配置"""
import sys
from pathlib import Path

print("=" * 80)
print("Chrome for Testing 路径测试")
print("=" * 80)
print()

# 测试1: 从配置读取
print("[测试1] 从配置文件读取 LOCAL_CHROME_PATH")
try:
    from config.conf import LOCAL_CHROME_PATH, BASE_DIR
    print(f"  配置值: {LOCAL_CHROME_PATH}")
    print(f"  项目根: {BASE_DIR}")

    if LOCAL_CHROME_PATH:
        chrome_path = Path(str(LOCAL_CHROME_PATH))
        print(f"  是否为绝对路径: {chrome_path.is_absolute()}")

        # 如果是相对路径，从项目根目录解析
        if not chrome_path.is_absolute():
            chrome_path = Path(BASE_DIR) / chrome_path
            print(f"  解析后路径: {chrome_path}")

        if chrome_path.is_file():
            print(f"  ✅ Chrome for Testing 存在")
            print(f"  绝对路径: {chrome_path.resolve()}")
        else:
            print(f"  ❌ 文件不存在")
    else:
        print("  ⚠️ LOCAL_CHROME_PATH 未配置")
except Exception as e:
    print(f"  ❌ 读取失败: {e}")

print()

# 测试2: 自动查找
print("[测试2] 自动查找项目内的 Chrome for Testing")
try:
    project_root = Path(__file__).parent
    auto_chrome_path = project_root / '.chrome-for-testing'

    print(f"  查找目录: {auto_chrome_path}")

    if auto_chrome_path.exists():
        chrome_dirs = sorted(auto_chrome_path.glob('chrome-*'), reverse=True)
        print(f"  找到 {len(chrome_dirs)} 个版本")

        for chrome_dir in chrome_dirs:
            chrome_exe = chrome_dir / 'chrome-win64' / 'chrome.exe'
            if chrome_exe.exists():
                rel_path = chrome_exe.relative_to(project_root)
                print(f"  ✅ 最新版本: {rel_path}")
                print(f"     绝对路径: {chrome_exe.resolve()}")
                break
    else:
        print(f"  ❌ 目录不存在")
except Exception as e:
    print(f"  ❌ 查找失败: {e}")

print()
print("=" * 80)
print("测试完成")
print("=" * 80)
