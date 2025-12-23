# 发布间隔控制系统

## 📋 概述

智能发布间隔控制系统，用于控制批量发布任务的执行时机，支持固定间隔和随机偏移，使发布行为更自然，避免平台检测。

---

## 🎯 核心特性

### 1. **灵活的间隔模式**
- ✅ **video_first** - 按视频优先排列，同一视频在不同账号间先发布完
- ✅ **account_first** - 按账号优先排列，同一账号的多个视频依次发布

### 2. **随机偏移**
- ✅ **自然发布节奏** - 添加随机时间偏移，模拟人工发布
- ✅ **可配置范围** - 支持 ±N 秒的随机偏移
- ✅ **避免规律检测** - 打破固定间隔模式

### 3. **智能调度**
- ✅ **基于时间戳** - 使用 `not_before` 标记任务最早执行时间
- ✅ **自动排队** - Celery Worker 自动延迟执行直到指定时间
- ✅ **并发安全** - 配合账号级并发控制，防止冲突

---

## 🚀 快速开始

### 基础使用

#### 1. 固定间隔发布（不启用随机）

```bash
curl -X POST http://localhost:7000/api/v1/publish/batch \
  -H "Content-Type: application/json" \
  -d '{
    "file_ids": [1, 2, 3],
    "accounts": ["account_123"],
    "platform": 3,
    "title": "批量发布测试",
    "interval_control_enabled": true,
    "interval_mode": "video_first",
    "interval_seconds": 300
  }'
```

**执行效果：**
- 视频1 - 立即发布（0秒）
- 视频2 - 延迟5分钟（300秒）
- 视频3 - 延迟10分钟（600秒）

#### 2. 随机间隔发布（推荐）

```bash
curl -X POST http://localhost:7000/api/v1/publish/batch \
  -H "Content-Type: application/json" \
  -d '{
    "file_ids": [1, 2, 3],
    "accounts": ["account_123"],
    "platform": 3,
    "title": "批量发布测试",
    "interval_control_enabled": true,
    "interval_mode": "video_first",
    "interval_seconds": 300,
    "random_offset": 120
  }'
```

**执行效果：**
- 视频1 - 随机延迟 0±120秒（例如：42秒）
- 视频2 - 随机延迟 300±120秒（例如：387秒）
- 视频3 - 随机延迟 600±120秒（例如：531秒）

---

## 📊 参数详解

### API 参数

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| **interval_control_enabled** | boolean | false | 是否启用间隔控制 |
| **interval_mode** | string | null | 间隔模式：`video_first` 或 `account_first` |
| **interval_seconds** | integer | 300 | 基础间隔时间（秒），范围：0-86400 |
| **random_offset** | integer | 0 | 随机偏移范围（±秒），范围：0-3600 |

### 别名支持

为了兼容不同的命名风格，以下别名均有效：

```json
{
  "interval_control_enabled": true,  // 或 intervalControlEnabled
  "interval_mode": "video_first",    // 或 intervalMode
  "interval_seconds": 300,           // 或 intervalSeconds
  "random_offset": 120              // 或 randomOffset
}
```

---

## 💡 使用场景

### 场景 1: 单账号发布多个视频（避免同账号并发冲突）

**需求：** 一个账号需要发布10个视频，避免同时发布导致冲突

**方案：**
```json
{
  "file_ids": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  "accounts": ["account_123"],
  "interval_control_enabled": true,
  "interval_mode": "video_first",
  "interval_seconds": 180,
  "random_offset": 60
}
```

**结果：**
- 每个视频间隔 3分钟 ± 1分钟
- 总耗时约 27-33 分钟
- 模拟人工发布节奏

### 场景 2: 多账号矩阵发布（账号优先）

**需求：** 3个账号各发布5个视频，每个账号的视频依次发布

**方案：**
```json
{
  "file_ids": [1, 2, 3, 4, 5],
  "accounts": ["acc1", "acc2", "acc3"],
  "interval_control_enabled": true,
  "interval_mode": "account_first",
  "interval_seconds": 300,
  "random_offset": 120
}
```

**执行顺序：**
1. acc1-video1 → 立即
2. acc2-video1 → 5分钟±2分钟
3. acc3-video1 → 10分钟±2分钟
4. acc1-video2 → 15分钟±2分钟
5. acc2-video2 → 20分钟±2分钟
6. ...（以此类推）

### 场景 3: 跨平台发布（自动按平台分组）

**需求：** 同一素材发布到抖音和小红书，不同平台独立间隔

**方案：**
```json
{
  "file_ids": [1, 2, 3],
  "accounts": ["douyin_acc1", "xhs_acc1"],
  "platform": null,  // 不指定平台，自动分组
  "interval_control_enabled": true,
  "interval_mode": "video_first",
  "interval_seconds": 300,
  "random_offset": 120
}
```

**结果：**
- 抖音和小红书分别独立计算间隔
- 每个平台内按 video_first 模式排列

### 场景 4: 深夜定时发布 + 间隔控制

**需求：** 明天早上8点开始发布，每5分钟一个视频

**方案：**
```json
{
  "file_ids": [1, 2, 3, 4, 5],
  "accounts": ["account_123"],
  "scheduled_time": "08:00",
  "interval_control_enabled": true,
  "interval_mode": "video_first",
  "interval_seconds": 300,
  "random_offset": 60
}
```

**结果：**
- 8:00±1分钟 - 视频1
- 8:05±1分钟 - 视频2
- 8:10±1分钟 - 视频3
- 8:15±1分钟 - 视频4
- 8:20±1分钟 - 视频5

---

## 🔍 工作原理

### 间隔计算逻辑

#### video_first 模式

```python
offset = file_index * interval_seconds
if random_offset > 0:
    offset += random.randint(-random_offset, random_offset)
offset = max(0, offset)  # 确保非负
scheduled_time = now + timedelta(seconds=offset)
```

**示例：**
- file_index=0: offset = 0 + random(-120, 120) → 例如：75秒
- file_index=1: offset = 300 + random(-120, 120) → 例如：412秒
- file_index=2: offset = 600 + random(-120, 120) → 例如：538秒

#### account_first 模式

```python
offset = (account_index * interval_seconds) + (file_index * interval_seconds * account_count)
if random_offset > 0:
    offset += random.randint(-random_offset, random_offset)
offset = max(0, offset)
scheduled_time = now + timedelta(seconds=offset)
```

**示例（3个账号，2个视频）：**
- acc1-video1: offset = 0 + 0 = 0 → 立即
- acc2-video1: offset = 300 + 0 = 300 → 5分钟
- acc3-video1: offset = 600 + 0 = 600 → 10分钟
- acc1-video2: offset = 0 + 900 = 900 → 15分钟
- acc2-video2: offset = 300 + 900 = 1200 → 20分钟
- acc3-video2: offset = 600 + 900 = 1500 → 25分钟

### Celery 任务调度流程

```
1. API 接收批量发布请求
   ↓
2. PublishService 计算每个任务的 scheduled_time
   ↓
3. 将 not_before 时间戳写入 task_data
   ↓
4. 提交到 Celery 队列（任务立即入队）
   ↓
5. Celery Worker 接收任务
   ↓
6. Worker 检查 not_before
   ├─ 未到时间 → 等待（轮询或sleep）
   └─ 时间已到 → 执行任务
   ↓
7. 获取账号级并发锁
   ↓
8. 执行发布操作
   ↓
9. 释放锁，任务完成
```

---

## 🛠 配置建议

### 推荐配置

| 场景 | interval_seconds | random_offset | interval_mode |
|------|-----------------|---------------|---------------|
| **单账号少量视频(1-5个)** | 180 | 60 | video_first |
| **单账号大量视频(10+)** | 300 | 120 | video_first |
| **多账号矩阵发布** | 300 | 120 | account_first |
| **测试环境** | 30 | 10 | video_first |
| **深夜定时批量** | 600 | 180 | video_first |

### 参数选择指南

**interval_seconds（基础间隔）：**
- ✅ 短间隔（60-180秒）- 适用于少量视频，快速发布
- ✅ 中等间隔（300-600秒）- 平衡效率与安全，通用场景
- ✅ 长间隔（900-1800秒）- 高度模拟人工，风控严格的平台

**random_offset（随机偏移）：**
- ✅ 小偏移（30-60秒）- 轻微随机化，保持可预测性
- ✅ 中等偏移（60-120秒）- **推荐**，良好的随机性
- ✅ 大偏移（180-300秒）- 高度随机，适合长间隔场景

**计算公式：**
```
random_offset ≈ interval_seconds × 0.3 ~ 0.5
```

**示例：**
- interval_seconds=300 → random_offset=90-150（推荐120）
- interval_seconds=600 → random_offset=180-300（推荐240）

---

## 📊 监控和调试

### 查看任务调度时间

在 Worker 日志中查看：

```
[IntervalControl] 间隔控制配置: enabled=True, mode=video_first, interval=300s, random_offset=±120s
[IntervalControl] Task publish_batch_xxx_1_account_123 scheduled at 14:25:37 (+315s from now)
[IntervalControl] Task publish_batch_xxx_2_account_123 scheduled at 14:30:18 (+618s from now)
```

### 验证间隔是否生效

```python
import requests
import time

# 提交批量任务
response = requests.post(
    "http://localhost:7000/api/v1/publish/batch",
    json={
        "file_ids": [1, 2, 3],
        "accounts": ["account_123"],
        "interval_control_enabled": True,
        "interval_seconds": 60,
        "random_offset": 10
    }
)

batch_id = response.json()["data"]["batch_id"]

# 监控任务状态
while True:
    status_response = requests.get(f"http://localhost:7000/api/v1/tasks/{batch_id}")
    tasks = status_response.json()["data"]["tasks"]

    for task in tasks:
        print(f"{task['task_id']}: {task['status']} - {task.get('started_at')}")

    time.sleep(5)
```

---

## 🔧 故障排查

### 1. 间隔不生效（任务立即执行）

**现象：** 所有任务几乎同时执行，无间隔

**原因：**
- `interval_control_enabled` 为 `false`
- Worker 未正确读取 `not_before` 字段

**排查：**
```bash
# 检查 API 请求
curl http://localhost:7000/api/v1/publish/batch -d '{"interval_control_enabled": true, ...}'

# 检查 Worker 日志
# 应该看到 [IntervalControl] 相关日志
```

### 2. 随机偏移未生效（间隔完全固定）

**现象：** 任务间隔完全固定，无随机性

**原因：**
- `random_offset` 设置为 0 或未传递

**解决：**
```json
{
  "random_offset": 120  // 确保大于0
}
```

### 3. 偏移量过大导致任务延迟过久

**现象：** 任务执行时间远超预期

**原因：**
- `interval_seconds` 或 `random_offset` 设置过大

**解决：**
- 减小 `interval_seconds`
- 减小 `random_offset`
- 或接受更长的执行时间

---

## 🎉 最佳实践

### 1. 单账号发布多视频

```json
{
  "file_ids": [1, 2, 3, 4, 5],
  "accounts": ["account_123"],
  "interval_control_enabled": true,
  "interval_mode": "video_first",
  "interval_seconds": 300,
  "random_offset": 120
}
```

**优势：**
- ✅ 避免账号级并发冲突（account_max=1）
- ✅ 模拟人工发布节奏
- ✅ 平台不易检测

### 2. 多账号矩阵发布

```json
{
  "file_ids": [1, 2, 3],
  "accounts": ["acc1", "acc2", "acc3", "acc4", "acc5"],
  "interval_control_enabled": true,
  "interval_mode": "account_first",
  "interval_seconds": 180,
  "random_offset": 60
}
```

**优势：**
- ✅ 每个账号的视频依次发布
- ✅ 账号间有间隔，避免关联
- ✅ 总耗时可控

### 3. 配合定时发布

```json
{
  "file_ids": [1, 2, 3],
  "accounts": ["account_123"],
  "scheduled_time": "18:00",
  "interval_control_enabled": true,
  "interval_seconds": 300,
  "random_offset": 120
}
```

**优势：**
- ✅ 在最佳时段发布
- ✅ 批量任务自动排布
- ✅ 无需手动操作

### 4. 关闭间隔（最大并发）

```json
{
  "file_ids": [1, 2, 3, 4, 5],
  "accounts": ["acc1", "acc2", "acc3"],
  "interval_control_enabled": false
}
```

**效果：**
- 所有任务立即提交到队列
- 仅受账号级并发控制限制（account_max=1）
- 适用于测试或紧急发布

---

## 📞 支持

遇到问题？

- 📖 查看 [CONCURRENCY_CONTROL.md](./CONCURRENCY_CONTROL.md) 了解并发控制
- 📖 查看 [CELERY_MIGRATION.md](./CELERY_MIGRATION.md) 了解任务队列
- 🔍 检查 Worker 日志中的 `[IntervalControl]` 标记

---

## 📝 更新日志

### v2.0 (2025-12-23)
- ✅ 新增随机偏移功能（`random_offset` 参数）
- ✅ 支持 camelCase 和 snake_case 参数别名
- ✅ 完善日志输出，显示随机偏移详情
- ✅ 改进文档和示例

### v1.0 (初始版本)
- ✅ 基础间隔控制（`interval_seconds`）
- ✅ 两种间隔模式（`video_first` / `account_first`）
- ✅ Celery 任务调度集成
