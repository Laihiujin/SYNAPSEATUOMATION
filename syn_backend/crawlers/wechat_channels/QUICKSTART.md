# 视频号数据采集 - 快速开始指南

## ✅ 已完成的准备工作

1. **Cookie 文件已就绪**
   - `E:\SynapseAutomation\syn_backend\cookiesFile\channels_sphjscpkHodFygw.json`
   - `E:\SynapseAutomation\syn_backend\cookiesFile\channels_sph3x1CKGG50A4d.json`

2. **API Key 已配置**
   - `.env` 中已配置 `SILICONFLOW_API_KEY`
   - (注: AI 增强功能是可选的，基础爬取不需要)

## 🚀 快速测试

### 方式 1: 运行测试脚本（推荐）

```bash
# 双击运行测试脚本
E:\SynapseAutomation\scripts\tests\test_wechat_channels_simple.bat
```

这个脚本会：
- 自动激活 conda 环境
- 检查并安装依赖（selenium, beautifulsoup4）
- 运行爬虫测试
- 显示抓取结果
- 保存数据到数据库

### 方式 2: 手动运行

```bash
# 1. 激活环境
conda activate syn

# 2. 进入项目目录
cd E:\SynapseAutomation

# 3. 运行测试
python syn_backend/crawlers/wechat_channels/test_simple.py
```

## 📊 测试结果示例

测试成功后，你会看到类似这样的输出：

```
============================================================
🚀 视频号数据采集测试
============================================================

📁 使用 Cookie 文件: channels_sphjscpkHodFygw.json
🌐 正在访问视频号创作者平台...

✅ 爬取成功！

============================================================
账号信息
============================================================
账号ID: sphjscpkHodFygw
账号名称: 乐鸿捕鱼福利官
视频数量: 20
抓取时间: 2025-12-31T14:30:00

============================================================
视频列表（共 20 个）
============================================================

📹 视频 1:
  标题: XXXXX
  封面: https://...
  统计: 播放 1.2w 点赞 345
  链接: https://channels.weixin.qq.com/...
  ID: 123456

... (更多视频)

💾 已保存 20/20 个视频到数据库
✅ 从数据库读取了 3 个视频（验证成功）

🎉 测试完成！
```

## 🌐 使用 API 接口

测试成功后，你可以通过 API 接口使用这个功能：

### 1. 启动 FastAPI 服务

```bash
cd E:\SynapseAutomation
python syn_backend/fastapi_app/main.py
```

### 2. 访问 API 文档

打开浏览器访问：
```
http://localhost:7000/api/docs
```

搜索 `wechat-channels` 可以看到以下接口：

### 3. 调用抓取接口

**方法 1: 使用 Swagger UI**

1. 打开 http://localhost:7000/api/docs
2. 找到 `POST /api/v1/wechat-channels/fetch-videos`
3. 点击 "Try it out"
4. 填写参数：
   ```json
   {
     "account_cookie_file": "channels_sphjscpkHodFygw.json",
     "max_pages": 3,
     "use_ai_enhance": false
   }
   ```
5. 点击 "Execute"

**方法 2: 使用 curl**

```bash
curl -X POST "http://localhost:7000/api/v1/wechat-channels/fetch-videos" \
  -H "Content-Type: application/json" \
  -d '{
    "account_cookie_file": "channels_sphjscpkHodFygw.json",
    "max_pages": 3,
    "use_ai_enhance": false
  }'
```

**方法 3: 使用 Python**

```python
import httpx
import asyncio

async def fetch_videos():
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            "http://localhost:7000/api/v1/wechat-channels/fetch-videos",
            json={
                "account_cookie_file": "channels_sphjscpkHodFygw.json",
                "max_pages": 3,
                "use_ai_enhance": False
            }
        )
        print(response.json())

asyncio.run(fetch_videos())
```

## 📋 可用的 API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/v1/wechat-channels/fetch-videos` | POST | 抓取视频列表 |
| `/api/v1/wechat-channels/fetch-video-detail` | POST | 抓取单个视频详情 |
| `/api/v1/wechat-channels/parse-video-html` | POST | AI 解析 HTML（需要 AI Key） |
| `/api/v1/wechat-channels/accounts` | GET | 获取账号列表 |
| `/api/v1/wechat-channels/health` | GET | 健康检查 |

## 🗄️ 查看数据库

抓取的数据保存在 SQLite 数据库中：

**数据库路径：**
```
E:\SynapseAutomation\syn_backend\db\database.db
```

**数据表：**
- `wechat_channels_videos` - 视频数据
- `wechat_channels_accounts` - 账号信息
- `wechat_channels_crawl_tasks` - 抓取任务记录

**使用 SQLite 查看器查看：**
1. 下载 SQLite Browser: https://sqlitebrowser.org/
2. 打开数据库文件
3. 浏览表数据

## 🔧 配置说明

### 抓取参数

```json
{
  "account_cookie_file": "channels_sphjscpkHodFygw.json",  // Cookie 文件名
  "max_pages": 3,                                           // 最多抓取页数（1-10）
  "use_ai_enhance": false                                   // 是否使用 AI 增强（可选）
}
```

### AI 增强功能（可选）

如果启用 `use_ai_enhance: true`，会使用 DeepSeek AI 自动解析视频信息：
- 提取标题、描述、播放量等
- 生成视频标签和分类
- 自动识别视频主题

**注意：** AI 增强会调用 SiliconFlow API，会产生费用。

## ⚠️ 注意事项

1. **Cookie 有效期**
   - 视频号 Cookie 可能会过期
   - 如果爬取失败，请重新获取 Cookie

2. **抓取频率**
   - 建议控制抓取频率，避免被限制
   - 单次不要抓取过多页数（建议 ≤ 10 页）

3. **浏览器驱动**
   - 需要 ChromeDriver 或其他浏览器驱动
   - Selenium 会自动下载驱动（首次运行较慢）

4. **Headless 模式**
   - 测试时可以关闭 Headless 模式（在代码中设置）
   - 生产环境建议开启 Headless 模式

## 🐛 常见问题

### Q1: 测试脚本报错 "Cookie 文件不存在"

**解决：** 检查 Cookie 文件路径是否正确
```bash
dir E:\SynapseAutomation\syn_backend\cookiesFile\channels_*.json
```

### Q2: 爬取失败 "Cookie 已失效或未登录"

**解决：** Cookie 可能已过期，需要重新获取
1. 浏览器登录视频号创作者平台
2. 使用开发者工具导出 Cookie
3. 更新 Cookie 文件

### Q3: 提示 "未找到 ChromeDriver"

**解决：** Selenium 会自动下载，耐心等待首次运行完成

### Q4: 视频数据为空

**解决：** 可能是 HTML 结构变化，需要调整选择器
- 打开浏览器访问视频号创作者平台
- 检查页面结构
- 更新 `channels_crawler.py` 中的选择器

## 📞 需要帮助？

如果遇到问题：
1. 查看完整日志输出
2. 检查 Cookie 是否有效
3. 确认网络连接正常
4. 查看 FastAPI 服务是否运行

---

**功能开发完成时间：** 2025-12-31
**测试状态：** ✅ 待测试
**下一步：** 运行 `test_wechat_channels_simple.bat` 进行测试
