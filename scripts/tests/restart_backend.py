"""
快速重启后端服务并验证端点
"""
import subprocess
import time
import requests
import sys

print("=" * 60)
print("重启后端服务...")
print("=" * 60)

# 注意: 这个脚本需要手动重启后端
print("""
请按照以下步骤操作:

1. 停止当前的后端服务 (Ctrl+C)

2. 重新启动后端:
   cd syn_backend
   python -m uvicorn fastapi_app.main:app --reload --port 7000

3. 等待服务启动完成(约 5-10 秒)

4. 运行验证:
   python scripts/tests/verify_streaming_endpoint.py
""")

print("\n验证命令已准备好,请先重启后端服务...")
