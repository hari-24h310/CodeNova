import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Brain, Code2, Clock, CheckCircle2, XCircle, AlertTriangle,
  Monitor, RotateCcw, Calendar, Medal, Check, Phone, Mail, User, Hash,
  Building2, LayoutGrid, Terminal, Sparkles, Layers, ShieldAlert, Cpu
} from 'lucide-react'
import { getStudentJourney, getStudentAnalysis, getTrainingPlan } from '../services/api'
import Editor from '@monaco-editor/react'

export default function StudentJourney() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('journey') // 'journey' | 'code' | 'analytics' | 'ai'
  const [selectedQuestionIdx, setSelectedQuestionIdx] = useState(0)

  useEffect(() => {
    if (!sessionStorage.getItem('codenovaAdmin')) {
      navigate('/admin/login')
      return
    }
    loadJourneyData()
  }, [id])

  const loadJourneyData = async () => {
    try {
      const res = await getStudentJourney(id)
      setData(res)

      if (res.student?.assessmentStatus === 'completed' || res.assessment) {
        const [analysisRes, planRes] = await Promise.all([
          getStudentAnalysis(id).catch(() => ({ analysis: null })),
          getTrainingPlan(id).catch(() => ({ plan: null }))
        ])
        if (analysisRes.analysis) setAnalysis(analysisRes.analysis)
        if (planRes.plan) setPlan(planRes.plan)
      }
    } catch (err) {
      console.error('Error fetching student journey:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (d) => d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'
  const formatDate = (d) => d ? new Date(d).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
  const formatSeconds = (sec) => sec ? `${Math.floor(sec / 60)}m ${sec % 60}s` : '0m 0s'

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

  if (!data?.student) {
    return (
      <div className="page-container">
        <h2>Student record not found</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/admin/students')} style={{ marginTop: '1rem' }}>
          Back to Students
        </button>
      </div>
    )
  }

  const { student, assessment } = data
  const currentQResponse = assessment?.questions?.[selectedQuestionIdx] || {}
  const currentQData = currentQResponse.questionId || {}

  // Calculate concept analytics
  const conceptStats = {}
  if (assessment?.questions?.length) {
    assessment.questions.forEach((q) => {
      const c = q.questionId?.concept || 'General Logic'
      if (!conceptStats[c]) conceptStats[c] = { correct: 0, total: 0 }
      conceptStats[c].total++
      if (q.result === 'correct') conceptStats[c].correct++
    })
  }

  return (
    <div className="admin-layout">
      <main className="admin-main" style={{ maxWidth: 1400, margin: '0 auto', width: '100%' }}>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => navigate('/admin/students')}
          style={{ marginBottom: '1.5rem' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Students List</span>
        </button>

        {/* Student Profile Header Card */}
        <div className="card-elevated profile-hero-card">
          <div className="profile-details-column">
            <div className="profile-title-row">
              <h1 className="student-full-name">{student.name}</h1>
              <span className={`badge ${student.assessmentStatus === 'completed' ? 'badge-success' : student.assessmentStatus === 'failed' ? 'badge-error' : 'badge-warning'}`} style={{ textTransform: 'capitalize', fontSize: '0.85rem' }}>
                {(student.assessmentStatus || 'not_started').replace(/_/g, ' ')}
              </span>
            </div>

            <div className="student-meta-tags-grid">
              <div className="meta-item"><Hash size={14} /> <strong>{student.rollNumber}</strong></div>
              <div className="meta-item"><Hash size={14} /> Reg: {student.registrationNumber || '—'}</div>
              <div className="meta-item"><Building2 size={14} /> {student.department} • Year {student.year}-{student.section}</div>
              <div className="meta-item"><Phone size={14} /> {student.phone || '—'}</div>
              <div className="meta-item"><Mail size={14} /> {student.email || '—'}</div>
              {student.selectedSkill && (
                <div className="meta-item">
                  <span className="badge badge-accent">{student.selectedSkill}</span>
                </div>
              )}
            </div>
          </div>

          {assessment && (
            <div className="score-summary-quad-box">
              <div className="score-mini-stat">
                <span className="mini-lbl">SCORE</span>
                <span className="mini-score" style={{ color: assessment.totalScore >= 70 ? 'var(--success-light)' : assessment.totalScore >= 40 ? 'var(--warning-light)' : 'var(--error-light)' }}>
                  {assessment.totalScore}
                  <small style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/100</small>
                </span>
              </div>
              <div className="score-mini-stat">
                <span className="mini-lbl">ACCURACY</span>
                <span className="mini-sub-val">
                  {assessment.questionsAttempted > 0 ? `${Math.round((assessment.questionsCorrect / 20) * 100)}%` : '0%'}
                </span>
              </div>
              <div className="score-mini-stat">
                <span className="mini-lbl">TIME USED</span>
                <span className="mini-sub-val" style={{ fontFamily: 'var(--font-mono)' }}>
                  {formatSeconds(assessment.timeUsed || 0)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="journey-tabs-bar">
          <button
            type="button"
            className={`journey-tab-btn ${activeTab === 'journey' ? 'active' : ''}`}
            onClick={() => setActiveTab('journey')}
          >
            <Clock size={16} />
            <span>Assessment Journey & Timeline</span>
          </button>

          {assessment && (
            <>
              <button
                type="button"
                className={`journey-tab-btn ${activeTab === 'code' ? 'active' : ''}`}
                onClick={() => setActiveTab('code')}
              >
                <Code2 size={16} />
                <span>Question Code Review ({assessment.questions?.length || 0})</span>
              </button>

              <button
                type="button"
                className={`journey-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
                onClick={() => setActiveTab('analytics')}
              >
                <Layers size={16} />
                <span>Concept Analytics</span>
              </button>

              <button
                type="button"
                className={`journey-tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
                onClick={() => setActiveTab('ai')}
              >
                <Brain size={16} />
                <span>AI Feedback & Training Plan</span>
              </button>
            </>
          )}
        </div>

        {/* TAB 1: Assessment Journey & Timeline */}
        {activeTab === 'journey' && (
          <div className="journey-tab-content animate-fade-in">
            <div className="card">
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={18} style={{ color: 'var(--accent-primary-light)' }} />
                <span>Step-by-Step Examination Journey</span>
              </h3>

              <div className="timeline-flow-list">
                <div className="timeline-flow-step">
                  <div className={`step-dot ${student.loginTime ? 'done' : ''}`}>
                    {student.loginTime ? <Check size={12} strokeWidth={3} /> : '1'}
                  </div>
                  <div className="step-content-box">
                    <h4>Student Login & Verification</h4>
                    <p className="step-time">{formatDate(student.loginTime)} at {formatTime(student.loginTime)}</p>
                  </div>
                </div>

                <div className="timeline-flow-step">
                  <div className={`step-dot ${student.detailsVerifiedAt ? 'done' : ''}`}>
                    {student.detailsVerifiedAt ? <Check size={12} strokeWidth={3} /> : '2'}
                  </div>
                  <div className="step-content-box">
                    <h4>Student Information Confirmed</h4>
                    <p className="step-time">{formatDate(student.detailsVerifiedAt)} at {formatTime(student.detailsVerifiedAt)}</p>
                  </div>
                </div>

                <div className="timeline-flow-step">
                  <div className={`step-dot ${student.rulesAcceptedAt ? 'done' : ''}`}>
                    {student.rulesAcceptedAt ? <Check size={12} strokeWidth={3} /> : '3'}
                  </div>
                  <div className="step-content-box">
                    <h4>General Rules & Integrity Policies Accepted</h4>
                    <p className="step-time">{formatDate(student.rulesAcceptedAt)} at {formatTime(student.rulesAcceptedAt)}</p>
                  </div>
                </div>

                <div className="timeline-flow-step">
                  <div className={`step-dot ${student.skillSelectedAt ? 'done' : ''}`}>
                    {student.skillSelectedAt ? <Check size={12} strokeWidth={3} /> : '4'}
                  </div>
                  <div className="step-content-box">
                    <h4>Skill Selected: <strong style={{ color: 'var(--text-accent)' }}>{student.selectedSkill || 'None'}</strong></h4>
                    <p className="step-time">{formatDate(student.skillSelectedAt)} at {formatTime(student.skillSelectedAt)}</p>
                  </div>
                </div>

                <div className="timeline-flow-step">
                  <div className={`step-dot ${student.testStartedAt ? 'done' : ''}`}>
                    {student.testStartedAt ? <Check size={12} strokeWidth={3} /> : '5'}
                  </div>
                  <div className="step-content-box">
                    <h4>Test Started (60 Minutes Countdown)</h4>
                    <p className="step-time">{formatDate(student.testStartedAt)} at {formatTime(student.testStartedAt)}</p>
                  </div>
                </div>

                <div className="timeline-flow-step">
                  <div className={`step-dot ${student.testCompletedAt ? (student.assessmentStatus === 'failed' ? 'failed' : 'done') : ''}`}>
                    {student.assessmentStatus === 'failed' ? <XCircle size={12} /> : student.testCompletedAt ? <Check size={12} strokeWidth={3} /> : '6'}
                  </div>
                  <div className="step-content-box">
                    <h4>Test {student.assessmentStatus === 'failed' ? 'Invalidated (Tab Switch)' : 'Completed & Evaluated'}</h4>
                    <p className="step-time">{formatDate(student.testCompletedAt)} at {formatTime(student.testCompletedAt)}</p>
                  </div>
                </div>
              </div>

              {student.tabSwitchDetected && (
                <div className="tab-switch-alert-box animate-fade-in">
                  <ShieldAlert size={22} style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Anti-Cheat Security Alert: Tab Switch Invalidation</strong>
                    <p>The student lost focus on the examination window {student.tabSwitchCount || 1} time(s). The test was automatically terminated.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Test Summary Quad */}
            {assessment && (
              <div className="card" style={{ marginTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Assessment Summary Breakdown</h3>
                <div className="summary-numbers-grid">
                  <div className="summary-tile">
                    <span>QUESTIONS</span>
                    <strong>{assessment.questions?.length || 20}</strong>
                  </div>
                  <div className="summary-tile">
                    <span>ATTEMPTED</span>
                    <strong>{assessment.questionsAttempted || 0}</strong>
                  </div>
                  <div className="summary-tile" style={{ color: 'var(--success-light)' }}>
                    <span>CORRECT</span>
                    <strong>{assessment.questionsCorrect || 0}</strong>
                  </div>
                  <div className="summary-tile" style={{ color: 'var(--error-light)' }}>
                    <span>WRONG</span>
                    <strong>{assessment.questionsWrong || 0}</strong>
                  </div>
                  <div className="summary-tile" style={{ color: 'var(--warning-light)' }}>
                    <span>SKIPPED</span>
                    <strong>{assessment.questionsSkipped || 0}</strong>
                  </div>
                  <div className="summary-tile">
                    <span>TIME TAKEN</span>
                    <strong style={{ fontFamily: 'var(--font-mono)' }}>{formatSeconds(assessment.timeUsed || 0)}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Question-by-Question Code Review */}
        {activeTab === 'code' && assessment?.questions && (
          <div className="code-review-split-layout animate-fade-in">
            {/* Left Question Selector Matrix */}
            <div className="review-questions-sidebar">
              <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
                20 Assessment Questions
              </h3>
              <div className="review-q-list">
                {assessment.questions.map((qResp, i) => {
                  const isSelected = selectedQuestionIdx === i
                  const isCorrect = qResp.result === 'correct'
                  const isWrong = qResp.result === 'wrong'

                  return (
                    <button
                      key={i}
                      type="button"
                      className={`review-q-btn ${isSelected ? 'active' : ''}`}
                      onClick={() => setSelectedQuestionIdx(i)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span className="q-tag-num">Q{String(i + 1).padStart(2, '0')}</span>
                        <span className="q-title-snippet">
                          {qResp.questionId?.title || `Question ${i + 1}`}
                        </span>
                      </div>
                      <span className="q-result-badge">
                        {isCorrect ? (
                          <CheckCircle2 size={16} color="var(--success-light)" />
                        ) : isWrong ? (
                          <XCircle size={16} color="var(--error-light)" />
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--warning-light)' }}>Skipped</span>
                        )}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Right Question Detail & Monaco Viewer */}
            <div className="review-editor-pane">
              <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                    Q{String(selectedQuestionIdx + 1).padStart(2, '0')} — {currentQData?.title || 'Question Details'}
                  </h2>
                  <span className={`badge ${currentQResponse.result === 'correct' ? 'badge-success' : currentQResponse.result === 'wrong' ? 'badge-error' : 'badge-warning'}`}>
                    Status: {currentQResponse.result === 'correct' ? '✓ Correct' : currentQResponse.result === 'wrong' ? '✗ Wrong' : 'Skipped'}
                  </span>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                  {currentQData?.description || 'No description provided.'}
                </p>

                <div className="io-review-strip">
                  <div className="io-review-box">
                    <span className="io-title">Input</span>
                    <pre>{currentQData?.sampleInput || '(None)'}</pre>
                  </div>
                  <div className="io-review-box">
                    <span className="io-title">Expected Output</span>
                    <pre>{currentQData?.sampleOutput || '(None)'}</pre>
                  </div>
                  <div className="io-review-box">
                    <span className="io-title">Student Actual Output</span>
                    <pre>{currentQResponse.output || '(No console output recorded)'}</pre>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <span>Test Cases: <strong>{currentQResponse.testCasesPassed || (currentQResponse.result === 'correct' ? 2 : 0)} / {currentQResponse.testCasesTotal || 2} Passed</strong></span>
                  <span>Attempts: <strong>{currentQResponse.attempts || 1}</strong></span>
                  <span>Time Spent: <strong>{currentQResponse.timeSpent || 60}s</strong></span>
                </div>
              </div>

              {/* Monaco Dark IDE Code Viewer */}
              <div className="student-code-viewer-container">
                <div className="viewer-titlebar">
                  <Terminal size={14} />
                  <span>STUDENT SUBMITTED CODE ({student.selectedSkill || 'Python'})</span>
                </div>
                <div style={{ height: '350px' }}>
                  <Editor
                    height="100%"
                    language={student.selectedSkill?.toLowerCase() || 'python'}
                    value={currentQResponse.code || '// No code was submitted for this question.'}
                    theme="vs-dark"
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      fontSize: 14,
                      fontFamily: "'JetBrains Mono', monospace",
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Concept Performance Analytics */}
        {activeTab === 'analytics' && (
          <div className="card animate-fade-in">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} style={{ color: 'var(--accent-primary-light)' }} />
              <span>{student.selectedSkill} Concept-Level Performance Metrics</span>
            </h3>

            <div className="concepts-bars-grid">
              {Object.entries(conceptStats).map(([concept, data]) => {
                const pct = Math.round((data.correct / data.total) * 100)
                return (
                  <div key={concept} className="concept-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <strong style={{ fontSize: '0.95rem' }}>{concept}</strong>
                      <span style={{ fontWeight: 800, color: pct >= 70 ? 'var(--success-light)' : pct >= 40 ? 'var(--warning-light)' : 'var(--error-light)' }}>
                        {pct}% ({data.correct}/{data.total})
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${pct}%`,
                          background: pct >= 70 ? 'var(--gradient-btn)' : pct >= 40 ? 'linear-gradient(135deg, #f59e0b, #fbbf24)' : 'linear-gradient(135deg, #ef4444, #f87171)'
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* TAB 4: AI Performance Analysis & Training Plan */}
        {activeTab === 'ai' && (
          <div className="ai-feedback-double-grid animate-fade-in">
            {analysis ? (
              <div className="card ai-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div className="ai-icon-circle">
                    <Brain size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem' }}>AI Student Performance Feedback</h3>
                    <span className="badge badge-accent" style={{ marginTop: 2 }}>{analysis.overallLevel} Level</span>
                  </div>
                </div>

                <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  {analysis.summary}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.8rem', color: 'var(--success-light)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <CheckCircle2 size={15} /> Strengths
                    </h4>
                    <ul className="ai-points-list">
                      {analysis.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '0.8rem', color: 'var(--error-light)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <AlertTriangle size={15} /> Weaknesses
                    </h4>
                    <ul className="ai-points-list">
                      {analysis.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.8rem', color: 'var(--accent-primary-light)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>
                    Recommended Training Priorities
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {analysis.recommendedTraining?.map((rec, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                        <span style={{ color: 'var(--accent-primary-light)', fontWeight: 700 }}>{i + 1}.</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="card"><p>AI feedback generating...</p></div>
            )}

            {plan ? (
              <div className="card ai-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div className="ai-icon-circle" style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success-light)' }}>
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem' }}>AI Personalized 4-Week Training Plan</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Custom tailored to weak areas detected in test</p>
                  </div>
                </div>

                <div className="weeks-roadmap-list">
                  {plan.weeks?.map((week, i) => (
                    <div key={i} className="week-plan-card">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          Week {week.week}: {week.focus}
                        </h4>
                        <span className="badge badge-accent" style={{ fontSize: '0.7rem' }}>
                          {week.problemsPerDay} problems / day
                        </span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {week.tasks}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="card"><p>Training plan generating...</p></div>
            )}
          </div>
        )}
      </main>

      <style>{`
        .profile-hero-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          margin-bottom: 1.75rem;
          flex-wrap: wrap;
        }

        .profile-title-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.75rem;
          flex-wrap: wrap;
        }
        .student-full-name {
          font-size: 2rem;
          font-weight: 900;
        }

        .student-meta-tags-grid {
          display: flex;
          gap: 0.85rem;
          flex-wrap: wrap;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .score-summary-quad-box {
          display: flex;
          gap: 1.5rem;
          padding: 1rem 1.75rem;
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-lg);
        }

        .score-mini-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.2rem;
        }
        .mini-lbl {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 700;
          letter-spacing: 0.06em;
        }
        .mini-score {
          font-size: 2.2rem;
          font-weight: 900;
          line-height: 1;
        }
        .mini-sub-val {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .journey-tabs-bar {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--border-subtle);
          padding-bottom: 0.5rem;
          overflow-x: auto;
        }

        .journey-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          padding: 0.75rem 1.25rem;
          font-family: var(--font-sans);
          font-size: 0.92rem;
          font-weight: 600;
          color: var(--text-muted);
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all var(--transition-fast);
          white-space: nowrap;
        }
        .journey-tab-btn:hover {
          color: #fff;
        }
        .journey-tab-btn.active {
          color: var(--accent-primary-light);
          border-bottom-color: var(--accent-primary);
        }

        .timeline-flow-list {
          display: flex;
          flex-direction: column;
          padding-left: 0.5rem;
        }

        .timeline-flow-step {
          display: flex;
          gap: 1.25rem;
          padding-bottom: 1.5rem;
          position: relative;
        }
        .timeline-flow-step:last-child {
          padding-bottom: 0;
        }
        .timeline-flow-step::before {
          content: '';
          position: absolute;
          left: 13px;
          top: 26px;
          bottom: -4px;
          width: 2px;
          background: var(--border-subtle);
        }
        .timeline-flow-step:last-child::before {
          display: none;
        }

        .step-dot {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(30, 41, 59, 0.8);
          border: 2px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          position: relative;
          z-index: 1;
        }
        .step-dot.done {
          background: var(--success);
          border-color: var(--success-light);
          color: #fff;
        }
        .step-dot.failed {
          background: var(--error);
          border-color: var(--error-light);
          color: #fff;
        }

        .step-content-box h4 {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .step-time {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: 0.15rem;
        }

        .tab-switch-alert-box {
          margin-top: 1.5rem;
          padding: 1rem 1.25rem;
          background: var(--error-bg);
          border: 1px solid rgba(239, 68, 68, 0.35);
          border-radius: var(--radius-md);
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
          color: var(--error-light);
        }

        .summary-numbers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 0.75rem;
        }
        .summary-tile {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          padding: 1rem;
          background: rgba(30, 41, 59, 0.4);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
        }
        .summary-tile span {
          font-size: 0.72rem;
          color: var(--text-muted);
          font-weight: 700;
          letter-spacing: 0.05em;
        }
        .summary-tile strong {
          font-size: 1.5rem;
          font-weight: 800;
        }

        /* Code Review Split */
        .code-review-split-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 1.25rem;
        }

        .review-questions-sidebar {
          background: var(--bg-secondary);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xl);
          padding: 1rem;
          max-height: 600px;
          overflow-y: auto;
        }

        .review-q-list {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .review-q-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.65rem 0.85rem;
          background: transparent;
          border: 1px solid transparent;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
          font-family: var(--font-sans);
          width: 100%;
          text-align: left;
        }
        .review-q-btn:hover {
          background: var(--bg-tertiary);
          color: #fff;
        }
        .review-q-btn.active {
          background: var(--accent-glow);
          border-color: var(--accent-primary);
          color: #fff;
          font-weight: 600;
        }

        .q-tag-num {
          font-family: var(--font-mono);
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--accent-primary-light);
        }
        .q-title-snippet {
          font-size: 0.82rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 140px;
        }

        .review-editor-pane {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .io-review-strip {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.65rem;
        }
        .io-review-box {
          background: rgba(30, 41, 59, 0.4);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 0.5rem 0.75rem;
        }
        .io-title {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }
        .io-review-box pre {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          color: var(--text-primary);
          white-space: pre-wrap;
          margin-top: 0.2rem;
        }

        .student-code-viewer-container {
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          overflow: hidden;
          background: #1e1e1e;
        }
        .viewer-titlebar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: #18181b;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }

        /* Concept Analytics */
        .concepts-bars-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
        }
        .concept-card {
          padding: 1rem;
          background: rgba(30, 41, 59, 0.4);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
        }

        /* AI Feedback */
        .ai-feedback-double-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
          gap: 1.5rem;
        }
        .ai-card {
          border: 1px solid rgba(139, 92, 246, 0.3);
        }
        .ai-icon-circle {
          width: 46px;
          height: 46px;
          border-radius: var(--radius-md);
          background: var(--accent-glow);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-primary-light);
        }
        .ai-points-list {
          padding-left: 1.15rem;
          font-size: 0.88rem;
          color: var(--text-secondary);
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .weeks-roadmap-list {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .week-plan-card {
          padding: 1rem;
          background: rgba(30, 41, 59, 0.4);
          border-radius: var(--radius-md);
          border-left: 4px solid var(--accent-primary);
        }

        @media (max-width: 900px) {
          .code-review-split-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
