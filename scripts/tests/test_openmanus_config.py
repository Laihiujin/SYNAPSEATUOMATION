"""
测试 OpenManus 实际使用的模型配置
"""
import asyncio
import sys
from pathlib import Path

# 添加路径
sys.path.insert(0, str(Path(__file__).parent))

async def test_openmanus_config():
    """测试 OpenManus 配置"""
    print("=" * 60)
    print("测试 OpenManus 配置")
    print("=" * 60)

    # 1. 检查数据库配置
    print("\n1. 数据库中的 function_calling 配置:")
    import sqlite3
    conn = sqlite3.connect(r"D:\SynapseAutomation\syn_backend\db\database.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM ai_model_configs WHERE service_type = 'function_calling' AND is_active = 1")
    row = cursor.fetchone()
    if row:
        db_config = dict(row)
        print(f"   Provider: {db_config['provider']}")
        print(f"   Model: {db_config['model_name']}")
        print(f"   Base URL: {db_config['base_url']}")
        print(f"   API Key: {db_config['api_key'][:20]}...")
    else:
        print("   ❌ 未找到配置")
    conn.close()

    # 2. 检查 config.toml
    print("\n2. config.toml 中的配置:")
    import tomllib
    config_path = Path(__file__).parent / "OpenManus-worker" / "config" / "config.toml"
    with open(config_path, "rb") as f:
        toml_config = tomllib.load(f)
    print(f"   Provider: {toml_config['llm'].get('provider', 'N/A')}")
    print(f"   Model: {toml_config['llm']['model']}")
    print(f"   Base URL: {toml_config['llm']['base_url']}")
    print(f"   API Key: {toml_config['llm']['api_key'][:20]}...")

    # 3. 初始化 OpenManus 并检查实际配置
    print("\n3. 初始化 OpenManus Agent...")
    from fastapi_app.agent.manus_agent import get_manus_agent

    try:
        agent = await get_manus_agent()
        print("   ✅ OpenManus Agent 初始化成功")

        # 4. 检查 OpenManus 实际使用的配置
        print("\n4. OpenManus 实际使用的配置:")

        # 添加 OpenManus 到路径
        openmanus_path = Path(__file__).parent / "OpenManus-worker"
        if str(openmanus_path) not in sys.path:
            sys.path.insert(0, str(openmanus_path))

        # 检查 config
        from app.config import config as openmanus_config
        llm_settings = openmanus_config.llm["default"]
        print(f"   Model: {llm_settings.model}")
        print(f"   Base URL: {llm_settings.base_url}")
        print(f"   API Key: {llm_settings.api_key[:20]}...")
        print(f"   API Type: {llm_settings.api_type}")

        # 5. 检查 LLM 实例
        print("\n5. LLM 实例缓存:")
        from app.llm import LLM
        print(f"   缓存的实例: {list(LLM._instances.keys())}")
        if "default" in LLM._instances:
            llm_instance = LLM._instances["default"]
            print(f"   Default LLM 模型: {llm_instance.model}")
            print(f"   Default LLM Base URL: {llm_instance.base_url}")
            print(f"   Default LLM API Key: {llm_instance.api_key[:20]}...")

        # 6. 测试配置是否匹配
        print("\n6. 配置匹配检查:")
        if db_config and "default" in LLM._instances:
            llm_instance = LLM._instances["default"]
            if llm_instance.model == db_config['model_name']:
                print(f"   ✅ 模型匹配: {llm_instance.model}")
            else:
                print(f"   ❌ 模型不匹配!")
                print(f"      数据库配置: {db_config['model_name']}")
                print(f"      实际使用: {llm_instance.model}")

            if llm_instance.base_url == db_config['base_url']:
                print(f"   ✅ Base URL 匹配")
            else:
                print(f"   ❌ Base URL 不匹配!")
                print(f"      数据库配置: {db_config['base_url']}")
                print(f"      实际使用: {llm_instance.base_url}")

    except Exception as e:
        print(f"   ❌ 初始化失败: {e}")
        import traceback
        traceback.print_exc()

    print("\n" + "=" * 60)

if __name__ == "__main__":
    asyncio.run(test_openmanus_config())
