#!/bin/bash

# AI笔记工具一键启动脚本
# 使用: ./start.sh

echo "🚀 启动 AI笔记工具..."
echo ""

# 获取项目根目录
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

# 检查端口是否被占用
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# 杀死占用端口的进程
kill_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "  释放端口 $1..."
        lsof -Pi :$1 -sTCP:LISTEN -t | xargs kill -9 2>/dev/null
        sleep 1
    fi
}

echo "1️⃣  检查端口..."
kill_port 3001
kill_port 5173

echo ""
echo "2️⃣  启动后端服务 (http://localhost:3001)..."
cd "$PROJECT_DIR/backend"
npm start > /tmp/ai-note-backend.log 2>&1 &
BACKEND_PID=$!
echo "   后端 PID: $BACKEND_PID"

# 等待后端启动
echo "   等待后端启动..."
for i in {1..10}; do
    if curl -s http://localhost:3001/api/health >/dev/null 2>&1; then
        echo "   ✅ 后端启动成功"
        break
    fi
    sleep 1
done

echo ""
echo "3️⃣  启动前端服务 (http://localhost:5173)..."
cd "$PROJECT_DIR/frontend"
npm run dev > /tmp/ai-note-frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   前端 PID: $FRONTEND_PID"

echo ""
echo "4️⃣  等待前端启动..."
for i in {1..15}; do
    if curl -s http://localhost:5173 >/dev/null 2>&1; then
        echo "   ✅ 前端启动成功"
        break
    fi
    sleep 1
done

echo ""
echo "=========================================="
echo "🎉 AI笔记工具已启动!"
echo ""
echo "📱 前端界面: http://localhost:5173"
echo "🔌 后端API:  http://localhost:3001"
echo ""
echo "📝 日志文件:"
echo "   后端: /tmp/ai-note-backend.log"
echo "   前端: /tmp/ai-note-frontend.log"
echo ""
echo "🛑 停止服务: ./stop.sh"
echo "=========================================="

# 保存PID供停止脚本使用
echo "$BACKEND_PID" > /tmp/ai-note-backend.pid
echo "$FRONTEND_PID" > /tmp/ai-note-frontend.pid
