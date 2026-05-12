import { useAuth } from '../../context/AuthContext.jsx'
import styles from './AccountPage.module.css'

export default function AccountPage() {
  const { isAuthenticated, logout } = useAuth()

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  return (
    <div className={styles.accountPage}>
      <div className={styles.container}>
        <h1 className={styles.title}>Профиль</h1>
        
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Информация о пользователе</h2>
          <div className={styles.info}>
            <p className={styles.infoItem}>
              <span className={styles.label}>Статус:</span>
              <span className={styles.value}>
                {isAuthenticated ? 'Авторизован' : 'Не авторизован'}
              </span>
            </p>
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Управление аккаунтом</h2>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Выйти из аккаунта
          </button>
        </div>
      </div>
    </div>
  )
}
