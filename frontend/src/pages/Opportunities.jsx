import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api'
import Navbar from '../components/Navbar'

const TYPES = ['All', 'internship', 'job', 'hackathon', 'competition', 'research', 'other']
const TYPE_ICONS = { All: '🌐', internship: '💼', job: '🏢', hackathon: '💻', competition: '🏆', research: '🔬', other: '📌' }
const TYPE_COLORS = { internship: '#67e8f9', job: '#a78bfa', hackathon: '#f472b6', competition: '#fb923c', research: '#34d399', other: '#94a3b8' }

// Local heuristic trust scorer (no external API needed — works offline, no CORS)
function analyzeOpportunity(opportunity) {
  let score = 70
  const redFlags = []
  const greenFlags = []

  const title = (opportunity.title || '').toLowerCase()
  const desc = (opportunity.description || '').toLowerCase()
  const company = (opportunity.company || '').toLowerCase()
  const link = (opportunity.link || '').toLowerCase()
  const stipend = (opportunity.stipend || '').toLowerCase()

  // Green flags
  if (opportunity.company) { score += 5; greenFlags.push('Company name provided') }
  if (opportunity.link && (link.includes('linkedin') || link.includes('internshala') || link.includes('naukri') || link.includes('unstop'))) {
    score += 10; greenFlags.push('Link is from a trusted job platform')
  }
  if (opportunity.deadline) { score += 5; greenFlags.push('Clear application deadline given') }
  if (opportunity.eligibility) { score += 5; greenFlags.push('Eligibility criteria specified') }
  if (opportunity.location) { score += 3; greenFlags.push('Location provided') }
  if (opportunity.duration) { score += 3; greenFlags.push('Duration specified') }
  if (link.includes('https://')) { score += 4; greenFlags.push('Secure HTTPS link') }

  // Red flags
  if (!opportunity.company) { score -= 15; redFlags.push('No company name provided') }
  if (!opportunity.link) { score -= 10; redFlags.push('No application link') }
  if (desc.includes('pay') && desc.includes('register')) { score -= 20; redFlags.push('May require payment to register — common scam pattern') }
  if (desc.includes('guaranteed') || desc.includes('100% placement')) { score -= 15; redFlags.push('Unrealistic guarantees in description') }
  if (stipend.includes('lakh') || stipend.includes('lakhs')) {
    const num = parseFloat(stipend)
    if (num > 5) { score -= 10; redFlags.push('Unusually high stipend for an internship') }
  }
  if (desc.includes('urgent') || desc.includes('limited seats') || desc.includes('act now')) {
    score -= 8; redFlags.push('High-pressure urgency language')
  }
  if (link && !link.startsWith('http')) { score -= 5; redFlags.push('Suspicious link format') }
  if (desc.length < 40) { score -= 8; redFlags.push('Very short description — lacks detail') }

  score = Math.max(0, Math.min(100, score))
  const trust_level = score >= 70 ? 'High' : score >= 45 ? 'Medium' : 'Low'
  const verdict = score >= 70 ? 'Looks Legitimate' : score >= 45 ? 'Needs Caution' : 'Likely Scam'

  const summary = trust_level === 'High'
    ? 'This opportunity appears legitimate based on available details. Always verify independently before applying.'
    : trust_level === 'Medium'
    ? 'Some details are missing or raise questions. Proceed carefully and research the company before applying.'
    : 'Multiple red flags detected. Be very cautious — research thoroughly before sharing personal info.'

  return { trust_score: score, trust_level, verdict, red_flags: redFlags, green_flags: greenFlags, summary }
}

export default function Opportunities() {
  const [opportunities, setOpportunities] = useState([])
  const [type, setType] = useState('All')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    // 1. Auth check
    try {
      const u = await API.get('/auth/me')
      setUser(u.data.user)
    } catch {
      navigate('/login')
      return
    }

    // 2. Load opportunities — response shape: { total, opportunities: [...] }
    try {
      const res = await API.get('/opportunities/')
      setOpportunities(res.data.opportunities || [])
    } catch (e) {
      setError('Failed to load opportunities. Please try again.')
      setOpportunities([])
    }

    setLoading(false)
  }

  const filtered = type === 'All'
    ? opportunities
    : opportunities.filter(o => o.type === type)

  return (
    <div style={S.root}>
      <div style={S.bg1} /><div style={S.bg2} /><div style={S.bg3} />

      <Navbar />

      <div style={S.page}>
        {/* Header */}
        <div style={S.header}>
          <div>
            <h1 style={S.pageTitle}>Opportunities 💼</h1>
            <p style={S.pageSub}>Internships, jobs, fellowships — <span style={{ color: '#a78bfa' }}>AI-verified for safety</span> 🤖</p>
          </div>
          {(user?.role === 'admin' || user?.role === 'company') && (
            <button style={S.postBtn} onClick={() => navigate('/opportunities/post')}>+ Post Opportunity</button>
          )}
        </div>

        {/* AI Banner */}
        <div style={S.aiBanner}>
          <span style={{ fontSize: 20 }}>🤖</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'white' }}>AI-Powered Scam Detection</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
              Click any opportunity → "Verify with AI" to check legitimacy using smart heuristics &amp; red flag analysis
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div style={S.errorBox}>⚠️ {error}</div>
        )}

        {/* Filter Bar */}
        <div style={S.filterBar}>
          {TYPES.map(t => (
            <button key={t} onClick={() => setType(t)}
              style={{ ...S.filterBtn, ...(type === t ? S.filterActive : {}) }}>
              {TYPE_ICONS[t]} {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div style={S.countRow}>
          <span style={S.countText}>{filtered.length} opportunit{filtered.length === 1 ? 'y' : 'ies'} found</span>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={S.empty}>
            <div style={S.loadingSpinner} />
            <p style={{ marginTop: 16 }}>Loading opportunities...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={S.empty}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
            <p>No {type === 'All' ? '' : type} opportunities yet</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>Check back soon!</p>
          </div>
        ) : (
          <div style={S.grid}>
            {filtered.map(o => (
              <OpportunityCard key={o.id} opportunity={o} onClick={() => setSelected(o)} />
            ))}
          </div>
        )}
      </div>

      {selected && (
        <OpportunityModal
          opportunity={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}

function OpportunityCard({ opportunity: o, onClick }) {
  const color = TYPE_COLORS[o.type] || '#94a3b8'
  const daysLeft = o.deadline
    ? Math.ceil((new Date(o.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div onClick={onClick} style={S.card}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(167,139,250,0.3)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}>

      <div style={S.cardTop}>
        <span style={{ background: color + '20', color, padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>
          {TYPE_ICONS[o.type]} {o.type?.toUpperCase()}
        </span>
        {daysLeft !== null && (
          <span style={{
            fontSize: 11, fontWeight: 600,
            color: daysLeft <= 0 ? '#94a3b8' : daysLeft <= 3 ? '#fb7185' : daysLeft <= 7 ? '#fbbf24' : '#34d399',
            background: daysLeft <= 0 ? 'rgba(148,163,184,0.1)' : daysLeft <= 3 ? 'rgba(251,113,133,0.1)' : daysLeft <= 7 ? 'rgba(251,191,36,0.1)' : 'rgba(52,211,153,0.1)',
            padding: '3px 10px', borderRadius: 20
          }}>
            {daysLeft <= 0 ? '❌ Expired' : `⏰ ${daysLeft}d left`}
          </span>
        )}
      </div>

      <h3 style={S.cardTitle}>{o.title}</h3>
      {o.company && <p style={S.cardCompany}>🏢 {o.company}{o.recruiter_name ? ` · ${o.recruiter_name}` : ''}</p>}
      {o.hiring_process && <p style={{ color: '#67e8f9', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>📋 {o.hiring_process}</p>}
      {o.stipend && <p style={{ color: '#34d399', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>💰 {o.stipend}</p>}
      <p style={S.cardDesc}>{o.description?.length > 80 ? o.description.slice(0, 80) + '...' : o.description}</p>

      <div style={S.cardFooter}>
        {o.deadline
          ? <span style={S.metaItem}>📅 {o.deadline}</span>
          : <span />
        }
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#a78bfa', background: 'rgba(167,139,250,0.1)', padding: '2px 8px', borderRadius: 10 }}>🤖 AI Check</span>
          <span style={S.applyBtn}>View →</span>
        </div>
      </div>
    </div>
  )
}

function OpportunityModal({ opportunity: o, onClose }) {
  const color = TYPE_COLORS[o.type] || '#94a3b8'
  const daysLeft = o.deadline
    ? Math.ceil((new Date(o.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    : null

  const [aiResult, setAiResult] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [reported, setReported] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [showReport, setShowReport] = useState(false)

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const runAIVerification = () => {
    setAiLoading(true)
    // Small delay for UX — simulate analysis
    setTimeout(() => {
      const result = analyzeOpportunity(o)
      setAiResult(result)
      setAiLoading(false)
    }, 1200)
  }

  const trustColor = aiResult
    ? aiResult.trust_level === 'High' ? '#34d399'
    : aiResult.trust_level === 'Medium' ? '#fbbf24'
    : '#fb7185'
    : '#a78bfa'

  const verdictBg = aiResult
    ? aiResult.trust_level === 'High' ? 'rgba(52,211,153,0.08)'
    : aiResult.trust_level === 'Medium' ? 'rgba(251,191,36,0.08)'
    : 'rgba(251,113,133,0.08)'
    : 'transparent'

  const handleReport = () => {
    if (!reportReason) return
    // In a real app, you'd POST this to /opportunities/{id}/report
    setReported(true)
  }

  return (
    <div onClick={onClose} style={S.overlay}>
      <div onClick={e => e.stopPropagation()} style={S.modal}>
        <button onClick={onClose} style={S.closeBtn}>✕</button>

        {/* Type + deadline badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span style={{ background: color + '20', color, padding: '4px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>
            {TYPE_ICONS[o.type]} {o.type?.toUpperCase()}
          </span>
          {daysLeft !== null && (
            <span style={{ fontSize: 12, fontWeight: 600, color: daysLeft <= 0 ? '#94a3b8' : daysLeft <= 3 ? '#fb7185' : '#34d399' }}>
              {daysLeft <= 0 ? '❌ Expired' : `⏰ ${daysLeft} days left`}
            </span>
          )}
        </div>

        <h2 style={S.modalTitle}>{o.title}</h2>
        {o.company && <p style={S.modalCompany}>🏢 {o.company}</p>}
        <p style={S.modalDesc}>{o.description}</p>

        {/* Details grid */}
        <div style={S.modalGrid}>
          {[
            { icon: '📅', label: 'Deadline', val: o.deadline },
            { icon: '🏢', label: 'Company', val: o.company },
            { icon: '👤', label: 'Recruiter', val: o.recruiter_name },
            { icon: '📋', label: 'Hiring Process', val: o.hiring_process },
            { icon: '💰', label: 'Stipend / Salary', val: o.stipend },
            { icon: '🎓', label: 'Eligibility', val: o.eligibility },
            { icon: '📍', label: 'Location', val: o.location },
            { icon: '⏱️', label: 'Duration', val: o.duration },
          ].filter(i => i.val).map(item => (
            <div key={item.label} style={S.modalItem}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <div>
                <div style={S.modalLabel}>{item.label}</div>
                <div style={S.modalValue}>{item.val}</div>
              </div>
            </div>
          ))}
        </div>

        {/* AI Verification */}
        <div style={S.aiSection}>
          <div style={S.aiHeader}>
            <span style={{ fontSize: 18 }}>🤖</span>
            <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15 }}>AI Verification</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginLeft: 'auto' }}>Smart Heuristic Analysis</span>
          </div>

          {!aiResult && !aiLoading && (
            <button onClick={runAIVerification} style={S.verifyBtn}>
              🔍 Verify This Opportunity
            </button>
          )}

          {aiLoading && (
            <div style={S.aiLoading}>
              <div style={S.spinner} />
              <span>Analyzing opportunity... checking for red flags...</span>
            </div>
          )}

          {aiResult && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Trust score */}
              <div style={{ ...S.verdictBox, background: verdictBg, borderColor: trustColor + '40' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ color: trustColor, fontWeight: 700, fontSize: 16 }}>{aiResult.verdict}</span>
                  <span style={{ color: trustColor, fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 800 }}>
                    {aiResult.trust_score}/100
                  </span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                  <div style={{ width: aiResult.trust_score + '%', height: '100%', background: trustColor, borderRadius: 4, transition: 'width 1s ease' }} />
                </div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 10, lineHeight: 1.6 }}>
                  {aiResult.summary}
                </p>
              </div>

              {/* Red flags */}
              {aiResult.red_flags?.length > 0 && (
                <div style={S.flagBox}>
                  <div style={{ color: '#fb7185', fontWeight: 700, fontSize: 13, marginBottom: 8 }}>🚩 Red Flags</div>
                  {aiResult.red_flags.map((f, i) => (
                    <div key={i} style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      • {f}
                    </div>
                  ))}
                </div>
              )}

              {/* Green flags */}
              {aiResult.green_flags?.length > 0 && (
                <div style={{ ...S.flagBox, background: 'rgba(52,211,153,0.05)', borderColor: 'rgba(52,211,153,0.2)' }}>
                  <div style={{ color: '#34d399', fontWeight: 700, fontSize: 13, marginBottom: 8 }}>✅ Positive Indicators</div>
                  {aiResult.green_flags.map((f, i) => (
                    <div key={i} style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      • {f}
                    </div>
                  ))}
                </div>
              )}

              <button onClick={() => setAiResult(null)} style={S.rerunBtn}>↺ Re-run Analysis</button>
            </div>
          )}
        </div>

        {/* Report Section */}
        <div style={S.reportSection}>
          {!showReport ? (
            <button onClick={() => setShowReport(true)} style={S.reportBtn}>🚨 Report as Scam</button>
          ) : reported ? (
            <div style={S.reportedBox}>✅ Reported! Our team will review this opportunity.</div>
          ) : (
            <div style={S.reportForm}>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 8, width: '100%' }}>Why are you reporting this?</p>
              {['Fake company', 'Unrealistic salary', 'Asking for money', 'Suspicious link', 'Misleading info', 'Other'].map(r => (
                <button key={r} type="button"
                  onClick={() => setReportReason(r)}
                  style={{ ...S.reasonBtn, ...(reportReason === r ? S.reasonActive : {}) }}>
                  {r}
                </button>
              ))}
              <button
                onClick={handleReport}
                disabled={!reportReason}
                style={{ ...S.submitReportBtn, opacity: reportReason ? 1 : 0.4, cursor: reportReason ? 'pointer' : 'not-allowed' }}>
                Submit Report
              </button>
            </div>
          )}
        </div>

        {/* Apply button */}
        {o.link ? (
          <button onClick={() => window.open(o.link, '_blank', 'noopener,noreferrer')} style={S.applyBtnLarge}>
            Apply Now →
          </button>
        ) : (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14, padding: '12px 0' }}>
            No application link provided
          </div>
        )}
      </div>
    </div>
  )
}

const S = {
  root: { minHeight: '100vh', background: 'linear-gradient(160deg,#050510 0%,#0d0820 40%,#060315 100%)', fontFamily: "'Inter',sans-serif", color: 'white' },
  bg1: { position: 'fixed', top: '-20%', left: '-10%', width: '60vw', height: '60vw', borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.12) 0%,transparent 65%)', pointerEvents: 'none' },
  bg2: { position: 'fixed', top: '30%', right: '-15%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle,rgba(236,72,153,0.08) 0%,transparent 65%)', pointerEvents: 'none' },
  bg3: { position: 'fixed', bottom: '-10%', left: '25%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle,rgba(16,185,129,0.06) 0%,transparent 65%)', pointerEvents: 'none' },
  nav: { background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 40px' },
  brand: { display: 'flex', cursor: 'pointer' },
  brandUni: { fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 800, color: 'white' },
  brandLink: { fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 800, background: 'linear-gradient(90deg,#a78bfa,#67e8f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  navLinks: { display: 'flex', gap: 32 },
  navLink: { color: 'rgba(255,255,255,0.4)', fontSize: 14, cursor: 'pointer', fontWeight: 500 },
  navActive: { color: 'white', fontWeight: 700 },
  navUser: { fontSize: 14, color: 'rgba(255,255,255,0.5)' },
  page: { maxWidth: 1200, margin: '0 auto', padding: '40px 24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  pageTitle: { fontFamily: 'Syne,sans-serif', fontSize: 36, fontWeight: 800, marginBottom: 8 },
  pageSub: { color: 'rgba(255,255,255,0.4)', fontSize: 15 },
  postBtn: { background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', color: 'white', border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Syne,sans-serif', flexShrink: 0 },
  aiBanner: { background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 14, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 },
  errorBox: { background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.3)', color: '#fb7185', borderRadius: 12, padding: '12px 16px', fontSize: 14, marginBottom: 20 },
  filterBar: { display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' },
  filterBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', fontSize: 14, cursor: 'pointer', fontFamily: 'Inter,sans-serif', transition: 'all 0.15s' },
  filterActive: { background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.4)', color: '#a78bfa', fontWeight: 600 },
  countRow: { marginBottom: 24 },
  countText: { color: 'rgba(255,255,255,0.3)', fontSize: 13 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 20 },
  card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 24, cursor: 'pointer', transition: 'transform 0.2s, border-color 0.2s' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  cardTitle: { fontFamily: 'Syne,sans-serif', fontSize: 17, fontWeight: 700, color: 'white', marginBottom: 6, lineHeight: 1.4 },
  cardCompany: { color: '#a78bfa', fontSize: 13, fontWeight: 600, marginBottom: 8 },
  cardDesc: { color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.6, marginBottom: 16 },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  metaItem: { color: 'rgba(255,255,255,0.35)', fontSize: 12 },
  applyBtn: { color: '#a78bfa', fontSize: 13, fontWeight: 600 },
  empty: { textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.3)', fontSize: 15 },
  loadingSpinner: { width: 36, height: 36, border: '3px solid rgba(167,139,250,0.2)', borderTop: '3px solid #a78bfa', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modal: { background: 'linear-gradient(160deg,#0d0820,#050510)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 28, padding: 40, maxWidth: 600, width: '100%', maxHeight: '88vh', overflowY: 'auto', position: 'relative', boxShadow: '0 40px 80px rgba(0,0,0,0.6)' },
  closeBtn: { position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.08)', border: 'none', color: 'white', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', fontSize: 16 },
  modalTitle: { fontFamily: 'Syne,sans-serif', fontSize: 24, fontWeight: 800, color: 'white', marginBottom: 6 },
  modalCompany: { color: '#a78bfa', fontSize: 14, fontWeight: 600, marginBottom: 16 },
  modalDesc: { color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.8, marginBottom: 24 },
  modalGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 },
  modalItem: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' },
  modalLabel: { fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 },
  modalValue: { fontSize: 13, color: 'white', fontWeight: 500 },
  aiSection: { background: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.15)', borderRadius: 16, padding: 20, marginBottom: 16 },
  aiHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 },
  verifyBtn: { width: '100%', background: 'linear-gradient(135deg,rgba(124,58,237,0.3),rgba(167,139,250,0.2))', border: '1px solid rgba(167,139,250,0.4)', color: '#a78bfa', borderRadius: 12, padding: '12px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Syne,sans-serif' },
  aiLoading: { display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,0.4)', fontSize: 13, padding: '12px 0' },
  spinner: { width: 18, height: 18, border: '2px solid rgba(167,139,250,0.3)', borderTop: '2px solid #a78bfa', borderRadius: '50%', animation: 'spin 1s linear infinite', flexShrink: 0 },
  verdictBox: { border: '1px solid', borderRadius: 12, padding: 16 },
  flagBox: { background: 'rgba(251,113,133,0.05)', border: '1px solid rgba(251,113,133,0.15)', borderRadius: 10, padding: '12px 16px' },
  rerunBtn: { background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', borderRadius: 8, padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter,sans-serif', alignSelf: 'flex-start' },
  reportSection: { marginBottom: 16 },
  reportBtn: { background: 'transparent', border: '1px solid rgba(251,113,133,0.3)', color: '#fb7185', borderRadius: 10, padding: '8px 16px', fontSize: 13, cursor: 'pointer', fontFamily: 'Inter,sans-serif' },
  reportForm: { background: 'rgba(251,113,133,0.05)', border: '1px solid rgba(251,113,133,0.15)', borderRadius: 12, padding: 16, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-start' },
  reasonBtn: { padding: '6px 14px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 12, fontFamily: 'Inter,sans-serif' },
  reasonActive: { background: 'rgba(251,113,133,0.15)', border: '1px solid rgba(251,113,133,0.4)', color: '#fb7185', fontWeight: 600 },
  submitReportBtn: { width: '100%', background: 'rgba(251,113,133,0.2)', border: '1px solid rgba(251,113,133,0.4)', color: '#fb7185', borderRadius: 10, padding: '10px', fontSize: 14, fontWeight: 700, fontFamily: 'Syne,sans-serif', marginTop: 4 },
  reportedBox: { background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399', borderRadius: 10, padding: '10px 16px', fontSize: 13, fontWeight: 600 },
  applyBtnLarge: { width: '100%', background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', color: 'white', border: 'none', borderRadius: 14, padding: '16px', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'Syne,sans-serif', boxShadow: '0 8px 32px rgba(124,58,237,0.4)' },
}