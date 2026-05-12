import { useState } from 'react'
import styles from './TaskPanel.module.css'

export default function TaskPanel() {
  const [tasks, setTasks] = useState([])

  const addTask = (task) => {
    const newTask = {
      id: Date.now() + Math.random(),
      title: task.title,
      agent: task.agent || 'general',
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    
    setTasks(prev => [...prev, newTask])
  }

  const removeTask = (taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId))
  }

  const toggleTaskStatus = (taskId) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: task.status === 'pending' ? 'completed' : 'pending' }
        : task
    ))
  }

  const clearCompleted = () => {
    setTasks(prev => prev.filter(task => task.status !== 'completed'))
  }

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
          {completedCount > 0 && (
            <button 
              className={styles.clearBtn}
              onClick={clearCompleted}
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
                      onClick={() => toggleTaskStatus(task.id)}
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
                      onClick={() => removeTask(task.id)}
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
        )}
      </div>
    </div>
  )
}

// Экспортируем функцию для добавления задач извне
export { TaskPanel }
