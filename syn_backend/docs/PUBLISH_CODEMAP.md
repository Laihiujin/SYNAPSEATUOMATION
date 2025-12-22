## 发布代码入口（统一后）

目标：只维护一套发布实现，避免“改了 A 实际跑 B”。

### 1) 统一平台层（唯一入口）

- 注册表：`syn_backend/platforms/registry.py`
- 各平台实现（统一对外 `upload(account_file, title, file_path, tags, **kwargs)`）：
  - 抖音：`syn_backend/platforms/douyin/upload.py`
  - 视频号：`syn_backend/platforms/tencent/upload.py`（当前复用旧 uploader 实现）
  - 快手：`syn_backend/platforms/kuaishou/upload.py`（复用旧实现）
  - 小红书：`syn_backend/platforms/xiaohongshu/upload.py`（复用旧实现）
  - B站：`syn_backend/platforms/bilibili/upload.py`（复用 biliup 实现）

### 2) 任务执行链路（会实际跑的地方）

#### A. 发布队列（/api/v1/publish 创建的任务）

- 入口：`syn_backend/fastapi_app/api/v1/publish/services.py`
- 执行器：`syn_backend/myUtils/batch_publish_service.py`
- 现在执行器已改为调用 `platforms.registry.get_uploader_by_platform_code()`，最终只会跑 `syn_backend/platforms/*/upload.py`
- 直接发布（绕过素材库 file_id）：`POST /api/v1/publish/direct`（同样走发布队列与平台层）

#### B. 平台登录/校验接口（/api/v1/platforms/*/*）

- 入口：`syn_backend/fastapi_app/api/v1/platforms/*/router.py`
- 仅用于登录/验证 cookie/查询任务状态；上传发布统一走 `/api/v1/publish/*`

### 3) 旧实现（暂时保留，供平台层复用）

这些文件不应该被业务直接调用，后续可逐步迁移并删除：
- `syn_backend/uploader/*_uploader/main.py`
- `syn_backend/myUtils/postVideo.py`（旧同步封装）
