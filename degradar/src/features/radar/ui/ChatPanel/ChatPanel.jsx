import { useState } from 'react'
import styles from './ChatPanel.module.css'

export default function ChatPanel({ messages, onSend, onAcceptTask, isProcessing, connectionStatus }) {
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (input.trim() && connectionStatus === 'connected' && !isProcessing) {
      const success = onSend(input)
      if (success) {
        setInput('')
      }
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.messages}>
        {messages.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#224d47" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="3" strokeDasharray="2 2"/>
              </svg>
            </div>
            <h3 className={styles.emptyTitle}>Ассистент по анализу</h3>
            <p className={styles.emptyText}>Задайте вопрос о регуляторных требованиях или анализе</p>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`${styles.message} ${msg.type === 'user' ? styles.user : styles.bot}`}>
            {msg.type === 'user' ? (
              <>
                <div className={styles.bubble}>{msg.text}</div>
                <div className={styles.userAvatar}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
              </>
            ) : (
              <>
                <div className={styles.botAvatar}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#224d47" strokeWidth="1.5"/>
                    <circle cx="12" cy="12" r="3" stroke="#224d47" strokeWidth="1.5" strokeDasharray="2 2"/>
                  </svg>
                </div>
                <div className={styles.bubble}>
                  <div className={styles.text}>{msg.text}</div>
                  {msg.suggestedTasks && msg.suggestedTasks.length > 0 && (
                    <div className={styles.taskSuggestions}>
                      <div className={styles.suggestionsTitle}>Рекомендуемые задачи:</div>
                      {msg.suggestedTasks.map((task, index) => {
                        const taskData = typeof task === 'string' ? { title: task } : task
                        return (
                          <div key={index} className={styles.taskSuggestion}>
                            <span className={styles.taskText}>{taskData.title}</span>
                            <div className={styles.taskActions}>
                              <button
                                className={styles.acceptBtn}
                                onClick={() => onAcceptTask(taskData)}
                                title="Добавить в список дел"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                  <path d="M5 12l5 5L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}

        {/* Processing indicator */}
        {isProcessing && (
          <div className={`${styles.message} ${styles.bot}`}>
            <div className={styles.botAvatar}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#224d47" strokeWidth="1.5"/>
                <circle cx="12" cy="12" r="3" stroke="#224d47" strokeWidth="1.5" strokeDasharray="2 2"/>
              </svg>
            </div>
            <div className={styles.bubble}>
              <div className={styles.skeleton}>
                <div className={styles.skeletonLine} style={{width: '80%'}}></div>
                <div className={styles.skeletonLine} style={{width: '60%'}}></div>
                <div className={styles.skeletonLine} style={{width: '90%'}}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.inputRow}>
        <div className={styles.inputWrap}>
          <input
            type="text"
            className={styles.input}
            placeholder={
              connectionStatus === 'connected' 
                ? isProcessing 
                  ? "Обработка запроса..." 
                  : "Задать вопрос ассистенту..."
                : connectionStatus === 'connecting'
                ? "Подключение к серверу..."
                : "Нет соединения с сервером"
            }
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={connectionStatus !== 'connected' || isProcessing}
          />
          <button 
            className={styles.sendBtn} 
            onClick={handleSend} 
            disabled={!input.trim() || connectionStatus !== 'connected' || isProcessing}
          >
            {isProcessing ? (
              <div className={styles.spinner}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="31.4" strokeDashoffset="31.4">
                    <animate attributeName="stroke-dashoffset" from="31.4" to="0" dur="1s" repeatCount="indefinite"/>
                  </circle>
                </svg>
              </div>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>
        
        {/* Connection status indicator */}
        {connectionStatus !== 'connected' && (
          <div className={styles.statusIndicator}>
            <div className={`${styles.statusDot} ${styles[connectionStatus]}`}></div>
            <span className={styles.statusText}>
              {connectionStatus === 'connecting' && 'Подключение...'}
              {connectionStatus === 'disconnected' && 'Нет соединения'}
              {connectionStatus === 'failed' && 'Ошибка соединения'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
