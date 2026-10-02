import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, ShieldCheck, User, Hash, Building2, Calendar, LayoutGrid, Phone, Mail, Lock } from 'lucide-react'
import { registerStudent } from '../services/api'

const initialForm = {
  name: '',
  rollNumber: '',
  registrationNumber: '',
  className: 'II',
  section: 'A',
  department: 'BCA',
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
}

export default function StudentRegistration() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const requiredFields = ['name', 'rollNumber', 'registrationNumber', 'className', 'section', 'department', 'phone', 'email', 'password', 'confirmPassword']
    const missing = requiredFields.find(field => !String(form[field]).trim())
    if (missing) {
      setError('Please fill in all required registration fields.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Please enter a valid personal email address.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Password and confirm password must match.')
      return
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { student } = await registerStudent({
        name: form.name,
        rollNumber: form.rollNumber,
        registrationNumber: form.registrationNumber,
        class: form.className,
        section: form.section,
        department: form.department,
        phone: form.phone,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
      })

      sessionStorage.setItem('codenovaStudent', JSON.stringify(student))
      navigate('/student/details')
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="card-elevated animate-scale-in" style={{ maxWidth: 760, width: '100%' }}>
        <button className="btn-back-link" onClick={() => navigate('/student/login')}>
          <ArrowLeft size={16} />
          <span>Back to Login</span>
        </button>

        <div className="details-header" style={{ marginBottom: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.72rem', fontWeight: 800 }}>Student Registration</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: 2 }}>
              Create your account to access the assessment portal
            </p>
          </div>
          <div className="verify-success-badge">
            <ShieldCheck size={16} />
            <span>New Account</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="student-form codenova-registration-form">
          <div className="codenova-registration-grid">
            <section className="codenova-registration-card">
              <div className="codenova-registration-card-header"><span className="codenova-registration-card-index">01</span><div><h2>Personal Details</h2><p>Tell us who you are</p></div></div>
              <div className="codenova-registration-fields">
                <div className="input-group">
                  <label htmlFor="name"><User size={13} style={{ display: 'inline', marginRight: 4 }} /> Full Name</label>
                  <input id="name" className="input" value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Enter full name" />
                </div>
                <div className="input-group">
                  <label htmlFor="rollNumber"><Hash size={13} style={{ display: 'inline', marginRight: 4 }} /> Roll Number</label>
                  <input id="rollNumber" className="input" value={form.rollNumber} onChange={(e) => handleChange('rollNumber', e.target.value.toUpperCase())} placeholder="e.g. 23BCA001" />
                </div>
                <div className="input-group">
                  <label htmlFor="registrationNumber"><Hash size={13} style={{ display: 'inline', marginRight: 4 }} /> Register Number</label>
                  <input id="registrationNumber" className="input" value={form.registrationNumber} onChange={(e) => handleChange('registrationNumber', e.target.value.toUpperCase())} placeholder="e.g. 2301015" />
                </div>
              </div>
            </section>

            <section className="codenova-registration-card">
              <div className="codenova-registration-card-header"><span className="codenova-registration-card-index">02</span><div><h2>Academic Details</h2><p>Set your course information</p></div></div>
              <div className="codenova-registration-fields">
                <div className="input-group">
                  <label htmlFor="className"><Calendar size={13} style={{ display: 'inline', marginRight: 4 }} /> Class</label>
                  <select id="className" className="input" value={form.className} onChange={(e) => handleChange('className', e.target.value)}>
                    <option value="I">I Year</option><option value="II">II Year</option><option value="III">III Year</option>
                  </select>
                </div>
                <div className="input-group">
                  <label htmlFor="section"><LayoutGrid size={13} style={{ display: 'inline', marginRight: 4 }} /> Section</label>
                  <select id="section" className="input" value={form.section} onChange={(e) => handleChange('section', e.target.value)}>
                    <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
                  </select>
                </div>
                <div className="input-group">
                  <label htmlFor="department"><Building2 size={13} style={{ display: 'inline', marginRight: 4 }} /> Department</label>
                  <input id="department" className="input" value={form.department} onChange={(e) => handleChange('department', e.target.value)} placeholder="BCA" />
                </div>
              </div>
            </section>

            <section className="codenova-registration-card">
              <div className="codenova-registration-card-header"><span className="codenova-registration-card-index">03</span><div><h2>Contact Details</h2><p>Keep your contact details current</p></div></div>
              <div className="codenova-registration-fields">
                <div className="input-group">
                  <label htmlFor="phone"><Phone size={13} style={{ display: 'inline', marginRight: 4 }} /> Phone Number</label>
                  <input id="phone" className="input" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="9876543210" />
                </div>
                <div className="input-group">
                  <label htmlFor="email"><Mail size={13} style={{ display: 'inline', marginRight: 4 }} /> Personal Email</label>
                  <input id="email" className="input" type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="yourname@gmail.com" />
                </div>
              </div>
            </section>

            <section className="codenova-registration-card">
              <div className="codenova-registration-card-header"><span className="codenova-registration-card-index">04</span><div><h2>Account Details</h2><p>Secure your assessment account</p></div></div>
              <div className="codenova-registration-fields">
                <div className="input-group">
                  <label htmlFor="password"><Lock size={13} style={{ display: 'inline', marginRight: 4 }} /> Password</label>
                  <input id="password" className="input" type="password" value={form.password} onChange={(e) => handleChange('password', e.target.value)} placeholder="Enter password" />
                </div>
                <div className="input-group">
                  <label htmlFor="confirmPassword"><Lock size={13} style={{ display: 'inline', marginRight: 4 }} /> Confirm Password</label>
                  <input id="confirmPassword" className="input" type="password" value={form.confirmPassword} onChange={(e) => handleChange('confirmPassword', e.target.value)} placeholder="Confirm password" />
                </div>
              </div>
            </section>
          </div>

          {error && (
            <div className="error-banner animate-fade-in">
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={20} className="spin-icon" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>REGISTER →</span>
            )}
          </button>
        </form>
      </div>
      <style>{`
        .codenova-registration-form {
          gap: 1rem;
        }

        .codenova-registration-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
        }

        .codenova-registration-card {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          padding: 1.15rem;
          border: 1px solid transparent;
          border-radius: 18px;
          background:
            linear-gradient(rgba(8, 13, 29, 0.96), rgba(8, 13, 29, 0.96)) padding-box,
            linear-gradient(135deg, rgba(129, 140, 248, 0.72), rgba(34, 211, 238, 0.22), rgba(192, 132, 252, 0.65)) border-box;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18), 0 0 24px rgba(99, 102, 241, 0.09);
          transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease;
        }

        .codenova-registration-card::before {
          position: absolute;
          z-index: -1;
          top: -45%;
          right: -15%;
          width: 170px;
          height: 170px;
          border-radius: 50%;
          background: rgba(99, 102, 241, 0.14);
          content: '';
          filter: blur(42px);
          pointer-events: none;
        }

        .codenova-registration-card:hover {
          transform: translateY(-3px);
          border-color: rgba(129, 140, 248, 0.85);
          box-shadow: 0 16px 34px rgba(0, 0, 0, 0.24), 0 0 30px rgba(99, 102, 241, 0.2);
        }

        .codenova-registration-card-header {
          display: flex;
          align-items: center;
          gap: 0.7rem;
          margin-bottom: 1rem;
        }

        .codenova-registration-card-index {
          display: grid;
          flex: 0 0 auto;
          width: 2rem;
          height: 2rem;
          place-items: center;
          border: 1px solid rgba(129, 140, 248, 0.45);
          border-radius: 10px;
          background: rgba(99, 102, 241, 0.14);
          color: #c4b5fd;
          font-family: var(--font-mono);
          font-size: 0.68rem;
          font-weight: 700;
        }

        .codenova-registration-card-header h2 {
          margin: 0;
          color: var(--text-primary);
          font-size: 0.96rem;
          font-weight: 750;
        }

        .codenova-registration-card-header p {
          margin: 0.2rem 0 0;
          color: var(--text-muted);
          font-size: 0.72rem;
        }

        .codenova-registration-fields {
          display: grid;
          gap: 0.85rem;
        }

        @media (max-width: 680px) {
          .codenova-registration-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
