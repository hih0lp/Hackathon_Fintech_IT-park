import { useState, useEffect } from 'react'
import { agents } from '../../api/client'
import styles from './AgentModal.module.css'

export default function AgentModal({ isOpen, onClose, projectId }) {
  const [agentsList, setAgentsList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingAgent, setEditingAgent] = useState(null)
  const [newAgent, setNewAgent] = useState({
    name: '',
    description: '',
    skill: '',
    project: projectId
  })

  useEffect(() => {
    if (isOpen && projectId) {
      loadAgents()
    }
  }, [isOpen, projectId])

  const loadAgents = async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await agents.list({ project: projectId, search: searchTerm })
      setAgentsList(data.results || [])
    } catch (err) {
      setError(err.message || 'Ошибка загрузки агентов')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateAgent = async (e) => {
    e.preventDefault()
    if (!newAgent.name.trim() || !newAgent.description.trim() || !newAgent.skill.trim()) {
      setError('Заполните все поля')
      return
    }

    try {
      if (editingAgent) {
        await agents.update(editingAgent.id, newAgent)
      } else {
        await agents.create(newAgent)
      }
      await loadAgents()
      setNewAgent({ name: '', description: '', skill: '', project: projectId })
      setShowCreateForm(false)
      setEditingAgent(null)
      setError('')
    } catch (err) {
      setError(err.message || (editingAgent ? 'Ошибка редактирования агента' : 'Ошибка создания агента'))
    }
  }

  const handleEditAgent = (agent) => {
    setEditingAgent(agent)
    setNewAgent({
      name: agent.name,
      description: agent.description,
      skill: agent.skill,
      project: projectId
    })
    setShowCreateForm(true)
  }

  const handleDeleteAgent = async (agentId) => {
    if (!confirm('Удалить этого агента?')) return

    try {
      await agents.delete(agentId)
      await loadAgents()
    } catch (err) {
      setError(err.message || 'Ошибка удаления агента')
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isOpen) {
        loadAgents()
      }
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Агенты проекта</h2>
          <button className={styles.modalClose} onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className={styles.searchSection}>
          <input
            type="text"
            placeholder="Поиск агентов..."
            value={searchTerm}
            onChange={handleSearch}
            className={styles.searchInput}
          />
          <button 
            className={styles.createAgentBtn}
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Создать агента
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {showCreateForm && (
          <form onSubmit={handleCreateAgent} className={styles.createForm}>
            <h3>{editingAgent ? 'Редактировать агента' : 'Новый агент'}</h3>
            <div className={styles.formGroup}>
              <label>Название *</label>
              <input
                type="text"
                value={newAgent.name}
                onChange={(e) => setNewAgent({...newAgent, name: e.target.value})}
                placeholder="Например: Финансовый аналитик"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Описание *</label>
              <textarea
                value={newAgent.description}
                onChange={(e) => setNewAgent({...newAgent, description: e.target.value})}
                placeholder="Опишите назначение агента..."
                rows={3}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Системный промпт *</label>
              <textarea
                value={newAgent.skill}
                onChange={(e) => setNewAgent({...newAgent, skill: e.target.value})}
                placeholder="Инструкции для агента..."
                rows={4}
                required
              />
            </div>
            <div className={styles.formActions}>
              <button type="button" onClick={() => setShowCreateForm(false)}>
                Отмена
              </button>
              <button type="submit">
                {editingAgent ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </form>
        )}

        <div className={styles.agentsList}>
          {isLoading ? (
            <div className={styles.loading}>Загрузка...</div>
          ) : agentsList.length === 0 ? (
            <div className={styles.empty}>
              {searchTerm ? 'Агенты не найдены' : 'У проекта пока нет агентов'}
            </div>
          ) : (
            agentsList.map(agent => (
              <div key={agent.id} className={styles.agentCard}>
                <div className={styles.agentInfo}>
                  <h4>{agent.name}</h4>
                  <p>{agent.description}</p>
                  <div className={styles.agentMeta}>
                    <span>Создан: {new Date(agent.created).toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>
                <div className={styles.agentActions}>
                  <button
                    className={styles.editBtn}
                    onClick={() => handleEditAgent(agent)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDeleteAgent(agent.id)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
