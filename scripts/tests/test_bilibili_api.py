#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
B站API接口测试脚本
测试B站登录接口的两种方式: biliup.exe 和 Playwright
"""
import asyncio
import httpx
import sys
from pathlib import Path

# API基础URL
API_BASE_URL = "http://localhost:8000/api/v1"


async def test_biliup_check():
    """测试 biliup.exe 可用性检查接口"""
    print("\n" + "=" * 60)
    print("测试1: 检查biliup.exe可用性")
    print("=" * 60)

    url = f"{API_BASE_URL}/platforms/bilibili/login/biliup/check"

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url)
            print(f"状态码: {response.status_code}")
            print(f"响应内容: {response.json()}")

            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    print("✅ biliup.exe可用")
                    return True
                else:
                    print("❌ biliup.exe不可用")
                    return False
            else:
                print(f"❌ 请求失败: {response.text}")
                return False

        except Exception as e:
            print(f"❌ 请求异常: {e}")
            return False


async def test_bilibili_login_biliup(account_id: str = "test_bilibili"):
    """测试 B站登录接口 (使用biliup.exe)"""
    print("\n" + "=" * 60)
    print("测试2: B站登录 (使用biliup.exe)")
    print("=" * 60)

    url = f"{API_BASE_URL}/platforms/bilibili/login"
    payload = {
        "account_id": account_id,
        "use_biliup": True
    }

    print(f"请求URL: {url}")
    print(f"请求数据: {payload}")
    print("\n⚠️  注意: 此测试会触发真实的登录流程")
    print("请准备扫描控制台显示的二维码\n")

    confirm = input("是否继续测试登录? (y/n): ")
    if confirm.lower() != 'y':
        print("跳过登录测试")
        return False

    async with httpx.AsyncClient(timeout=300.0) as client:
        try:
            response = await client.post(url, json=payload)
            print(f"\n状态码: {response.status_code}")
            print(f"响应内容: {response.json()}")

            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    print("✅ 登录成功")
                    return True
                else:
                    print("❌ 登录失败")
                    return False
            else:
                print(f"❌ 请求失败: {response.text}")
                return False

        except Exception as e:
            print(f"❌ 请求异常: {e}")
            import traceback
            traceback.print_exc()
            return False


async def test_bilibili_login_playwright(account_id: str = "test_bilibili"):
    """测试 B站登录接口 (使用Playwright)"""
    print("\n" + "=" * 60)
    print("测试3: B站登录 (使用Playwright - 异步任务)")
    print("=" * 60)

    url = f"{API_BASE_URL}/platforms/bilibili/login"
    payload = {
        "account_id": account_id,
        "use_biliup": False
    }

    print(f"请求URL: {url}")
    print(f"请求数据: {payload}")

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload)
            print(f"\n状态码: {response.status_code}")
            print(f"响应内容: {response.json()}")

            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    task_id = data.get("data", {}).get("task_id")
                    print(f"✅ 任务创建成功")
                    print(f"任务ID: {task_id}")

                    # 查询任务状态
                    if task_id:
                        await test_task_status(task_id)
                    return True
                else:
                    print("❌ 任务创建失败")
                    return False
            else:
                print(f"❌ 请求失败: {response.text}")
                return False

        except Exception as e:
            print(f"❌ 请求异常: {e}")
            return False


async def test_task_status(task_id: str):
    """测试任务状态查询"""
    print("\n" + "=" * 60)
    print("测试4: 查询任务状态")
    print("=" * 60)

    url = f"{API_BASE_URL}/platforms/bilibili/task/{task_id}"

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url)
            print(f"状态码: {response.status_code}")
            print(f"响应内容: {response.json()}")

            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    task_data = data.get("data", {})
                    print(f"✅ 任务状态: {task_data.get('status')}")
                    return True
                else:
                    print("❌ 查询失败")
                    return False
            else:
                print(f"❌ 请求失败: {response.text}")
                return False

        except Exception as e:
            print(f"❌ 请求异常: {e}")
            return False


async def check_backend_running():
    """检查后端是否运行"""
    print("检查后端服务...")

    url = f"{API_BASE_URL}/ping"

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, timeout=5.0)
            if response.status_code == 200:
                print("✅ 后端服务正在运行")
                return True
            else:
                print("❌ 后端服务响应异常")
                return False
        except Exception as e:
            print(f"❌ 无法连接到后端服务: {e}")
            print("\n请确保后端服务已启动:")
            print("cd syn_backend")
            print("../venv/Scripts/python.exe -m uvicorn fastapi_app.main:app --host 0.0.0.0 --port 8000")
            return False


async def main():
    """主测试函数"""
    print("\n" + "=" * 60)
    print("B站API集成测试")
    print("=" * 60)

    # 检查后端服务
    if not await check_backend_running():
        sys.exit(1)

    # 测试1: 检查biliup.exe可用性
    biliup_available = await test_biliup_check()

    # 测试2: biliup.exe登录 (可选)
    if biliup_available:
        await test_bilibili_login_biliup()

    # 测试3: Playwright登录 (异步任务模式)
    print("\n是否测试Playwright登录方式? (y/n): ", end="")
    if input().lower() == 'y':
        await test_bilibili_login_playwright()

    print("\n" + "=" * 60)
    print("测试完成")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
