// Mock data for the REGRADAR application

export const mockProject = {
  id: 'pc',
  name: 'Fintech Core',
  initials: 'PC',
  color: '#5b6ef5',
}

export const mockRadarItems = [
  {
    id: 'kyc',
    label: 'KYC',
    sublabel: 'IDENTIFICATION',
    status: 'MEDIUM',
    color: '#f59e0b',
    progress: 62,
    icon: '👤',
  },
  {
    id: 'aml',
    label: 'AML',
    sublabel: 'ANTI-MONEY LAUNDERING',
    status: 'CRITICAL',
    color: '#ef4444',
    progress: 85,
    icon: '🚨',
    highlighted: true,
  },
  {
    id: 'gdpr',
    label: 'GDPR / PRIVACY',
    sublabel: 'DATA PROTECTION',
    status: 'HIGH',
    color: '#f97316',
    progress: 70,
    icon: '🔒',
  },
  {
    id: 'ai_act',
    label: 'AI ACT',
    sublabel: 'ALGORITHM ETHICS',
    status: 'LOW',
    color: '#22c55e',
    progress: 20,
    icon: '🤖',
  },
  {
    id: 'psd2',
    label: 'PSD2 / PSD3',
    sublabel: 'PAYMENTS DIRECTIVE',
    status: 'MODERATE',
    color: '#3b82f6',
    progress: 48,
    icon: '💳',
  },
  {
    id: 'open_banking',
    label: 'OPEN BANKING',
    sublabel: 'SHARED DATA ECOSYSTEM',
    status: 'SAFE',
    color: '#10b981',
    progress: 10,
    icon: '🔗',
  },
]

export const mockAnalysisResult = {
  summary: 'Анализ завершён. Выявлены критические риски в зонах Обработка персональных данных и AML. Требуется обновление DPIA и политики конфиденциальности.',
  criticalTerms: ['критические риски'],
  detectionZones: [
    { id: 'gdpr', name: 'GDPR / Защита данных', level: 'high', color: '#ea580c', description: 'Обработка персональных данных при P2P-переводах' },
    { id: 'aml', name: 'AML / Отмывание денег', level: 'critical', color: '#dc2626', description: 'Мониторинг подозрительных транзакций' },
    { id: 'kyc', name: 'KYC / Идентификация', level: 'medium', color: '#d97706', description: 'Верификация пользователей' },
    { id: 'psd2', name: 'PSD2 / Платежи', level: 'medium', color: '#2563eb', description: 'Сильная аутентификация клиентов (SCA)' },
  ],
  ownerTasks: [
    { id: 1, label: 'Согласовать текст согласия на обработку данных для P2P-шаринга', done: false },
    { id: 2, label: 'Определить сроки хранения данных (GDPR Art. 5)', done: false },
    { id: 3, label: 'Подготовить UX для запроса дополнительного согласия', done: false },
  ],
  complianceTasks: [
    { id: 1, label: 'Обновить паттерны мониторинга AML для P2P-транзакций', done: false },
    { id: 2, label: 'Проверить соответствие требованиям SCA (PSD2)', done: false },
    { id: 3, label: 'Провести оценку рисков DPIA (GDPR Art. 35)', done: false },
  ],
  recommendations: [
    { id: 1, document: 'Политика конфиденциальности', action: 'Обновить', reason: 'Новый способ обработки данных', priority: 'high' },
    { id: 2, document: 'Пользовательское соглашение', action: 'Дополнить', reason: 'Условия P2P-переводов', priority: 'high' },
    { id: 3, document: 'Политика AML/KYC', action: 'Пересмотреть', reason: 'Новые риски отмывания', priority: 'critical' },
    { id: 4, document: 'Регламент инцидентов', action: 'Актуализировать', reason: 'Процедуры уведомлений', priority: 'medium' },
  ],
  proofs: [
    { id: 1, law: 'GDPR Art. 6(1)(a)', description: 'Правовое основание обработки — согласие', link: 'https://gdpr-info.eu/art-6-gdpr/' },
    { id: 2, law: 'GDPR Art. 35', description: 'Обязательность DPIA для высокорисковой обработки', link: 'https://gdpr-info.eu/art-35-gdpr/' },
    { id: 3, law: 'Directive (EU) 2015/849', description: 'Требования к AML для платежных систем', link: '#' },
  ],
  tags: ['Обновление политик', 'DPIA', 'P2P-переводы'],
}

export const mockMessages = [
  {
    id: 1,
    type: 'user',
    text: 'Нужно ли нам дополнительное согласие пользователя, если данные передаются только внутри страны?',
  },
]

export const mockLastAudit = '2м назад'
