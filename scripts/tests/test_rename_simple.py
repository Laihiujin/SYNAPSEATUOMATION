"""
Simple test for material file rename API
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_rename():
    print("=== Material File Rename API Test ===\n")

    # 1. Get file list
    print("Step 1: Getting file list...")
    response = requests.get(f"{BASE_URL}/api/v1/files?limit=5")
    if response.status_code != 200:
        print(f"Error: {response.text}")
        return

    files = response.json()["data"]
    if not files:
        print("No files available")
        return

    test_file = files[0]
    file_id = test_file["id"]
    original_filename = test_file["filename"]

    print(f"Test file: ID={file_id}, filename={original_filename}\n")

    # 2. Test rename (database only)
    print("Step 2: Rename database only...")
    new_name_1 = "test_rename_db_only.mp4"
    data_1 = {
        "new_filename": new_name_1,
        "update_disk_file": False
    }

    response = requests.patch(f"{BASE_URL}/api/v1/files/{file_id}/rename", json=data_1)
    if response.status_code == 200:
        result = response.json()
        print(f"Success: {result['message']}")
        print(f"New filename: {result['data']['new_filename']}")
        print(f"Disk updated: {result['data']['disk_updated']}\n")
    else:
        print(f"Failed: {response.text}\n")

    # 3. Verify database update
    print("Step 3: Verify database...")
    response = requests.get(f"{BASE_URL}/api/v1/files/{file_id}")
    if response.status_code == 200:
        file_info = response.json()["data"]
        print(f"Database filename: {file_info['filename']}\n")

    # 4. Test rename with disk sync
    print("Step 4: Rename with disk sync...")
    new_name_2 = "test_rename_with_disk.mp4"
    data_2 = {
        "new_filename": new_name_2,
        "update_disk_file": True
    }

    response = requests.patch(f"{BASE_URL}/api/v1/files/{file_id}/rename", json=data_2)
    if response.status_code == 200:
        result = response.json()
        print(f"Success: {result['message']}")
        print(f"New filename: {result['data']['new_filename']}")
        print(f"Disk updated: {result['data']['disk_updated']}\n")
    else:
        print(f"Failed: {response.text}\n")

    # 5. Restore original filename
    print(f"Step 5: Restore original filename: {original_filename}")
    restore_data = {
        "new_filename": original_filename,
        "update_disk_file": True
    }

    response = requests.patch(f"{BASE_URL}/api/v1/files/{file_id}/rename", json=restore_data)
    if response.status_code == 200:
        print("Restored successfully\n")
    else:
        print(f"Restore failed: {response.text}\n")

    print("=== Test Complete ===")

if __name__ == "__main__":
    try:
        test_rename()
    except requests.exceptions.ConnectionError:
        print("Error: Cannot connect to backend (http://localhost:8000)")
        print("Please ensure FastAPI service is running")
    except Exception as e:
        print(f"Test failed: {e}")
        import traceback
        traceback.print_exc()
