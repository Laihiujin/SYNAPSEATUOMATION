# ✅ 解决符号链接权限问题 - 快速指南

## 当前状态

✅ **开发者模式已启用**（注册表项 = 1）
✅ **`mklink` 测试通过**（可以创建符号链接）
⚠️ **需要管理员权限运行构建**

## 📋 操作步骤（5 分钟）

### 方法 1：使用优化版构建脚本（推荐）

1. **右键点击** `build-installer-ADMIN.bat`
2. 选择 **"以管理员身份运行"**
3. 等待 10-20 分钟
4. 完成后会自动打开 `dist` 目录

### 方法 2：手动命令行构建

1. **右键点击"开始菜单" → Windows PowerShell (管理员)**
2. 运行以下命令：

```powershell
cd E:\SynapseAutomation\desktop

# 清理缓存
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\electron-builder\Cache" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "dist" -ErrorAction SilentlyContinue

# 设置环境变量
$env:CSC_IDENTITY_AUTO_DISCOVERY="false"
$env:WIN_CSC_LINK=""
$env:ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES="true"

# 准备资源
npm run prepare:resources

# 构建
npx electron-builder --win --x64
```

## 🎯 为什么必须管理员权限？

虽然开发者模式已启用，但 electron-builder 使用的 **7-Zip 解压工具** 在解压 `winCodeSign` 时需要创建符号链接，这需要：

1. ✅ 开发者模式启用（已完成）
2. ✅ 管理员权限（需要手动运行）
3. ⚠️ 或者重启 Windows（使组策略生效）

## 🔧 如果仍然失败

### 选项 1：重启 Windows

开发者模式注册表更改可能需要重启才能完全生效：

1. 重启电脑
2. 重新以管理员身份运行 `build-installer-ADMIN.bat`

### 选项 2：手动配置组策略（Windows 专业版）

1. `Win + R` → 输入 `gpedit.msc`
2. 导航到：**计算机配置 → Windows 设置 → 安全设置 → 本地策略 → 用户权限分配**
3. 找到 **"创建符号链接"**
4. 双击 → **添加用户或组** → 输入你的用户名或 `Administrators`
5. 确定 → 重启电脑

### 选项 3：完全清除缓存后重试

```powershell
# 以管理员身份运行
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\electron-builder" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$env:TEMP\electron-builder-*" -ErrorAction SilentlyContinue
```

然后重新运行构建。

## 📊 测试结果回顾

根据 `test-symlink-permission.bat` 的输出：

| 测试项 | 结果 | 说明 |
|--------|------|------|
| 开发者模式注册表 | ✅ 通过 | `AllowDevelopmentWithoutDevLicense = 1` |
| `mklink` 创建符号链接 | ✅ 通过 | 说明权限已生效 |
| 用户权限检查 | ❌ 失败 | Git Bash 环境误报（可忽略） |
| 管理员身份检查 | ❌ 失败 | **关键**：需要以管理员身份运行 |

## 🚀 预期结果

构建成功后，你会在 `E:\SynapseAutomation\desktop\dist\` 看到：

```
dist/
├── SynapseAutomation-Setup-0.1.0.exe  (约 800-1200 MB)
├── win-unpacked/
└── builder-effective-config.yaml
```

## 💡 快速测试构建是否会成功

在管理员 PowerShell 中运行：

```powershell
cd E:\SynapseAutomation\desktop
New-Item -ItemType SymbolicLink -Path test_link -Target package.json
Remove-Item test_link
```

如果没有报错，说明符号链接权限 OK，构建应该能成功。

## ❓ 常见问题

### Q: 为什么 `mklink` 成功但 electron-builder 失败？

A: 因为你直接运行 `mklink` 时可能是在有管理员权限的终端，但 `npm run build` 是在普通权限下运行的。

### Q: 必须每次都以管理员身份运行吗？

A: 理论上重启后不需要，但为了保险起见，第一次构建建议使用管理员权限。

### Q: 构建需要多长时间？

A:
- 首次构建：15-25 分钟（下载缓存 + 复制文件）
- 后续构建：8-12 分钟（跳过下载）

---

**现在请右键点击 `build-installer-ADMIN.bat`，选择"以管理员身份运行"！**
