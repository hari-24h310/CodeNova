import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import {
  Play, Send, ChevronLeft, ChevronRight, Clock,
  AlertTriangle, CheckCircle2, XCircle, Loader2, Sparkles,
  RotateCcw, ShieldAlert, Check, Terminal, FileCode, CheckCheck,
  PanelLeftClose, PanelLeftOpen, X, Users, Settings, BookOpen,
  ChevronDown, ChevronUp, Maximize2, Minimize2
} from 'lucide-react'
import { startAssessment, saveProgress, getQuestions, executeCode, reportTabSwitch } from '../services/api'
import MagneticButton from '../components/MagneticButton'

// Judge0 Language IDs
const LANG_IDS = {
  'C': 50,
  'C++': 54,
  'Java': 62,
  'Python': 71,
  'JavaScript': 63,
  'PHP': 68,
  'C#': 51,
  'SQL': 82,
  'DSA': 71,
  'Web Development': 63,
}

// Monaco Editor Language Modes
const LANG_MONACO = {
  'C': 'c',
  'C++': 'cpp',
  'Java': 'java',
  'Python': 'python',
  'JavaScript': 'javascript',
  'PHP': 'php',
  'C#': 'csharp',
  'SQL': 'sql',
  'DSA': 'python',
  'Web Development': 'html',
}

const BOILERPLATE = {
  'C': `#include <stdio.h>

int main() {
    // Read input and write your solution here.
    return 0;
}`,
  'C++': `#include <iostream>
using namespace std;

int main() {
    // Read input and write your solution here.
    return 0;
}`,
  'Java': `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Read input and write your solution here.
    }
}`,
  'Python': `# Read input and write your solution here
`,
  'JavaScript': `// Read standard input
const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim();
// Parse input and write your solution here.
`,
  'PHP': `<?php
// Read input and write your solution here.
?>`,
  'C#': `using System;

class Program {
    static void Main() {
        // Read input and write your solution here.
    }
}`,
  'SQL': `-- Write your SQL query below
SELECT * FROM table_name;
`,
  'DSA': `# Python DSA Solution
# Read input and write your solution here
`,
  'Web Development': `<!DOCTYPE html>
<html>
<head>
    <style>
        h1 { color: #6366f1; }
        button { padding: 8px 16px; background: #6366f1; color: #fff; }
    </style>
</head>
<body>
    <h1>CodeNova Web</h1>
    <p>Welcome to coding assessment.</p>
    <button>Submit</button>
</body>
</html>`,
}

export default function CodingTest() {
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [skill, setSkill] = useState('')
  const [questions, setQuestions] = useState([])
  const [currentQ, setCurrentQ] = useState(0)
  const [codes, setCodes] = useState([])
  const [statuses, setStatuses] = useState([]) // 'not_attempted' | 'in_progress' | 'passed' | 'wrong' | 'skipped'
  const [results, setResults] = useState([])
  const [outputs, setOutputs] = useState([])
  const [assessmentId, setAssessmentId] = useState(null)
  const [timerStarted, setTimerStarted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(3600)
  const [running, setRunning] = useState(false)
  const [evaluatingSubmit, setEvaluatingSubmit] = useState(false)

  // Layout & Panel States
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [questionPanelCollapsed, setQuestionPanelCollapsed] = useState(false)
  const [outputOpen, setOutputOpen] = useState(false)
  const [customInput, setCustomInput] = useState('')
  const [consoleOutput, setConsoleOutput] = useState('')
  const [consoleError, setConsoleError] = useState('')
  const [consoleType, setConsoleType] = useState('') // 'success' | 'error' | 'info' | 'warning'
  const [failedTabSwitch, setFailedTabSwitch] = useState(false)
  const [showAutoSavedToast, setShowAutoSavedToast] = useState(false)
  const [showParticipantsModal, setShowParticipantsModal] = useState(false)

  const editorRef = useRef(null)
  const autoSaveTimerRef = useRef(null)

  // Initialize student and assessment session
  useEffect(() => {
    const storedStudent = sessionStorage.getItem('codenovaStudent')
    const storedSkill = sessionStorage.getItem('codenovaSkill')
    if (!storedStudent || !storedSkill) {
      navigate('/student/login')
      return
    }

    const s = JSON.parse(storedStudent)
    setStudent(s)
    setSkill(storedSkill)

    // Check for existing localStorage state to resume
    const savedLocal = localStorage.getItem(`codenova_state_${s._id}`)
    if (savedLocal) {
      try {
        const state = JSON.parse(savedLocal)
        if (state.questions && state.questions.length > 0) {
          setQuestions(state.questions)
          setCodes(state.codes || [])
          setStatuses(state.statuses || [])
          setResults(state.results || [])
          setOutputs(state.outputs || [])
          setCurrentQ(state.currentQ || 0)
          setAssessmentId(state.assessmentId || null)
          if (state.timerStarted) {
            setTimerStarted(true)
            const elapsed = Math.floor((Date.now() - state.timerStartTimestamp) / 1000)
            const remaining = Math.max(0, 3600 - elapsed)
            setTimeLeft(remaining)
          }
          return
        }
      } catch (e) {
        console.warn('Could not parse saved local state:', e)
      }
    }

    fetchAndInitAssessment(s, storedSkill)
  }, [navigate])

  const fetchAndInitAssessment = async (stu, selectedSkill) => {
    try {
      const { questions: qs } = await getQuestions(selectedSkill)
      setQuestions(qs)

      const initialCodes = qs.map(q => q.boilerplateCode || BOILERPLATE[selectedSkill] || '')
      const initialStatuses = qs.map(() => 'not_attempted')
      const initialResults = qs.map(() => 'pending')
      const initialOutputs = qs.map(() => '')

      setCodes(initialCodes)
      setStatuses(initialStatuses)
      setResults(initialResults)
      setOutputs(initialOutputs)

      // Start assessment record on server
      const { assessment } = await startAssessment(
        stu._id,
        selectedSkill,
        qs.map(q => q._id)
      )
      setAssessmentId(assessment._id)

      saveToStorage(stu._id, {
        questions: qs,
        codes: initialCodes,
        statuses: initialStatuses,
        results: initialResults,
        outputs: initialOutputs,
        currentQ: 0,
        assessmentId: assessment._id,
        timerStarted: false,
      })
    } catch (err) {
      console.error('Assessment init error:', err)
      setConsoleOutput('Unable to load questions. Please check connection and refresh.')
      setConsoleType('error')
      setOutputOpen(true)
    }
  }

  const saveToStorage = (stuId, data) => {
    const id = stuId || student?._id
    if (id) {
      localStorage.setItem(`codenova_state_${id}`, JSON.stringify(data))
    }
  }

  // Timer Tick
  useEffect(() => {
    if (!timerStarted) return
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          handleAutoTimeExpiry()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timerStarted])

  // Anti-Cheating: Tab Switch Detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && timerStarted && assessmentId && !failedTabSwitch) {
        reportTabSwitch(assessmentId).catch(() => {})
        sessionStorage.setItem('codenovaFailed', 'true')
        setFailedTabSwitch(true)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [timerStarted, assessmentId, failedTabSwitch])

  // Anti-Cheating: Disable Copy / Paste / Cut
  useEffect(() => {
    const blockClipboard = (e) => {
      if (timerStarted) {
        e.preventDefault()
        setConsoleOutput('⚠ Copy, Paste, and Cut operations are disabled to maintain assessment integrity.')
        setConsoleError('')
        setConsoleType('error')
        setOutputOpen(true)
      }
    }

    document.addEventListener('copy', blockClipboard)
    document.addEventListener('paste', blockClipboard)
    document.addEventListener('cut', blockClipboard)

    return () => {
      document.removeEventListener('copy', blockClipboard)
      document.removeEventListener('paste', blockClipboard)
      document.removeEventListener('cut', blockClipboard)
    }
  }, [timerStarted])

  // Periodic Autosave every 8 seconds
  useEffect(() => {
    if (!timerStarted || !assessmentId) return
    autoSaveTimerRef.current = setInterval(() => {
      triggerAutosave(false)
    }, 8000)

    return () => clearInterval(autoSaveTimerRef.current)
  }, [timerStarted, assessmentId, currentQ, codes, statuses, results, timeLeft])

  const triggerAutosave = useCallback(async (showIndicator = true) => {
    if (!assessmentId || !student) return

    saveToStorage(student._id, {
      questions,
      codes,
      statuses,
      results,
      outputs,
      currentQ,
      assessmentId,
      timerStarted: true,
      timerStartTimestamp: Date.now() - (3600 - timeLeft) * 1000
    })

    try {
      await saveProgress(assessmentId, {
        currentQuestion: currentQ,
        code: codes[currentQ],
        timeUsed: 3600 - timeLeft,
        timerStarted: true,
        questions: codes.map((c, i) => ({
          index: i,
          code: c,
          status: statuses[i],
          result: results[i],
        }))
      })
      if (showIndicator) {
        setShowAutoSavedToast(true)
        setTimeout(() => setShowAutoSavedToast(false), 2000)
      }
    } catch (e) {}
  }, [assessmentId, student, questions, codes, statuses, results, outputs, currentQ, timeLeft])

  // Start Test Handler
  const handleStartExam = async () => {
    setTimerStarted(true)
    if (student) {
      saveToStorage(student._id, {
        questions,
        codes,
        statuses,
        results,
        outputs,
        currentQ,
        assessmentId,
        timerStarted: true,
        timerStartTimestamp: Date.now()
      })
    }
    if (assessmentId) {
      await saveProgress(assessmentId, { timerStarted: true, timeUsed: 0 })
    }
  }

  const handleCodeChange = (newCode) => {
    const updated = [...codes]
    updated[currentQ] = newCode || ''
    setCodes(updated)

    if (statuses[currentQ] === 'not_attempted') {
      const updatedStatuses = [...statuses]
      updatedStatuses[currentQ] = 'in_progress'
      setStatuses(updatedStatuses)
    }
  }

  // Check if code is empty or unchanged boilerplate
  const isCodeEmptyOrBoilerplate = (code) => {
    if (!code || !code.trim()) return true
    const currentBoilerplate = (BOILERPLATE[skill] || '').trim()
    if (code.trim() === currentBoilerplate) return true
    return false
  }

  // Run Code Execution
  const handleRunCode = async () => {
    if (running) return
    setRunning(true)
    setOutputOpen(true)
    setConsoleOutput('⏳ Compiling and executing code against test cases...')
    setConsoleError('')
    setConsoleType('info')

    try {
      const q = questions[currentQ]
      const langId = LANG_IDS[skill] || 71
      const currentCode = codes[currentQ] || ''

      // Single execution for "RUN CODE" using user's custom input
      if (skill === 'Web Development') {
        setConsoleOutput('Live preview updated.')
        setConsoleError('')
        setConsoleType('success')
        setRunning(false)
        return
      }

      const res = await executeCode(currentCode, langId, customInput)

      if (res.isHardcoded) {
        setConsoleOutput('')
        setConsoleError(res.stderr || 'HARDCODED OUTPUT NOT ALLOWED\nPlease use the given input and implement the required logic.')
        setConsoleType('warning')
      } else if (res.compile_output) {
        setConsoleOutput('')
        setConsoleError(`COMPILATION ERROR\n\n${res.compile_output}`)
        setConsoleType('error')
      } else if (res.stderr) {
        setConsoleOutput(res.stdout || '')
        setConsoleError(res.stderr)
        setConsoleType('error')
      } else {
        setConsoleOutput(res.stdout || '')
        setConsoleError('')
        setConsoleType('success')
      }
    } catch (err) {
      setConsoleOutput('')
      setConsoleError(`EXECUTION ERROR\n\n${err.message || 'Execution service unreachable'}`)
      setConsoleType('error')
    } finally {
      setRunning(false)
    }
  }

  // SUBMIT BUTTON LOGIC (Strict Rule)
  // If no code -> Mark SKIPPED, move to next.
  // If code -> Evaluate: only PASSED if all test cases pass.
  const handleSubmitAndNext = async () => {
    if (evaluatingSubmit) return
    setEvaluatingSubmit(true)

    const updatedStatuses = [...statuses]
    const updatedResults = [...results]
    const updatedOutputs = [...outputs]
    const currentCode = codes[currentQ] || ''

    if (isCodeEmptyOrBoilerplate(currentCode)) {
      // Empty code: Mark as SKIPPED, Solved count does NOT increase
      updatedStatuses[currentQ] = 'skipped'
      updatedResults[currentQ] = 'pending'
      updatedOutputs[currentQ] = '(Skipped without code)'
    } else {
      // Code was written -> Evaluate
      try {
        const q = questions[currentQ]
        const langId = LANG_IDS[skill] || 71
        if (skill === 'Web Development') {
          // No backend evaluation for HTML/CSS tasks, just visually check later. Mark passed.
          updatedStatuses[currentQ] = 'passed'
          updatedResults[currentQ] = 'correct'
          updatedOutputs[currentQ] = '✓ HTML/CSS Submitted successfully'
        } else {
              const res = await executeCode(currentCode, langId, q.sampleInput || '', q._id, assessmentId, currentQ)

          if (!res.isHardcoded && (res.allPassed || res.status?.id === 3) && !res.compile_output && !res.stderr) {
            // PASSED
            updatedStatuses[currentQ] = 'passed'
            updatedResults[currentQ] = 'correct'
            updatedOutputs[currentQ] = res.stdout || '✓ ALL TEST CASES PASSED'
          } else {
            // WRONG
            updatedStatuses[currentQ] = 'wrong'
            updatedResults[currentQ] = 'wrong'
            updatedOutputs[currentQ] = res.stderr || res.compile_output || 'WRONG ANSWER'
          }
        }
      } catch (e) {
        updatedStatuses[currentQ] = 'wrong'
        updatedResults[currentQ] = 'wrong'
        updatedOutputs[currentQ] = 'Execution error'
      }
    }

    setStatuses(updatedStatuses)
    setResults(updatedResults)
    setOutputs(updatedOutputs)
    setEvaluatingSubmit(false)

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1)
      setConsoleOutput(updatedOutputs[currentQ + 1] || '')
      setConsoleError('')
      setOutputOpen(false)
      triggerAutosave(false)
    } else {
      // Final question submitted -> Proceed to Final Summary
      await triggerAutosave(false)
      proceedToSubmission(updatedStatuses, updatedResults)
    }
  }

  const handleSkipQuestion = () => {
    const updatedStatuses = [...statuses]
    if (updatedStatuses[currentQ] !== 'passed' && updatedStatuses[currentQ] !== 'wrong') {
      updatedStatuses[currentQ] = 'skipped'
      setStatuses(updatedStatuses)
    }

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1)
      setConsoleOutput(outputs[currentQ + 1] || '')
      setConsoleError('')
      setOutputOpen(false)
    }
  }

  const proceedToSubmission = (sts, res) => {
    sessionStorage.setItem('codenovaAssessmentId', assessmentId)
    sessionStorage.setItem('codenovaStatuses', JSON.stringify(sts || statuses))
    sessionStorage.setItem('codenovaResults', JSON.stringify(res || results))
    sessionStorage.setItem('codenovaTimeUsed', String(3600 - timeLeft))
    navigate('/student/submit')
  }

  const handleAutoTimeExpiry = async () => {
    await triggerAutosave(false)
    proceedToSubmission()
  }

  const goToQuestion = (idx) => {
    setCurrentQ(idx)
    setConsoleOutput(outputs[idx] || '')
    setConsoleError('')
    setOutputOpen(false)
  }

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  // Count strictly PASSED questions
  const passedCount = statuses.filter(s => s === 'passed').length
  const wrongCount = statuses.filter(s => s === 'wrong').length
  const skippedCount = statuses.filter(s => s === 'skipped').length
  const remainingCount = questions.length - (passedCount + wrongCount + skippedCount)

  if (failedTabSwitch) {
    return (
      <div className="page-container" style={{ textAlign: 'center' }}>
        <div className="card-elevated animate-scale-in" style={{ maxWidth: 520, borderColor: 'var(--error)', background: 'rgba(239, 68, 68, 0.1)' }}>
          <ShieldAlert size={56} color="var(--error)" style={{ margin: '0 auto 1.25rem' }} />
          <h1 style={{ color: 'var(--error)', fontSize: '2rem', fontWeight: 900, marginBottom: '0.75rem' }}>
            ASSESSMENT FAILED
          </h1>
          <p style={{ color: 'var(--text-primary)', marginBottom: '1.75rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Tab switching or window minimization was detected by CodeNova anti-cheat monitor. Your current assessment has been invalidated.
          </p>
          <button
            className="btn btn-danger btn-lg btn-full"
            onClick={() => {
              if (student) localStorage.removeItem(`codenova_state_${student._id}`)
              sessionStorage.clear()
              navigate('/student/login')
            }}
          >
            <RotateCcw size={18} /> RESTART ASSESSMENT
          </button>
        </div>
      </div>
    )
  }

  if (!questions.length) {
    return (
      <div className="page-container">
        <Loader2 size={36} className="spin-icon" style={{ color: 'var(--accent-primary)' }} />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Loading assessment environment...
        </p>
      </div>
    )
  }

  const q = questions[currentQ] || {}
  const timerWarningClass = timeLeft <= 300 ? 'timer-danger' : timeLeft <= 600 ? 'timer-warning' : 'timer-normal'

  return (
    <div className="ide-layout-root">
      {/* Top Navbar */}
      <header className="ide-topbar">
        <div className="topbar-left">
          <button
            type="button"
            className="btn-toggle-sidebar"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? "Close Sidebar (Expand Code Editor)" : "Open Sidebar"}
          >
            {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            <span className="sidebar-toggle-text">{sidebarOpen ? 'HIDE SIDEBAR' : 'SHOW SIDEBAR'}</span>
          </button>

          <span className="topbar-divider">/</span>

          <div className="brand-badge">
            <Terminal size={18} />
            <span className="brand-title">CODE NOVA</span>
          </div>

          <span className="topbar-divider">/</span>
          <span className="badge badge-accent">{skill}</span>
          <span className="topbar-divider">/</span>

          <span className="question-count-text">
            Q{String(currentQ + 1).padStart(2, '0')} of {questions.length}
          </span>
        </div>

        {/* Live Progress Summary */}
        <div className="topbar-progress-pill">
          <span className="prog-item prog-passed">✓ {passedCount} Solved</span>
          <span className="prog-item prog-wrong">✕ {wrongCount} Wrong</span>
          <span className="prog-item prog-skipped">→ {skippedCount} Skipped</span>
        </div>

        <div className="topbar-right">
          {showAutoSavedToast && (
            <div className="autosave-pill animate-fade-in">
              <Check size={13} /> Autosaved
            </div>
          )}
          <div className={`ide-timer-box ${timerWarningClass}`}>
            <Clock size={18} />
            <span>{formatTimer(timeLeft)}</span>
          </div>
        </div>
      </header>

      {/* Main IDE Workspace */}
      <div className="ide-workspace">
        {/* Collapsible Left Sidebar */}
        <aside className={`ide-question-navigator ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="nav-header">
            <h3>QUESTIONS MATRIX</h3>
            <span className="marks-total-badge">100 Marks</span>
          </div>

          <div className="question-grid-matrix">
            {questions.map((_, i) => {
              const state = statuses[i] || 'not_attempted'
              const isCurrent = currentQ === i

              return (
                <button
                  key={i}
                  type="button"
                  className={`matrix-btn state-${state} ${isCurrent ? 'current' : ''}`}
                  onClick={() => goToQuestion(i)}
                  title={`Question ${i + 1}: ${state.replace('_', ' ')}`}
                >
                  <span className="q-index-num">{String(i + 1).padStart(2, '0')}</span>
                  {state === 'passed' && <Check size={11} className="state-mark" />}
                  {state === 'wrong' && <span className="state-mark wrong-mark">✕</span>}
                  {state === 'skipped' && <span className="state-mark skip-mark">→</span>}
                </button>
              )
            })}
          </div>

          <div className="navigator-legend">
            <div className="legend-item"><span className="legend-dot dot-correct" /> PASSED (Solved)</div>
            <div className="legend-item"><span className="legend-dot dot-wrong" /> WRONG</div>
            <div className="legend-item"><span className="legend-dot dot-skipped" /> SKIPPED</div>
            <div className="legend-item"><span className="legend-dot dot-current" /> CURRENT</div>
            <div className="legend-item"><span className="legend-dot dot-unattempted" /> NOT ATTEMPTED</div>
          </div>

          {/* Quick Sidebar Navigation links */}
          <div className="sidebar-aux-links">
            <button
              type="button"
              className="aux-link-btn"
              onClick={() => setShowParticipantsModal(true)}
            >
              <Users size={14} />
              <span>Participants Roster</span>
            </button>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm finish-test-btn"
            onClick={() => proceedToSubmission()}
          >
            <span>REVIEW & SUBMIT</span>
          </button>
        </aside>

        {/* Center-Right Main Coding Area (Expands to 100% when sidebar is closed) */}
        <div className="ide-main-editor-split">
          {/* Question Description Panel (Natural scroll, collapsible for extra editor height) */}
          <div className={`ide-question-panel ${questionPanelCollapsed ? 'collapsed' : ''}`}>
            <div className="q-header-row">
              <div className="q-header-title-box">
                <button
                  type="button"
                  className="btn-collapse-question"
                  onClick={() => setQuestionPanelCollapsed(!questionPanelCollapsed)}
                  title={questionPanelCollapsed ? "Expand Question Description" : "Collapse Question Description"}
                >
                  {questionPanelCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                </button>
                <h2 className="q-title-text">
                  <span className="q-highlight">Q{String(currentQ + 1).padStart(2, '0')}</span> — {q.title}
                </h2>
              </div>

              <div className="q-meta-badges">
                <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary-light)' }}>
                  {q.concept || 'Beginner Programming'}
                </span>
                <span className="badge" style={{ background: 'var(--success-bg)', color: 'var(--success-light)' }}>
                  {q.difficulty || 'Easy'}
                </span>
                <span className="badge badge-accent">5 Marks</span>
              </div>
            </div>

            {!questionPanelCollapsed && (
              <div className="q-description-content animate-fade-in">
                <p className="problem-text">{q.description}</p>

                <div className="io-samples-grid">
                  {q.sampleInput !== undefined && (
                    <div className="sample-box">
                      <h4>Sample Input</h4>
                      <pre>{q.sampleInput || '(None)'}</pre>
                    </div>
                  )}
                  {q.sampleOutput !== undefined && (
                    <div className="sample-box">
                      <h4>Expected Output</h4>
                      <pre>{q.sampleOutput || '(None)'}</pre>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

          {/* Monaco Editor Container (Maximum Viewport Space) */}
          <div className="ide-editor-container">
            {!timerStarted ? (
              <div className="start-exam-overlay">
                <div className="start-prompt-card animate-scale-in">
                  <div className="start-icon-box">
                    <Play size={36} style={{ marginLeft: 3 }} />
                  </div>
                  <h2>Ready to Begin Assessment?</h2>
                  <p>
                    The 60-minute examination timer will begin once you click Start. Write your code and click Run Code or Submit.
                  </p>
                  <MagneticButton
                    type="button"
                    className="btn btn-primary btn-lg"
                    onClick={handleStartExam}
                    strength={0.3}
                  >
                    <Play size={20} />
                    <span>START ASSESSMENT (60:00)</span>
                  </MagneticButton>
                </div>
              </div>
            ) : (
              <Editor
                height="100%"
                language={LANG_MONACO[skill] || 'plaintext'}
                value={codes[currentQ] || ''}
                onChange={handleCodeChange}
                theme="vs-dark"
                onMount={(editor) => { editorRef.current = editor; }}
                options={{
                  fontSize: 15,
                  fontFamily: "'JetBrains Mono', Consolas, monospace",
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  lineNumbers: 'on',
                  renderLineHighlight: 'all',
                  automaticLayout: true,
                  tabSize: 4,
                  padding: { top: 14, bottom: 14 },
                  contextmenu: false,
                  cursorBlinking: 'smooth',
                  smoothScrolling: true,
                }}
              />
            )}
          </div>

          {/* Closable Run Code Output Drawer (Fix for Point 4) */}
          {(outputOpen || skill === 'Web Development') && (
            <div className={`ide-console-output console-type-${consoleType} animate-fade-in-up`}>
              <div className="console-title-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Terminal size={15} />
                  <span>{skill === 'Web Development' ? 'LIVE PREVIEW' : 'I/O CONSOLE'}</span>
                </div>
                {skill !== 'Web Development' && (
                  <button
                    type="button"
                    className="btn-close-console"
                    onClick={() => setOutputOpen(false)}
                    title="Close Output Panel"
                  >
                    <span>Close ✕</span>
                  </button>
                )}
              </div>

              {skill === 'Web Development' ? (
                <div className="live-preview-box">
                  <iframe 
                    title="Live Preview"
                    srcDoc={codes[currentQ] || ''}
                    sandbox="allow-scripts"
                    style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}
                  />
                </div>
              ) : (
                <div className="io-panels-container">
                  <div className="io-panel">
                    <div className="io-panel-header">INPUT</div>
                    <textarea 
                      className="io-panel-textarea"
                      placeholder="Enter custom standard input here..."
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                    />
                  </div>
                  <div className="io-panel">
                    <div className="io-panel-header">OUTPUT</div>
                    <pre className="console-pre console-stdout">{consoleOutput || '...'}</pre>
                  </div>
                  <div className="io-panel">
                    <div className="io-panel-header" style={{ color: 'var(--error-light)' }}>ERROR</div>
                    <pre className="console-pre console-stderr">{consoleError || '...'}</pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom Action Controls */}
          <footer className="ide-bottom-actions">
            <div className="actions-left">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => goToQuestion(Math.max(0, currentQ - 1))}
                disabled={!timerStarted || currentQ === 0}
              >
                <ChevronLeft size={18} />
                <span>BACK</span>
              </button>

              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleSkipQuestion}
                disabled={!timerStarted}
              >
                <span>SKIP</span>
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="actions-right">
              <MagneticButton
                type="button"
                className="btn btn-secondary run-code-btn"
                onClick={handleRunCode}
                disabled={!timerStarted || running}
                strength={0.2}
              >
                {running ? (
                  <>
                    <Loader2 size={17} className="spin-icon" />
                    <span>Executing...</span>
                  </>
                ) : (
                  <>
                    <Play size={17} />
                    <span>RUN CODE</span>
                  </>
                )}
              </MagneticButton>

              <MagneticButton
                type="button"
                className="btn btn-primary submit-next-btn"
                onClick={handleSubmitAndNext}
                disabled={!timerStarted || evaluatingSubmit}
                strength={0.25}
              >
                {evaluatingSubmit ? (
                  <>
                    <Loader2 size={16} className="spin-icon" />
                    <span>Evaluating...</span>
                  </>
                ) : (
                  <>
                    <span>{currentQ === questions.length - 1 ? 'SUBMIT & FINISH' : 'SUBMIT & NEXT'}</span>
                    <Send size={16} />
                  </>
                )}
              </MagneticButton>
            </div>
          </footer>
        </div>
      </div>

      {/* Participants Modal Accessible from Sidebar */}
      {showParticipantsModal && (
        <div className="modal-overlay" onClick={() => setShowParticipantsModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Department Assessment</h2>
              <button
                type="button"
                onClick={() => setShowParticipantsModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              You are taking the 20-Question Coding Assessment for <strong>Agurchand Manmull Jain College</strong>.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>
              Dr. A. Udhayakumar<br />Associate Professor &amp; Facilitator
            </p>
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
              <div style={{ marginBottom: '0.35rem' }}><strong>Candidate:</strong> {student?.name} ({student?.rollNumber})</div>
              <div style={{ marginBottom: '0.35rem' }}><strong>Department:</strong> {student?.department} • Year {student?.year}-{student?.section}</div>
              <div><strong>Skill:</strong> {skill}</div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .ide-layout-root {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          width: 100vw;
          background: #080c16;
          color: var(--text-primary);
          overflow: visible;
        }

        /* Topbar */
        .ide-topbar {
          height: 52px;
          background: #0b1120;
          border-bottom: 1px solid rgba(148, 163, 184, 0.12);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.25rem;
          flex-shrink: 0;
          z-index: 20;
        }

        .topbar-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .btn-toggle-sidebar {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          border-radius: var(--radius-sm);
          padding: 0.35rem 0.65rem;
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .btn-toggle-sidebar:hover {
          background: var(--accent-glow);
          color: #fff;
          border-color: var(--accent-primary);
        }

        .brand-badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-family: var(--font-heading);
          font-weight: 900;
          font-size: 1.05rem;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: 0.04em;
        }

        .topbar-divider {
          color: var(--text-muted);
          font-weight: 300;
        }

        .question-count-text {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .topbar-progress-pill {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          padding: 0.25rem 0.85rem;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .prog-passed { color: var(--success-light); }
        .prog-wrong { color: var(--error-light); }
        .prog-skipped { color: var(--warning-light); }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .autosave-pill {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.75rem;
          color: var(--success-light);
          background: var(--success-bg);
          padding: 0.2rem 0.6rem;
          border-radius: var(--radius-full);
        }

        .ide-timer-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 0.95rem;
          border-radius: var(--radius-md);
          font-family: var(--font-mono);
          font-size: 1.15rem;
          font-weight: 800;
          border: 1px solid var(--border-subtle);
        }

        .timer-normal {
          background: rgba(30, 41, 59, 0.7);
          color: #f8fafc;
        }
        .timer-warning {
          background: var(--warning-bg);
          color: var(--warning-light);
          border-color: var(--warning);
        }
        .timer-danger {
          background: var(--error-bg);
          color: var(--error-light);
          border-color: var(--error);
          animation: pulseGlow 1.2s infinite;
        }

        /* Workspace Layout */
        .ide-workspace {
          flex: 1;
          display: flex;
          min-height: calc(100vh - 52px);
          overflow: visible;
          position: relative;
        }

        /* Left Navigator */
        .ide-question-navigator {
          width: 230px;
          background: #0b1120;
          border-right: 1px solid rgba(148, 163, 184, 0.1);
          display: flex;
          flex-direction: column;
          padding: 1rem 0.85rem;
          flex-shrink: 0;
          gap: 0.85rem;
          transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1), padding 0.3s ease, opacity 0.25s ease;
        }

        .ide-question-navigator.closed {
          width: 0px;
          padding: 0px;
          overflow: hidden;
          opacity: 0;
          border-right: none;
          pointer-events: none;
        }

        .nav-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .nav-header h3 {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.08em;
        }
        .marks-total-badge {
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--text-accent);
        }

        .question-grid-matrix {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.45rem;
        }

        .matrix-btn {
          height: 36px;
          border-radius: var(--radius-sm);
          border: 1px solid rgba(148, 163, 184, 0.15);
          background: rgba(30, 41, 59, 0.4);
          color: var(--text-secondary);
          font-family: var(--font-mono);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: all var(--transition-fast);
        }

        .matrix-btn:hover {
          background: var(--bg-tertiary);
          border-color: var(--accent-primary);
          color: #fff;
        }

        .matrix-btn.current {
          border-color: var(--accent-primary);
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
          background: rgba(99, 102, 241, 0.25);
          color: #fff;
        }

        .matrix-btn.state-passed {
          background: rgba(16, 185, 129, 0.2);
          border-color: rgba(16, 185, 129, 0.5);
          color: var(--success-light);
        }

        .matrix-btn.state-wrong {
          background: rgba(239, 68, 68, 0.2);
          border-color: rgba(239, 68, 68, 0.4);
          color: var(--error-light);
        }

        .matrix-btn.state-skipped {
          border-color: var(--warning);
          color: var(--warning-light);
          background: rgba(245, 158, 11, 0.15);
        }

        .matrix-btn.state-in_progress {
          border-color: var(--accent-primary-light);
        }

        .state-mark {
          position: absolute;
          top: 2px;
          right: 3px;
          font-size: 0.65rem;
          line-height: 1;
        }

        .navigator-legend {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          padding: 0.65rem;
          background: rgba(15, 23, 42, 0.6);
          border-radius: var(--radius-md);
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }

        .legend-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
        }
        .dot-correct { background: var(--success); }
        .dot-wrong { background: var(--error); }
        .dot-current { background: var(--accent-primary); }
        .dot-skipped { background: var(--warning); }
        .dot-unattempted { background: rgba(148, 163, 184, 0.3); }

        .sidebar-aux-links {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .aux-link-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.45rem 0.65rem;
          background: transparent;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .aux-link-btn:hover {
          background: var(--bg-tertiary);
          color: #fff;
        }

        .finish-test-btn {
          font-weight: 700;
          letter-spacing: 0.03em;
        }

        /* Main Editor Split Area (Takes 100% space) */
        .ide-main-editor-split {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: visible;
          background: #080c16;
          min-width: 0;
        }

        /* Question Panel */
        .ide-question-panel {
          padding: 0.85rem 1.5rem;
          background: #0d1424;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
          max-height: 220px;
          overflow-y: auto;
          flex-shrink: 0;
          transition: max-height 0.3s ease;
        }

        .ide-question-panel.collapsed {
          max-height: 52px;
          overflow: hidden;
        }

        .q-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .q-header-title-box {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .btn-collapse-question {
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid var(--border-subtle);
          color: var(--text-muted);
          border-radius: var(--radius-sm);
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .btn-collapse-question:hover {
          color: #fff;
          border-color: var(--accent-primary);
        }

        .q-title-text {
          font-size: 1.1rem;
          font-weight: 800;
        }
        .q-highlight {
          color: var(--accent-primary-light);
        }

        .q-meta-badges {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .problem-text {
          font-size: 0.92rem;
          color: var(--text-secondary);
          line-height: 1.55;
          margin-top: 0.5rem;
          margin-bottom: 0.65rem;
        }

        .io-samples-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 0.75rem;
        }

        .sample-box {
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: var(--radius-md);
          padding: 0.5rem 0.75rem;
        }
        .sample-box h4 {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-muted);
          margin-bottom: 0.2rem;
        }
        .sample-box pre {
          font-family: var(--font-mono);
          font-size: 0.85rem;
          color: var(--text-primary);
          white-space: pre-wrap;
        }

        .restricted-warning-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
          padding: 0.4rem 0.75rem;
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: var(--radius-sm);
          color: var(--warning-light);
          font-size: 0.8rem;
        }

        /* Monaco Container */
        .ide-editor-container {
          flex: 1 1 auto;
          height: clamp(420px, 68vh, 900px);
          position: relative;
          min-height: 420px;
          background: #1e1e1e;
        }

        .start-exam-overlay {
          position: absolute;
          inset: 0;
          background: rgba(8, 12, 22, 0.92);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 30;
          padding: 1.5rem;
        }

        .start-prompt-card {
          background: #0f172a;
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-xl);
          padding: 2.5rem;
          max-width: 480px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          box-shadow: var(--shadow-lg), 0 0 50px rgba(99, 102, 241, 0.3);
        }

        .start-icon-box {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: var(--gradient-primary);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 30px rgba(99, 102, 241, 0.5);
          animation: float 4s ease-in-out infinite;
        }

        .start-prompt-card h2 {
          font-size: 1.5rem;
          font-weight: 800;
        }
        .start-prompt-card p {
          font-size: 0.9rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        /* Closable Output Drawer */
        .ide-console-output {
          height: clamp(180px, 28vh, 360px);
          min-height: 180px;
          max-height: 360px;
          overflow: hidden;
          resize: vertical;
          padding: 0.75rem 1.25rem;
          border-top: 1px solid rgba(148, 163, 184, 0.2);
          flex-shrink: 0;
          position: relative;
        }

        .console-title-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          margin-bottom: 0.5rem;
          opacity: 0.9;
        }

        .btn-close-console {
          background: rgba(148, 163, 184, 0.15);
          border: 1px solid rgba(148, 163, 184, 0.25);
          color: var(--text-primary);
          border-radius: var(--radius-sm);
          padding: 0.2rem 0.55rem;
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .btn-close-console:hover {
          background: rgba(239, 68, 68, 0.3);
          border-color: var(--error);
          color: #fff;
        }

        .console-pre {
          font-family: var(--font-mono);
          font-size: 0.85rem;
          white-space: pre-wrap;
          line-height: 1.45;
        }

        .console-stdout {
          color: var(--success-light);
        }
        .console-stderr {
          color: var(--error-light);
          margin-top: 0.35rem;
        }

        .console-type-success {
          background: rgba(16, 185, 129, 0.12);
          border-top-color: var(--success);
        }
        .console-type-error {
          background: rgba(239, 68, 68, 0.12);
          border-top-color: var(--error);
        }
        .console-type-warning {
          background: rgba(245, 158, 11, 0.12);
          border-top-color: var(--warning);
        }
        .console-type-info {
          background: #0f172a;
        }

        .io-panels-container {
          display: flex;
          gap: 1rem;
          height: calc(100% - 24px);
          min-height: 120px;
        }
        
        .io-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: var(--radius-sm);
          padding: 0.5rem;
          overflow-y: auto;
        }
        
        .io-panel-header {
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--text-muted);
          margin-bottom: 0.35rem;
          letter-spacing: 0.05em;
        }

        .io-panel-textarea {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-family: var(--font-mono);
          font-size: 0.85rem;
          resize: none;
          outline: none;
        }
        
        .live-preview-box {
          height: 300px;
          border-radius: var(--radius-sm);
          overflow: hidden;
          border: 1px solid rgba(148, 163, 184, 0.2);
        }

        /* Bottom Action Bar */
        .ide-bottom-actions {
          height: 56px;
          background: #0b1120;
          border-top: 1px solid rgba(148, 163, 184, 0.12);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.25rem;
          flex-shrink: 0;
        }

        .actions-left,
        .actions-right {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .run-code-btn {
          font-weight: 700;
        }
        .submit-next-btn {
          padding: 0.65rem 1.6rem;
          font-weight: 700;
        }

        .spin-icon {
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .ide-editor-container {
            height: 58vh;
            min-height: 360px;
          }

          .ide-console-output {
            height: 220px;
            min-height: 160px;
          }

          .io-panels-container {
            flex-direction: column;
            gap: 0.5rem;
          }

          .io-panel {
            min-height: 92px;
          }

          .ide-question-navigator {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            z-index: 40;
            box-shadow: var(--shadow-lg);
          }
          .sidebar-toggle-text {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}
