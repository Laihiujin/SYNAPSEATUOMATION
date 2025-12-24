"""
测试素材文件重命名 API
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_rename_file():
    """测试文件重命名功能"""

    # 1. 获取文件列表
    print("📋 获取素材列表...")
    response = requests.get(f"{BASE_URL}/api/v1/files")
    files = response.json()["data"]

    if not files:
        print("❌ 没有可用的素材文件")
        return

    # 选择第一个文件进行测试
    test_file = files[0]
    file_id = test_file["id"]
    original_filename = test_file["filename"]

    print(f"✅ 选择测试文件: ID={file_id}, 原文件名={original_filename}")

    # 2. 测试重命名（仅修改数据库）
    print("\n📝 测试 1: 仅修改数据库显示名称...")
    new_name_1 = "测试重命名_仅数据库.mp4"
    rename_data_1 = {
        "new_filename": new_name_1,
        "update_disk_file": False
    }

    response = requests.patch(
        f"{BASE_URL}/api/v1/files/{file_id}/rename",
        json=rename_data_1
    )

    if response.status_code == 200:
        result = response.json()
        print(f"✅ 成功: {result['message']}")
        print(f"   新文件名: {result['data']['new_filename']}")
        print(f"   磁盘已更新: {result['data']['disk_updated']}")
    else:
        print(f"❌ 失败: {response.text}")
        return

    # 3. 验证数据库更新
    print("\n🔍 验证数据库更新...")
    response = requests.get(f"{BASE_URL}/api/v1/files/{file_id}")
    file_info = response.json()["data"]
    print(f"   数据库 filename: {file_info['filename']}")

    # 4. 测试重命名（同步磁盘文件）
    print("\n📝 测试 2: 同步修改磁盘文件名...")
    new_name_2 = "测试重命名_同步磁盘.mp4"
    rename_data_2 = {
        "new_filename": new_name_2,
        "update_disk_file": True
    }

    response = requests.patch(
        f"{BASE_URL}/api/v1/files/{file_id}/rename",
        json=rename_data_2
    )

    if response.status_code == 200:
        result = response.json()
        print(f"✅ 成功: {result['message']}")
        print(f"   新文件名: {result['data']['new_filename']}")
        print(f"   磁盘已更新: {result['data']['disk_updated']}")
    else:
        print(f"❌ 失败: {response.text}")
        return

    # 5. 测试文件名冲突
    print("\n📝 测试 3: 文件名冲突检测...")
    if len(files) > 1:
        conflict_name = files[1]["filename"]
        rename_data_3 = {
            "new_filename": conflict_name,
            "update_disk_file": True
        }

        response = requests.patch(
            f"{BASE_URL}/api/v1/files/{file_id}/rename",
            json=rename_data_3
        )

        if response.status_code == 400:
            print(f"✅ 正确拒绝冲突: {response.json().get('detail', 'unknown error')}")
        else:
            print(f"⚠️ 预期应该失败但成功了")

    # 6. 恢复原文件名
    print(f"\n♻️ 恢复原文件名: {original_filename}")
    restore_data = {
        "new_filename": original_filename,
        "update_disk_file": True
    }

    response = requests.patch(
        f"{BASE_URL}/api/v1/files/{file_id}/rename",
        json=restore_data
    )

    if response.status_code == 200:
        print("✅ 已恢复原文件名")
    else:
        print(f"❌ 恢复失败: {response.text}")

    print("\n🎉 测试完成！")

if __name__ == "__main__":
    try:
        test_rename_file()
    except requests.exceptions.ConnectionError:
        print("❌ 无法连接到后端服务，请确保 FastAPI 服务正在运行")
    except Exception as e:
        print(f"❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()
