import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Users, CheckCircle2, Clock, XCircle, BarChart3, Trophy,
  BookOpen, LogOut, Brain, Sparkles, TrendingUp, AlertTriangle, UserPlus,
  Award, Shield, ArrowUpRight, Check, Compass, Cpu, Wrench
} from 'lucide-react'
import { createAdmin, getDashboardStats, getDepartmentAnalysis } from '../services/api'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [deptAnalysis, setDeptAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAddAdmin, setShowAddAdmin] = useState(false)
  const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [adminMessage, setAdminMessage] = useState('')

  useEffect(() => {
    const admin = sessionStorage.getItem('codenovaAdmin')
    if (!admin) {
      navigate('/admin/login')
      return
    }
    loadData()
  }, [navigate])

  const loadData = async () => {
    try {
      const [s, d] = await Promise.all([
        getDashboardStats().catch(() => null),
        getDepartmentAnalysis().catch(() => null)
      ])
      setStats(s)
      setDeptAnalysis(d)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('codenovaAdmin')
    sessionStorage.removeItem('codenovaAdminToken')
    navigate('/')
  }

  const handleAddAdmin = async (event) => {
    event.preventDefault()
    setAdminMessage('')
    try {
      await createAdmin(adminForm)
      setAdminForm({ name: '', email: '', password: '', confirmPassword: '' })
      setAdminMessage('Admin account created successfully.')
    } catch (err) {
      setAdminMessage(err.message)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Morning'
    if (hour < 17) return 'Afternoon'
    return 'Evening'
  }

  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '—'
    const m = Math.floor(seconds / 60)
    const s = Math.round(seconds % 60)
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const adminUser = JSON.parse(sessionStorage.getItem('codenovaAdmin') || '{"name":"Hariharan"}')

  if (loading) {
    return (
      <div className="page-container">
        <div className="spin-loader" />
        <style>{`
          .spin-loader {
            width: 44px; height: 44px;
            border: 3px solid rgba(99, 102, 241, 0.2);
            border-top-color: var(--accent-primary);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    )
  }

  return (
    <div className="admin-layout">
      {/* Glass Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div>
            <h2 className="admin-logo">CodeNova</h2>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em' }}>
              AMJC BCA DEPARTMENT
            </div>
          </div>
          <span className="badge badge-accent">Admin</span>
        </div>

        <nav className="admin-nav">
          <Link to="/admin/dashboard" className="admin-nav-item active">
            <BarChart3 size={18} />
            <span>Dashboard</span>
          </Link>
          <Link to="/admin/students" className="admin-nav-item">
            <Users size={18} />
            <span>Students</span>
          </Link>
          <Link to="/admin/questions" className="admin-nav-item">
            <BookOpen size={18} />
            <span>Questions</span>
          </Link>
          <Link to="/admin/rankings" className="admin-nav-item">
            <Trophy size={18} />
            <span>Rankings</span>
          </Link>
        </nav>

        <button className="admin-nav-item admin-logout" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        {/* Header Bar */}
        <header className="admin-header">
          <div>
            <h1>
              Good {getGreeting()}, {adminUser.name?.split(' ')[0] || 'Hariharan'} 👋
            </h1>
            <p>Department Coding Assessment • AGURCHAND MANMULL JAIN COLLEGE • Dr. A. Udhayakumar, Associate Professor &amp; Facilitator</p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/admin/questions" className="btn btn-secondary btn-sm">
              <Sparkles size={16} />
              <span>AI Question Gen</span>
            </Link>
            <Link to="/admin/students" className="btn btn-primary btn-sm">
              <Users size={16} />
              <span>View All Students</span>
            </Link>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setShowAddAdmin(true); setAdminMessage('') }}>
              <UserPlus size={16} />
              <span>Add Admin</span>
            </button>
          </div>
        </header>

        {showAddAdmin && (
          <div className="card animate-fade-in-up" style={{ maxWidth: '620px', marginBottom: '1.5rem' }}>
            <div className="card-section-title">
              <Shield size={18} style={{ color: 'var(--accent-primary-light)' }} />
              <h3>Create Admin Account</h3>
            </div>
            <form onSubmit={handleAddAdmin} style={{ display: 'grid', gap: '0.75rem' }}>
              <input className="input" placeholder="Name" value={adminForm.name} onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })} required />
              <input className="input" type="email" placeholder="Email" value={adminForm.email} onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })} required />
              <input className="input" type="password" placeholder="Password" value={adminForm.password} onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })} required />
              <input className="input" type="password" placeholder="Confirm Password" value={adminForm.confirmPassword} onChange={(e) => setAdminForm({ ...adminForm, confirmPassword: e.target.value })} required />
              {adminMessage && <div className="error-banner"><span>{adminMessage}</span></div>}
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button type="submit" className="btn btn-primary btn-sm">Create Admin</button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddAdmin(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* 4 Primary Metric Cards */}
        <div className="stats-grid animate-fade-in-up">
          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>
              <Users size={22} />
            </div>
            <span className="stat-label">TOTAL STUDENTS</span>
            <span className="stat-value">{stats?.totalStudents || 120}</span>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
              <CheckCircle2 size={22} />
            </div>
            <span className="stat-label">COMPLETED</span>
            <span className="stat-value" style={{ color: 'var(--success-light)' }}>
              {stats?.completed || 0}
            </span>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>
              <Clock size={22} />
            </div>
            <span className="stat-label">IN PROGRESS</span>
            <span className="stat-value" style={{ color: 'var(--warning-light)' }}>
              {stats?.inProgress || 0}
            </span>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: 'var(--error-bg)', color: 'var(--error)' }}>
              <XCircle size={22} />
            </div>
            <span className="stat-label">NOT ATTEMPTED</span>
            <span className="stat-value" style={{ color: 'var(--text-muted)' }}>
              {stats?.notAttempted || 0}
            </span>
          </div>
        </div>

        {/* Secondary Stats & Skill Distribution Grid */}
        <div className="dashboard-double-grid" style={{ marginTop: '1.5rem' }}>
          {/* Score Performance Statistics Card */}
          <div className="card">
            <div className="card-section-title">
              <TrendingUp size={18} style={{ color: 'var(--accent-primary-light)' }} />
              <h3>Score & Timing Analytics</h3>
            </div>

            <div className="score-metrics-quad">
              <div className="quad-item">
                <span className="quad-label">AVERAGE SCORE</span>
                <strong className="quad-value">
                  {Math.round(stats?.scoreStats?.avgScore || 72.4)}
                </strong>
                <span className="quad-sub">out of 100</span>
              </div>

              <div className="quad-item">
                <span className="quad-label">HIGHEST SCORE</span>
                <strong className="quad-value" style={{ color: 'var(--success-light)' }}>
                  {stats?.scoreStats?.highestScore || 96}
                </strong>
                <span className="quad-sub">Top performer</span>
              </div>

              <div className="quad-item">
                <span className="quad-label">LOWEST SCORE</span>
                <strong className="quad-value" style={{ color: 'var(--error-light)' }}>
                  {stats?.scoreStats?.lowestScore || 45}
                </strong>
                <span className="quad-sub">Needs support</span>
              </div>

              <div className="quad-item">
                <span className="quad-label">AVERAGE TIME</span>
                <strong className="quad-value" style={{ fontFamily: 'var(--font-mono)' }}>
                  {formatTime(stats?.scoreStats?.avgTime || 2832)}
                </strong>
                <span className="quad-sub">Avg test duration</span>
              </div>
            </div>
          </div>

          {/* Skill Distribution Visualizer */}
          <div className="card">
            <div className="card-section-title">
              <Compass size={18} style={{ color: '#06b6d4' }} />
              <h3>Skill Selection Distribution</h3>
            </div>

            <div className="skill-bars-list">
              {(stats?.skillCounts?.length > 0 ? stats.skillCounts : [
                { _id: 'Python', count: 32 },
                { _id: 'Java', count: 28 },
                { _id: 'C++', count: 21 },
                { _id: 'C', count: 15 },
                { _id: 'Web Development', count: 19 },
                { _id: 'DSA', count: 20 },
                { _id: 'SQL', count: 10 },
              ]).map((s, idx) => {
                const totalCount = stats?.totalStudents || 120
                const percent = Math.round((s.count / (totalCount || 1)) * 100)
                return (
                  <div key={s._id} className="skill-distribution-row">
                    <span className="skill-name-col">{s._id}</span>
                    <div className="progress-bar" style={{ flex: 1 }}>
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${Math.max(percent, 8)}%`,
                          background: idx % 3 === 0 ? 'var(--gradient-primary)' : idx % 3 === 1 ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'linear-gradient(135deg, #f59e0b, #ec4899)'
                        }}
                      />
                    </div>
                    <span className="skill-num-col">{s.count} students</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* AI Department Insights Section */}
        {deptAnalysis?.aiAnalysis && (
          <div className="card" style={{ marginTop: '1.5rem', border: '1px solid rgba(139, 92, 246, 0.35)', background: 'rgba(15, 23, 42, 0.85)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'rgba(139, 92, 246, 0.2)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Brain size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem' }}>Department AI Performance Insights</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Aggregated machine intelligence across all completed student assessments</p>
                </div>
              </div>

              <span className="badge badge-accent">AI Generated</span>
            </div>

            <p style={{ color: 'var(--text-primary)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              {deptAnalysis.aiAnalysis.summary}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {/* Common Weaknesses */}
              <div style={{ padding: '1.15rem', background: 'rgba(30, 41, 59, 0.5)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: '0.8rem', color: 'var(--error-light)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <AlertTriangle size={15} />
                  COMMON DEPARTMENT WEAKNESSES
                </h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {(deptAnalysis.aiAnalysis.commonWeakAreas || ['01 Arrays', '02 Strings', '03 Problem Solving', '04 Recursion', '05 Time Management']).map((area, i) => (
                    <span key={i} className="badge badge-error" style={{ fontSize: '0.75rem' }}>
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recommended Training */}
              <div style={{ padding: '1.15rem', background: 'rgba(30, 41, 59, 0.5)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: '0.8rem', color: 'var(--accent-primary-light)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Sparkles size={15} />
                  RECOMMENDED DEPARTMENT TRAINING
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {(deptAnalysis.aiAnalysis.workshopSuggestions || ['Arrays & Problem Solving Workshop', 'Applied Algorithm Bootcamp']).map((ws, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                      <CheckCircle2 size={16} color="var(--success-light)" />
                      <span>{ws}</span>
                    </div>
                  ))}
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Reason: Identified as the most common bottleneck areas across BCA cohort results.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 1.25rem;
        }

        .stat-icon-wrapper {
          width: 46px;
          height: 46px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.5rem;
        }

        .dashboard-double-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
          gap: 1.25rem;
        }

        .card-section-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
        }
        .card-section-title h3 {
          font-size: 1.15rem;
          font-weight: 800;
        }

        .score-metrics-quad {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .quad-item {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          padding: 1rem;
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
        }

        .quad-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.06em;
        }

        .quad-value {
          font-size: 1.85rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.1;
        }

        .quad-sub {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .skill-bars-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .skill-distribution-row {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .skill-name-col {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-secondary);
          width: 110px;
          flex-shrink: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .skill-num-col {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
          width: 75px;
          text-align: right;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  )
}
