import { Routes, Route, NavLink } from 'react-router-dom'
import NoteList from './pages/NoteList'
import NoteEdit from './pages/NoteEdit'
import AIChat from './pages/AIChat'
import './App.css'

function App() {
  return (
    <div className="app">
      <nav className="navbar">
        <div className="navbar-brand">📝 AI笔记</div>
        <div className="navbar-nav">
          <NavLink to="/" end>笔记列表</NavLink>
          <NavLink to="/chat">AI对话</NavLink>
        </div>
      </nav>
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<NoteList />} />
          <Route path="/notes/new" element={<NoteEdit />} />
          <Route path="/notes/edit/:id" element={<NoteEdit />} />
          <Route path="/chat" element={<AIChat />} />
          <Route path="/chat/:chatId" element={<AIChat />} />
        </Routes>
      </main>
    </div>
  )
}

export default App