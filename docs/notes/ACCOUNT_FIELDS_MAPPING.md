# 账号数据字段映射文档

## 数据库字段 (cookie_accounts 表)

| 字段名 | 类型 | 说明 | 必填 |
|--------|------|------|------|
| `account_id` | TEXT | 账号唯一标识 (主键) | ✅ |
| `platform` | TEXT | 平台名称 (xiaohongshu, douyin, kuaishou, channels, bilibili) | ✅ |
| `platform_code` | INTEGER | 平台代码 (1-5) | ✅ |
| `name` | TEXT | 账号显示名称 | ✅ |
| `user_id` | TEXT | 平台真实用户ID (账号唯一性判定) | ✅ |
| `status` | TEXT | 状态 (valid, expired, unchecked, file_missing) | ✅ |
| `cookie_file` | TEXT | Cookie文件名 | ✅ |
| `last_checked` | TEXT | 最后检查时间 (ISO格式) | ✅ |
| `avatar` | TEXT | 头像URL | ❌ |
| `original_name` | TEXT | 原始名称 (备用) | ❌ |
| `note` | TEXT | 备注 (如"派发账号") | ❌ |

## 平台代码映射

```python
PLATFORM_CODES = {
    "xiaohongshu": 1,
    "channels": 2,
    "douyin": 3,
    "kuaishou": 4,
    "bilibili": 5,
}
```

## Cookie字段提取优先级

### 快手 (Kuaishou)
- **user_id**: `userId` → `bUserId`
- **name**: 从页面抓取
- **avatar**: 从页面抓取

### 抖音 (Douyin)
- **user_id**: `uid_tt` → `uid_tt_ss` → `uid` → `userId`
- **name**: 从页面抓取
- **avatar**: 从页面抓取

### 小红书 (Xiaohongshu)
- **user_id**: `redId` (从localStorage USER_INFO_FOR_BIZ)
- **name**: `userName` (从localStorage)
- **avatar**: `userAvatar` (从localStorage)

### 视频号 (Channels)
- **user_id**: `wxuin` → `uin` 或从页面元素 `#finder-uid-copy`
- **name**: 从页面抓取
- **avatar**: 从页面抓取

### B站 (Bilibili)
- **user_id**: `DedeUserID` → `DedeUserID__ckMd5`
- **name**: 从页面抓取
- **avatar**: 从页面抓取

## API返回字段映射

### GET /api/v1/accounts 返回格式

```typescript
interface Account {
  id: string;                    // account_id
  name: string;                  // name
  platform: string;              // platform
  platform_code: number;         // platform_code
  status: string;                // status
  cookie: object;                // Cookie数据对象
  filePath: string;              // cookie_file
  last_checked: string;          // last_checked
  avatar?: string;               // avatar
  original_name?: string;        // original_name
  note?: string;                 // note
  user_id?: string;              // user_id (平台真实用户ID)
}
```

### 前端字段使用

- `account.id` - 账号ID (对应 `account_id`)
- `account.name` - 显示名称
- `account.platform` - 平台名称
- `account.user_id` - 平台用户ID (用于显示/复制)
- `account.status` - 账号状态
- `account.avatar` - 头像URL
- `account.note` - 备注信息

## 账号唯一性判定

**使用 `user_id` 字段作为平台账号的唯一标识**

在 `cookie_manager.py` 的 `add_account` 方法中：
- 如果同一平台下存在相同的 `user_id`，则更新现有账号
- 如果不存在，则创建新账号

## 状态字段定义

| Status | 说明 |
|--------|------|
| `valid` | Cookie有效，可正常使用 |
| `expired` | Cookie已过期，需要重新登录 |
| `unchecked` | 新发现的文件，等待校验 |
| `file_missing` | Cookie文件丢失 |

## 相关路由

### 账号管理路由
- `GET /api/v1/accounts` - 获取账号列表
- `GET /api/v1/accounts/{account_id}` - 获取账号详情
- `PUT /api/v1/accounts/{account_id}` - 更新账号
- `DELETE /api/v1/accounts/{account_id}` - 删除账号

### 认证路由
- `POST /api/v1/auth/login/{platform}` - 平台登录 (保存user_info)
- `POST /api/v1/auth/qrcode/{platform}` - 获取二维码

## 工具脚本

### Scripts/utilities/
- `fetch_user_info_from_page.py` - 从页面抓取用户信息
- `validate_cookies.py` - Cookie校验
- `update_existing_cookies.py` - 更新现有Cookie的user_info字段

### Scripts/maintenance/
- 无

### Scripts/tests/
- 各种测试脚本

## 最后更新
2025-12-11
