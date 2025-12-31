# 视频号数据采集功能

## 概述

这是一个用于抓取微信视频号创作者平台数据的模块，支持以下功能：

- 基于 Cookie 登录视频号创作者平台
- 抓取视频号作品列表（支持多页翻页）
- 可选的 DeepSeek AI 增强（自动解析 HTML 并提取结构化数据）
- 数据存储到 SQLite 数据库
- RESTful API 接口

## 架构说明

```
syn_backend/
├── crawlers/
│   └── wechat_channels/
│       ├── __init__.py              # 模块入口
│       ├── channels_crawler.py      # Selenium 爬虫核心
│       ├── deepseek_client.py       # DeepSeek AI 客户端
│       └── storage.py               # 数据库存储层
└── fastapi_app/
    └── api/
        └── v1/
            └── wechat_channels/
                ├── __init__.py
                ├── router.py        # API 路由
                └── services.py      # 业务服务层
```

## 功能特性

### 1. Selenium 爬虫
- 使用 Selenium WebDriver 访问视频号创作者平台
- 支持 Cookie 登录（无需扫码）
- 自动翻页抓取多页数据
- 支持 Headless 模式

### 2. DeepSeek AI 增强（可选）
- 使用 DeepSeek API 解析视频 HTML
- 自动提取标题、描述、播放量、点赞数等
- 生成视频标签和分类
- 批量处理支持

### 3. 数据存储
- 存储在 SQLite 数据库（`database.db`）
- 3 张表：
  - `wechat_channels_videos`: 视频数据
  - `wechat_channels_accounts`: 账号信息
  - `wechat_channels_crawl_tasks`: 抓取任务记录

## 使用方法

### 1. 准备 Cookie 文件

在 `syn_backend/cookiesFile/` 目录下创建视频号 Cookie 文件：

```json
{
  "account_name": "我的视频号账号",
  "status": "valid",
  "last_updated": "2025-12-31T12:00:00",
  "cookies": [
    {
      "name": "session_id",
      "value": "your_session_value",
      "domain": ".weixin.qq.com",
      "path": "/",
      "expirationDate": 1735689600
    }
    // ... 更多 cookies
  ]
}
```

文件命名规则：`wechat_channels_<账号名>.json`

### 2. 配置 DeepSeek API（可选）

如果要使用 AI 增强功能，需要配置 DeepSeek API Key：

```bash
# 在 .env 文件中添加
DEEPSEEK_API_KEY=your_deepseek_api_key
```

### 3. 调用 API 接口

#### 3.1 抓取视频列表

```bash
POST http://localhost:7000/api/v1/wechat-channels/fetch-videos
Content-Type: application/json

{
  "account_cookie_file": "wechat_channels_account1.json",
  "max_pages": 3,
  "use_ai_enhance": false
}
```

**响应示例：**

```json
{
  "success": true,
  "data": {
    "videos": [
      {
        "title": "视频标题",
        "cover_url": "https://...",
        "stats": "播放量/点赞数",
        "raw_html": "<div>...</div>",
        "crawled_at": "2025-12-31T12:00:00"
      }
    ],
    "total": 15,
    "saved_count": 15,
    "crawled_at": "2025-12-31T12:00:00"
  },
  "platform": "wechat_channels"
}
```

#### 3.2 使用 AI 解析视频 HTML

```bash
POST http://localhost:7000/api/v1/wechat-channels/parse-video-html
Content-Type: application/json

{
  "raw_html": "<div class=\"post-item\">...</div>"
}
```

**响应示例：**

```json
{
  "success": true,
  "data": {
    "title": "视频标题",
    "description": "视频描述",
    "cover_url": "https://...",
    "play_count": "12345",
    "like_count": "678",
    "comment_count": "90"
  }
}
```

#### 3.3 获取可用账号列表

```bash
GET http://localhost:7000/api/v1/wechat-channels/accounts
```

#### 3.4 健康检查

```bash
GET http://localhost:7000/api/v1/wechat-channels/health
```

## 数据库表结构

### wechat_channels_videos（视频表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| video_id | TEXT | 视频ID（唯一） |
| account_id | TEXT | 账号ID |
| title | TEXT | 视频标题 |
| description | TEXT | 视频描述 |
| cover_url | TEXT | 封面URL |
| video_url | TEXT | 视频URL |
| duration | TEXT | 视频时长 |
| play_count | INTEGER | 播放量 |
| like_count | INTEGER | 点赞数 |
| comment_count | INTEGER | 评论数 |
| share_count | INTEGER | 分享数 |
| publish_time | DATETIME | 发布时间 |
| category | TEXT | 分类 |
| tags | TEXT | 标签（JSON数组） |
| summary | TEXT | 摘要 |
| raw_html | TEXT | 原始HTML |
| ai_enhanced | INTEGER | 是否AI增强（0/1） |
| crawled_at | DATETIME | 抓取时间 |
| updated_at | DATETIME | 更新时间 |

### wechat_channels_accounts（账号表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| account_id | TEXT | 账号ID（唯一） |
| account_name | TEXT | 账号名称 |
| nickname | TEXT | 昵称 |
| avatar_url | TEXT | 头像URL |
| description | TEXT | 描述 |
| cookie_file | TEXT | Cookie文件名 |
| status | TEXT | 状态（active/inactive） |
| total_videos | INTEGER | 总视频数 |
| total_followers | INTEGER | 总粉丝数 |
| total_likes | INTEGER | 总点赞数 |
| last_crawl_time | DATETIME | 最后抓取时间 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

### wechat_channels_crawl_tasks（抓取任务表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| account_id | TEXT | 账号ID |
| task_type | TEXT | 任务类型 |
| status | TEXT | 状态（pending/completed/failed） |
| max_pages | INTEGER | 最大页数 |
| videos_count | INTEGER | 视频数量 |
| ai_enhanced | INTEGER | 是否AI增强 |
| error_message | TEXT | 错误信息 |
| started_at | DATETIME | 开始时间 |
| completed_at | DATETIME | 完成时间 |
| created_at | DATETIME | 创建时间 |

## 依赖安装

```bash
# Selenium WebDriver
pip install selenium

# BeautifulSoup4（HTML 解析）
pip install beautifulsoup4

# Loguru（日志）
pip install loguru

# HTTPX（HTTP 客户端）
pip install httpx
```

## 注意事项

1. **Cookie 有效期**：视频号 Cookie 通常有效期较短，需要定期更新

2. **反爬虫机制**：视频号平台可能有反爬虫机制，建议：
   - 控制抓取频率（添加延迟）
   - 使用 Headless 模式避免检测
   - 轮换 IP（如有需要）

3. **AI 增强成本**：DeepSeek API 调用会产生费用，根据实际需求决定是否启用

4. **HTML 结构变化**：视频号平台的 HTML 结构可能会变化，需要及时更新选择器

5. **Selenium WebDriver**：确保已安装 ChromeDriver 或其他浏览器驱动

## 扩展功能（待实现）

- [ ] 支持 Playwright 替代 Selenium
- [ ] 支持视频详情页抓取
- [ ] 支持评论数据抓取
- [ ] 支持数据导出（CSV/Excel）
- [ ] 支持 Celery 异步任务
- [ ] 支持多账号并发抓取
- [ ] 支持增量更新（只抓取新视频）

## API 文档

完整 API 文档请访问：http://localhost:7000/api/docs

## 示例代码

### Python 调用示例

```python
import httpx
import asyncio

async def fetch_wechat_videos():
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://localhost:7000/api/v1/wechat-channels/fetch-videos",
            json={
                "account_cookie_file": "wechat_channels_account1.json",
                "max_pages": 3,
                "use_ai_enhance": True
            }
        )

        data = response.json()
        if data["success"]:
            print(f"成功抓取 {data['data']['total']} 个视频")
            for video in data['data']['videos']:
                print(f"- {video['title']}")
        else:
            print(f"抓取失败: {data['error']}")

# 运行
asyncio.run(fetch_wechat_videos())
```

## 常见问题

### Q1: Cookie 如何获取？

A: 使用浏览器开发者工具（F12）-> Application -> Cookies，复制所有 Cookie 到 JSON 文件。

### Q2: 为什么抓取失败？

A: 可能原因：
- Cookie 已过期
- 网络问题
- 视频号平台 HTML 结构变化
- 反爬虫拦截

### Q3: 如何提高抓取成功率？

A: 建议：
- 定期更新 Cookie
- 添加随机延迟
- 使用高质量代理 IP
- 模拟真实用户行为

## 许可证

仅供学习和研究使用，请遵守相关平台的使用条款。

## 更新日志

### v1.0.0 (2025-12-31)
- ✅ 初始版本发布
- ✅ 支持视频列表抓取
- ✅ 支持 DeepSeek AI 增强
- ✅ 支持数据库存储
- ✅ 提供 RESTful API
