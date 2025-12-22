#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
下载 Chrome for Testing（支持 H.265 视频编码）
"""
import sys
import json
import requests
import zipfile
import shutil
from pathlib import Path

def download_file(url, dest_path, chunk_size=8192):
    """下载文件并显示进度"""
    response = requests.get(url, stream=True)
    response.raise_for_status()

    total_size = int(response.headers.get('content-length', 0))
    downloaded = 0

    dest_path = Path(dest_path)
    dest_path.parent.mkdir(parents=True, exist_ok=True)

    with open(dest_path, 'wb') as f:
        for chunk in response.iter_content(chunk_size=chunk_size):
            if chunk:
                f.write(chunk)
                downloaded += len(chunk)
                if total_size > 0:
                    percent = (downloaded / total_size) * 100
                    print(f'\r下载中: {percent:.1f}% ({downloaded}/{total_size} bytes)', end='')

    print()  # 换行
    return dest_path

def get_latest_chrome_for_testing():
    """获取最新的 Chrome for Testing 版本信息"""
    print("正在获取最新版本信息...")

    # Chrome for Testing 的版本信息 API
    api_url = "https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions-with-downloads.json"

    try:
        response = requests.get(api_url, timeout=10)
        response.raise_for_status()
        data = response.json()

        # 获取稳定版本
        stable = data['channels']['Stable']
        version = stable['version']

        # 找到 Windows 64 位版本
        chrome_download = None
        for download in stable['downloads']['chrome']:
            if download['platform'] == 'win64':
                chrome_download = download
                break

        if not chrome_download:
            raise Exception("未找到 Windows 64 位版本")

        print(f"最新稳定版: {version}")
        return {
            'version': version,
            'url': chrome_download['url']
        }

    except Exception as e:
        print(f"❌ 获取版本信息失败: {e}")
        print("\n使用备用版本...")

        # 备用：使用已知的稳定版本
        return {
            'version': '131.0.6778.108',
            'url': 'https://storage.googleapis.com/chrome-for-testing-public/131.0.6778.108/win64/chrome-win64.zip'
        }

def main():
    print("=" * 80)
    print("Chrome for Testing 下载工具")
    print("=" * 80)
    print()

    # 获取版本信息
    chrome_info = get_latest_chrome_for_testing()

    # 设置下载目标
    project_root = Path(__file__).parent
    download_dir = project_root / '.chrome-for-testing'
    download_dir.mkdir(exist_ok=True)

    zip_file = download_dir / f"chrome-{chrome_info['version']}.zip"
    extract_dir = download_dir / f"chrome-{chrome_info['version']}"

    # 检查是否已存在
    if extract_dir.exists():
        chrome_exe = extract_dir / 'chrome-win64' / 'chrome.exe'
        if chrome_exe.exists():
            print(f"✅ Chrome for Testing 已存在: {chrome_exe}")
            print("\n更新 .env 配置...")

            # 更新 .env（使用相对路径）
            env_file = project_root / '.env'
            if env_file.exists():
                content = env_file.read_text(encoding='utf-8')

                # 计算相对路径
                import re
                try:
                    rel_path = chrome_exe.relative_to(project_root)
                    chrome_path_str = str(rel_path).replace('\\', '/')
                except ValueError:
                    # 如果无法计算相对路径，使用绝对路径
                    chrome_path_str = str(chrome_exe).replace('\\', '\\\\')

                if 'LOCAL_CHROME_PATH=' in content:
                    content = re.sub(
                        r'LOCAL_CHROME_PATH=.*',
                        f'LOCAL_CHROME_PATH={chrome_path_str}',
                        content
                    )
                else:
                    # 在 PLAYWRIGHT_HEADLESS 后添加
                    content = re.sub(
                        r'(PLAYWRIGHT_HEADLESS=.*\n)',
                        f'\\1\n# Chrome for Testing 路径（视频号专用，支持 H.265 视频编码）\n'
                        f'# 使用相对路径（相对于项目根目录），便于项目移动\n'
                        f'LOCAL_CHROME_PATH={chrome_path_str}\n',
                        content
                    )

                env_file.write_text(content, encoding='utf-8')
                print(f"✅ .env 配置已更新（相对路径）")

            print(f"\n✅ Chrome 路径: {chrome_exe}")
            return

    # 下载
    print(f"\n正在下载 Chrome for Testing {chrome_info['version']}...")
    print(f"URL: {chrome_info['url']}")
    print(f"保存到: {zip_file}")
    print()

    try:
        download_file(chrome_info['url'], zip_file)
        print(f"✅ 下载完成")

        # 解压
        print(f"\n正在解压到: {extract_dir}")
        with zipfile.ZipFile(zip_file, 'r') as zip_ref:
            zip_ref.extractall(extract_dir)
        print(f"✅ 解压完成")

        # 删除 zip 文件
        zip_file.unlink()
        print(f"✅ 已删除临时文件")

        # 找到 chrome.exe
        chrome_exe = extract_dir / 'chrome-win64' / 'chrome.exe'
        if not chrome_exe.exists():
            raise Exception(f"未找到 chrome.exe: {chrome_exe}")

        print(f"\n✅ Chrome for Testing 安装成功!")
        print(f"   路径: {chrome_exe}")

        # 更新 .env（使用相对路径）
        print("\n正在更新 .env 配置...")
        env_file = project_root / '.env'

        if env_file.exists():
            content = env_file.read_text(encoding='utf-8')

            # 计算相对路径
            import re
            try:
                rel_path = chrome_exe.relative_to(project_root)
                chrome_path_str = str(rel_path).replace('\\', '/')
            except ValueError:
                # 如果无法计算相对路径，使用绝对路径
                chrome_path_str = str(chrome_exe).replace('\\', '\\\\')

            if 'LOCAL_CHROME_PATH=' in content:
                content = re.sub(
                    r'LOCAL_CHROME_PATH=.*',
                    f'LOCAL_CHROME_PATH={chrome_path_str}',
                    content
                )
            else:
                # 在 PLAYWRIGHT_HEADLESS 后添加
                content = re.sub(
                    r'(PLAYWRIGHT_HEADLESS=.*\n)',
                    f'\\1\n# Chrome for Testing 路径（视频号专用，支持 H.265 视频编码）\n'
                    f'# 使用相对路径（相对于项目根目录），便于项目移动\n'
                    f'LOCAL_CHROME_PATH={chrome_path_str}\n',
                    content
                )

            env_file.write_text(content, encoding='utf-8')
            print(f"✅ .env 配置已更新（相对路径）")

        print("\n" + "=" * 80)
        print("安装完成！请重启后端服务以使配置生效。")
        print("=" * 80)

    except Exception as e:
        print(f"\n❌ 安装失败: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
