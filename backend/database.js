const fs = require('fs')
const path = require('path')

const DATA_FILE = path.join(__dirname, 'data.json')

// 内存数据存储
let data = {
  notes: [],
  chats: [],
  nextNoteId: 1,
  nextChatId: 1
}

// 从文件加载数据
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const rawData = fs.readFileSync(DATA_FILE, 'utf-8')
      data = JSON.parse(rawData)
      console.log('数据加载成功')
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

// 保存数据到文件
function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('保存数据失败:', error)
  }
}

// 初始化数据库
async function initDatabase() {
  loadData()
  console.log('数据库初始化完成')
}

// 笔记相关操作
const noteDB = {
  // 获取所有笔记
  getAll: async () => {
    return data.notes.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
  },

  // 获取单个笔记
  getById: async (id) => {
    return data.notes.find(n => n.id === parseInt(id))
  },

  // 创建笔记
  create: async (noteData) => {
    const note = {
      id: data.nextNoteId++,
      title: noteData.title || '',
      content: noteData.content || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    data.notes.push(note)
    saveData()
    return { id: note.id }
  },

  // 更新笔记
  update: async (id, noteData) => {
    const note = data.notes.find(n => n.id === parseInt(id))
    if (!note) throw new Error('笔记不存在')
    
    note.title = noteData.title !== undefined ? noteData.title : note.title
    note.content = noteData.content !== undefined ? noteData.content : note.content
    note.updated_at = new Date().toISOString()
    
    saveData()
    return { id: note.id }
  },

  // 删除笔记
  delete: async (id) => {
    const index = data.notes.findIndex(n => n.id === parseInt(id))
    if (index === -1) throw new Error('笔记不存在')
    
    data.notes.splice(index, 1)
    saveData()
    return { id: parseInt(id) }
  }
}

// AI对话相关操作
const chatDB = {
  // 获取所有对话
  getAll: async () => {
    return data.chats.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
  },

  // 获取单个对话
  getById: async (id) => {
    return data.chats.find(c => c.id === parseInt(id))
  },

  // 创建对话
  create: async () => {
    const chat = {
      id: data.nextChatId++,
      messages: '[]',
      summary: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    data.chats.push(chat)
    saveData()
    return { id: chat.id }
  },

  // 更新对话消息
  updateMessages: async (id, messages) => {
    const chat = data.chats.find(c => c.id === parseInt(id))
    if (!chat) throw new Error('对话不存在')
    
    chat.messages = JSON.stringify(messages)
    chat.updated_at = new Date().toISOString()
    
    saveData()
    return { id: chat.id }
  },

  // 更新对话摘要
  updateSummary: async (id, summary) => {
    const chat = data.chats.find(c => c.id === parseInt(id))
    if (!chat) throw new Error('对话不存在')
    
    chat.summary = summary
    chat.updated_at = new Date().toISOString()
    
    saveData()
    return { id: chat.id }
  },

  // 删除对话
  delete: async (id) => {
    const index = data.chats.findIndex(c => c.id === parseInt(id))
    if (index === -1) throw new Error('对话不存在')
    
    data.chats.splice(index, 1)
    saveData()
    return { id: parseInt(id) }
  }
}

module.exports = {
  initDatabase,
  noteDB,
  chatDB
}