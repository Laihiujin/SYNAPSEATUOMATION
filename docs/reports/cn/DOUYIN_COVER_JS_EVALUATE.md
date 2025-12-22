# 抖音封面设置 - JavaScript Evaluate 方式

## 📅 更新日期
2025-12-19

## 🎯 更新内容
将抖音封面设置从 **Playwright 原生 `.click()` 方式**改为 **JavaScript `evaluate()` 直接 DOM 操作方式**。

---

## 🔧 技术方案

### 一、视频分辨率检测（已有）

使用 `ffprobe` 检测视频分辨率，决定横屏/竖屏：

```python
# utils/video_probe.py
def probe_video_metadata(file_path: str) -> dict:
    # 返回：
    # {
    #   "width": 1080,
    #   "height": 1920,
    #   "orientation": "portrait",      # portrait | landscape | square
    #   "cover_aspect_ratio": "3:4",    # 3:4 竖屏 | 4:3 横屏 | 1:1 正方形
    # }
```

### 二、封面设置流程（使用 JavaScript evaluate）

#### 步骤1: 点击"编辑封面"入口

```python
await page.evaluate("""
() => {
    document.getElementsByClassName("title-wA45Xd")[0]?.click();
}
""")
```

#### 步骤2: 等待封面弹窗出现

```python
await page.wait_for_selector(
    "div.dy-creator-content-modal, div.dy-creator-content-portal, [role='dialog']",
    timeout=8000
)
```

#### 步骤3: 上传自定义封面（可选）

```python
if thumbnail_path:
    inp = page.locator("input.semi-upload-hidden-input").first
    await inp.set_input_files(thumbnail_path)
```

#### 步骤4: 根据视频分辨率点击对应的"完成"按钮

**A｜竖屏（3:4）**
```python
if cover_aspect_ratio == "3:4":
    await page.evaluate("""
    () => {
        document.getElementsByClassName(
            "semi-button semi-button-primary semi-button-light primary-RstHX_"
        )[0]?.click();
    }
    """)
```

**B｜横屏（4:3）**
```python
elif cover_aspect_ratio == "4:3":
    await page.evaluate("""
    () => {
        document.getElementsByClassName(
            "semi-button semi-button-primary semi-button-light secondary-zU1YLr"
        )[0]?.click();
    }
    """)
```

#### 步骤5: 兜底点击"完成"按钮

```python
await page.evaluate("""
() => {
    [...document.querySelectorAll('div')]
        .find(el => el.innerText.trim() === '完成')
        ?.click();
}
""")
```

---

## 📊 对比：Playwright Click vs JavaScript Evaluate

| 对比项 | Playwright `.click()` | JavaScript `evaluate()` |
|--------|----------------------|-------------------------|
| **稳定性** | ⚠️ 依赖元素可见性、可点击性 | ✅ 直接 DOM 操作，绕过检查 |
| **速度** | ⚠️ 需要等待元素就绪 | ✅ 立即执行 |
| **动态类名** | ⚠️ 类名变化需更新选择器 | ✅ 直接匹配完整类名 |
| **遮挡问题** | ❌ 被遮挡元素无法点击 | ✅ 可点击被遮挡元素 |
| **引导弹窗** | ❌ 被引导弹窗阻塞 | ✅ 可直接点击底层元素 |
| **超时处理** | ❌ 超时即失败 | ✅ 失败后兜底点击 |

---

## ✅ 优势

### 1️⃣ **直接 DOM 操作，绕过 Playwright 检查**
- 不依赖元素可见性（`is_visible()`）
- 不依赖元素可点击性（`is_enabled()`）
- 不受引导弹窗遮挡影响

### 2️⃣ **精确匹配类名**
- 使用完整类名 `"semi-button semi-button-primary semi-button-light primary-RstHX_"`
- 避免 CSS 选择器复杂度（`button.semi-button.semi-button-primary.semi-button-light.primary-RstHX_`）

### 3️⃣ **兜底机制**
- 主按钮点击失败后，查找文本为"完成"的任意元素
- 最大化成功率

### 4️⃣ **失败不阻塞发布**
- 封面设置失败只记录警告，不抛出异常
- 让抖音使用默认首帧封面

---

## 🎯 实现位置

**文件**: `syn_backend/platforms/douyin/upload.py`

**方法**: `async def _set_thumbnail_best_effort()`（第410-541行）

**构建标识**: `platforms/douyin/upload.py:js-evaluate-cover@2025-12-19`

---

## 🧪 测试建议

### 1. 竖屏视频（1080x1920）
```python
await douyin_upload.upload(
    account_file="douyin_account.json",
    title="竖屏测试",
    file_path="video_portrait.mp4",  # 1080x1920
    tags=["测试"],
)
```

**期望**：
- ✅ 检测到 `cover_aspect_ratio="3:4"`
- ✅ 点击 `primary-RstHX_` 按钮
- ✅ 日志：`✅ 已点击竖屏封面完成按钮（primary-RstHX_）`

### 2. 横屏视频（1920x1080）
```python
await douyin_upload.upload(
    account_file="douyin_account.json",
    title="横屏测试",
    file_path="video_landscape.mp4",  # 1920x1080
    tags=["测试"],
)
```

**期望**：
- ✅ 检测到 `cover_aspect_ratio="4:3"`
- ✅ 点击 `secondary-zU1YLr` 按钮
- ✅ 日志：`✅ 已点击横屏封面完成按钮（secondary-zU1YLr）`

### 3. 自定义封面
```python
await douyin_upload.upload(
    account_file="douyin_account.json",
    title="自定义封面测试",
    file_path="video.mp4",
    thumbnail_path="cover.jpg",  # 自定义封面
    tags=["测试"],
)
```

**期望**：
- ✅ 上传封面图片
- ✅ 日志：`✅ 已上传封面: input.semi-upload-hidden-input`

---

## 🔍 关键类名说明

### 抖音封面完成按钮类名（2025-12版本）

| 视频方向 | 按钮类名 | 说明 |
|---------|---------|------|
| **竖屏（3:4）** | `primary-RstHX_` | 红色主按钮 |
| **横屏（4:3）** | `secondary-zU1YLr` | 蓝色次按钮 |

**完整类名**：
```
semi-button semi-button-primary semi-button-light {primary-RstHX_ | secondary-zU1YLr}
```

**注意**：动态类名后缀（如 `RstHX_`、`zU1YLr`）可能因抖音版本而变化，建议定期检查。

---

## ⚠️ 注意事项

### 1. 类名动态性
抖音使用动态类名（CSS Modules），如 `primary-RstHX_` 中的 `RstHX_` 是哈希值。
- **建议**：定期检查类名是否变化
- **兜底**：已实现文本查找兜底机制

### 2. 封面弹窗超时
如果网络慢或页面卡顿，封面弹窗可能超时（8秒）。
- **处理**：超时后跳过封面设置，不阻塞发布
- **日志**：`[DouyinUpload] 等待封面弹窗超时，跳过封面设置`

### 3. 兜底点击可能误触
兜底机制查找文本为"完成"的任意元素，可能误点其他弹窗。
- **缓解**：仅在主按钮点击失败后执行
- **优先**：先尝试精确类名点击

---

## 📚 相关文件

- ✅ 封面设置实现: `syn_backend/platforms/douyin/upload.py:410-541`
- ✅ 视频分辨率检测: `syn_backend/utils/video_probe.py`
- ✅ 抖音迁移文档: `docs/DOUYIN_MIGRATION_SUMMARY.md`
- ✅ 发布统一文档: `docs/PUBLISH_UNIFIED_MIGRATION.md`

---

## 🎉 总结

本次更新将抖音封面设置从 Playwright 原生点击改为 **JavaScript evaluate 直接 DOM 操作**：

### ✅ 核心优势
1. ✅ 绕过 Playwright 可见性/可点击性检查
2. ✅ 不受引导弹窗遮挡影响
3. ✅ 精确匹配横/竖屏按钮类名
4. ✅ 兜底文本查找机制
5. ✅ 失败不阻塞发布流程

### ✅ 技术实现
- ✅ 使用 `page.evaluate()` 直接操作 DOM
- ✅ 使用 `ffprobe` 检测视频分辨率
- ✅ 根据 `cover_aspect_ratio` 决定点击哪个按钮
- ✅ 兜底查找文本为"完成"的元素

---

**最后更新**: 2025-12-19
**构建标识**: `js-evaluate-cover@2025-12-19`
