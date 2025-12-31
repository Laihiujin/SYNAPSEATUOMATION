# 账号登录状态监控功能

## 功能概述

这是一个**独立的、非侵入式**的账号登录状态监控系统,通过最原始最简单的方式检测账号是否掉线。

### 核心特性

- ✅ **Playwright Worker集成**: 调用Playwright Worker API,确保与"访问创作者中心"功能一致
- ✅ **快速检测**: 等待1-2秒检测URL变化,快速判断登录状态
- ✅ **高并发检查**: 使用asyncio.gather()并发检查多个账号,提升效率
- ✅ **简单判断逻辑**: HTTP 401状态码判定为掉线,200为在线
- ✅ **独立状态字段**: 使用 `login_status` 字段,不影响现有 `status` 字段
- ✅ **轮询策略**: 每次检查一部分账号,避免一次性检查所有账号
- ✅ **随机间隔**: 3-6小时随机检查间隔,降低系统负载
- ✅ **手动检测**: 前端"未检测"按钮可点击,立即检查单个账号
- ✅ **仅供查看**: 只标识登录状态,不修改账号数据,不影响发布功能

## 架构设计

### 1. 核心模块

#### `syn_backend/myUtils/login_status_checker.py`
**独立的登录状态检查器模块**

- `LoginStatusChecker` 类
  - `check_single_account_login_status()`: 检查单个账号
  - `check_batch_accounts_async()`: 批量检查账号(高并发)
  - `update_login_status()`: 更新数据库中的登录状态
  - `get_next_batch_accounts()`: 获取下一批要检查的账号(轮询策略)

#### `syn_backend/playwright_worker/worker.py`
**Playwright Worker API接口**

新增接口:
```python
@app.post("/creator/check-login-status")
async def check_login_status_batch(req: CheckLoginStatusRequest):
    """
    批量检查账号登录状态（高并发）
    - 如果提供 account_ids，则检查指定账号
    - 如果不提供，则使用轮询策略检查下一批账号
    """
```

**请求参数**:
```json
{
  "account_ids": ["account_1", "account_2"],  // 可选,为空则轮询下一批
  "batch_size": 5  // 可选,默认5
}
```

**响应**:
```json
{
  "success": true,
  "checked": 5,
  "logged_in": 4,
  "session_expired": 1,
  "errors": 0,
  "skipped": 0,
  "message": "检查完成: 在线=4, 掉线=1, 错误=0, 跳过=0",
  "details": [...]
}
```

**平台URL配置**:
```python
PLATFORM_CREATOR_URLS = {
    "douyin": "https://creator.douyin.com/creator-micro/home",
    "xiaohongshu": "https://creator.xiaohongshu.com/new/home",  # 已更新
    "kuaishou": "https://cp.kuaishou.com/profile",
    "channels": "https://channels.weixin.qq.com/platform/home",
    "bilibili": "https://member.bilibili.com/platform/home",
}
```

### 2. 调度集成

#### `syn_backend/myUtils/user_info_sync_scheduler.py`
**集成到现有调度器**

新增方法:
- `check_login_status()`: 执行登录状态检查
- `_reschedule_login_check()`: 重新安排下次检查(随机间隔)
- `_random_login_check_interval()`: 生成30-120分钟随机间隔

**调度逻辑**:
```python
# 首次执行在随机间隔后
initial_interval = random.randint(30, 120)  # 分钟
schedule.every(initial_interval).minutes.do(self.check_login_status).tag('login-status-check')

# 每次执行完后,重新安排下次执行时间(随机30-120分钟)
```

### 3. 数据库变更

#### 新增字段: `login_status`

```sql
ALTER TABLE cookie_accounts ADD COLUMN login_status TEXT DEFAULT 'unknown'
```

**可能的值**:
- `logged_in`: 在线(URL未包含"login")
- `session_expired`: 掉线(URL包含"login")
- `unknown`: 未检测
- `error`: 检查失败

### 4. 后端API更新

#### `syn_backend/fastapi_app/schemas/account.py`
**在 `AccountResponse` 中添加 `login_status` 字段**

```python
class AccountResponse(BaseModel):
    ...
    login_status: Optional[str] = Field(None, description="登录状态(logged_in/session_expired/unknown)")
```

#### `syn_backend/myUtils/cookie_manager.py`
**更新查询以包含 `login_status` 字段**

```python
# list_flat_accounts() 和 get_all_accounts() 已更新
SELECT account_id, platform, platform_code, name, status, cookie_file,
       last_checked, avatar, original_name, note, user_id, login_status
FROM cookie_accounts
```

### 5. 前端显示

#### `syn_frontend_react/src/app/account/page.tsx`
**在账号列表中添加"登录状态"列**

**状态映射**:
```typescript
const loginStatusMap = {
  logged_in: { label: "✓ 在线", variant: "secondary" },
  session_expired: { label: "✗ 掉线", variant: "destructive" },
  skipped: { label: "-", variant: "outline" },
  unknown: { label: "未检测", variant: "outline" },
}
```

**表格列**:
- 新增"登录状态"列,显示带颜色的Badge或Button
- 绿色 = 在线
- 红色 = 掉线
- 灰色 = 未检测 / 跳过
- **未检测状态显示为可点击按钮**,点击后立即检查该账号登录状态

**手动检测功能**:
```typescript
const checkAccountLoginStatus = async (accountId: string) => {
  const response = await fetch(`/api/v1/creator/check-login-status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ account_ids: [accountId] })
  })
  // 检查完成后自动刷新列表
  await refetch()
}
```

**注意**: 前端直接调用 FastAPI 端点，通过 Next.js rewrites 代理到后端（禁止使用 Next.js API Routes）。

## 工作流程

```
1. 调度器启动
   ├─ 随机生成首次检查间隔(3-6小时)
   └─ 安排首次登录状态检查任务

2. 自动执行登录状态检查（调度器触发）
   ├─ 调用 Playwright Worker `/creator/check-login-status` API
   ├─ Worker 内部获取下一批账号(5个)
   ├─ **Worker 内部直接启动浏览器检查（高并发）**:
   │   ├─ 读取账号cookies和平台信息
   │   ├─ 使用 PlaywrightContextFactory 创建浏览器上下文
   │   ├─ 访问创作者中心URL
   │   ├─ 等待1-2秒(随机)
   │   ├─ 检测URL是否包含"login"(包含=掉线, 不包含=在线)
   │   ├─ 更新数据库 login_status 字段
   │   └─ 自动关闭浏览器上下文
   └─ 更新轮询索引

3. 手动检测(用户点击"未检测"按钮)
   ├─ 前端调用 `/api/v1/creator/check-login-status`
   ├─ FastAPI 转发到 Playwright Worker
   ├─ 传入单个账号ID
   ├─ Worker 内部直接检查该账号登录状态
   ├─ 更新数据库 login_status 字段
   └─ 前端自动刷新账号列表

4. 重新调度
   ├─ 取消当前任务
   ├─ 生成新的随机间隔(3-6小时)
   └─ 安排下次检查任务

5. 前端显示
   ├─ API返回账号列表(包含login_status)
   └─ 前端显示"登录状态"列(未检测可点击)
```

## 检查逻辑

### Playwright Worker 内部实现（已优化）

**核心改进**: 登录状态检查完全在 Playwright Worker 内部实现，避免了通过 httpx 回调自身的循环调用。

```python
# Worker 内部直接启动浏览器检查
async def _check_single_account_login_worker(account_id, platform, cookie_file):
    # 1. 读取 cookie 文件
    with open(cookie_file_path, 'r', encoding='utf-8') as f:
        storage_state = json.load(f)

    # 2. 创建浏览器上下文
    factory = PlaywrightContextFactory()
    context = await factory.create_context(
        platform=platform,
        account_id=account_id,
        headless=True,
        storage_state=storage_state,
    )

    page = await context.new_page()

    # 3. 访问创作者中心
    response = await page.goto(creator_url, wait_until="domcontentloaded")

    # 4. 等待1-2秒让页面加载/重定向
    await asyncio.sleep(random.uniform(1, 2))

    # 5. 判断登录状态：检查URL是否包含"login"
    final_url = page.url
    if "login" in final_url.lower():
        login_status = "session_expired"  # 掉线
    else:
        login_status = "logged_in"  # 在线

    # 6. 更新数据库
    cookie_manager.update_login_status(platform, account_id, login_status)

    # 7. 清理资源
    await page.close()
    await context.close()
```

### 高并发策略

```python
# Worker 内部高并发检查所有账号
tasks = [
    _check_single_account_login_worker(
        account_id=acc.get("account_id"),
        platform=acc.get("platform"),
        cookie_file=acc.get("cookie_file"),
    )
    for acc in batch
]

# 并发执行,自动处理异常
results = await asyncio.gather(*tasks, return_exceptions=True)

# 处理结果(包括异常情况)
for i, result in enumerate(results):
    if isinstance(result, Exception):
        # 异常自动标记为 error 状态
        logger.error(f"检查异常: {batch[i]['account_id']} - {result}")
```

### 轮询策略

```python
# 跟踪已检查的账号索引
self.rotation_index = 0

def get_next_batch_accounts(batch_size=5):
    valid_accounts = [acc for acc in all_accounts if acc['status'] == 'valid']

    # 获取下一批
    batch = valid_accounts[rotation_index:rotation_index + batch_size]

    # 更新索引
    rotation_index += batch_size

    # 重置索引(完整轮询一遍后)
    if rotation_index >= len(valid_accounts):
        rotation_index = 0
```

## 使用方法

### 1. 自动运行(已集成到调度器)

系统启动后,登录状态检查会自动运行:

```bash
# 启动后端服务(调度器会自动启动)
start_all_services_synenv.bat
```

查看日志:
```
[LoginStatus] Start login status check - 2025-12-31T12:00:00
[LoginStatusChecker] 访问 douyin 创作者中心: https://creator.douyin.com/...
[LoginStatusChecker] 等待 4.32 秒...
[LoginStatusChecker] 账号 abc123 (douyin) 仍在登录中 - URL: https://creator.douyin.com/...
[LoginStatus] Login status check done: {"checked": 5, "logged_in": 4, "session_expired": 1, "errors": 0}
[LoginStatus] Next check scheduled in 87 minutes
```

### 2. 手动测试

运行测试脚本:
```bash
TEST_LOGIN_STATUS.bat
```

或直接运行Python:
```bash
cd syn_backend
python myUtils\login_status_checker.py test
```

### 3. 前端查看

访问账号管理页面:
```
http://localhost:3000/account
```

查看"登录状态"列:
- ✓ 在线 (绿色)
- ✗ 掉线 (红色)
- 未检测 (灰色)

## 配置参数

### 环境变量(可选)

```bash
# 暂无专用环境变量,使用默认值
```

### 代码配置

**检查间隔** (`user_info_sync_scheduler.py`):
```python
def _random_login_check_interval(self) -> int:
    return random.randint(30, 120)  # 30-120分钟
```

**每批检查数量** (`user_info_sync_scheduler.py`):
```python
login_status_checker.check_batch_accounts(batch_size=5)  # 每批5个
```

**等待时间** (`login_status_checker.py`):
```python
wait_time = random.uniform(1, 2)  # 1-2秒 (已优化)
await asyncio.sleep(wait_time)
```

**高并发策略** (`login_status_checker.py`):
```python
# 并发执行所有检查,无需账号间等待
tasks = [check_single_account_login_status(...) for account in batch]
results = await asyncio.gather(*tasks, return_exceptions=True)
```

## 非侵入性保证

### 1. 独立字段
- 使用独立的 `login_status` 字段
- 不修改现有的 `status` 字段
- 现有发布功能仍使用 `status` 字段判断

### 2. 只读操作
- 只读取账号cookies
- 不修改cookies
- 不修改账号user_info

### 3. 独立模块
- 新建 `login_status_checker.py` 模块
- 不修改现有代码逻辑
- 集成到调度器时使用独立标签

### 4. 失败容错
- 检查失败不影响其他任务
- 错误时设置 `login_status='error'`
- 异常不会中断调度器

## 故障排查

### 问题1: 调度器未启动

**症状**: 登录状态始终为 `unknown`

**解决**:
```bash
# 检查调度器是否启动
# 查看后端日志是否有:
# [AccountStatus] Scheduled: ... login status check first in XXm
```

### 问题2: 浏览器启动失败

**症状**: `login_status='error'`, 日志显示 `浏览器启动失败`

**解决**:
```bash
# 检查 Playwright 是否安装
playwright install chromium

# 检查 cookies 文件是否存在
# 路径: syn_backend/cookiesFile/
```

### 问题3: 所有账号都显示"掉线"

**症状**: 大部分账号 `login_status='session_expired'`

**可能原因**:
1. 平台URL已变更(如小红书已更新为 `/new/home`)
2. 等待时间不足,页面未完全加载
3. Cookies确实已过期

**解决**:
1. 检查 `PLATFORM_CREATOR_URLS` 是否正确
2. 增加等待时间: `await asyncio.sleep(random.uniform(5, 8))`
3. 手动验证cookies是否有效

### 问题4: 前端不显示登录状态

**症状**: 前端"登录状态"列为空或显示 `unknown`

**解决**:
1. 检查后端是否返回 `login_status` 字段:
   ```bash
   curl http://localhost:8000/api/v1/accounts
   ```
2. 检查数据库是否有 `login_status` 列:
   ```bash
   sqlite3 syn_backend/db/cookie_store.db
   PRAGMA table_info(cookie_accounts);
   ```
3. 手动运行一次检查:
   ```bash
   python syn_backend/myUtils/login_status_checker.py test
   ```

## 性能影响

### 资源消耗

- **CPU**: 调用Playwright Worker API,无直接浏览器启动开销
- **内存**: 依赖Worker进程管理,主进程占用极小
- **网络**: 每个账号约1个HTTP请求到Worker,Worker再访问创作者中心
- **并发**: 批量中所有账号同时检查,大幅缩短总时间

### 调度频率

- **首次检查**: 启动后3-6小时(随机)
- **后续检查**: 每3-6小时(随机)
- **每批数量**: 5个账号
- **手动检测**: 点击"未检测"按钮立即检查

**示例**: 假设有50个账号
- 每批检查5个账号(高并发,约2-3秒完成)
- 需要10批检查才能覆盖全部
- 假设平均间隔4.5小时
- 完整检查一遍需要: 10批 × 4.5小时 = 45小时
- **实际检查时间**: 10批 × 3秒 = 30秒 (大幅优化)
- **手动检测**: 单个账号约2秒即刻完成

## 未来优化

### 可能的改进方向

1. **智能调度**
   - 根据掉线率动态调整检查频率
   - 对频繁掉线的账号增加检查频率

2. **通知功能**
   - 账号掉线时发送通知(微信/邮件)
   - 批量掉线时发送告警

3. **历史记录**
   - 记录掉线历史
   - 生成掉线趋势报表

4. **更精细的检测**
   - 结合HTTP状态码和页面特征元素
   - 多重验证降低误判

5. **自动重试机制**
   - 对error状态的账号自动重试
   - 智能退避策略

## 总结

这是一个**简单、高效、非侵入式**的账号登录状态监控系统：

✅ **简单**: 直接在Playwright Worker内部实现，避免循环调用
✅ **高效**: 高并发检查，1-2秒等待，大幅缩短检查时间
✅ **独立**: 独立模块，独立字段，独立调度
✅ **非侵入**: 只读操作，不影响现有功能（独立浏览器上下文）
✅ **实用**: 轮询策略，随机间隔，降低负载
✅ **直观**: 前端显示，一目了然

**核心文件**:
- `syn_backend/playwright_worker/worker.py` - Worker内部直接实现检查逻辑
- `syn_backend/myUtils/login_status_checker.py` - 轮询索引管理
- `syn_backend/myUtils/user_info_sync_scheduler.py` - 调度集成(3-6小时)
- `syn_backend/fastapi_app/api/v1/creator/router.py` - FastAPI代理端点
- `syn_frontend_react/src/app/account/page.tsx` - 前端显示(未检测按钮)

**测试脚本**:
- `TEST_LOGIN_STATUS.bat` - 快速测试

**架构优化（2025-12-31）**:
- 将登录检查逻辑从 `login_status_checker.py` 的 httpx 调用迁移到 Playwright Worker 内部
- 避免了"Worker → login_status_checker → httpx → Worker"的循环调用
- 现在是"Worker → 内部方法 → 直接启动浏览器"的简洁流程

---

**作者**: Claude Sonnet 4.5
**日期**: 2025-12-31
**版本**: 1.1.0 (优化架构，消除循环调用)
