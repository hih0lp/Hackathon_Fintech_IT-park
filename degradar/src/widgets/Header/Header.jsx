import styles from './Header.module.css'

export default function Header({ project }) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#5b6ef5" strokeWidth="1.5"/>
              <circle cx="12" cy="12" r="5" stroke="#5b6ef5" strokeWidth="1.5" strokeDasharray="2 2"/>
              <circle cx="12" cy="12" r="1.5" fill="#5b6ef5"/>
              <line x1="12" y1="2" x2="12" y2="6" stroke="#5b6ef5" strokeWidth="1.5"/>
            </svg>
          </div>
          <span className={styles.logoText}>REGRADAR</span>
        </div>

        <div className={styles.divider} />

        <button className={styles.projectSelector}>
          <div className={styles.projectBadge} style={{ background: project.color + '22', borderColor: project.color + '44' }}>
            <span style={{ color: project.color }}>{project.initials}</span>
          </div>
          <span className={styles.projectLabel}>PROJECT</span>
          <span className={styles.projectName}>{project.name}</span>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={styles.chevron}>
            <path d="M2 4L5 7L8 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <nav className={styles.nav}>
        <a href="#" className={styles.navLink}>DOCUMENTATION</a>
        <a href="#" className={styles.navLink}>ACTIVE VAULT</a>
        <button className={styles.userBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </nav>
    </header>
  )
}
