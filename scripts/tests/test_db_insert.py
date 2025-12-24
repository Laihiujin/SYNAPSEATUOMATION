"""测试数据库插入功能"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "syn_backend"))

from myUtils.cookie_manager import cookie_manager

# 测试插入一个虚拟账号
test_account = {
    "id": "test_account_debug",
    "name": "测试账号DEBUG",
    "status": "valid",
    "cookie": {"test": "data"},
    "user_id": "test_user_12345",
    "avatar": "https://example.com/avatar.jpg",
    "note": "调试测试账号"
}

try:
    print("=" * 60)
    print("测试数据库插入功能")
    print("=" * 60)

    # 尝试添加账号
    print(f"\n1. 尝试添加测试账号: {test_account['id']}")
    cookie_manager.add_account(
        platform_name="kuaishou",
        account_details=test_account
    )
    print("✅ 账号添加成功")

    # 尝试读取账号
    print(f"\n2. 尝试读取账号: {test_account['id']}")
    account = cookie_manager.get_account_by_id(test_account['id'])
    if account:
        print(f"✅ 账号读取成功:")
        print(f"   - ID: {account['account_id']}")
        print(f"   - Name: {account['name']}")
        print(f"   - UserID: {account['user_id']}")
        print(f"   - Platform: {account['platform']}")
    else:
        print("❌ 账号读取失败：未找到")

    # 删除测试账号
    print(f"\n3. 清理测试账号: {test_account['id']}")
    cookie_manager.delete_account(test_account['id'])
    print("✅ 测试账号已删除")

    print("\n" + "=" * 60)
    print("✅ 数据库功能正常")
    print("=" * 60)

except Exception as e:
    print(f"\n❌ 测试失败: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
