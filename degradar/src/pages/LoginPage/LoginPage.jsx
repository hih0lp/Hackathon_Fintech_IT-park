import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../../api/client'
import { useAuth } from '../../context/AuthContext.jsx'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      setError('Заполните все поля')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await auth.login(formData.email, formData.password)
      // API returns tokens and user data on successful login
      if (response.access && response.refresh) {
        login(response.access, response.refresh)
        navigate('/projects')
      } else {
        setError('Неверный ответ от сервера')
      }
    } catch (err) {
      setError(err.message || 'Неверный email или пароль')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <Link to="/" className={styles.logo}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#224d47" strokeWidth="1.5"/>
              <circle cx="12" cy="12" r="5" stroke="#224d47" strokeWidth="1.5" strokeDasharray="2 2"/>
              <circle cx="12" cy="12" r="1.5" fill="#224d47"/>
            </svg>
            <span>REGRADAR</span>
          </Link>
          {isAuthenticated && (
            <Link to="/projects" className={styles.projectsLink}>Проекты</Link>
          )}
        </div>

        <div className={styles.card}>
          <h1 className={styles.title}>Вход</h1>
          <p className={styles.subtitle}>Добро пожаловать в REGRADAR</p>

          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ваш@email.com"
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password" className={styles.label}>Пароль</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Введите пароль"
                className={styles.input}
              />
            </div>

            <div className={styles.options}>
              <label className={styles.remember}>
                <input type="checkbox" className={styles.checkbox} />
                <span>Запомнить меня</span>
              </label>
              <Link to="/forgot-password" className={styles.forgot}>Забыли пароль?</Link>
            </div>

            <button type="submit" className={styles.submit} disabled={isLoading}>
              {isLoading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <p className={styles.footer}>
            Нет аккаунта?{' '}
            <Link to="/register" className={styles.link}>Зарегистрироваться</Link>
          </p>
        </div>

        <p className={styles.terms}>
          Входя в аккаунт, вы соглашаетесь с{' '}
          <Link to="/terms">Условиями использования</Link> и{' '}
          <Link to="/privacy">Политикой конфиденциальности</Link>
        </p>
      </div>
    </div>
  )
}
