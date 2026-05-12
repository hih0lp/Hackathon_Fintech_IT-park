import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import ProfileDropdown from '../ProfileDropdown/ProfileDropdown.jsx'
import ProjectSelector from '../ProjectSelector/ProjectSelector.jsx'
import styles from './Header.module.css'

export default function Header({ project }) {
  const { isAuthenticated } = useAuth()
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Link to="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#224d47" strokeWidth="1.5"/>
              <circle cx="12" cy="12" r="5" stroke="#224d47" strokeWidth="1.5" strokeDasharray="2 2"/>
              <circle cx="12" cy="12" r="1.5" fill="#224d47"/>
              <line x1="12" y1="2" x2="12" y2="6" stroke="#224d47" strokeWidth="1.5"/>
            </svg>
          </div>
          <span className={styles.logoText}>FinScope</span>
        </Link>

        <div className={styles.divider} />

        <ProjectSelector currentProject={project} />
      </div>

      <nav className={styles.nav}>
        {/* <a href="#" className={styles.navLink}>DOCUMENTATION</a> */}
        {isAuthenticated ? (
          <ProfileDropdown />
        ) : (
          <Link to="/login" className={styles.userBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </Link>
        )}
      </nav>
    </header>
  )
}
