import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api'

const CATEGORIES = ['workshop', 'hackathon', 'fest', 'seminar', 'cultural', 'other']
const BRANCHES = [
  'CSE - AI & ML', 'CSE - Artificial Intelligence', 'CSE - Data Science',
  'CSE - Big Data Analytics', 'CSE - Cloud Computing', 'CSE (Core)',
  'CSE - Cyber Security', 'CSE - Software Engineering',
  'CSE - Business Systems (CSBS)', 'CSE - Design (CSD)', 'IT',
  'ECE', 'ECE - VLSI', 'EIE', 'EEE', 'MECH', 'CIVIL',
  'AEROSPACE', 'AUTOMOBILE', 'CHEMICAL', 'MECHATRONICS',
  'BIOMEDICAL', 'BIOTECHNOLOGY', 'All Branches'
]

export default function PostEvent() {
  const [form, setForm] = useState({
    title: '', description: '', category: 'workshop',
    date: '', time: '', venue: '', college: 'SRM KTR',
    price: 'Free', registration_link: '', eligible_branches: [],
    team_size: 'Individual', prizes: '', last_date_to_register: ''
  })
  const [isPaid, setIsPaid] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const toggleBranch = (branch) => {
    if (branch === 'All Branches') {
      setForm(prev => ({ ...prev, eligible_branches: ['All Branches'] }))
      return
    }
    setForm(prev => {
      const curr = prev.eligible_branches.filter(b => b !== 'All Branches')
      return {
        ...prev,
        eligible_branches: curr.includes(branch)
          ? curr.filter(b => b !== branch)
          : [...curr, branch]
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = { ...form, price: isPaid ? form.price : 'Free' }
      await API.post('/events/', payload)
      setSuccess(true)
      setTimeout(() => navigate('/events'), 2000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to post event!')
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#050510,#0d0820)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 64 }}>🎉</div>
      <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 28, color: 'white' }}>Event Submitted!</h2>
      <p style={{ color: 'rgba(255,255,255,0.4)' }}>Waiting for admin approval. Redirecting...</p>
    </div>
  )

  return (
    <div style={S.root}>
      <div style={S.bg1} /><div style={S.bg2} />
      <nav style={S.nav}>
        <div style={S.brand} onClick={() => navigate('/events')}>
          <span style={S.brandUni}>Uni</span><span style={S.brandLink}>Link</span>
        </div>
        <button onClick={() => navigate('/events')} style={S.backBtn}>← Back to Events</button>
      </nav>

      <div style={S.page}>
        <div style={S.header}>
          <h1 style={S.pageTitle}>Post an Event 📋</h1>
          <p style={S.pageSub}>Fill in the details — admin will approve before it goes live</p>
        </div>

        {error && <div style={S.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={S.form}>
          <div style={S.section}>
            <h3 style={S.secTitle}>📌 Basic Information</h3>
            <div style={S.grid2}>
              <div style={S.field}>
                <label style={S.label}>Event Title *</label>
                <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. AI Hackathon 2026" style={S.input} required />
              </div>
              <div style={S.field}>
                <label style={S.label}>Category *</label>
                <select name="category" value={form.category} onChange={handleChange} style={S.input}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div style={S.field}>
              <label style={S.label}>Description *</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                placeholder="Describe your event — what will attendees learn or experience?"
                style={{ ...S.input, minHeight: 100, resize: 'vertical' }} required />
            </div>
          </div>

          <div style={S.section}>
            <h3 style={S.secTitle}>📅 Date, Time & Venue</h3>
            <div style={S.grid3}>
              <div style={S.field}>
                <label style={S.label}>Date *</label>
                <input name="date" type="date" value={form.date} onChange={handleChange} style={S.input} required />
              </div>
              <div style={S.field}>
                <label style={S.label}>Time *</label>
                <input name="time" type="time" value={form.time} onChange={handleChange} style={S.input} required />
              </div>
              <div style={S.field}>
                <label style={S.label}>Last Date to Register</label>
                <input name="last_date_to_register" type="date" value={form.last_date_to_register} onChange={handleChange} style={S.input} />
              </div>
            </div>
            <div style={S.grid2}>
              <div style={S.field}>
                <label style={S.label}>Venue *</label>
                <input name="venue" value={form.venue} onChange={handleChange} placeholder="e.g. Tech Park Auditorium" style={S.input} required />
              </div>
              <div style={S.field}>
                <label style={S.label}>College</label>
                <input name="college" value={form.college} onChange={handleChange} style={S.input} />
              </div>
            </div>
          </div>

          <div style={S.section}>
            <h3 style={S.secTitle}>📝 Registration Details</h3>
            <div style={S.field}>
              <label style={S.label}>Registration Form Link</label>
              <input name="registration_link" value={form.registration_link} onChange={handleChange}
                placeholder="https://forms.google.com/..." style={S.input} />
            </div>
            <div style={S.toggleRow}>
              <span style={S.toggleLabel}>Is this a paid event?</span>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setIsPaid(false)}
                  style={{ ...S.toggleBtn, ...(!isPaid ? S.toggleActive : {}) }}>🆓 Free</button>
                <button type="button" onClick={() => setIsPaid(true)}
                  style={{ ...S.toggleBtn, ...(isPaid ? S.togglePaidActive : {}) }}>💰 Paid</button>
              </div>
            </div>
            {isPaid && (
              <div style={S.field}>
                <label style={S.label}>Ticket Price (₹) *</label>
                <input name="price" value={form.price === 'Free' ? '' : form.price}
                  onChange={handleChange} placeholder="e.g. 299" style={S.input} required={isPaid} />
              </div>
            )}
            <div style={S.grid2}>
              <div style={S.field}>
                <label style={S.label}>Team Size</label>
                <select name="team_size" value={form.team_size} onChange={handleChange} style={S.input}>
                  {['Individual','2-3 members','3-4 members','4-5 members','Open'].map(t =>
                    <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={S.field}>
                <label style={S.label}>Prizes / Perks</label>
                <input name="prizes" value={form.prizes} onChange={handleChange}
                  placeholder="e.g. ₹10,000 cash + certificates" style={S.input} />
              </div>
            </div>
          </div>

          <div style={S.section}>
            <h3 style={S.secTitle}>🎓 Eligible Branches</h3>
            <p style={S.secSub}>Select which branches can participate. Leave empty for all.</p>
            <div style={S.branchGrid}>
              {BRANCHES.map(b => (
                <button key={b} type="button" onClick={() => toggleBranch(b)}
                  style={{ ...S.branchBtn, ...(form.eligible_branches.includes(b) ? S.branchActive : {}) }}>
                  {b}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" style={loading ? S.btnDisabled : S.btn} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Event for Approval →'}
          </button>
        </form>
      </div>
    </div>
  )
}

const S = {
  root: { minHeight:'100vh', background:'linear-gradient(160deg,#050510 0%,#0d0820 40%,#060315 100%)', fontFamily:"'Inter',sans-serif", color:'white' },
  bg1: { position:'fixed', top:'-20%', left:'-10%', width:'60vw', height:'60vw', borderRadius:'50%', background:'radial-gradient(circle,rgba(124,58,237,0.12) 0%,transparent 65%)', pointerEvents:'none' },
  bg2: { position:'fixed', top:'30%', right:'-15%', width:'50vw', height:'50vw', borderRadius:'50%', background:'radial-gradient(circle,rgba(236,72,153,0.08) 0%,transparent 65%)', pointerEvents:'none' },
  nav: { background:'rgba(255,255,255,0.03)', backdropFilter:'blur(24px)', borderBottom:'1px solid rgba(255,255,255,0.07)', position:'sticky', top:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 40px' },
  brand: { display:'flex', cursor:'pointer' },
  brandUni: { fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, color:'white' },
  brandLink: { fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, background:'linear-gradient(90deg,#a78bfa,#67e8f9)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' },
  backBtn: { background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'white', borderRadius:10, padding:'8px 18px', cursor:'pointer', fontSize:14, fontFamily:'Inter,sans-serif' },
  page: { maxWidth:800, margin:'0 auto', padding:'40px 24px' },
  header: { marginBottom:40 },
  pageTitle: { fontFamily:'Syne,sans-serif', fontSize:32, fontWeight:800, marginBottom:8 },
  pageSub: { color:'rgba(255,255,255,0.4)', fontSize:14 },
  error: { background:'rgba(244,63,94,0.1)', border:'1px solid rgba(244,63,94,0.3)', color:'#fb7185', padding:'12px 16px', borderRadius:12, marginBottom:24, fontSize:14 },
  form: { display:'flex', flexDirection:'column', gap:32 },
  section: { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:20, padding:28, display:'flex', flexDirection:'column', gap:20 },
  secTitle: { fontFamily:'Syne,sans-serif', fontSize:16, fontWeight:700, color:'white', marginBottom:4 },
  secSub: { color:'rgba(255,255,255,0.35)', fontSize:13, marginTop:-12 },
  grid2: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 },
  grid3: { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16 },
  field: { display:'flex', flexDirection:'column', gap:8 },
  label: { fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.4)', letterSpacing:1, textTransform:'uppercase', fontFamily:'Syne,sans-serif' },
input: { background:'#1a1035', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'12px 16px', color:'white', fontSize:14, fontFamily:'Inter,sans-serif', outline:'none', colorScheme:'dark' },  toggleRow: { display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'16px 20px' },
  toggleLabel: { fontSize:14, color:'rgba(255,255,255,0.6)', fontWeight:500 },
  toggleBtn: { padding:'8px 20px', borderRadius:10, border:'1px solid rgba(255,255,255,0.1)', background:'transparent', color:'rgba(255,255,255,0.4)', cursor:'pointer', fontSize:14, fontFamily:'Inter,sans-serif' },
  toggleActive: { background:'rgba(52,211,153,0.15)', border:'1px solid rgba(52,211,153,0.4)', color:'#34d399', fontWeight:600 },
  togglePaidActive: { background:'rgba(167,139,250,0.15)', border:'1px solid rgba(167,139,250,0.4)', color:'#a78bfa', fontWeight:600 },
  branchGrid: { display:'flex', flexWrap:'wrap', gap:10 },
  branchBtn: { padding:'7px 16px', borderRadius:20, border:'1px solid rgba(255,255,255,0.1)', background:'transparent', color:'rgba(255,255,255,0.4)', cursor:'pointer', fontSize:13, fontFamily:'Inter,sans-serif' },
  branchActive: { background:'rgba(167,139,250,0.15)', border:'1px solid rgba(167,139,250,0.4)', color:'#a78bfa', fontWeight:600 },
  btn: { background:'linear-gradient(135deg,#7c3aed,#a78bfa)', color:'white', padding:'16px', borderRadius:14, border:'none', fontSize:16, fontWeight:700, cursor:'pointer', fontFamily:'Syne,sans-serif', boxShadow:'0 8px 32px rgba(124,58,237,0.4)' },
  btnDisabled: { background:'rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.3)', padding:'16px', borderRadius:14, border:'none', fontSize:16, fontWeight:700, cursor:'not-allowed', fontFamily:'Syne,sans-serif' },
}