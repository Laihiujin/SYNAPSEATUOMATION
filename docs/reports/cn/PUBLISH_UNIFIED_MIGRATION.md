# 发布路由统一迁移文档

## 📅 迁移日期
2025-12-19

## 🎯 迁移目标
**移除 `/publish/direct` 和所有 single/direct 发布路由，统一使用 `/publish/batch` 作为唯一发布入口（包括单次发布）。**

---

## 📊 迁移前后对比

### 旧架构（已弃用）

```
/publish/batch   → 批量发布（多个素材 × 多个账号）
/publish/direct  → 单次发布（绕过素材库，直接传路径）❌ 已删除
```

**问题**：
1. ❌ `/publish/direct` 使用字段名 `file_path`，但 worker 的 `handle_single_publish()` 读取 `video_path`，导致 **字段名不匹配**
2. ❌ `/publish/direct` **没有调用路径解析器**（`resolve_video_file()`），无法处理盘符迁移（D:\ → E:\）
3. ❌ `/publish/direct` **没有平台元数据适配器**（`format_metadata_for_platform()`），标签格式可能不符合平台要求
4. ❌ 两套代码路径增加维护成本，容易引入不一致

### 新架构（统一）

```
/publish/batch   → 统一发布入口（支持单次 + 批量）
```

**优势**：
1. ✅ 统一使用 `video_path` 字段名
2. ✅ 统一调用 `_portable_video_path()` 进行路径解析与迁移处理
3. ✅ 统一使用平台元数据适配器 `format_metadata_for_platform()`
4. ✅ 统一支持从素材库读取 AI 生成的元数据（ai_title、ai_description、ai_tags）
5. ✅ 统一支持间隔控制（`interval_control_enabled` + `not_before`）
6. ✅ 统一的 `batch_id` 追踪，方便批量任务管理
7. ✅ 单一代码路径，减少维护成本

---

## 🔧 代码变更

### 1️⃣ 删除的文件

- ❌ `syn_backend/fastapi_app/api/v1/publish/direct_service.py` （整个文件已删除）

### 2️⃣ 修改的文件

#### `syn_backend/fastapi_app/api/v1/publish/router.py`

**删除**：
- ❌ `DirectPublishRequest` 模型（router.py:41-54）
- ❌ `POST /publish/direct` 路由（router.py:143-184）
- ❌ `from fastapi_app.api.v1.publish.direct_service import enqueue_direct_publish` 导入

**修改**：
- ✅ 更新 `PUBLISH_ROUTER_BUILD_TAG` 为 `@unified-batch-only@2025-12-19`
- ✅ 更新 `/publish/batch` 路由文档，明确说明支持单次发布

#### `syn_backend/myUtils/batch_publish_service.py`

**保留**：
- ✅ `handle_single_publish()` 方法（仍需要处理拆分后的子任务 `TaskType.PUBLISH`）
- ✅ 已兼容两种字段名：`video_path` 和 `file_path`（第48-49行）

---

## 📝 使用示例

### ✅ 单次发布（新方法）

**请求**：
```json
POST /api/v1/publish/batch

{
  "file_ids": [123],
  "accounts": ["account_douyin_xxx"],
  "title": "我的视频标题",
  "topics": ["测试", "抖音"],
  "description": "这是视频描述"
}
```

**响应**：
```json
{
  "success": true,
  "message": "批量任务已创建: 成功 1, 失败 0",
  "data": {
    "batch_id": "batch_abc123def456",
    "total_tasks": 1,
    "success_count": 1,
    "failed_count": 0,
    "pending_count": 1,
    "tasks": [
      {
        "task_id": "publish_batch_abc123def456_123_account_douyin_xxx",
        "file_id": 123,
        "platform": 3,
        "account_id": "account_douyin_xxx",
        "status": "pending"
      }
    ]
  }
}
```

### ✅ 批量发布（多个素材 × 多个账号）

**请求**：
```json
POST /api/v1/publish/batch

{
  "file_ids": [123, 456, 789],
  "accounts": ["account_douyin_1", "account_douyin_2"],
  "platform": 3,
  "title": "统一标题",
  "topics": ["测试", "批量发布"],
  "interval_control_enabled": true,
  "interval_mode": "video_first",
  "interval_seconds": 300
}
```

**结果**：创建 `3个素材 × 2个账号 = 6个` 独立任务，每个任务间隔 5 分钟执行。

### ✅ 多平台发布（不指定 platform）

**请求**：
```json
POST /api/v1/publish/batch

{
  "file_ids": [123],
  "accounts": ["account_douyin_1", "account_ks_1", "account_xhs_1"],
  "title": "跨平台发布",
  "topics": ["测试"]
}
```

**结果**：自动按账号平台分组，创建抖音、快手、小红书 3 个平台的发布任务。

---

## ⚠️ 迁移注意事项

### 1. **字段名统一**
- 所有发布任务统一使用 `video_path` 字段（worker 端已兼容 `file_path` 作为回退）
- 不再支持直接传递 `file_path`（已通过 `_portable_video_path()` 转换）

### 2. **路径解析**
- 所有视频路径都会经过 `resolve_video_file()` 处理
- 自动处理盘符迁移（如 `D:\A.D\SynapseAutomation\...` → `E:\SynapseAutomation\...`）
- 如果绝对路径失效，会使用 `basename` 让 worker 端在 `syn_backend/videoFile/` 下查找

### 3. **元数据适配**
- 所有标题、描述、标签都会经过平台适配器 `format_metadata_for_platform()` 处理
- 自动去除重复标签、限制标签数量（如抖音最多3个）

### 4. **素材库集成**
- 优先使用素材库中的 AI 生成元数据（`ai_title`、`ai_description`、`ai_tags`）
- 如果请求参数未提供标题/描述/标签，自动从素材库回退

---

## 🔍 single vs batch 核心差异（已修复）

| 对比项 | ❌ Direct/Single 发布（已删除） | ✅ Batch 发布（统一入口） |
|--------|----------------------------------|---------------------------|
| **视频路径字段** | `file_path` ❌ | `video_path` ✅ |
| **路径解析** | ❌ 无路径解析 | ✅ `_portable_video_path()` |
| **元数据来源** | 仅使用传入参数 | ✅ 素材库 + 请求参数 |
| **元数据格式化** | ❌ 无平台适配 | ✅ `format_metadata_for_platform()` |
| **间隔控制** | ❌ 不支持 | ✅ 支持 `interval_control_enabled` |
| **批量追踪** | ❌ 无 `batch_id` | ✅ 统一 `batch_id` |
| **独立素材配置** | ❌ 不支持 | ✅ 支持 `items` 参数 |

---

## ✅ 验证步骤

### 1. 测试单次发布
```bash
curl -X POST "http://localhost:8080/api/v1/publish/batch" \
  -H "Content-Type: application/json" \
  -d '{
    "file_ids": [1],
    "accounts": ["account_douyin_test"],
    "title": "测试单次发布",
    "topics": ["测试"]
  }'
```

### 2. 检查路由
```bash
# 确认 /publish/direct 已不存在
curl -X POST "http://localhost:8080/api/v1/publish/direct"
# 期望返回: 404 Not Found
```

### 3. 检查构建标识
```bash
# 查看日志确认新版本
grep "unified-batch-only@2025-12-19" logs/app.log
```

---

## 📚 相关文件

- ✅ 新版统一路由: `syn_backend/fastapi_app/api/v1/publish/router.py`
- ✅ 批量发布服务: `syn_backend/fastapi_app/api/v1/publish/services.py`
- ✅ Worker 处理器: `syn_backend/myUtils/batch_publish_service.py`
- ✅ 路径解析工具: `syn_backend/platforms/path_utils.py`
- ✅ 平台适配器: `syn_backend/myUtils/platform_metadata_adapter.py`
- ❌ 已删除: `syn_backend/fastapi_app/api/v1/publish/direct_service.py`

---

## 🎉 总结

本次迁移采用**完全统一策略**：

### ✅ 核心成果
1. ✅ 移除了所有 single/direct 发布路由
2. ✅ 统一使用 `/publish/batch` 作为唯一入口
3. ✅ 修复了路径解析问题（字段名不匹配、缺少路径迁移处理）
4. ✅ 统一了元数据处理流程（平台适配器、AI元数据回退）
5. ✅ 保留了 `handle_single_publish()` 处理器（用于拆分后的子任务）

### ✅ 迁移原则
- ✅ 单一入口，减少维护成本
- ✅ 向后兼容（worker 端兼容 `file_path` 字段）
- ✅ 功能完整性（batch 包含所有 direct 的功能）
- ✅ 代码可维护性（统一代码路径）

---

**最后更新**: 2025-12-19
**构建标识**: `router.py@unified-batch-only@2025-12-19`
