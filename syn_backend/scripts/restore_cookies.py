"""
Cookie备份还原工具
从备份中还原Cookie文件
"""
import os
import sys
import shutil
from pathlib import Path
from datetime import datetime
from collections import defaultdict
import argparse

# 设置Windows控制台UTF-8编码
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')


BASE_DIR = Path(__file__).parent.parent
COOKIES_DIR = BASE_DIR / "cookiesFile"
BACKUP_DIR = COOKIES_DIR / "backups"


def list_backup_timestamps():
    """
    列出所有可用的备份时间点
    返回：{timestamp: [file1, file2, ...]}
    """
    if not BACKUP_DIR.exists():
        print("❌ 备份目录不存在")
        return {}

    backups = defaultdict(list)

    for file in BACKUP_DIR.glob("*.json"):
        # 文件名格式: account_xxx_YYYYMMDD_HHMMSS.json
        parts = file.stem.split('_')
        if len(parts) >= 3:
            # 提取时间戳（倒数第二和最后一个部分）
            try:
                timestamp = f"{parts[-2]}_{parts[-1]}"
                backups[timestamp].append(file.name)
            except:
                continue

    return dict(backups)


def format_timestamp(timestamp: str) -> str:
    """格式化时间戳为可读格式"""
    try:
        # timestamp格式: YYYYMMDD_HHMMSS
        date_part, time_part = timestamp.split('_')
        dt = datetime.strptime(f"{date_part}{time_part}", "%Y%m%d%H%M%S")
        return dt.strftime("%Y年%m月%d日 %H:%M:%S")
    except:
        return timestamp


def restore_from_timestamp(timestamp: str, dry_run: bool = False):
    """
    从指定时间点还原所有Cookie文件

    Args:
        timestamp: 时间戳（格式：YYYYMMDD_HHMMSS）
        dry_run: 仅显示操作，不实际还原
    """
    backups = list_backup_timestamps()

    if timestamp not in backups:
        print(f"❌ 未找到时间戳为 {timestamp} 的备份")
        print(f"\n可用的备份时间点:")
        for ts in sorted(backups.keys(), reverse=True):
            print(f"  {ts} ({format_timestamp(ts)}) - {len(backups[ts])} 个文件")
        return False

    files_to_restore = backups[timestamp]

    print(f"\n{'='*70}")
    print(f"🔄 {'[预览模式] ' if dry_run else ''}还原备份: {format_timestamp(timestamp)}")
    print(f"{'='*70}")
    print(f"\n将还原 {len(files_to_restore)} 个Cookie文件:\n")

    restored_count = 0

    for backup_filename in sorted(files_to_restore):
        # 提取原始文件名（去掉时间戳）
        # 格式: account_xxx_YYYYMMDD_HHMMSS.json -> account_xxx.json
        parts = backup_filename.replace('.json', '').split('_')

        # 找到时间戳的位置（倒数第二个_之前的所有部分）
        original_parts = []
        for i, part in enumerate(parts):
            # 检查是否是日期格式（8位数字）
            if len(part) == 8 and part.isdigit():
                # 这是时间戳的开始，取之前的所有部分
                original_parts = parts[:i]
                break

        if not original_parts:
            print(f"  ⚠️ 跳过: {backup_filename} (无法解析)")
            continue

        original_filename = '_'.join(original_parts) + '.json'

        backup_path = BACKUP_DIR / backup_filename
        target_path = COOKIES_DIR / original_filename

        if dry_run:
            print(f"  📄 {original_filename}")
            print(f"      ← {backup_filename}")
        else:
            try:
                # 如果目标文件存在，先备份当前的
                if target_path.exists():
                    current_backup = COOKIES_DIR / f"{target_path.stem}_before_restore_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
                    shutil.copy2(target_path, BACKUP_DIR / current_backup.name)
                    print(f"  💾 备份当前文件: {current_backup.name}")

                # 还原备份
                shutil.copy2(backup_path, target_path)
                print(f"  ✅ {original_filename}")
                restored_count += 1
            except Exception as e:
                print(f"  ❌ 还原失败: {original_filename} - {e}")

    if dry_run:
        print(f"\n{'='*70}")
        print(f"ℹ️ 这是预览模式，未实际还原文件")
        print(f"💡 要执行还原，请使用: python {Path(__file__).name} --timestamp {timestamp}")
    else:
        print(f"\n{'='*70}")
        print(f"✅ 成功还原 {restored_count}/{len(files_to_restore)} 个文件")

    return True


def restore_single_file(account_id: str, timestamp: str = None, dry_run: bool = False):
    """
    还原单个账号的Cookie文件

    Args:
        account_id: 账号ID（如 account_1765444091550）
        timestamp: 指定时间戳，如果为None则使用最新的备份
        dry_run: 仅显示操作，不实际还原
    """
    if not BACKUP_DIR.exists():
        print("❌ 备份目录不存在")
        return False

    # 查找该账号的所有备份
    pattern = f"{account_id}_*.json"
    backups = list(BACKUP_DIR.glob(pattern))

    if not backups:
        print(f"❌ 未找到账号 {account_id} 的备份")
        return False

    # 如果指定了时间戳，查找匹配的备份
    if timestamp:
        target_backup = None
        for backup in backups:
            if timestamp in backup.name:
                target_backup = backup
                break

        if not target_backup:
            print(f"❌ 未找到时间戳为 {timestamp} 的备份")
            print(f"\n该账号可用的备份:")
            for backup in sorted(backups, key=lambda x: x.stat().st_mtime, reverse=True):
                mtime = datetime.fromtimestamp(backup.stat().st_mtime)
                print(f"  {backup.name} - {mtime.strftime('%Y-%m-%d %H:%M:%S')}")
            return False
    else:
        # 使用最新的备份
        target_backup = max(backups, key=lambda x: x.stat().st_mtime)

    # 目标文件路径
    target_path = COOKIES_DIR / f"{account_id}.json"

    backup_time = datetime.fromtimestamp(target_backup.stat().st_mtime)

    print(f"\n{'='*70}")
    print(f"🔄 {'[预览模式] ' if dry_run else ''}还原单个账号")
    print(f"{'='*70}")
    print(f"账号ID: {account_id}")
    print(f"备份文件: {target_backup.name}")
    print(f"备份时间: {backup_time.strftime('%Y年%m月%d日 %H:%M:%S')}")
    print(f"目标位置: {target_path.name}")

    if dry_run:
        print(f"\nℹ️ 这是预览模式，未实际还原文件")
        return True

    try:
        # 如果目标文件存在，先备份
        if target_path.exists():
            current_backup = BACKUP_DIR / f"{account_id}_before_restore_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            shutil.copy2(target_path, current_backup)
            print(f"\n💾 已备份当前文件: {current_backup.name}")

        # 还原备份
        shutil.copy2(target_backup, target_path)
        print(f"✅ 成功还原文件")
        return True

    except Exception as e:
        print(f"❌ 还原失败: {e}")
        return False


def show_available_backups():
    """显示所有可用的备份时间点"""
    backups = list_backup_timestamps()

    if not backups:
        print("❌ 没有找到任何备份")
        return

    print(f"\n{'='*70}")
    print("📦 可用的备份时间点")
    print(f"{'='*70}\n")

    # 按时间倒序排列
    for timestamp in sorted(backups.keys(), reverse=True):
        files = backups[timestamp]
        print(f"🕐 {format_timestamp(timestamp)}")
        print(f"   时间戳: {timestamp}")
        print(f"   文件数: {len(files)} 个")

        # 显示前5个文件名
        for i, filename in enumerate(sorted(files)[:5]):
            print(f"   - {filename}")

        if len(files) > 5:
            print(f"   ... 还有 {len(files) - 5} 个文件")
        print()


def main():
    parser = argparse.ArgumentParser(description='Cookie备份还原工具')
    parser.add_argument('--list', '-l', action='store_true', help='列出所有可用的备份时间点')
    parser.add_argument('--timestamp', '-t', help='指定要还原的时间戳（格式：YYYYMMDD_HHMMSS）')
    parser.add_argument('--account', '-a', help='还原单个账号（如：account_1765444091550）')
    parser.add_argument('--latest', action='store_true', help='还原最新的备份')
    parser.add_argument('--dry-run', action='store_true', help='预览模式，不实际还原文件')

    args = parser.parse_args()

    if args.list:
        show_available_backups()
    elif args.account:
        restore_single_file(args.account, args.timestamp, args.dry_run)
    elif args.timestamp:
        restore_from_timestamp(args.timestamp, args.dry_run)
    elif args.latest:
        # 还原最新的备份
        backups = list_backup_timestamps()
        if backups:
            latest_timestamp = max(backups.keys())
            print(f"🔍 找到最新备份: {format_timestamp(latest_timestamp)}")
            restore_from_timestamp(latest_timestamp, args.dry_run)
        else:
            print("❌ 没有找到任何备份")
    else:
        # 默认显示帮助
        show_available_backups()
        print("\n💡 使用提示:")
        print("  查看所有备份:        python restore_cookies.py --list")
        print("  还原最新备份:        python restore_cookies.py --latest")
        print("  还原指定时间备份:    python restore_cookies.py --timestamp 20251215_111712")
        print("  预览还原操作:        python restore_cookies.py --timestamp 20251215_111712 --dry-run")
        print("  还原单个账号:        python restore_cookies.py --account account_1765444091550")


if __name__ == "__main__":
    main()
