# -*- coding: utf-8 -*-
"""
LEGACY IMPLEMENTATION:
该模块为历史 uploader 栈实现；当前业务发布已统一走 `syn_backend/platforms/*/upload.py`。
平台层可能仍会复用本实现，建议不要在业务层直接 import/调用。
"""
from datetime import datetime

from playwright.async_api import Playwright, async_playwright
import os
import asyncio
from pathlib import Path

from config.conf import LOCAL_CHROME_PATH
from utils.base_social_media import set_init_script, HEADLESS_FLAG
from myUtils.browser_context import build_context_options, build_browser_args
from myUtils.close_guide import try_close_guide
from utils.files_times import get_absolute_path
from utils.log import tencent_logger


def format_str_for_short_title(origin_title: str) -> str:
    # 定义允许的特殊字符
    allowed_special_chars = "《》“”:+?%°"

    # 移除不允许的特殊字符
    filtered_chars = [char if char.isalnum() or char in allowed_special_chars else ' ' if char == ',' else '' for
                      char in origin_title]
    formatted_string = ''.join(filtered_chars)

    # 调整字符串长度
    if len(formatted_string) > 16:
        # 截断字符串
        formatted_string = formatted_string[:16]
    elif len(formatted_string) < 6:
        # 使用空格来填充字符串
        formatted_string += ' ' * (6 - len(formatted_string))

    return formatted_string


async def cookie_auth(account_file):
    async with async_playwright() as playwright:
        browser_args = build_browser_args()
        browser_args['headless'] = HEADLESS_FLAG
        # Do not pass empty executable_path, otherwise Playwright may try to spawn '.' (ENOENT)
        if not browser_args.get("executable_path"):
            browser_args.pop("executable_path", None)
        browser = await playwright.chromium.launch(**browser_args)
        context = await browser.new_context(**build_context_options(storage_state=account_file))
        context = await set_init_script(context)
        # 创建一个新的页面
        page = await context.new_page()

        try:
            # 访问指定的 URL
            page.set_default_timeout(30000)
            page.set_default_navigation_timeout(45000)
            await page.goto("https://channels.weixin.qq.com/platform/post/create", timeout=45000, wait_until="domcontentloaded")
            try:
                await page.wait_for_selector("div.upload-content, input[type='file'], div.input-editor", timeout=30000)
            except Exception:
                pass

            # 检查是否有登录相关的元素（说明cookie失效）
            login_indicators = [
                'div.login-container',
                'button:has-text("登录")',
                'text=扫码登录',
                'text=请先登录',
                'canvas',  # 登录二维码
            ]

            for indicator in login_indicators:
                if await page.locator(indicator).count() > 0:
                    tencent_logger.error("[+] 检测到登录页面，cookie已失效")
                    await context.close()
                    await browser.close()
                    return False

            # 检查是否有发布页面的关键元素（说明cookie有效）
            publish_indicators = [
                'input[type="file"]',  # 上传文件按钮
                'div.input-editor',     # 标题输入框
                'button:has-text("发表")',  # 发表按钮
            ]

            for indicator in publish_indicators:
                if await page.locator(indicator).count() > 0:
                    tencent_logger.success("[+] cookie 有效")
                    await context.close()
                    await browser.close()
                    return True

            # 如果既没有登录页面也没有发布页面的元素，认为cookie失效
            tencent_logger.warning("[+] 未检测到预期页面元素，cookie可能失效")
            await context.close()
            await browser.close()
            return False

        except Exception as e:
            tencent_logger.error(f"[+] Cookie验证出错: {e}")
            await context.close()
            await browser.close()
            return False


async def get_tencent_cookie(account_file):
    async with async_playwright() as playwright:
        browser_args = build_browser_args()
        browser_args['headless'] = HEADLESS_FLAG
        # Make sure to run headed.
        if not browser_args.get("executable_path"):
            browser_args.pop("executable_path", None)
        browser = await playwright.chromium.launch(**browser_args)
        # Setup context however you like.
        context = await browser.new_context(**build_context_options())  # Pass any options
        # Pause the page, and start recording manually.
        context = await set_init_script(context)
        page = await context.new_page()
        await page.goto("https://channels.weixin.qq.com")
        await page.pause()
        # 点击调试器的继续，保存cookie
        await context.storage_state(path=account_file)


async def weixin_setup(account_file, handle=False):
    account_file = get_absolute_path(account_file, "tencent_uploader")
    if not os.path.exists(account_file) or not await cookie_auth(account_file):
        if not handle:
            # Todo alert message
            return False
        tencent_logger.info('[+] cookie文件不存在或已失效，即将自动打开浏览器，请扫码登录，登陆后会自动生成cookie文件')
        await get_tencent_cookie(account_file)
    return True


class TencentVideo(object):
    def __init__(self, title, file_path, tags, publish_date: datetime, account_file, category=None, thumbnail_path=None, proxy=None):
        self.title = title  # 视频标题
        self.file_path = file_path
        self.tags = tags
        self.publish_date = publish_date
        self.account_file = account_file
        self.category = category
        self.thumbnail_path = thumbnail_path
        self.local_executable_path = LOCAL_CHROME_PATH
        self.proxy = proxy

    async def set_schedule_time_tencent(self, page, publish_date):
        label_element = page.locator("label").filter(has_text="定时").nth(1)
        await label_element.click()

        await page.click('input[placeholder="请选择发表时间"]')

        str_month = str(publish_date.month) if publish_date.month > 9 else "0" + str(publish_date.month)
        current_month = str_month + "月"
        # 获取当前的月份
        page_month = await page.inner_text('span.weui-desktop-picker__panel__label:has-text("月")')

        # 检查当前月份是否与目标月份相同
        if page_month != current_month:
            await page.click('button.weui-desktop-btn__icon__right')

        # 获取页面元素
        elements = await page.query_selector_all('table.weui-desktop-picker__table a')

        # 遍历元素并点击匹配的元素
        for element in elements:
            if 'weui-desktop-picker__disabled' in await element.evaluate('el => el.className'):
                continue
            text = await element.inner_text()
            if text.strip() == str(publish_date.day):
                await element.click()
                break

        # 输入小时部分（假设选择11小时）
        await page.click('input[placeholder="请选择时间"]')
        await page.keyboard.press("Control+KeyA")
        await page.keyboard.type(str(publish_date.hour))

        # 选择标题栏（令定时时间生效）
        await page.locator("div.input-editor").click()

    async def handle_upload_error(self, page):
        tencent_logger.info("视频出错了，重新上传中")
        await page.locator('div.media-status-content div.tag-inner:has-text("删除")').click()
        await page.get_by_role('button', name="删除", exact=True).click()
        file_input = page.locator('input[type="file"]')
        await file_input.set_input_files(self.file_path)

    async def upload(self, playwright: Playwright) -> None:
        try:
            tencent_logger.info(f"[视频号] Uploader实现: tencent_uploader/main.py (file={__file__})")
        except Exception:
            pass
        # 使用 Chromium (这里使用系统内浏览器，用chromium 会造成h264错误
        # 添加代理绕过设置以解决 ERR_PROXY_CONNECTION_FAILED
        # 添加代理绕过设置以解决 ERR_PROXY_CONNECTION_FAILED
        browser_args = build_browser_args()
        browser_args['headless'] = HEADLESS_FLAG
        
        # Inject Proxy if available
        if self.proxy:
             browser_args['proxy'] = self.proxy
             tencent_logger.info(f"Using Proxy: {self.proxy.get('server')}")

        if self.local_executable_path:
            candidate = Path(str(self.local_executable_path))
            if candidate.is_file():
                browser_args['executable_path'] = str(candidate)
            else:
                tencent_logger.warning(f"[+] 忽略无效的 executable_path: {self.local_executable_path}")
                browser_args.pop("executable_path", None)
        else:
            browser_args.pop("executable_path", None)
        browser = await playwright.chromium.launch(**browser_args)
        # 创建一个浏览器上下文，使用指定的 cookie 文件
        context = await browser.new_context(**build_context_options(storage_state=f"{self.account_file}"))
        context = await set_init_script(context)

        # 创建一个新的页面
        page = await context.new_page()
        # 访问指定的 URL
        tencent_logger.info(f'[+]正在访问发布页面...')
        page.set_default_timeout(60000)
        page.set_default_navigation_timeout(90000)
        await page.goto("https://channels.weixin.qq.com/platform/post/create", timeout=90000, wait_until="domcontentloaded")

        # 等待页面加载
        # networkidle 在该站点经常不稳定/永不触发；改为等待关键 DOM 就绪
        try:
            await page.wait_for_selector("div.upload-content, input[type='file'], div.input-editor", timeout=60000)
        except Exception:
            pass
        try:
            await try_close_guide(page, "channels")
        except Exception:
            pass

        # 检查是否需要登录（cookie可能已过期）
        if "login" in page.url.lower() or await page.locator('text=登录').count() > 0:
            tencent_logger.error("[+] 检测到需要登录，cookie可能已过期")
            await page.screenshot(path='logs/channels_need_login.png', full_page=True)
            raise Exception("Cookie已过期，需要重新登录")

        tencent_logger.info(f'[+]正在上传-------{self.title}.mp4')

        # 尝试多个文件上传选择器（更新为2024年最新选择器）
        file_input_selectors = [
            'input[type="file"]',  # 最通用的选择器
            'input[accept*="video"]',  # 接受视频的input
            'input[accept*=".mp4"]',  # 接受mp4的input
            'input[name="file"]',  # name属性为file
            '.upload-area input[type="file"]',  # 上传区域内的file input
            '.file-upload input',  # 文件上传区域
            '[data-testid="file-input"]',  # data-testid属性
            'input[id*="upload"]',  # id包含upload
            'input[id*="file"]',  # id包含file
        ]

        scopes = [("page", page)]
        try:
            for idx, frame in enumerate(page.frames):
                if frame == page.main_frame:
                    continue
                scopes.append((f"frame[{idx}]", frame))
        except Exception:
            pass

        async def _find_file_input():
            for selector in file_input_selectors:
                for scope_name, scope in scopes:
                    try:
                        locator = scope.locator(selector)
                        count = await locator.count()
                        if count > 0:
                            return locator.first, scope_name, selector, count
                    except Exception as e:
                        tencent_logger.debug(f'选择器 {selector} @ {scope_name} 失败: {e}')
                        continue
            return None, None, None, 0

        file_input, scope_name, matched_selector, count = await _find_file_input()
        if file_input:
            tencent_logger.info(f'[+]找到文件上传元素({scope_name}): {matched_selector} (共{count}个)')

        if not file_input:
            tencent_logger.warning('[+]未找到隐藏的文件上传input，尝试点击上传按钮触发')

            # 尝试点击上传按钮/区域来触发文件选择器
            upload_button_selectors = [
                'div.upload-content',  # 2024年最新：视频号上传区域
                'span.weui-icon-outlined-add',  # 2024年最新：上传图标
                'div.upload-content div.center',  # 上传中心区域
                'button:has-text("上传")',
                'button:has-text("选择文件")',
                'button:has-text("添加视频")',
                'div.upload-btn',
                'div.upload-area',
                'div[role="button"]:has-text("上传")',
                '.upload-trigger',
                'text=上传视频',
                'text=选择视频',
            ]

            button_clicked = False
            for btn_selector in upload_button_selectors:
                clicked = False
                for click_scope_name, click_scope in scopes:
                    try:
                        btn = click_scope.locator(btn_selector)
                        if await btn.count() > 0:
                            tencent_logger.info(f'[+]尝试点击上传按钮({click_scope_name}): {btn_selector}')
                            await btn.first.click()
                            clicked = True
                            break
                    except Exception as e:
                        tencent_logger.debug(f'点击按钮 {btn_selector} @ {click_scope_name} 失败: {e}')
                        continue

                if not clicked:
                    continue

                await page.wait_for_timeout(1000)  # 等待1秒
                file_input, scope_name, matched_selector, _count = await _find_file_input()
                if file_input:
                    tencent_logger.success(f'[+]点击按钮后找到文件上传元素({scope_name}): {matched_selector}')
                    button_clicked = True
                    break

            if not file_input:
                tencent_logger.error('[+]未找到文件上传元素，进行截图和HTML调试')
                await page.screenshot(path='logs/channels_no_file_input.png', full_page=True)

                # 额外调试：打印页面中所有input元素
                try:
                    all_inputs = await page.locator('input').all()
                    tencent_logger.info(f'[+]页面共有 {len(all_inputs)} 个input元素')
                    for idx, inp in enumerate(all_inputs[:10]):  # 只打印前10个
                        inp_type = await inp.get_attribute('type')
                        inp_id = await inp.get_attribute('id')
                        inp_class = await inp.get_attribute('class')
                        inp_accept = await inp.get_attribute('accept')
                        tencent_logger.info(f'  Input {idx}: type={inp_type}, id={inp_id}, class={inp_class}, accept={inp_accept}')
                except Exception as debug_error:
                    tencent_logger.error(f'调试信息获取失败: {debug_error}')

                raise Exception("未找到文件上传元素，请检查视频号页面是否改版")

        await file_input.set_input_files(self.file_path)
        tencent_logger.success('[+]文件已选择，开始上传')
        try:
            await try_close_guide(page, "channels")
        except Exception:
            pass
        # 填充标题和话题
        await self.add_title_tags(page)
        # 添加商品
        # await self.add_product(page)
        # 合集功能
        await self.add_collection(page)
        # 原创选择
        await self.add_original(page)
        # 检测上传状态
        await self.detect_upload_status(page)
        if self.publish_date != 0:
            try:
                await try_close_guide(page, "channels")
            except Exception:
                pass
            await self.set_schedule_time_tencent(page, self.publish_date)
        # 添加短标题
        await self.add_short_title(page)

        await self.click_publish(page)

        await context.storage_state(path=f"{self.account_file}")  # 保存cookie
        tencent_logger.success('  [-]cookie更新完毕！')
        await asyncio.sleep(2)  # 这里延迟是为了方便眼睛直观的观看
        # 关闭浏览器上下文和浏览器实例
        await context.close()
        await browser.close()

    async def add_short_title(self, page):
        short_title_element = page.get_by_text("短标题", exact=True).locator("..").locator(
            "xpath=following-sibling::div").locator(
            'span input[type="text"]')
        if await short_title_element.count():
            short_title = format_str_for_short_title(self.title)
            await short_title_element.fill(short_title)

    async def click_publish(self, page):
        while True:
            try:
                publish_buttion = page.locator('div.form-btns button:has-text("发表")')
                if await publish_buttion.count():
                    await publish_buttion.click()
                await page.wait_for_url("https://channels.weixin.qq.com/platform/post/list", timeout=60000)
                tencent_logger.success("  [-]视频发布成功")
                break
            except Exception as e:
                current_url = page.url
                if "https://channels.weixin.qq.com/platform/post/list" in current_url:
                    tencent_logger.success("  [-]视频发布成功")
                    break
                else:
                    tencent_logger.exception(f"  [-] Exception: {e}")
                    tencent_logger.info("  [-] 视频正在发布中...")
                    await asyncio.sleep(0.5)

    async def detect_upload_status(self, page):
        while True:
            # 匹配删除按钮，代表视频上传完毕，如果不存在，代表视频正在上传，则等待
            try:
                # 匹配删除按钮，代表视频上传完毕
                if "weui-desktop-btn_disabled" not in await page.get_by_role("button", name="发表").get_attribute(
                        'class'):
                    tencent_logger.info("  [-]视频上传完毕")
                    break
                else:
                    tencent_logger.info("  [-] 正在上传视频中...")
                    await asyncio.sleep(2)
                    # 出错了视频出错
                    if await page.locator('div.status-msg.error').count() and await page.locator(
                            'div.media-status-content div.tag-inner:has-text("删除")').count():
                        tencent_logger.error("  [-] 发现上传出错了...准备重试")
                        await self.handle_upload_error(page)
            except:
                tencent_logger.info("  [-] 正在上传视频中...")
                await asyncio.sleep(2)

    async def add_title_tags(self, page):
        await page.locator("div.input-editor").click()
        await page.keyboard.type(self.title)
        await page.keyboard.press("Enter")
        for index, tag in enumerate(self.tags, start=1):
            await page.keyboard.type("#" + tag)
            await page.keyboard.press("Space")
        tencent_logger.info(f"成功添加hashtag: {len(self.tags)}")

    async def add_collection(self, page):
        collection_elements = page.get_by_text("添加到合集").locator("xpath=following-sibling::div").locator(
            '.option-list-wrap > div')
        if await collection_elements.count() > 1:
            await page.get_by_text("添加到合集").locator("xpath=following-sibling::div").click()
            await collection_elements.first.click()

    async def add_original(self, page):
        if await page.get_by_label("视频为原创").count():
            await page.get_by_label("视频为原创").check()
        # 检查 "我已阅读并同意 《视频号原创声明使用条款》" 元素是否存在
        label_locator = await page.locator('label:has-text("我已阅读并同意 《视频号原创声明使用条款》")').is_visible()
        if label_locator:
            await page.get_by_label("我已阅读并同意 《视频号原创声明使用条款》").check()
            await page.get_by_role("button", name="声明原创").click()
        # 2023年11月20日 wechat更新: 可能新账号或者改版账号，出现新的选择页面
        if await page.locator('div.label span:has-text("声明原创")').count() and self.category:
            # 因处罚无法勾选原创，故先判断是否可用
            if not await page.locator('div.declare-original-checkbox input.ant-checkbox-input').is_disabled():
                await page.locator('div.declare-original-checkbox input.ant-checkbox-input').click()
                if not await page.locator(
                        'div.declare-original-dialog label.ant-checkbox-wrapper.ant-checkbox-wrapper-checked:visible').count():
                    await page.locator('div.declare-original-dialog input.ant-checkbox-input:visible').click()
            if await page.locator('div.original-type-form > div.form-label:has-text("原创类型"):visible').count():
                await page.locator('div.form-content:visible').click()  # 下拉菜单
                await page.locator(
                    f'div.form-content:visible ul.weui-desktop-dropdown__list li.weui-desktop-dropdown__list-ele:has-text("{self.category}")').first.click()
                await page.wait_for_timeout(1000)
            if await page.locator('button:has-text("声明原创"):visible').count():
                await page.locator('button:has-text("声明原创"):visible').click()

    async def main(self):
        async with async_playwright() as playwright:
            await self.upload(playwright)
