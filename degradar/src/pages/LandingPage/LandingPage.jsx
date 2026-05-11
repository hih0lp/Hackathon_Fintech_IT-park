import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import styles from './LandingPage.module.css'

const features = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2"/>
        <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
      </svg>
    ),
    title: 'Real-Time Radar',
    desc: 'Мгновенное сканирование фич на соответствие GDPR, AML, PSD2 и другим регуляторным фреймворкам.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 19h20L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M12 9v5M12 16v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Critical Risk Detection',
    desc: 'Автоматическое выявление критических зон в описании продуктовых фич до начала разработки.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Compliance Action Plan',
    desc: 'Конкретные задачи для Product Owner и команды compliance — прямо из описания фичи.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Jira Sync',
    desc: 'Одна кнопка — все задачи в Jira. Интеграция с вашим workflow без лишних шагов.',
  },
]

const regulations = ['KYC', 'AML', 'GDPR / PRIVACY', 'AI ACT', 'PSD2 / PSD3', 'OPEN BANKING', 'DPIA', 'ISO 27001']

export default function LandingPage({ onStart }) {
  return (
    <div className={styles.root}>
      {/* NAV */}
      <header className={styles.nav}>
        <div className={styles.navLogo}>
          <div className={styles.navLogoIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#5b6ef5" strokeWidth="1.5"/>
              <circle cx="12" cy="12" r="5" stroke="#5b6ef5" strokeWidth="1.5" strokeDasharray="2 2"/>
              <circle cx="12" cy="12" r="1.5" fill="#5b6ef5"/>
            </svg>
          </div>
          <span>REGRADAR</span>
        </div>
        <nav className={styles.navLinks}>
          <a href="#features">Features</a>
          <a href="#regulations">Coverage</a>
          <a href="#about">About</a>
        </nav>
        <div className={styles.navActions}>
          <Link to="/login" className={styles.navLogin}>Log In</Link>
          <Link to="/register" className={styles.navSignup}>Sign Up</Link>
          <button className={styles.navCta} onClick={onStart}>
            Launch App →
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <span className={styles.heroLiveDot} />
          Real-time compliance intelligence
        </div>
        <h1 className={styles.heroTitle}>
          Ship features.<br />
          <span className={styles.heroGradient}>Stay compliant.</span>
        </h1>
        <p className={styles.heroSub}>
          REGRADAR анализирует новые фичи на регуляторные риски в реальном времени —
          AML, GDPR, PSD2, AI ACT и другие, прямо из описания вашей задачи.
        </p>
        <div className={styles.heroActions}>
          <button className={styles.heroPrimary} onClick={onStart}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2"/>
              <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
            </svg>
            Initialize Radar
          </button>
          <button className={styles.heroSecondary}>
            Watch Demo
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
              <polygon points="10,8 16,12 10,16" fill="currentColor"/>
            </svg>
          </button>
          <a href="/register" className={styles.heroRegister}>
            Sign Up
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="10,17 15,12 10,7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="15" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>

        {/* Floating radar metrics preview */}
        <div className={styles.heroPreview}>
          <div className={styles.previewCard}>
            <div className={styles.previewHeader}>
              <span className={styles.previewDot} />
              <span>RADAR STATUS — SCANNING...</span>
            </div>
            <div className={styles.previewItems}>
              {[
                { label: 'KYC', status: 'MEDIUM', color: '#d97706' },
                { label: 'AML', status: 'CRITICAL', color: '#dc2626' },
                { label: 'GDPR', status: 'HIGH', color: '#ea6c0a' },
                { label: 'PSD2', status: 'MODERATE', color: '#2563eb' },
                { label: 'OPEN BANKING', status: 'SAFE', color: '#059669' },
              ].map(item => (
                <div key={item.label} className={styles.previewItem}>
                  <span className={styles.previewLabel}>{item.label}</span>
                  <span className={styles.previewStatus} style={{ color: item.color, background: item.color + '18' }}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* REGULATIONS TICKER */}
      <div className={styles.ticker} id="regulations">
        <div className={styles.tickerTrack}>
          {[...regulations, ...regulations, ...regulations].map((reg, i) => (
            <span key={i} className={styles.tickerItem}>{reg}</span>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section className={styles.features} id="features">
        <div className={styles.sectionLabel}>WHY REGRADAR</div>
        <h2 className={styles.sectionTitle}>Built for product teams who ship fast</h2>
        <div className={styles.featureGrid}>
          {features.map(f => (
            <div key={f.title} className={styles.featureCard}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className={styles.ctaBanner} id="about">
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>Готовы проверить свою следующую фичу?</h2>
          <p className={styles.ctaSub}>Запустите анализ за 30 секунд — без регистрации.</p>
          <button className={styles.ctaBtn} onClick={onStart}>
            Initialize Radar
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerLogo}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#5b6ef5" strokeWidth="1.5"/>
            <circle cx="12" cy="12" r="4" stroke="#5b6ef5" strokeWidth="1.5" strokeDasharray="2 2"/>
            <circle cx="12" cy="12" r="1.5" fill="#5b6ef5"/>
          </svg>
          REGRADAR
        </div>
        <span className={styles.footerCopy}>© 2025 REGRADAR. Compliance Intelligence Platform.</span>
      </footer>
    </div>
  )
}
