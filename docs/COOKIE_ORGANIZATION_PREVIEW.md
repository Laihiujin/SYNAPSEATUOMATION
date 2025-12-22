# Cookie文件整理预览

## 📊 当前状态

### 文件总数
- **56** 个cookie文件

### 命名格式分析

#### ❌ 不规范格式（需要整理）
```
account_1765448130315.json          ← 无平台前缀，需重命名
account_1765453424195.json          ← 无平台前缀，需重命名
account_1765888429838.json          ← 无平台前缀，需重命名
...（约13个）
```

#### ⚠️ 半规范格式（需要简化）
```
bilibili_account_1765888429838.json  ← 有平台但包含account+时间戳
douyin_account_1765866040679.json    ← 有平台但包含account+时间戳
kuaishou_account_1765997743585.json  ← 有平台但包含account+时间戳
...（约43个）
```

#### ✅ 规范格式（目标格式）
```
douyin_12188823.json                 ← 平台_user_id.json
kuaishou_2376346635.json             ← 平台_user_id.json
```

---

## 🎯 整理后效果

### 重命名示例

| 原文件名 | 新文件名 | 说明 |
|---------|---------|------|
| `account_1765997803127.json` | `douyin_12188823.json` | 抖音账号 |
| `account_1765997743585.json` | `kuaishou_2376346635.json` | 快手账号 |
| `bilibili_account_1765888429838.json` | `bilibili_98765432.json` | B站账号 |
| `douyin_account_1765866040679.json` | `douyin_45678901.json` | 抖音账号 |

### 去重效果

如果发现同一账号（platform+user_id相同）有多个文件：
```
account_1765997803127.json       ← 删除（旧）
douyin_test_account.json         ← 删除（旧）
douyin_account_1765448130315.json ← 保留并重命名为 douyin_12188823.json（最新）
```

---

## 🚀 执行步骤

### 1️⃣ 运行整理脚本
```bash
cd E:\SynapseAutomation
python scripts\maintenance\organize_cookies.py
```

### 2️⃣ 脚本会自动：
1. ✅ 备份所有现有文件到 `cookiesFile/backups/{timestamp}/organize/`
2. ✅ 从数据库读取账号信息（platform、user_id）
3. ✅ 识别重复账号（同一platform+user_id有多个文件）
4. ✅ 保留最新文件，删除旧文件
5. ✅ 重命名为规范格式：`{platform}_{user_id}.json`

### 3️⃣ 确认结果
脚本会输出详细报告，包括：
- 重命名了多少文件
- 删除了多少重复文件
- 最终的文件列表

### 4️⃣ 检查（可选）
```bash
# 查看整理后的文件列表
ls E:/SynapseAutomation/syn_backend/cookiesFile/*.json

# 如需恢复，从备份目录复制回来
# 备份位置: syn_backend/cookiesFile/backups/{timestamp}/organize/
```

---

## 📋 预期结果

### 整理前
```
syn_backend/cookiesFile/
├── account_1765448130315.json
├── account_1765453424195.json
├── bilibili_account_1765888429838.json
├── douyin_account_1765866040679.json
├── kuaishou_account_1765997743585.json
└── ...（共56个文件，命名混乱）
```

### 整理后
```
syn_backend/cookiesFile/
├── douyin_12188823.json
├── douyin_45678901.json
├── kuaishou_2376346635.json
├── bilibili_98765432.json
├── xiaohongshu_5a8b2c3d.json
└── ...（约40-45个文件，去重后，命名规范）
```

### 备份目录
```
syn_backend/cookiesFile/backups/
└── 20251219_143022_organize/        ← 本次整理的备份
    ├── account_1765448130315.json   ← 所有原始文件的副本
    ├── account_1765453424195.json
    └── ...（56个文件完整备份）
```

---

## ⚠️ 注意事项

### 1️⃣ 数据安全
- ✅ 脚本会先备份所有文件
- ✅ 如整理结果不满意，可从备份恢复
- ✅ 备份位置: `syn_backend/cookiesFile/backups/{timestamp}/organize/`

### 2️⃣ 数据库同步
- ✅ 脚本仅重命名文件，不修改数据库
- ✅ Cookie Manager会根据文件路径自动更新

### 3️⃣ 无user_id的账号
- ⚠️ 如果账号没有user_id，脚本会跳过并发出警告
- ⚠️ 建议手动检查这些账号，重新登录提取user_id

---

## 🔍 手动检查建议

运行脚本前，可以手动检查哪些账号会被去重：

```bash
# 查看数据库中的重复账号
cd E:\SynapseAutomation\syn_backend
python -c "
from myUtils.cookie_manager import CookieManager
accounts = CookieManager().list_accounts()

# 按 platform + user_id 分组
from collections import defaultdict
groups = defaultdict(list)
for acc in accounts:
    if acc['user_id']:
        key = f\"{acc['platform']}_{acc['user_id']}\"
        groups[key].append(acc)

# 输出重复账号
for key, items in groups.items():
    if len(items) > 1:
        print(f'重复: {key} ({len(items)}个)')
        for item in items:
            print(f\"  - {item['account_id']}: {item['cookie_file']}\")
"
```

---

## 💡 后续建议

### 1️⃣ 定期整理
建议每月运行一次整理脚本，保持文件清洁。

### 2️⃣ 新账号命名
修改 `cookie_manager.py` 的 `add_account()` 方法，新账号自动使用规范命名。

### 3️⃣ 清理旧备份
保留最近3次备份，删除更早的备份以节省空间。

---

**准备好整理了吗？**

运行命令：
```bash
cd E:\SynapseAutomation
python scripts\maintenance\organize_cookies.py
```

整理完成后，告诉我结果，我会帮你检查！
