# AI笔记工具

一款轻量级AI笔记工具，核心定位是"笔记+AI对话"一体化，解决现有AI对话内容冗长、粘贴到笔记占用大量空间的痛点。

## 核心功能

- 📝 **基础笔记编辑** - 支持Markdown格式，实时预览
- 🤖 **AI对话集成** - 与Deepseek大模型对话
- 🔗 **对话压缩** - 将冗长对话压缩为超链接，节省笔记空间
- 👁️ **链接跳转** - 点击链接查看完整对话内容

## 技术栈

| 模块 | 技术 | 说明 |
|------|------|------|
| 前端 | React + Vite + marked.js | 快速构建，轻量Markdown渲染 |
| 后端 | Node.js + Express | 轻量API服务 |
| 数据库 | SQLite (better-sqlite3) | 零配置，单文件存储 |
| 大模型 | Deepseek-v4 | 接入门槛低，成本可控 |

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd ai-note-tool
```

### 2. 配置环境变量

```bash
cp backend/.env.example backend/.env
```

编辑 `backend/.env`，填入你的Deepseek API Key：

```env
DEEPSEEK_API_KEY=your-api-key-here
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
PORT=3001
```

### 3. 安装依赖

```bash
# 一键安装（前后端）
cd backend && npm install && cd ../frontend && npm install
```

### 4. 启动服务（三种方式）

#### 方式一：一键启动（推荐）⭐

```bash
# 在项目根目录执行
./start.sh
```

输出示例：
```
🚀 启动 AI笔记工具...

1️⃣  检查端口...
2️⃣  启动后端服务 (http://localhost:3001)...
   ✅ 后端启动成功
3️⃣  启动前端服务 (http://localhost:5173)...
   ✅ 前端启动成功

==========================================
🎉 AI笔记工具已启动!

📱 前端界面: http://localhost:5173
🔌 后端API:  http://localhost:3001

🛑 停止服务: ./stop.sh
==========================================
```

停止服务：
```bash
./stop.sh
```

#### 方式二：手动启动（两个终端）

**终端1 - 启动后端：**
```bash
cd backend
npm start
```

**终端2 - 启动前端：**
```bash
cd frontend
npm run dev
```

### 5. 访问应用

- 前端：http://localhost:5173
- 后端API：http://localhost:3001

## 项目结构

```
ai-note-tool/
├── frontend/          # 前端项目
│   ├── src/
│   │   ├── pages/     # 页面组件
│   │   │   ├── NoteList.jsx    # 笔记列表页
│   │   │   ├── NoteEdit.jsx    # 笔记编辑页
│   │   │   └── AIChat.jsx      # AI对话页
│   │   ├── utils/
│   │   │   └── api.js          # API封装
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── backend/           # 后端项目
│   ├── server.js      # 主服务
│   ├── database.js    # 数据库操作
│   ├── aiService.js   # AI服务封装
│   ├── package.json
│   └── .env.example
└── README.md
```

## 核心交互流程

1. **创建笔记** → 在笔记列表页点击"新建笔记"
2. **编辑笔记** → 支持Markdown格式，可插入AI对话链接 `[chat:对话ID]`
3. **AI对话** → 切换到AI对话页，创建新对话并与AI交流
4. **压缩对话** → 点击"压缩为链接"生成对话摘要和链接
5. **嵌入笔记** → 将链接粘贴到笔记中，点击可跳转查看完整对话

## 开发计划

- [x] Day 1: 环境搭建 + 项目初始化
- [ ] Day 2: 笔记功能完善
- [ ] Day 3: AI对话功能
- [ ] Day 4: 对话压缩与链接跳转
- [ ] Day 5: 界面优化与体验提升
- [ ] Day 6: 测试与Bug修复
- [ ] Day 7: 部署准备与文档完善

## License

MIT