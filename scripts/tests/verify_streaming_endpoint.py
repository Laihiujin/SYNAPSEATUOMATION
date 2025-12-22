"""
验证流式端点是否正常工作
"""
import requests
import json

BASE_URL = "http://localhost:7000"

def test_endpoint_exists():
    """测试端点是否存在"""
    print("1. 测试端点是否存在...")

    url = f"{BASE_URL}/api/v1/agent/manus-stream"

    try:
        response = requests.post(
            url,
            json={"goal": "test", "context": None, "require_confirmation": False},
            timeout=5,
            stream=True
        )

        if response.status_code == 200:
            print("   ✅ 端点存在且响应正常")
            return True
        elif response.status_code == 404:
            print("   ❌ 端点不存在 (404)")
            return False
        else:
            print(f"   ⚠️  端点响应异常: {response.status_code}")
            return False

    except requests.exceptions.ConnectionError:
        print("   ❌ 无法连接到后端服务")
        print("   请确保后端服务已启动: python -m uvicorn fastapi_app.main:app --reload --port 7000")
        return False
    except Exception as e:
        print(f"   ❌ 测试失败: {e}")
        return False


def test_streaming():
    """测试流式响应"""
    print("\n2. 测试流式响应...")

    url = f"{BASE_URL}/api/v1/agent/manus-stream"

    try:
        response = requests.post(
            url,
            json={
                "goal": "列出所有账号",
                "context": None,
                "require_confirmation": False
            },
            timeout=60,
            stream=True
        )

        if response.status_code != 200:
            print(f"   ❌ 请求失败: {response.status_code}")
            print(f"   响应: {response.text}")
            return False

        print("   ✅ 开始接收流式事件:")

        event_count = 0
        for line in response.iter_lines():
            if line:
                line_str = line.decode('utf-8')
                if line_str.startswith('data: '):
                    event_count += 1
                    try:
                        event = json.loads(line_str[6:])
                        event_type = event.get('type', 'unknown')
                        print(f"      - 事件 {event_count}: {event_type}")

                        # 只接收前 5 个事件作为测试
                        if event_count >= 5:
                            print("   ✅ 流式响应正常 (已接收 5 个事件)")
                            return True
                    except json.JSONDecodeError:
                        print(f"      ⚠️  解析失败: {line_str}")

        print(f"   ✅ 流式响应完成,共接收 {event_count} 个事件")
        return True

    except Exception as e:
        print(f"   ❌ 测试失败: {e}")
        return False


def check_docs():
    """检查 API 文档"""
    print("\n3. 检查 API 文档...")

    try:
        response = requests.get(f"{BASE_URL}/docs", timeout=5)
        if "manus-stream" in response.text:
            print("   ✅ 端点已在 API 文档中")
            return True
        else:
            print("   ⚠️  端点未在 API 文档中显示")
            return False
    except Exception as e:
        print(f"   ❌ 无法访问 API 文档: {e}")
        return False


if __name__ == "__main__":
    print("=" * 60)
    print("验证 OpenManus 流式端点")
    print("=" * 60)
    print()

    # 测试 1: 端点存在
    if not test_endpoint_exists():
        print("\n❌ 端点不存在,请检查:")
        print("   1. 后端服务是否已重启")
        print("   2. streaming.py 是否正确导入")
        print("   3. router.py 是否正确包含 streaming_router")
        exit(1)

    # 测试 2: 流式响应
    if not test_streaming():
        print("\n⚠️  流式响应测试失败")
        exit(1)

    # 测试 3: API 文档
    check_docs()

    print("\n" + "=" * 60)
    print("✅ 所有测试通过!")
    print("=" * 60)
    print("\n现在可以在前端 Manus 模式中测试流式执行了")
