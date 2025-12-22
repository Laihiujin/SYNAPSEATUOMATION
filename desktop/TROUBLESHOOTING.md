# 构建失败？权限问题解决方案

## 问题

构建时出现 "Cannot create symbolic link: 客户端没有所需的特权" 错误。

## 根本原因

Windows 默认不允许普通用户创建符号链接，即使以管理员身份运行也可能失败。

## 解决方案

### 方案一：启用 Windows 开发者模式（推荐）

1. 打开 **设置**
2. 进入 **更新和安全** → **开发者选项**
3. 打开 **开发者模式**
4. 重启电脑（可选，但推荐）
5. 重新运行 `build-installer.bat`

### 方案二：使用组策略（Windows 10/11 专业版）

1. 按 `Win + R`，输入 `gpedit.msc`
2. 导航到：**计算机配置** → **Windows 设置** → **安全设置** → **本地策略** → **用户权限分配**
3. 找到 **创建符号链接**
4. 添加当前用户或 **Administrators** 组
5. 重启电脑
6. 重新运行 `build-installer.bat`

### 方案三：跳过打包大文件（临时方案）

修改 `desktop/package.json`，排除 Playwright 浏览器：

```json
{
  "build": {
    "extraResources": [
      {
        "from": "resources",
        "to": "synapse-resources",
        "filter": ["**/*", "!playwright-browsers/**"]
      }
    ]
  }
}
```

注意：这样用户需要自己安装 Playwright 浏览器。

### 方案四：手动清理并重试

```bash
# 以管理员身份运行
rmdir /s /q %LOCALAPPDATA%\electron-builder\Cache
cd E:\SynapseAutomation\desktop
npm run build
```

## 验证是否解决

运行以下命令测试符号链接权限：

```cmd
mklink test_link.txt %TEMP%\test.txt
```

如果成功创建，说明权限已解决。删除测试链接：
```cmd
del test_link.txt
```

## 参考

- [Microsoft Docs: 符号链接](https://docs.microsoft.com/en-us/windows/security/threat-protection/security-policy-settings/create-symbolic-links)
- [Electron Builder Issues](https://github.com/electron-userland/electron-builder/issues)
