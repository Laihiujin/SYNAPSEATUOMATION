# 浏览器配置统一方案

## 📁 目录结构

```
E:\SynapseAutomation\
├── browsers/                              ← 统一浏览器目录（相对路径）
│   ├── chromium/
│   │   ├── chromium-1161/                ← 主Chromium (325MB)
│   │   │   └── chrome-win/chrome.exe
│   │   └── playwright-browsers/          ← ⚠️ 冗余副本 (816MB) 可删除
│   │       └── chromium-1161/...
│   ├── firefox/
│   │   └── firefox-1495/                 ← Firefox (视频号专用)
│   │       └── firefox/firefox.exe
│   └── chrome-for-testing/               ← 备用 Chrome
└── .playwright-browsers/                  ← 空目录，可忽略

```

## ✅ 已完成的配置

### 1. 代码层面
- ✅ `syn_backend/utils/playwright_bootstrap.py`: 改为使用 `browsers/chromium`
- ✅ `syn_backend/myUtils/browser_context.py`: Firefox 使用 `browsers/firefox`
- ✅ 所有启动脚本: 使用 `%ROOT%\browsers\chromium`
- ✅ `.env` 配置: 使用相对路径

### 2. 平台映射
| 平台 | 浏览器 | 路径 |
|------|--------|------|
| 抖音 | Chromium | `browsers/chromium/chromium-1161/chrome-win/chrome.exe` |
| 快手 | Chromium | 同上 |
| 小红书 | Chromium | 同上 |
| B站 | Chromium | 同上 |
| **视频号** | **Firefox** | `browsers/firefox/firefox-1495/firefox/firefox.exe` |

### 3. 路径类型
所有路径都是**相对于项目根目录**的相对路径，便于：
- ✅ 项目整体移动
- ✅ Electron 打包
- ✅ 多环境部署

## 🧹 清理冗余浏览器

### 问题
`browsers/chromium/playwright-browsers/` 是一个完整的浏览器副本（816MB），包含了：
- Chromium (重复)
- Firefox (重复)
- FFmpeg

### 解决方案
运行清理脚本：
```batch
cleanup_redundant_browsers.bat
```

**节省空间**: ~816MB

### 验证配置
运行验证脚本：
```batch
verify_browser_config.bat
```

## 📦 打包建议

打包时只需包含以下目录：
```
browsers/
├── chromium/chromium-1161/        ← 必需 (325MB)
├── firefox/firefox-1495/          ← 必需 (视频号)
└── chrome-for-testing/            ← 可选 (备用)
```

**不要包含**:
- ❌ `browsers/chromium/playwright-browsers/`
- ❌ `.playwright-browsers/`

## 🔧 环境变量配置

`.env` 文件中的配置：
```bash
# Chromium 路径（抖音/小红书/快手/B站）
PLAYWRIGHT_BROWSERS_PATH=browsers/chromium
LOCAL_CHROME_PATH=browsers\chromium\chromium-1161\chrome-win\chrome.exe

# Firefox 路径（视频号）
LOCAL_FIREFOX_PATH=browsers\firefox\firefox-1495\firefox\firefox.exe
```

## ✨ 优势

1. **路径统一**: 所有浏览器集中在 `browsers/` 目录
2. **便于打包**: 相对路径，易于 Electron 打包
3. **节省空间**: 删除冗余副本后节省 816MB
4. **配置清晰**: 不再依赖自动创建的 `.playwright-browsers`
5. **易于维护**: 路径明确，问题排查简单

## 📝 注意事项

1. **视频号使用 Firefox**: 代码已自动配置，无需手动指定
2. **相对路径**: 所有路径都相对于项目根目录 `E:\SynapseAutomation\`
3. **环境变量优先级**: 启动脚本会自动设置 `PLAYWRIGHT_BROWSERS_PATH`
4. **清理时机**: 建议在关闭所有浏览器进程后再清理冗余目录
