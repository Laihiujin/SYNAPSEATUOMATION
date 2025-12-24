#!/usr/bin/env python
"""
测试后端启动
"""
import sys
from pathlib import Path

# 添加syn_backend到路径
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "syn_backend"))

try:
    print("Testing imports...")
    from fastapi_app.main import app
    print("SUCCESS: All imports successful!")
    print("Starting server...")
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7000)
except Exception as e:
    print(f"ERROR: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
