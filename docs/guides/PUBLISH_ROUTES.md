## 发布路由：当前生效链路（Canonical）

后端 FastAPI 的 **Canonical 发布入口**：
- `POST /api/v1/publish/batch`
- `POST /api/v1/publish/direct`（无素材ID直发）
- `GET|POST|PUT|DELETE /api/v1/publish/presets*`

前端（Next.js）有两种调用方式：
- 直连：调用 `/api/v1/publish/*`（推荐）
- 代理：调用 Next API `/api/publish/*`（会代理到后端 `/api/v1/publish/*`）

对应实现文件（运行时会打印指纹日志）：
- `syn_backend/fastapi_app/api/v1/publish/router.py`
- 日志关键词：`[PublishRouter] fastapi_app/api/v1/publish/router.py@active (file=...)`

## 旧链路（弃用标识）

以下不作为“发布入口”维护（仅保留为历史/调试用途）：
- 直接在 `syn_backend/uploader/*` 下执行的脚本式发布（脚本栈）
- `syn_backend/platforms/*` 下未被 `PublishService` 调用的旧实现

修发布问题前，先跑一次发布请求并确认终端里出现的 `[PublishRouter]` 指纹，确保改的是“当前生效链路”。
