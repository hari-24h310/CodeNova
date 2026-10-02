import { useState, useEffect } from 'react'

export default function Preloader({ onFinish }) {
  const [showText, setShowText] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // Show text after equalizer pulse
    const t1 = setTimeout(() => setShowText(true), 600)
    // Start fade out
    const t2 = setTimeout(() => setFadeOut(true), 1300)
    // Unmount and notify parent
    const t3 = setTimeout(() => {
      if (onFinish) onFinish()
    }, 1700)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [onFinish])

  return (
    <div className={`codenova-preloader-root ${fadeOut ? 'preloader-fade-out' : ''}`}>
      <div className="preloader-content-box">
        {/* Bouncing Vertical Equalizer Bars: ▂ ▆ ▃ ▇ ▄ ▆ ▂ ▅ */}
        <div className="equalizer-bars-container">
          <span className="eq-bar eq-bar-1" />
          <span className="eq-bar eq-bar-2" />
          <span className="eq-bar eq-bar-3" />
          <span className="eq-bar eq-bar-4" />
          <span className="eq-bar eq-bar-5" />
          <span className="eq-bar eq-bar-6" />
          <span className="eq-bar eq-bar-7" />
          <span className="eq-bar eq-bar-8" />
        </div>

        {/* Text Reveal */}
        <div className={`preloader-brand-reveal ${showText ? 'revealed' : ''}`}>
          <div className="preloader-college">AGURCHAND MANMULL JAIN COLLEGE</div>
          <div className="preloader-dept">DEPARTMENT OF BACHELOR OF COMPUTER APPLICATION</div>
          <div className="preloader-dept">Dr. A. Udhayakumar<br />Associate Professor &amp; Facilitator</div>
          <h1 className="preloader-title">CODE NOVA</h1>
          <p className="preloader-subtitle">CODING SKILL ASSESSMENT</p>
        </div>
      </div>

      <style>{`
        .codenova-preloader-root {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: #060913;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.4s ease, visibility 0.4s ease;
        }

        .codenova-preloader-root.preloader-fade-out {
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }

        .preloader-content-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        /* Equalizer Bouncing Bars */
        .equalizer-bars-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 50px;
        }

        .eq-bar {
          width: 5px;
          border-radius: 4px;
          background: linear-gradient(180deg, #6366f1 0%, #a855f7 50%, #ec4899 100%);
          box-shadow: 0 0 12px rgba(99, 102, 241, 0.6);
          animation: eqBounce 1s ease-in-out infinite alternate;
        }

        .eq-bar-1 { height: 16px; animation-delay: 0.05s; }
        .eq-bar-2 { height: 38px; animation-delay: 0.25s; }
        .eq-bar-3 { height: 22px; animation-delay: 0.1s; }
        .eq-bar-4 { height: 46px; animation-delay: 0.35s; }
        .eq-bar-5 { height: 28px; animation-delay: 0.15s; }
        .eq-bar-6 { height: 40px; animation-delay: 0.3s; }
        .eq-bar-7 { height: 18px; animation-delay: 0.08s; }
        .eq-bar-8 { height: 32px; animation-delay: 0.22s; }

        @keyframes eqBounce {
          0% { transform: scaleY(0.3); opacity: 0.5; }
          100% { transform: scaleY(1.15); opacity: 1; filter: brightness(1.2); }
        }

        .preloader-brand-reveal {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .preloader-brand-reveal.revealed {
          opacity: 1;
          transform: translateY(0);
        }

        .preloader-college {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.9);
          letter-spacing: 0.1em;
          font-weight: 700;
          text-align: center;
        }

        .preloader-dept {
          font-size: 0.65rem;
          color: rgba(148, 163, 184, 0.9);
          letter-spacing: 0.08em;
          margin-bottom: 0.5rem;
          text-align: center;
        }

        .preloader-title {
          font-family: var(--font-heading, 'Outfit', sans-serif);
          font-size: 2rem;
          font-weight: 900;
          letter-spacing: 0.15em;
          background: linear-gradient(135deg, #fff 0%, #818cf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .preloader-subtitle {
          font-size: 0.75rem;
          letter-spacing: 0.2em;
          color: rgba(148, 163, 184, 0.8);
          font-weight: 700;
          text-transform: uppercase;
        }
      `}</style>
    </div>
  )
}
