# SynapseAutomation 完整独立安装包构建指南

## 目标

创建一个**完全独立**的 Windows 安装包，包含：
- ✅ Electron 应用外壳
- ✅ Playwright Chromium 浏览器
- ✅ Python 嵌入式运行环境
- ✅ 后端 Python 代码
- ✅ 前端 Next.js 代码
- ✅ 所有 Python 和 Node.js 依赖

**用户无需安装任何环境，双击即可使用！**

## 构建步骤

### 第一步：准备 Python 环境

#### 方式一：自动化脚本（推荐）

以管理员身份运行：
```bash
cd E:\SynapseAutomation\desktop
bundle-python.bat
```

脚本会自动：
1. 下载 Python 3.11.9 Embeddable Package
2. 解压到 `desktop/resources-source/python-embed/`
3. 配置 Python 环境
4. 安装 pip
5. 安装 `syn_backend/requirements.txt` 中的所有依赖

#### 方式二：手动操作

1. 下载 Python Embeddable Package
   - URL: https://www.python.org/downloads/windows/
   - 选择: "Windows embeddable package (64-bit)"
   - 版本: 3.11.9

2. 解压到指定目录
   ```
   E:\SynapseAutomation\desktop\resources-source\python-embed\
   ```

3. 修改 `python311._pth` 文件
   ```
   # 取消注释这一行:
   import site
   ```

4. 安装 pip
   ```bash
   cd desktop\resources-source\python-embed
   curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
   python.exe get-pip.py
   ```

5. 安装依赖
   ```bash
   python.exe -m pip install -r ..\..\..\syn_backend\requirements.txt
   ```

### 第二步：准备 Playwright 浏览器

```bash
cd E:\SynapseAutomation\syn_backend
python -m playwright install chromium
```

这会将 Chromium 安装到 `.playwright-browsers/` 目录。

### 第三步：构建安装包

以管理员身份运行：
```bash
cd E:\SynapseAutomation\desktop
build-installer.bat
```

或手动执行：
```bash
cd desktop
rmdir /s /q dist
rmdir /s /q %LOCALAPPDATA%\electron-builder\Cache\winCodeSign
npm run build
```

### 第四步：测试安装包

构建完成后：
```
desktop/dist/SynapseAutomation-Setup-0.1.0.exe
```

## 关键改进

### 1. 内置浏览器 UI

- ❌ 旧方案: 启动外部浏览器
- ✅ 新方案: 在 Electron 窗口内显示 Next.js 前端

### 2. 完全独立运行

- ❌ 旧方案: 需要用户安装 Python、Node.js
- ✅ 新方案: 所有环境都打包在内，双击即用

### 3. 自动启动服务

启动流程：
1. 显示加载页面
2. 自动启动后端服务
3. 自动启动 Worker
4. 自动启动前端服务
5. 加载前端页面到 Electron 窗口

## 安装包内容

```
SynapseAutomation-Setup-0.1.0.exe (约 800MB - 1.5GB)
└─ 包含:
   ├─ Electron 运行时 (~150MB)
   ├─ Chromium 浏览器 (~300MB)
   ├─ Python 3.11 + 依赖 (~300MB)
   ├─ 后端代码 (syn_backend)
   ├─ 前端代码 (syn_frontend_react)
   └─ Node.js 依赖 (node_modules)
```

## 安装后目录结构

```
C:\Users\<用户>\AppData\Local\Programs\SynapseAutomation\
├─ SynapseAutomation.exe              # 主程序
├─ resources\
│  └─ synapse-resources\
│     ├─ playwright-browsers\         # Chromium
│     ├─ python\                      # Python 环境
│     │  ├─ python.exe
│     │  ├─ Lib\
│     │  └─ Scripts\
│     ├─ syn_backend\                 # 后端代码
│     └─ syn_frontend_react\          # 前端代码
│        ├─ .next\
│        ├─ node_modules\
│        └─ src\
└─ ...

用户数据:
%APPDATA%\synapseautomation-desktop\
├─ settings.json
├─ database\
│  ├─ main.db
│  ├─ cookies.db
│  └─ ai_logs.db
└─ logs\
```

## 使用流程

### 最终用户体验

1. 双击安装 `SynapseAutomation-Setup-0.1.0.exe`
2. 选择安装目录（或默认）
3. 完成安装
4. 双击桌面快捷方式 "SynapseAutomation"
5. 等待 30-60 秒自动启动所有服务
6. 自动显示前端界面（在 Electron 窗口内）
7. 开始使用！

**无需任何手动配置！**

## 故障排除

### 构建失败: 权限错误

必须以管理员权限运行构建脚本。

### Python 依赖安装失败

某些包可能需要 C++ 编译器。解决方案：
1. 安装 Visual Studio Build Tools
2. 或使用预编译的 wheel 文件

### 安装包过大

这是正常的，因为包含了完整的运行环境：
- Chromium: ~300MB
- Python + packages: ~300MB
- Electron: ~150MB
- 前端 node_modules: ~200MB

### 首次启动慢

首次启动需要：
- 初始化数据库
- 启动后端服务
- 启动前端开发服务器
- 等待 Next.js 编译

通常需要 30-60 秒。

## 高级配置

### 优化安装包体积

1. 清理不必要的 Python 包
2. 使用 Next.js production build 而不是 dev
3. 移除开发依赖

### 使用生产环境前端

修改 `desktop/src/main.js`:
```javascript
// 使用 next start 而不是 next dev
args: ["run", "start"],  // 替换 "dev"
```

需要先构建前端：
```bash
cd syn_frontend_react
npm run build
```

## 总结

现在您的安装包是**真正的独立应用**：
- ✅ 用户不需要安装 Python
- ✅ 用户不需要安装 Node.js
- ✅ 用户不需要配置环境变量
- ✅ 前端在 Electron 内显示，不打开外部浏览器
- ✅ 所有依赖都打包在内
- ✅ 双击安装、双击启动、即刻使用

这是一个**专业级的桌面应用程序**！
