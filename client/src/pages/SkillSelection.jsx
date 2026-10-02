import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Code2, Globe, Database, Braces, Hash, FileCode, Cpu, Layers } from 'lucide-react'

const skillsList = [
  { id: 'Python', name: 'Python', icon: <Braces size={28} />, color: '#10b981', desc: 'Dynamic scripting & data manipulation' },
  { id: 'Java', name: 'Java', icon: <FileCode size={28} />, color: '#f97316', desc: 'Enterprise OOP & Platform independent' },
  { id: 'C++', name: 'C++', icon: <Code2 size={28} />, color: '#6366f1', desc: 'High performance & STL algorithms' },
  { id: 'C', name: 'C', icon: <Cpu size={28} />, color: '#3b82f6', desc: 'Low-level structured systems programming' },
  { id: 'JavaScript', name: 'JavaScript', icon: <Braces size={28} />, color: '#eab308', desc: 'Modern ECMAScript & Full-stack scripting' },
  { id: 'Web Development', name: 'Web Development — HTML + CSS', icon: <Globe size={28} />, color: '#ec4899', desc: 'Semantic UI structure & modern layout styling' },
  { id: 'DSA', name: 'DSA', icon: <Layers size={28} />, color: '#8b5cf6', desc: 'Data Structures, Trees, Graphs & Algorithms' },
  { id: 'SQL', name: 'SQL', icon: <Database size={28} />, color: '#06b6d4', desc: 'Relational databases, Joins & Aggregations' },
  { id: 'PHP', name: 'PHP', icon: <FileCode size={28} />, color: '#a855f7', desc: 'Server-side web scripting & backend APIs' },
  { id: 'C#', name: 'C#', icon: <Hash size={28} />, color: '#d946ef', desc: 'Modern .NET typed object-oriented framework' },
]

export default function SkillSelection() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState('Python')

  useEffect(() => {
    const stored = sessionStorage.getItem('codenovaStudent')
    const rules = sessionStorage.getItem('codenovaRulesAccepted')
    if (!stored || !rules) {
      navigate('/student/login')
    }
  }, [navigate])

  const handleConfirm = () => {
    if (!selected) return
    sessionStorage.setItem('codenovaSkill', selected)
    navigate('/student/test')
  }

  return (
    <div className="page-container" style={{ justifyContent: 'flex-start', paddingTop: '2.5rem', paddingBottom: '3.5rem' }}>
      <div style={{ maxWidth: 880, width: '100%' }}>
        <button className="btn-back-link" onClick={() => navigate('/student/rules')}>
          <ArrowLeft size={16} />
          <span>Back to Rules</span>
        </button>

        <div className="skill-header animate-fade-in-up">
          <h1 className="skill-title">SELECT YOUR SKILL</h1>
          <p className="skill-subtitle">
            Choose exactly one skill for your 20-question coding assessment
          </p>
        </div>

        {/* 10 Skill Cards Grid */}
        <div className="skill-cards-grid stagger-children">
          {skillsList.map((skill) => {
            const isSelected = selected === skill.id
            return (
              <button
                key={skill.id}
                type="button"
                className={`skill-glass-card ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelected(skill.id)}
                style={{ '--skill-accent': skill.color }}
              >
                <div className="selection-indicator">
                  {isSelected && <Check size={14} strokeWidth={3} />}
                </div>

                <div className="skill-icon-container" style={{ color: skill.color }}>
                  {skill.icon}
                </div>

                <div className="skill-info-block">
                  <h3 className="skill-name">{skill.name}</h3>
                  <p className="skill-desc-text">{skill.desc}</p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="skill-bottom-action animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="selected-preview-badge">
            <span>Selected Language:</span>
            <strong style={{ color: '#fff' }}>{selected}</strong>
          </div>

          <button
            className="btn btn-primary btn-lg continue-skill-btn"
            onClick={handleConfirm}
            disabled={!selected}
          >
            <span>CONTINUE TO TEST →</span>
          </button>
        </div>
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
          margin-bottom: 1.5rem;
          transition: color var(--transition-fast);
        }
        .btn-back-link:hover {
          color: #fff;
        }

        .skill-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .skill-title {
          font-size: 2.25rem;
          font-weight: 900;
          letter-spacing: -0.02em;
        }
        .skill-subtitle {
          font-size: 0.95rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
        }

        .skill-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(195px, 1fr));
          gap: 1.15rem;
        }

        .skill-glass-card {
          background: var(--bg-card);
          border: 1.5px solid var(--border-subtle);
          border-radius: var(--radius-xl);
          padding: 1.5rem 1.15rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.85rem;
          cursor: pointer;
          transition: all var(--transition-base);
          position: relative;
          backdrop-filter: blur(16px);
          color: var(--text-primary);
          font-family: var(--font-sans);
          overflow: hidden;
        }

        .skill-glass-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--skill-accent) 15%, transparent), transparent 70%);
          opacity: 0;
          transition: opacity var(--transition-base);
        }

        .skill-glass-card:hover {
          border-color: var(--skill-accent);
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), 0 0 24px color-mix(in srgb, var(--skill-accent) 25%, transparent);
        }
        .skill-glass-card:hover::before {
          opacity: 1;
        }

        .skill-glass-card.selected {
          border-color: var(--skill-accent);
          background: color-mix(in srgb, var(--skill-accent) 10%, var(--bg-card));
          box-shadow: 0 0 30px color-mix(in srgb, var(--skill-accent) 35%, transparent);
          transform: translateY(-3px) scale(1.02);
        }

        .selection-indicator {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 1.5px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-base);
        }
        .skill-glass-card.selected .selection-indicator {
          background: var(--skill-accent);
          border-color: var(--skill-accent);
          color: #fff;
        }

        .skill-icon-container {
          width: 60px;
          height: 60px;
          border-radius: var(--radius-lg);
          background: color-mix(in srgb, var(--skill-accent) 14%, transparent);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-base);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        }

        .skill-glass-card:hover .skill-icon-container,
        .skill-glass-card.selected .skill-icon-container {
          transform: scale(1.1);
        }

        .skill-info-block {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .skill-name {
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .skill-desc-text {
          font-size: 0.76rem;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .skill-bottom-action {
          margin-top: 2.25rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .selected-preview-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 1.1rem;
          background: rgba(30, 41, 59, 0.7);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .continue-skill-btn {
          min-width: 280px;
          font-size: 1rem;
          letter-spacing: 0.04em;
        }

        @media (max-width: 640px) {
          .skill-cards-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  )
}
