import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Code2, Shield, Sparkles, Terminal, ChevronRight, Award, Laptop, Clock, Database, ArrowRight } from 'lucide-react'
import Preloader from '../components/Preloader'
import CursorGlow from '../components/CursorGlow'
import MagneticButton from '../components/MagneticButton'

export default function Landing() {
  const navigate = useNavigate()
  const [hoveredCard, setHoveredCard] = useState(null)
  const [showPreloader, setShowPreloader] = useState(true)

  useEffect(() => {
    // Check if preloader was shown in this session
    const shown = sessionStorage.getItem('codenovaPreloaderShown')
    if (shown) {
      setShowPreloader(false)
    }
  }, [])

  const handlePreloaderFinish = () => {
    sessionStorage.setItem('codenovaPreloaderShown', 'true')
    setShowPreloader(false)
  }

  return (
    <div className="landing-page-container">
      {/* Preloader Animation with bouncing vertical equalizer bars */}
      {showPreloader && <Preloader onFinish={handlePreloaderFinish} />}

      {/* Ambient Cursor Glow Spotlight */}
      <CursorGlow />

      {/* Background Matrix / Grid & Animated Glows */}
      <div className="landing-grid-bg" />
      <div className="landing-glow-orb orb-primary" />
      <div className="landing-glow-orb orb-secondary" />
      <div className="landing-glow-orb orb-accent" />

      {/* Floating abstract code lines */}
      <div className="code-lines-ambient">
        <span style={{ top: '15%', left: '8%' }}>&lt;CodeNova /&gt;</span>
        <span style={{ top: '35%', right: '10%' }}>while (skills.improving)</span>
        <span style={{ bottom: '25%', left: '12%' }}>import &#123; Excellence &#125; from 'AMJC'</span>
        <span style={{ bottom: '15%', right: '15%' }}>O(1) Evaluation</span>
      </div>

      <div className="landing-content">
        {/* College & Department Badge */}
        <div className="institution-badge animate-fade-in-up">
          <div className="institution-crest">AMJC</div>
          <div className="institution-text">
            <span className="inst-name">AGURCHAND MANMULL JAIN COLLEGE</span>
            <span className="dept-name">DEPARTMENT OF BACHELOR OF COMPUTER APPLICATION</span>
              <span className="dept-name">Dr. A. Udhayakumar<br />Associate Professor &amp; Facilitator</span>
          </div>
        </div>

        {/* Hero Branding */}
        <div className="hero-section animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="hero-logo-box">
            <Terminal size={40} strokeWidth={2} />
          </div>
          <h1 className="hero-title text-reveal">
            <span className="text-reveal-item">CODE <span className="title-gradient">NOVA</span></span>
          </h1>
          <p className="hero-tagline">Department Coding Skill Assessment</p>
          <p className="hero-desc">
            An advanced coding evaluation platform crafted for BCA students to benchmark programming proficiency, problem solving, and algorithmic mastery.
          </p>

          <div style={{ marginTop: '1.25rem' }}>
            <MagneticButton
              type="button"
              className="btn btn-primary btn-lg enter-main-btn"
              onClick={() => navigate('/student/login')}
              strength={0.25}
            >
              <span>ENTER CODE NOVA</span>
              <ArrowRight size={18} />
            </MagneticButton>
          </div>
        </div>

        {/* Portals Entry Cards */}
        <div className="portal-cards animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {/* Student Portal Card */}
          <button
            className={`portal-card student-card ${hoveredCard === 'student' ? 'active' : ''}`}
            onClick={() => navigate('/student/login')}
            onMouseEnter={() => setHoveredCard('student')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="card-ambient-glow" />
            <div className="card-top-icon">
              <Code2 size={30} />
            </div>
            <div className="card-text">
              <h2>STUDENT LOGIN</h2>
              <p>Enter your roll number to begin your 20-question coding assessment</p>
            </div>
            <div className="card-action-bar">
              <span>Start Assessment</span>
              <ChevronRight size={18} className="arrow-icon" />
            </div>
          </button>

          {/* Admin Portal Card */}
          <button
            className={`portal-card admin-card ${hoveredCard === 'admin' ? 'active' : ''}`}
            onClick={() => navigate('/admin/login')}
            onMouseEnter={() => setHoveredCard('admin')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="card-ambient-glow" />
            <div className="card-top-icon admin-icon">
              <Shield size={30} />
            </div>
            <div className="card-text">
              <h2>ADMIN LOGIN</h2>
              <p>Access department analytics, live student journeys, AI feedback & rankings</p>
            </div>
            <div className="card-action-bar">
              <span>Admin Console</span>
              <ChevronRight size={18} className="arrow-icon" />
            </div>
          </button>
        </div>

        {/* Feature Highlights - Glass Cards */}
        <div className="features-grid animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="feature-glass-card">
            <Sparkles size={24} className="feature-icon" />
            <div className="feature-text">
              <h3>20 Questions</h3>
              <p>Beginner Friendly</p>
            </div>
          </div>
          <div className="feature-glass-card">
            <Clock size={24} className="feature-icon" />
            <div className="feature-text">
              <h3>60 Minutes</h3>
              <p>Duration</p>
            </div>
          </div>
          <div className="feature-glass-card">
            <Award size={24} className="feature-icon" />
            <div className="feature-text">
              <h3>100 Total Marks</h3>
              <p>5 Marks / Question</p>
            </div>
          </div>
          <div className="feature-glass-card">
            <Laptop size={24} className="feature-icon" />
            <div className="feature-text">
              <h3>10 Skills</h3>
              <p>Python, C, C++, Java, JS, Web, SQL...</p>
            </div>
          </div>
        </div>

        {/* HOD & Guidance Note */}
        <div className="leadership-card animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="leadership-content">
            <span className="hod-label">ACADEMIC SUPERVISION & GUIDANCE</span>
            <h3 className="hod-name">Dr. A. Udhayakumar</h3>
            <span className="hod-title">Associate Professor &amp; Facilitator</span>
            <p className="hod-note">
              "Fostering algorithmic excellence, software craftsmanship, and real-world coding capability for tomorrow's technologists."
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .landing-page-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 1.5rem;
          position: relative;
          overflow: hidden;
          background: radial-gradient(circle at 50% 10%, #0d1527 0%, var(--bg-primary) 70%);
        }

        .landing-grid-bg {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(to right, rgba(99, 102, 241, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.04) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%);
          pointer-events: none;
        }

        .landing-glow-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
          opacity: 0.45;
          animation: float 8s ease-in-out infinite alternate;
        }
        .orb-primary {
          width: 450px;
          height: 450px;
          background: rgba(99, 102, 241, 0.25);
          top: -10%;
          left: 15%;
        }
        .orb-secondary {
          width: 400px;
          height: 400px;
          background: rgba(139, 92, 246, 0.22);
          bottom: -10%;
          right: 15%;
          animation-delay: -3s;
        }
        .orb-accent {
          width: 300px;
          height: 300px;
          background: rgba(236, 72, 153, 0.18);
          top: 40%;
          right: 5%;
          animation-delay: -5s;
        }

        .code-lines-ambient {
          position: absolute;
          inset: 0;
          pointer-events: none;
          font-family: var(--font-mono);
          font-size: 0.8rem;
          color: rgba(99, 102, 241, 0.18);
        }
        .code-lines-ambient span {
          position: absolute;
          user-select: none;
        }

        .landing-content {
          max-width: 960px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2.25rem;
          position: relative;
          z-index: 10;
        }

        .institution-badge {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.6rem 1.4rem;
          background: rgba(15, 23, 42, 0.65);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-full);
          backdrop-filter: blur(16px);
          box-shadow: var(--shadow-sm), 0 0 20px rgba(99, 102, 241, 0.12);
        }

        .institution-crest {
          font-family: var(--font-heading);
          font-weight: 900;
          font-size: 0.85rem;
          background: var(--gradient-primary);
          color: #fff;
          padding: 0.2rem 0.6rem;
          border-radius: var(--radius-sm);
          letter-spacing: 0.05em;
        }

        .institution-text {
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        .inst-name {
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          color: var(--text-primary);
        }

        .dept-name {
          font-size: 0.68rem;
          color: var(--text-accent);
          letter-spacing: 0.04em;
          font-weight: 600;
        }

        .hero-section {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.85rem;
          max-width: 760px;
        }

        .hero-logo-box {
          width: 72px;
          height: 72px;
          border-radius: var(--radius-xl);
          background: var(--gradient-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          box-shadow: var(--shadow-glow-lg);
          margin-bottom: 0.25rem;
          animation: float 5s ease-in-out infinite;
        }

        .hero-title {
          font-size: 3.8rem;
          font-weight: 900;
          letter-spacing: -0.03em;
          line-height: 1.05;
        }

        .title-gradient {
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-tagline {
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--text-secondary);
          letter-spacing: 0.02em;
        }

        .hero-desc {
          font-size: 0.95rem;
          color: var(--text-muted);
          line-height: 1.6;
          max-width: 600px;
        }

        .enter-main-btn {
          font-size: 1rem;
          padding: 0.85rem 2rem;
          letter-spacing: 0.06em;
          border-radius: var(--radius-full);
          box-shadow: 0 0 25px rgba(99, 102, 241, 0.4);
        }

        .portal-cards {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.75rem;
          width: 100%;
          max-width: 800px;
        }

        .portal-card {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xl);
          padding: 2rem;
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          cursor: pointer;
          transition: all var(--transition-base);
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(20px);
          color: var(--text-primary);
          font-family: var(--font-sans);
        }

        .card-ambient-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.18), transparent 70%);
          opacity: 0;
          transition: opacity var(--transition-base);
          pointer-events: none;
        }

        .admin-card .card-ambient-glow {
          background: radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.22), transparent 70%);
        }

        .portal-card:hover {
          transform: translateY(-6px);
          border-color: var(--border-hover);
          box-shadow: var(--shadow-lg), var(--shadow-glow);
        }

        .portal-card:hover .card-ambient-glow {
          opacity: 1;
        }

        .card-top-icon {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-lg);
          background: var(--accent-glow);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-primary-light);
          box-shadow: var(--shadow-sm);
        }

        .card-top-icon.admin-icon {
          background: rgba(139, 92, 246, 0.2);
          color: #c084fc;
        }

        .card-text h2 {
          font-size: 1.35rem;
          font-weight: 800;
          letter-spacing: -0.01em;
          margin-bottom: 0.4rem;
        }

        .card-text p {
          font-size: 0.88rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .card-action-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 1rem;
          border-top: 1px solid var(--border-subtle);
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-accent);
        }

        .admin-card .card-action-bar {
          color: #c084fc;
        }

        .arrow-icon {
          transition: transform var(--transition-fast);
        }

        .portal-card:hover .arrow-icon {
          transform: translateX(4px);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          width: 100%;
          max-width: 800px;
        }

        .feature-glass-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 1.5rem 1rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          backdrop-filter: blur(16px);
          transition: transform 0.2s ease, border-color 0.2s ease;
        }
        
        .feature-glass-card:hover {
          transform: translateY(-4px);
          border-color: rgba(99, 102, 241, 0.4);
        }

        .feature-icon {
          color: var(--accent-primary-light);
          margin-bottom: 0.75rem;
        }
        
        .feature-text h3 {
          font-size: 0.9rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }
        
        .feature-text p {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .leadership-card {
          width: 100%;
          max-width: 800px;
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: 1.35rem 1.75rem;
          text-align: center;
        }

        .hod-label {
          font-size: 0.7rem;
          color: var(--text-accent);
          letter-spacing: 0.08em;
          font-weight: 700;
          text-transform: uppercase;
        }

        .hod-name {
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: 0.02em;
          margin-top: 0.2rem;
          color: var(--text-primary);
        }

        .hod-title {
          font-size: 0.78rem;
          color: var(--text-muted);
          font-weight: 600;
          display: block;
          margin-bottom: 0.6rem;
        }

        .hod-note {
          font-size: 0.85rem;
          font-style: italic;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        @media (max-width: 680px) {
          .portal-cards {
            grid-template-columns: 1fr;
          }
          .hero-title {
            font-size: 2.8rem;
          }
          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  )
}
