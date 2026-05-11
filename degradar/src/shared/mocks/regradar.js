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
  summary: 'Анализ завершён. Детекция выявила критические риски в зонах Data Privacy и AML. Рекомендую немедленно обновить DPIA.',
  criticalTerms: ['критические риски'],
  ownerTasks: [
    { id: 1, label: 'Draft Consent Flow for P2P sharing', done: false },
    { id: 2, label: 'Define Data Retention period (GDPR)', done: false },
  ],
  complianceTasks: [
    { id: 1, label: 'Update AML Monitoring Patterns', done: false },
    { id: 2, label: 'Verify PSD3 API Security compliance', done: false },
  ],
  tags: ['Privacy Policy Update', 'Regulation (EU) 2024/1689'],
}

export const mockMessages = [
  {
    id: 1,
    type: 'user',
    text: 'Нужно ли нам дополнительное согласие пользователя, если данные передаются только внутри страны?',
  },
]

export const mockLastAudit = '2м назад'
