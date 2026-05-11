import { useState } from 'react'
import styles from './RadarPage.module.css'
import FeatureInput from '../../features/radar/ui/FeatureInput/FeatureInput.jsx'
import AnalysisResult from '../../features/radar/ui/AnalysisResult/AnalysisResult.jsx'
import ChatPanel from '../../features/radar/ui/ChatPanel/ChatPanel.jsx'
import RadarPanel from '../../widgets/RadarPanel/RadarPanel.jsx'
import Header from '../../widgets/Header/Header.jsx'
import {
  mockProject,
  mockRadarItems,
  mockAnalysisResult,
  mockMessages,
  mockLastAudit,
} from '../../shared/mocks/regradar.js'

export default function RadarPage() {
  const [analysisResult, setAnalysisResult] = useState(mockAnalysisResult)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [messages, setMessages] = useState(mockMessages)

  const handleAnalyze = (text) => {
    setIsAnalyzing(true)
    setTimeout(() => {
      setIsAnalyzing(false)
      // Имитация анализа текста — в реальности здесь будет запрос к LLM
      const detectedZones = [
        { id: 'gdpr', name: 'GDPR / Защита данных', level: 'high', color: '#ea580c', description: 'Обработка персональных данных' },
        { id: 'aml', name: 'AML / Отмывание денег', level: 'critical', color: '#dc2626', description: 'Риски подозрительных операций' },
      ]
      
      setAnalysisResult({
        ...mockAnalysisResult,
        summary: `Анализ завершён. Выявлены критические риски в зонах "Защита данных" и "AML". Требуется обновление политик.`,
        detectionZones: detectedZones,
        ownerTasks: [
          { id: 1, label: 'Согласовать текст согласия на обработку данных', done: false },
          { id: 2, label: 'Определить сроки хранения данных (GDPR Art. 5)', done: false },
          { id: 3, label: 'Подготовить UX для запроса согласия', done: false },
        ],
        complianceTasks: [
          { id: 1, label: 'Обновить паттерны мониторинга AML', done: false },
          { id: 2, label: 'Проверить соответствие SCA (PSD2)', done: false },
          { id: 3, label: 'Провести оценку DPIA (GDPR Art. 35)', done: false },
        ],
      })
    }, 1800)
  }

  const handleSendMessage = (text) => {
    const newMsg = { id: Date.now(), type: 'user', text }
    setMessages(prev => [...prev, newMsg])
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        text: 'По нормам GDPR Art. 6(1)(a), если данные не покидают страну-участника ЕС, дополнительное согласие не требуется. Однако рекомендую зафиксировать правовое основание в DPIA.',
      }])
    }, 1200)
  }

  return (
    <div className={styles.root}>
      <Header project={mockProject} />

      <div className={styles.body}>
        {/* Main content */}
        <main className={styles.main}>
          <div className={styles.scroll}>
            <div className={styles.content}>
              <FeatureInput onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />

              {analysisResult && (
                <AnalysisResult result={analysisResult} />
              )}

              <ChatPanel messages={messages} onSend={handleSendMessage} />
            </div>
          </div>
        </main>

        {/* Right radar panel */}
        <RadarPanel items={mockRadarItems} lastAudit={mockLastAudit} />
      </div>
    </div>
  )
}
