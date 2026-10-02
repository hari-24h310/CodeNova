import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Users, BarChart3, Trophy, BookOpen, LogOut, Medal,
  Clock, Eye, Download, Search, Sparkles, Filter, Award
} from 'lucide-react'
import { getRankings } from '../services/api'

const SKILLS = ['Python', 'Java', 'C++', 'C', 'JavaScript', 'Web Development', 'DSA', 'SQL', 'PHP', 'C#']

export default function Rankings() {
  const navigate = useNavigate()
  const [rankings, setRankings] = useState([])
  const [filterSkill, setFilterSkill] = useState('')
  const [filterYear, setFilterYear] = useState('')
  const [filterSection, setFilterSection] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionStorage.getItem('codenovaAdmin')) {
      navigate('/admin/login')
      return
    }
    loadRankings()
  }, [filterSkill, filterYear, filterSection])

  const loadRankings = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterSkill) params.set('skill', filterSkill)
      if (filterYear) params.set('year', filterYear)
      if (filterSection) params.set('section', filterSection)

      const data = await getRankings(params.toString())
      setRankings(data.rankings || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (s) => s ? `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s` : '—'

  // Export Rankings to CSV
  const handleExportRankings = () => {
    if (!rankings.length) {
      alert('No ranking data to export.')
      return
    }

    const rows = [
      ['Rank', 'Name', 'Roll Number', 'Department', 'Year', 'Section', 'Skill', 'Total Score', 'Time Used (sec)'],
      ...rankings.map((r, idx) => [
        idx + 1,
        `"${r.student?.name || ''}"`,
        `"${r.student?.rollNumber || ''}"`,
        `"${r.student?.department || 'BCA'}"`,
        `"${r.student?.year || ''}"`,
        `"${r.student?.section || ''}"`,
        `"${r.skill || ''}"`,
        r.totalScore || 0,
        r.timeUsed || 0
      ])
    ]

    const csvContent = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `CodeNova_Rankings_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const top1 = rankings[0]
  const top2 = rankings[1]
  const top3 = rankings[2]

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div>
            <h2 className="admin-logo">CodeNova</h2>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>AMJC BCA</div>
          </div>
          <span className="badge badge-accent">Admin</span>
        </div>

        <nav className="admin-nav">
          <Link to="/admin/dashboard" className="admin-nav-item">
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
          <Link to="/admin/rankings" className="admin-nav-item active">
            <Trophy size={18} />
            <span>Rankings</span>
          </Link>
        </nav>

        <button className="admin-nav-item admin-logout" onClick={() => { sessionStorage.removeItem('codenovaAdmin'); navigate('/'); }}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h1>Department Leaderboard</h1>
            <p>Live rankings & top student performers across coding assessments</p>
          </div>

          <button type="button" className="btn btn-secondary btn-sm" onClick={handleExportRankings}>
            <Download size={16} />
            <span>Export Leaderboard CSV</span>
          </button>
        </header>

        {/* Filters */}
        <div className="filter-controls-row">
          <select
            className="input select-filter"
            value={filterSkill}
            onChange={(e) => setFilterSkill(e.target.value)}
          >
            <option value="">All Skills</option>
            {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            className="input select-filter"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
          >
            <option value="">All Years</option>
            <option value="I">I Year</option>
            <option value="II">II Year</option>
            <option value="III">III Year</option>
          </select>

          <select
            className="input select-filter"
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
          >
            <option value="">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
            <option value="D">Section D</option>
          </select>
        </div>

        {/* Top 3 Podium Cards */}
        {rankings.length >= 3 && (
          <div className="podium-section animate-fade-in-up">
            {/* Rank 2 (Silver) */}
            <div className="podium-card silver-card">
              <div className="medal-icon">🥈</div>
              <h3 className="podium-name">{top2.student?.name}</h3>
              <span className="podium-roll">{top2.student?.rollNumber}</span>
              <div className="podium-score-pill">
                <span className="score-val">{top2.totalScore}</span>
                <span className="score-denom">/100</span>
              </div>
              <span className="badge badge-accent" style={{ marginTop: '0.4rem' }}>{top2.skill}</span>
              <span className="podium-time"><Clock size={12} /> {formatTime(top2.timeUsed)}</span>
            </div>

            {/* Rank 1 (Gold) */}
            <div className="podium-card gold-card">
              <div className="crown-badge">CHAMPION</div>
              <div className="medal-icon gold-medal">🥇</div>
              <h3 className="podium-name" style={{ fontSize: '1.25rem' }}>{top1.student?.name}</h3>
              <span className="podium-roll">{top1.student?.rollNumber}</span>
              <div className="podium-score-pill">
                <span className="score-val" style={{ fontSize: '2.5rem', color: '#fbbf24' }}>{top1.totalScore}</span>
                <span className="score-denom">/100</span>
              </div>
              <span className="badge badge-accent" style={{ marginTop: '0.4rem' }}>{top1.skill}</span>
              <span className="podium-time"><Clock size={12} /> {formatTime(top1.timeUsed)}</span>
            </div>

            {/* Rank 3 (Bronze) */}
            <div className="podium-card bronze-card">
              <div className="medal-icon">🥉</div>
              <h3 className="podium-name">{top3.student?.name}</h3>
              <span className="podium-roll">{top3.student?.rollNumber}</span>
              <div className="podium-score-pill">
                <span className="score-val">{top3.totalScore}</span>
                <span className="score-denom">/100</span>
              </div>
              <span className="badge badge-accent" style={{ marginTop: '0.4rem' }}>{top3.skill}</span>
              <span className="podium-time"><Clock size={12} /> {formatTime(top3.timeUsed)}</span>
            </div>
          </div>
        )}

        {/* Full Leaderboard Table */}
        <div className="table-container" style={{ marginTop: '1.5rem' }}>
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Student Name</th>
                <th>Roll Number</th>
                <th>Year & Sec</th>
                <th>Skill</th>
                <th>Total Score</th>
                <th>Time Used</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((r, i) => (
                <tr key={r._id || i}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      {i === 0 ? <span style={{ fontSize: '1.2rem' }}>🥇</span> :
                       i === 1 ? <span style={{ fontSize: '1.2rem' }}>🥈</span> :
                       i === 2 ? <span style={{ fontSize: '1.2rem' }}>🥉</span> :
                       <strong style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>#{i + 1}</strong>}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.student?.name}</td>
                  <td><code className="roll-code-pill">{r.student?.rollNumber}</code></td>
                  <td>Year {r.student?.year || 'II'}-{r.student?.section || 'A'}</td>
                  <td><span className="badge badge-accent">{r.skill}</span></td>
                  <td>
                    <strong style={{ fontSize: '1.1rem', color: r.totalScore >= 80 ? 'var(--success-light)' : r.totalScore >= 50 ? 'var(--warning-light)' : 'var(--error-light)' }}>
                      {r.totalScore} / 100
                    </strong>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {formatTime(r.timeUsed)}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => navigate(`/admin/students/${r.studentId}/journey`)}
                      title="Inspect Student Code & Journey"
                    >
                      <Eye size={15} />
                      <span>Review</span>
                    </button>
                  </td>
                </tr>
              ))}
              {!rankings.length && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No completed assessments match the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      <style>{`
        .filter-controls-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .select-filter {
          width: 140px;
          padding: 0.65rem 0.85rem;
          font-size: 0.85rem;
        }

        .podium-section {
          display: flex;
          justify-content: center;
          align-items: flex-end;
          gap: 1.25rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .podium-card {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xl);
          padding: 1.75rem 1.5rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.35rem;
          width: 220px;
          transition: all var(--transition-base);
          position: relative;
          backdrop-filter: blur(16px);
        }
        .podium-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-glow);
        }

        .gold-card {
          order: 2;
          border-color: rgba(245, 158, 11, 0.45);
          background: rgba(245, 158, 11, 0.08);
          padding: 2.25rem 1.75rem;
          width: 240px;
          box-shadow: 0 0 35px rgba(245, 158, 11, 0.2);
        }
        .silver-card {
          order: 1;
          border-color: rgba(148, 163, 184, 0.35);
        }
        .bronze-card {
          order: 3;
          border-color: rgba(217, 119, 6, 0.35);
        }

        .crown-badge {
          position: absolute;
          top: -12px;
          background: var(--gradient-gold);
          color: #000;
          font-size: 0.65rem;
          font-weight: 900;
          letter-spacing: 0.1em;
          padding: 0.2rem 0.65rem;
          border-radius: var(--radius-full);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        }

        .medal-icon {
          font-size: 2.5rem;
          line-height: 1;
          margin-bottom: 0.25rem;
        }
        .gold-medal {
          font-size: 3rem;
        }

        .podium-name {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .podium-roll {
          font-size: 0.78rem;
          color: var(--text-muted);
          font-family: var(--font-mono);
        }

        .podium-score-pill {
          display: flex;
          align-items: baseline;
          gap: 0.2rem;
          margin-top: 0.35rem;
        }
        .score-val {
          font-size: 2.1rem;
          font-weight: 900;
          font-family: var(--font-heading);
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .score-denom {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .podium-time {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.35rem;
        }

        .roll-code-pill {
          font-family: var(--font-mono);
          font-size: 0.82rem;
          background: rgba(30, 41, 59, 0.7);
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-sm);
          color: var(--accent-primary-light);
        }

        @media (max-width: 768px) {
          .podium-section {
            flex-direction: column;
            align-items: center;
          }
          .gold-card, .silver-card, .bronze-card {
            order: unset !important;
            width: 100%;
            max-width: 280px;
          }
        }
      `}</style>
    </div>
  )
}
