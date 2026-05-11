import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { projects } from '../../api/client'
import { useAuth } from '../../context/AuthContext.jsx'
import styles from './ProjectsPage.module.css'

const availableCountries = [
  { code: 'RU', name: 'Россия', flag: '🇷🇺' },
  { code: 'KZ', name: 'Казахстан', flag: '🇰🇿' },
  { code: 'BY', name: 'Беларусь', flag: '🇧🇾' },
  { code: 'UA', name: 'Украина', flag: '🇺🇦' },
  { code: 'UZ', name: 'Узбекистан', flag: '🇺🇿' },
  { code: 'KG', name: 'Киргизия', flag: '🇰🇬' },
  { code: 'TJ', name: 'Таджикистан', flag: '🇹🇯' },
  { code: 'AM', name: 'Армения', flag: '🇦🇲' },
  { code: 'GE', name: 'Грузия', flag: '🇬🇪' },
  { code: 'AZ', name: 'Азербайджан', flag: '🇦🇿' },
  { code: 'MD', name: 'Молдова', flag: '🇲🇩' },
  { code: 'TM', name: 'Туркменистан', flag: '🇹🇲' },
  { code: 'RS', name: 'Сербия', flag: '🇷🇸' },
  { code: 'TR', name: 'Турция', flag: '🇹🇷' },
  { code: 'CN', name: 'Китай', flag: '🇨🇳' },
  { code: 'IN', name: 'Индия', flag: '🇮🇳' },
  { code: 'BR', name: 'Бразилия', flag: '🇧🇷' },
  { code: 'AE', name: 'ОАЭ', flag: '🇦🇪' },
  { code: 'EG', name: 'Египет', flag: '🇪🇬' },
  { code: 'VN', name: 'Вьетнам', flag: '🇻🇳' },
]

const projectColors = ['#224d47', '#7c3aed', '#059669', '#dc2626', '#0284c7', '#ea580c', '#db2777', '#65a30d']

const getProjectColor = (id) => projectColors[(id - 1) % projectColors.length]

const getInitials = (name) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

export default function ProjectsPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [projectsList, setProjectsList] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeMenu, setActiveMenu] = useState(null)
  const [activeFiles, setActiveFiles] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState(null)
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    countries: [],
    files: [],
  })
  const [selectedCountry, setSelectedCountry] = useState('')
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const countryDropdownRef = useRef(null)
  const menuRef = useRef(null)
  const filesRef = useRef(null)
  const modalRef = useRef(null)

  // Load projects on mount
  useEffect(() => {
    loadProjects()
  }, [])

  async function loadProjects() {
    setIsLoading(true)
    try {
      const response = await projects.list()
      setProjectsList(response.results || [])
    } catch (err) {
      setError(err.message || 'Ошибка загрузки проектов')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenu(null)
      }
      if (filesRef.current && !filesRef.current.contains(e.target)) {
        setActiveFiles(null)
      }
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target)) {
        setShowCountryDropdown(false)
      }
      if (modalRef.current && !modalRef.current.contains(e.target) && showCreateModal) {
        setShowCreateModal(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showCreateModal])

  const handleCreateProject = () => {
    setShowCreateModal(true)
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
    setEditingProjectId(null)
    setNewProject({
      title: '',
      description: '',
      countries: [],
      files: [],
    })
    setSelectedCountry('')
    setShowCountryDropdown(false)
  }

  const handleSubmitProject = async (e) => {
    e.preventDefault()
    if (!newProject.title.trim()) return

    try {
      const formData = new FormData()
      formData.append('title', newProject.title)
      formData.append('description', newProject.description || '')
      formData.append('country', newProject.countries.join(', '))

      newProject.files.forEach(fileObj => {
        if (fileObj.file) {
          formData.append('uploaded_files', fileObj.file)
        }
      })

      if (editingProjectId) {
        await projects.partialUpdate(editingProjectId, {
          title: newProject.title,
          description: newProject.description,
          country: newProject.countries.join(', ')
        })
      } else {
        await projects.create(formData)
      }
      await loadProjects()
      handleCloseModal()
    } catch (err) {
      setError(err.message || (editingProjectId ? 'Ошибка редактирования проекта' : 'Ошибка создания проекта'))
    }
  }

  const addCountry = (countryName) => {
    if (!newProject.countries.includes(countryName)) {
      setNewProject(prev => ({ ...prev, countries: [...prev.countries, countryName] }))
    }
    setSelectedCountry('')
    setShowCountryDropdown(false)
  }

  const removeCountry = (countryName) => {
    setNewProject(prev => ({ ...prev, countries: prev.countries.filter(c => c !== countryName) }))
  }

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files)
    const newFiles = files.map(file => ({
      name: file.name,
      file: file,
      url: URL.createObjectURL(file)
    }))
    setNewProject(prev => ({ ...prev, files: [...prev.files, ...newFiles] }))
  }

  const removeFile = (fileName) => {
    setNewProject(prev => ({ ...prev, files: prev.files.filter(f => f.name !== fileName) }))
  }

  const handleOpenProject = (projectId) => {
    navigate(`/projects/${projectId}`)
  }

  const handleEdit = (e, projectId) => {
    e.stopPropagation()
    setActiveMenu(null)
    const project = projectsList.find(p => p.id === projectId)
    if (project) {
      setEditingProjectId(projectId)
      setNewProject({
        title: project.title,
        description: project.description || '',
        countries: project.country ? project.country.split(', ').map(c => c.trim()) : [],
        files: [],
      })
      setShowCreateModal(true)
    }
  }

  const handleDuplicate = (e, projectId) => {
    e.stopPropagation()
    setActiveMenu(null)
    console.log('Дублирование проекта:', projectId)
  }

  const handleArchive = (e, projectId) => {
    e.stopPropagation()
    setActiveMenu(null)
    console.log('Архивирование проекта:', projectId)
  }

  const handleDelete = async (e, projectId) => {
    e.stopPropagation()
    setActiveMenu(null)
    if (!confirm('Удалить проект?')) return
    try {
      await projects.delete(projectId)
      await loadProjects()
    } catch (err) {
      setError(err.message || 'Ошибка удаления проекта')
    }
  }

  const toggleMenu = (e, projectId) => {
    e.stopPropagation()
    setActiveMenu(activeMenu === projectId ? null : projectId)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className={styles.page}>
      <header className={styles.nav}>
        <Link to="/" className={styles.logo}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#224d47" strokeWidth="1.5"/>
            <circle cx="12" cy="12" r="5" stroke="#224d47" strokeWidth="1.5" strokeDasharray="2 2"/>
            <circle cx="12" cy="12" r="1.5" fill="#224d47"/>
          </svg>
          <span>REGRADAR</span>
        </Link>
        <div className={styles.navActions}>
          <Link to="/profile" className={styles.navLink}>Профиль</Link>
          <button className={styles.navLogout} onClick={handleLogout}>Выйти</button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.headerRow}>
            <h1 className={styles.title}>Проекты</h1>
            <span className={styles.subtitle}>{projectsList.length} проектов</span>
          </div>

          <button className={styles.createCard} onClick={handleCreateProject}>
            <div className={styles.createIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className={styles.createText}>
              <span className={styles.createTitle}>Создать новый проект</span>
              <span className={styles.createSubtitle}>Начните анализ нового продукта или фичи</span>
            </div>
            <div className={styles.createArrow}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </button>

          {isLoading ? (
            <div className={styles.loading}>Загрузка проектов...</div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : (
          <div className={styles.projectsGrid}>
            {projectsList.map(project => {
              const color = getProjectColor(project.id)
              
              return (
                <div 
                  key={project.id} 
                  className={styles.projectCard}
                  onClick={() => handleOpenProject(project.id)}
                >
                  <div className={styles.cardTop} style={{ background: color + '22' }}>
                    <div className={styles.avatar} style={{ background: color }}>
                      {getInitials(project.title)}
                    </div>
                    
                    <div className={styles.menuContainer} ref={activeMenu === project.id ? menuRef : null}>
                      <button 
                        className={styles.menuButton}
                        onClick={(e) => toggleMenu(e, project.id)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="12" cy="6" r="2"/>
                          <circle cx="12" cy="12" r="2"/>
                          <circle cx="12" cy="18" r="2"/>
                        </svg>
                      </button>
                      
                      {activeMenu === project.id && (
                        <div className={styles.menuDropdown}>
                          <button onClick={(e) => handleEdit(e, project.id)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                            Редактировать
                          </button>
                          <button onClick={(e) => handleDuplicate(e, project.id)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                            </svg>
                            Дублировать
                          </button>
                          <button onClick={(e) => handleArchive(e, project.id)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <polyline points="21 8 21 21 3 21 3 8"/>
                              <rect x="1" y="3" width="22" height="5"/>
                              <line x1="10" y1="12" x2="14" y2="12"/>
                            </svg>
                            {project.status === 'active' ? 'В архив' : 'Активировать'}
                          </button>
                          <div className={styles.menuDivider} />
                          <button className={styles.menuDelete} onClick={(e) => handleDelete(e, project.id)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                            </svg>
                            Удалить
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.cardContent}>
                    <div className={styles.cardHeader}>
                      <h3 className={styles.projectName}>{project.title}</h3>
                      <span className={`${styles.status} ${styles.active}`}>
                        Активный
                      </span>
                    </div>
                    
                    <p className={styles.projectDesc}>{project.description}</p>

                    <div className={styles.statsRow}>
                      <div className={styles.stat}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                        </svg>
                        <span>{(project.files || []).length} {(project.files || []).length === 1 ? 'файл' : (project.files || []).length < 5 ? 'файла' : 'файлов'}</span>
                      </div>
                      <div className={styles.stat}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M2 12h20"/>
                          <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
                        </svg>
                        <span>{project.country ? project.country.split(', ').length : 0} {project.country && project.country.split(', ').length === 1 ? 'страна' : 'стран'}</span>
                      </div>
                    </div>

                    <div className={styles.countriesRow}>
                      {(project.country ? project.country.split(', ').map(c => c.trim()) : []).map(countryName => {
                        const countryData = availableCountries.find(c => c.name === countryName)
                        return (
                          <span key={countryName} className={styles.countryTag}>
                            <span className={styles.countryTagFlag}>{countryData?.flag}</span>
                            {countryName}
                          </span>
                        )
                      })}
                    </div>

                    <div className={styles.filesSection} ref={activeFiles === project.id ? filesRef : null}>
                      <button 
                        className={styles.filesDropdownButton}
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveFiles(activeFiles === project.id ? null : project.id)
                        }}
                      >
                        <div className={styles.filesButtonLeft}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                          <span>Файлы ({(project.files || []).length})</span>
                        </div>
                        <svg 
                          width="14" 
                          height="14" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="1.5"
                          className={`${styles.filesChevron} ${activeFiles === project.id ? styles.chevronOpen : ''}`}
                        >
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </button>
                      
                      {activeFiles === project.id && (
                        <div className={styles.filesDropdown}>
                          {(project.files || []).map(file => {
                            const fileName = file.file ? file.file.split('/').pop() : 'файл'
                            return (
                              <a 
                                key={file.id} 
                                href={file.file} 
                                className={styles.fileLink}
                                onClick={(e) => e.stopPropagation()}
                                download
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                                  <polyline points="7 10 12 15 17 10"/>
                                  <line x1="12" y1="15" x2="12" y2="3"/>
                                </svg>
                                {fileName}
                              </a>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          )}
        </div>
      </main>

      {/* Модальное окно создания проекта */}
      {showCreateModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} ref={modalRef}>
            <div className={styles.modalHeader}>
              <h2>{editingProjectId ? 'Редактировать проект' : 'Создать новый проект'}</h2>
              <button className={styles.modalClose} onClick={handleCloseModal}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmitProject} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label htmlFor="projectName">Название проекта *</label>
                <input
                  type="text"
                  id="projectName"
                  value={newProject.title}
                  onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Например: Digital Banking App"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="projectDescription">Описание</label>
                <textarea
                  id="projectDescription"
                  value={newProject.description}
                  onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Краткое описание проекта"
                  rows={3}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Страны</label>
                <div className={styles.selectedCountries}>
                  {newProject.countries.map(countryName => {
                    const countryData = availableCountries.find(c => c.name === countryName)
                    return (
                      <span key={countryName} className={styles.countryChip}>
                        <span className={styles.countryFlag}>{countryData?.flag}</span>
                        {countryName}
                        <button type="button" onClick={() => removeCountry(countryName)}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </span>
                    )
                  })}
                </div>
                <div className={styles.countryDropdownContainer} ref={countryDropdownRef}>
                  <button
                    type="button"
                    className={styles.countryDropdownButton}
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  >
                    <span>Выбрать страны</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                  {showCountryDropdown && (
                    <div className={styles.countryDropdown}>
                      {availableCountries
                        .filter(c => !newProject.countries.includes(c.name))
                        .map(country => (
                          <button
                            key={country.code}
                            type="button"
                            className={styles.countryOption}
                            onClick={() => addCountry(country.name)}
                          >
                            <span className={styles.countryOptionFlag}>{country.flag}</span>
                            <span>{country.name}</span>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Файлы</label>
                <div className={styles.uploadSection}>
                  {newProject.files.length > 0 && (
                    <div className={styles.uploadedFiles}>
                      {newProject.files.map(file => (
                        <span key={file.name} className={styles.uploadedFileTag}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                          {file.name}
                          <button type="button" onClick={() => removeFile(file.name)}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18"/>
                              <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <label className={styles.uploadButton}>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <span>Загрузить файлы</span>
                  </label>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={handleCloseModal}>
                  Отмена
                </button>
                <button type="submit" className={styles.createBtn}>
                  {editingProjectId ? 'Сохранить изменения' : 'Создать проект'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
