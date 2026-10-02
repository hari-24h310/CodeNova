import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, AlertTriangle, CheckCircle2, XCircle, MinusCircle, Send, Clock, HelpCircle, Loader2 } from 'lucide-react'
import { submitAssessment } from '../services/api'

export default function FinalSubmission() {
  const navigate = useNavigate()
  const [statuses, setStatuses] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [timeUsed, setTimeUsed] = useState(0)
  const assessmentId = sessionStorage.getItem('codenovaAssessmentId')

  useEffect(() => {
    const sts = sessionStorage.getItem('codenovaStatuses')
    const res = sessionStorage.getItem('codenovaResults')
    const time = sessionStorage.getItem('codenovaTimeUsed')

    if (!sts || !assessmentId) {
      navigate('/student/login')
      return
    }

    setStatuses(JSON.parse(sts))
    setResults(JSON.parse(res || '[]'))
    setTimeUsed(parseInt(time || '0', 10))
  }, [navigate, assessmentId])

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const solved = statuses.filter(s => s === 'passed').length
  const wrong = statuses.filter(s => s === 'wrong').length
  const skipped = statuses.filter(s => s === 'skipped').length
  const notAttempted = statuses.filter(s => s === 'not_attempted' || s === 'in_progress').length

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const result = await submitAssessment(assessmentId)
      sessionStorage.setItem('codenovaResult', JSON.stringify(result))

      // Clear local recovery state
      const studentStored = sessionStorage.getItem('codenovaStudent')
      if (studentStored) {
        const stu = JSON.parse(studentStored)
        localStorage.removeItem(`codenova_state_${stu._id}`)
      }

      navigate('/student/result')
    } catch (err) {
      alert('Submission error: ' + (err.message || 'Unable to submit assessment.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="card-elevated animate-scale-in" style={{ maxWidth: 520, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="summary-icon-box">
            <Send size={28} />
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, textTransform: 'uppercase', marginTop: '0.75rem' }}>
            ASSESSMENT SUMMARY
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Review your question breakdown before final permanent submission
          </p>
        </div>

        {/* Stats Summary Rows */}
        <div className="summary-stats-list">
          <div className="summary-stat-row stat-solved">
            <div className="stat-left">
              <CheckCircle2 size={20} />
              <span>Solved</span>
            </div>
            <strong>{solved}</strong>
          </div>

          <div className="summary-stat-row stat-wrong">
            <div className="stat-left">
              <XCircle size={20} />
              <span>Wrong / Incomplete</span>
            </div>
            <strong>{wrong}</strong>
          </div>

          <div className="summary-stat-row stat-skipped">
            <div className="stat-left">
              <MinusCircle size={20} />
              <span>Skipped</span>
            </div>
            <strong>{skipped}</strong>
          </div>

          <div className="summary-stat-row stat-not-attempted">
            <div className="stat-left">
              <HelpCircle size={20} />
              <span>Not Attempted</span>
            </div>
            <strong>{notAttempted}</strong>
          </div>

          <div className="summary-stat-row stat-time">
            <div className="stat-left">
              <Clock size={20} />
              <span>Time Used</span>
            </div>
            <strong style={{ fontFamily: 'var(--font-mono)' }}>{formatTime(timeUsed)}</strong>
          </div>
        </div>

        {/* Warning if unanswered */}
        {(skipped > 0 || notAttempted > 0) && (
          <div className="unanswered-warning animate-fade-in">
            <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <strong>Unanswered Questions Warning</strong>
              <p>You have {skipped + notAttempted} unanswered questions. You can go back and attempt them without penalty.</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="submission-actions">
          <button
            type="button"
            className="btn btn-ghost"
            style={{ flex: 1 }}
            onClick={() => navigate('/student/test')}
            disabled={loading}
          >
            <ArrowLeft size={16} />
            <span>GO BACK</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            style={{ flex: 1.2 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="spin-icon" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <span>FINAL SUBMIT</span>
                <Send size={16} />
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        .summary-icon-box {
          width: 58px;
          height: 58px;
          border-radius: var(--radius-xl);
          background: var(--accent-glow);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-primary-light);
          margin: 0 auto;
          box-shadow: var(--shadow-glow);
        }

        .summary-stats-list {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .summary-stat-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.9rem 1.15rem;
          border-radius: var(--radius-md);
          font-size: 0.95rem;
          border: 1px solid var(--border-subtle);
        }

        .stat-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 500;
        }

        .summary-stat-row strong {
          font-size: 1.25rem;
          font-weight: 800;
        }

        .stat-solved {
          background: var(--success-bg);
          color: var(--success-light);
          border-color: rgba(16, 185, 129, 0.3);
        }
        .stat-wrong {
          background: var(--error-bg);
          color: var(--error-light);
          border-color: rgba(239, 68, 68, 0.3);
        }
        .stat-skipped {
          background: var(--warning-bg);
          color: var(--warning-light);
          border-color: rgba(245, 158, 11, 0.3);
        }
        .stat-not-attempted {
          background: rgba(30, 41, 59, 0.6);
          color: var(--text-muted);
        }
        .stat-time {
          background: var(--accent-glow);
          color: var(--accent-primary-light);
          border-color: var(--border-primary);
        }

        .unanswered-warning {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.9rem 1.1rem;
          border-radius: var(--radius-md);
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.35);
          color: var(--warning-light);
          font-size: 0.85rem;
          margin-top: 1.25rem;
          line-height: 1.45;
        }
        .unanswered-warning strong {
          display: block;
          font-size: 0.88rem;
          margin-bottom: 0.15rem;
        }

        .submission-actions {
          display: flex;
          gap: 0.85rem;
          margin-top: 1.75rem;
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
