#!/bin/bash
# Celery Worker 启动脚本 (Linux/macOS)
# 用于运行发布任务队列

echo "============================================"
echo "  SynapseAutomation Celery Worker"
echo "============================================"
echo ""

# 检查 Redis 是否运行
echo "[1/3] 检查 Redis 服务..."
if ! redis-cli ping > /dev/null 2>&1; then
    echo "❌ Redis 未运行，请先启动 Redis 服务"
    echo "   命令: redis-server"
    exit 1
fi
echo "✅ Redis 运行正常"

echo ""
echo "[2/3] 切换到项目目录..."
cd "$(dirname "$0")/syn_backend" || exit 1

echo ""
echo "[3/3] 启动 Celery Worker..."
echo ""
echo "任务队列: 发布任务（publish.single, publish.batch）"
echo "Broker: Redis (从 .env 读取 REDIS_URL)"
echo ""

# 启动 Celery Worker
python -m celery -A fastapi_app.tasks.celery_app worker \
    --loglevel=info \
    --concurrency=3 \
    --hostname=synapse-worker@%h
