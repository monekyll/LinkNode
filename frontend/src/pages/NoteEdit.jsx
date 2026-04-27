import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { marked } from 'marked'
import { noteApi } from '../utils/api'

function NoteEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  // 通过路径判断是新建还是编辑
  // 路径 /notes/new -> 新建
  // 路径 /notes/edit/:id -> 编辑
  const isNew = !id || window.location.hash.includes('/notes/new')
  
  // 调试信息
  console.log('NoteEdit - 路由参数 id:', id)
  console.log('NoteEdit - isNew:', isNew)
  
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [preview, setPreview] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isNew && id) {
      loadNote()
    }
  }, [id])

  const loadNote = async () => {
    try {
      const res = await noteApi.getById(id)
      setTitle(res.data.title || '')
      setContent(res.data.content || '')
    } catch (error) {
      alert('加载笔记失败')
      navigate('/')
    }
  }

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) {
      alert('标题或内容不能为空')
      return
    }

    setSaving(true)
    try {
      const data = { title, content }
      console.log('handleSave - id:', id, 'isNew:', isNew)
      console.log('正在保存笔记:', data)
      if (isNew) {
        console.log('调用 create API')
        const res = await noteApi.create(data)
        console.log('创建成功:', res.data)
      } else {
        console.log('调用 update API, id:', id)
        const res = await noteApi.update(id, data)
        console.log('更新成功:', res.data)
      }
      navigate('/')
    } catch (error) {
      console.error('保存失败详情:', error)
      const errorMsg = error.response?.data?.error || error.message || '未知错误'
      alert('保存失败: ' + errorMsg)
    } finally {
      setSaving(false)
    }
  }

  // 插入AI对话链接到笔记
  const insertChatLink = (chatId) => {
    const linkText = `[chat:${chatId}]`
    const textarea = document.getElementById('content-textarea')
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newContent = content.substring(0, start) + linkText + content.substring(end)
    setContent(newContent)
    // 恢复焦点
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + linkText.length, start + linkText.length)
    }, 0)
  }

  // 渲染预览内容
  const renderPreview = () => {
    const processedContent = content.replace(
      /\[chat:(\d+)\]/g, 
      '<a href="#/chat/$1" class="compressed-link">🤖 查看AI对话 #$1</a>'
    )
    return { __html: marked.parse(processedContent) }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{isNew ? '新建笔记' : '编辑笔记'}</h1>
        <div>
          <button 
            className="btn btn-secondary" 
            onClick={() => setPreview(!preview)}
            style={{ marginRight: '10px' }}
          >
            {preview ? '编辑' : '预览'}
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>

      <div className="card">
        <input
          type="text"
          className="input"
          placeholder="输入笔记标题..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '500' }}
        />

        {preview ? (
          <div 
            className="markdown-preview"
            style={{ 
              minHeight: '400px', 
              padding: '16px',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              backgroundColor: '#fafafa'
            }}
            dangerouslySetInnerHTML={renderPreview()}
          />
        ) : (
          <>
            <textarea
              id="content-textarea"
              className="textarea"
              placeholder="输入笔记内容，支持 Markdown 格式...&#10;&#10;插入AI对话链接格式：[chat:对话ID]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ minHeight: '400px' }}
            />
            <div style={{ marginTop: '12px', color: '#999', fontSize: '12px' }}>
              提示：使用 <code>[chat:123]</code> 格式可插入AI对话链接
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default NoteEdit