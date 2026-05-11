import { useState } from 'react'
import styles from './ChatPanel.module.css'

export default function ChatPanel({ messages, onSend, onAcceptTask, onRejectTask }) {
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (input.trim()) {
      onSend(input)
      setInput('')
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
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#5b6ef5" strokeWidth="1.5">
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
                    <circle cx="12" cy="12" r="10" stroke="#5b6ef5" strokeWidth="1.5"/>
                    <circle cx="12" cy="12" r="3" stroke="#5b6ef5" strokeWidth="1.5" strokeDasharray="2 2"/>
                  </svg>
                </div>
                <div className={styles.bubble}>
                  <div className={styles.text}>{msg.text}</div>
                  {msg.suggestedTasks && msg.suggestedTasks.length > 0 && (
                    <div className={styles.taskSuggestions}>
                      <div className={styles.suggestionsTitle}>Рекомендуемые задачи:</div>
                      {msg.suggestedTasks.map((task, index) => (
                        <div key={index} className={styles.taskSuggestion}>
                          <span className={styles.taskText}>{task}</span>
                          <div className={styles.taskActions}>
                            <button
                              className={styles.acceptBtn}
                              onClick={() => onAcceptTask(task)}
                              title="Добавить в список дел"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M5 12l5 5L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            <button
                              className={styles.rejectBtn}
                              onClick={() => onRejectTask(msg.id, index)}
                              title="Отклонить"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className={styles.inputRow}>
        <div className={styles.inputWrap}>
          <input
            type="text"
            className={styles.input}
            placeholder="Задать вопрос ассистенту..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
          />
          <button className={styles.sendBtn} onClick={handleSend} disabled={!input.trim()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
