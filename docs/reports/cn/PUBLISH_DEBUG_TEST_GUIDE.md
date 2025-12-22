# 发布全流程测试说明文档

## 📅 创建日期
2025-12-19

## 🎯 测试目标
测试抖音、快手发布全流程，**断点到发布按钮前**，保存截图、HTML、OCR 用于调试。

---

## 📁 测试脚本

### 1️⃣ 抖音发布测试
**文件**: `scripts/tests/test_douyin_publish_debug.py`

### 2️⃣ 快手发布测试
**文件**: `scripts/tests/test_kuaishou_publish_debug.py`

---

## 🚀 使用步骤

### 准备工作

#### 1. 配置环境变量
在 `syn_backend/.env` 中配置 OCR API Key（可选）：
```bash
SILICONFLOW_API_KEY=your_api_key_here
```

**注意**: 如果未配置，测试仍可运行，但会跳过 OCR 步骤。

#### 2. 准备测试文件

**Cookie 文件**：
- 抖音: `syn_backend/cookiesFile/douyin_test_account.json`
- 快手: `syn_backend/cookiesFile/kuaishou_test_account.json`

**视频文件**：
- 放到 `syn_backend/videoFile/test_video.mp4`

**获取 Cookie 文件的方法**：
```python
# 运行登录脚本生成 Cookie
python syn_backend/platforms/douyin/login.py
python syn_backend/uploader/ks_uploader/main.py
```

#### 3. 修改测试脚本配置

编辑测试脚本，修改以下参数：
```python
# 在 test_douyin_publish_debug.py 或 test_kuaishou_publish_debug.py 中
ACCOUNT_FILE = "你的账号文件名.json"  # ⚠️ 修改这里
VIDEO_FILE = "你的视频文件名.mp4"    # ⚠️ 修改这里
TITLE = "你的测试标题"
TAGS = ["标签1", "标签2", "标签3"]
```

---

## 🧪 运行测试

### 抖音发布测试
```bash
cd E:\SynapseAutomation
python scripts\tests\test_douyin_publish_debug.py
```

### 快手发布测试
```bash
cd E:\SynapseAutomation
python scripts\tests\test_kuaishou_publish_debug.py
```

---

## 📊 测试流程

### 抖音测试流程
```
1. 访问抖音创作者中心
   ↓ 保存截图: douyin_01_upload_page_*.png

2. 上传视频文件
   ↓ 等待进入发布页面
   ↓ 保存截图: douyin_02_publish_page_*.png

3. 填充标题和标签
   ↓ 保存截图: douyin_03_filled_metadata_*.png

4. 等待视频上传完成
   ↓ 保存截图: douyin_04_video_uploaded_*.png

5. 设置封面（根据视频分辨率）
   ↓ 竖屏(3:4) → primary-RstHX_
   ↓ 横屏(4:3) → secondary-zU1YLr
   ↓ 保存截图: douyin_05_cover_modal_*.png
   ↓ 保存截图: douyin_06_cover_set_*.png

6. 🎯 断点：发布按钮前
   ↓ 保存截图: douyin_07_before_publish_*.png
   ↓ 保存HTML: douyin_07_before_publish_*.html
   ↓ 保存OCR: douyin_07_before_publish_*.ocr.txt
   ↓ 检查发布按钮状态
   ↓ 浏览器保持打开（1小时）
```

### 快手测试流程
```
1. 访问快手创作者中心
   ↓ 保存截图: kuaishou_01_upload_page_*.png

2. 点击上传按钮，选择视频文件
   ↓ 保存截图: kuaishou_03_video_uploading_*.png

3. 填充标题和话题
   ↓ 保存截图: kuaishou_04_filled_metadata_*.png

4. 等待视频上传完成
   ↓ 保存截图: kuaishou_05_video_uploaded_*.png

5. 🎯 断点：发布按钮前
   ↓ 保存截图: kuaishou_06_before_publish_*.png
   ↓ 保存HTML: kuaishou_06_before_publish_*.html
   ↓ 保存OCR: kuaishou_06_before_publish_*.ocr.txt
   ↓ 检查发布按钮状态
   ↓ 浏览器保持打开（1小时）
```

---

## 📁 输出文件

所有调试文件保存在:
```
syn_backend/logs/test_debug/
├── douyin_01_upload_page_20251219_143022.png
├── douyin_01_upload_page_20251219_143022.html
├── douyin_02_publish_page_20251219_143025.png
├── douyin_02_publish_page_20251219_143025.html
├── douyin_03_filled_metadata_20251219_143030.png
├── douyin_03_filled_metadata_20251219_143030.html
├── douyin_04_video_uploaded_20251219_143045.png
├── douyin_04_video_uploaded_20251219_143045.html
├── douyin_05_cover_modal_20251219_143048.png
├── douyin_05_cover_modal_20251219_143048.html
├── douyin_06_cover_set_20251219_143050.png
├── douyin_06_cover_set_20251219_143050.html
├── douyin_07_before_publish_20251219_143052.png       ← 🎯 断点截图
├── douyin_07_before_publish_20251219_143052.html      ← 🎯 断点 HTML
├── douyin_07_before_publish_20251219_143052.ocr.txt   ← 🎯 断点 OCR
├── kuaishou_06_before_publish_20251219_143100.png     ← 🎯 断点截图
├── kuaishou_06_before_publish_20251219_143100.html    ← 🎯 断点 HTML
└── kuaishou_06_before_publish_20251219_143100.ocr.txt ← 🎯 断点 OCR
```

---

## 🔍 使用 MCP 工具辅助调试

### 什么是 MCP？
MCP (Model Context Protocol) 是一个让 AI 助手访问外部工具和数据的协议。我可以通过 MCP 工具直接：
- 读取截图文件
- 分析 HTML 结构
- 查看 OCR 识别结果
- 提供调试建议

### 如何使用？

#### 1️⃣ 运行测试脚本
```bash
python scripts\tests\test_douyin_publish_debug.py
```

#### 2️⃣ 等待断点
测试会在发布按钮前暂停，并输出类似信息：
```
🎯 已到达断点：发布按钮前
📊 调试信息:
  - 截图: E:\SynapseAutomation\syn_backend\logs\test_debug\douyin_07_before_publish_20251219_143052.png
  - HTML: E:\SynapseAutomation\syn_backend\logs\test_debug\douyin_07_before_publish_20251219_143052.html
  - OCR: E:\SynapseAutomation\syn_backend\logs\test_debug\douyin_07_before_publish_20251219_143052.ocr.txt
✅ 发布按钮状态: visible=True, enabled=True
⏸️  测试暂停，浏览器保持打开状态
```

#### 3️⃣ 提供文件路径给我
直接复制文件路径告诉我，例如：
```
请查看截图：E:\SynapseAutomation\syn_backend\logs\test_debug\douyin_07_before_publish_20251219_143052.png
```

#### 4️⃣ 我会分析并提供建议
我会：
1. ✅ 读取截图（直接查看页面状态）
2. ✅ 读取 OCR 文本（识别页面上的文字）
3. ✅ 读取 HTML（分析 DOM 结构）
4. ✅ 提供调试建议（选择器、元素定位等）

---

## 📝 常见问题

### Q1: 测试失败怎么办？
**A**: 检查以下几点：
1. Cookie 文件是否存在且有效
2. 视频文件是否存在
3. 网络连接是否正常
4. 是否需要人工处理验证码

### Q2: OCR 识别失败？
**A**:
- 确认已配置 `SILICONFLOW_API_KEY`
- 如果未配置，测试仍可运行，只是跳过 OCR 步骤
- 可以手动查看截图

### Q3: 浏览器关闭太快？
**A**:
- 测试会在断点处保持浏览器打开 1 小时
- 可以手动检查页面状态
- 按 `Ctrl+C` 提前结束测试

### Q4: 标题/标签填充失败？
**A**:
- 检查页面是否加载完成
- 查看截图确认元素是否存在
- 可能需要更新选择器（页面改版）

---

## 🎯 调试建议

### 抖音封面设置
- 使用 JavaScript `evaluate()` 方式点击
- 根据视频分辨率选择对应按钮：
  - 竖屏(3:4) → `primary-RstHX_`
  - 横屏(4:3) → `secondary-zU1YLr`
- 兜底查找文本为"完成"的元素

### 快手标题填充
- 使用 11 个候选选择器
- 支持 `contenteditable` 元素
- 逐个尝试，验证填充结果

---

## 📚 相关文件

- ✅ 抖音测试脚本: `scripts/tests/test_douyin_publish_debug.py`
- ✅ 快手测试脚本: `scripts/tests/test_kuaishou_publish_debug.py`
- ✅ Selenium DOM 工具: `syn_backend/automation/selenium_dom.py`
- ✅ OCR 客户端: `syn_backend/automation/ocr_client.py`
- ✅ 抖音封面文档: `docs/DOUYIN_COVER_JS_EVALUATE.md`
- ✅ 发布统一文档: `docs/PUBLISH_UNIFIED_MIGRATION.md`

---

## 🎉 总结

本测试框架提供：
1. ✅ 完整的发布流程测试（断点到发布按钮前）
2. ✅ 自动截图、保存 HTML、OCR 识别
3. ✅ 浏览器保持打开状态，方便手动检查
4. ✅ 集成 MCP 工具，让 AI 助手直接分析调试信息
5. ✅ 详细的日志输出，便于排查问题

**使用流程**：
1. 准备 Cookie 文件和测试视频
2. 修改测试脚本配置
3. 运行测试脚本
4. 等待断点，查看截图
5. 将截图路径告诉我，我会分析并提供建议

---

**最后更新**: 2025-12-19
**测试环境**: Windows 10, Python 3.9+, Playwright
