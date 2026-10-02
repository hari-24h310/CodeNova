import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Shield, Loader2, Sparkles, User, Mail, Lock } from 'lucide-react'
import { adminLogin } from '../services/api'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [name, setName] = useState('R Hariharan')
  const [email, setEmail] = useState('harihari28062006@gmail.com')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please enter administrator name, email, and password')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { admin, token } = await adminLogin(name.trim(), email.trim(), password.trim())
      sessionStorage.setItem('codenovaAdminToken', token)
      sessionStorage.setItem('codenovaAdmin', JSON.stringify(admin))
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.message || 'Invalid administrator credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="admin-login-card card-elevated animate-scale-in">
        <button className="btn-back-link" onClick={() => navigate('/')}>
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </button>

        <div className="admin-login-header">
          <div className="admin-shield-icon">
            <Shield size={32} />
          </div>
          <div className="admin-portal-badge">DEPARTMENT OF BCA • AMJC</div>
          <h1 className="admin-title">ADMIN PORTAL</h1>
          <p className="admin-desc">Sign in to manage coding tests, view analytics & department insights</p>
        </div>

        <form onSubmit={handleLogin} className="admin-form">
          <div className="input-group">
            <label htmlFor="adminName">Administrator Name</label>
            <div className="input-icon-wrapper">
              <User size={18} className="field-icon" />
              <input
                id="adminName"
                type="text"
                className="input glass-input"
                placeholder="R Hariharan"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(''); }}
                autoFocus
                disabled={loading}
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="adminEmail">Administrator Email</label>
            <div className="input-icon-wrapper">
              <Mail size={18} className="field-icon" />
              <input
                id="adminEmail"
                type="email"
                className="input glass-input"
                placeholder="harihari28062006@gmail.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                disabled={loading}
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="adminPassword">Administrator Password</label>
            <div className="input-icon-wrapper">
              <Lock size={18} className="field-icon" />
              <input
                id="adminPassword"
                type="password"
                className="input glass-input"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
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
            className="btn btn-primary btn-lg btn-full admin-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="spin-icon" />
                <span>Authenticating Admin...</span>
              </>
            ) : (
              <span>LOGIN →</span>
            )}
          </button>
        </form>
      </div>

      <style>{`
        .admin-login-card {
          max-width: 460px;
          width: 100%;
          border-radius: var(--radius-xl);
          background: rgba(15, 23, 42, 0.82);
          border: 1px solid rgba(139, 92, 246, 0.35);
          box-shadow: var(--shadow-lg), 0 0 45px rgba(139, 92, 246, 0.25);
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
          margin-bottom: 1.25rem;
          transition: color var(--transition-fast);
        }
        .btn-back-link:hover {
          color: #fff;
        }

        .admin-login-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 2rem;
          gap: 0.35rem;
        }

        .admin-shield-icon {
          width: 64px;
          height: 64px;
          border-radius: var(--radius-xl);
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(99, 102, 241, 0.3));
          border: 1px solid rgba(139, 92, 246, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c084fc;
          box-shadow: 0 0 30px rgba(139, 92, 246, 0.3);
          margin-bottom: 0.5rem;
        }

        .admin-portal-badge {
          font-size: 0.72rem;
          color: #c084fc;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .admin-title {
          font-size: 1.85rem;
          font-weight: 900;
          letter-spacing: -0.02em;
        }

        .admin-desc {
          font-size: 0.88rem;
          color: var(--text-muted);
        }

        .admin-form {
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
          padding-left: 2.85rem !important;
          background: rgba(30, 41, 59, 0.7);
        }

        .error-banner {
          background: var(--error-bg);
          border: 1px solid rgba(239, 68, 68, 0.35);
          border-radius: var(--radius-md);
          padding: 0.85rem 1rem;
          color: var(--error-light);
          font-size: 0.85rem;
        }

        .admin-submit-btn {
          margin-top: 0.5rem;
          background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
          box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
        }
        .admin-submit-btn:hover {
          box-shadow: 0 6px 28px rgba(139, 92, 246, 0.6);
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
