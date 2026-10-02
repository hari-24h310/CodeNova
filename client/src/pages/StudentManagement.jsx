import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Users, BarChart3, Trophy, BookOpen, LogOut, Search,
  Trash2, Eye, Download, ChevronLeft, ChevronRight
} from 'lucide-react'
import { getAllStudents, deleteStudent, exportStudents } from '../services/api'

export default function StudentManagement() {
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filterYear, setFilterYear] = useState('')
  const [filterSection, setFilterSection] = useState('')
  const [filterSkill, setFilterSkill] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [loading, setLoading] = useState(true)

  const SKILLS = ['Python', 'Java', 'C++', 'C', 'JavaScript', 'Web Development', 'DSA', 'SQL', 'PHP', 'C#']

  useEffect(() => {
    const admin = sessionStorage.getItem('codenovaAdmin')
    if (!admin) {
      navigate('/admin/login')
      return
    }
    loadStudents()
  }, [page, filterYear, filterSection, filterSkill, filterStatus])

  const loadStudents = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 25 })
      if (search) params.set('search', search)
      if (filterYear) params.set('year', filterYear)
      if (filterSection) params.set('section', filterSection)
      if (filterSkill) params.set('skill', filterSkill)
      if (filterStatus) params.set('status', filterStatus)

      const data = await getAllStudents(params.toString())
      setStudents(data.students || [])
      setTotal(data.total || 0)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(1)
    loadStudents()
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete student '${name}' and their assessment history?`)) return
    try {
      await deleteStudent(id)
      loadStudents()
    } catch (err) {
      alert('Failed to delete student: ' + err.message)
    }
  }

  // Export CSV
  const handleExportCSV = async () => {
    try {
      const res = await fetch(exportStudents())
      const { data } = await res.json()
      if (!data || data.length === 0) {
        alert('No data to export.')
        return
      }

      const headers = Object.keys(data[0]).join(',')
      const rows = data.map(row => Object.values(row).map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      const csvContent = [headers, ...rows].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `CodeNova_Students_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
    } catch (err) {
      alert('Export failed: ' + err.message)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="badge badge-success">Completed</span>
      case 'in_progress':
        return <span className="badge badge-warning">In Progress</span>
      case 'failed':
        return <span className="badge badge-error">Failed (Tab Switch)</span>
      case 'skill_selected':
        return <span className="badge badge-info">Skill Picked</span>
      case 'rules_accepted':
        return <span className="badge badge-info">Rules Accepted</span>
      case 'details_verified':
        return <span className="badge badge-accent">Details Verified</span>
      default:
        return <span className="badge" style={{ background: 'rgba(148, 163, 184, 0.15)', color: 'var(--text-muted)' }}>Not Started</span>
    }
  }

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
          <Link to="/admin/students" className="admin-nav-item active">
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

        <button className="admin-nav-item admin-logout" onClick={() => { sessionStorage.removeItem('codenovaAdmin'); navigate('/'); }}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Table Area */}
      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h1>Student Management</h1>
            <p>{total} total student candidates registered for assessment</p>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
              <Download size={16} />
              <span>Export CSV/Excel</span>
            </button>
          </div>
        </header>

        {/* Filter Bar */}
        <div className="filter-controls-row">
          <form onSubmit={handleSearchSubmit} className="search-form-inline">
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={16} className="search-icon-pos" />
              <input
                className="input search-input-field"
                placeholder="Search by name, roll no, or reg no..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-secondary btn-sm">Search</button>
          </form>

          <div className="select-filters-group">
            <select
              className="input select-filter"
              value={filterYear}
              onChange={(e) => { setFilterYear(e.target.value); setPage(1); }}
            >
              <option value="">All Years</option>
              <option value="I">I Year</option>
              <option value="II">II Year</option>
              <option value="III">III Year</option>
            </select>

            <select
              className="input select-filter"
              value={filterSection}
              onChange={(e) => { setFilterSection(e.target.value); setPage(1); }}
            >
              <option value="">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
              <option value="D">Section D</option>
            </select>

            <select
              className="input select-filter"
              value={filterSkill}
              onChange={(e) => { setFilterSkill(e.target.value); setPage(1); }}
            >
              <option value="">All Skills</option>
              {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select
              className="input select-filter"
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            >
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="failed">Failed</option>
              <option value="not_started">Not Started</option>
            </select>
          </div>
        </div>

        {/* Students Data Table */}
        <div className="table-container animate-fade-in-up">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Roll Number</th>
                <th>Reg. Number</th>
                <th>Dept</th>
                <th>Year</th>
                <th>Sec</th>
                <th>Skill</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</td>
                  <td>
                    <code className="roll-code-pill">{s.rollNumber}</code>
                  </td>
                  <td>{s.registrationNumber || '—'}</td>
                  <td>{s.department || 'BCA'}</td>
                  <td>{s.year || '—'}</td>
                  <td>{s.section || '—'}</td>
                  <td>
                    {s.selectedSkill ? (
                      <span className="badge badge-accent">{s.selectedSkill}</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                  <td>{getStatusBadge(s.assessmentStatus)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm action-btn"
                        onClick={() => navigate(`/admin/students/${s._id}/journey`)}
                        title="View Complete Journey & Code"
                      >
                        <Eye size={15} />
                        <span>Journey</span>
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm action-btn delete-btn"
                        onClick={() => handleDelete(s._id, s.name)}
                        title="Delete Student"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!students.length && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No students match the current filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="pagination-bar">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <span className="pagination-info">
            Page <strong>{page}</strong> of <strong>{Math.ceil(total / 25) || 1}</strong>
          </span>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={page >= Math.ceil(total / 25)}
            onClick={() => setPage(p => p + 1)}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>

      </main>

      <style>{`
        .filter-controls-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
        }

        .search-form-inline {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
          min-width: 280px;
        }

        .search-icon-pos {
          position: absolute;
          left: 0.85rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }
        .search-input-field {
          padding-left: 2.4rem;
          width: 100%;
        }

        .select-filters-group {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .select-filter {
          width: 130px;
          padding: 0.65rem 0.85rem;
          font-size: 0.85rem;
        }

        .roll-code-pill {
          font-family: var(--font-mono);
          font-size: 0.82rem;
          background: rgba(30, 41, 59, 0.7);
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-sm);
          color: var(--accent-primary-light);
        }

        .action-btn {
          font-size: 0.78rem;
          padding: 0.35rem 0.65rem;
        }
        .delete-btn {
          color: var(--error-light);
        }
        .delete-btn:hover {
          background: var(--error-bg);
          border-color: rgba(239, 68, 68, 0.4);
        }

        .pagination-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-top: 1.25rem;
        }
        .pagination-info {
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        .pagination-info strong {
          color: var(--text-primary);
        }
      `}</style>
    </div>
  )
}
