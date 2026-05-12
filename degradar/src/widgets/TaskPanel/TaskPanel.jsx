import styles from './TaskPanel.module.css'

export default function TaskPanel({ tasks, onToggleTask, onDeleteTask, onClearCompleted, onSendToYouGile, isSendingToYouGile }) {

  const getAgentIcon = (agent) => {
    const icons = {
      financial_crime: '🔍',
      payments: '💳',
      privacy: '🔒',
      general: '📋'
    }
    return icons[agent] || icons.general
  }

  const getAgentLabel = (agent) => {
    const labels = {
      financial_crime: 'Финансовые риски',
      payments: 'Платежи',
      privacy: 'Конфиденциальность',
      general: 'Общие'
    }
    return labels[agent] || labels.general
  }

  const pendingCount = tasks.filter(task => task.status === 'pending').length
  const completedCount = tasks.filter(task => task.status === 'completed').length

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Задачи</h3>
        <div className={styles.stats}>
          {pendingCount > 0 && (
            <span className={styles.pendingCount}>{pendingCount} активно</span>
          )}
          {completedCount > 0 && onClearCompleted && (
            <button 
              className={styles.clearBtn}
              onClick={onClearCompleted}
              title="Очистить выполненные"
            >
              Очистить ({completedCount})
            </button>
          )}
        </div>
      </div>

      <div className={styles.content}>
        {tasks.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📋</div>
            <h4 className={styles.emptyTitle}>Нет задач</h4>
            <p className={styles.emptyText}>
              Задайте вопрос ассистенту, и он предложит релевантные задачи для вашего проекта
            </p>
          </div>
        ) : (
          <>
            <div className={styles.taskList}>
              {tasks.map(task => (
                <div 
                  key={task.id} 
                  className={`${styles.taskItem} ${task.status === 'completed' ? styles.completed : ''}`}
                >
                  <div className={styles.taskMain}>
                    <div className={styles.taskLeft}>
                      <span className={styles.taskIcon}>
                        {getAgentIcon(task.agent)}
                      </span>
                      <div className={styles.taskContent}>
                        <h4 className={styles.taskTitle}>{task.title}</h4>
                        <span className={styles.taskAgent}>
                          {getAgentLabel(task.agent)}
                        </span>
                      </div>
                    </div>
                    
                    <div className={styles.taskActions}>
                      <button
                        className={`${styles.statusBtn} ${task.status === 'completed' ? styles.completedBtn : ''}`}
                        onClick={() => onToggleTask(task.id)}
                        title={task.status === 'completed' ? 'Отметить как невыполненную' : 'Отметить как выполненную'}
                      >
                        {task.status === 'completed' ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12l5 5L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                          </svg>
                        )}
                      </button>
                      
                      <button
                        className={styles.removeBtn}
                        onClick={() => onDeleteTask(task.id)}
                        title="Удалить задачу"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {task.status === 'completed' && (
                    <div className={styles.completedIndicator}>
                      <span>Выполнено</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* YouGile integration button */}
            <div className={styles.yougileSection}>
              <button
                className={styles.yougileBtn}
                onClick={onSendToYouGile}
                disabled={pendingCount === 0 || isSendingToYouGile}
                title={pendingCount === 0 ? 'Нет активных задач для отправки' : 'Отправить активные задачи в YouGile'}
              >
                {isSendingToYouGile ? (
                  <>
                    <div className={styles.spinner}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="31.4" strokeDashoffset="31.4">
                          <animate attributeName="stroke-dashoffset" from="31.4" to="0" dur="1s" repeatCount="indefinite"/>
                        </circle>
                      </svg>
                    </div>
                    Отправка в YouGile...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M7 7h10M7 12h10M7 17h10M3 3h18v18H3z" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Отправить в YouGile ({pendingCount})
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
