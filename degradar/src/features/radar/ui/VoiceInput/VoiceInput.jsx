import { useState, useRef, useEffect } from 'react'
import { speechRecognition } from '../../../../utils/speechRecognition.js'
import styles from './VoiceInput.module.css'

export default function VoiceInput({ onSendMessage, disabled }) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)
  const timeoutRef = useRef(null)

  useEffect(() => {
    setIsSupported(speechRecognition.isSupported())
    
    // Setup speech recognition handlers
    speechRecognition.onResult = (result) => {
      const fullTranscript = result.finalTranscript + result.interimTranscript
      setTranscript(fullTranscript)
      setShowTranscript(true)
      
      // Auto-hide transcript after 2 seconds of silence
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        setShowTranscript(false)
      }, 2000)
    }

    speechRecognition.onError = (error) => {
      console.error('Voice input error:', error)
      setIsListening(false)
      setShowTranscript(false)
      
      // Show error message
      let errorMessage = 'Ошибка распознавания речи'
      switch (error) {
        case 'no-speech':
          errorMessage = 'Речь не обнаружена'
          break
        case 'audio-capture':
          errorMessage = 'Нет доступа к микрофону'
          break
        case 'not-allowed':
          errorMessage = 'Доступ к микрофону запрещен'
          break
        case 'network':
          errorMessage = 'Ошибка сети'
          break
      }
      
      // Show error toast or notification
      if (window.showToast) {
        window.showToast(errorMessage, 'error')
      }
    }

    speechRecognition.onStart = () => {
      setIsListening(true)
    }

    speechRecognition.onEnd = () => {
      setIsListening(false)
      
      // Process final transcript
      if (speechRecognition.finalTranscript.trim()) {
        processVoiceCommand(speechRecognition.finalTranscript.trim())
      }
      
      speechRecognition.reset()
      setTranscript('')
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      speechRecognition.destroy()
    }
  }, [])

  const processVoiceCommand = (text) => {
    const command = speechRecognition.processCommand(text)
    
    switch (command.action) {
      case 'send_message':
      case 'chat_message':
        if (command.params.message && onSendMessage) {
          onSendMessage(command.params.message)
        }
        break
        
      case 'create_project':
        // Trigger project creation modal
        if (window.openCreateProjectModal) {
          window.openCreateProjectModal()
        }
        break
        
      case 'create_project_with_name':
        // Create project with specific name
        if (window.openCreateProjectModal) {
          window.openCreateProjectModal(command.params.name)
        }
        break
        
      case 'create_task':
        // Trigger task creation
        if (window.openCreateTaskModal) {
          window.openCreateTaskModal()
        }
        break
        
      case 'create_task_with_name':
        // Create task with specific name
        if (window.openCreateTaskModal) {
          window.openCreateTaskModal(command.params.name)
        }
        break
        
      case 'navigate_projects':
        // Navigate to projects page
        if (window.navigateTo) {
          window.navigateTo('/projects')
        }
        break
        
      case 'navigate_home':
        // Navigate to home page
        if (window.navigateTo) {
          window.navigateTo('/')
        }
        break
        
      case 'help':
        // Show voice commands help
        showVoiceHelp()
        break
        
      case 'stop':
        // Stop listening
        stopListening()
        break
        
      default:
        // Treat as chat message
        if (text && onSendMessage) {
          onSendMessage(text)
        }
        break
    }
  }

  const showVoiceHelp = () => {
    const helpText = `
🎤 Голосовые команды:
• "Создать проект" / "Новый проект"
• "Создать задачу" / "Новая задача"
• "Отправить сообщение" + ваш текст
• "Перейти к проектам"
• "Помощь" - показать команды
• "Стоп" - остановить запись
    `
    
    if (window.showToast) {
      window.showToast(helpText, 'info', 5000)
    }
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening()
      // Process current transcript when manually stopped
      if (transcript.trim()) {
        processVoiceCommand(transcript.trim())
      }
    } else {
      startListening()
    }
  }

  const startListening = () => {
    if (!isSupported) {
      if (window.showToast) {
        window.showToast('Голосовой ввод не поддерживается в вашем браузере', 'error')
      }
      return
    }

    try {
      speechRecognition.start()
    } catch (error) {
      console.error('Failed to start speech recognition:', error)
      if (window.showToast) {
        window.showToast('Не удалось начать распознавание речи', 'error')
      }
    }
  }

  const stopListening = () => {
    speechRecognition.stop()
    setShowTranscript(false)
  }

  return (
    <div className={styles.voiceInput}>
      <button
        type="button"
        className={`${styles.microphoneButton} ${isListening ? styles.active : ''}`}
        onClick={toggleListening}
        disabled={disabled || !isSupported}
        title={isSupported ? 'Голосовой ввод' : 'Голосовой ввод не поддерживается'}
      >
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5"
        >
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="23"/>
          <line x1="8" y1="23" x2="16" y2="23"/>
        </svg>
        
        {isListening && (
          <span className={styles.pulseRing}></span>
        )}
      </button>

      {/* Voice transcript display */}
      {showTranscript && transcript && (
        <div className={styles.transcript}>
          <div className={styles.transcriptContent}>
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5"
              className={styles.transcriptIcon}
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
            <span>{transcript}</span>
          </div>
        </div>
      )}

      {/* Listening indicator */}
      {isListening && (
        <div className={styles.listeningIndicator}>
          <div className={styles.waveform}>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span className={styles.listeningText}>Слушаю...</span>
        </div>
      )}
    </div>
  )
}
