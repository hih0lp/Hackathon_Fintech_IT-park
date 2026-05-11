import { useState } from 'react'
import styles from './AnalysisResult.module.css'

export default function AnalysisResult({ result }) {
  const [ownerTasks, setOwnerTasks] = useState(result.ownerTasks)
  const [complianceTasks, setComplianceTasks] = useState(result.complianceTasks)

  const toggleOwner = (id) => {
    setOwnerTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }
  const toggleCompliance = (id) => {
    setComplianceTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  const formatSummary = (text, criticalTerms) => {
    let result = text
    criticalTerms.forEach(term => {
      result = result.replace(term, `<span class="${styles.critical}">${term}</span>`)
    })
    return result
  }

  return (
    <div className={styles.container} style={{ animation: 'fade-in-up 0.4s ease both' }}>
      <div className={styles.header}>
        <div className={styles.avatar}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#5b6ef5" strokeWidth="1.5"/>
            <circle cx="12" cy="12" r="4" stroke="#5b6ef5" strokeWidth="1.5" strokeDasharray="2 2"/>
            <circle cx="12" cy="12" r="1.5" fill="#5b6ef5"/>
          </svg>
        </div>
        <p
          className={styles.summary}
          dangerouslySetInnerHTML={{ __html: formatSummary(result.summary, result.criticalTerms) }}
        />
      </div>

      <div className={styles.tasks}>
        <div className={styles.taskGroup}>
          <div className={styles.groupHeader}>
            <div className={styles.groupDot} style={{ background: '#5b6ef5' }} />
            <span className={styles.groupLabel}>PRODUCT OWNER TASKS</span>
          </div>
          {ownerTasks.map(task => (
            <label key={task.id} className={styles.taskItem} onClick={() => toggleOwner(task.id)}>
              <span className={`${styles.checkbox} ${task.done ? styles.checked : ''}`}>
                {task.done && (
                  <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </span>
              <span className={`${styles.taskLabel} ${task.done ? styles.taskDone : ''}`}>{task.label}</span>
            </label>
          ))}
        </div>

        <div className={styles.taskGroup}>
          <div className={styles.groupHeader}>
            <div className={styles.groupDot} style={{ background: '#22c55e' }} />
            <span className={styles.groupLabel}>COMPLIANCE ACTION PLAN</span>
          </div>
          {complianceTasks.map(task => (
            <label key={task.id} className={styles.taskItem} onClick={() => toggleCompliance(task.id)}>
              <span className={`${styles.checkbox} ${task.done ? styles.checked : ''}`}>
                {task.done && (
                  <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </span>
              <span className={`${styles.taskLabel} ${task.done ? styles.taskDone : ''}`}>{task.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.tags}>
        {result.tags.map(tag => (
          <span key={tag} className={styles.tag}>{tag}</span>
        ))}
      </div>
    </div>
  )
}
