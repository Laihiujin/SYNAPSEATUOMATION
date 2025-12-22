# 如何打包 Python 环境

## 快速步骤

1. **下载 Python Embedded Package**
   - 访问: https://www.python.org/downloads/windows/
   - 下载 "Windows embeddable package (64-bit)" 版本
   - 推荐版本: Python 3.11.x

2. **解压到指定目录**
   ```
   desktop/resources-source/python-embed/
   ```

3. **安装 pip**
   ```bash
   cd desktop/resources-source/python-embed
   curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
   .\python.exe get-pip.py
   ```

4. **修改 python311._pth 文件**
   编辑 `python311._pth`，取消注释 `#import site` 这一行：
   ```
   python311.zip
   .
   import site
   ```

5. **安装依赖包**
   ```bash
   .\python.exe -m pip install -r ..\..\..\syn_backend\requirements.txt --no-warn-script-location
   ```

6. **重新构建安装包**
   ```bash
   cd E:\SynapseAutomation\desktop
   npm run build
   ```

## 自动化脚本

也可以使用 `scripts/bundle_python.js` 自动化这个过程：

```bash
cd desktop
node scripts/bundle_python.js
```

## 注意事项

- Python embeddable package 体积约 30MB
- 安装完所有依赖后约 200-300MB
- 最终安装包会增加约 300MB

## 验证

构建完成后，检查：
```
desktop/resources/python/python.exe
desktop/resources/python/Lib/site-packages/
```

应该包含所有必需的 Python 包。
