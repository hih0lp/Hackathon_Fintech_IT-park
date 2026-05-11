import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styles from './RegisterPage.module.css'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.password) {
      setError('Заполните все обязательные поля')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают')
      return
    }
    if (formData.password.length < 8) {
      setError('Пароль должен быть не менее 8 символов')
      return
    }
    // Simulate registration - replace with actual API call
    console.log('Registration:', formData)
    navigate('/verify')
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
        </div>

        <div className={styles.card}>
          <h1 className={styles.title}>Создать аккаунт</h1>
          <p className={styles.subtitle}>Начните путь к соответствию регуляторным требованиям</p>

          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="name" className={styles.label}>ФИО</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Иван Иванов"
                className={styles.input}
              />
            </div>

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
                placeholder="Придумайте пароль"
                className={styles.input}
              />
              <span className={styles.hint}>Минимум 8 символов</span>
            </div>

            <div className={styles.field}>
              <label htmlFor="confirmPassword" className={styles.label}>Подтвердите пароль</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Повторите пароль"
                className={styles.input}
              />
            </div>

            <label className={styles.termsCheck}>
              <input type="checkbox" className={styles.checkbox} required />
              <span>Я согласен с <Link to="/terms" className={styles.link}>Условиями использования</Link> и{' '}
                <Link to="/privacy" className={styles.link}>Политикой конфиденциальности</Link></span>
            </label>

            <button type="submit" className={styles.submit}>
              Создать аккаунт
            </button>
          </form>

          <p className={styles.footer}>
            Уже есть аккаунт?{' '}
            <Link to="/login" className={styles.link}>Войти</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
