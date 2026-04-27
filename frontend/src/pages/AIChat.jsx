import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { chatApi } from '../utils/api'

function AIChat() {
  const { chatId } = useParams()
  const navigate = useNavigate()
  const messagesEndRef = useRef(null)
  
  const [chats, setChats] = useState([])
  const [currentChat, setCurrentChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatingSummary, setGeneratingSummary] = useState(false)

  // 加载对话列表
  useEffect(() => {
    loadChats()
  }, [])

  // 加载当前对话
  useEffect(() => {
    if (chatId) {
      loadChatDetail(chatId)
    } else {
      setCurrentChat(null)
      setMessages([])
    }
  }, [chatId])

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadChats = async () => {
    try {
      const res = await chatApi.getAll()
      setChats(res.data)
    } catch (error) {
      console.error('加载对话列表失败:', error)
    }
  }

  const loadChatDetail = async (id) => {
    try {
      const res = await chatApi.getById(id)
      setCurrentChat(res.data)
      setMessages(JSON.parse(res.data.messages || '[]'))
    } catch (error) {
      console.error('加载对话详情失败:', error)
    }
  }

  const createNewChat = async () => {
    try {
      const res = await chatApi.create()
      await loadChats()
      navigate(`/chat/${res.data.id}`)
    } catch (error) {
      alert('创建对话失败')
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || !currentChat) return

    const userMessage = inputMessage.trim()
    setInputMessage('')
    setLoading(true)

    // 先添加用户消息到界面
    const newMessages = [...messages, { role: 'user', content: userMessage }]
    setMessages(newMessages)

    try {
      const res = await chatApi.sendMessage(currentChat.id, userMessage)
      // 添加AI回复
      setMessages([...newMessages, { role: 'assistant', content: res.data.reply }])
    } catch (error) {
      alert('发送消息失败')
    } finally {
      setLoading(false)
    }
  }

  const generateSummary = async () => {
    if (!currentChat || messages.length === 0) return
    
    setGeneratingSummary(true)
    try {
      const res = await chatApi.generateSummary(currentChat.id)
      alert(`对话摘要：${res.data.summary}\n\n已复制到剪贴板，可粘贴到笔记中！`)
      // 复制到剪贴板
      navigator.clipboard.writeText(`[chat:${currentChat.id}]`)
    } catch (error) {
      alert('生成摘要失败')
    } finally {
      setGeneratingSummary(false)
    }
  }

  const deleteChat = async (id, e) => {
    e.stopPropagation()
    if (!confirm('确定要删除这个对话吗？')) return
    
    try {
      await chatApi.delete(id)
      if (chatId === String(id)) {
        navigate('/chat')
      }
      await loadChats()
    } catch (error) {
      alert('删除失败')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 120px)', gap: '16px' }}>
      {/* 左侧对话列表 */}
      <div style={{ width: '240px', flexShrink: 0 }}>
        <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <button 
            className="btn btn-primary" 
            onClick={createNewChat}
            style={{ marginBottom: '16px' }}
          >
            + 新对话
          </button>
          
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {chats.map(chat => (
              <div
                key={chat.id}
                onClick={() => navigate(`/chat/${chat.id}`)}
                style={{
                  padding: '12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  marginBottom: '8px',
                  backgroundColor: chatId === String(chat.id) ? '#e6f7ff' : '#f5f5f5',
                  border: chatId === String(chat.id) ? '1px solid #1890ff' : '1px solid transparent',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {chat.summary || `对话 #${chat.id}`}
                </div>
                <button
                  className="btn btn-danger"
                  style={{ padding: '2px 6px', fontSize: '12px' }}
                  onClick={(e) => deleteChat(chat.id, e)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 右侧对话区域 */}
      <div style={{ flex: 1 }}>
        <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {!currentChat ? (
            <div className="empty-state">
              <p>选择一个对话或创建新对话开始聊天</p>
            </div>
          ) : (
            <>
              {/* 消息列表 */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                {messages.length === 0 ? (
                  <div className="empty-state">
                    <p>发送消息开始与AI对话</p>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        marginBottom: '16px'
                      }}
                    >
                      <div
                        style={{
                          maxWidth: '80%',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          backgroundColor: msg.role === 'user' ? '#1890ff' : '#f0f0f0',
                          color: msg.role === 'user' ? 'white' : '#333',
                          whiteSpace: 'pre-wrap'
                        }}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* 输入区域 */}
              <div style={{ borderTop: '1px solid #e0e0e0', padding: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={generateSummary}
                    disabled={generatingSummary || messages.length === 0}
                  >
                    {generatingSummary ? '生成中...' : '📎 压缩为链接'}
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="输入消息，按Enter发送，Shift+Enter换行..."
                    style={{
                      flex: 1,
                      padding: '12px',
                      border: '1px solid #d9d9d9',
                      borderRadius: '4px',
                      resize: 'none',
                      height: '60px',
                      fontFamily: 'inherit'
                    }}
                    disabled={loading}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={sendMessage}
                    disabled={loading || !inputMessage.trim()}
                    style={{ alignSelf: 'flex-end' }}
                  >
                    {loading ? '发送中...' : '发送'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AIChat