import { useState, useRef, useEffect } from 'react'
import styles from './AgileModal.module.css'

export default function AgileModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    username: '',
    companyId: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const modalRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose()
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      // Reset form when modal opens
      setFormData({ username: '', companyId: '', password: '' })
      setErrors({})
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.username.trim()) {
      newErrors.username = 'Имя пользователя обязательно'
    }
    
    if (!formData.companyId.trim()) {
      newErrors.companyId = 'ID компании обязателен'
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Пароль обязателен'
    }
    
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('Form submitted with data:', formData)
    
    const newErrors = validateForm()
    console.log('Validation errors:', newErrors)
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setIsSubmitting(true)
    console.log('Starting submission...')
    
    try {
      console.log('Calling onSubmit with:', formData)
      await onSubmit(formData)
      console.log('onSubmit completed successfully')
      onClose()
    } catch (error) {
      console.error('Failed to bind Agile:', error)
      setErrors({ submit: 'Ошибка при привязке Agile' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal} ref={modalRef}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Привязать Agile</h2>
          <button 
            className={styles.modalClose} 
            onClick={onClose}
            disabled={isSubmitting}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.formLabel}>
              Имя пользователя
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Введите имя пользователя"
              className={`${styles.formInput} ${errors.username ? styles.error : ''}`}
              disabled={isSubmitting}
            />
            {errors.username && <span className={styles.errorMessage}>{errors.username}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="companyId" className={styles.formLabel}>
              ID компании
            </label>
            <input
              type="text"
              id="companyId"
              name="companyId"
              value={formData.companyId}
              onChange={handleChange}
              placeholder="Введите ID компании"
              className={`${styles.formInput} ${errors.companyId ? styles.error : ''}`}
              disabled={isSubmitting}
            />
            {errors.companyId && <span className={styles.errorMessage}>{errors.companyId}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.formLabel}>
              Пароль
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Введите пароль"
              className={`${styles.formInput} ${errors.password ? styles.error : ''}`}
              disabled={isSubmitting}
            />
            {errors.password && <span className={styles.errorMessage}>{errors.password}</span>}
          </div>

          {errors.submit && <div className={styles.submitError}>{errors.submit}</div>}

          <div className={styles.modalActions}>
            <button 
              type="button" 
              className={styles.cancelBtn} 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Отмена
            </button>
            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Привязка...' : 'Привязать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
