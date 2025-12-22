"""
OpenManus 流式执行测试脚本
测试 SSE 流式传输功能
"""

import asyncio
import sys
from pathlib import Path

# 添加项目路径
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

import httpx


async def test_manus_stream():
    """测试 OpenManus 流式执行"""

    print("🚀 开始测试 OpenManus 流式执行...\n")

    url = "http://localhost:7000/api/v1/agent/manus-stream"

    # 测试任务
    request_data = {
        "goal": "列出系统中所有可用的账号",
        "context": None,
        "require_confirmation": False
    }

    print(f"📝 任务: {request_data['goal']}\n")
    print("=" * 60)

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream("POST", url, json=request_data) as response:
                if response.status_code != 200:
                    print(f"❌ 请求失败: {response.status_code}")
                    print(await response.aread())
                    return

                print("✅ 连接成功,开始接收流式事件:\n")

                event_count = 0
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        event_count += 1
                        import json
                        try:
                            event = json.loads(line[6:])
                            event_type = event.get("type", "unknown")

                            # 美化输出不同类型的事件
                            if event_type == "init":
                                print(f"🔧 初始化: {event.get('message', '')}")

                            elif event_type == "thinking":
                                print(f"🤔 思考: {event.get('content', '')}")

                            elif event_type == "plan":
                                plan = event.get('plan', {})
                                print(f"\n📋 执行计划:")
                                print(f"   目标: {plan.get('goal', '')}")
                                print(f"   预计步数: {plan.get('estimated_steps', 'N/A')}")
                                print(f"   策略: {plan.get('strategy', '')}")
                                tools = plan.get('available_tools', [])
                                if tools:
                                    print(f"   可用工具:")
                                    for tool in tools[:3]:  # 只显示前3个
                                        print(f"     • {tool.get('name', '')}")
                                print()

                            elif event_type == "tool_call":
                                step = event.get('step', '?')
                                tool_name = event.get('tool_name', 'unknown')
                                print(f"🔧 步骤 {step}: 调用工具 [{tool_name}]")

                            elif event_type == "step_complete":
                                step = event.get('step', '?')
                                result = event.get('result', '')
                                result_preview = str(result)[:50]
                                print(f"✅ 步骤 {step}: 完成 - {result_preview}...")

                            elif event_type == "final_result":
                                result = event.get('result', {})
                                print(f"\n🎉 最终结果:")
                                print(f"   {result.get('message', '')}")
                                print(f"   执行步数: {result.get('steps_executed', 'N/A')}\n")

                            elif event_type == "error":
                                error = event.get('error', 'Unknown error')
                                print(f"❌ 错误: {error}")

                            elif event_type == "done":
                                print(f"\n✨ 流式执行完成 (共接收 {event_count} 个事件)")

                            else:
                                print(f"📨 事件 [{event_type}]: {event}")

                        except json.JSONDecodeError as e:
                            print(f"⚠️  解析事件失败: {line}")

    except httpx.ConnectError:
        print("❌ 连接失败,请确保后端服务已启动 (http://localhost:7000)")
    except Exception as e:
        print(f"❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()


async def test_simple_task():
    """测试简单任务(验证动态步数)"""

    print("\n" + "=" * 60)
    print("🧪 测试简单任务 (验证动态步数)\n")

    url = "http://localhost:7000/api/v1/agent/manus-stream"

    request_data = {
        "goal": "获取系统上下文信息",
        "context": None,
        "require_confirmation": False
    }

    print(f"📝 任务: {request_data['goal']}\n")

    steps_count = 0

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream("POST", url, json=request_data) as response:
                if response.status_code != 200:
                    print(f"❌ 请求失败: {response.status_code}")
                    return

                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        import json
                        try:
                            event = json.loads(line[6:])
                            if event.get("type") == "step_complete":
                                steps_count += 1
                            elif event.get("type") == "done":
                                print(f"\n✅ 任务完成,共执行 {steps_count} 步")
                                if steps_count < 20:
                                    print("🎯 验证通过: 步数 < 20,说明实现了动态终止!")
                                else:
                                    print("⚠️  步数 = 20,可能仍是固定步数")
                        except:
                            pass

    except Exception as e:
        print(f"❌ 测试失败: {e}")


if __name__ == "__main__":
    print("""
╔══════════════════════════════════════════════════════════╗
║     OpenManus 流式执行测试                               ║
║     测试 SSE 实时传输功能                                ║
╚══════════════════════════════════════════════════════════╝
    """)

    asyncio.run(test_manus_stream())

    # 额外测试动态步数
    asyncio.run(test_simple_task())

    print("\n" + "=" * 60)
    print("✨ 所有测试完成!")
    print("\n💡 提示: 打开前端查看 Manus 面板的实时展示效果")
    print("   URL: http://localhost:3000/ai-agent")
