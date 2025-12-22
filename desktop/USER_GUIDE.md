# SynapseAutomation 安装包使用说明

## 快速开始

### 1. 下载与安装

1. 双击 `SynapseAutomation-Setup-0.1.0.exe`
2. 选择安装目录（或使用默认路径）
3. 等待安装完成
4. 勾选"启动 SynapseAutomation"或从桌面快捷方式启动

### 2. 首次使用

安装完成后：

1. **确保 Python 已安装**
   - 检查系统是否安装了 Python 3.11 或更高版本
   - 打开命令提示符，运行 `python --version` 验证
   - 如未安装，从 [python.org](https://www.python.org/downloads/) 下载安装

2. **启动应用**
   - 双击桌面图标 "SynapseAutomation"
   - 首次启动会自动配置项目路径

3. **安装 Python 依赖**（首次使用）
   ```bash
   # 应用会自动定位内置的 syn_backend
   # 但首次运行需要安装 Python 依赖
   cd %LOCALAPPDATA%\Programs\SynapseAutomation\resources\synapse-resources\syn_backend
   python -m pip install -r requirements.txt
   ```

   或者在应用启动后，应用会自动检测并提示安装依赖。

4. **启动服务**
   - 点击应用界面中的"启动全部服务"按钮
   - 等待后端和 Worker 启动完成
   - 浏览器会自动打开管理界面

## 系统要求

- 操作系统: Windows 10 或更高版本 (64-bit)
- Python: 3.10 或更高版本
- 内存: 至少 4GB RAM
- 磁盘空间: 至少 2GB 可用空间

## 特性说明

### 内置组件

- ✅ **Playwright Chromium**: 自动化浏览器，无需单独安装
- ✅ **SQLite 数据库**: 自动创建，无需配置
- ✅ **后端代码**: 完整的 Python 后端代码已内置

### 用户数据位置

所有用户数据存储在：
```
%APPDATA%\synapseautomation-desktop\
├── settings.json          # 应用配置
├── database/              # SQLite 数据库
│   ├── main.db
│   ├── cookies.db
│   └── ai_logs.db
├── redis-data/            # Redis 数据（如启用）
└── mysql-data/            # MySQL 数据（如启用）
```

### 日志文件

应用日志位于：
```
%APPDATA%\synapseautomation-desktop\logs\
```

## 配置选项

在应用界面中可以配置：

- **Project Root**: 项目根目录（默认使用内置路径）
- **Python Command**: Python 命令（默认 `python`）
- **启用 Redis**: 可选，用于任务队列
- **启用 MySQL**: 可选，用于替代 SQLite

## 常见问题

### 1. 启动失败

**问题**: 点击"启动全部服务"后报错

**解决**:
- 检查 Python 是否正确安装: `python --version`
- 确认已安装依赖包（见"首次使用"步骤 3）
- 查看日志文件获取详细错误信息

### 2. 浏览器未找到

**问题**: 提示 "Chromium not found"

**解决**:
- 安装包已内置 Chromium，不应出现此错误
- 如遇到，尝试重新安装应用

### 3. 数据库错误

**问题**: SQLite 相关错误

**解决**:
- 删除 `%APPDATA%\synapseautomation-desktop\database\` 目录
- 重启应用，数据库会自动重建

### 4. 端口冲突

**问题**: 提示端口被占用

**解决**:
- 默认端口: 7000 (backend), 7001 (worker)
- 检查其他程序是否占用这些端口
- 在设置中修改端口号

## 卸载

### 方法一：通过 Windows 设置

1. 打开"设置" → "应用" → "应用和功能"
2. 找到"SynapseAutomation"
3. 点击"卸载"
4. 选择是否保留用户数据

### 方法二：运行卸载程序

1. 打开安装目录（默认: `%LOCALAPPDATA%\Programs\SynapseAutomation`）
2. 运行 `Uninstall.exe`
3. 选择是否保留用户数据

### 完全清除

卸载后，如需完全清除所有数据：

1. 删除用户数据目录:
   ```
   %APPDATA%\synapseautomation-desktop\
   ```

2. 删除注册表项（可选）:
   ```
   HKEY_LOCAL_MACHINE\Software\Microsoft\Windows\CurrentVersion\Uninstall\SynapseAutomation
   ```

## 更新

当有新版本时：

1. 下载新的安装包
2. 运行安装程序（会自动覆盖旧版本）
3. 用户数据和配置会自动保留

## 技术支持

- GitHub Issues: https://github.com/yourproject/synapseautomation/issues
- 文档: https://docs.synapseautomation.com

## 许可证

请查看安装目录中的 LICENSE 文件。
