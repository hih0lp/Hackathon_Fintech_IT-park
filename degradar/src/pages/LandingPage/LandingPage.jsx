import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import styles from './LandingPage.module.css'

const tickerItems = [
  'GDPR', 'AML / KYC', 'PSD2 / PSD3', 'AI ACT', 'DPIA', 'ISO 27001', 'DORA', 'Открытый банкинг',
]

const ArrowIcon = () => (
  <svg className={styles.icon} viewBox="0 0 24 24" fill="none">
    <path d="M5 12h14M13 5l7 7-7 7" />
  </svg>
)

const features = [
  {
    icon: (
      <svg className={styles.iconLg} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="4" strokeDasharray="2 2" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
    num: '/ 01',
    title: 'Радар в реальном времени',
    desc: 'Сканируем фичу прямо во время написания спеки — не пакетно раз в спринт.',
    variant: 'feat1',
  },
  {
    icon: (
      <svg className={styles.iconLg} viewBox="0 0 24 24" fill="none">
        <path d="M12 3L2 20h20L12 3z" />
        <path d="M12 10v5M12 17v.5" />
      </svg>
    ),
    num: '/ 02',
    title: 'Критические зоны до релиза',
    desc: 'Выявляем риски в описании фичи — до того, как команда начнёт писать код.',
    variant: 'feat2',
  },
  {
    icon: (
      <svg className={styles.iconLg} viewBox="0 0 24 24" fill="none">
        <rect x="4" y="4" width="16" height="16" rx="3" />
        <path d="M8 12l3 3 5-5" />
      </svg>
    ),
    num: '/ 03',
    title: 'План действий по комплаенсу',
    desc: 'Конкретные задачи для PO, юристов и инженеров — собраны прямо из описания.',
    variant: 'feat3',
  },
  {
    icon: (
      <svg className={styles.iconLg} viewBox="0 0 24 24" fill="none">
        <path d="M3 4v6h6M21 20v-6h-6" />
        <path d="M20 9A8 8 0 005.6 5.6L3 8M21 16a8 8 0 01-14.4 2.4L4 16" />
      </svg>
    ),
    num: '/ 04',
    title: 'Синхронизация с Jira',
    desc: 'Одна кнопка — задачи появляются в нужных проектах с правильными лейблами.',
    variant: 'feat4',
  },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const handleStart = () => {
    navigate(isAuthenticated ? '/projects' : '/register')
  }

  return (
    <div className={styles.root}>

      {/* NAV */}
      <header className={styles.nav}>
        <div className={styles.logo}>
          <div className={styles.mark}><span className={styles.markDot} /></div>
          <span>REGRADAR</span>
        </div>
        <nav className={styles.navLinks}>
          <a href="#features">Возможности</a>
          <a href="#how">Как работает</a>
          <a href="#regulations">Покрытие</a>
        </nav>
        <div className={styles.navRight}>
          {isAuthenticated ? (
            <button className={styles.btnPri} onClick={handleStart}>
              Запустить <ArrowIcon />
            </button>
          ) : (
            <>
              <Link to="/login" className={styles.btnGhost}>Войти</Link>
              <Link to="/register" className={styles.btnPri}>
                Начать <ArrowIcon />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroRadar} />
        <div className={styles.heroRings}>
          <span /><span /><span /><span />
        </div>
        <div className={styles.heroGrid} />

        <span className={`${styles.blip} ${styles.b1}`} />
        <span className={`${styles.blip} ${styles.blipWarn} ${styles.b2}`} />
        <span className={`${styles.blip} ${styles.blipPlum} ${styles.b3}`} />
        <span className={`${styles.blip} ${styles.blipWarn} ${styles.b4}`} />
        <span className={`${styles.blip} ${styles.blipPlum} ${styles.b5}`} />
        <span className={`${styles.blip} ${styles.b6}`} />

        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>
            <span className={styles.eyebrowDot} />
            Аналитика соответствия в реальном времени
          </span>

          <h1 className={styles.h1}>
            Запускайте <em>фичи</em>.<br />
            Оставайтесь <span className={styles.under}>без рисков</span>.
          </h1>

          <p className={styles.lead}>
            REGRADAR анализирует новые продуктовые фичи на регуляторные риски —
            GDPR, AML, PSD2, AI Act — прямо из описания задачи. Без юристов на ревью,
            без шаблонов, без бесконечных согласований.
          </p>

          <div className={styles.ctaRow}>
            <button className={styles.btnCta} onClick={handleStart}>
              Сканировать бесплатно <ArrowIcon />
            </button>
            <button className={styles.btnLine}>
              <svg className={styles.icon} viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" />
                <polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none" />
              </svg>
              Смотреть демо
            </button>
          </div>

          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <div className={styles.statVal}>240+</div>
              <div className={styles.statLabel}>КОМАНД ИСПОЛЬЗУЮТ</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statVal}>18</div>
              <div className={styles.statLabel}>ФРЕЙМВОРКОВ</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statVal}>30с</div>
              <div className={styles.statLabel}>НА ОДНУ ФИЧУ</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statVal}>~0</div>
              <div className={styles.statLabel}>ЧАСОВ ЮРИСТОВ</div>
            </div>
          </div>
        </div>

        <div className={styles.scrollHint}>
          <span>прокрутите</span>
          <span className={styles.scrollLine} />
        </div>
      </section>

      {/* TICKER */}
      <div className={styles.ticker} id="regulations">
        <div className={styles.tickerTrack}>
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className={styles.tickerItem}>{item}</span>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section className={styles.features} id="features">
        <div className={styles.sectionHead}>
          <div>
            <span className={styles.kicker}>Почему REGRADAR</span>
            <h2 className={styles.sectionTitle}>
              Создан для команд, которые <em>запускаются быстро</em>.
            </h2>
          </div>
          <p className={styles.sectionSub}>
            Четыре инструмента, которые превращают регуляторное ревью из стопора в спокойную инфраструктуру.
          </p>
        </div>
        <div className={styles.featGrid}>
          {features.map((f, i) => (
            <article key={i} className={`${styles.feat} ${styles[f.variant]}`}>
              <div className={styles.featIc}>{f.icon}</div>
              <span className={styles.featNum}>{f.num}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* HOW */}
      <section className={styles.how} id="how">
        <div className={styles.howInner}>
          <div className={styles.sectionHead}>
            <div>
              <span className={styles.kicker}>Как это работает</span>
              <h2 className={styles.sectionTitle}>
                Три шага между идеей и <em>спокойным релизом</em>.
              </h2>
            </div>
            <p className={styles.sectionSub}>
              Без интеграций по два месяца. Просто вставьте описание фичи — остальное соберёт радар.
            </p>
          </div>
          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={`${styles.stepN} ${styles.stepN1}`}>01</div>
              <h4>Вставьте описание</h4>
              <p>Любой формат — Jira-тикет, Notion-страница, заметки со звонка с PM.</p>
            </div>
            <div className={styles.step}>
              <div className={`${styles.stepN} ${styles.stepN2}`}>02</div>
              <h4>ИИ читает законы за вас</h4>
              <p>Сверяем с 18+ регуляторными фреймворками и базой судебных прецедентов.</p>
            </div>
            <div className={styles.step}>
              <div className={`${styles.stepN} ${styles.stepN3}`}>03</div>
              <h4>Получите план</h4>
              <p>Чек-лист, задачи в Jira, цитаты статей закона, шаблоны DPIA — в одном окне.</p>
            </div>
          </div>
          <div className={styles.audience}>
            <span className={styles.audienceLbl}>создано для</span>
            <span className={styles.aud}>
              <span className={`${styles.audDot} ${styles.audDotDark}`} /> Product Owners
            </span>
            <span className={styles.aud}>
              <span className={`${styles.audDot} ${styles.audDotTeal}`} /> Аналитики
            </span>
            <span className={styles.aud}>
              <span className={`${styles.audDot} ${styles.audDotPlum}`} /> Инженеры
            </span>
            <span className={styles.aud}>
              <span className={`${styles.audDot} ${styles.audDotSoft}`} /> Юристы
            </span>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className={styles.final}>
        <h3 className={styles.finalTitle}>
          Начните <em>бесплатный</em> анализ за 30 секунд.
        </h3>
        <p className={styles.finalSub}>
          Без карты, без созвонов с продажами. Подключитесь, вставьте описание фичи и получите отчёт.
        </p>
        <button className={styles.btnCtaLight} onClick={handleStart}>
          Запустить радар <ArrowIcon />
        </button>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.logo}>
          <div className={styles.mark}><span className={styles.markDot} /></div>
          <span>REGRADAR</span>
        </div>
        <div className={styles.footerLinks}>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Status</a>
          <a href="#">Контакты</a>
        </div>
        <span>© 2026 REGRADAR · Платформа правовой аналитики</span>
      </footer>

    </div>
  )
}
