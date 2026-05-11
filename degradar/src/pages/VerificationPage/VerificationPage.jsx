import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styles from './VerificationPage.module.css'

export default function VerificationPage() {
  const navigate = useNavigate()
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(60)
  const inputs = useRef([])

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleChange = (index, value) => {
    if (value.length > 1) return
    if (!/^[0-9]*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    setError('')

    // Auto-focus next input
    if (value && index < 5) {
      inputs.current[index + 1]?.focus()
    }

    // Auto-submit when complete
    if (index === 5 && value) {
      const fullCode = [...newCode.slice(0, 5), value].join('')
      if (fullCode.length === 6) {
        handleVerify(fullCode)
      }
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  const handleVerify = (fullCode) => {
    // Simulate verification - replace with actual API call
    console.log('Verifying code:', fullCode)
    
    // Demo: accept any 6-digit code
    if (fullCode === '123456' || fullCode.length === 6) {
      navigate('/projects')
    } else {
      setError('Неверный код подтверждения. Попробуйте снова.')
      setCode(['', '', '', '', '', ''])
      inputs.current[0]?.focus()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const fullCode = code.join('')
    if (fullCode.length !== 6) {
      setError('Введите все 6 цифр')
      return
    }
    handleVerify(fullCode)
  }

  const handleResend = () => {
    setResendTimer(60)
    setError('')
    console.log('Resending verification code...')
    // Simulate API call to resend code
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
          <div className={styles.icon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3 7l9 6 9-6" />
              <path d="M12 15v4M8 19h8" />
            </svg>
          </div>

          <h1 className={styles.title}>Подтвердите email</h1>
          <p className={styles.subtitle}>
            Мы отправили код подтверждения на ваш email.<br />
            Введите 6-значный код ниже.
          </p>

          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.codeInputs}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputs.current[index] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={styles.codeInput}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <button type="submit" className={styles.submit}>
              Подтвердить
            </button>
          </form>

          <div className={styles.resend}>
            {resendTimer > 0 ? (
              <span className={styles.resendText}>
                Отправить код повторно через <strong>{resendTimer}с</strong>
              </span>
            ) : (
              <button onClick={handleResend} className={styles.resendBtn}>
                Отправить код повторно
              </button>
            )}
          </div>

          <p className={styles.footer}>
            Неверный email?{' '}
            <Link to="/register" className={styles.link}>Назад</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
