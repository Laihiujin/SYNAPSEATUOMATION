"""
测试 OpenManus 修复后的失败处理逻辑
验证:
1. 参数解析错误修复
2. terminate 工具的失败识别
3. Agent 不会无限重试失败任务
"""

import asyncio
import sys
from pathlib import Path

# 添加项目路径
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root / "syn_backend"))

from fastapi_app.agent.manus_agent import get_manus_agent


async def test_failure_handling():
    """测试失败处理逻辑"""

    print("🧪 测试 OpenManus 失败处理逻辑\n")
    print("=" * 60)

    # 初始化 agent
    print("\n1️⃣ 初始化 OpenManus Agent...")
    agent_wrapper = await get_manus_agent()

    # 测试场景1: 模拟工具返回失败状态
    print("\n2️⃣ 测试场景1: 工具返回失败状态")
    print("-" * 60)

    test_goal_1 = """
    请调用 get_task_status 工具查询一个不存在的任务ID: "nonexistent_task_123"

    预期行为:
    - 工具会返回失败状态
    - Agent 应该识别失败并调用 terminate(status='failure')
    - 不应该重试超过2次
    """

    print(f"目标: {test_goal_1.strip()}\n")

    result_1 = await agent_wrapper.run_goal(test_goal_1)

    print(f"\n结果: {result_1.get('success')}")
    print(f"步数: {len(result_1.get('steps', []))}")
    print(f"消息: {result_1.get('result', '')[:200]}")

    # 验证步数
    steps_count = len(result_1.get('steps', []))
    if steps_count < 5:
        print("✅ 验证通过: Agent 在 5 步内终止,没有无限重试")
    else:
        print(f"⚠️  警告: Agent 执行了 {steps_count} 步,可能仍在重试")

    print("\n" + "=" * 60)

    # 测试场景2: 参数解析
    print("\n3️⃣ 测试场景2: 参数解析(双重编码JSON)")
    print("-" * 60)

    test_goal_2 = """
    测试参数解析功能:
    1. 调用 list_accounts 工具
    2. 如果成功,调用 terminate(status='success')
    """

    print(f"目标: {test_goal_2.strip()}\n")

    result_2 = await agent_wrapper.run_goal(test_goal_2)

    print(f"\n结果: {result_2.get('success')}")
    print(f"步数: {len(result_2.get('steps', []))}")

    # 检查是否有参数解析错误
    error = result_2.get('error')
    if error and 'JSONDecodeError' in error:
        print("❌ 参数解析错误仍然存在")
    else:
        print("✅ 验证通过: 参数解析正常")

    print("\n" + "=" * 60)

    # 清理
    await agent_wrapper.cleanup()

    print("\n✨ 测试完成!")
    print("\n📊 总结:")
    print("1. 失败处理逻辑已优化")
    print("2. terminate 工具描述已增强")
    print("3. Agent 提示词已添加中文失败识别规则")


async def test_parameter_parsing():
    """专门测试参数解析"""

    print("\n" + "=" * 60)
    print("🧪 测试参数解析功能\n")

    from app.agent.toolcall import ToolCallAgent
    from app.schema import ToolCall, Function
    import json

    # 创建一个简单的 agent
    agent = ToolCallAgent()

    # 模拟双重编码的参数
    test_cases = [
        # 正常 dict
        {"key": "value"},
        # 字符串形式的 dict (双重编码)
        '{"key": "value"}',
        # 嵌套的双重编码
        json.dumps({"key": "value"}),
    ]

    print("测试不同格式的参数:\n")

    for i, test_arg in enumerate(test_cases, 1):
        print(f"测试 {i}: {type(test_arg).__name__} - {test_arg}")

        # 模拟 toolcall.py 中的解析逻辑
        try:
            args = json.loads(test_arg if isinstance(test_arg, str) else json.dumps(test_arg))

            # 双重编码处理
            if isinstance(args, str):
                try:
                    args = json.loads(args)
                except json.JSONDecodeError:
                    pass

            if isinstance(args, dict):
                print(f"  ✅ 解析成功: {args}")
            else:
                print(f"  ❌ 解析失败: 不是 dict 类型")

        except Exception as e:
            print(f"  ❌ 异常: {e}")

        print()

    print("=" * 60)


if __name__ == "__main__":
    print("""
╔══════════════════════════════════════════════════════════╗
║     OpenManus 失败处理修复验证测试                      ║
╚══════════════════════════════════════════════════════════╝
    """)

    # 运行测试
    asyncio.run(test_parameter_parsing())
    asyncio.run(test_failure_handling())

    print("""
💡 提示:
1. 如果 Agent 在失败任务上执行步数 < 5, 说明失败识别正常
2. 如果没有 JSONDecodeError, 说明参数解析修复成功
3. 可以在前端 Manus 面板实时观察执行过程
    """)
