import { useState } from 'react'
import styles from './AnalysisResult.module.css'

export default function AnalysisResult({ result }) {
  const [ownerTasks, setOwnerTasks] = useState(result.ownerTasks || [])
  const [complianceTasks, setComplianceTasks] = useState(result.complianceTasks || [])
  const [expandedProofs, setExpandedProofs] = useState(false)

  const toggleOwner = (id) => {
    setOwnerTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }
  const toggleCompliance = (id) => {
    setComplianceTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  const formatSummary = (text, criticalTerms) => {
    let resultText = text
    criticalTerms.forEach(term => {
      resultText = resultText.replace(term, `<span class="${styles.critical}">${term}</span>`)
    })
    return resultText
  }

  const getLevelLabel = (level) => {
    const labels = { critical: 'Критический', high: 'Высокий', medium: 'Средний', low: 'Низкий' }
    return labels[level] || level
  }

  const getPriorityLabel = (priority) => {
    const labels = { critical: 'Критично', high: 'Высокий', medium: 'Средний', low: 'Низкий' }
    return labels[priority] || priority
  }

  return (
    <div className={styles.container} style={{ animation: 'fade-in-up 0.4s ease both' }}>
      {/* Summary Header */}
      <div className={styles.header}>
        <div className={styles.avatar}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#224d47" strokeWidth="1.5"/>
            <circle cx="12" cy="12" r="4" stroke="#224d47" strokeWidth="1.5" strokeDasharray="2 2"/>
            <circle cx="12" cy="12" r="1.5" fill="#224d47"/>
          </svg>
        </div>
        <p
          className={styles.summary}
          dangerouslySetInnerHTML={{ __html: formatSummary(result.summary, result.criticalTerms) }}
        />
      </div>

      {/* Detection Zones */}
      {result.detectionZones && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4M12 16h.01"/>
            </svg>
            <span>Затронутые регуляторные зоны</span>
          </div>
          <div className={styles.zonesGrid}>
            {result.detectionZones.map(zone => (
              <div key={zone.id} className={styles.zoneCard} style={{ borderLeftColor: zone.color }}>
                <div className={styles.zoneHeader}>
                  <span className={styles.zoneName}>{zone.name}</span>
                  <span className={styles.zoneLevel} style={{ background: zone.color + '20', color: zone.color }}>
                    {getLevelLabel(zone.level)}
                  </span>
                </div>
                <p className={styles.zoneDesc}>{zone.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Checklists */}
      <div className={styles.tasks}>
        <div className={styles.taskGroup}>
          <div className={styles.groupHeader}>
            <div className={styles.groupDot} style={{ background: '#224d47' }} />
            <span className={styles.groupLabel}>ЗАДАЧИ PRODUCT OWNER</span>
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
            <div className={styles.groupDot} style={{ background: '#059669' }} />
            <span className={styles.groupLabel}>ПЛАН ДЕЙСТВИЙ COMPLIANCE</span>
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

      {/* Recommendations */}
      {result.recommendations && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <path d="M16 13H8M16 17H8M10 9H8"/>
            </svg>
            <span>Требуемые обновления документов</span>
          </div>
          <div className={styles.recommendations}>
            {result.recommendations.map(rec => (
              <div key={rec.id} className={styles.recCard}>
                <div className={styles.recHeader}>
                  <span className={styles.recDoc}>{rec.document}</span>
                  <span className={styles.recAction}>{rec.action}</span>
                </div>
                <p className={styles.recReason}>{rec.reason}</p>
                <span className={styles.recPriority} style={{ 
                  background: rec.priority === 'critical' ? '#fee2e2' : rec.priority === 'high' ? '#fef3c7' : '#f1f5f9',
                  color: rec.priority === 'critical' ? '#dc2626' : rec.priority === 'high' ? '#d97706' : '#64748b'
                }}>
                  Приоритет: {getPriorityLabel(rec.priority)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legal Proofs */}
      {result.proofs && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
            <span>Правовое обоснование</span>
            <button 
              className={styles.toggleProofs} 
              onClick={() => setExpandedProofs(!expandedProofs)}
            >
              {expandedProofs ? 'Скрыть' : 'Показать'}
            </button>
          </div>
          {expandedProofs && (
            <div className={styles.proofs}>
              {result.proofs.map(proof => (
                <div key={proof.id} className={styles.proofCard}>
                  <a 
                    href={proof.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={styles.proofLaw}
                  >
                    {proof.law}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M7 17L17 7M17 7H7M17 7V17"/>
                    </svg>
                  </a>
                  <p className={styles.proofDesc}>{proof.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tags */}
      <div className={styles.tags}>
        {result.tags.map(tag => (
          <span key={tag} className={styles.tag}>{tag}</span>
        ))}
      </div>
    </div>
  )
}
