"""
测试 OpenManus Agent - 矩阵发布
使用自然语言指令完成多平台、多账号、多素材的矩阵发布任务
"""
import asyncio
import sys
from pathlib import Path

# 添加项目根目录到路径
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from fastapi_app.agent.manus_agent import run_goal


async def test_matrix_publish():
    """测试矩阵发布"""

    print("=" * 60)
    print("OpenManus Agent - 矩阵发布测试")
    print("=" * 60)
    print()

    # 场景 1: 小规模矩阵发布（2平台 × 2素材）
    goal_1 = """
    请帮我完成一个小规模的矩阵发布任务：

    1. 查看系统中有哪些可用的视频素材（前5个）
    2. 选择前2个素材用于发布
    3. 查看抖音和快手平台分别有哪些可用账号
    4. 生成矩阵发布任务，将这2个素材发布到抖音和快手的所有可用账号

    发布内容：
    - 标题: "生活日常 | 记录美好时刻"
    - 描述: "分享日常生活的精彩片段，每一帧都值得记录 #生活记录 #日常vlog"
    - 话题: ["生活记录", "日常vlog", "美好时刻"]

    完成后显示：
    - 生成的任务总数
    - 批次ID
    - 各平台的任务分布
    """

    print("📝 测试场景 1: 小规模矩阵发布（2平台 × 2素材）")
    print("-" * 60)
    print(f"目标: {goal_1.strip()}")
    print()

    result_1 = await run_goal(goal_1)

    print("\n" + "=" * 60)
    print("执行结果:")
    print("=" * 60)
    print(f"成功: {result_1['success']}")
    print(f"结果:\n{result_1['result']}")
    if result_1['error']:
        print(f"错误: {result_1['error']}")
    print(f"\n执行步骤数: {len(result_1['steps'])}")

    print("\n详细步骤:")
    for i, step in enumerate(result_1['steps'], 1):
        tool_name = step.get('tool', 'unknown')
        print(f"  {i}. {tool_name}")

    print("\n")
    input("按 Enter 继续查看任务状态...")
    print("\n")

    # 场景 2: 查看矩阵任务状态
    goal_2 = """
    请查看当前矩阵发布任务的状态：
    - 总任务数
    - 待处理任务数
    - 运行中任务数
    - 已完成任务数
    - 失败任务数
    """

    print("📝 测试场景 2: 查看矩阵任务状态")
    print("-" * 60)

    result_2 = await run_goal(goal_2)

    print("\n执行结果:")
    print("-" * 60)
    print(result_2['result'])

    print("\n")
    confirm = input("是否执行矩阵任务？(yes/no): ")
    print()

    if confirm.lower() == "yes":
        # 场景 3: 执行矩阵任务
        goal_3 = """
        请执行矩阵任务队列中的下一个任务：
        1. 从任务队列弹出一个待执行任务
        2. 执行该任务（发布视频）
        3. 报告执行结果（成功/失败）
        """

        print("📝 测试场景 3: 执行矩阵任务")
        print("-" * 60)

        result_3 = await run_goal(goal_3)

        print("\n执行结果:")
        print("-" * 60)
        print(f"成功: {result_3['success']}")
        print(f"结果:\n{result_3['result']}")
        if result_3['error']:
            print(f"错误: {result_3['error']}")

    print("\n")
    print("=" * 60)
    print("矩阵发布测试完成！")
    print("=" * 60)


async def test_matrix_publish_full():
    """测试完整的矩阵发布流程（多平台）"""

    print("=" * 60)
    print("OpenManus Agent - 完整矩阵发布测试")
    print("=" * 60)
    print()

    goal = """
    请帮我完成一个完整的矩阵发布流程：

    阶段 1 - 准备工作：
    1. 查看系统中可用的视频素材（显示前10个）
    2. 查看所有平台（抖音、快手、小红书、B站、视频号）的可用账号数量
    3. 总结当前可用资源（素材数、各平台账号数）

    阶段 2 - 生成矩阵任务：
    4. 选择前3个素材
    5. 生成矩阵发布任务，覆盖以下平台：
       - 抖音 (douyin)
       - 快手 (kuaishou)
       - 小红书 (xiaohongshu)

    发布内容配置：
    - 标题: "矩阵发布测试 | 多平台同步分享"
    - 描述: "测试 OpenManus Agent 的矩阵发布功能，实现多平台一键分发 #自动化 #矩阵发布 #测试"
    - 话题: ["自动化", "矩阵发布", "测试"]
    - 批次名称: "openmanus_test_batch_001"

    阶段 3 - 结果报告：
    6. 显示生成的任务总数
    7. 显示批次ID
    8. 显示各平台的任务分布
    9. 显示当前矩阵任务队列状态

    注意：
    - 请使用平台适配器确保内容格式符合各平台要求
    - 抖音标题最多30字，标签合并到描述
    - 快手将标题和描述合并
    - 小红书标题最多20字
    """

    print(f"目标:\n{goal.strip()}")
    print()
    print("开始执行...")
    print("-" * 60)

    result = await run_goal(goal)

    print("\n" + "=" * 60)
    print("执行结果:")
    print("=" * 60)
    print(f"✅ 成功: {result['success']}")

    if result['success']:
        print(f"\n📝 详细结果:")
        print("-" * 60)
        print(result['result'])
    else:
        print(f"\n❌ 错误: {result['error']}")

    print(f"\n📊 执行步骤数: {len(result['steps'])}")
    print("\n🔧 使用的工具:")
    for i, step in enumerate(result['steps'], 1):
        tool_name = step.get('tool', 'unknown')
        print(f"  {i}. {tool_name}")

    print("\n" + "=" * 60)

    return result


async def test_matrix_publish_with_execution():
    """测试矩阵发布并执行任务"""

    print("=" * 60)
    print("OpenManus Agent - 矩阵发布 + 执行测试")
    print("=" * 60)
    print()

    # 步骤 1: 生成矩阵任务
    goal_generate = """
    请生成一个小规模的矩阵发布任务：

    1. 获取前2个视频素材
    2. 生成矩阵任务，发布到抖音和快手平台
    3. 使用以下内容：
       - 标题: "测试发布 | OpenManus 矩阵测试"
       - 描述: "测试 OpenManus 智能发布系统 #测试 #自动化"
       - 话题: ["测试", "自动化"]
    """

    print("步骤 1: 生成矩阵任务")
    print("-" * 60)

    result_gen = await run_goal(goal_generate)

    if not result_gen['success']:
        print(f"❌ 生成任务失败: {result_gen['error']}")
        return

    print(f"✅ 任务生成成功")
    print(result_gen['result'])
    print()

    # 步骤 2: 查看任务状态
    goal_status = "请查看当前矩阵任务的状态统计"

    print("\n步骤 2: 查看任务状态")
    print("-" * 60)

    result_status = await run_goal(goal_status)
    print(result_status['result'])
    print()

    # 步骤 3: 执行一个任务
    confirm = input("是否执行一个矩阵任务进行测试？(yes/no): ")

    if confirm.lower() == "yes":
        goal_execute = "请执行矩阵任务队列中的下一个任务，并报告执行结果"

        print("\n步骤 3: 执行任务")
        print("-" * 60)

        result_exec = await run_goal(goal_execute)

        print(f"\n✅ 执行{'成功' if result_exec['success'] else '失败'}")
        print(result_exec['result'])
        if result_exec['error']:
            print(f"错误: {result_exec['error']}")

    print("\n" + "=" * 60)
    print("矩阵发布 + 执行测试完成！")
    print("=" * 60)


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1:
        if sys.argv[1] == "full":
            # 完整矩阵测试
            asyncio.run(test_matrix_publish_full())
        elif sys.argv[1] == "exec":
            # 矩阵发布 + 执行
            asyncio.run(test_matrix_publish_with_execution())
        else:
            print("用法:")
            print("  python test_openmanus_matrix_publish.py       # 基础测试")
            print("  python test_openmanus_matrix_publish.py full  # 完整测试")
            print("  python test_openmanus_matrix_publish.py exec  # 发布+执行")
    else:
        # 基础测试
        asyncio.run(test_matrix_publish())
