## 7GB 体积主要来源（本机开发态）

用 `du` 在仓库根目录统计的主要占用（从大到小）：
- `.git/`：约 3.0G（大量 loose objects，建议跑一次 `git gc`）
- `synenv/`：约 2.5G（Python 虚拟环境，删除后需重建）
- `syn_frontend_react/node_modules/`：约 1.1G（前端依赖，删除后需 `npm i`）
- `syn_frontend_react/.next/`：约 190M（Next 构建/缓存，可删）
- `temp/`：约 449M（运行/缓存，可删）
- `syn_backend/venv/`：约 231M（后端目录下的虚拟环境，可删）



## 安全清理建议

优先级从高到低（越靠前越“安全/无痛”）：
- 删除 `syn_frontend_react/.next/`（下次 `next dev` 会重建）
- 删除 `syn_frontend_react/node_modules/`（重装：`npm -C syn_frontend_react i`）
- 删除 `synenv/`、`syn_backend/venv/`（重建虚拟环境/重新安装依赖）

## `.git` 太大怎么处理

本仓库 `.git/objects` 里有大量 loose objects（`git count-objects -vH` 可看）。
建议在确认不需要回滚大量二进制历史后再考虑深度瘦身：
- 轻量清理：`git gc --prune=now`（通常能显著缩小 loose objects）
- 深度瘦身（会改写历史）：`git filter-repo` / BFG 删除历史大文件（谨慎，需团队协作）

## 一键脚本

提供了默认“干跑”的清理脚本：
- `scripts/maintenance/disk_report.sh`
- `scripts/maintenance/cleanup_local_artifacts.sh`（需要 `--apply` 才会真的删除）
