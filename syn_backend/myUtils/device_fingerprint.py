"""
简化版设备指纹管理器
为每个账号生成并持久化设备特征，避免频繁变化触发风控

解决问题：
- 平台（特别是抖音）检测设备指纹
- 缺少设备指纹持久化
- 完整风控方案过于复杂，需要实用优先的简化版

使用方式：
    from myUtils.device_fingerprint import device_fingerprint_manager

    # 获取或生成设备指纹（自动持久化）
    fingerprint = device_fingerprint_manager.get_or_create_fingerprint(
        account_id="account_123",
        platform="douyin"
    )

    # 应用到浏览器上下文
    context_options = device_fingerprint_manager.apply_to_context(
        fingerprint, context_options
    )

    # 获取反检测脚本
    init_script = device_fingerprint_manager.get_init_script(fingerprint)
    await context.add_init_script(init_script)
"""
import json
import hashlib
import random
import string
from pathlib import Path
from typing import Dict, Optional
from loguru import logger


class DeviceFingerprint:
    """设备指纹管理器"""

    # 常见 User-Agent 池（真实浏览器）
    USER_AGENTS = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
    ]

    # 屏幕分辨率池（常见分辨率）
    SCREEN_RESOLUTIONS = [
        {"width": 1920, "height": 1080},
        {"width": 1366, "height": 768},
        {"width": 2560, "height": 1440},
        {"width": 1536, "height": 864},
    ]

    def __init__(self, storage_dir: Path = None):
        if storage_dir is None:
            from config.conf import BASE_DIR
            storage_dir = Path(BASE_DIR) / "syn_backend" / "fingerprints"

        self.storage_dir = storage_dir
        self.storage_dir.mkdir(parents=True, exist_ok=True)

    def _generate_device_id(self, account_id: str, platform: str) -> str:
        """生成设备 ID（基于账号和平台的哈希，确保同一账号总是相同）"""
        seed = f"{account_id}_{platform}_device"
        return hashlib.md5(seed.encode()).hexdigest()[:16]

    def _generate_webgl_vendor(self) -> str:
        """生成 WebGL 供应商信息"""
        vendors = [
            "Google Inc. (NVIDIA)",
            "Google Inc. (Intel)",
            "Google Inc. (AMD)",
        ]
        return random.choice(vendors)

    def _generate_canvas_fingerprint(self, device_id: str) -> str:
        """生成 Canvas 指纹（简化版，基于 device_id 生成稳定值）"""
        # 基于 device_id 生成稳定的 Canvas 指纹
        seed = int(hashlib.md5(device_id.encode()).hexdigest()[:8], 16)
        random.seed(seed)

        # 生成伪随机但稳定的指纹字符串
        fp = ''.join(random.choices(string.ascii_letters + string.digits, k=32))

        # 重置随机种子
        random.seed()

        return fp

    def generate_fingerprint(
        self,
        account_id: str,
        platform: str
    ) -> Dict:
        """
        生成设备指纹

        策略：
        - 为每个账号生成固定的设备特征
        - 基于 device_id 确定性地选择配置（确保同一账号总是相同）
        - 不做复杂的风控伪装，仅保持基本稳定性

        Returns:
            {
                "device_id": "abc123...",
                "user_agent": "Mozilla/5.0 ...",
                "viewport": {"width": 1920, "height": 1080},
                "screen": {"width": 1920, "height": 1080},
                "timezone": "Asia/Shanghai",
                "language": "zh-CN",
                "webgl_vendor": "Google Inc. (NVIDIA)",
                "canvas_fp": "abc123...",
                "platform": "Win32",
                "hardware_concurrency": 8,
                "device_memory": 8
            }
        """
        # 生成稳定的设备 ID
        device_id = self._generate_device_id(account_id, platform)

        # 基于 device_id 确定性地选择配置（确保同一账号总是相同）
        seed = int(hashlib.md5(device_id.encode()).hexdigest()[:8], 16)
        random.seed(seed)

        user_agent = random.choice(self.USER_AGENTS)
        screen = random.choice(self.SCREEN_RESOLUTIONS)

        # 重置随机种子
        random.seed()

        fingerprint = {
            "device_id": device_id,
            "user_agent": user_agent,
            "viewport": {
                "width": screen["width"],
                "height": screen["height"] - 100  # 减去浏览器 UI 高度
            },
            "screen": screen,
            "timezone": "Asia/Shanghai",
            "language": "zh-CN",
            "languages": ["zh-CN", "zh", "en-US", "en"],
            "platform": "Win32",
            "webgl_vendor": self._generate_webgl_vendor(),
            "webgl_renderer": "ANGLE (NVIDIA GeForce GTX 1050 Ti Direct3D11 vs_5_0 ps_5_0)",
            "canvas_fp": self._generate_canvas_fingerprint(device_id),
            "audio_fp": hashlib.md5(device_id.encode()).hexdigest()[:16],
            "hardware_concurrency": 8,
            "device_memory": 8,
            "max_touch_points": 0,
            "color_depth": 24,
            "pixel_depth": 24
        }

        return fingerprint

    def get_or_create_fingerprint(
        self,
        account_id: str,
        platform: str
    ) -> Dict:
        """获取或创建设备指纹（持久化到文件）"""
        fingerprint_file = self.storage_dir / f"{account_id}_{platform}.json"

        # 尝试加载现有指纹
        if fingerprint_file.exists():
            try:
                with open(fingerprint_file, 'r', encoding='utf-8') as f:
                    fingerprint = json.load(f)
                    logger.info(f"✅ [{platform}] 加载设备指纹: {account_id}")
                    return fingerprint
            except Exception as e:
                logger.warning(f"⚠️ 加载设备指纹失败: {e}，重新生成")

        # 生成新指纹
        fingerprint = self.generate_fingerprint(account_id, platform)

        # 保存到文件
        try:
            with open(fingerprint_file, 'w', encoding='utf-8') as f:
                json.dump(fingerprint, f, ensure_ascii=False, indent=2)
            logger.info(f"✅ [{platform}] 生成并保存设备指纹: {account_id}")
        except Exception as e:
            logger.error(f"❌ 保存设备指纹失败: {e}")

        return fingerprint

    def apply_to_context(
        self,
        fingerprint: Dict,
        context_options: Dict
    ) -> Dict:
        """将设备指纹应用到 Playwright 浏览器上下文"""
        context_options.update({
            "user_agent": fingerprint["user_agent"],
            "viewport": fingerprint["viewport"],
            "screen": fingerprint["screen"],
            "locale": fingerprint["language"],
            "timezone_id": fingerprint["timezone"],
            "device_scale_factor": 1.0,
            "has_touch": False,
            "is_mobile": False
        })

        logger.debug(f"✅ 设备指纹已应用到浏览器上下文")
        return context_options

    def get_init_script(self, fingerprint: Dict) -> str:
        """
        生成反检测 JavaScript 脚本

        覆盖内容：
        - navigator.webdriver（隐藏自动化标记）
        - WebGL 指纹
        - Canvas 指纹混淆
        - navigator.hardwareConcurrency / deviceMemory 等硬件参数
        """
        return f"""
        (() => {{
            // 禁用 webdriver 检测（最重要）
            Object.defineProperty(navigator, 'webdriver', {{
                get: () => undefined
            }});

            // 覆盖 WebGL 指纹
            const getParameter = WebGLRenderingContext.prototype.getParameter;
            WebGLRenderingContext.prototype.getParameter = function(parameter) {{
                if (parameter === 37445) return '{fingerprint["webgl_vendor"]}';
                if (parameter === 37446) return '{fingerprint["webgl_renderer"]}';
                return getParameter.apply(this, arguments);
            }};

            // 覆盖 navigator.hardwareConcurrency
            Object.defineProperty(navigator, 'hardwareConcurrency', {{
                get: () => {fingerprint["hardware_concurrency"]}
            }});

            // 覆盖 navigator.deviceMemory
            Object.defineProperty(navigator, 'deviceMemory', {{
                get: () => {fingerprint["device_memory"]}
            }});

            // 覆盖 navigator.maxTouchPoints
            Object.defineProperty(navigator, 'maxTouchPoints', {{
                get: () => {fingerprint["max_touch_points"]}
            }});

            // 覆盖 navigator.languages
            Object.defineProperty(navigator, 'languages', {{
                get: () => {json.dumps(fingerprint["languages"])}
            }});

            // Canvas 指纹混淆（简化版）
            const toDataURL = HTMLCanvasElement.prototype.toDataURL;
            HTMLCanvasElement.prototype.toDataURL = function() {{
                const result = toDataURL.apply(this, arguments);
                // 添加稳定的噪声
                return result + '{fingerprint["canvas_fp"]}';
            }};

            // 禁用自动化检测
            window.chrome = {{
                runtime: {{}}
            }};

            // 覆盖 Notification.permission
            try {{
                Object.defineProperty(Notification, 'permission', {{
                    get: () => 'default'
                }});
            }} catch (e) {{}}

            // 覆盖屏幕色深
            Object.defineProperty(screen, 'colorDepth', {{
                get: () => {fingerprint["color_depth"]}
            }});
            Object.defineProperty(screen, 'pixelDepth', {{
                get: () => {fingerprint["pixel_depth"]}
            }});
        }})();
        """


# 全局实例
device_fingerprint_manager = DeviceFingerprint()
