# Bundled Resources

`desktop/resources/` 会在 `npm run build` 时被打包进应用（`synapse-resources/`）。

## Playwright Chromium（推荐）

- 自动：如果仓库根目录存在 `../.playwright-browsers/`，`npm run build` 会自动拷贝到 `desktop/resources/playwright-browsers/` 并随应用打包。
- 运行时：应用会优先使用内置路径作为 `PLAYWRIGHT_BROWSERS_PATH`。

## Redis（可选）

放置二进制：

- Windows：`desktop/resources/redis/redis-server.exe`
- macOS/Linux：`desktop/resources/redis/redis-server`

应用可在启动时自动拉起 Redis（仅本机 127.0.0.1）。

## MySQL（可选，建议 MariaDB）

放置二进制（示例路径）：

- Windows：`desktop/resources/mysql/bin/mysqld.exe` 或 `mariadbd.exe`
- macOS/Linux：`desktop/resources/mysql/bin/mysqld` 或 `mariadbd`

注意：MySQL 初始化与依赖较复杂，不同发行版差异较大；桌面壳会尽力自动初始化数据目录，但如失败请先在命令行完成初始化后再通过桌面壳启动。

