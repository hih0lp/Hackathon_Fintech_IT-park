import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      return
    }
    // Simulate login - replace with actual API call
    console.log('Login attempt:', formData)
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
          <h1 className={styles.title}>Sign In</h1>
          <p className={styles.subtitle}>Welcome back to compliance intelligence</p>

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
                placeholder="your@email.com"
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={styles.input}
              />
            </div>

            <div className={styles.options}>
              <label className={styles.remember}>
                <input type="checkbox" className={styles.checkbox} />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className={styles.forgot}>Forgot password?</Link>
            </div>

            <button type="submit" className={styles.submit}>
              Sign In
            </button>
          </form>

          <p className={styles.footer}>
            Don't have an account?{' '}
            <Link to="/register" className={styles.link}>Sign up</Link>
          </p>
        </div>

        <p className={styles.terms}>
          By signing in, you agree to our{' '}
          <Link to="/terms">Terms of Service</Link> and{' '}
          <Link to="/privacy">Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}
