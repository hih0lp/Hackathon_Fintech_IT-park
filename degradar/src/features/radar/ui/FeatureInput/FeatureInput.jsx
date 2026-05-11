import { useState } from 'react'
import styles from './FeatureInput.module.css'

export default function FeatureInput({ onAnalyze, isAnalyzing }) {
  const [value, setValue] = useState('')

  const handleSubmit = () => {
    if (value.trim()) onAnalyze(value)
  }

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <span className={styles.label}>INPUT FEATURE CONTEXT</span>
        <div className={styles.realtime}>
          <span className={styles.dot} />
          <span>REAL-TIME PROCESSING ENABLED</span>
        </div>
      </div>

      <div className={styles.inputWrap}>
        <textarea
          className={styles.textarea}
          placeholder="Опишите новую фичу (например: 'Внедряем обмен контактами для P2P переводов через Open Banking API')..."
          value={value}
          onChange={e => setValue(e.target.value)}
          rows={4}
        />
        <div className={styles.inputActions}>
          <div className={styles.leftActions}>
            <button className={styles.attachBtn}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              + ATTACHMENT
            </button>
            <button className={styles.attachBtn}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              PROMPT TEMPLATE
            </button>
          </div>
          <button
            className={styles.initBtn}
            onClick={handleSubmit}
            disabled={isAnalyzing || !value.trim()}
          >
            {isAnalyzing ? (
              <>
                <span className={styles.spinner} />
                ANALYZING...
              </>
            ) : (
              <>
                INITIALIZE RADAR
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
