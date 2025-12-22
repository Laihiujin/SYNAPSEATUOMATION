# SynapseAutomation Windows 安装包构建指南

本文档说明如何将 SynapseAutomation 打包为 Windows 安装程序。

## 前置准备

### 1. 安装依赖

```bash
cd desktop
npm install
```

### 2. 安装 Playwright Chromium

```bash
cd ../syn_backend
python -m playwright install chromium
```

这会将 Chromium 浏览器安装到 `.playwright-browsers/` 目录。

### 3. （可选）准备 Python 嵌入式发行版

如果希望将 Python 也打包进安装包（实现完全离线安装）：

1. 从 [Python 官网](https://www.python.org/downloads/windows/) 下载 **Windows embeddable package (64-bit)**
2. 解压到 `desktop/resources/python-embed/`
3. 运行打包脚本：

```bash
cd desktop
node scripts/bundle_python.js
```

**注意**: 由于依赖较多且体积较大，推荐使用用户本地已安装的 Python 环境。

### 4. 创建应用图标

将应用图标（256x256 PNG）转换为 ICO 格式，放置在：

- `desktop/build/icon.ico`

可以使用在线工具如 https://convertio.co/png-ico/ 进行转换。

## 构建安装包

### 方式一：一键构建（推荐）

```bash
cd desktop
npm run build
```

构建完成后，安装包将生成在 `desktop/dist/` 目录：

- `SynapseAutomation-Setup-0.1.0.exe`

### 方式二：分步构建

```bash
# 1. 准备资源
npm run prepare:resources

# 2. 构建安装包
npx electron-builder
```

## 安装包特性

生成的 NSIS 安装包包含以下功能：

- ✅ 可选择安装目录
- ✅ 创建桌面快捷方式
- ✅ 创建开始菜单快捷方式
- ✅ 卸载时可选择保留用户数据
- ✅ 内置 Playwright Chromium 浏览器
- ✅ 内置 syn_backend Python 代码
- ✅ 使用 SQLite 数据库（无需配置）

## 安装后使用

1. 双击桌面快捷方式启动 SynapseAutomation
2. 首次启动会自动配置项目路径（使用内置的 syn_backend）
3. 确保系统已安装 Python 3.11+ （如果未打包 Python）
4. 点击 "启动全部服务" 即可使用

## 数据存储位置

- **应用数据**: `%APPDATA%\synapseautomation-desktop\`
  - settings.json: 配置文件
  - redis-data/: Redis 数据（如启用）
  - mysql-data/: MySQL 数据（如启用）

- **SQLite 数据库**:
  - 默认使用内置的 SQLite
  - 数据库文件在运行时创建于用户数据目录

## 卸载

1. 通过 Windows 设置 → 应用 → 应用和功能 卸载
2. 或运行安装目录下的 `Uninstall.exe`
3. 卸载时会询问是否删除用户数据

## 高级配置

### 自定义 NSIS 脚本

编辑 `desktop/build/installer.nsh` 可以添加自定义安装/卸载步骤。

### 修改安装包配置

编辑 `desktop/package.json` 中的 `build.nsis` 部分。

### 打包 Python 环境

如需完全离线安装（包含 Python）：

1. 准备 Python embeddable package
2. 修改 `desktop/src/main.js` 中的 Python 路径解析逻辑
3. 取消注释 `bundle_python.js` 中的依赖安装代码

## 故障排除

### 构建失败

- 确保 Node.js 版本 >= 18
- 删除 `desktop/node_modules` 和 `desktop/dist`，重新 `npm install`

### 安装后无法启动

- 检查是否安装了 Python 3.10+
- 查看日志：`%APPDATA%\synapseautomation-desktop\logs\`

### Playwright 浏览器未找到

- 确保运行了 `npm run prepare:resources`
- 检查 `.playwright-browsers/` 目录是否存在

## 版本更新

修改 `desktop/package.json` 中的 `version` 字段，然后重新构建。
