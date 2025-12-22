"""
简单测试 OpenManus 使用的模型配置
"""
import asyncio
import sys
from pathlib import Path

async def test_manus_model():
    print("=" * 60)
    print("Test OpenManus Model Configuration")
    print("=" * 60)

    # 1. 查看数据库配置
    import sqlite3
    conn = sqlite3.connect(r"D:\SynapseAutomation\syn_backend\db\database.db")
    cursor = conn.cursor()
    cursor.execute("SELECT model_name FROM ai_model_configs WHERE service_type = 'function_calling' AND is_active = 1")
    row = cursor.fetchone()
    db_model = row[0] if row else "Not configured"
    conn.close()
    print(f"\nDB Model: {db_model}")

    # 2. 查看 config.toml 当前内容
    config_path = Path(r"D:\SynapseAutomation\syn_backend\OpenManus-worker\config\config.toml")
    with open(config_path, "r", encoding="utf-8") as f:
        content = f.read()

    import re
    model_match = re.search(r'model\s*=\s*"([^"]+)"', content)
    toml_model = model_match.group(1) if model_match else "Not found"
    print(f"config.toml Model: {toml_model}")

    # 3. 初始化 OpenManus 并验证
    print("\nInitializing OpenManus Agent...")
    sys.path.insert(0, str(Path(__file__).parent))

    try:
        from fastapi_app.agent.manus_agent import get_manus_agent
        agent = await get_manus_agent()
        print("OpenManus Agent initialized successfully")

        # 4. 再次检查 config.toml（应该已被更新）
        with open(config_path, "r", encoding="utf-8") as f:
            new_content = f.read()

        model_match = re.search(r'model\s*=\s*"([^"]+)"', new_content)
        updated_model = model_match.group(1) if model_match else "Not found"
        print(f"Updated config.toml Model: {updated_model}")

        # 5. 验证是否匹配
        if updated_model == db_model:
            print(f"\nSUCCESS! OpenManus now uses DB model: {updated_model}")
        else:
            print(f"\nFAILED! Model mismatch")
            print(f"   DB: {db_model}")
            print(f"   Actual: {updated_model}")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(test_manus_model())
