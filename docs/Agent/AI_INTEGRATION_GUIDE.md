# AI 功能集成指南

## 概述

项目已集成多平台 AI 功能，支持以下 AI 服务提供商：

- **硅基流动** (SiliconFlow) - 通义千问、Llama、DeepSeek 等开源模型
- **火山引擎** (VolcanoEngine) - 豆包 Pro/Lite 系列模型
- **通义万象** (Tongyi) - 阿里云通义千问系列
- **LangGraph 脚本助手**（新）：可直接从浏览器调用后端脚本。

## 前端 AI 聊天界面

### 位置
右下角浮窗按钮，点击展开 AI 助手对话框

### LangGraph 脚本助手
- 页面：`/ai-agent`
- 能力：与“小轴”对话，列出/执行 `syn_backend/scripts/` 下的 Python 脚本（需显式确认）
- 使用步骤：
  1. 点击“模型设置”，填入 OpenAI 兼容的 `endpoint/api_key/model`
  2. 发送指令（示例：“列出脚本”、“运行 daily_maintenance.py”）
  3. 对工具调用点“允许执行”后才会运行脚本
  4. 结果以工具消息返回（stdout/stderr/returncode/duration）

### 功能特性

#### 1. 多轮对话
- 支持上下文记忆的多轮对话
- 自动滚动到最新消息
- 实时加载状态显示

#### 2. AI 提供商管理
- **切换提供商**：在设置中选择可用的 AI 提供商
- **切换模型**：根据选中的提供商切换可用模型
- **添加新提供商**：支持动态添加新的 AI 服务提供商

#### 3. 健康检查
- 检查所有已配置提供商的连接状态
- 显示实时的可用性状态

### 如何使用

#### 第一步：配置 AI 提供商
1. 点击 AI 聊天窗口右上角的 ⚙️ 设置按钮
2. 在"添加新提供商"中选择提供商类型
3. 输入对应的 API Key
4. 点击"添加"按钮

获取 API Key：
- **硅基流动**: https://cloud.siliconflow.cn/
- **火山引擎**: https://www.volcengine.com/
- **通义万象**: https://dashscope.aliyuncs.com/

#### 第二步：选择模型
1. 点击"选择提供商"下拉菜单，选择已配置的提供商
2. 点击"选择模型"下拉菜单，选择该提供商下的模型
3. 选中的模型会自动保存

#### 第三步：开始对话
1. 在输入框输入你的问题
2. 按 Enter 或点击发送按钮
3. 等待 AI 生成回复

#### 第四步：调用后端脚本（可选）
- 说“列出可用脚本”获取列表
- 说“运行 fetch_douyin_analytics.py，参数 --help”（小轴会请求确认后执行）

## 后端 API 接口 (FastAPI)

**基础路径**: `/api/v1/ai`

### 聊天接口
**POST** `/api/v1/ai/chat`

请求体：
```json
{
  "message": "你的问题",
  "context": [
    {"role": "user", "content": "上一个问题"},
    {"role": "assistant", "content": "上一个回答"}
  ],
  "role": "default"
}
```

响应：
```json
{
  "status": "success",
  "content": "AI 的回复",
  "model": "当前使用的模型",
  "provider": "当前使用的提供商",
  "execution_time": 1.23,
  "tokens": {"total_tokens": 100}
}
```

### 脚本管理接口

#### 列出脚本
**GET** `/api/v1/ai/scripts/list`

响应：
```json
{
  "status": "success",
  "scripts": [
    {
      "name": "daily_maintenance.py",
      "path": "scripts/maintenance/daily_maintenance.py",
      "description": "每日维护任务",
      "category": "maintenance"
    }
  ],
  "total": 1
}
```

#### 运行脚本
**POST** `/api/v1/ai/scripts/run`

请求：
```json
{
  "name": "fetch_douyin_analytics.py",
  "args": ["--help"]
}
```

响应：
```json
{
  "status": "success",
  "result": {
    "script": "fetch_douyin_analytics.py",
    "returncode": 0,
    "stdout": "...",
    "stderr": "",
    "duration": 1.23,
    "args": ["--help"]
  }
}
```

#### 获取脚本信息
**GET** `/api/v1/ai/scripts/info/{script_name}`

响应：
```json
{
  "status": "success",
  "script": {
    "name": "daily_maintenance.py",
    "path": "scripts/maintenance/daily_maintenance.py",
    "size": 1024,
    "modified": 1234567890.0,
    "description": "每日维护任务脚本",
    "category": "maintenance",
    "lines": 50
  }
}
```

### 模型列表接口
**GET** `/api/v1/ai/models`

响应：
```json
{
  "status": "success",
  "providers": {
    "siliconflow": {
      "name": "siliconflow",
      "models": [
        {
          "model_id": "Qwen/Qwen2.5-72B-Instruct",
          "name": "通义千问 2.5 72B",
          "provider": "siliconflow",
          "max_tokens": 8192
        }
      ]
    }
  },
  "current_provider": "siliconflow",
  "current_model": "Qwen/Qwen2.5-72B-Instruct"
}
```

### 切换提供商接口
**POST** `/api/v1/ai/switch-provider`

请求体：
```json
{
  "provider": "siliconflow"
}
```

### 切换模型接口
**POST** `/api/v1/ai/switch-model`

请求体：
```json
{
  "model": "Qwen/Qwen2.5-72B-Instruct"
}
```

### 添加提供商接口
**POST** `/api/v1/ai/add-provider`

请求体：
```json
{
  "provider": "siliconflow",
  "api_key": "sk-xxxxxxxxxxxxx"
}
```

### 移除提供商接口
**POST** `/api/v1/ai/remove-provider`

请求体：
```json
{
  "provider": "siliconflow"
}
```

### 获取状态接口
**GET** `/api/v1/ai/status`

响应包含：
- 当前选中的提供商和模型
- 所有提供商的统计信息
- 健康检查结果

### 执行健康检查接口
**POST** `/api/v1/ai/health-check`

检查所有已配置提供商的连接状态

### 获取统计信息接口
**GET** `/api/v1/ai/statistics?provider=siliconflow&model=Qwen/Qwen2.5-72B-Instruct&hours=24`

返回：
```json
{
  "status": "success",
  "statistics": {
    "total_calls": 100,
    "success_calls": 95,
    "failed_calls": 5,
    "success_rate": 95.0,
    "avg_execution_time": 1.23,
    "total_tokens": 10000
  }
}
```

### 获取最近调用记录接口
**GET** `/api/v1/ai/recent-calls?limit=20`

## API 文档

完整的 API 文档可通过 Swagger UI 访问：
- **开发环境**: http://localhost:7000/api/docs
- **ReDoc**: http://localhost:7000/api/redoc

AI 支持识别特殊指令并调用后端脚本执行任务。

### 支持的指令格式
```
[EXEC]script_name(param1, param2)[/EXEC]
```

### 可用脚本

1. **list_accounts()** - 列出所有账号
2. **list_materials()** - 列出所有素材
3. **publish_material(material_id, accounts)** - 发布素材到指定账号
4. **add_account(platform, credentials)** - 添加新账号
5. **delete_account(account_id)** - 删除账号
6. **get_account_info(account_id)** - 获取账号信息

### 使用示例

向 AI 说：
> "帮我发布这个素材到所有快手账号"

AI 会识别需求，调用：
```
[EXEC]publish_material(material_123, account_1,account_2,account_3)[/EXEC]
```

## 日志和监控

### 日志存储位置
所有 AI 调用日志存储在 SQLite 数据库：
```
syn_backend/db/ai_logs.db
```

### 日志表

#### ai_calls 表
记录每次 AI 调用：
- provider: AI 提供商
- model_id: 使用的模型
- instruction: 用户输入
- status: 成功/失败
- response: AI 回复
- execution_time: 执行时间
- tokens_used: token 消耗数
- script_called: 调用的脚本
- script_result: 脚本执行结果

#### ai_health_check 表
记录健康检查结果：
- provider: 提供商
- status: 检查结果
- error: 错误信息

## 配置管理

### 配置文件位置
```
syn_backend/ai_service/config.json
```

### 配置文件格式
```json
{
  "current_provider": "siliconflow",
  "current_model": "Qwen/Qwen2.5-72B-Instruct",
  "providers": {
    "siliconflow": "sk-xxxxxxxxxxxxx",
    "volcanoengine": "ak-xxxxxxxxxxxxx",
    "tongyi": "sk-xxxxxxxxxxxxx"
  }
}
```

## 模型预设

### 硅基流动 (SiliconFlow)
- Qwen/Qwen2.5-72B-Instruct - 通义千问 2.5 72B
- Qwen/Qwen2.5-7B-Instruct - 通义千问 2.5 7B
- meta-llama/Llama-3.1-405B-Instruct - Llama 3.1 405B
- meta-llama/Llama-3.1-70B-Instruct - Llama 3.1 70B
- deepseek-ai/DeepSeek-V3 - DeepSeek V3

### 火山引擎 (VolcanoEngine)
- doubao-pro-32k - 豆包 Pro 32K
- doubao-lite-32k - 豆包 Lite 32K
- doubao-pro-4k - 豆包 Pro 4K

### 通义万象 (Tongyi)
- qwen-turbo - 通义千问 Turbo
- qwen-plus - 通义千问 Plus
- qwen-max - 通义千问 Max

## 故障排除

### 问题：无法连接 AI 服务
**解决方案：**
1. 检查 API Key 是否正确
2. 检查网络连接
3. 点击健康检查按钮查看错误详情
4. 查看浏览器控制台的错误日志

### 问题：AI 模型列表为空
**解决方案：**
1. 确认已添加至少一个提供商
2. 检查提供商配置是否正确
3. 尝试删除该提供商并重新添加


## 最佳实践

1. **API Key 安全**
   - 不要在代码中硬编码 API Key
   - 使用环境变量或配置文件管理
   - 定期轮换 API Key

2. **OCR/视觉模型（可选）**
   - 同样使用环境变量注入密钥，不要写进代码/文档/提交到 git
   - 推荐环境变量：`SILICONFLOW_BASE_URL`、`SILICONFLOW_API_KEY`、`DEEPSEEK_OCR_MODEL`
   - 代码入口：`syn_backend/automation/ocr_client.py`

3. **成本优化**
   - 为不同场景选择合适的模型
   - 监控 token 消耗情况
   - 使用价格低廉的模型处理简单任务

4. **性能优化**
   - 使用较小的模型加快响应速度
   - 缓存常用的查询结果
   - 合理控制对话长度

5. **错误处理**
   - 实现重试机制
   - 提供友好的错误提示
   - 记录详细的错误日志

## 扩展开发

### 添加新的 AI 提供商

1. 创建新的提供商类继承 `BaseProvider`：
```python
class MyAIProvider(BaseProvider):
    @property
    def provider_name(self) -> str:
        return "myai"
    
    # 实现所有必需的方法...
```

2. 在 `providers.py` 中注册：
```python
from my_ai_provider import MyAIProvider
```

3. 在 `ModelManager._init_provider()` 中添加：
```python
elif provider_name == "myai":
    self.providers[provider_name] = MyAIProvider(api_key)
```
