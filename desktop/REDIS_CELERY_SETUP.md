# Redis + Celery 集成说明

## 架构更新

SynapseAutomation 现在支持 **Redis** 缓存和 **Celery** 分布式任务队列，提供更强大的任务调度和性能优化。

## 功能特性

### Redis 缓存
- **用途**：高性能缓存、会话存储、任务队列持久化
- **默认端口**：6379
- **启动模式**：可选（默认启用）
- **配置**：`REDIS_URL=redis://localhost:6379/0`

### Celery 任务队列
- **用途**：异步任务处理、后台任务调度
- **Broker**：使用 Redis 作为消息代理
- **Backend**：使用 Redis 存储任务结果
- **Worker Pool**：Windows 使用 `--pool=solo` 模式

## 启动顺序

Electron 桌面应用启动服务的顺序：

```
1. 初始化环境 (init)
2. 启动 Redis (redis) - 如果启用
3. 启动 MySQL (mysql) - 如果启用
4. 启动 Playwright Worker (worker)
5. 启动 Celery Worker (celery) - 如果 Redis 可用
6. 启动 FastAPI 后端 (backend)
7. 启动 Next.js 前端 (frontend)
8. 加载应用界面 (complete)
```

## 环境变量配置

### syn_backend/.env 示例

```bash
# Redis 配置（必需，用于 Celery）
REDIS_URL=redis://localhost:6379/0

# Celery 配置（可选，默认使用 REDIS_URL）
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# 数据库配置（可选）
DATABASE_URL=  # 留空则使用 SQLite

# 其他配置...
```

## Celery 启动参数

在 `desktop/src/main.js` 中，Celery Worker 使用以下参数启动：

```javascript
processes.celery = spawnService({
  name: "celery",
  cmd: pythonCmd,
  args: [
    "-m",
    "celery",
    "-A",
    "fastapi_app.tasks.celery_app",  // Celery app 模块路径
    "worker",
    "--loglevel=info",
    "--pool=solo",  // Windows 兼容模式（不使用 fork）
  ],
  cwd: backendDir,
  env: celeryEnv,
  onLog: emitLog,
});
```

### 关键配置说明

- **`--pool=solo`**：Windows 不支持 `fork()`，必须使用 `solo` 或 `gevent` pool
- **Celery App**：位于 `syn_backend/fastapi_app/tasks/celery_app.py`
- **任务定义**：位于 `syn_backend/fastapi_app/tasks/publish_tasks.py`

## 手动启动 Celery（开发模式）

如果需要在开发环境中手动启动 Celery Worker：

### Windows (PowerShell)

```powershell
cd syn_backend
$env:REDIS_URL="redis://localhost:6379/0"
python -m celery -A fastapi_app.tasks.celery_app worker --loglevel=info --pool=solo
```

### Linux / macOS

```bash
cd syn_backend
export REDIS_URL=redis://localhost:6379/0
celery -A fastapi_app.tasks.celery_app worker --loglevel=info
```

## 任务示例

### 定义异步任务

在 `syn_backend/fastapi_app/tasks/publish_tasks.py` 中：

```python
from fastapi_app.tasks.celery_app import celery_app

@celery_app.task(bind=True)
def process_video_upload(self, video_id: str):
    """异步处理视频上传任务"""
    try:
        # 处理逻辑
        return {"status": "completed", "video_id": video_id}
    except Exception as e:
        self.retry(exc=e, countdown=60, max_retries=3)
```

### 在 FastAPI 中触发任务

```python
from fastapi import APIRouter
from fastapi_app.tasks.publish_tasks import process_video_upload

router = APIRouter()

@router.post("/videos/upload")
async def upload_video(video_id: str):
    # 异步触发任务
    task = process_video_upload.delay(video_id)
    return {"task_id": task.id, "status": "pending"}
```

### 查询任务状态

```python
from celery.result import AsyncResult

@router.get("/tasks/{task_id}")
async def get_task_status(task_id: str):
    task = AsyncResult(task_id)
    return {
        "task_id": task_id,
        "status": task.status,
        "result": task.result if task.ready() else None
    }
```

## 监控工具

### Flower（Celery 监控工具）

安装 Flower：

```bash
pip install flower
```

启动 Flower Web 界面：

```bash
celery -A fastapi_app.tasks.celery_app flower --port=5555
```

访问：http://localhost:5555

### Redis CLI

检查 Redis 连接：

```bash
redis-cli -h 127.0.0.1 -p 6379
> PING
PONG
> KEYS celery*
> EXIT
```

## 打包说明

### 内置 Redis 服务器（可选）

如果需要在安装包中内置 Redis：

1. 下载 Redis for Windows：https://github.com/microsoftarchive/redis/releases
2. 解压到 `desktop/resources-source/redis/`
3. 运行 `npm run prepare:resources`

目录结构：

```
desktop/
├── resources-source/
│   └── redis/
│       ├── redis-server.exe
│       ├── redis-cli.exe
│       └── redis.conf
```

### Celery 依赖打包

Celery 已包含在 `syn_backend/requirements.txt` 中：

```
redis==5.0.8
celery==5.4.0
```

安装包会自动包含这些依赖。

## 故障排除

### 问题 1：Celery Worker 无法启动

**症状**：日志显示 "No module named 'celery'"

**解决方案**：
```bash
cd syn_backend
pip install -r requirements.txt
```

### 问题 2：Redis 连接失败

**症状**：`redis.exceptions.ConnectionError`

**解决方案**：
1. 检查 Redis 是否启动：`redis-cli ping`
2. 检查端口占用：`netstat -ano | findstr 6379`
3. 修改 `.env` 中的 `REDIS_URL`

### 问题 3：Celery 在 Windows 上报错

**症状**：`billiard.exceptions.WorkerLostError`

**解决方案**：
必须使用 `--pool=solo` 参数（已在 main.js 中配置）：
```bash
celery -A fastapi_app.tasks.celery_app worker --pool=solo
```

### 问题 4：任务一直 Pending

**症状**：任务状态始终为 PENDING

**可能原因**：
1. Celery Worker 未启动
2. Redis 连接失败
3. 任务名称不匹配

**检查步骤**：
```bash
# 检查 Celery Worker 日志
# 确认是否看到 "celery@hostname ready"
```

## 性能优化

### 并发配置

默认使用单线程 `--pool=solo`，如需提高并发：

**Windows（使用 gevent）**：
```bash
pip install gevent
celery -A fastapi_app.tasks.celery_app worker --pool=gevent --concurrency=10
```

**Linux/macOS（使用 prefork）**：
```bash
celery -A fastapi_app.tasks.celery_app worker --concurrency=4
```

### Redis 内存优化

在 `redis.conf` 中设置最大内存：

```
maxmemory 256mb
maxmemory-policy allkeys-lru
```

## 参考文档

- [Celery 官方文档](https://docs.celeryproject.org/)
- [Redis 官方文档](https://redis.io/documentation)
- [Flower 监控工具](https://flower.readthedocs.io/)
- [Windows Redis](https://github.com/microsoftarchive/redis)

## 迁移指南

### 从内存队列迁移到 Celery

**之前（内存队列）**：
```python
from fastapi_app.tasks.queue import task_queue

@app.post("/process")
async def process_task(data: dict):
    task_queue.put(data)
    return {"status": "queued"}
```

**现在（Celery）**：
```python
from fastapi_app.tasks.publish_tasks import process_task

@app.post("/process")
async def process_task(data: dict):
    task = process_task.delay(data)
    return {"task_id": task.id, "status": "pending"}
```

### 优势对比

| 特性 | 内存队列 | Celery + Redis |
|------|----------|----------------|
| 持久化 | ❌ 服务重启丢失 | ✅ 任务持久化 |
| 分布式 | ❌ 单机限制 | ✅ 多机部署 |
| 监控 | ❌ 无监控工具 | ✅ Flower 监控 |
| 重试机制 | ⚠️ 需手动实现 | ✅ 内置重试 |
| 定时任务 | ❌ 不支持 | ✅ Celery Beat |
| 并发控制 | ⚠️ 线程池限制 | ✅ 灵活配置 |

---

**文档更新时间**：2025-12-22
**版本**：SynapseAutomation v0.1.0
