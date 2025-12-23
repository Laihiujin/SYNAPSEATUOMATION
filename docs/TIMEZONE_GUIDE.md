# 时区统一使用指南

## 问题背景

系统中所有时间相关操作需要统一使用**北京时间（UTC+8）**，避免时区混乱导致的数据不一致。

## 解决方案

已创建统一的时区工具模块：`fastapi_app/core/timezone_utils.py`

## 使用方法

### 1. 获取当前时间

```python
from fastapi_app.core.timezone_utils import now_beijing, now_beijing_naive, now_beijing_iso

# 获取当前北京时间（带时区信息）
dt = now_beijing()  # 2025-01-15 10:30:00+08:00

# 获取当前北京时间（不带时区，用于数据库）
dt = now_beijing_naive()  # 2025-01-15 10:30:00

# 获取 ISO 格式的北京时间字符串
iso_str = now_beijing_iso()  # "2025-01-15T10:30:00+08:00"
```

### 2. 替换现有代码

❌ **旧代码（不推荐）：**
```python
from datetime import datetime

# 这会使用服务器时区，可能不是北京时间
upload_time = datetime.now().isoformat()

# 使用 UTC 时间，但前端显示时需要转换
upload_time = datetime.utcnow().isoformat()
```

✅ **新代码（推荐）：**
```python
from fastapi_app.core.timezone_utils import now_beijing_iso

# 统一使用北京时间
upload_time = now_beijing_iso()
```

### 3. 时间转换

```python
from fastapi_app.core.timezone_utils import to_beijing, to_utc

# 将 UTC 时间转换为北京时间
utc_time = datetime.now(timezone.utc)
beijing_time = to_beijing(utc_time)

# 将北京时间转换为 UTC（用于第三方 API）
beijing_time = now_beijing()
utc_time = to_utc(beijing_time)
```

### 4. 格式化时间

```python
from fastapi_app.core.timezone_utils import format_beijing_time

dt = now_beijing()

# 默认格式：2025-01-15 10:30:00
formatted = format_beijing_time(dt)

# 自定义格式：2025年01月15日 10:30:00
formatted = format_beijing_time(dt, fmt="%Y年%m月%d日 %H:%M:%S")
```

### 5. 解析时间字符串

```python
from fastapi_app.core.timezone_utils import parse_datetime_to_beijing

# 将字符串解析为北京时间
dt_str = "2025-01-15 10:30:00"
dt = parse_datetime_to_beijing(dt_str)
```

### 6. 获取日期范围

```python
from fastapi_app.core.timezone_utils import get_date_range_beijing

# 获取今天的日期范围
start, end = get_date_range_beijing(0)

# 获取昨天的日期范围
start, end = get_date_range_beijing(1)

# 可用于数据库查询
query = "SELECT * FROM tasks WHERE created_at BETWEEN ? AND ?"
cursor.execute(query, (start, end))
```

## 迁移指南

### 快速查找需要修改的代码

```bash
# 查找所有使用 datetime.now() 的代码
grep -r "datetime.now()" syn_backend/

# 查找所有使用 datetime.utcnow() 的代码
grep -r "datetime.utcnow()" syn_backend/
```

### 批量替换步骤

1. **导入时区工具**
   ```python
   from fastapi_app.core.timezone_utils import now_beijing_naive, now_beijing_iso
   ```

2. **替换时间获取**
   - `datetime.now()` → `now_beijing_naive()`
   - `datetime.now().isoformat()` → `now_beijing_iso()`
   - `datetime.utcnow()` → `now_beijing_naive()`

3. **测试验证**
   - 检查日志中的时间是否正确
   - 检查前端显示的时间是否正确
   - 检查定时任务执行时间是否正确

## 常见问题

### Q: 为什么不使用 datetime.now()?

A: `datetime.now()` 使用服务器的本地时区，不同服务器可能时区不同，导致时间不一致。统一使用北京时间可以避免这个问题。

### Q: 数据库中已有的时间数据怎么办？

A: 旧数据可能是 UTC 时间或其他时区，可以使用 `to_beijing()` 函数转换：

```python
from fastapi_app.core.timezone_utils import to_beijing

# 假设数据库中的时间是 UTC
old_time = row['created_at']  # 可能是 UTC 时间
beijing_time = to_beijing(old_time)
```

### Q: 需要给第三方 API 传递 UTC 时间怎么办？

A: 使用 `to_utc()` 函数转换：

```python
from fastapi_app.core.timezone_utils import now_beijing, to_utc

beijing_time = now_beijing()
utc_time = to_utc(beijing_time)
```

## 已修改的文件

- ✅ `fastapi_app/core/timezone_utils.py` - 时区工具模块
- ✅ `fastapi_app/core/config.py` - 添加时区配置
- ✅ `fastapi_app/api/v1/files/services.py` - 文件服务使用北京时间

## 待修改的文件（可选）

根据需要逐步迁移以下文件：

- `fastapi_app/api/v1/publish/services.py` - 发布服务
- `fastapi_app/tasks/publish_tasks.py` - 发布任务
- `myUtils/video_collector.py` - 视频采集
- 其他使用 `datetime.now()` 的模块

## 配置说明

在 `fastapi_app/core/config.py` 中添加了以下配置：

```python
# 时区配置
TIMEZONE: str = "Asia/Shanghai"  # 北京时间 UTC+8
USE_BEIJING_TIME: bool = True  # 全局使用北京时间
```

可以通过环境变量覆盖：

```bash
export TIMEZONE="Asia/Shanghai"
export USE_BEIJING_TIME=true
```

## 注意事项

1. **逐步迁移**：不需要一次性修改所有文件，可以逐步迁移核心模块。
2. **测试验证**：每次修改后都要测试时间显示是否正确。
3. **数据库兼容**：大多数数据库存储的是 naive datetime，使用 `now_beijing_naive()` 保持兼容。
4. **API 响应**：对外 API 返回时间建议使用 ISO 格式，包含时区信息。

## 示例代码

### 完整示例：保存文件时使用北京时间

```python
from fastapi_app.core.timezone_utils import now_beijing_iso

async def save_file_record(self, filename: str, file_path: str) -> int:
    """保存文件记录（使用北京时间）"""

    # 使用北京时间作为上传时间
    upload_time = now_beijing_iso()

    cursor.execute(
        """
        INSERT INTO file_records (filename, file_path, upload_time)
        VALUES (?, ?, ?)
        """,
        (filename, file_path, upload_time)
    )

    return cursor.lastrowid
```

### 完整示例：查询今天的任务

```python
from fastapi_app.core.timezone_utils import get_date_range_beijing

async def get_today_tasks(self):
    """查询今天的任务（北京时间）"""

    # 获取今天的时间范围（北京时间）
    start, end = get_date_range_beijing(0)

    cursor.execute(
        """
        SELECT * FROM tasks
        WHERE created_at BETWEEN ? AND ?
        ORDER BY created_at DESC
        """,
        (start.isoformat(), end.isoformat())
    )

    return cursor.fetchall()
```

## 技术支持

如有疑问，请查看：
- 模块文档：`fastapi_app/core/timezone_utils.py` 中的 docstring
- 配置文档：`fastapi_app/core/config.py`
