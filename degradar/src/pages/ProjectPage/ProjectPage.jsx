import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { projects, chats } from '../../api/client'
import { useAuth } from '../../context/AuthContext.jsx'
import ProfileDropdown from '../../widgets/ProfileDropdown/ProfileDropdown.jsx'
import AgentModal from '../../widgets/AgentModal/AgentModal.jsx'
import styles from './ProjectPage.module.css'

export default function ProjectPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [project, setProject] = useState(null)
  const [features, setFeatures] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newFeatureName, setNewFeatureName] = useState('')
  const [showAgentModal, setShowAgentModal] = useState(false)
  const [creatingVersionId, setCreatingVersionId] = useState(null)

  // Load project and its chats (features)
  useEffect(() => {
    loadProjectData()
  }, [projectId])

  async function loadProjectData() {
    setIsLoading(true)
    setError('')
    try {
      const [projectData, chatsData] = await Promise.all([
        projects.get(projectId),
        chats.list({ project: projectId })
      ])
      setProject(projectData)
      setFeatures(chatsData.results || [])
    } catch (err) {
      setError(err.message || 'Ошибка загрузки проекта')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenFeature = (featureId) => {
    navigate(`/radar?project=${projectId}&feature=${featureId}`)
  }

  const handleCreateFeature = async (e) => {
    e.preventDefault()
    if (!newFeatureName.trim()) return

    try {
      await chats.create({
        name: newFeatureName,
        project_id: parseInt(projectId),
        available: true
      })
      await loadProjectData()
      setNewFeatureName('')
      setShowCreateModal(false)
    } catch (err) {
      setError(err.message || 'Ошибка создания фичи')
    }
  }

  const handleAgentSelect = (agent) => {
    console.log('Selected agent:', agent)
    // Here you can implement what happens when an agent is selected
    // For example, you could open a chat with this agent or navigate to a specific page
    setShowAgentModal(false)
  }

  const handleCreateNewVersion = async (e, featureId) => {
    e.stopPropagation()
    setCreatingVersionId(featureId)
    
    try {
      await chats.createNewVersion(featureId)
      await loadProjectData() // Обновляем список фич
    } catch (error) {
      console.error('Failed to create new version:', error)
      setError('Не удалось создать новую версию')
      setTimeout(() => setError(null), 3000)
    } finally {
      setCreatingVersionId(null)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className={styles.page}>
      <header className={styles.nav}>
        <div className={styles.navLeft}>
          <Link to="/" className={styles.logo}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#224d47" strokeWidth="1.5"/>
              <circle cx="12" cy="12" r="5" stroke="#224d47" strokeWidth="1.5" strokeDasharray="2 2"/>
              <circle cx="12" cy="12" r="1.5" fill="#224d47"/>
            </svg>
            <span>FinScope</span>
          </Link>
          <div className={styles.navDivider} />
          <Link to="/projects" className={styles.backLink}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>К проектам</span>
          </Link>
        </div>
        <div className={styles.navActions}>
          <span className={styles.projectTitle}>{project?.title || 'Загрузка...'}</span>
          {isAuthenticated && <ProfileDropdown />}
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.headerRow}>
            <div>
              <h1 className={styles.title}>Фичи проекта</h1>
              <p className={styles.subtitle}>{features.length} {features.length === 1 ? 'фича' : features.length < 5 ? 'фичи' : 'фич'}</p>
            </div>
            <div className={styles.buttonGroup}>
              <button className={styles.agentButton} onClick={() => setShowAgentModal(true)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <span>Агенты</span>
              </button>
              <button className={styles.createButton} onClick={() => setShowCreateModal(true)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Новая фича</span>
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className={styles.loading}>Загрузка...</div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : (
            <div className={styles.featuresList}>
              {features.map(feature => (
                <div 
                  key={feature.id} 
                  className={styles.featureCard}
                  onClick={() => handleOpenFeature(feature.id)}
                >
                  <div className={styles.featureIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                      <path d="M2 17l10 5 10-5"/>
                      <path d="M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                  <div className={styles.featureInfo}>
                    <h3 className={styles.featureName}>{feature.name}</h3>
                    <span className={styles.featureDate}>Создана {formatDate(feature.created)}</span>
                  </div>
                  <div className={styles.featureStatus}>
                    <span className={`${styles.statusBadge} ${feature.available ? styles.active : styles.inactive}`}>
                      {feature.available ? 'Открытый чат' : 'Закрытый чат'}
                    </span>
                  </div>
                  <div className={styles.featureActions}>
                    <button
                      className={styles.newVersionButton}
                      onClick={(e) => handleCreateNewVersion(e, feature.id)}
                      disabled={creatingVersionId === feature.id}
                      title="Создать новую версию"
                    >
                      {creatingVersionId === feature.id ? (
                        <div className={styles.spinner}></div>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                    <div className={styles.featureArrow}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Модалка создания фичи */}
      {showCreateModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Создать фичу</h2>
              <button className={styles.modalClose} onClick={() => setShowCreateModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateFeature} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label htmlFor="featureName">Название фичи *</label>
                <input
                  type="text"
                  id="featureName"
                  value={newFeatureName}
                  onChange={(e) => setNewFeatureName(e.target.value)}
                  placeholder="Например: Интеграция с СБП"
                  required
                  autoFocus
                />
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowCreateModal(false)}>
                  Отмена
                </button>
                <button type="submit" className={styles.createBtn}>
                  Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Agent Modal */}
      <AgentModal
        isOpen={showAgentModal}
        onClose={() => setShowAgentModal(false)}
        projectId={parseInt(projectId)}
        onAgentSelect={handleAgentSelect}
      />
    </div>
  )
}
