import { useState } from 'react'
import styles from './TodoPanel.module.css'

export default function TodoPanel({ tasks, onToggleTask, onDeleteTask }) {
  const [filter, setFilter] = useState('all') // all, active, completed

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed
    if (filter === 'completed') return task.completed
    return true
  })

  const activeCount = tasks.filter(t => !t.completed).length

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Список дел</h2>
        <span className={styles.count}>{activeCount} активных</span>
      </div>

      <div className={styles.filter}>
        <button
          className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          Все
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'active' ? styles.active : ''}`}
          onClick={() => setFilter('active')}
        >
          Активные
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'completed' ? styles.active : ''}`}
          onClick={() => setFilter('completed')}
        >
          Выполненные
        </button>
      </div>

      <div className={styles.taskList}>
        {filteredTasks.length === 0 ? (
          <div className={styles.empty}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1">
              <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p>Нет задач</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div key={task.id} className={`${styles.task} ${task.completed ? styles.completed : ''}`}>
              <label className={styles.taskLabel}>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => onToggleTask(task.id)}
                  className={styles.checkbox}
                />
                <span className={styles.taskText}>{task.title}</span>
              </label>
              <button
                className={styles.deleteBtn}
                onClick={() => onDeleteTask(task.id)}
                title="Удалить задачу"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
