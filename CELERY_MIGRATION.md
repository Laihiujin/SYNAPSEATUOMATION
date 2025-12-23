# 任务队列迁移指南

## 📋 变更摘要

已将任务队列从**内存队列（PriorityQueue）**迁移至 **Celery + Redis**，实现任务持久化和分布式部署支持。

---

## ✅ 迁移内容

### 1. **任务执行层**
- ✅ 创建 `fastapi_app/tasks/publish_tasks.py` - Celery 任务定义
  - `publish_single_task` - 单个发布任务
  - `publish_batch_task` - 批量发布任务
  - 自动处理失败任务转入人工库

### 2. **状态管理层**
- ✅ 创建 `fastapi_app/tasks/task_state_manager.py` - Redis 任务状态管理
  - 任务状态持久化（7天过期）
  - 支持按状态/类型查询
  - 支持任务取消和删除

### 3. **服务层更新**
- ✅ `myUtils/batch_publish_service.py`
  - 移除对 `TaskQueueManager` 的硬依赖
  - 使用 Celery 提交任务
  - 保留 `handle_single_publish` 供 Celery 任务调用

- ✅ `fastapi_app/api/v1/publish/services.py`
  - 移除 `task_manager` 依赖
  - 使用 Celery 提交发布任务

- ✅ `fastapi_app/api/v1/publish/router.py`
  - 移除 `get_task_mgr` 依赖注入
  - 简化 `get_service` 函数

### 4. **启动流程更新**
- ✅ `fastapi_app/main.py`
  - 移除旧任务队列初始化
  - 保留 `BatchPublishService` 初始化（用于 Celery 调用）

---

## 🚀 启动步骤

### 1. **启动 Redis**

```bash
# Windows
redis-server

# Linux/macOS
redis-server
```

### 2. **配置环境变量**

在 `.env` 文件中确保配置：

```env
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=  # 默认使用 REDIS_URL
CELERY_RESULT_BACKEND=  # 默认使用 REDIS_URL
```

### 3. **启动 Celery Worker**

```bash
# Windows
start_celery_worker.bat

# Linux/macOS
chmod +x start_celery_worker.sh
./start_celery_worker.sh
```

### 4. **启动 FastAPI 服务**

```bash
cd syn_backend
python -m fastapi_app.run
```

---

## 📊 任务状态查询

### 通过 Redis CLI 查询

```bash
# 查看所有任务键
redis-cli KEYS "celery:task:*"

# 查看 pending 任务数
redis-cli ZCARD "celery:index:status:pending"

# 查看某个任务详情
redis-cli GET "celery:task:<task_id>"
```

### 通过 Python API

```python
from fastapi_app.tasks.task_state_manager import task_state_manager

# 获取任务状态
task = task_state_manager.get_task_state(task_id)

# 列出 pending 任务
tasks = task_state_manager.list_tasks(status="pending", limit=10)

# 获取队列统计
stats = task_state_manager.get_queue_stats()
# {'pending': 5, 'running': 2, 'success': 10, 'failed': 1}
```

---

## 🔄 向后兼容性

### 保留的兼容代码

以下组件保留 `task_manager` 参数用于向后兼容（会输出警告）：

- `BatchPublishService.__init__(task_manager=None)`
- `PublishService.__init__(task_manager=None)`
- `get_batch_publish_service(task_manager=None)`
- `get_publish_service(task_manager=None)`

### 废弃的组件

- `myUtils/task_queue_manager.py` - 旧的内存任务队列（保留但不再使用）
- `Task`, `TaskType`, `TaskStatus` 类 - 已被 Celery 任务替代

---

## 🎯 任务优先级

Celery 支持优先级队列（0-9，数字越小优先级越高）：

```python
# 高优先级任务
publish_single_task.apply_async(kwargs={'task_data': data}, priority=0)

# 低优先级任务
publish_single_task.apply_async(kwargs={'task_data': data}, priority=9)
```

---

## 🐛 故障排查

### 1. **任务一直处于 pending 状态**

检查 Celery Worker 是否启动：

```bash
# 查看 Worker 状态
celery -A fastapi_app.tasks.celery_app inspect active
```

### 2. **Redis 连接失败**

检查 Redis 服务：

```bash
redis-cli ping
# 应返回 PONG
```

### 3. **任务执行失败但无错误日志**

查看 Celery Worker 日志：

```bash
# Celery Worker 会输出详细的任务执行日志
```

---

## 📈 监控和管理

### 使用 Flower 监控 Celery

```bash
# 安装 Flower
pip install flower

# 启动 Flower Web 界面
celery -A fastapi_app.tasks.celery_app flower

# 访问 http://localhost:5555
```

### 使用 Redis Commander 查看 Redis

```bash
# 安装 Redis Commander
npm install -g redis-commander

# 启动
redis-commander

# 访问 http://localhost:8081
```

---

## ⚠️ 注意事项

1. **服务重启恢复**
   - 任务状态保存在 Redis（7天过期）
   - Celery 任务在 Broker（Redis）中持久化
   - 服务重启后任务会自动恢复执行

2. **并发控制**
   - Celery Worker 默认并发数：3
   - 可通过 `--concurrency=N` 调整

3. **任务超时**
   - Celery 默认无超时限制
   - 可在任务定义中设置 `time_limit` 和 `soft_time_limit`

4. **Windows 平台注意**
   - 必须使用 `--pool=solo` 避免多进程问题
   - 或使用 `gevent` pool：`pip install gevent`

---

## 📝 后续优化建议

1. **任务重试策略**
   - 当前禁用自动重试，失败任务转人工处理
   - 可配置特定异常的重试策略

2. **任务结果清理**
   - 当前结果保存7天
   - 可实现定时清理脚本

3. **分布式部署**
   - 可启动多个 Worker 提高并发
   - 支持跨机器部署

4. **监控告警**
   - 集成 Prometheus + Grafana
   - 任务失败率告警

---

## 🎉 迁移完成

**核心收益**：

✅ 任务持久化 - 服务重启不丢失任务
✅ 分布式支持 - 可水平扩展 Worker
✅ 任务监控 - Redis + Flower 实时监控
✅ 状态追踪 - 任务全生命周期管理

**测试清单**：

- [ ] 单个发布任务提交和执行
- [ ] 批量发布任务提交和执行
- [ ] 任务失败后转入人工库
- [ ] 服务重启后任务恢复
- [ ] 任务状态查询
