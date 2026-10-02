import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Clock, Code2, AlertTriangle, CheckCircle2,
  XCircle, Keyboard, Wifi, Shield, BookOpen, Lock, Sparkles
} from 'lucide-react'

const rulesData = [
  { icon: <Code2 size={16} />, text: 'Total of 20 coding questions will be presented in the assessment.', tag: 'Structure', type: 'info' },
  { icon: <Clock size={16} />, text: 'Total test duration is strictly 60 minutes from timer start.', tag: 'Timing', type: 'info' },
  { icon: <CheckCircle2 size={16} />, text: '5 Marks per question | Total assessment maximum: 100 Marks.', tag: 'Scoring', type: 'info' },
  { icon: <Code2 size={16} />, text: 'You must select exactly one programming language / skill for the entire test.', tag: 'Skill', type: 'info' },
  { icon: <BookOpen size={16} />, text: 'Every coding problem provides sample input, sample output, and problem constraints.', tag: 'Format', type: 'info' },
  { icon: <CheckCircle2 size={16} />, text: 'Students may skip questions and return to them anytime before final submission.', tag: 'Navigation', type: 'success' },
  { icon: <CheckCircle2 size={16} />, text: 'No negative marking is applied for skipped or incorrect questions.', tag: 'Marking', type: 'success' },
  { icon: <Wifi size={16} />, text: 'Code is automatically saved continuously to server and local storage.', tag: 'Autosave', type: 'success' },
  { icon: <Wifi size={16} />, text: 'Refreshing the page will not lose your progress, code, or timer status.', tag: 'Autosave', type: 'success' },
  { icon: <Wifi size={16} />, text: 'Temporary internet disconnection will not discard your written code.', tag: 'Offline Safe', type: 'success' },
  { icon: <XCircle size={16} />, text: 'Copy operation (Ctrl+C / Cmd+C) is disabled during the assessment.', tag: 'Integrity', type: 'danger' },
  { icon: <XCircle size={16} />, text: 'Paste operation (Ctrl+V / Cmd+V) is disabled inside the code editor.', tag: 'Integrity', type: 'danger' },
  { icon: <XCircle size={16} />, text: 'Cut operation (Ctrl+X / Cmd+X) is disabled during the test.', tag: 'Integrity', type: 'danger' },
  { icon: <AlertTriangle size={16} />, text: 'Tab switching or minimizing the test window results in immediate TEST FAILURE.', tag: 'Anti-Cheat', type: 'danger' },
  { icon: <AlertTriangle size={16} />, text: 'If tab switching is detected, the assessment is permanently invalidated.', tag: 'Anti-Cheat', type: 'danger' },
  { icon: <Shield size={16} />, text: 'Standard library files, header imports, and regular language constructs are allowed.', tag: 'Environment', type: 'success' },
  { icon: <CheckCircle2 size={16} />, text: 'Built-in functions, standard libraries, and language-provided APIs are allowed in every programming language.', tag: 'Libraries', type: 'success' },
  { icon: <Code2 size={16} />, text: 'Interactive "Run Code" is available on all questions to test output before submission.', tag: 'Execution', type: 'info' },
  { icon: <AlertTriangle size={16} />, text: 'Full compiler error messages and runtime diagnostics will be displayed in console.', tag: 'Diagnostics', type: 'info' },
  { icon: <Keyboard size={16} />, text: 'Final submission is permanent and irreversible once submitted.', tag: 'Finality', type: 'warning' },
]

export default function GeneralRules() {
  const navigate = useNavigate()
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem('codenovaStudent')
    if (!stored) navigate('/student/login')
  }, [navigate])

  const handleAccept = () => {
    if (!accepted) return
    sessionStorage.setItem('codenovaRulesAccepted', 'true')
    navigate('/student/select-skill')
  }

  return (
    <div className="page-container" style={{ justifyContent: 'flex-start', paddingTop: '2.5rem', paddingBottom: '3.5rem' }}>
      <div className="card-elevated animate-scale-in" style={{ maxWidth: 740, width: '100%' }}>
        <button className="btn-back-link" onClick={() => navigate('/student/details')}>
          <ArrowLeft size={16} />
          <span>Back to Details</span>
        </button>

        <div className="rules-header">
          <div className="rules-icon-badge">
            <Shield size={28} />
          </div>
          <h1 className="rules-title">BEFORE YOU BEGIN</h1>
          <p className="rules-subtitle">
            Please read the 20 assessment rules carefully before proceeding to skill selection
          </p>
          <p className="rules-subtitle facilitator-credit">Dr. A. Udhayakumar<br />Associate Professor &amp; Facilitator</p>
        </div>

        {/* 20 Numbered Rules List */}
        <div className="rules-grid-list stagger-children">
          {rulesData.map((rule, i) => (
            <div key={i} className={`rule-item-card rule-type-${rule.type}`}>
              <div className="rule-badge-index">{String(i + 1).padStart(2, '0')}</div>
              <div className="rule-body">
                <span className="rule-text-content">{rule.text}</span>
              </div>
              <span className={`badge badge-${rule.type === 'danger' ? 'error' : rule.type === 'warning' ? 'warning' : rule.type === 'success' ? 'success' : 'info'}`} style={{ fontSize: '0.68rem' }}>
                {rule.tag}
              </span>
            </div>
          ))}
        </div>

        {/* Acceptance Box */}
        <div className="acceptance-box">
          <label className="checkbox-container">
            <input
              type="checkbox"
              id="acceptRules"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            <span className="checkmark-custom" />
            <span className="checkbox-label-text">
              I have read, understood, and agreed to all 20 examination rules and anti-cheat policies.
            </span>
          </label>
        </div>

        <button
          className="btn btn-primary btn-lg btn-full"
          onClick={handleAccept}
          disabled={!accepted}
          style={{ marginTop: '1.25rem' }}
        >
          <span>CONTINUE →</span>
        </button>
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

        .rules-header {
          text-align: center;
          margin-bottom: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .rules-icon-badge {
          width: 60px;
          height: 60px;
          border-radius: var(--radius-xl);
          background: var(--accent-glow);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-primary-light);
          box-shadow: var(--shadow-glow);
        }

        .rules-title {
          font-size: 2rem;
          font-weight: 900;
          letter-spacing: -0.02em;
        }

        .rules-subtitle {
          font-size: 0.92rem;
          color: var(--text-muted);
          max-width: 500px;
        }

        .rules-grid-list {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          max-height: 480px;
          overflow-y: auto;
          padding-right: 0.5rem;
        }

        .rule-item-card {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.75rem 1rem;
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }
        .rule-item-card:hover {
          background: rgba(30, 41, 59, 0.8);
          border-color: var(--border-hover);
        }

        .rule-type-danger {
          border-left: 3px solid var(--error);
        }
        .rule-type-warning {
          border-left: 3px solid var(--warning);
        }
        .rule-type-success {
          border-left: 3px solid var(--success);
        }
        .rule-type-info {
          border-left: 3px solid var(--accent-primary);
        }

        .rule-badge-index {
          font-family: var(--font-mono);
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--text-muted);
          width: 26px;
          height: 26px;
          border-radius: var(--radius-sm);
          background: var(--bg-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .rule-body {
          flex: 1;
        }

        .rule-text-content {
          font-size: 0.88rem;
          color: var(--text-primary);
          line-height: 1.4;
        }

        .acceptance-box {
          margin-top: 1.5rem;
          padding: 1.1rem 1.25rem;
          background: rgba(99, 102, 241, 0.08);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-md);
        }

        .checkbox-container {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          cursor: pointer;
          user-select: none;
        }
        .checkbox-container input {
          width: 1.25rem;
          height: 1.25rem;
          accent-color: var(--accent-primary);
          cursor: pointer;
          flex-shrink: 0;
        }

        .checkbox-label-text {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.4;
        }
      `}</style>
    </div>
  )
}
