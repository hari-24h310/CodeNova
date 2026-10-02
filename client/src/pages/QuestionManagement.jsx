import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Users, BarChart3, Trophy, BookOpen, LogOut, Plus, Trash2,
  Edit3, Search, Sparkles, Brain, Check, X, Loader2, FileCode, CheckCircle2
} from 'lucide-react'
import { getAllQuestions, addQuestion, updateQuestion, deleteQuestion, generateAiQuestions } from '../services/api'

const SKILLS = ['Python', 'Java', 'C++', 'C', 'JavaScript', 'Web Development', 'DSA', 'SQL', 'PHP', 'C#']
const DIFFS = ['Easy', 'Medium', 'Hard', 'Advanced']
const CONCEPTS = ['Basic I/O', 'Conditions', 'Loops', 'Arrays', 'Strings', 'Logic', 'Searching', 'Sorting', 'Recursion', 'Functions', 'Data Structures']

export default function QuestionManagement() {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [filterSkill, setFilterSkill] = useState('')
  const [filterDiff, setFilterDiff] = useState('')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)

  // AI Generator Modal State
  const [showAiModal, setShowAiModal] = useState(false)
  const [aiSkill, setAiSkill] = useState('Python')
  const [aiDiff, setAiDiff] = useState('Medium')
  const [aiConcept, setAiConcept] = useState('Arrays')
  const [aiCount, setAiCount] = useState(5)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiGeneratedList, setAiGeneratedList] = useState([])

  const [form, setForm] = useState({
    title: '',
    description: '',
    skill: 'Python',
    concept: 'Arrays',
    difficulty: 'Easy',
    sampleInput: '',
    sampleOutput: '',
    marks: 5,
    expectedTime: 3,
    boilerplateCode: '',
    testCases: [{ input: '', expectedOutput: '', isHidden: false }]
  })

  useEffect(() => {
    if (!sessionStorage.getItem('codenovaAdmin')) {
      navigate('/admin/login')
      return
    }
    loadQuestions()
  }, [filterSkill, filterDiff])

  const loadQuestions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterSkill) params.set('skill', filterSkill)
      if (filterDiff) params.set('difficulty', filterDiff)
      if (search) params.set('search', search)

      const data = await getAllQuestions(params.toString())
      setQuestions(data.questions || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveQuestion = async () => {
    if (!form.title || !form.description) {
      alert('Please provide question title and description.')
      return
    }

    try {
      const payload = {
        ...form,
      }

      if (editingId) {
        await updateQuestion(editingId, payload)
      } else {
        await addQuestion(payload)
      }

      setShowModal(false)
      setEditingId(null)
      resetForm()
      loadQuestions()
    } catch (err) {
      alert('Save failed: ' + err.message)
    }
  }

  const handleEdit = (q) => {
    setEditingId(q._id)
    setForm({
      title: q.title,
      description: q.description,
      skill: q.skill,
      concept: q.concept,
      difficulty: q.difficulty,
      sampleInput: q.sampleInput || '',
      sampleOutput: q.sampleOutput || '',
      marks: q.marks || 5,
      expectedTime: q.expectedTime || 3,
      boilerplateCode: q.boilerplateCode || '',
      testCases: q.testCases?.length ? q.testCases : [{ input: '', expectedOutput: '', isHidden: false }]
    })
    setShowModal(true)
  }

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete question "${title}"?`)) return
    try {
      await deleteQuestion(id)
      loadQuestions()
    } catch (err) {
      alert('Delete failed: ' + err.message)
    }
  }

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      skill: 'Python',
      concept: 'Arrays',
      difficulty: 'Easy',
      sampleInput: '',
      sampleOutput: '',
      marks: 5,
      expectedTime: 3,
      boilerplateCode: '',
      testCases: [{ input: '', expectedOutput: '', isHidden: false }]
    })
  }

  const addTestCase = () => {
    setForm({
      ...form,
      testCases: [...form.testCases, { input: '', expectedOutput: '', isHidden: true }]
    })
  }

  // AI Question Generation Handler
  const handleGenerateAi = async () => {
    setAiGenerating(true)
    try {
      const res = await generateAiQuestions({
        skill: aiSkill,
        difficulty: aiDiff,
        concept: aiConcept,
        count: aiCount
      })
      setAiGeneratedList(res.questions || [])
    } catch (err) {
      alert('AI Generation error: ' + err.message)
    } finally {
      setAiGenerating(false)
    }
  }

  // Add all or single AI generated question
  const handleAcceptAiQuestion = async (qItem) => {
    try {
      await addQuestion(qItem)
      alert(`Question "${qItem.title}" added to question pool!`)
      setAiGeneratedList(prev => prev.filter(item => item.title !== qItem.title))
      loadQuestions()
    } catch (err) {
      alert('Failed to save question: ' + err.message)
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
          <Link to="/admin/students" className="admin-nav-item">
            <Users size={18} />
            <span>Students</span>
          </Link>
          <Link to="/admin/questions" className="admin-nav-item active">
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

      {/* Main Panel */}
      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h1>Question Management</h1>
            <p>{questions.length} active assessment problems in question pool (5 Marks Each)</p>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => { setShowAiModal(true); setAiGeneratedList([]); }}
            >
              <Sparkles size={16} />
              <span>AI Question Generator</span>
            </button>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => { resetForm(); setEditingId(null); setShowModal(true); }}
            >
              <Plus size={16} />
              <span>Add Question</span>
            </button>
          </div>
        </header>

        {/* Filter Controls */}
        <div className="filter-controls-row">
          <select
            className="input select-filter"
            style={{ width: 160 }}
            value={filterSkill}
            onChange={(e) => setFilterSkill(e.target.value)}
          >
            <option value="">All Skills</option>
            {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            className="input select-filter"
            style={{ width: 150 }}
            value={filterDiff}
            onChange={(e) => setFilterDiff(e.target.value)}
          >
            <option value="">All Difficulties</option>
            {DIFFS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
            <Search size={16} className="search-icon-pos" />
            <input
              className="input search-input-field"
              placeholder="Search by question title or concept..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadQuestions()}
            />
          </div>

          <button type="button" className="btn btn-secondary btn-sm" onClick={loadQuestions}>
            Search
          </button>
        </div>

        {/* Question Bank Table */}
        <div className="table-container animate-fade-in-up">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Skill</th>
                <th>Concept</th>
                <th>Difficulty</th>
                <th>Marks</th>
                <th>Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q._id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {q.title}
                  </td>
                  <td><span className="badge badge-accent">{q.skill}</span></td>
                  <td style={{ fontSize: '0.85rem' }}>{q.concept}</td>
                  <td>
                    <span className="badge" style={{
                      background: q.difficulty === 'Easy' ? 'var(--success-bg)' : q.difficulty === 'Medium' ? 'var(--warning-bg)' : q.difficulty === 'Hard' ? 'var(--error-bg)' : 'rgba(139, 92, 246, 0.2)',
                      color: q.difficulty === 'Easy' ? 'var(--success-light)' : q.difficulty === 'Medium' ? 'var(--warning-light)' : q.difficulty === 'Hard' ? 'var(--error-light)' : '#c084fc'
                    }}>
                      {q.difficulty}
                    </span>
                  </td>
                  <td><strong>{q.marks || 5}</strong></td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{q.expectedTime || 3}m</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleEdit(q)}
                        title="Edit Question"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm delete-btn"
                        onClick={() => handleDelete(q._id, q.title)}
                        title="Delete Question"
                        style={{ color: 'var(--error-light)' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!questions.length && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No questions found in question bank matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal: Manual Add / Edit Question */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 720, maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{editingId ? 'Edit Question' : 'Add Question'}</h2>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="input-group">
                  <label>Question Title</label>
                  <input
                    className="input"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Reverse a Linked List"
                  />
                </div>

                <div className="input-group">
                  <label>Problem Statement / Description</label>
                  <textarea
                    className="input"
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Detailed problem statement including input constraints..."
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div className="input-group">
                    <label>Skill / Language</label>
                    <select
                      className="input"
                      value={form.skill}
                      onChange={(e) => setForm({ ...form, skill: e.target.value })}
                    >
                      {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="input-group">
                    <label>Concept</label>
                    <input
                      className="input"
                      value={form.concept}
                      onChange={(e) => setForm({ ...form, concept: e.target.value })}
                      placeholder="e.g. Arrays"
                    />
                  </div>

                  <div className="input-group">
                    <label>Difficulty</label>
                    <select
                      className="input"
                      value={form.difficulty}
                      onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                    >
                      {DIFFS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="input-group">
                    <label>Sample Input</label>
                    <textarea
                      className="input"
                      rows={2}
                      value={form.sampleInput}
                      onChange={(e) => setForm({ ...form, sampleInput: e.target.value })}
                      placeholder="e.g. 5 10 15"
                    />
                  </div>
                  <div className="input-group">
                    <label>Expected Output</label>
                    <textarea
                      className="input"
                      rows={2}
                      value={form.sampleOutput}
                      onChange={(e) => setForm({ ...form, sampleOutput: e.target.value })}
                      placeholder="e.g. 30"
                    />
                  </div>
                </div>

                {/* Test Cases Sub-Form */}
                <div style={{ marginTop: '0.5rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                    Evaluation Test Cases
                  </label>
                  {form.testCases.map((tc, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                      <input
                        className="input"
                        placeholder="Test input"
                        value={tc.input}
                        onChange={(e) => {
                          const updated = [...form.testCases]
                          updated[idx].input = e.target.value
                          setForm({ ...form, testCases: updated })
                        }}
                      />
                      <input
                        className="input"
                        placeholder="Expected output"
                        value={tc.expectedOutput}
                        onChange={(e) => {
                          const updated = [...form.testCases]
                          updated[idx].expectedOutput = e.target.value
                          setForm({ ...form, testCases: updated })
                        }}
                      />
                      <label style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={tc.isHidden}
                          onChange={(e) => {
                            const updated = [...form.testCases]
                            updated[idx].isHidden = e.target.checked
                            setForm({ ...form, testCases: updated })
                          }}
                        /> Hidden
                      </label>
                    </div>
                  ))}
                  <button type="button" className="btn btn-ghost btn-sm" onClick={addTestCase}>
                    + Add Another Test Case
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="button" className="btn btn-primary" style={{ flex: 1.2 }} onClick={handleSaveQuestion}>
                    {editingId ? 'Update Question' : 'Save Question to Pool'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: AI Question Generator (Requirement #35) */}
        {showAiModal && (
          <div className="modal-overlay" onClick={() => setShowAiModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 840, maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary-light)' }}>
                    <Brain size={22} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>AI Question Generator</h2>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Generate balanced coding questions with automated test cases</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Controls */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', padding: '1.25rem', background: 'rgba(30, 41, 59, 0.5)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '1.25rem' }}>
                <div className="input-group">
                  <label>Skill</label>
                  <select className="input" value={aiSkill} onChange={(e) => setAiSkill(e.target.value)}>
                    {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="input-group">
                  <label>Difficulty</label>
                  <select className="input" value={aiDiff} onChange={(e) => setAiDiff(e.target.value)}>
                    {DIFFS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div className="input-group">
                  <label>Concept</label>
                  <select className="input" value={aiConcept} onChange={(e) => setAiConcept(e.target.value)}>
                    {CONCEPTS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="input-group">
                  <label>Number of Questions</label>
                  <select className="input" value={aiCount} onChange={(e) => setAiCount(parseInt(e.target.value, 10))}>
                    <option value={1}>1 Question</option>
                    <option value={3}>3 Questions</option>
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-primary btn-lg btn-full"
                onClick={handleGenerateAi}
                disabled={aiGenerating}
                style={{ marginBottom: '1.5rem' }}
              >
                {aiGenerating ? (
                  <>
                    <Loader2 size={18} className="spin-icon" />
                    <span>Generating Balanced Questions with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>GENERATE QUESTIONS WITH AI</span>
                  </>
                )}
              </button>

              {/* Generated Question Review Cards */}
              {aiGeneratedList.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', color: 'var(--text-accent)' }}>
                    Review Generated Questions ({aiGeneratedList.length}):
                  </h3>

                  {aiGeneratedList.map((qGen, idx) => (
                    <div key={idx} style={{ padding: '1.25rem', background: 'rgba(30, 41, 59, 0.6)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.5rem' }}>
                        <div>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 800 }}>{qGen.title}</h4>
                          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.25rem' }}>
                            <span className="badge badge-accent">{qGen.skill}</span>
                            <span className="badge badge-info">{qGen.concept}</span>
                            <span className="badge badge-warning">{qGen.difficulty}</span>
                            <span className="badge">5 Marks</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-success btn-sm"
                          onClick={() => handleAcceptAiQuestion(qGen)}
                        >
                          <Check size={14} /> Add to Pool
                        </button>
                      </div>

                      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                        {qGen.description}
                      </p>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                        <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                          <strong style={{ color: 'var(--text-muted)' }}>Input:</strong>
                          <pre style={{ fontFamily: 'var(--font-mono)', marginTop: 2 }}>{qGen.sampleInput}</pre>
                        </div>
                        <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                          <strong style={{ color: 'var(--text-muted)' }}>Output:</strong>
                          <pre style={{ fontFamily: 'var(--font-mono)', marginTop: 2 }}>{qGen.sampleOutput}</pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <style>{`
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

        .filter-controls-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
        }

        .select-filter {
          padding: 0.65rem 0.85rem;
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
