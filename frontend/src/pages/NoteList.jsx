import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { marked } from 'marked'
import { noteApi } from '../utils/api'

function NoteList() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadNotes()
  }, [])

  const loadNotes = async () => {
    try {
      const res = await noteApi.getAll()
      console.log('加载笔记成功:', res.data)
      setNotes(res.data)
    } catch (error) {
      console.error('加载笔记失败:', error)
      const errorMsg = error.response?.data?.error || error.message || '未知错误'
      alert('加载笔记失败: ' + errorMsg + '\n请确保后端服务已启动 (npm start)')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!confirm('确定要删除这条笔记吗？')) return
    
    try {
      await noteApi.delete(id)
      setNotes(notes.filter(n => n.id !== id))
    } catch (error) {
      alert('删除失败')
    }
  }

  // 渲染内容，处理AI对话链接
  const renderContent = (content) => {
    if (!content) return ''
    // 将 [chat:xxx] 格式的链接转换为可点击元素
    const processedContent = content.replace(
      /\[chat:(\d+)\]/g, 
      '<span class="compressed-link">🤖 查看AI对话</span>'
    )
    return { __html: marked.parse(processedContent) }
  }

  if (loading) {
    return <div className="empty-state">加载中...</div>
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">我的笔记</h1>
        <button className="btn btn-primary" onClick={() => navigate('/notes/new')}>
          + 新建笔记
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="empty-state">
          <p>还没有笔记，点击右上角创建第一条笔记吧~</p>
        </div>
      ) : (
        <div className="notes-list">
          {notes.map(note => (
            <div 
              key={note.id} 
              className="card"
              onClick={() => navigate(`/notes/edit/${note.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="card-title">{note.title || '无标题'}</div>
              <div 
                className="card-content"
                dangerouslySetInnerHTML={renderContent(note.content)}
              />
              <div className="card-meta">
                <span>更新于 {new Date(note.updated_at).toLocaleString()}</span>
                <button 
                  className="btn btn-danger" 
                  style={{ marginLeft: '10px', padding: '4px 8px', fontSize: '12px' }}
                  onClick={(e) => handleDelete(note.id, e)}
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default NoteList