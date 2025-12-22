# OpenManus 配置和使用指南

## 目录
1. [概述](#概述)
2. [快速开始](#快速开始)
3. [配置步骤](#配置步骤)
4. [推荐配置](#推荐配置)
5. [API 文档](#api-文档)
6. [故障排查](#故障排查)

## 概述

OpenManus 是集成到 SynapseAutomation 的底层智能体，负责处理复杂的工具调用和任务编排。它与主 AI 助手分离，使用独立的 LLM 配置。

### 架构设计

```
用户请求
  ↓
AI 助手 (/ai/chat) - 使用主 AI 配置
  ↓
检测需要工具调用
  ↓
触发 【MANUS_TASK】
  ↓
OpenManus Agent - 使用独立 LLM 配置
  ↓
自动调用工具并返回结果
```

## 快速开始

### 1. 获取 API 密钥

根据选择的 Provider，获取对应的 API Key：

- **硅基流动 (SiliconFlow)**: https://siliconflow.cn
- **火山引擎**: https://www.volcengine.com
- **通义千问**: https://dashscope.aliyun.com
- **OpenAI**: https://platform.openai.com
- **Anthropic**: https://console.anthropic.com

### 2. 配置 OpenManus

通过前端 UI 或 API 配置 OpenManus：

**前端配置**:
1. 进入 `设置` → `AI 配置` → `OpenManus Agent 配置`
2. 选择 Provider
3. 输入 API Key
4. 选择模型
5. 点击 "测试连接"
6. 确认后点击 "保存配置"

**API 配置**:
```bash
curl -X POST "http://localhost:8000/api/v1/agent/config/manus" \\
  -H "Content-Type: application/json" \\
  -d '{
    "llm": {
      "provider": "siliconflow",
      "api_key": "sk-your-api-key",
      "model": "Qwen/QwQ-32B",
      "max_tokens": 16384,
      "temperature": 0.6
    }
  }'
```

### 3. 测试配置

```bash
curl -X POST "http://localhost:8000/api/v1/agent/config/manus/test"
```

成功响应:
```json
{
  "success": true,
  "data": {
    "status": "success",
    "message": "OpenManus 配置有效，连接测试成功",
    "provider": "siliconflow",
    "model": "Qwen/QwQ-32B"
  }
}
```

## 配置步骤

### 完整配置示例

#### 硅基流动配置

```toml
# OpenManus-worker/config/config.toml

[llm]
provider = "siliconflow"
model = "Qwen/QwQ-32B"
base_url = "https://api.siliconflow.cn/v1"
api_key = "sk-your-api-key"
max_tokens = 16384
temperature = 0.6

# 可选：Vision 模型配置
[llm.vision]
model = "Qwen/Qwen2-VL-72B-Instruct"
base_url = "https://api.siliconflow.cn/v1"
api_key = "sk-your-api-key"  # 可与 LLM 共用
```

#### 火山引擎配置

```toml
[llm]
provider = "volcanoengine"
model = "doubao-pro"
base_url = "https://api.volcanoengine.com/v1"
api_key = "your-volcano-api-key"
max_tokens = 16384
temperature = 0.6
```

#### 通义千问配置

```toml
[llm]
provider = "tongyi"
model = "qwen-max"
base_url = "https://dashscope.aliyuncs.com/api/v1"
api_key = "your-tongyi-api-key"
max_tokens = 16384
temperature = 0.6

[llm.vision]
model = "qwen-vl-max"
base_url = "https://dashscope.aliyuncs.com/api/v1"
api_key = "your-tongyi-api-key"
```

## 推荐配置

### 按 Provider 分类

#### 1. 硅基流动 (SiliconFlow)

**推荐理由**: 国内访问快速，价格实惠，支持多种开源模型

| 模型 | 场景 | 特点 |
|------|------|------|
| `Qwen/QwQ-32B` | 复杂推理 | 高性能，支持复杂任务编排 |
| `deepseek-ai/DeepSeek-V3` | 通用任务 | 平衡性能和速度 |
| `Qwen/Qwen2.5-72B-Instruct` | 通用对话 | 综合能力强 |
| `Qwen/Qwen2-VL-72B-Instruct` | 视觉理解 | Vision 模型 |

#### 2. 火山引擎 (VolcanoEngine)

**推荐理由**: 字节跳动提供，稳定可靠

| 模型 | 场景 |
|------|------|
| `doubao-pro` | 高性能任务 |
| `doubao-lite` | 快速响应 |

#### 3. 通义千问 (Tongyi)

**推荐理由**: 阿里云提供，企业级支持

| 模型 | 场景 |
|------|------|
| `qwen-max` | 最强性能 |
| `qwen-plus` | 平衡选择 |
| `qwen-turbo` | 快速响应 |
| `qwen-vl-max` | 视觉理解 |

### 性能对比

| Provider | 速度 | 成本 | 稳定性 | Function Calling |
|----------|------|------|--------|------------------|
| 硅基流动 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ |
| 火山引擎 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ |
| 通义千问 | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ |
| OpenAI | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ |
| Anthropic | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ |

## API 文档

### 1. 获取支持的 Providers

```http
GET /api/v1/agent/config/providers
```

响应:
```json
{
  "success": true,
  "data": {
    "providers": {
      "siliconflow": {
        "id": "siliconflow",
        "name": "硅基流动 (SiliconFlow)",
        "base_url": "https://api.siliconflow.cn/v1",
        "models": [...],
        "vision_models": [...]
      }
    }
  }
}
```

### 2. 获取当前配置

```http
GET /api/v1/agent/config/manus
```

响应:
```json
{
  "success": true,
  "data": {
    "provider": "siliconflow",
    "model": "Qwen/QwQ-32B",
    "base_url": "https://api.siliconflow.cn/v1",
    "max_tokens": 16384,
    "temperature": 0.6,
    "is_configured": true
  }
}
```

### 3. 保存配置

```http
POST /api/v1/agent/config/manus
Content-Type: application/json

{
  "llm": {
    "provider": "siliconflow",
    "api_key": "sk-your-api-key",
    "model": "Qwen/QwQ-32B",
    "max_tokens": 16384,
    "temperature": 0.6
  },
  "vision": {
    "model": "Qwen/Qwen2-VL-72B-Instruct"
  }
}
```

### 4. 测试配置

```http
POST /api/v1/agent/config/manus/test
```

### 5. 删除配置

```http
DELETE /api/v1/agent/config/manus
```

## 使用示例

### 通过 AI 助手触发 OpenManus

当用户发起复杂任务时，AI 助手会自动触发 OpenManus：

**用户请求**:
```
为所有抖音账号创建一个批量发布计划，每个账号发布3个不同的视频，生成独立标题
```

**AI 助手输出**:
```
【MANUS_TASK】
goal: 为所有抖音账号创建批量发布计划，每个账号分配3个不同的视频素材，为每个视频生成独立的标题、标签和描述，生成完整的 SynapseAutomation DSL JSON 脚本并保存
context:
  platform: douyin
  videos_per_account: 3
  generate_unique_titles: true
  mode: dry-run
【/MANUS_TASK】
```

**OpenManus 执行**:
1. 调用 `get_system_context` 获取账号和素材
2. 调用 `list_accounts` 筛选抖音账号
3. 调用 `list_assets` 获取可用视频
4. 生成发布计划 JSON
5. 调用 `save_script` 保存脚本
6. 返回执行结果

### 直接调用 OpenManus API

```bash
curl -X POST "http://localhost:8000/api/v1/agent/manus-run" \\
  -H "Content-Type: application/json" \\
  -d '{
    "goal": "列出所有可用的抖音账号并为每个账号分配一个视频",
    "context": {
      "platform": "douyin"
    }
  }'
```

## 故障排查

### 1. 配置未找到

**错误信息**:
```
OpenManus LLM 配置未找到，请先在设置页面配置 OpenManus
```

**解决方法**:
- 通过前端 UI 或 API 配置 OpenManus
- 确认配置文件存在: `OpenManus-worker/config/config.toml`

### 2. API Key 无效

**错误信息**:
```
测试失败: Unauthorized
```

**解决方法**:
- 检查 API Key 是否正确
- 确认 Provider 是否选择正确
- 测试 API Key 有效性（通过 Provider 官网）

### 3. 模型不支持 Function Calling

**错误信息**:
```
Model does not support function calling
```

**解决方法**:
- 选择支持 Function Calling 的模型
- 参考推荐配置章节

### 4. 配置文件权限错误

**错误信息**:
```
Permission denied
```

**解决方法**:
```bash
chmod 644 OpenManus-worker/config/config.toml
```

### 5. 工具调用失败

**错误信息**:
```
Tool execution failed
```

**解决方法**:
- 检查后端 API 是否正常运行
- 查看日志: `logs/manus_agent.log`
- 确认工具 URL 配置正确

### 查看日志

```bash
# 查看 OpenManus 日志
tail -f logs/manus_agent.log

# 查看后端日志
tail -f logs/fastapi.log
```

## 高级配置

### 自定义参数

```toml
[llm]
provider = "siliconflow"
model = "Qwen/QwQ-32B"
api_key = "sk-your-api-key"
base_url = "https://api.siliconflow.cn/v1"

# 高级参数
max_tokens = 32768        # 增加最大 Token 数
temperature = 0.3         # 降低温度，提高确定性
top_p = 0.9              # 核采样参数
presence_penalty = 0.1   # 存在惩罚
frequency_penalty = 0.1  # 频率惩罚
```

### 多环境配置

开发环境:
```toml
[llm]
provider = "siliconflow"
model = "Qwen/Qwen2.5-72B-Instruct"  # 使用更便宜的模型
temperature = 0.7
```

生产环境:
```toml
[llm]
provider = "siliconflow"
model = "Qwen/QwQ-32B"  # 使用最强模型
temperature = 0.6
```

## 参考资料

- [OpenManus 官方文档](https://github.com/FoundationAgents/OpenManus)
- [硅基流动文档](https://docs.siliconflow.cn)
- [火山引擎文档](https://www.volcengine.com/docs)
- [通义千问文档](https://help.aliyun.com/zh/dashscope)
- [SynapseAutomation 文档](../README.md)

## 更新日志

### v1.0.0 (2025-01-XX)
- ✅ 支持多 Provider (硅基流动、火山引擎、通义千问、OpenAI、Anthropic)
- ✅ TOML 配置文件管理
- ✅ 配置 CRUD API
- ✅ Vision 模型支持
- ✅ 配置测试功能
- ✅ 独立的 LLM 配置（与主 AI 助手分离）

## 常见问题 (FAQ)

### Q: OpenManus 和主 AI 助手有什么区别？

A:
- **主 AI 助手**: 处理普通对话和问答，使用 `ai_service/config.json` 配置
- **OpenManus**: 处理复杂工具调用和任务编排，使用 `OpenManus-worker/config/config.toml` 配置
- 两者独立配置，互不影响

### Q: 必须配置 Vision 模型吗？

A: 不是必须的。Vision 模型是可选的，只有在需要处理图像相关任务时才需要配置。

### Q: 如何选择合适的模型？

A: 根据任务类型选择：
- **复杂推理**: Qwen/QwQ-32B
- **通用任务**: deepseek-ai/DeepSeek-V3
- **快速响应**: qwen-turbo
- **视觉理解**: Qwen/Qwen2-VL-72B-Instruct

### Q: 配置后需要重启服务吗？

A: 不需要。配置保存后，下次调用 OpenManus 时会自动使用新配置。

### Q: 如何查看 OpenManus 的调用日志？

A: 日志记录在后端日志中，搜索关键词 `[Manus]` 即可。
