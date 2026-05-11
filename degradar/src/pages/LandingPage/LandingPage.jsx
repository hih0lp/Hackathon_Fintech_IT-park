import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { motion } from 'framer-motion'
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
    title: 'Радар в реальном времени',
    desc: 'Мгновенное сканирование фич на соответствие GDPR, AML, PSD2 и другим регуляторным фреймворкам.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 19h20L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M12 9v5M12 16v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Выявление критических рисков',
    desc: 'Автоматическое выявление критических зон в описании продуктовых фич до начала разработки.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'План действий по нормативному соответствию',
    desc: 'Конкретные задачи для Product Owner и команд юристов — прямо из описания фичи.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Синхронизация с Jira',
    desc: 'Одна кнопка — все задачи в Jira. Интеграция с вашей рабочей зоной без лишних шагов.',
  },
]

const regulations = ['KYC', 'AML', 'GDPR / КОНФИДЕНЦИАЛЬНОСТЬ', 'AI ACT', 'PSD2 / PSD3', 'ОТКРЫТЫЙ БАНКИНГ', 'DPIA', 'ISO 27001']

const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 4 + 2,
  delay: Math.random() * 5,
  duration: Math.random() * 10 + 10,
}))

export default function LandingPage({ onStart }) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const handleStart = () => {
    if (isAuthenticated) {
      navigate('/projects')
    } else {
      navigate('/register')
    }
  }

  return (
    <div className={styles.root}>
      {/* Floating Particles Background */}
      <div className={styles.particles}>
        {particles.map(p => (
          <motion.div
            key={p.id}
            className={styles.particle}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* НАВИГАЦИЯ */}
      <motion.header 
        className={styles.nav}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className={styles.navLogo}>
          <div className={styles.navLogoIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#224d47" strokeWidth="1.5"/>
              <circle cx="12" cy="12" r="5" stroke="#224d47" strokeWidth="1.5" strokeDasharray="2 2"/>
              <circle cx="12" cy="12" r="1.5" fill="#224d47"/>
            </svg>
          </div>
          <span>REGRADAR</span>
        </div>
        <nav className={styles.navLinks}>
          <a href="#regulations">Покрытие</a>
          <a href="#features">Возможности</a>
          <a href="#about">О продукте</a>
        </nav>
        <div className={styles.navActions}>
          {isAuthenticated ? (
            <button className={styles.navLaunch} onClick={handleStart}>
              Запустить
            </button>
          ) : (
            <>
              <Link to="/login" className={styles.navLogin}>Войти</Link>
              <Link to="/register" className={styles.navSignup}>Регистрация</Link>
            </>
          )}
        </div>
      </motion.header>

      {/* ГЕРОЙ */}
      <section className={styles.hero}>
        <motion.div 
          className={styles.heroBadge}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.span 
            className={styles.heroLiveDot}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          Аналитика соответствия в реальном времени
        </motion.div>
        
        <motion.h1 
          className={styles.heroTitle}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Запускайте фичи.<br />
          <motion.span 
            className={styles.heroGradient}
            animate={{ 
              backgroundPosition: ['0%', '100%', '0%'],
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: 'linear'
            }}
          >Оставайтесь без рисков.</motion.span>
        </motion.h1>
        
        <motion.p 
          className={styles.heroSub}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          REGRADAR анализирует новые фичи на регуляторные риски в реальном времени —
          AML, GDPR, PSD2, AI ACT и другие, прямо из описания вашей задачи.
        </motion.p>
        
        <motion.div 
          className={styles.heroActions}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <motion.button 
            className={styles.heroPrimary} 
            onClick={handleStart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2"/>
              <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
            </svg>
            {isAuthenticated ? 'Запустить радар' : 'Начать'}
          </motion.button>
          <motion.button 
            className={styles.heroSecondary}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Смотреть демо
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
              <polygon points="10,8 16,12 10,16" fill="currentColor"/>
            </svg>
          </motion.button>
          {!isAuthenticated && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/register" className={styles.heroRegister}>
                Регистрация
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="10,17 15,12 10,7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="15" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </motion.div>
          )}
        </motion.div>

        {/* Превью метрик радара */}
        <motion.div 
          className={styles.heroPreview}
          initial={{ opacity: 0, rotateX: 10 }}
          animate={{ opacity: 1, rotateX: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          whileHover={{ 
            rotateX: -5,
            rotateY: 5,
            scale: 1.02
          }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className={styles.previewCard}>
            <motion.div 
              className={styles.previewHeader}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className={styles.previewDot} />
              <span>СТАТУС РАДАРА — СКАНИРОВАНИЕ...</span>
            </motion.div>
            <div className={styles.previewItems}>
              {[
                { label: 'KYC', status: 'СРЕДНИЙ', color: '#d97706' },
                { label: 'AML', status: 'КРИТИЧЕСКИЙ', color: '#224d47' },
                { label: 'GDPR', status: 'ВЫСОКИЙ', color: '#ea6c0a' },
                { label: 'PSD2', status: 'УМЕРЕННЫЙ', color: '#2563eb' },
                { label: 'ОТКРЫТЫЙ БАНКИНГ', status: 'БЕЗОПАСНО', color: '#059669' },
              ].map((item, index) => (
                <motion.div 
                  key={item.label} 
                  className={styles.previewItem}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                >
                  <span className={styles.previewLabel}>{item.label}</span>
                  <motion.span 
                    className={styles.previewStatus} 
                    style={{ color: item.color, background: item.color + '18' }}
                    whileHover={{ scale: 1.1 }}
                  >
                    {item.status}
                  </motion.span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* БЕГУЩАЯ СТРОКА РЕГУЛИРОВАНИЙ */}
      <div className={styles.ticker} id="regulations">
        <div className={styles.tickerTrack}>
          {[...regulations, ...regulations, ...regulations].map((reg, i) => (
            <span key={i} className={styles.tickerItem}>{reg}</span>
          ))}
        </div>
      </div>

      {/* ВОЗМОЖНОСТИ */}
      <motion.section 
        className={styles.features} 
        id="features"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className={styles.sectionLabel}>ПОЧЕМУ REGRADAR</div>
        <h2 className={styles.sectionTitle}>Создан для продуктовых команд, которые запускаются быстро</h2>
        <div className={styles.featureGrid}>
          {features.map((f, index) => (
            <motion.div 
              key={f.title} 
              className={styles.featureCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* О ПРОДУКТЕ */}
      <section className={styles.aboutSection} id="about">
        <div className={styles.aboutHeader}>
          <h2 className={styles.aboutTitle}>Как это работает</h2>
        </div>
        <div className={styles.aboutSteps}>
          <div className={styles.aboutStep}>
            <div className={styles.aboutStepNum}>1</div>
            <div className={styles.aboutStepIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <path d="M8 12h8M8 8h8M8 16h5" />
              </svg>
            </div>
            <p className={styles.aboutStepText}>Вставьте описание фичи</p>
          </div>
          <div className={styles.aboutArrow}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </div>
          <div className={styles.aboutStep}>
            <div className={styles.aboutStepNum}>2</div>
            <div className={styles.aboutStepIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
            </div>
            <p className={styles.aboutStepText}>ИИ анализирует риски</p>
          </div>
          <div className={styles.aboutArrow}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </div>
          <div className={styles.aboutStep}>
            <div className={styles.aboutStepNum}>3</div>
            <div className={styles.aboutStepIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
            </div>
            <p className={styles.aboutStepText}>Получите план действий и чек-лист</p>
          </div>
        </div>
        <div className={styles.aboutBuilt}>
          <p className={styles.aboutBuiltLabel}>Создано для</p>
          <div className={styles.aboutBuiltGrid}>
            <div className={styles.aboutBuiltItem}>
              <div className={styles.aboutBuiltIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              <span>Владельцев продукта</span>
            </div>
            <div className={styles.aboutBuiltItem}>
              <div className={styles.aboutBuiltIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <span>Аналитиков</span>
            </div>
            <div className={styles.aboutBuiltItem}>
              <div className={styles.aboutBuiltIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
              </div>
              <span>Разработчиков</span>
            </div>
            <div className={styles.aboutBuiltItem}>
              <div className={styles.aboutBuiltIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="M16 13H8M16 17H8M10 9H8" />
                </svg>
              </div>
              <span>Юристов</span>
            </div>
          </div>
        </div>
        <motion.button 
          className={styles.aboutCta} 
          onClick={handleStart}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isAuthenticated ? 'Запустить радар' : 'Начать бесплатный анализ'}
        </motion.button>
      </section>

      {/* ФУТЕР */}
      <footer className={styles.footer}>
        <div className={styles.footerLogo}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#224d47" strokeWidth="1.5"/>
            <circle cx="12" cy="12" r="4" stroke="#224d47" strokeWidth="1.5" strokeDasharray="2 2"/>
            <circle cx="12" cy="12" r="1.5" fill="#224d47"/>
          </svg>
          REGRADAR
        </div>
        <span className={styles.footerCopy}>© 2025 REGRADAR. Платформа правовой аналитики.</span>
      </footer>
    </div>
  )
}
