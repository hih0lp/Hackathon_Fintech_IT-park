import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import styles from './RadarPage.module.css'
import ChatPanel from '../../features/radar/ui/ChatPanel/ChatPanel.jsx'
import TaskPanel from '../../widgets/TaskPanel/TaskPanel.jsx'
import FeatureList from '../../features/radar/ui/FeatureList/FeatureList.jsx'
import Header from '../../widgets/Header/Header.jsx'
import { projects, chats, auth } from '../../api/client'
import { createWebSocketClient } from '../../api/websocket.js'
import { useAuth } from '../../context/AuthContext.jsx'

// Get API base URL from client
const API_BASE_URL = 'https://back.psbsmartedu.ru'

const projectColors = ['#224d47', '#7c3aed', '#059669', '#dc2626', '#0284c7', '#ea580c', '#db2777', '#65a30d']

const getProjectColor = (id) => projectColors[(id - 1) % projectColors.length]

const getInitials = (name) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

// Check if user is authenticated in YouGile
const isYouGileAuthenticated = () => {
  const cookies = document.cookie.split(';').map(c => c.trim())
  const yougileAuthCookie = cookies.find(c => c.startsWith('yougileAuth='))
  return yougileAuthCookie?.split('=')[1] === 'true'
}

export default function RadarPage() {
  const { isAuthenticated } = useAuth()
  const [searchParams] = useSearchParams()
  const [messages, setMessages] = useState([])
  const [tasks, setTasks] = useState([])
  const [features, setFeatures] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [currentProject, setCurrentProject] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [isChatBlocked, setIsChatBlocked] = useState(false)
  const [isSendingToYouGile, setIsSendingToYouGile] = useState(false)
  
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

  // Handle chat selection change
  const handleChatSelection = (chat) => {
    console.log('Chat selected:', chat)
    
    // Initialize WebSocket connection for the selected chat
    if (chat && chat.id) {
      // Only reconnect if chat ID changed or no existing connection
      if (!wsClientRef.current || selectedChat?.id !== chat.id) {
        setSelectedChat(chat) // Set before initializing WebSocket
        initWebSocketConnection(chat.id)
      } else {
        setSelectedChat(chat) // Still update the selected chat even if not reconnecting
      }
    }
  }

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
          const chatToSelect = requestedFeature || formattedFeatures[0]
          console.log('useEffect: requested chat to select:', chatToSelect?.id, 'current selected:', selectedChat?.id)
          if (chatToSelect && selectedChat?.id !== chatToSelect.id) {
            console.log('useEffect: selecting different chat')
            handleChatSelection(chatToSelect)
          } else {
            console.log('useEffect: chat already selected or no chat to select')
          }
        } else if (formattedFeatures.length > 0 && (!selectedChat || !formattedFeatures.find(f => f.id === selectedChat.id))) {
          console.log('useEffect: selecting first available chat')
          handleChatSelection(formattedFeatures[0])
        } else {
          console.log('useEffect: no chat selection needed')
        }
      } catch (error) {
        console.error('Failed to load features:', error)
        setFeatures([])
        setSelectedChat(null)
      }
    }
    
    loadFeatures()
  }, [currentProject, featureId])

  // Update chat block status when tasks or messages change
  useEffect(() => {
    const hasPendingTasks = tasks.some(task => task.status === 'pending')
    const hasSuggestedTasks = messages.some(msg => 
      msg.suggestedTasks && msg.suggestedTasks.length > 0
    )
    setIsChatBlocked(hasPendingTasks || hasSuggestedTasks)
  }, [tasks, messages])

  // Initialize WebSocket connection
  const initWebSocketConnection = (chatId) => {
    console.log('=== WebSocket Debug ===')
    console.log('1. isAuthenticated:', isAuthenticated)
    console.log('2. chatId:', chatId)
    console.log('3. Current connection exists:', !!wsClientRef.current)
    
    // Prevent multiple initialization for the same chat
    if (wsClientRef.current && selectedChat?.id === chatId && wsClientRef.current.getStatus() === 'connected') {
      console.log('WebSocket already connected to this chat, skipping initialization')
      return
    }
    
    // Close existing connection if any
    if (wsClientRef.current) {
      console.log('Closing existing WebSocket connection')
      wsClientRef.current.close()
      wsClientRef.current = null
    }
    
    // Reset processing state on new connection
    setIsProcessing(false)
    setIsChatBlocked(false) // Reset chat blocked state
    setMessages([]) // Clear messages when switching chats
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
        // Handle Event objects properly
        const errorText = typeof errorMessage === 'string' 
          ? errorMessage 
          : errorMessage?.message || errorMessage?.type || 'Ошибка соединения'
        setError(errorText)
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
        const message = {
          id: data.timestamp || Date.now(),
          type: data.sender === 'user' ? 'user' : 'bot',
          text: data.message,
          timestamp: data.timestamp
        }
        
        // Avoid duplicate messages - check if message with same content and type already exists
        setMessages(prev => {
          const isDuplicate = prev.some(msg => 
            msg.type === message.type && 
            msg.text === message.text && 
            Math.abs(new Date(msg.timestamp) - new Date(message.timestamp)) < 5000 // Within 5 seconds
          )
          
          if (isDuplicate && message.type === 'user') {
            return prev // Don't add duplicate user messages
          }
          
          return [...prev, message]
        })
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
        
        // Block chat if there are suggested tasks in the message
        const hasSuggestedTasks = data.tasks && data.tasks.length > 0
        setIsChatBlocked(hasSuggestedTasks || tasks.some(task => task.status === 'pending'))
        
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
        // Clean up failed connection
        if (wsClientRef.current) {
          wsClientRef.current.close()
          wsClientRef.current = null
        }
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
    if (!wsClientRef.current || connectionStatus !== 'connected') {
      setError('Нет соединения с сервером')
      return false
    }
    
    // Add message locally immediately for better UX
    const localMessage = {
      id: Date.now(),
      type: 'user',
      text: text,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, localMessage])
    
    const success = wsClientRef.current.sendMessage(text)
    
    if (!success) {
      // Remove the message if sending failed
      setMessages(prev => prev.filter(msg => msg.id !== localMessage.id))
      setError('Не удалось отправить сообщение')
    }
    
    return success
  }

  // Add task to panel
  const handleAddTask = async (task) => {
    console.log('Adding task:', task)
    
    // Create task via API first
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.getToken()}`
        },
        body: JSON.stringify({
          chat_id: selectedChat?.id,
          titles: [task.title]
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to create task: ${response.status}`)
      }

      const result = await response.json()
      console.log('Task created:', result)

      // Add server-side task to state - response is an array directly
      if (result && result.length > 0) {
        const createdTask = result[0]
        setTasks(prev => [...prev, {
          id: createdTask.id,
          title: createdTask.title,
          agent: task.agent || 'general',
          status: 'pending',
          createdAt: createdTask.created || new Date().toISOString()
        }])
      }
    } catch (error) {
      console.error('Error creating task:', error)
      setError('Не удалось создать задачу')
      setTimeout(() => setError(null), 3000)
    }
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

  // Clear completed tasks
  const handleClearCompleted = () => {
    setTasks(prev => prev.filter(task => task.status !== 'completed'))
  }

  // Send tasks to YouGile
  const handleSendToYouGile = async () => {
    const pendingTasks = tasks.filter(task => task.status === 'pending')
    
    if (pendingTasks.length === 0) {
      setError('Нет активных задач для отправки')
      return
    }

    setIsSendingToYouGile(true)
    setError(null)

    try {
      // Get task IDs from existing tasks
      const taskIds = pendingTasks.map(task => task.id)
      
      // Send task IDs directly to /tasks/duplicate-to-yougile/
      const response = await fetch(`${API_BASE_URL}/tasks/duplicate-to-yougile/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.getToken()}`
        },
        body: JSON.stringify({
          task_ids: taskIds
        })
      })

      if (!response.ok) {
        throw new Error(`Ошибка отправки в YouGile: ${response.status}`)
      }

      const result = await response.json()
      console.log('Tasks sent to YouGile:', result)
      
      // Mark sent tasks as completed
      setTasks(prev => prev.map(task => 
        taskIds.includes(task.id) 
          ? { ...task, status: 'completed' }
          : task
      ))

      // Show success message
      setError(`Отправлено ${pendingTasks.length} задач в YouGile`)
      setTimeout(() => setError(null), 3000)

    } catch (error) {
      console.error('Error sending tasks to YouGile:', error)
      setError('Не удалось отправить задачи в YouGile')
    } finally {
      setIsSendingToYouGile(false)
    }
  }

  // Handle chat deletion
  const handleDeleteChat = async (chatId) => {
    try {
      console.log('Deleting chat:', chatId)
      await chats.delete(chatId)
      
      // Update features list
      setFeatures(prev => prev.filter(chat => chat.id !== chatId))
      
      // If deleted chat was selected, select another one or clear selection
      if (selectedChat?.id === chatId) {
        const remainingChats = features.filter(chat => chat.id !== chatId)
        if (remainingChats.length > 0) {
          handleChatSelection(remainingChats[0])
        } else {
          setSelectedChat(null)
          // Close WebSocket connection
          if (wsClientRef.current) {
            wsClientRef.current.close()
            wsClientRef.current = null
          }
          setMessages([])
          setConnectionStatus('disconnected')
        }
      }
    } catch (error) {
      console.error('Failed to delete chat:', error)
      throw error // Re-throw to let ChatSelector handle the error state
    }
  }

  // Handle feature update (e.g., after creating new version)
  const handleFeatureUpdate = async () => {
    if (!currentProject) return
    
    try {
      const response = await chats.list({ project: currentProject.id })
      const featuresData = response.results || []
      
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
    } catch (error) {
      console.error('Failed to update features:', error)
    }
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
              
              {/* Feature list */}
              <FeatureList 
                features={features}
                selectedFeature={selectedChat}
                onSelectFeature={handleChatSelection}
                onDeleteFeature={handleDeleteChat}
                onFeatureUpdate={handleFeatureUpdate}
              />
              
              {/* Chat panel */}
              <ChatPanel 
                messages={messages} 
                onSend={handleSendMessage}
                isProcessing={isProcessing}
                connectionStatus={connectionStatus}
                onAcceptTask={handleAddTask}
                isChatBlocked={isChatBlocked}
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
            onClearCompleted={handleClearCompleted}
            onSendToYouGile={handleSendToYouGile}
            isSendingToYouGile={isSendingToYouGile}
            isYouGileAuthenticated={isYouGileAuthenticated()}
          />
        </aside>
      </div>
    </div>
  )
}
