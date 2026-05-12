import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import styles from './ProfileDropdown.module.css'

export default function ProfileDropdown() {
  const { logout, user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  const handleBindAgile = () => {
    // TODO: Implement Agile binding logic
    console.log('Привязать Agile')
    setIsOpen(false)
  }

  return (
    <div className={styles.profileDropdown} ref={dropdownRef}>
      <button 
        className={styles.profileButton}
        onClick={handleToggleDropdown}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <span>{user?.email || 'Профиль'}</span>
        <svg 
          width="12" 
          height="12" 
          viewBox="0 0 24 24" 
          fill="none" 
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu}>
          <div className={styles.userInfo}>
            <div className={styles.userEmail}>{user?.email || 'user@example.com'}</div>
          </div>
          <div className={styles.menuDivider} />
          <button className={styles.dropdownItem} onClick={handleBindAgile}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
            Привязать Agile
          </button>
          <button className={styles.dropdownItem} onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Выйти из профиля
          </button>
        </div>
      )}
    </div>
  )
}
