"""
更新 OpenManus Agent 模型配置
将慢速的 QwQ-32B 改为快速的 Qwen2.5-72B-Instruct
"""
import sqlite3
import json

# 数据库路径
DB_PATH = r"D:\SynapseAutomation\syn_backend\db\database.db"

# 新的模型配置
NEW_MODEL = "Qwen/Qwen2.5-72B-Instruct"

print("=" * 70)
print("更新 OpenManus Agent 模型配置")
print("=" * 70)

try:
    # 连接数据库
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 查询当前配置（OpenManus 使用 function_calling 类型）
    cursor.execute("SELECT id, provider, model_name, extra_config FROM ai_model_configs WHERE service_type = 'function_calling'")
    current = cursor.fetchone()
    
    if current:
        print(f"\n当前配置:")
        print(f"  Provider: {current[1]}")
        print(f"  Model: {current[2]}")
        
        # 更新模型
        cursor.execute(
            "UPDATE ai_model_configs SET model_name = ? WHERE service_type = 'function_calling'",
            (NEW_MODEL,)
        )
        conn.commit()
        
        print(f"\n✅ 已更新为:")
        print(f"  Provider: {current[1]}")
        print(f"  Model: {NEW_MODEL}")
        print(f"\n💡 新模型优势:")
        print(f"  - 响应速度快（3-10秒）")
        print(f"  - 更擅长工具调用")
        print(f"  - 更适合 Agent 场景")
        
    else:
        print("\n❌ 未找到 OpenManus 配置")
        print("请先在前端配置 OpenManus Agent")
    
    conn.close()
    
    print("\n" + "=" * 70)
    print("配置更新完成！请重启后端以应用更改。")
    print("=" * 70)
    
except Exception as e:
    print(f"\n❌ 错误: {e}")
