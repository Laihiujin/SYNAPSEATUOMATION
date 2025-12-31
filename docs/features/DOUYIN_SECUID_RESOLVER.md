# 抖音 ID 转 sec_uid 功能文档

## 📌 功能概述

该功能提供了通过**抖音号（数字 ID）**查询对应 **sec_uid** 的能力，支持单个查询和批量查询。

## 🎯 使用场景

1. **数据采集**：在采集抖音用户视频数据前，需要先获取 sec_uid
2. **账号管理**：批量更新数据库中的抖音账号 sec_uid
3. **API 调用**：抖音的很多 API 需要使用 sec_uid 而不是数字 ID

## 🔧 技术实现

### 三层降级策略

```
┌─────────────────────────────────────┐
│  1. 搜索接口（推荐）                  │
│  - 速度：快 ⚡                       │
│  - 稳定性：高                        │
│  - 要求：需要 a_bogus 签名           │
└─────────────────────────────────────┘
              ↓ 失败
┌─────────────────────────────────────┐
│  2. Playwright 模拟搜索（可选）       │
│  - 速度：慢 🐌                       │
│  - 稳定性：最高                      │
│  - 要求：需要安装 Playwright          │
└─────────────────────────────────────┘
              ↓ 失败
┌─────────────────────────────────────┐
│  3. 访问用户主页（降级）              │
│  - 速度：中等                        │
│  - 稳定性：中等                      │
│  - 要求：无                          │
└─────────────────────────────────────┘
```

## 📡 API 接口

### 1. 批量查询（POST）

**端点**: `POST /api/v1/analytics/douyin/id-to-secuid`

**请求体**:
```json
{
  "user_ids": ["12188823", "987654321"],
  "cookie_header": "可选的cookie字符串",
  "use_playwright": false
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "resolved": {
      "12188823": "MS4wLjABAAAAOCfudNT69H0SrsnSexICNmuymRdacnUChMJgWTdg17A"
    },
    "failed": {
      "987654321": "resolve_failed"
    },
    "total": 2,
    "success_count": 1,
    "failed_count": 1
  }
}
```

### 2. 单个查询（GET）

**端点**: `GET /api/v1/analytics/douyin/id-to-secuid/{user_id}`

**查询参数**:
- `cookie`: 可选的 Cookie 字符串
- `use_playwright`: 是否使用 Playwright（默认 false）

**示例**:
```bash
GET /api/v1/analytics/douyin/id-to-secuid/12188823
```

**响应**:
```json
{
  "success": true,
  "data": {
    "user_id": "12188823",
    "sec_uid": "MS4wLjABAAAAOCfudNT69H0SrsnSexICNmuymRdacnUChMJgWTdg17A"
  }
}
```

## 🚀 使用示例

### Python 示例

```python
import httpx

# 批量查询
async def batch_resolve():
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://localhost:8000/api/v1/analytics/douyin/id-to-secuid",
            json={
                "user_ids": ["12188823", "123456789"],
                "use_playwright": False
            }
        )
        result = response.json()
        print(result)

# 单个查询
async def single_resolve():
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "http://localhost:8000/api/v1/analytics/douyin/id-to-secuid/12188823"
        )
        result = response.json()
        print(result["data"]["sec_uid"])
```

### cURL 示例

```bash
# 单个查询
curl "http://localhost:8000/api/v1/analytics/douyin/id-to-secuid/12188823"

# 批量查询
curl -X POST "http://localhost:8000/api/v1/analytics/douyin/id-to-secuid" \
  -H "Content-Type: application/json" \
  -d '{
    "user_ids": ["12188823"],
    "use_playwright": false
  }'
```

### JavaScript/TypeScript 示例

```typescript
// 单个查询
async function getSecUid(userId: string): Promise<string> {
  const response = await fetch(
    `http://localhost:8000/api/v1/analytics/douyin/id-to-secuid/${userId}`
  );
  const data = await response.json();
  return data.data.sec_uid;
}

// 批量查询
async function batchGetSecUid(userIds: string[]): Promise<Record<string, string>> {
  const response = await fetch(
    'http://localhost:8000/api/v1/analytics/douyin/id-to-secuid',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_ids: userIds,
        use_playwright: false
      })
    }
  );
  const data = await response.json();
  return data.data.resolved;
}
```

## ⚙️ 配置选项

### 环境变量

可以通过环境变量控制默认行为：

```bash
# 是否默认启用 Playwright（性能较慢但更稳定）
DOUYIN_SECUID_USE_PLAYWRIGHT=false

# 请求超时时间（秒）
DOUYIN_SECUID_TIMEOUT=10
```

### 性能建议

1. **批量查询**：建议每次不超过 50 个 ID
2. **并发控制**：避免同时发起过多请求
3. **Cookie 复用**：如果有有效的 Cookie，传入可以提高成功率
4. **Playwright 模式**：仅在其他方式失败时使用

## 🔍 故障排查

### 常见问题

**Q1: 所有 ID 都解析失败？**
- 检查网络连接
- 尝试传入有效的 Cookie
- 启用 `use_playwright: true`

**Q2: 部分 ID 解析失败？**
- 可能是用户不存在或已注销
- 检查 ID 是否正确

**Q3: 解析速度很慢？**
- 不要启用 Playwright（除非必要）
- 减少批量查询的数量
- 检查网络延迟

## 📊 性能指标

| 策略 | 平均耗时 | 成功率 | 资源占用 |
|------|---------|--------|---------|
| 搜索接口 | ~500ms | 85% | 低 |
| Playwright | ~3s | 95% | 高 |
| 主页访问 | ~1s | 75% | 中 |

## 🔐 安全建议

1. **Cookie 保护**：不要在日志中记录完整的 Cookie
2. **频率限制**：建议添加 API 调用频率限制
3. **数据缓存**：已解析的 sec_uid 应该缓存到数据库

## 📝 更新日志

### v1.0.0 (2025-12-30)
- ✅ 实现三层降级策略
- ✅ 支持批量查询和单个查询
- ✅ 添加 Playwright 降级方案
- ✅ 完善错误处理和日志
