import styles from './RadarPanel.module.css'

const statusColorMap = {
  CRITICAL: 'var(--status-critical)',
  HIGH: 'var(--status-high)',
  MEDIUM: 'var(--status-medium)',
  MODERATE: 'var(--status-moderate)',
  LOW: 'var(--status-low)',
  SAFE: 'var(--status-safe)',
}

const statusBgMap = {
  CRITICAL: 'var(--status-critical-bg)',
  HIGH: 'var(--status-high-bg)',
  MEDIUM: 'var(--status-medium-bg)',
  MODERATE: 'var(--status-moderate-bg)',
  LOW: 'var(--status-low-bg)',
  SAFE: 'var(--status-safe-bg)',
}

function RadarItem({ item }) {
  const color = statusColorMap[item.status]
  const bgColor = statusBgMap[item.status]

  return (
    <div className={`${styles.item} ${item.highlighted ? styles.highlighted : ''}`}
         style={item.highlighted ? { background: bgColor, borderColor: color + '33' } : {}}>
      <div className={styles.itemLeft}>
        <div className={styles.itemIcon} style={{ background: bgColor, borderColor: color + '33' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            {item.id === 'kyc' && <><circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.5"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></>}
            {item.id === 'aml' && <><path d="M12 2L2 19h20L12 2z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/><path d="M12 9v5M12 16v1" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></>}
            {item.id === 'gdpr' && <><rect x="5" y="11" width="14" height="10" rx="2" stroke={color} strokeWidth="1.5"/><path d="M8 11V7a4 4 0 018 0v4" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></>}
            {item.id === 'ai_act' && <><rect x="3" y="3" width="18" height="18" rx="3" stroke={color} strokeWidth="1.5"/><path d="M8 12h8M12 8v8" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></>}
            {item.id === 'psd2' && <><rect x="2" y="6" width="20" height="14" rx="2" stroke={color} strokeWidth="1.5"/><path d="M2 10h20" stroke={color} strokeWidth="1.5"/></>}
            {item.id === 'open_banking' && <><circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></>}
          </svg>
        </div>
        <div className={styles.itemInfo}>
          <span className={styles.itemLabel}>{item.label}</span>
          <span className={styles.itemSublabel}>{item.sublabel}</span>
        </div>
      </div>
      <div className={styles.itemRight}>
        <span className={styles.itemStatus} style={{ color, background: bgColor }}>
          {item.status}
        </span>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${item.progress}%`, background: color }} />
        </div>
      </div>
    </div>
  )
}

export default function RadarPanel({ items, lastAudit }) {
  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <span className={styles.title}>RADAR STATUS</span>
          <div className={styles.scanning}>
            <span className={styles.dot} />
            <span>SCANNING...</span>
          </div>
        </div>
        <p className={styles.subtitle}>
          REAL-TIME REGULATORY COMPLIANCE MAPPING FOR EMEA MARKET
        </p>
      </div>

      <div className={styles.items}>
        {items.map(item => (
          <RadarItem key={item.id} item={item} />
        ))}
      </div>

      <div className={styles.footer}>
        <button className={styles.syncBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          SYNC WITH JIRA
        </button>
        <span className={styles.auditLabel}>LAST AUDIT: {lastAudit}</span>
      </div>
    </aside>
  )
}
