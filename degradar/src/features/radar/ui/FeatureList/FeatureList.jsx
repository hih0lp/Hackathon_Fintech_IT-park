import { useState } from 'react'
import styles from './FeatureList.module.css'

export default function FeatureList({ features, selectedFeature, onSelectFeature, onDeleteFeature }) {
  const [deletingFeatureId, setDeletingFeatureId] = useState(null)

  const handleDeleteClick = (e, featureId) => {
    e.stopPropagation()
    setDeletingFeatureId(featureId)
  }

  const handleConfirmDelete = async (featureId) => {
    try {
      await onDeleteFeature(featureId)
      setDeletingFeatureId(null)
    } catch (error) {
      console.error('Failed to delete feature:', error)
      setDeletingFeatureId(null)
    }
  }

  const handleCancelDelete = () => {
    setDeletingFeatureId(null)
  }

  return (
    <div className={styles.container}>
      <div className={styles.label}>ФИЧИ ПРОЕКТА</div>
      <div className={styles.featuresList}>
        {features.map(feature => (
          <div key={feature.id} className={styles.featureItemWrapper}>
            <button
              className={`${styles.featureItem} ${selectedFeature?.id === feature.id ? styles.active : ''}`}
              onClick={() => onSelectFeature(feature)}
            >
              <div className={styles.featureInfo}>
                <span className={styles.featureName}>{feature.name}</span>
                <span className={styles.featureDate}>{feature.date}</span>
              </div>
              {selectedFeature?.id === feature.id && (
                <div className={styles.activeIndicator}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12l5 5L19 7" stroke="#224d47" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </button>
            
            <button
              className={styles.deleteButton}
              onClick={(e) => handleDeleteClick(e, feature.id)}
              title="Удалить фичу"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {deletingFeatureId === feature.id && (
              <div className={styles.deleteConfirmation}>
                <div className={styles.confirmationContent}>
                  <p>Удалить фичу "{feature.name}"?</p>
                  <div className={styles.confirmationButtons}>
                    <button 
                      className={styles.confirmButton}
                      onClick={() => handleConfirmDelete(feature.id)}
                    >
                      Да
                    </button>
                    <button 
                      className={styles.cancelButton}
                      onClick={handleCancelDelete}
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
