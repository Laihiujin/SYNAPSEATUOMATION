# SynapseAutomation Desktop Shell (Electron)

本目录提供一个最小 Electron 桌面壳，用于**一键启动/停止**现有的：

- FastAPI 后端（`syn_backend/fastapi_app/run.py`，默认端口 7000）
- Playwright Worker（`syn_backend/playwright_worker/worker.py`，默认端口 7001）

注意：Electron 仅作为控制台与打包壳，不承载真实投放执行逻辑；自动化依旧由现有 Python Worker 完成。

## 运行（开发）

```bash
cd desktop
npm install
npm run dev
```

首次运行可在界面里配置：

- `Project Root`：你的仓库根目录（包含 `syn_backend/`）
- `Python`：Python 命令或绝对路径（如 `python` / `C:\Miniconda3\envs\syn\python.exe`）

## 打包（可选）

```bash
cd desktop
npm run build
```

打包后的应用仍需要目标机器具备可用的 Python 环境与依赖（建议提前在该机器上完成 `syn_backend/requirements.txt` 安装）。

## 内置资源（Chromium / Redis / MySQL）

- Chromium（Playwright）：`npm run build` 会自动尝试把仓库根目录的 `../.playwright-browsers/` 拷贝进应用资源包，并在运行时优先使用该内置路径。
- Redis / MySQL：可把对应二进制放入 `desktop/resources/`，构建时会一并打包；细节见 `desktop/resources/README.md`。
