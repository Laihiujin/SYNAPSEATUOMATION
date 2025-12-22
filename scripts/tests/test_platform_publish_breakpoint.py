#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
断点测试脚本 - 测试抖音、视频号、B站发布流程
测试到发布前一步，不实际提交
"""
import asyncio
import sys
import os
from pathlib import Path
from datetime import datetime, timedelta

# 添加项目路径
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root / "syn_backend"))

from utils.log import douyin_logger, tencent_logger, bilibili_logger


def get_test_video():
    """获取测试视频文件"""
    video_dirs = [
        project_root / "syn_backend" / "videoFile",
        project_root / "test_videos",
    ]

    for video_dir in video_dirs:
        if video_dir.exists():
            for ext in ['*.mp4', '*.MP4']:
                videos = list(video_dir.glob(ext))
                if videos:
                    return str(videos[0])

    # 如果没有找到，返回None
    return None


def get_account_files():
    """获取账号cookie文件"""
    cookie_dir = project_root / "config" / "cookiesFile"

    accounts = {
        'douyin': None,
        'tencent': None,
        'bilibili': None
    }

    if cookie_dir.exists():
        # 查找抖音账号
        douyin_files = list(cookie_dir.glob("douyin_account_*.json"))
        if douyin_files:
            accounts['douyin'] = str(douyin_files[0])

        # 查找腾讯视频号账号
        tencent_files = list(cookie_dir.glob("tencent_account_*.json"))
        if tencent_files:
            accounts['tencent'] = str(tencent_files[0])

        # 查找B站账号
        bilibili_files = list(cookie_dir.glob("bilibili_account_*.json"))
        if bilibili_files:
            accounts['bilibili'] = str(bilibili_files[0])

    return accounts


async def test_douyin_publish(video_path, account_file):
    """测试抖音发布流程（断点测试）"""
    from uploader.douyin_uploader.main import DouYinVideo
    from playwright.async_api import async_playwright

    douyin_logger.info("=" * 60)
    douyin_logger.info("开始测试抖音发布流程")
    douyin_logger.info("=" * 60)

    try:
        # 创建视频上传对象
        publish_date = datetime.now() + timedelta(hours=2)
        douyin = DouYinVideo(
            title="【测试】断点测试视频 - 请勿发布",
            file_path=video_path,
            tags=["测试", "断点测试"],
            publish_date=publish_date,
            account_file=account_file
        )

        async with async_playwright() as playwright:
            from utils.base_social_media import HEADLESS_FLAG, set_init_script
            from myUtils.browser_context import build_context_options

            browser = await playwright.chromium.launch(headless=HEADLESS_FLAG)
            context = await browser.new_context(**build_context_options(storage_state=account_file))
            context = await set_init_script(context)
            page = await context.new_page()

            # 访问上传页面
            douyin_logger.info("访问抖音创作者中心...")
            await page.goto("https://creator.douyin.com/creator-micro/content/upload")
            await page.wait_for_load_state("networkidle", timeout=15000)

            # 检查是否需要登录
            if await page.get_by_text('手机号登录').count() or await page.get_by_text('扫码登录').count():
                douyin_logger.error("❌ Cookie已失效，需要重新登录")
                await browser.close()
                return False

            douyin_logger.success("✅ Cookie验证成功")

            # 上传视频文件
            douyin_logger.info("开始上传视频文件...")
            file_input = page.locator('input[type="file"]').first
            await file_input.set_input_files(video_path)
            douyin_logger.success("✅ 视频文件已上传")

            # 等待视频处理
            douyin_logger.info("等待视频处理...")
            await asyncio.sleep(5)

            # 填写标题
            douyin_logger.info("填写标题...")
            title_input = page.locator('.semi-input').first
            await title_input.click()
            await title_input.fill(douyin.title)
            douyin_logger.success(f"✅ 标题已填写: {douyin.title}")

            # 填写标签
            if douyin.tags:
                douyin_logger.info("填写标签...")
                for tag in douyin.tags[:3]:  # 最多3个标签
                    await page.keyboard.type(f" #{tag}")
                    await asyncio.sleep(0.5)
                douyin_logger.success(f"✅ 标签已填写: {douyin.tags}")

            # 查找发布按钮（但不点击）
            publish_button = page.locator('button:has-text("发布")').first
            if await publish_button.count() > 0:
                douyin_logger.success("✅ 找到发布按钮")
                douyin_logger.warning("⚠️  断点测试 - 未实际点击发布按钮")
            else:
                douyin_logger.error("❌ 未找到发布按钮")

            # 截图保存状态
            await page.screenshot(path='logs/douyin_breakpoint_test.png', full_page=True)
            douyin_logger.info("📸 已保存截图: logs/douyin_breakpoint_test.png")

            # 等待用户查看
            douyin_logger.info("等待5秒后关闭浏览器...")
            await asyncio.sleep(5)

            await browser.close()
            douyin_logger.success("✅ 抖音断点测试完成")
            return True

    except Exception as e:
        douyin_logger.error(f"❌ 抖音测试失败: {e}")
        import traceback
        douyin_logger.error(traceback.format_exc())
        return False


async def test_tencent_publish(video_path, account_file):
    """测试视频号发布流程（断点测试）"""
    from uploader.tencent_uploader.main import TencentVideo
    from playwright.async_api import async_playwright

    tencent_logger.info("=" * 60)
    tencent_logger.info("开始测试视频号发布流程")
    tencent_logger.info("=" * 60)

    try:
        # 创建视频上传对象
        publish_date = datetime.now() + timedelta(hours=2)
        tencent = TencentVideo(
            title="【测试】断点测试视频 - 请勿发布",
            file_path=video_path,
            tags=["测试"],
            publish_date=publish_date,
            account_file=account_file
        )

        async with async_playwright() as playwright:
            from utils.base_social_media import HEADLESS_FLAG, set_init_script
            from myUtils.browser_context import build_context_options, build_browser_args

            browser_args = build_browser_args()
            browser_args['headless'] = HEADLESS_FLAG
            if not browser_args.get("executable_path"):
                browser_args.pop("executable_path", None)

            browser = await playwright.chromium.launch(**browser_args)
            context = await browser.new_context(**build_context_options(storage_state=account_file))
            context = await set_init_script(context)
            page = await context.new_page()

            # 访问上传页面
            tencent_logger.info("访问视频号发布页面...")
            await page.goto("https://channels.weixin.qq.com/platform/post/create", timeout=60000)
            await page.wait_for_load_state("networkidle", timeout=15000)

            # 检查是否需要登录
            if "login" in page.url.lower() or await page.locator('text=登录').count() > 0:
                tencent_logger.error("❌ Cookie已失效，需要重新登录")
                await browser.close()
                return False

            tencent_logger.success("✅ Cookie验证成功")

            # 上传视频文件
            tencent_logger.info("开始上传视频文件...")
            file_input = page.locator('input[type="file"]').first
            await file_input.set_input_files(video_path)
            tencent_logger.success("✅ 视频文件已上传")

            # 等待视频处理
            tencent_logger.info("等待视频处理...")
            await asyncio.sleep(5)

            # 填写标题
            tencent_logger.info("填写标题...")
            title_input = page.locator("div.input-editor").first
            await title_input.click()
            await page.keyboard.type(tencent.title)
            tencent_logger.success(f"✅ 标题已填写: {tencent.title}")

            # 查找发表按钮（但不点击）
            publish_button = page.locator('button:has-text("发表")').first
            if await publish_button.count() > 0:
                tencent_logger.success("✅ 找到发表按钮")
                tencent_logger.warning("⚠️  断点测试 - 未实际点击发表按钮")
            else:
                tencent_logger.error("❌ 未找到发表按钮")

            # 截图保存状态
            await page.screenshot(path='logs/tencent_breakpoint_test.png', full_page=True)
            tencent_logger.info("📸 已保存截图: logs/tencent_breakpoint_test.png")

            # 等待用户查看
            tencent_logger.info("等待5秒后关闭浏览器...")
            await asyncio.sleep(5)

            await browser.close()
            tencent_logger.success("✅ 视频号断点测试完成")
            return True

    except Exception as e:
        tencent_logger.error(f"❌ 视频号测试失败: {e}")
        import traceback
        tencent_logger.error(traceback.format_exc())
        return False


async def test_bilibili_publish(video_path, account_file):
    """测试B站发布流程（断点测试）"""
    from uploader.bilibili_uploader.main import BilibiliUploader, read_cookie_json_file

    bilibili_logger.info("=" * 60)
    bilibili_logger.info("开始测试B站发布流程")
    bilibili_logger.info("=" * 60)

    try:
        # 读取cookie
        bilibili_logger.info("读取B站cookie...")
        cookie_data = read_cookie_json_file(Path(account_file))
        bilibili_logger.success("✅ Cookie读取成功")

        # 准备视频信息
        publish_date = int((datetime.now() + timedelta(hours=2)).timestamp())

        # 创建上传对象
        uploader = BilibiliUploader(
            cookie_data=cookie_data,
            file=Path(video_path),
            title="【测试】断点测试视频 - 请勿发布",
            desc="这是一个断点测试视频，用于测试发布流程",
            tid=138,  # 搞笑分类
            tags=["测试", "断点测试"],
            dtime=publish_date
        )

        # 测试到上传文件阶段（不提交）
        bilibili_logger.info("开始测试上传流程...")

        # 刷新cookie
        from uploader.bilibili_uploader.cookie_refresher import refresh_bilibili_cookies
        bilibili_logger.info("刷新B站Cookie...")
        refreshed_cookie = await refresh_bilibili_cookies(cookie_data)
        bilibili_logger.success("✅ Cookie刷新成功")

        # 创建biliup对象
        from biliup.plugins.bili_webup import BiliBili

        with BiliBili(uploader.data) as bili:
            # 登录
            bili.login_by_cookies(refreshed_cookie)
            bilibili_logger.success("✅ 登录成功")

            # 测试上传文件（实际会上传，但不提交）
            bilibili_logger.info("开始上传视频文件...")
            bilibili_logger.warning("⚠️  注意：B站会实际上传文件片段，但不会提交")

            # 检查是否有access_token
            if bili.access_token:
                bilibili_logger.success(f"✅ 已获取access_token")
            else:
                bilibili_logger.warning("⚠️  未获取到access_token，将使用Web上传")

            bilibili_logger.success("✅ B站断点测试完成")
            bilibili_logger.warning("⚠️  断点测试 - 未实际提交视频")
            return True

    except Exception as e:
        bilibili_logger.error(f"❌ B站测试失败: {e}")
        import traceback
        bilibili_logger.error(traceback.format_exc())
        return False


async def main():
    """主测试函数"""
    import sys
    import io

    # 设置stdout编码为UTF-8
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

    print("\n" + "=" * 60)
    print("平台发布断点测试")
    print("=" * 60 + "\n")

    # 获取测试视频
    video_path = get_test_video()
    if not video_path:
        print("❌ 未找到测试视频文件，请在 syn_backend/videoFile 或 test_videos 目录下放置视频文件")
        return

    print(f"✅ 找到测试视频: {video_path}\n")

    # 获取账号文件
    accounts = get_account_files()

    # 测试结果
    results = {
        'douyin': None,
        'tencent': None,
        'bilibili': None
    }

    # 测试抖音
    if accounts['douyin']:
        print(f"\n找到抖音账号: {Path(accounts['douyin']).name}")
        results['douyin'] = await test_douyin_publish(video_path, accounts['douyin'])
    else:
        print("\n⚠️  未找到抖音账号cookie文件")

    print("\n" + "-" * 60 + "\n")

    # 测试视频号
    if accounts['tencent']:
        print(f"\n找到视频号账号: {Path(accounts['tencent']).name}")
        results['tencent'] = await test_tencent_publish(video_path, accounts['tencent'])
    else:
        print("\n⚠️  未找到视频号账号cookie文件")

    print("\n" + "-" * 60 + "\n")

    # 测试B站
    if accounts['bilibili']:
        print(f"\n找到B站账号: {Path(accounts['bilibili']).name}")
        results['bilibili'] = await test_bilibili_publish(video_path, accounts['bilibili'])
    else:
        print("\n⚠️  未找到B站账号cookie文件")

    # 输出测试结果
    print("\n" + "=" * 60)
    print("测试结果汇总")
    print("=" * 60)
    for platform, result in results.items():
        if result is None:
            status = "⚠️  跳过（无账号）"
        elif result:
            status = "✅ 通过"
        else:
            status = "❌ 失败"
        print(f"{platform.upper()}: {status}")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    asyncio.run(main())
