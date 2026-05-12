import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { projects } from '../../api/client'
import styles from './ProjectSelector.module.css'

const projectColors = ['#224d47', '#7c3aed', '#059669', '#dc2626', '#0284c7', '#ea580c', '#db2777', '#65a30d']

const getProjectColor = (id) => projectColors[(id - 1) % projectColors.length]

const getInitials = (name) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

export default function ProjectSelector({ currentProject, onProjectChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const [projectsList, setProjectsList] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function loadProjects() {
    setIsLoading(true)
    try {
      const response = await projects.list()
      setProjectsList(response.results || [])
    } catch (err) {
      console.error('Failed to load projects:', err)
      setProjectsList([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const handleSelectProject = (project) => {
    console.log('Project selected in ProjectSelector:', project)
    setIsOpen(false)
    const url = `/radar?project=${project.id}`
    console.log('Navigating to:', url)
    navigate(url)
  }

  const handleManageProjects = () => {
    setIsOpen(false)
    navigate('/projects')
  }

  const displayProject = currentProject || (projectsList.length > 0 ? {
    id: projectsList[0].id,
    name: projectsList[0].title,
    initials: getInitials(projectsList[0].title),
    color: getProjectColor(projectsList[0].id)
  } : {
    name: 'Выберите проект',
    initials: '??',
    color: '#999'
  })

  console.log('ProjectSelector - currentProject:', currentProject)
  console.log('ProjectSelector - projectsList:', projectsList)
  console.log('ProjectSelector - displayProject:', displayProject)

  return (
    <div className={styles.projectSelector} ref={dropdownRef}>
      <button className={styles.selectorButton} onClick={handleToggleDropdown}>
        <div className={styles.projectBadge} style={{ background: displayProject.color + '22', borderColor: displayProject.color + '44' }}>
          <span style={{ color: displayProject.color }}>{displayProject.initials}</span>
        </div>
        <span className={styles.projectLabel}>PROJECT</span>
        <span className={styles.projectName}>{displayProject.name}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>
          <path d="M2 4L5 7L8 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu}>
          <div className={styles.dropdownHeader}>
            <span className={styles.dropdownTitle}>Выберите проект</span>
            <button className={styles.manageButton} onClick={handleManageProjects}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Управлять
            </button>
          </div>

          <div className={styles.projectsList}>
            {isLoading ? (
              <div className={styles.loading}>Загрузка проектов...</div>
            ) : projectsList.length === 0 ? (
              <div className={styles.emptyState}>
                <span>Нет проектов</span>
                <button className={styles.createButton} onClick={handleManageProjects}>
                  Создать проект
                </button>
              </div>
            ) : (
              projectsList.map(project => {
                const color = getProjectColor(project.id)
                const isSelected = currentProject && currentProject.id === project.id
                
                return (
                  <button
                    key={project.id}
                    className={`${styles.projectOption} ${isSelected ? styles.selected : ''}`}
                    onClick={() => handleSelectProject({
                      id: project.id,
                      name: project.title,
                      initials: getInitials(project.title),
                      color: color
                    })}
                  >
                    <div className={styles.optionBadge} style={{ background: color + '22', borderColor: color + '44' }}>
                      <span style={{ color: color }}>{getInitials(project.title)}</span>
                    </div>
                    <div className={styles.optionContent}>
                      <div className={styles.optionName}>{project.title}</div>
                      <div className={styles.optionDescription}>{project.description}</div>
                    </div>
                    {isSelected && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
