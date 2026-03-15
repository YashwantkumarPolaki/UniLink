import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api'

// Must match backend OpportunityType enum exactly
const TYPES = ['internship', 'hackathon', 'competition', 'research', 'job', 'other']

export default function PostOpportunity() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'internship',
    company: '',
    recruiter_name: '',
    hiring_process: '',
    stipend: '',
    eligibility: '',
    location: '',
    duration: '',
    deadline: '',
    link: '',
    college: 'SRM KTR',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await API.post('/opportunities/', form)
      setSuccess(true)
      setTimeout(() => navigate('/opportunities'), 2000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to post opportunity. Only admins can post.')
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#050510,#0d0820)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 64 }}>🎉</div>
      <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 28, color: 'white' }}>Opportunity Posted!</h2>
      <p style={{ color: 'rgba(255,255,255,0.4)' }}>Redirecting to Opportunities...</p>
    </div>
  )

  return (
    <div style={S.root}>
      <div style={S.bg1} /><div style={S.bg2} />

      <nav style={S.nav}>
        <div style={S.brand} onClick={() => navigate('/opportunities')}>
          <span style={S.brandUni}>Uni</span><span style={S.brandLink}>Link</span>
        </div>
        <button onClick={() => navigate('/opportunities')} style={S.backBtn}>← Back to Opportunities</button>
      </nav>

      <div style={S.page}>
        <div style={S.header}>
          <h1 style={S.pageTitle}>Post an Opportunity 💼</h1>
          <p style={S.pageSub}>Admin-only — fill in the details to publish to students</p>
        </div>

        {error && <div style={S.errorBox}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit} style={S.form}>
          {/* Basic Info */}
          <div style={S.section}>
            <h3 style={S.secTitle}>📌 Basic Information</h3>
            <div style={S.grid2}>
              <div style={S.field}>
                <label style={S.label}>Title *</label>
                <input name="title" value={form.title} onChange={handleChange}
                  placeholder="e.g. Software Engineering Intern" style={S.input} required />
              </div>
              <div style={S.field}>
                <label style={S.label}>Type *</label>
                <select name="type" value={form.type} onChange={handleChange} style={S.input}>
                  {TYPES.map(t => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={S.field}>
              <label style={S.label}>Description *</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                placeholder="Describe the opportunity — responsibilities, requirements, perks..."
                style={{ ...S.input, minHeight: 110, resize: 'vertical' }} required />
            </div>
          </div>

          {/* Company & Recruiter */}
          <div style={S.section}>
            <h3 style={S.secTitle}>🏢 Company & Recruiter</h3>
            <div style={S.grid2}>
              <div style={S.field}>
                <label style={S.label}>Company Name *</label>
                <input name="company" value={form.company} onChange={handleChange}
                  placeholder="e.g. Google India" style={S.input} required />
              </div>
              <div style={S.field}>
                <label style={S.label}>Recruiter Name</label>
                <input name="recruiter_name" value={form.recruiter_name} onChange={handleChange}
                  placeholder="HR / Recruiter's name" style={S.input} />
              </div>
            </div>
            <div style={S.grid2}>
              <div style={S.field}>
                <label style={S.label}>Hiring Process</label>
                <select name="hiring_process" value={form.hiring_process} onChange={handleChange} style={S.input}>
                  <option value="">Select...</option>
                  <option value="On-Campus">On-Campus</option>
                  <option value="Off-Campus">Off-Campus</option>
                  <option value="Both">Both</option>
                </select>
              </div>
              <div style={S.field}>
                <label style={S.label}>Stipend / Salary</label>
                <input name="stipend" value={form.stipend} onChange={handleChange}
                  placeholder="e.g. ₹20,000/mo or ₹8–12 LPA" style={S.input} />
              </div>
            </div>
            <div style={S.grid2}>
              <div style={S.field}>
                <label style={S.label}>Eligibility (Branches)</label>
                <input name="eligibility" value={form.eligibility} onChange={handleChange}
                  placeholder="e.g. CSE, IT, ECE or All branches" style={S.input} />
              </div>
              <div style={S.field}>
                <label style={S.label}>Location</label>
                <input name="location" value={form.location} onChange={handleChange}
                  placeholder="e.g. Bangalore / Remote" style={S.input} />
              </div>
            </div>
            <div style={S.grid2}>
              <div style={S.field}>
                <label style={S.label}>Duration</label>
                <input name="duration" value={form.duration} onChange={handleChange}
                  placeholder="e.g. 3 months / Full-time" style={S.input} />
              </div>
              <div style={S.field}>
                <label style={S.label}>College</label>
                <input name="college" value={form.college} onChange={handleChange} style={S.input} />
              </div>
            </div>
            <div style={S.grid2}>
              <div style={S.field}>
                <label style={S.label}>Application Link *</label>
                <input name="link" value={form.link} onChange={handleChange}
                  placeholder="https://careers.company.com/apply" style={S.input} required />
              </div>
              <div style={S.field}>
                <label style={S.label}>Application Deadline *</label>
                <input name="deadline" type="date" value={form.deadline} onChange={handleChange}
                  style={S.input} required />
              </div>
            </div>
          </div>

          <button type="submit" style={loading ? S.btnDisabled : S.btn} disabled={loading}>
            {loading ? 'Posting...' : 'Post Opportunity →'}
          </button>
        </form>
      </div>
    </div>
  )
}

const S = {
  root: { minHeight: '100vh', background: 'linear-gradient(160deg,#050510 0%,#0d0820 40%,#060315 100%)', fontFamily: "'Inter',sans-serif", color: 'white' },
  bg1: { position: 'fixed', top: '-20%', left: '-10%', width: '60vw', height: '60vw', borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.12) 0%,transparent 65%)', pointerEvents: 'none' },
  bg2: { position: 'fixed', top: '30%', right: '-15%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle,rgba(236,72,153,0.08) 0%,transparent 65%)', pointerEvents: 'none' },
  nav: { background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 40px' },
  brand: { display: 'flex', cursor: 'pointer' },
  brandUni: { fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 800, color: 'white' },
  brandLink: { fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 800, background: 'linear-gradient(90deg,#a78bfa,#67e8f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  backBtn: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: 10, padding: '8px 18px', cursor: 'pointer', fontSize: 14, fontFamily: 'Inter,sans-serif' },
  page: { maxWidth: 800, margin: '0 auto', padding: '40px 24px' },
  header: { marginBottom: 36 },
  pageTitle: { fontFamily: 'Syne,sans-serif', fontSize: 32, fontWeight: 800, marginBottom: 8 },
  pageSub: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },
  errorBox: { background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.3)', color: '#fb7185', borderRadius: 12, padding: '12px 16px', fontSize: 14, marginBottom: 24 },
  form: { display: 'flex', flexDirection: 'column', gap: 28 },
  section: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 28, display: 'flex', flexDirection: 'column', gap: 20 },
  secTitle: { fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 4 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'Syne,sans-serif' },
  input: { background: '#1a1035', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 16px', color: 'white', fontSize: 14, fontFamily: 'Inter,sans-serif', outline: 'none', colorScheme: 'dark', width: '100%', boxSizing: 'border-box' },
  btn: { background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', color: 'white', padding: '16px', borderRadius: 14, border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'Syne,sans-serif', boxShadow: '0 8px 32px rgba(124,58,237,0.4)' },
  btnDisabled: { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)', padding: '16px', borderRadius: 14, border: 'none', fontSize: 16, fontWeight: 700, cursor: 'not-allowed', fontFamily: 'Syne,sans-serif' },
}
