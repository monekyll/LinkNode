import axios from 'axios'

const API_BASE = '/api'

// 笔记相关API
export const noteApi = {
  // 获取所有笔记
  getAll: () => axios.get(`${API_BASE}/notes`),
  
  // 获取单个笔记
  getById: (id) => axios.get(`${API_BASE}/notes/${id}`),
  
  // 创建笔记
  create: (data) => axios.post(`${API_BASE}/notes`, data),
  
  // 更新笔记
  update: (id, data) => axios.put(`${API_BASE}/notes/${id}`, data),
  
  // 删除笔记
  delete: (id) => axios.delete(`${API_BASE}/notes/${id}`),
}

// AI对话相关API
export const chatApi = {
  // 获取所有对话
  getAll: () => axios.get(`${API_BASE}/chats`),
  
  // 获取单个对话
  getById: (id) => axios.get(`${API_BASE}/chats/${id}`),
  
  // 创建新对话
  create: () => axios.post(`${API_BASE}/chats`),
  
  // 发送消息
  sendMessage: (chatId, message) => axios.post(`${API_BASE}/chats/${chatId}/messages`, { message }),
  
  // 生成对话摘要
  generateSummary: (chatId) => axios.post(`${API_BASE}/chats/${chatId}/summary`),
  
  // 删除对话
  delete: (id) => axios.delete(`${API_BASE}/chats/${id}`),
}