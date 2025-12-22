"""
代码清理脚本 - 删除冗余登录和Cookie校验实现

⚠️ 警告: 此脚本将删除55+个冗余文件
⚠️ 仅在所有平台验证通过后执行!

执行前检查:
1. 所有平台登录功能正常
2. version_switch.py 中所有平台都设为 True
3. 已备份数据库和重要数据

使用方法:
    python scripts/cleanup_legacy_code.py --dry-run  # 预览将删除的文件
    python scripts/cleanup_legacy_code.py --execute  # 执行删除
"""
import argparse
import os
import shutil
from pathlib import Path
from typing import List, Tuple


# 定义要删除的文件和目录
LEGACY_FILES_TO_DELETE = {
    "登录逻辑 (6+个文件)": [
        "syn_backend/myUtils/login.py",
        "syn_backend/myUtils/login_bilibili.py",
        "syn_backend/myUtils/login_bilibili_biliup.py",
        "syn_backend/myUtils/login_simple.py",
        "syn_backend/myUtils/qr_login.py",
        "syn_backend/myUtils/login_cookie_hook.py",
    ],

    "登录模块目录": [
        "syn_backend/myUtils/login_modules/",
    ],

    "Cookie校验器 (5个文件)": [
        "syn_backend/myUtils/cookie_validator.py",
        "syn_backend/myUtils/fast_cookie_validator.py",
        "syn_backend/myUtils/concurrent_cookie_validator.py",
        "syn_backend/myUtils/cookie_backup.py",
        "syn_backend/myUtils/cookie_monitor.py",
    ],

    "Examples目录 (7个文件)": [
        "syn_backend/examples/get_douyin_cookie.py",
        "syn_backend/examples/get_kuaishou_cookie.py",
        "syn_backend/examples/get_xiaohongshu_cookie.py",
        "syn_backend/examples/get_tencent_cookie.py",
        "syn_backend/examples/get_bilibili_cookie.py",
        "syn_backend/examples/get_baijiahao_cookie.py",
        "syn_backend/examples/get_tk_cookie.py",
    ],

    "旧API实现": [
        "syn_backend/fastapi_app/api/login.py",
        "syn_backend/fastapi_app/api/v1/auth/douyin_service.py",
        "syn_backend/fastapi_app/api/v1/auth/services_fix.py",
    ],

    "遗留测试": [
        "syn_backend/tests/legacy/",
        "syn_backend/scripts/test_cookie_check.py",
        "syn_backend/scripts/test_creator_center_access.py",
        "syn_backend/scripts/test_full_flow.py",
    ],

    "旧平台实现": [
        "syn_backend/platforms/douyin/login.py",
        "syn_backend/platforms/verification.py",
    ],
}


def get_project_root() -> Path:
    """获取项目根目录"""
    current = Path(__file__).resolve()
    # 假设此脚本在 scripts/ 目录下
    if current.parent.name == "scripts":
        return current.parent.parent
    # 或在项目根目录
    return current.parent


def check_file_exists(file_path: Path) -> bool:
    """检查文件或目录是否存在"""
    return file_path.exists()


def get_file_size(file_path: Path) -> int:
    """获取文件或目录大小 (字节)"""
    if file_path.is_file():
        return file_path.stat().st_size
    elif file_path.is_dir():
        total = 0
        for item in file_path.rglob("*"):
            if item.is_file():
                total += item.stat().st_size
        return total
    return 0


def format_size(size_bytes: int) -> str:
    """格式化文件大小"""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.2f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.2f} TB"


def preview_deletion(project_root: Path) -> Tuple[List[Path], int]:
    """预览将要删除的文件"""
    files_to_delete = []
    total_size = 0

    print("="*80)
    print("预览将要删除的文件:")
    print("="*80)

    for category, paths in LEGACY_FILES_TO_DELETE.items():
        print(f"\n[{category}]")
        category_count = 0
        category_size = 0

        for path_str in paths:
            file_path = project_root / path_str
            exists = check_file_exists(file_path)

            if exists:
                size = get_file_size(file_path)
                size_str = format_size(size)
                file_type = "DIR " if file_path.is_dir() else "FILE"
                print(f"  [OK] [{file_type}] {path_str:60} ({size_str})")
                files_to_delete.append(file_path)
                category_count += 1
                category_size += size
                total_size += size
            else:
                print(f"  [SKIP] {path_str:60} (not found)")

        if category_count > 0:
            print(f"  小计: {category_count} 项, {format_size(category_size)}")

    print("\n" + "="*80)
    print(f"总计: {len(files_to_delete)} 项, {format_size(total_size)}")
    print("="*80)

    return files_to_delete, total_size


def execute_deletion(files_to_delete: List[Path], dry_run: bool = True):
    """执行删除操作"""
    if dry_run:
        print("\n[DRY RUN] 这是预览模式,不会真正删除文件")
        print("使用 --execute 参数执行实际删除")
        return

    print("\n" + "="*80)
    print("开始删除文件...")
    print("="*80)

    deleted_count = 0
    failed_count = 0

    for file_path in files_to_delete:
        try:
            if file_path.is_dir():
                shutil.rmtree(file_path)
                print(f"[OK] Deleted directory: {file_path}")
            else:
                file_path.unlink()
                print(f"[OK] Deleted file: {file_path}")
            deleted_count += 1
        except Exception as e:
            print(f"[FAIL] Delete failed: {file_path} - {e}")
            failed_count += 1

    print("\n" + "="*80)
    print(f"删除完成: 成功 {deleted_count} 项, 失败 {failed_count} 项")
    print("="*80)

    if failed_count > 0:
        print("\n⚠️ 部分文件删除失败,请检查权限或手动删除")


def check_v2_status(project_root: Path) -> bool:
    """检查是否所有平台都切换到V2"""
    version_switch_file = project_root / "syn_backend" / "fastapi_app" / "api" / "v1" / "auth" / "version_switch.py"

    if not version_switch_file.exists():
        print("⚠️ 警告: 找不到 version_switch.py")
        return False

    content = version_switch_file.read_text(encoding="utf-8")

    # 检查全局开关
    if "USE_V2_LOGIN_SERVICES = False" in content:
        print("❌ 错误: USE_V2_LOGIN_SERVICES 未启用")
        return False

    # 检查各平台开关
    required_switches = [
        '"bilibili": True',
        '"douyin": True',
        '"kuaishou": True',
        '"xiaohongshu": True',
        '"tencent": True',
    ]

    for switch in required_switches:
        if switch not in content:
            platform = switch.split('"')[1]
            print(f"❌ 错误: {platform} 未切换到V2")
            return False

    print("OK - All platforms switched to V2")
    return True


def main():
    parser = argparse.ArgumentParser(description="删除冗余的登录和Cookie校验代码")
    parser.add_argument("--dry-run", action="store_true", help="预览模式,不实际删除")
    parser.add_argument("--execute", action="store_true", help="执行实际删除")
    parser.add_argument("--skip-check", action="store_true", help="跳过V2状态检查")

    args = parser.parse_args()

    project_root = get_project_root()
    print(f"项目根目录: {project_root}")

    # 检查V2状态
    if not args.skip_check:
        print("\n[Step 1] 检查V2服务状态...")
        if not check_v2_status(project_root):
            print("\n❌ 错误: 请先确保所有平台都切换到V2服务!")
            print("修改 syn_backend/fastapi_app/api/v1/auth/version_switch.py")
            return 1

    # 预览删除
    print("\n[Step 2] 预览将要删除的文件...")
    files_to_delete, total_size = preview_deletion(project_root)

    if not files_to_delete:
        print("\nOK - No files to delete")
        return 0

    # 执行删除
    if args.execute:
        confirm = input("\n[WARNING] Confirm deletion of all files above? (type 'yes' to confirm): ")
        if confirm.lower() != "yes":
            print("Deletion cancelled")
            return 0

        execute_deletion(files_to_delete, dry_run=False)
    else:
        execute_deletion(files_to_delete, dry_run=True)

    return 0


if __name__ == "__main__":
    exit(main())
