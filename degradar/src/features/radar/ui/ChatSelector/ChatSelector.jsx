import { useState } from 'react'
import { chats as chatsApi } from '../../../../api/client.js'
import styles from './ChatSelector.module.css'

export default function ChatSelector({ chats, selectedChat, onSelectChat, onChatUpdate }) {
  const [creatingVersionId, setCreatingVersionId] = useState(null)

  const handleCreateNewVersion = async (e, chatId) => {
    e.stopPropagation()
    setCreatingVersionId(chatId)
    
    try {
      await chatsApi.createNewVersion(chatId)
      if (onChatUpdate) {
        onChatUpdate()
      }
    } catch (error) {
      console.error('Failed to create new version:', error)
    } finally {
      setCreatingVersionId(null)
    }
  }
  return (
    <div className={styles.container}>
      <div className={styles.label}>ЧАТЫ ПРОЕКТА</div>
      <div className={styles.chatsList}>
        {chats.map(chat => (
          <button
            key={chat.id}
            className={`${styles.chatItem} ${selectedChat?.id === chat.id ? styles.active : ''}`}
            onClick={() => onSelectChat(chat)}
          >
            <div className={styles.chatInfo}>
              <span className={styles.chatName}>{chat.name}</span>
              <span className={styles.chatDate}>{chat.date}</span>
            </div>
            <div className={styles.chatActions}>
              <button
                className={styles.newVersionButton}
                onClick={(e) => handleCreateNewVersion(e, chat.id)}
                disabled={creatingVersionId === chat.id}
                title="Создать новую версию"
              >
                {creatingVersionId === chat.id ? (
                  <div className={styles.spinner}></div>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 4v16m8-8H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
              {selectedChat?.id === chat.id && (
                <div className={styles.activeIndicator}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12l5 5L19 7" stroke="#224d47" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
