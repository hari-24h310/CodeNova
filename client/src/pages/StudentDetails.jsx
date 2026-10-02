import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, ArrowLeft, User, Hash, Building2, Calendar, LayoutGrid, Phone, Mail, Loader2, Edit3, Sparkles } from 'lucide-react'
import { updateStudent } from '../services/api'

export default function StudentDetails() {
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [revealed, setRevealed] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Editable fields
  const [editableFields, setEditableFields] = useState({
    name: '',
    rollNumber: '',
    registrationNumber: '',
    department: 'BCA',
    year: '',
    section: '',
  })

  useEffect(() => {
    const stored = sessionStorage.getItem('codenovaStudent')
    if (!stored) {
      navigate('/student/login')
      return
    }

    const s = JSON.parse(stored)
    setStudent(s)
    setEditableFields({
      name: s.name || '',
      rollNumber: s.rollNumber || '',
      registrationNumber: s.registrationNumber || '',
      department: s.department || 'BCA',
      year: s.year || '',
      section: s.section || '',
    })
    setPhone(s.phone || '')
    setEmail(s.email || '')

    // Sequential reveal animation
    const rowCount = 6
    for (let i = 0; i <= rowCount; i++) {
      setTimeout(() => setRevealed(i + 1), 250 + i * 180)
    }
  }, [navigate])

  const handleFieldChange = (field, value) => {
    setEditableFields(prev => ({ ...prev, [field]: value }))
  }

  const handleContinue = async () => {
    if (!phone.trim()) {
      setError('Please enter your active Phone Number.')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid Personal Email address.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { student: updated } = await updateStudent(student._id, {
        ...editableFields,
        phone: phone.trim(),
        email: email.trim(),
      })
      sessionStorage.setItem('codenovaStudent', JSON.stringify(updated))
      navigate('/student/rules')
    } catch (err) {
      setError(err.message || 'Failed to update details. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!student) return null

  const fields = [
    { key: 'name', label: 'Student Name', icon: <User size={18} />, value: editableFields.name },
    { key: 'rollNumber', label: 'Roll Number', icon: <Hash size={18} />, value: editableFields.rollNumber },
    { key: 'registrationNumber', label: 'Registration Number', icon: <Hash size={18} />, value: editableFields.registrationNumber },
    { key: 'department', label: 'Department', icon: <Building2 size={18} />, value: editableFields.department },
    { key: 'year', label: 'Year', icon: <Calendar size={18} />, value: editableFields.year },
    { key: 'section', label: 'Section', icon: <LayoutGrid size={18} />, value: editableFields.section },
  ]

  return (
    <div className="page-container">
      <div className="card-elevated animate-scale-in" style={{ maxWidth: 540, width: '100%' }}>
        <button
          className="btn-back-link"
          onClick={() => navigate('/student/login')}
        >
          <ArrowLeft size={16} />
          <span>Change Roll Number</span>
        </button>

        {/* Verification Success Badge */}
        <div className="verify-success-badge animate-fade-in-up">
          <CheckCircle2 size={18} />
          <span>Roll Number Verified Successfully</span>
        </div>

        <div className="details-header">
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Student Information</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: 2 }}>
              Verified from college student database
            </p>
          </div>
          <button
            type="button"
            className={`btn-edit-toggle ${isEditing ? 'active' : ''}`}
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit3 size={14} />
            <span>{isEditing ? 'LOCK FIELDS' : 'EDIT DETAILS'}</span>
          </button>
        </div>

        {isEditing && (
          <div className="inline-edit-notice animate-fade-in">
            <Sparkles size={14} />
            <span>Inline editing enabled. You can directly edit your name, reg number, year & section.</span>
          </div>
        )}

        {/* Sequential Reveal Grid */}
        <div className="sequential-fields-list">
          {fields.map((field, i) => (
            <div
              key={field.key}
              className={`field-reveal-card ${revealed > i ? 'revealed' : ''}`}
              style={{ transitionDelay: `${i * 0.04}s` }}
            >
              <div className="field-icon-box">{field.icon}</div>
              <div className="field-data-box">
                <span className="field-label-text">{field.label}</span>
                {isEditing ? (
                  <input
                    className="input input-editable"
                    value={field.value}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    placeholder={`Enter ${field.label}`}
                  />
                ) : (
                  <div className="field-value-display">{field.value || '—'}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Required Contact Information */}
        {revealed >= 6 && (
          <div className="contact-info-section animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="section-divider">
              <span>Required Contact Information</span>
            </div>

            <div className="input-group">
              <label htmlFor="phone">
                <Phone size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                Phone Number <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <input
                id="phone"
                className="input"
                type="tel"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setError(''); }}
              />
            </div>

            <div className="input-group">
              <label htmlFor="email">
                <Mail size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                Personal Email <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <input
                id="email"
                className="input"
                type="email"
                placeholder="e.g. yourname@gmail.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
              />
            </div>

            {error && (
              <div className="error-banner animate-fade-in">
                <span>{error}</span>
              </div>
            )}

            <button
              className="btn btn-primary btn-lg btn-full"
              onClick={handleContinue}
              disabled={loading}
              style={{ marginTop: '0.75rem' }}
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="spin-icon" />
                  <span>Saving Details...</span>
                </>
              ) : (
                <span>CONTINUE →</span>
              )}
            </button>
          </div>
        )}
      </div>

      <style>{`
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

        .verify-success-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--success-bg);
          color: var(--success-light);
          border: 1px solid rgba(16, 185, 129, 0.3);
          padding: 0.45rem 1rem;
          border-radius: var(--radius-full);
          font-size: 0.82rem;
          font-weight: 600;
          margin-bottom: 1.25rem;
        }

        .details-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1.25rem;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .btn-edit-toggle {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: var(--accent-glow);
          color: var(--accent-primary-light);
          border: 1px solid var(--border-primary);
          padding: 0.35rem 0.85rem;
          border-radius: var(--radius-md);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .btn-edit-toggle:hover,
        .btn-edit-toggle.active {
          background: var(--accent-primary);
          color: #fff;
          border-color: var(--accent-primary);
        }

        .inline-edit-notice {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(99, 102, 241, 0.12);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-md);
          padding: 0.6rem 0.85rem;
          font-size: 0.8rem;
          color: var(--text-accent);
          margin-bottom: 1rem;
        }

        .sequential-fields-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .field-reveal-card {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.75rem 1rem;
          background: rgba(30, 41, 59, 0.45);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.35s ease, transform 0.35s ease, border-color var(--transition-fast);
        }
        .field-reveal-card.revealed {
          opacity: 1;
          transform: translateY(0);
        }
        .field-reveal-card:hover {
          border-color: var(--border-hover);
        }

        .field-icon-box {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-sm);
          background: var(--accent-glow);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-primary-light);
          flex-shrink: 0;
        }

        .field-data-box {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
        }

        .field-label-text {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .field-value-display {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .contact-info-section {
          margin-top: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .section-divider {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.25rem;
        }
        .section-divider::before,
        .section-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border-subtle);
        }
        .section-divider span {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .error-banner {
          background: var(--error-bg);
          border: 1px solid rgba(239, 68, 68, 0.35);
          border-radius: var(--radius-md);
          padding: 0.75rem 1rem;
          color: var(--error-light);
          font-size: 0.85rem;
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
