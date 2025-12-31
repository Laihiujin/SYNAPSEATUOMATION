# OpenManus 工具导入与初始化修复

## 问题描述

在运行时遇到两个问题:

1. **导入错误**:
```
ERROR | fastapi_app.api.v1.agent.router:stream_manus_execution:416 - Stream failed: No module named 'app.tool'
```

2. **初始化时机不当**: Agent 在首次请求时才初始化,导致首个请求延迟高,且可能重复初始化。

## 根本原因

### 问题1: 导入时机太早
`manus_tools_extended.py` 在**模块加载时**就尝试导入 OpenManus 的 `app.tool.base`,但此时 OpenManus 还没有初始化。

### 问题2: 初始化时机不对
`get_manus_agent()` 采用懒加载,在**首次调用时**才初始化,而不是在应用启动时。这导致:
- 首个请求响应慢
- 每次重启后都有延迟
- 可能多次触发初始化逻辑

## 解决方案

### 1. 延迟导入扩展工具

在 `manus_agent.py` 中,将扩展工具的导入**延迟到 Agent 初始化之后**:

```python
# ❌ 移除顶部导入
# from .manus_tools_extended import (...)

# ✅ 在 initialize() 方法中,创建 Agent 之后再导入
async def initialize(self):
    # ...
    self._agent = await Manus.create()

    # 现在导入扩展工具 - OpenManus 已准备好
    from .manus_tools_extended import (
        MediaCrawlerTool,
        WechatChannelsCrawlerTool,
        ...
    )
    # ...
```

### 2. 应用启动时预初始化 Agent ✨ NEW!

在 `main.py` 的 `startup_event` 中,**应用启动时就初始化 Agent**:

```python
@app.on_event("startup")
async def startup_event():
    # ...现有的初始化代码...

    # ✅ 初始化 OpenManus Agent（应用启动时预加载）
    try:
        from fastapi_app.agent.manus_agent import get_manus_agent
        agent = await get_manus_agent()
        app.state.manus_agent = agent
        logger.info("✅ OpenManus Agent 初始化成功")
    except Exception as e:
        logger.warning(f"OpenManus Agent 初始化失败（可选功能）: {e}")
```

### 3. 应用关闭时清理资源 ✨ NEW!

在 `shutdown_event` 中添加 Agent 清理:

```python
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("应用正在关闭...")

    # ✅ 清理 OpenManus Agent
    try:
        if hasattr(app.state, 'manus_agent'):
            await app.state.manus_agent.cleanup()
            logger.info("OpenManus Agent 已清理")
    except Exception as e:
        logger.warning(f"OpenManus Agent 清理失败: {e}")
    # ...其他清理代码...
```

## 新的初始化时序

```
FastAPI 应用启动
    ↓
main.py startup_event 执行
    ├─ 初始化数据库
    ├─ 初始化任务队列
    ├─ 初始化 AI 服务
    ├─ 启动定时同步
    └─ ✅ 初始化 OpenManus Agent (NEW!)
        ├─ ManusAgentWrapper.initialize()
        ├─ 加载 OpenManus Config
        ├─ 创建 Manus Agent
        ├─ 导入扩展工具 (延迟导入)
        ├─ 注册所有 33 个工具
        └─ Agent 就绪 ✅
    ↓
应用就绪,等待请求
    ↓
用户请求 → get_manus_agent()
    ├─ 返回已初始化的实例 ✅ (无需重新初始化)
    └─ 处理用户请求 🚀
    ↓
应用关闭 → shutdown_event
    └─ Agent.cleanup() ✅
```

## 对比: 修复前 vs 修复后

| 特性 | 修复前 ❌ | 修复后 ✅ |
|------|----------|----------|
| 初始化时机 | 首次请求时 | 应用启动时 |
| 首个请求延迟 | 高(需初始化) | 低(已就绪) |
| 后续请求延迟 | 低 | 低 |
| 资源管理 | 无清理 | 规范清理 |
| 重复初始化风险 | 存在 | 无 |
| 扩展工具导入 | 模块加载时(太早) | Agent 初始化后 |

## 修复文件

1. **[main.py](../syn_backend/fastapi_app/main.py#L242-L249)** - 启动时初始化 Agent
2. **[main.py](../syn_backend/fastapi_app/main.py#L257-L263)** - 关闭时清理 Agent
3. **[manus_agent.py](../syn_backend/fastapi_app/agent/manus_agent.py#L219-L229)** - 延迟导入扩展工具
4. **[manus_agent.py](../syn_backend/fastapi_app/agent/manus_agent.py#L389-L402)** - 更新 get_manus_agent() 文档

## 验证步骤

修复后,按以下步骤验证:

### 1. 启动后端
```bash
cd syn_backend
python -m fastapi_app.run
```

查看日志,应该看到:
```
✅ OpenManus Agent 初始化成功
工具数量: 33
```

### 2. 首次请求
使用 AI Agent 功能,首次请求应该**立即响应**,无延迟。

### 3. 后续请求
所有请求都使用同一个 Agent 实例,快速响应。

### 4. 应用关闭
停止后端(Ctrl+C),日志应显示:
```
OpenManus Agent 已清理
```

## 技术细节

### 单例模式
`get_manus_agent()` 使用全局变量 `_manus_agent_instance` 实现单例:

```python
_manus_agent_instance: Optional[ManusAgentWrapper] = None

async def get_manus_agent() -> ManusAgentWrapper:
    global _manus_agent_instance

    if _manus_agent_instance is None:
        _manus_agent_instance = ManusAgentWrapper()
        await _manus_agent_instance.initialize()

    return _manus_agent_instance
```

### 应用状态存储
初始化后的 Agent 也存储在 `app.state` 中:
```python
app.state.manus_agent = agent
```

这样可以:
- 在 shutdown 时访问并清理
- 提供备用访问路径

## 优势总结

✅ **性能优化**: 应用启动时一次性初始化,所有请求响应都快
✅ **资源管理**: 启动时创建,关闭时清理,生命周期规范
✅ **单例保证**: 全局共享一个实例,避免重复创建
✅ **导入安全**: 扩展工具在 OpenManus 就绪后才导入
✅ **用户体验**: 首次请求无延迟,即开即用

---

**修复时间**: 2025-03-07
**修复人**: Claude Sonnet 4.5
**问题发现**: 用户反馈初始化时机不对
**影响范围**: 所有使用 OpenManus Agent 的 API 端点
