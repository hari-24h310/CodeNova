import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, CheckCircle2, XCircle, MinusCircle, Clock, Code2, Check, ArrowRight } from 'lucide-react'

export default function StudentResult() {
  const navigate = useNavigate()
  const [result, setResult] = useState(null)
  const [skill, setSkill] = useState('')

  useEffect(() => {
    const stored = sessionStorage.getItem('codenovaResult')
    const storedSkill = sessionStorage.getItem('codenovaSkill')

    if (!stored) {
      navigate('/')
      return
    }

    setResult(JSON.parse(stored))
    setSkill(storedSkill || 'Python')
  }, [navigate])

  if (!result) return null

  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '—'
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const scorePercentage = result.totalScore || 0

  return (
    <div className="page-container">
      <div className="result-main-card card-elevated animate-scale-in">
        {/* Trophy Animation Box */}
        <div className="trophy-glow-wrapper animate-fade-in-up">
          <div className="trophy-box">
            <Trophy size={48} strokeWidth={2} />
          </div>
        </div>

        <div className="result-header animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="completed-pill">
            <Check size={14} strokeWidth={3} />
            <span>EXAMINATION CONCLUDED</span>
          </div>
          <h1 className="result-title">ASSESSMENT COMPLETED</h1>
          <p className="result-sub">Your evaluation results have been recorded to college database</p>
        </div>

        {/* Large Score Metric */}
        <div className="score-hero-box animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="score-number-row">
            <span className="score-big-num">{result.totalScore}</span>
            <span className="score-total-denominator">/ 100</span>
          </div>
          <span className="score-caption">Total Marks Scored</span>
        </div>

        {/* Breakdown Metric Grid */}
        <div className="result-metrics-grid stagger-children">
          <div className="metric-box">
            <Code2 size={18} className="metric-icon" />
            <span className="metric-label">Questions</span>
            <strong className="metric-val">20</strong>
          </div>

          <div className="metric-box">
            <CheckCircle2 size={18} className="metric-icon" style={{ color: 'var(--info)' }} />
            <span className="metric-label">Attempted</span>
            <strong className="metric-val">{result.questionsAttempted}</strong>
          </div>

          <div className="metric-box" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
            <CheckCircle2 size={18} className="metric-icon" style={{ color: 'var(--success)' }} />
            <span className="metric-label">Correct</span>
            <strong className="metric-val" style={{ color: 'var(--success-light)' }}>
              {result.questionsCorrect}
            </strong>
          </div>

          <div className="metric-box" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
            <XCircle size={18} className="metric-icon" style={{ color: 'var(--error)' }} />
            <span className="metric-label">Wrong</span>
            <strong className="metric-val" style={{ color: 'var(--error-light)' }}>
              {result.questionsWrong}
            </strong>
          </div>

          <div className="metric-box">
            <MinusCircle size={18} className="metric-icon" style={{ color: 'var(--warning)' }} />
            <span className="metric-label">Skipped</span>
            <strong className="metric-val" style={{ color: 'var(--warning-light)' }}>
              {result.questionsSkipped}
            </strong>
          </div>

          <div className="metric-box">
            <Clock size={18} className="metric-icon" style={{ color: 'var(--accent-primary-light)' }} />
            <span className="metric-label">Time Taken</span>
            <strong className="metric-val" style={{ fontFamily: 'var(--font-mono)' }}>
              {formatTime(result.timeUsed)}
            </strong>
          </div>
        </div>

        {/* Skill Badge */}
        <div className="tested-skill-strip animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <span className="skill-label">Tested Skill:</span>
          <span className="badge badge-accent" style={{ fontSize: '0.85rem', padding: '0.35rem 0.95rem' }}>
            {result.skill || skill}
          </span>
        </div>

        {/* Done Action */}
        <button
          type="button"
          className="btn btn-primary btn-lg btn-full done-btn"
          onClick={() => {
            sessionStorage.clear()
            navigate('/')
          }}
        >
          <span>DONE</span>
          <ArrowRight size={18} />
        </button>
      </div>

      <style>{`
        .result-main-card {
          max-width: 540px;
          width: 100%;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
          padding: 2.75rem 2.25rem;
        }

        .trophy-glow-wrapper {
          position: relative;
        }

        .trophy-box {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          box-shadow: 0 0 45px rgba(245, 158, 11, 0.45);
          animation: float 4s ease-in-out infinite;
        }

        .result-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.35rem;
        }

        .completed-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: var(--success-bg);
          color: var(--success-light);
          border: 1px solid rgba(16, 185, 129, 0.3);
          padding: 0.25rem 0.8rem;
          border-radius: var(--radius-full);
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          margin-bottom: 0.25rem;
        }

        .result-title {
          font-size: 1.85rem;
          font-weight: 900;
          letter-spacing: -0.02em;
        }

        .result-sub {
          font-size: 0.88rem;
          color: var(--text-muted);
        }

        .score-hero-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1.25rem 2rem;
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-xl);
          width: 100%;
          box-shadow: var(--shadow-sm);
        }

        .score-number-row {
          display: flex;
          align-items: baseline;
          gap: 0.4rem;
        }

        .score-big-num {
          font-size: 4.25rem;
          font-weight: 900;
          font-family: var(--font-heading);
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: 1;
        }

        .score-total-denominator {
          font-size: 1.6rem;
          color: var(--text-muted);
          font-weight: 400;
        }

        .score-caption {
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 600;
          margin-top: 0.25rem;
        }

        .result-metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
          width: 100%;
        }

        .metric-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          padding: 0.85rem 0.5rem;
          background: rgba(30, 41, 59, 0.4);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
        }

        .metric-icon {
          color: var(--text-muted);
          margin-bottom: 0.1rem;
        }

        .metric-label {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }

        .metric-val {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .tested-skill-strip {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.65rem 1rem;
          background: rgba(30, 41, 59, 0.4);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
        }

        .skill-label {
          font-size: 0.8rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-weight: 600;
        }

        .done-btn {
          margin-top: 0.5rem;
          letter-spacing: 0.06em;
        }

        @media (max-width: 480px) {
          .result-metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .score-big-num {
            font-size: 3.5rem;
          }
        }
      `}</style>
    </div>
  )
}
