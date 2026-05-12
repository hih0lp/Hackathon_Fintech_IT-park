import styles from './ChatSelector.module.css'

export default function ChatSelector({ chats, selectedChat, onSelectChat }) {
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
            {selectedChat?.id === chat.id && (
              <div className={styles.activeIndicator}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12l5 5L19 7" stroke="#224d47" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
