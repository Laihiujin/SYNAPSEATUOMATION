"""
OpenManus 发布功能测试套件
测试单一发布和矩阵发布功能

运行方式:
    python run_openmanus_tests.py
"""
import asyncio
import sys
from pathlib import Path

# 添加项目根目录到路径
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))


def print_menu():
    """显示测试菜单"""
    print("\n" + "=" * 60)
    print("OpenManus Agent 发布功能测试套件")
    print("=" * 60)
    print("\n请选择要运行的测试:")
    print()
    print("单一发布测试:")
    print("  1. 简化单一发布测试 (推荐)")
    print("  2. 完整单一发布测试")
    print()
    print("矩阵发布测试:")
    print("  3. 基础矩阵发布测试")
    print("  4. 完整矩阵发布测试")
    print("  5. 矩阵发布 + 执行测试")
    print()
    print("  0. 退出")
    print()
    print("=" * 60)


async def run_test(choice):
    """运行选定的测试"""

    if choice == "1":
        from examples.test_openmanus_single_publish import test_single_publish_simple
        await test_single_publish_simple()

    elif choice == "2":
        from examples.test_openmanus_single_publish import test_single_publish
        await test_single_publish()

    elif choice == "3":
        from examples.test_openmanus_matrix_publish import test_matrix_publish
        await test_matrix_publish()

    elif choice == "4":
        from examples.test_openmanus_matrix_publish import test_matrix_publish_full
        await test_matrix_publish_full()

    elif choice == "5":
        from examples.test_openmanus_matrix_publish import test_matrix_publish_with_execution
        await test_matrix_publish_with_execution()

    else:
        print("❌ 无效的选择")


async def main():
    """主函数"""

    while True:
        print_menu()

        try:
            choice = input("请输入选项 (0-5): ").strip()

            if choice == "0":
                print("\n👋 退出测试套件")
                break

            if choice in ["1", "2", "3", "4", "5"]:
                print(f"\n🚀 开始运行测试 {choice}...")
                print()

                try:
                    await run_test(choice)

                    print("\n✅ 测试完成")
                    input("\n按 Enter 返回主菜单...")

                except KeyboardInterrupt:
                    print("\n\n⚠️ 测试被用户中断")
                    input("\n按 Enter 返回主菜单...")

                except Exception as e:
                    print(f"\n❌ 测试执行出错: {e}")
                    import traceback
                    traceback.print_exc()
                    input("\n按 Enter 返回主菜单...")

            else:
                print("\n❌ 无效的选项，请重新选择")
                await asyncio.sleep(1)

        except KeyboardInterrupt:
            print("\n\n👋 退出测试套件")
            break

        except Exception as e:
            print(f"\n❌ 出错: {e}")
            await asyncio.sleep(1)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n👋 再见！")
