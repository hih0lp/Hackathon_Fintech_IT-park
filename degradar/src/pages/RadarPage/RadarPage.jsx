import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import styles from './RadarPage.module.css'
import ChatPanel from '../../features/radar/ui/ChatPanel/ChatPanel.jsx'
import TaskPanel from '../../widgets/TaskPanel/TaskPanel.jsx'
import ChatSelector from '../../features/radar/ui/ChatSelector/ChatSelector.jsx'
import Header from '../../widgets/Header/Header.jsx'
import { projects, chats, auth } from '../../api/client'
import { createWebSocketClient } from '../../api/websocket.js'
import { useAuth } from '../../context/AuthContext.jsx'

const projectColors = ['#224d47', '#7c3aed', '#059669', '#dc2626', '#0284c7', '#ea580c', '#db2777', '#65a30d']

const getProjectColor = (id) => projectColors[(id - 1) % projectColors.length]

const getInitials = (name) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

export default function RadarPage() {
  const { isAuthenticated } = useAuth()
  const [searchParams] = useSearchParams()
  const [messages, setMessages] = useState([])
  const [tasks, setTasks] = useState([])
  const [features, setFeatures] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [currentProject, setCurrentProject] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [error, setError] = useState(null)
  
  const projectId = searchParams.get('project')
  const featureId = searchParams.get('feature')
  const wsClientRef = useRef(null)
  const taskPanelRef = useRef(null)
  const processingTimeoutRef = useRef(null)

  // Load project data and initialize WebSocket
  useEffect(() => {
    const loadProjectAndInitWS = async () => {
      console.log('Loading project, projectId:', projectId)
      
      let projectData = null
      
      if (projectId) {
        try {
          console.log('Fetching project with ID:', projectId)
          projectData = await projects.get(projectId)
          console.log('Project data received:', projectData)
        } catch (error) {
          console.error('Failed to load project:', error)
          setError('Не удалось загрузить проект')
          return
        }
      } else {
        // Try to load the first available project
        try {
          console.log('No projectId, loading first available project')
          const response = await projects.list()
          console.log('Projects list response:', response)
          
          if (response.results && response.results.length > 0) {
            projectData = response.results[0]
            console.log('Using first project:', projectData)
          } else {
            console.log('No projects available')
            setError('Нет доступных проектов')
            return
          }
        } catch (error) {
          console.error('Failed to load projects:', error)
          setError('Не удалось загрузить список проектов')
          return
        }
      }
      
      if (projectData) {
        const formattedProject = {
          id: projectData.id,
          name: projectData.title,
          initials: getInitials(projectData.title),
          color: getProjectColor(projectData.id)
        }
        console.log('Setting current project:', formattedProject)
        setCurrentProject(formattedProject)
        
        // Initialize WebSocket connection
        initWebSocketConnection(projectData.id)
      }
    }
    
    loadProjectAndInitWS()
    
    return () => {
      // Cleanup WebSocket on unmount
      if (wsClientRef.current) {
        wsClientRef.current.close()
      }
      
      // Clear processing timeout
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current)
        processingTimeoutRef.current = null
      }
    }
  }, [projectId])

  // Load features for the project
  useEffect(() => {
    if (!currentProject) {
      return
    }

    const loadFeatures = async () => {
      try {
        const response = await chats.list({ project: currentProject.id })
        const featuresData = response.results || []
        setFeatures(featuresData)
        
        // Format features for display
        const formattedFeatures = featuresData.map(feature => ({
          ...feature,
          name: feature.name || `Фича ${feature.id}`,
          date: feature.created_at ? new Date(feature.created_at).toLocaleDateString('ru-RU', { 
            day: 'numeric', 
            month: 'short' 
          }) : 'Сегодня'
        }))
        
        setFeatures(formattedFeatures)
        
        // Select the requested feature or the first one
        if (featureId) {
          const requestedFeature = formattedFeatures.find(f => f.id === parseInt(featureId))
          setSelectedChat(requestedFeature || formattedFeatures[0])
        } else {
          setSelectedChat(formattedFeatures[0])
        }
      } catch (error) {
        console.error('Failed to load features:', error)
        setFeatures([])
        setSelectedChat(null)
      }
    }
    
    loadFeatures()
  }, [currentProject, featureId])

  // Initialize WebSocket connection
  const initWebSocketConnection = (chatId) => {
    console.log('=== WebSocket Debug ===')
    console.log('1. isAuthenticated:', isAuthenticated)
    console.log('2. chatId:', chatId)
    
    // Reset processing state on new connection
    setIsProcessing(false)
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current)
      processingTimeoutRef.current = null
    }
    
    // Check cookies directly
    const cookies = document.cookie.split(';').map(c => c.trim())
    const accessTokenCookie = cookies.find(c => c.startsWith('accessToken='))
    console.log('3. accessToken in cookies:', !!accessTokenCookie)
    
    const token = auth.getToken()
    console.log('4. token from auth.getToken():', !!token)
    console.log('5. token length:', token ? token.length : 0)
    
    // Try to connect anyway if we have token, even if isAuthenticated is false
    if (!token) {
      console.error('No auth token available')
      setError('Ошибка аутентификации')
      return
    }
    
    // Override isAuthenticated check if token exists
    if (!isAuthenticated && token) {
      console.log('Token exists but isAuthenticated is false - proceeding anyway')
    }

    try {
      console.log('Initializing WebSocket connection for chat:', chatId)
      wsClientRef.current = createWebSocketClient(chatId, token)
      
      // Setup event handlers
      wsClientRef.current.on('connected', () => {
        console.log('WebSocket connected')
        setConnectionStatus('connected')
        setError(null)
      })
      
      wsClientRef.current.on('disconnected', ({ code, reason }) => {
        console.log('WebSocket disconnected:', code, reason)
        setConnectionStatus('disconnected')
      })
      
      wsClientRef.current.on('error', (errorMessage) => {
        console.error('WebSocket error:', errorMessage)
        setError(errorMessage || 'Ошибка соединения')
      })
      
      wsClientRef.current.on('history', (historyMessages) => {
        console.log('Received message history:', historyMessages)
        const formattedMessages = historyMessages.map(msg => ({
          id: msg.timestamp || Date.now(),
          type: msg.sender === 'user' ? 'user' : 'bot',
          text: msg.text || msg.message,
          timestamp: msg.timestamp
        }))
        setMessages(formattedMessages)
      })
      
      wsClientRef.current.on('chat_message', (data) => {
        console.log('Received chat message echo:', data)
        const message = {
          id: data.timestamp || Date.now(),
          type: data.sender === 'user' ? 'user' : 'bot',
          text: data.message,
          timestamp: data.timestamp
        }
        setMessages(prev => [...prev, message])
      })
      
      wsClientRef.current.on('processing_started', () => {
        console.log('Processing started')
        setIsProcessing(true)
        
        // Set timeout for processing (300 seconds)
        processingTimeoutRef.current = setTimeout(() => {
          console.log('Processing timeout - stopping processing indicator')
          setIsProcessing(false)
          setError('Превышено время ожидания ответа от сервера. Попробуйте отправить сообщение еще раз.')
        }, 300000)
      })
      
      wsClientRef.current.on('bot_response', (data) => {
        console.log('Received bot response:', data)
        setIsProcessing(false)
        
        // Clear processing timeout
        if (processingTimeoutRef.current) {
          clearTimeout(processingTimeoutRef.current)
          processingTimeoutRef.current = null
        }
        
        // Clear any previous errors
        setError(null)
        
        const message = {
          id: Date.now(),
          type: 'bot',
          text: data.message,
          timestamp: new Date().toISOString(),
          suggestedTasks: data.tasks || []
        }
        setMessages(prev => [...prev, message])
      })
      
      wsClientRef.current.on('max_reconnect_attempts', () => {
        console.error('Max reconnect attempts reached')
        setError('Не удалось установить соединение с сервером')
        setConnectionStatus('failed')
      })
      
      // Connect to WebSocket
      wsClientRef.current.connect()
      
    } catch (error) {
      console.error('Error initializing WebSocket:', error)
      setError('Ошибка инициализации соединения')
    }
  }

  // Send message through WebSocket
  const handleSendMessage = (text) => {
    console.log('=== Send Message Debug ===')
    console.log('1. Text to send:', text)
    console.log('2. wsClientRef.current exists:', !!wsClientRef.current)
    console.log('3. connectionStatus:', connectionStatus)
    
    if (!wsClientRef.current || connectionStatus !== 'connected') {
      console.error('WebSocket not connected - cannot send message')
      setError('Нет соединения с сервером')
      return false
    }
    
    console.log('4. Attempting to send message...')
    const success = wsClientRef.current.sendMessage(text)
    console.log('5. Message sent, success:', success)
    
    if (!success) {
      setError('Не удалось отправить сообщение')
    }
    
    return success
  }

  // Add task to panel
  const handleAddTask = (task) => {
    console.log('Adding task:', task)
    setTasks(prev => [...prev, {
      id: Date.now(),
      title: task.title,
      agent: task.agent || 'general',
      status: 'pending',
      createdAt: new Date().toISOString()
    }])
  }

  // Toggle task status
  const handleToggleTask = (taskId) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: task.status === 'pending' ? 'completed' : 'pending' }
        : task
    ))
  }

  // Delete task
  const handleDeleteTask = (taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId))
  }

  return (
    <div className={styles.root}>
      <Header project={currentProject} />

      <div className={styles.body}>
        {/* Main chat area */}
        <main className={styles.main}>
          {!currentProject ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyMessage}>
                <h3>Проект не выбран</h3>
                <p>Выберите проект из выпадающего меню в шапке или создайте новый проект</p>
              </div>
            </div>
          ) : features.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyMessage}>
                <h3>Нет фич в проекте</h3>
                <p>Создайте фичу в проекте, чтобы начать анализ</p>
              </div>
            </div>
          ) : (
            <>
              {/* Connection status indicator */}
              {error && (
                <div className={styles.errorBanner}>
                  <span className={styles.errorIcon}>⚠️</span>
                  <span className={styles.errorText}>{error}</span>
                </div>
              )}
              
              {/* Chat selector */}
              <ChatSelector 
                chats={features}
                selectedChat={selectedChat}
                onSelectChat={setSelectedChat}
              />
              
              {/* Chat panel */}
              <ChatPanel 
                messages={messages} 
                onSend={handleSendMessage}
                isProcessing={isProcessing}
                connectionStatus={connectionStatus}
                onAcceptTask={handleAddTask}
              />
            </>
          )}
        </main>

        {/* Right task panel */}
        <aside className={styles.sidebar}>
          <TaskPanel 
            ref={taskPanelRef}
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
          />
        </aside>
      </div>
    </div>
  )
}
