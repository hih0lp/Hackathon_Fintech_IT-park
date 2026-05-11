import { useState, useEffect } from 'react'
import styles from './RadarPage.module.css'
import ChatPanel from '../../features/radar/ui/ChatPanel/ChatPanel.jsx'
import TodoPanel from '../../features/radar/ui/TodoPanel/TodoPanel.jsx'
import Header from '../../widgets/Header/Header.jsx'
import { tasksMock } from '../../features/radar/api/tasksMock.js'
import { mockProject } from '../../shared/mocks/regradar.js'

export default function RadarPage() {
  const [messages, setMessages] = useState([])
  const [tasks, setTasks] = useState([])

  // Load initial tasks from mock
  useEffect(() => {
    tasksMock.list().then(setTasks)
  }, [])

  const handleSendMessage = (text) => {
    const newMsg = { id: Date.now(), type: 'user', text }
    setMessages(prev => [...prev, newMsg])
    
    // Simulate bot response with task suggestions
    setTimeout(() => {
      const shouldSuggestTasks = text.toLowerCase().includes('задача') || 
                                  text.toLowerCase().includes('делать') ||
                                  text.toLowerCase().includes('нужно')
      
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        text: 'По нормам GDPR Art. 6(1)(a), если данные не покидают страну-участника ЕС, дополнительное согласие не требуется. Однако рекомендую зафиксировать правовое основание в DPIA.',
        suggestedTasks: shouldSuggestTasks ? [
          'Провести оценку DPIA (GDPR Art. 35)',
          'Обновить политику обработки данных',
          'Проверить соответствие SCA (PSD2)'
        ] : []
      }
      
      setMessages(prev => [...prev, botResponse])
    }, 1200)
  }

  const handleAcceptTask = async (taskTitle) => {
    try {
      // Send to backend (mock)
      await tasksMock.sendToBackend({ title: taskTitle })
      
      // Create task locally
      const newTask = await tasksMock.create(taskTitle)
      setTasks(prev => [...prev, newTask])
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  const handleRejectTask = (messageId, taskIndex) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId && msg.suggestedTasks) {
        const newTasks = [...msg.suggestedTasks]
        newTasks.splice(taskIndex, 1)
        return { ...msg, suggestedTasks: newTasks }
      }
      return msg
    }))
  }

  const handleToggleTask = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId)
      if (task) {
        await tasksMock.update(taskId, { completed: !task.completed })
        setTasks(prev => prev.map(t => 
          t.id === taskId ? { ...t, completed: !t.completed } : t
        ))
      }
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const handleDeleteTask = async (taskId) => {
    try {
      await tasksMock.delete(taskId)
      setTasks(prev => prev.filter(t => t.id !== taskId))
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  return (
    <div className={styles.root}>
      <Header project={mockProject} />

      <div className={styles.body}>
        {/* Main chat area */}
        <main className={styles.main}>
          <ChatPanel 
            messages={messages} 
            onSend={handleSendMessage}
            onAcceptTask={handleAcceptTask}
            onRejectTask={handleRejectTask}
          />
        </main>

        {/* Right todo panel */}
        <aside className={styles.sidebar}>
          <TodoPanel 
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
          />
        </aside>
      </div>
    </div>
  )
}
