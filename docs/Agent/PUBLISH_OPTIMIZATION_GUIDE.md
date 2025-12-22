# 发布功能优化（MySQL + Redis + Celery + Selenium + OCR）

本仓库当前线上逻辑仍以 `SQLite + myUtils.task_queue_manager + Playwright` 为主；本文档提供“演进式升级”的落地入口：

1. 引入 MySQL/Redis 基础设施（不破坏现有 SQLite 运行）
2. 将 SQLite 数据一次性迁移到 MySQL（数据层先到位）
3. 后续逐步把关键查询从 `sqlite3` 改为 `SQLAlchemy/Alembic`（运行时真正切到 MySQL）
4. 使用 Selenium + OCR 做发布页抓取兜底（提升发布稳定性）

## 1) 启动 MySQL/Redis（开发环境）

在仓库根目录：

- 启动：`docker compose -f docker-compose.dev.yml up -d`
- MySQL：`localhost:3306`（库/用户/密码默认：`synapse/synapse`，root 密码：`root`）
- Redis：`localhost:6379`

## 2) 配置环境变量（不要把密钥写进代码/提交到 git）

参考：`syn_backend/.env.example`

- MySQL：`DATABASE_URL=mysql+pymysql://synapse:synapse@localhost:3306/synapse?charset=utf8mb4`
- Redis：`REDIS_URL=redis://localhost:6379/0`
- Celery（可选，不填则默认使用 `REDIS_URL`）：
  - `CELERY_BROKER_URL=redis://localhost:6379/0`
  - `CELERY_RESULT_BACKEND=redis://localhost:6379/0`

## 3) SQLite → MySQL 数据迁移（一次性）

前提：已设置 `DATABASE_URL` 指向 MySQL。

在 `syn_backend` 目录执行：

- `python scripts/maintenance/migrate_sqlite_to_mysql.py`

说明：
- 该脚本会在 MySQL 侧创建最小表结构（`fastapi_app/db/sa_models.py`），并把 SQLite 里的数据复制过去。
- 该脚本暂不负责“让后端运行时全部切到 MySQL”；那需要把现有 `sqlite3` 查询逐步迁移到 `SQLAlchemy/Alembic`。

## 4) Celery（异步任务）启动方式（脚手架）

当前仅提供占位任务，后续再接入发布队列：

- 启动 worker：`celery -A fastapi_app.tasks.celery_app.celery_app worker -l info`

占位任务定义：`syn_backend/fastapi_app/tasks/publish_tasks.py`

## 5) Selenium + OCR（发布页抓取兜底）脚手架

现有 Playwright 仍是主通路；Selenium+OCR 用于：
- 无法通过稳定 selector 定位“上传按钮/上传输入框”
- 活动引导/弹窗遮挡
- 页面文本只能通过图像识别辅助判断

代码入口（脚手架）：
- Selenium：`syn_backend/automation/selenium_dom.py`
- OCR：`syn_backend/automation/ocr_client.py`（使用 OpenAI-compatible 接口；密钥通过环境变量注入）

调试接口（可选，默认关闭）：
- 打开开关：`ENABLE_SELENIUM_DEBUG=true`
- 接口：`POST /api/v1/publish/debug/capture`（输入 URL，输出 html/png/ocr.txt 的路径，落到 `syn_backend/logs/`）
