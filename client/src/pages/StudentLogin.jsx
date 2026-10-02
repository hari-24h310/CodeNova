import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Terminal, ArrowLeft, Search, Loader2, ShieldCheck, Sparkles, Lock } from 'lucide-react'
import { studentLogin } from '../services/api'

export default function StudentLogin() {
  const navigate = useNavigate()
  const [rollNumber, setRollNumber] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!rollNumber.trim() || !password.trim()) {
      setError('Please enter your roll number/email and password')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { student } = await studentLogin(rollNumber.trim(), password.trim())
      sessionStorage.setItem('codenovaStudent', JSON.stringify(student))
      navigate('/student/details')
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="student-login-card card-elevated animate-scale-in">
        <button
          className="btn-back-link"
          onClick={() => navigate('/')}
          aria-label="Back to home"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        {/* Header Branding */}
        <div className="login-header">
          <div className="login-logo-box">
            <Terminal size={32} />
          </div>
          <div className="platform-sub">CODE NOVA • CODING SKILL ASSESSMENT</div>
          <h1 className="verification-title">STUDENT VERIFICATION</h1>
          <p className="verification-desc">Verify your roll number to access the examination portal</p>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleLogin} className="student-form">
          <div className="input-group">
            <label htmlFor="rollNumber">Roll Number or Email</label>
            <div className="input-icon-wrapper">
              <Search size={18} className="field-icon" />
              <input
                id="rollNumber"
                type="text"
                className="input glass-input"
                placeholder="e.g. 23BCA001 or student@gmail.com"
                value={rollNumber}
                onChange={(e) => {
                  setRollNumber(e.target.value)
                  setError('')
                }}
                autoFocus
                disabled={loading}
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="studentPassword">Password</label>
            <div className="input-icon-wrapper">
              <Lock size={18} className="field-icon" />
              <input
                id="studentPassword"
                type="password"
                className="input glass-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="error-banner animate-fade-in">
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-full verify-btn"
            disabled={loading || !rollNumber.trim() || !password.trim()}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="spin-icon" />
                <span>Logging In...</span>
              </>
            ) : (
              <span>LOGIN →</span>
            )}
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-lg btn-full"
            onClick={() => navigate('/student/register')}
          >
            CREATE ACCOUNT
          </button>

          <div className="security-badge">
            <ShieldCheck size={16} />
            <span>Secure • Simple • Fast</span>
          </div>
        </form>
      </div>

      <style>{`
        .student-login-card {
          max-width: 460px;
          width: 100%;
          border-radius: var(--radius-xl);
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid var(--border-primary);
          box-shadow: var(--shadow-lg), 0 0 40px rgba(99, 102, 241, 0.25);
          animation: float 6s ease-in-out infinite alternate;
        }

        .btn-back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-family: var(--font-sans);
          font-size: 0.85rem;
          font-weight: 500;
          padding: 0;
          margin-bottom: 1.5rem;
          transition: color var(--transition-fast);
        }
        .btn-back-link:hover {
          color: #fff;
        }

        .login-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 2rem;
          gap: 0.4rem;
        }

        .login-logo-box {
          width: 64px;
          height: 64px;
          border-radius: var(--radius-xl);
          background: var(--gradient-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          box-shadow: var(--shadow-glow);
          margin-bottom: 0.5rem;
        }

        .platform-sub {
          font-size: 0.72rem;
          color: var(--text-accent);
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-weight: 700;
        }

        .verification-title {
          font-size: 1.85rem;
          font-weight: 900;
          letter-spacing: -0.02em;
        }

        .verification-desc {
          font-size: 0.88rem;
          color: var(--text-muted);
        }

        .student-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .input-icon-wrapper {
          position: relative;
        }

        .field-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }

        .glass-input {
          padding-left: 3rem !important;
          font-family: var(--font-mono);
          letter-spacing: 0.05em;
          font-weight: 600;
          font-size: 1.05rem;
          background: rgba(30, 41, 59, 0.7);
        }

        .input-hint {
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        .error-banner {
          background: var(--error-bg);
          border: 1px solid rgba(239, 68, 68, 0.35);
          border-radius: var(--radius-md);
          padding: 0.85rem 1rem;
          color: var(--error-light);
          font-size: 0.85rem;
          font-weight: 500;
        }

        .verify-btn {
          margin-top: 0.25rem;
          font-size: 1rem;
          letter-spacing: 0.06em;
        }

        .demo-chips {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.75rem;
        }
        .demo-label {
          color: var(--text-muted);
        }
        .chip-btn {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          border-radius: var(--radius-full);
          padding: 0.2rem 0.65rem;
          font-family: var(--font-mono);
          font-size: 0.72rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .chip-btn:hover {
          border-color: var(--accent-primary);
          color: #fff;
          background: var(--accent-glow);
        }

        .security-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          color: var(--text-muted);
          font-size: 0.8rem;
          font-weight: 500;
          margin-top: 0.5rem;
        }

        .spin-icon {
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
