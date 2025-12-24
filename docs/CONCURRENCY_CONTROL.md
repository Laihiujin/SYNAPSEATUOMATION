# 动态并发控制系统

## 📋 概述

基于 **Redis** 的分布式动态并发控制系统，支持多维度限流和实时配置调整。

---

## 🎯 核心特性

### 1. **多维度并发控制**
- ✅ **全局并发限制** - 控制系统总并发数
- ✅ **平台级限流** - 不同平台独立限流（抖音、小红书、快手等）
- ✅ **账号级限流** - 防止同一账号并发冲突（推荐设为1）
- ✅ **任务类型限流** - 按任务类型独立控制

### 2. **动态配置**
- ✅ **实时生效** - 通过 API 修改配置立即生效，无需重启
- ✅ **Redis 存储** - 所有 Worker 共享配置
- ✅ **默认配置** - 提供合理的默认值

### 3. **智能等待机制**
- ✅ **自动等待** - 达到并发限制时自动等待令牌释放
- ✅ **超时重试** - 等待超时后自动重试任务
- ✅ **令牌超时** - 防止死锁，令牌自动过期释放

### 4. **监控统计**
- ✅ **实时使用情况** - 查看各维度当前并发数
- ✅ **历史统计** - 获取24小时内统计数据
- ✅ **详细日志** - 记录并发控制全过程

---

## 🚀 快速开始

## 📊 默认配置

系统启动时使用以下默认配置（**只控制账号级并发**）：

```json
{
  "global_max": 0,               // 全局无限制（0表示不限制）
  "platform_max": {
    "douyin": 0,                 // 抖音无限制
    "xiaohongshu": 0,            // 小红书无限制
    "kuaishou": 0,
    "bilibili": 0,
    "channels": 0
  },
  "account_max": 1,              // ✅ 每个账号最多1个并发（防冲突）
  "task_type_max": {
    "publish": 0,                // 发布任务无限制
    "batch_publish": 0           // 批量发布无限制
  },
  "enabled": true,               // 启用并发控制
  "timeout": 300                 // 令牌超时5分钟
}
```

**核心理念：**
- ✅ **账号级严格控制** - 防止同账号并发冲突（推荐值=1）
- ✅ **其他维度不限制** - 最大化系统吞吐量
- ✅ **灵活可调** - 可通过 API 动态调整任何维度的限制

### 工作原理

```
任务执行流程：

1. 任务进入队列
   ↓
2. Celery Worker 接收任务
   ↓
3. 【并发控制】尝试获取令牌
   ├─ 获取成功 → 执行任务
   └─ 获取失败 → 等待30秒 → 重试
   ↓
4. 任务执行完成
   ↓
5. 自动释放令牌
```

---

## 📡 API 接口

### 1. 获取当前配置

```http
GET /api/v1/concurrency/config
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "global_max": 10,
    "platform_max": {
      "douyin": 5,
      "xiaohongshu": 3
    },
    "account_max": 1,
    "task_type_max": {
      "publish": 10
    },
    "enabled": true,
    "timeout": 300
  }
}
```

### 2. 动态更新配置

```http
PUT /api/v1/concurrency/config
Content-Type: application/json

{
  "global_max": 20,              // 提升全局并发到20
  "platform_max": {
    "douyin": 10                 // 提升抖音并发到10
  },
  "enabled": true
}
```

**说明:**
- ✅ 只需传递要修改的字段
- ✅ 立即生效，无需重启
- ✅ 所有 Worker 自动应用新配置

**响应:**
```json
{
  "success": true,
  "data": { /* 更新后的完整配置 */ },
  "message": "并发配置更新成功，已立即生效"
}
```

### 3. 查看实时使用情况

```http
GET /api/v1/concurrency/usage
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "global": {
      "current": 7,              // 当前全局7个并发
      "max": 10
    },
    "platforms": {
      "douyin": {
        "current": 3,
        "max": 5
      },
      "xiaohongshu": {
        "current": 2,
        "max": 3
      }
    },
    "task_types": {
      "publish": {
        "current": 7,
        "max": 10
      }
    }
  }
}
```

### 4. 查看统计信息

```http
GET /api/v1/concurrency/stats
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "acquired:total": 1523,      // 总获取次数
    "released:total": 1520,      // 总释放次数
    "acquired:platform:douyin": 856,
    "acquired:task_type:publish": 1200
  }
}
```

### 5. 重置为默认配置

```http
POST /api/v1/concurrency/reset
```

---

## 💡 使用场景

### 场景 1: 临时限制某个平台（例如小红书风控严格）

默认所有平台不限制，但可以临时设置某个平台的限制：

```bash
curl -X PUT http://localhost:7000/api/v1/concurrency/config \
  -H "Content-Type: application/json" \
  -d '{
    "platform_max": {
      "xiaohongshu": 3
    }
  }'
```

### 场景 2: 临时设置全局并发限制（系统过载时）

```bash
curl -X PUT http://localhost:7000/api/v1/concurrency/config \
  -H "Content-Type: application/json" \
  -d '{
    "global_max": 20
  }'
```

### 场景 3: 恢复无限制（移除临时限制）

```bash
# 方法1: 设置为0
curl -X PUT http://localhost:7000/api/v1/concurrency/config \
  -H "Content-Type: application/json" \
  -d '{
    "global_max": 0,
    "platform_max": {
      "xiaohongshu": 0
    }
  }'

# 方法2: 重置为默认配置
curl -X POST http://localhost:7000/api/v1/concurrency/reset
```

### 场景 4: 临时允许某账号多并发（测试时）

```bash
curl -X PUT http://localhost:7000/api/v1/concurrency/config \
  -H "Content-Type: application/json" \
  -d '{
    "account_max": 2
  }'
```

### 场景 5: 临时关闭并发控制

```bash
curl -X PUT http://localhost:7000/api/v1/concurrency/config \
  -H "Content-Type: application/json" \
  -d '{"enabled": false}'
```

---

## 🔍 监控和调优

### 1. 实时监控脚本

```python
import requests
import time

def monitor_concurrency():
    while True:
        response = requests.get("http://localhost:7000/api/v1/concurrency/usage")
        data = response.json()["data"]

        print(f"🌐 全局: {data['global']['current']}/{data['global']['max']}")

        for platform, info in data['platforms'].items():
            print(f"📱 {platform}: {info['current']}/{info['max']}")

        time.sleep(5)

if __name__ == "__main__":
    monitor_concurrency()
```

### 2. Redis CLI 监控

```bash
# 查看全局当前并发数
redis-cli ZCARD "concurrency:semaphore:global"

# 查看抖音当前并发数
redis-cli ZCARD "concurrency:semaphore:platform:douyin"

# 查看某个账号是否正在执行
redis-cli ZRANGE "concurrency:semaphore:account:账号ID" 0 -1 WITHSCORES
```

### 3. 性能调优建议

**默认策略（推荐）:**

| 维度 | 推荐值 | 说明 |
|------|--------|------|
| **global_max** | 0 | 不限制全局并发 |
| **platform_max** | 0 | 不限制平台并发 |
| **account_max** | 1 | ✅ 严格限制，防止同账号冲突 |
| **task_type_max** | 0 | 不限制任务类型 |

**临时限流策略（特殊情况）:**

| 场景 | global_max | platform_max | account_max |
|------|------------|--------------|-------------|
| **系统过载** | 20-50 | 按需设置 | 1 |
| **平台风控** | 0 | 设置目标平台为3-5 | 1 |
| **测试环境** | 0 | 0 | 2 |

**注意事项:**
- ⚠️ **account_max 始终为1** - 强烈推荐，防止同账号并发冲突
- ⚠️ **设置为0表示无限制** - 最大化系统吞吐量
- ⚠️ **按需临时限制** - 遇到问题时才设置限制
- ⚠️ **监控后调整** - 观察系统实际表现后优化配置

---

## 🛠 故障排查

### 1. 任务一直等待

**现象:** 任务长时间处于 pending 状态

**排查步骤:**
```bash
# 1. 查看当前并发使用情况
curl http://localhost:7000/api/v1/concurrency/usage

# 2. 检查是否达到限制
# 如果 current >= max，说明并发已满

# 3. 查看是否有僵尸令牌
redis-cli KEYS "concurrency:semaphore:*"
redis-cli ZRANGE "concurrency:semaphore:global" 0 -1 WITHSCORES

# 4. 清理过期令牌（手动）
redis-cli EVAL "redis.call('del', KEYS[1])" 1 "concurrency:semaphore:global"
```

**解决方案:**
- 提升并发限制
- 或等待任务完成释放令牌

### 2. 配置不生效

**现象:** 修改配置后任务仍按旧配置执行

**排查:**
```bash
# 查看 Redis 中的配置
redis-cli GET "concurrency:config"

# 检查是否正确更新
curl http://localhost:7000/api/v1/concurrency/config
```

**解决方案:**
- 确认 Redis 连接正常
- 重新提交配置

### 3. 令牌泄漏

**现象:** 实际并发数低于配置，但显示已满

**原因:** 任务异常退出未释放令牌

**解决方案:**
```bash
# 令牌有自动过期机制（默认5分钟）
# 手动清理所有令牌
redis-cli DEL "concurrency:semaphore:global"
redis-cli DEL "concurrency:semaphore:platform:douyin"
```

---

## 📊 架构说明

### 并发控制流程

```
┌─────────────────────────────────────────────────┐
│               Celery Task Queue                  │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐        │
│  │Task 1│  │Task 2│  │Task 3│  │Task 4│  ...   │
│  └──────┘  └──────┘  └──────┘  └──────┘        │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│          Concurrency Controller (Redis)          │
│                                                   │
│  ┌─────────────────────────────────────────┐    │
│  │  Global Semaphore (max=10)              │    │
│  │  ├─ Token 1 (expire: 1735000000)        │    │
│  │  ├─ Token 2 (expire: 1735000001)        │    │
│  │  └─ Token 3 (expire: 1735000002)  [7/10]│    │
│  └─────────────────────────────────────────┘    │
│                                                   │
│  ┌─────────────────────────────────────────┐    │
│  │  Platform Semaphore: douyin (max=5)     │    │
│  │  ├─ Token 1                              │    │
│  │  └─ Token 2                        [2/5]│    │
│  └─────────────────────────────────────────┘    │
│                                                   │
│  ┌─────────────────────────────────────────┐    │
│  │  Account Semaphore: acc123 (max=1)      │    │
│  │  └─ Token 1                        [1/1]│    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│                  Worker Execution                │
│  ┌──────────────────────────────────────────┐   │
│  │ ✅ Acquired tokens → Execute Task        │   │
│  │ ❌ Failed to acquire → Wait & Retry      │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### Redis 数据结构

```
# 配置
concurrency:config → JSON string

# 信号量（Sorted Set, score = 过期时间戳）
concurrency:semaphore:global → {token1: 1735000000, token2: 1735000001}
concurrency:semaphore:platform:douyin → {token1: 1735000000}
concurrency:semaphore:account:acc123 → {token1: 1735000000}
concurrency:semaphore:task_type:publish → {token1: 1735000000}

# 统计（Hash）
concurrency:stats:counters → {
  "acquired:total": 1000,
  "released:total": 995,
  "acquired:platform:douyin": 500
}
```

---

## 🎉 总结

### 核心优势

1. **动态控制** - 无需重启即可调整并发策略
2. **多维限流** - 全局/平台/账号/任务类型四层控制
3. **分布式** - 基于 Redis，支持多 Worker 共享
4. **智能等待** - 自动等待和重试机制
5. **监控完善** - 实时使用情况和历史统计

### 最佳实践

✅ **账号级并发设为1** - 防止同账号冲突
✅ **平台级分开控制** - 不同平台不同策略
✅ **监控调整** - 根据实际情况动态调整
✅ **设置合理超时** - 防止任务长时间占用令牌
✅ **定期查看统计** - 优化并发配置

---

## 📞 支持

遇到问题？

- 📖 查看 [CELERY_MIGRATION.md](./CELERY_MIGRATION.md)
- 🔍 检查 [故障排查](#故障排查) 章节
- 📊 使用 `/api/v1/concurrency/usage` 监控实时状态
