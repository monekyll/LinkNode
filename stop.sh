#!/bin/bash

# AI笔记工具停止脚本
# 使用: ./stop.sh

echo "🛑 停止 AI笔记工具..."

# 从PID文件停止
if [ -f /tmp/ai-note-backend.pid ]; then
    PID=$(cat /tmp/ai-note-backend.pid)
    if kill -0 $PID 2>/dev/null; then
        kill $PID 2>/dev/null
        echo "  ✅ 后端服务已停止"
    fi
    rm -f /tmp/ai-note-backend.pid
fi

if [ -f /tmp/ai-note-frontend.pid ]; then
    PID=$(cat /tmp/ai-note-frontend.pid)
    if kill -0 $PID 2>/dev/null; then
        kill $PID 2>/dev/null
        echo "  ✅ 前端服务已停止"
    fi
    rm -f /tmp/ai-note-frontend.pid
fi

# 清理端口
echo "  清理端口..."
lsof -Pi :3001 -sTCP:LISTEN -t 2>/dev/null | xargs kill -9 2>/dev/null
lsof -Pi :5173 -sTCP:LISTEN -t 2>/dev/null | xargs kill -9 2>/dev/null

echo ""
echo "✅ 所有服务已停止"
