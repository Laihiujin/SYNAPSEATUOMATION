"""
项目文件重组脚本 - FastAPI 架构
将散落的文件移动到规范的目录结构中，保持清晰的组织
"""
import os
import shutil
from pathlib import Path
from datetime import datetime

# 项目根目录
ROOT_DIR = Path(__file__).parent.parent.parent
BACKEND_DIR = ROOT_DIR / "syn_backend"

print(f"项目根目录: {ROOT_DIR}")
print(f"后端目录: {BACKEND_DIR}")

# ============================================
# 文件移动规则定义
# ============================================

MOVE_RULES = {
    # ========== 测试文件 ==========
    "tests/integration": [
        "test_account_system.py",
        "test_cookie_manager.py",
        "test_cookie_validation.py",
        "test_platform_modules.py",
    ],
    
    "tests/config": [
        "test_config.py",
        "test_headless.py",
    ],
    
    # ========== 后端测试文件 ==========
    "syn_backend/tests/legacy": [
        "syn_backend/test_all_platforms.py",
        "syn_backend/test_batch_publish.py",
        "syn_backend/test_execute_publish.py",
        "syn_backend/test_kuaishou_only.py",
        "syn_backend/test_login_qr.py",
        "syn_backend/test_platforms_api.py",
        "syn_backend/test_platforms_final.py",
        "syn_backend/test_routes.py",
        "syn_backend/test_user_id_extraction.py",
        "syn_backend/test_final_output.log",
        "syn_backend/test_report_20251127_193311.json",
        "syn_backend/test_report_api_20251127_200430.json",
        "syn_backend/test_report_final_20251127_210914.json",
        "syn_backend/test_report_final_20251127_212616.json",
    ],
    
    # ========== 数据库文件 ==========
    "syn_backend/db": [
        "syn_backend/cookie_store.db",
        "syn_backend/cookies.db",
        "syn_backend/data.db",
    ],
    
    # ========== 维护脚本 ==========
    "scripts/maintenance": [
        "backfill_user_ids.py",
        "clean_duplicate_accounts.py",
        "debug_cookie_extract.py",
        "check_conf_values.py",
    ],
    
    "syn_backend/scripts/maintenance": [
        "syn_backend/manual_sync.py",
        "syn_backend/sync_db_files.py",
        "syn_backend/check_config.py",
    ],
    
    # ========== 工具脚本 ==========
    "syn_backend/scripts/utilities": [
        "syn_backend/inspect_biliup.py",
        "syn_backend/read_biliup_source.py",
    ],
    
    # ========== 配置文件 ==========
    "config": [
        "conf.example.py",
        "conf.py",
    ],
    
    # ========== 文档文件 ==========
    "docs/archive": [
        "LATEST_UPDATES.md",
        "Re_Stuct.md",
    ],
    
    # ========== 启动脚本 (保留在根目录) ==========
    # setup_browser.bat, setup_browser.sh
    # start_backend.bat, start_backend.sh
    # start_frontend.bat, start_frontend.sh
    # STARTUP_GUIDE.md
    # 这些文件保留在根目录，不移动
    
    # ========== 废弃模块 ==========
    "archive/deprecated": [
        "syn_backend/accounts.py",
        "syn_backend/campaigns.py",
        "syn_backend/recovery.py",
    ],
}

# ============================================
# 需要删除的文件
# ============================================

DELETE_FILES = [
    "requirements copy.txt",
    "package-lock.json",
    "nul",  # 空文件
    "syn_backend/requirements copy.txt",
    "syn_backend/package-lock.json",
]

# ============================================
# 保留在原位置的文件 (不移动)
# ============================================

KEEP_IN_PLACE = [
    "setup_browser.bat",
    "setup_browser.sh",
    "start_backend.bat",
    "start_backend.sh",
    "start_frontend.bat",
    "start_frontend.sh",
    "STARTUP_GUIDE.md",
    "README.md",
    "syn_backend/README.md",
    "syn_backend/COOKIE_MANAGEMENT.md",
    "syn_backend/GUIDE_LEARNING.md",
    "syn_backend/VIDEO_ANALYTICS.md",
    "syn_backend/requirements.txt",
    "syn_backend/.env",
    "syn_backend/.env.example",
]


def create_backup():
    """创建备份"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_dir = ROOT_DIR / f"backup_{timestamp}"
    
    print(f"\n📦 创建备份到: {backup_dir}")
    
    # 只备份即将移动的文件
    for target_dir, files in MOVE_RULES.items():
        for file_path in files:
            source = ROOT_DIR / file_path
            if source.exists():
                rel_path = source.relative_to(ROOT_DIR)
                backup_path = backup_dir / rel_path
                backup_path.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(source, backup_path)
    
    print(f"✓ 备份完成")
    return backup_dir


def create_directories():
    """创建目标目录"""
    print("\n📁 创建目标目录...")
    
    for target_dir in MOVE_RULES.keys():
        dir_path = ROOT_DIR / target_dir
        dir_path.mkdir(parents=True, exist_ok=True)
        print(f"  ✓ {target_dir}")


def move_files():
    """移动文件到目标目录"""
    print("\n📦 移动文件...")
    
    moved_count = 0
    skipped_count = 0
    error_count = 0
    
    for target_dir, files in MOVE_RULES.items():
        print(f"\n  → {target_dir}/")
        
        for file_path in files:
            source = ROOT_DIR / file_path
            filename = Path(file_path).name
            destination = ROOT_DIR / target_dir / filename
            
            if source.exists():
                try:
                    shutil.move(str(source), str(destination))
                    print(f"    ✓ {filename}")
                    moved_count += 1
                except Exception as e:
                    print(f"    ✗ {filename} - 错误: {e}")
                    error_count += 1
            else:
                print(f"    ⊘ {filename} (不存在)")
                skipped_count += 1
    
    return moved_count, skipped_count, error_count


def delete_files():
    """删除不需要的文件"""
    print("\n🗑️  删除不需要的文件...")
    
    deleted_count = 0
    
    for file_path in DELETE_FILES:
        full_path = ROOT_DIR / file_path
        if full_path.exists():
            try:
                full_path.unlink()
                print(f"  ✓ {file_path}")
                deleted_count += 1
            except Exception as e:
                print(f"  ✗ {file_path} - 错误: {e}")
        else:
            print(f"  ⊘ {file_path} (不存在)")
    
    return deleted_count


def create_readme_files():
    """在新目录中创建 README 说明文件"""
    print("\n📝 创建 README 文件...")
    
    readmes = {
        "tests/integration/README.md": """# Integration Tests

集成测试文件，测试多个模块协同工作。

## 测试文件
- `test_account_system.py`: 账号系统集成测试
- `test_cookie_manager.py`: Cookie管理器测试
- `test_cookie_validation.py`: Cookie验证测试
- `test_platform_modules.py`: 平台模块测试

## 运行测试
```bash
pytest tests/integration/
```
""",
        
        "tests/config/README.md": """# Configuration Tests

配置相关的测试文件。

## 测试文件
- `test_config.py`: 配置加载测试
- `test_headless.py`: 无头浏览器测试
""",
        
        "syn_backend/tests/legacy/README.md": """# Legacy Tests

旧版测试文件，保留用于参考。

**注意**: 这些测试可能已过时，建议使用新的测试框架。
""",
        
        "scripts/maintenance/README.md": """# Maintenance Scripts

系统维护脚本。

## 使用方式
这些脚本的功能已集成到 FastAPI 接口中：
- API: `POST /api/v1/accounts/tools/backfill-user-ids`
- API: `POST /api/v1/accounts/tools/clean-duplicates`
- API: `POST /api/v1/accounts/tools/debug-cookie-extract`

建议通过 API 调用，而不是直接运行脚本。
""",
        
        "syn_backend/scripts/maintenance/README.md": """# Backend Maintenance Scripts

后端维护脚本。

## 使用方式
这些脚本的功能已集成到 FastAPI 接口中：
- API: `POST /api/v1/system/sync-database`
- API: `GET /api/v1/system/check-config`

建议通过 API 调用。
""",
        
        "syn_backend/scripts/utilities/README.md": """# Utility Scripts

工具脚本集合。

## 脚本说明
- `inspect_biliup.py`: Biliup 检查工具
- `read_biliup_source.py`: Biliup 源码读取
""",
        
        "archive/deprecated/README.md": """# Deprecated Modules

已废弃的模块入口文件。

这些文件已被 FastAPI 模块化结构取代：
- `accounts.py` → `fastapi_app/api/v1/accounts/`
- `campaigns.py` → `fastapi_app/api/v1/campaigns/`
- `recovery.py` → `fastapi_app/api/v1/recovery/`

保留仅供历史参考，**不应在新代码中使用**。
""",
        
        "config/README.md": """# Configuration Files

项目配置文件。

- `conf.example.py`: 配置示例文件
- `conf.py`: 实际配置文件 (不要提交到 Git)

**注意**: FastAPI 项目使用 `.env` 文件进行配置，这些 Python 配置文件可能已过时。
""",
    }
    
    for path, content in readmes.items():
        readme_path = ROOT_DIR / path
        readme_path.parent.mkdir(parents=True, exist_ok=True)
        with open(readme_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✓ {path}")


def create_summary_report(moved, skipped, errors, deleted, backup_dir):
    """创建总结报告"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    report = f"""
# 项目文件重组报告

**执行时间**: {timestamp}
**备份位置**: {backup_dir}

## 📊 统计信息

- ✅ 移动文件: {moved} 个
- ⊘ 跳过文件: {skipped} 个
- ✗ 错误: {errors} 个
- 🗑️ 删除文件: {deleted} 个

## 📁 新目录结构

```
SynapseAutomation/
├── tests/                      # 测试文件
│   ├── integration/           # 集成测试
│   └── config/                # 配置测试
├── scripts/                    # 维护脚本
│   └── maintenance/
├── config/                     # 配置文件
├── docs/                       # 文档
│   └── archive/               # 归档文档
├── archive/                    # 归档
│   └── deprecated/            # 废弃模块
└── syn_backend/
    ├── fastapi_app/           # FastAPI 应用 (主要开发)
    ├── db/                    # 数据库文件
    ├── scripts/               # 后端脚本
    │   ├── maintenance/
    │   └── utilities/
    └── tests/                 # 后端测试
        └── legacy/            # 旧测试
```

## ⚠️ 重要提示

1. **备份已创建**: 所有移动的文件都已备份到 `{backup_dir.name}`
2. **API 优先**: 维护脚本功能已集成到 FastAPI，建议使用 API 调用
3. **测试更新**: 测试文件路径已变更，需要更新导入路径
4. **配置迁移**: 建议使用 `.env` 文件替代 Python 配置文件

## 🔗 相关文档

- FastAPI 迁移状态: `docs/NewStruct/FASTAPI_MIGRATION_STATUS.md`
- API 文档: http://localhost:7000/api/docs
- 启动指南: `STARTUP_GUIDE.md`
"""
    
    report_path = ROOT_DIR / "REORGANIZATION_REPORT.md"
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"\n📄 报告已保存到: REORGANIZATION_REPORT.md")


def main():
    """主函数"""
    print("=" * 70)
    print("  项目文件重组工具 - FastAPI 架构")
    print("=" * 70)
    
    print("\n⚠️  此操作将重新组织项目文件结构")
    print("   建议先提交当前更改到 Git")
    print("   脚本会自动创建备份")
    
    response = input("\n是否继续? (yes/no): ")
    
    if response.lower() not in ['yes', 'y']:
        print("\n❌ 操作已取消")
        return
    
    # 执行重组
    backup_dir = create_backup()
    create_directories()
    moved, skipped, errors = move_files()
    deleted = delete_files()
    create_readme_files()
    create_summary_report(moved, skipped, errors, deleted, backup_dir)
    
    print("\n" + "=" * 70)
    print("  ✅ 重组完成!")
    print("=" * 70)
    print(f"\n📊 统计:")
    print(f"  - 移动: {moved} 个文件")
    print(f"  - 跳过: {skipped} 个文件")
    print(f"  - 错误: {errors} 个")
    print(f"  - 删除: {deleted} 个文件")
    print(f"\n💾 备份位置: {backup_dir}")
    print(f"📄 详细报告: REORGANIZATION_REPORT.md")
    print("\n" + "=" * 70)


if __name__ == "__main__":
    main()
