# 平台模块使用指南

## 🚀 快速开始

### 1. 验证码处理

所有平台的验证码处理已统一，无需额外配置。

**后端自动处理：**
```python
# 在任何平台的上传/登录过程中
await self.handle_verification(
    page=page,
    account_id=account_id,
    trigger_selector="text=获取验证码"  # 可选：自动点击按钮
)
```

**前端自动弹窗：**
- 前端的 `PublishOtpDialog` 组件会自动轮询并显示验证码输入框
- 用户输入后自动提交给后端

### 2. 使用抖音平台模块

#### 登录
```python
from platforms.douyin.login import douyin_login

result = await douyin_login.login("account_123")
# result = {"success": True, "message": "登录成功", "data": {...}}
```

#### 上传视频
```python
from platforms.douyin.upload import douyin_upload

result = await douyin_upload.upload(
    account_file="cookiesFile/account_123.json",
    title="我的视频标题",
    file_path="videoFile/video.mp4",
    tags=["旅行", "美食", "Vlog"]
)
# result = {"success": True, "message": "视频发布成功"}
```

#### 定时发布
```python
from datetime import datetime

result = await douyin_upload.upload(
    account_file="cookiesFile/account_123.json",
    title="定时发布的视频",
    file_path="videoFile/video.mp4",
    tags=["标签1"],
    publish_date=datetime(2024, 12, 31, 18, 0)  # 2024-12-31 18:00
)
```

### 3. HTTP API调用（推荐统一发布入口）

#### 登录（平台级：仅用于获取/绑定 cookie）
```bash
curl -X POST http://localhost:7000/api/v1/platforms/douyin/login \
  -H "Content-Type: application/json" \
  -d '{"account_id": "account_123"}'
```

#### 上传/发布（统一入口）
```bash
curl -X POST http://localhost:7000/api/v1/publish/direct \
  -H "Content-Type: application/json" \
  -d '{
    "platform": 3,
    "cookie_file": "account_123.json",
    "title": "视频标题",
    "file_path": "videoFile/video.mp4",
    "tags": ["标签1", "标签2"]
  }'
```

## 📖 详细文档

- [完整架构文档](./PLATFORM_MODULES_GUIDE.md)
- [重构总结](./PLATFORM_REFACTOR_SUMMARY.md)

## 🧪 测试

运行测试脚本验证模块：
```bash
python test_platform_modules.py
```

## 🔧 扩展新平台

参考 [扩展指南](./PLATFORM_MODULES_GUIDE.md#-扩展新平台)

## ❓ 常见问题

**Q: 验证码弹窗没有出现？**  
A: 检查前端是否正在运行，`PublishOtpDialog` 组件会自动轮询 `/api/v1/verification/otp-events`

**Q: 如何自定义验证码处理？**  
A: 在平台类中覆盖 `fill_verification_code()` 方法

**Q: 旧的 `/platforms/*/upload` 接口呢？**  
A: 已移除，统一走 `/api/v1/publish/direct` / `/api/v1/publish/batch`。
