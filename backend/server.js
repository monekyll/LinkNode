const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
require('dotenv').config()

const { initDatabase, noteDB, chatDB } = require('./database')
const { chatCompletion, generateSummary } = require('./aiService')

const app = express()
const PORT = process.env.PORT || 3001

// 中间件
app.use(cors())
app.use(bodyParser.json())

// 初始化数据库并启动服务器
async function startServer() {
  try {
    await initDatabase()
    
    // ========== 笔记相关接口 ==========

    // 获取所有笔记
    app.get('/api/notes', async (req, res) => {
      try {
        const notes = await noteDB.getAll()
        res.json(notes)
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
    })

    // 获取单个笔记
    app.get('/api/notes/:id', async (req, res) => {
      try {
        const note = await noteDB.getById(req.params.id)
        if (!note) {
          return res.status(404).json({ error: '笔记不存在' })
        }
        res.json(note)
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
    })

    // 创建笔记
    app.post('/api/notes', async (req, res) => {
      try {
        const result = await noteDB.create(req.body)
        res.json({ id: result.id, message: '创建成功' })
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
    })

    // 更新笔记
    app.put('/api/notes/:id', async (req, res) => {
      try {
        await noteDB.update(req.params.id, req.body)
        res.json({ message: '更新成功' })
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
    })

    // 删除笔记
    app.delete('/api/notes/:id', async (req, res) => {
      try {
        await noteDB.delete(req.params.id)
        res.json({ message: '删除成功' })
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
    })

    // ========== AI对话相关接口 ==========

    // 获取所有对话
    app.get('/api/chats', async (req, res) => {
      try {
        const chats = await chatDB.getAll()
        res.json(chats)
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
    })

    // 获取单个对话
    app.get('/api/chats/:id', async (req, res) => {
      try {
        const chat = await chatDB.getById(req.params.id)
        if (!chat) {
          return res.status(404).json({ error: '对话不存在' })
        }
        res.json(chat)
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
    })

    // 创建新对话
    app.post('/api/chats', async (req, res) => {
      try {
        const result = await chatDB.create()
        res.json({ id: result.id, message: '对话创建成功' })
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
    })

    // 发送消息
    app.post('/api/chats/:id/messages', async (req, res) => {
      try {
        const chat = await chatDB.getById(req.params.id)
        if (!chat) {
          return res.status(404).json({ error: '对话不存在' })
        }

        const { message } = req.body
        if (!message) {
          return res.status(400).json({ error: '消息不能为空' })
        }

        // 解析历史消息
        let messages = JSON.parse(chat.messages || '[]')
        
        // 添加用户消息
        messages.push({ role: 'user', content: message })

        // 调用AI获取回复
        const aiMessages = messages.map(m => ({
          role: m.role,
          content: m.content
        }))
        
        const reply = await chatCompletion(aiMessages)
        
        // 添加AI回复
        messages.push({ role: 'assistant', content: reply })

        // 保存到数据库
        await chatDB.updateMessages(req.params.id, messages)

        res.json({ reply })
      } catch (error) {
        console.error('发送消息失败:', error)
        res.status(500).json({ error: error.message })
      }
    })

    // 生成对话摘要
    app.post('/api/chats/:id/summary', async (req, res) => {
      try {
        const chat = await chatDB.getById(req.params.id)
        if (!chat) {
          return res.status(404).json({ error: '对话不存在' })
        }

        const messages = JSON.parse(chat.messages || '[]')
        if (messages.length === 0) {
          return res.status(400).json({ error: '对话为空' })
        }

        // 生成摘要
        const summary = await generateSummary(messages)
        
        // 保存摘要
        await chatDB.updateSummary(req.params.id, summary)

        res.json({ summary })
      } catch (error) {
        console.error('生成摘要失败:', error)
        res.status(500).json({ error: error.message })
      }
    })

    // 删除对话
    app.delete('/api/chats/:id', async (req, res) => {
      try {
        await chatDB.delete(req.params.id)
        res.json({ message: '删除成功' })
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
    })

    // 健康检查
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', time: new Date().toISOString() })
    })

    app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`)
    })
    
  } catch (error) {
    console.error('启动服务器失败:', error)
    process.exit(1)
  }
}

startServer()