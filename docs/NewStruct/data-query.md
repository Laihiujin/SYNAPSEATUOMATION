# 数据查询（社媒助手 / social-media-copilot 对接）

本项目在后端使用 **Playwright 在页面上下文执行 `fetch()`** 的方式实现数据抓取逻辑，思路与仓库内 vendored 的 `syn_backend/social-media-copilot` 插件一致（复用站点 JS 上下文 + 已登录 Cookie）。

因此：
- 不需要额外启动一个 “copilot server（/cookies、/request）”
- 只要你已经在 **账号管理** 里扫码绑定过同平台账号（Cookie 有效），即可抓取作品/用户/评论数据

## 前置条件

1) 先绑定账号 Cookie（账号管理 → 扫码登录 → 状态为 `valid`）
2) 环境变量可选：
- `PLAYWRIGHT_HEADLESS=false`：显示浏览器窗口（便于排查）
- `PLAYWRIGHT_HEADLESS=true`：无头运行（默认）

## API（FastAPI）

服务默认：`http://localhost:7000`

### 0) 查看已绑定 Cookie 状态

`GET /api/v1/data/copilot/status`

返回示例（截断）：
```json
{
  "status": "success",
  "data": {
    "douyin": { "total": 2, "valid": 1, "examples": [{"account_id":"account_xxx","user_id":"MS4..."}] }
  }
}
```

### 1) 采集作品详情（批量写入 video_analytics）

`POST /api/v1/data/copilot/works-batch`

Body 示例（抖音）：
```json
{
  "platform": "douyin",
  "work_ids": [
    "7582268806614043944",
    "https://www.douyin.com/video/7582268806614043944",
    "2.53 A@G.ic ... https://v.douyin.com/KcZINX6b-io/ ..."
  ],
  "limit": 50,
  "refresh_work_ids": false
}
```

说明：
- `work_ids` 支持 **aweme_id / 视频链接 / 分享口令文本（包含 URL）**
- `work_ids` 为空时：从库里读取（按已绑定账号的 `video_analytics`）或使用 `refresh_work_ids=true` 先刷新采集

### 2) 采集作品评论（目前支持抖音）

`POST /api/v1/data/copilot/work-comments`

```json
{
  "platform": "douyin",
  "work_id": "7582268806614043944",
  "limit": 50,
  "cursor": 0
}
```

`work_id` 同样支持粘贴 URL / 分享口令文本（会自动解析成 `aweme_id`）。

### 3) 采集创作者信息（目前支持抖音）

`POST /api/v1/data/copilot/user-info`

```json
{
  "platform": "douyin",
  "user_id": "MS4wLjABAAAA3D2jKaT4NqpiQpYGAp3QavaZL8cMqiFlafL0FwFMvZw"
}
```

说明：
- 抖音这里的 `user_id` 指 **sec_uid**
- 你可以从 `https://www.douyin.com/user/<sec_uid>` 里直接取出来

### 4) 采集创作者作品列表（目前支持抖音）

`POST /api/v1/data/copilot/user-works`

```json
{
  "platform": "douyin",
  "user_id": "MS4wLjABAAAA3D2jKaT4NqpiQpYGAp3QavaZL8cMqiFlafL0FwFMvZw",
  "limit": 20,
  "cursor": 0
}
```

## PowerShell 调用示例

```powershell
$body = @{
  platform = "douyin"
  user_id  = "MS4wLjABAAAA3D2jKaT4NqpiQpYGAp3QavaZL8cMqiFlafL0FwFMvZw"
  limit    = 20
  cursor   = 0
} | ConvertTo-Json

Invoke-RestMethod -Method Post `
  -Uri "http://localhost:7000/api/v1/data/copilot/user-works" `
  -ContentType "application/json" `
  -Body $body
```

## 常见问题

1) 返回 `未找到抖音已绑定账号 Cookie（请先扫码绑定一个账号）`
- 说明当前库里没有任何 `douyin` 平台 `valid` 的账号 Cookie，需要先扫码绑定

2) 抖音 `unique_id（短号）` → `sec_uid`
- 目前后端不做“短号转 sec_uid”的解析（这通常需要额外的页面跳转或搜索接口能力）
- 建议直接粘贴用户主页链接 `https://www.douyin.com/user/<sec_uid>`（从 URL 中截取）
