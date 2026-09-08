import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api'
import UniLinkLogo from '../components/UniLinkLogo'

// ── Sidebar tabs ──────────────────────────────────────────────────────────────
const TABS = [
  { key: 'dashboard',     label: 'Dashboard',     icon: '📊' },
  { key: 'clubs',         label: 'Clubs',         icon: '🏛️' },
  { key: 'companies',     label: 'Companies',     icon: '🏢' },
  { key: 'events',        label: 'Events',        icon: '📅' },
  { key: 'users',         label: 'Users',         icon: '👥' },
  { key: 'announcements', label: 'Announcements', icon: '📣' },
]

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, type }) {
  if (!msg) return null
  const bg     = type === 'error' ? 'rgba(244,63,94,0.15)'  : 'rgba(52,211,153,0.15)'
  const border = type === 'error' ? 'rgba(244,63,94,0.4)'   : 'rgba(52,211,153,0.4)'
  const color  = type === 'error' ? '#fb7185'               : '#34d399'
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, background: bg, border: `1px solid ${border}`, color, padding: '12px 20px', borderRadius: 12, fontSize: 14, fontWeight: 600, maxWidth: 340, backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
      <span>{type === 'error' ? '⚠️' : '✅'}</span> {msg}
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 40, height: 40, border: '3px solid rgba(167,139,250,0.15)', borderTop: '3px solid #a78bfa', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>Loading…</span>
    </div>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────────
function Empty({ emoji, text }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.25)', fontSize: 15 }}>
      <div style={{ fontSize: 56, marginBottom: 16, filter: 'grayscale(0.3)' }}>{emoji}</div>
      <p style={{ margin: 0 }}>{text}</p>
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────────
function Badge({ count, color = '#f472b6' }) {
  if (!count) return null
  return (
    <span style={{ background: color + '25', color, border: `1px solid ${color}55`, borderRadius: 20, padding: '1px 7px', fontSize: 11, fontWeight: 800, marginLeft: 6, lineHeight: 1.6 }}>
      {count}
    </span>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color, sub }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '22px 26px', display: 'flex', alignItems: 'center', gap: 18, transition: 'border-color 0.2s, background 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = color + '44' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}
    >
      <div style={{ width: 56, height: 56, borderRadius: 16, background: color + '18', border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 32, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginTop: 4 }}>{label}</div>
        {sub && <div style={{ color: 'rgba(255,255,255,0.22)', fontSize: 12, marginTop: 3 }}>{sub}</div>}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// Approval Card — shared between Clubs and Companies tabs
// ══════════════════════════════════════════════════════════════════════════════
function ApprovalCard({ item, type, onApprove, onReject }) {
  const [busy, setBusy] = useState(null) // 'approve' | 'reject'
  const isClub = type === 'club'

  const accentColor = isClub ? '#a78bfa' : '#fb923c'
  const tag = isClub
    ? (item.club_name || 'Unnamed Club')
    : (item.company_name || 'Unnamed Company')
  const tagIcon = isClub ? '🏛️' : '🏢'
  const hiringBadge = !isClub && item.hiring_process

  const handle = async (action) => {
    setBusy(action)
    try {
      if (action === 'approve') await onApprove(item.id)
      else await onReject(item.id)
    } finally { setBusy(null) }
  }

  const formattedDate = item.created_at
    ? new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.07)`, borderRadius: 18, padding: '22px 26px', display: 'flex', gap: 20, alignItems: 'flex-start', transition: 'border-color 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = accentColor + '35'; e.currentTarget.style.boxShadow = `0 4px 24px ${accentColor}12` }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.boxShadow = 'none' }}
    >
      {/* Avatar / Icon */}
      <div style={{ width: 52, height: 52, borderRadius: 14, background: accentColor + '18', border: `1px solid ${accentColor}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
        {tagIcon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
          <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 17, fontWeight: 800, color: 'white' }}>{tag}</span>
          {hiringBadge && (
            <span style={{ background: '#fb923c22', color: '#fb923c', border: '1px solid #fb923c44', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
              {item.hiring_process}
            </span>
          )}
        </div>

        {/* Meta info */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 10 }}>
          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ opacity: 0.6 }}>👤</span> {item.name || '—'}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ opacity: 0.6 }}>✉️</span> {item.email || '—'}
          </span>
          {isClub && item.college && (
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ opacity: 0.6 }}>🏫</span> {item.college}
            </span>
          )}
          {!isClub && item.linkedin && (
            <a href={item.linkedin} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', fontSize: 13, display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}>
              <span>🔗</span> LinkedIn
            </a>
          )}
          <span style={{ color: 'rgba(255,255,255,0.22)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ opacity: 0.6 }}>📅</span> Applied {formattedDate}
          </span>
        </div>

        {/* Description (clubs only) */}
        {isClub && item.description && (
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, lineHeight: 1.6, margin: 0, marginBottom: 4 }}>
            {item.description.slice(0, 180)}{item.description.length > 180 ? '…' : ''}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
        <button
          onClick={() => handle('approve')}
          disabled={!!busy}
          style={{
            background: busy === 'approve' ? 'rgba(52,211,153,0.25)' : 'rgba(52,211,153,0.12)',
            border: '1px solid rgba(52,211,153,0.35)',
            color: '#34d399',
            padding: '9px 20px', borderRadius: 10, cursor: busy ? 'not-allowed' : 'pointer',
            fontSize: 13, fontWeight: 700, fontFamily: 'Inter,sans-serif', whiteSpace: 'nowrap',
            transition: 'background 0.15s, transform 0.1s',
            opacity: busy && busy !== 'approve' ? 0.4 : 1,
          }}
          onMouseEnter={e => !busy && (e.currentTarget.style.background = 'rgba(52,211,153,0.22)')}
          onMouseLeave={e => !busy && (e.currentTarget.style.background = 'rgba(52,211,153,0.12)')}
        >
          {busy === 'approve' ? '⏳ Approving…' : '✅ Approve'}
        </button>
        <button
          onClick={() => handle('reject')}
          disabled={!!busy}
          style={{
            background: 'rgba(244,63,94,0.08)',
            border: '1px solid rgba(244,63,94,0.3)',
            color: '#fb7185',
            padding: '9px 20px', borderRadius: 10, cursor: busy ? 'not-allowed' : 'pointer',
            fontSize: 13, fontWeight: 700, fontFamily: 'Inter,sans-serif', whiteSpace: 'nowrap',
            transition: 'background 0.15s',
            opacity: busy && busy !== 'reject' ? 0.4 : 1,
          }}
          onMouseEnter={e => !busy && (e.currentTarget.style.background = 'rgba(244,63,94,0.16)')}
          onMouseLeave={e => !busy && (e.currentTarget.style.background = 'rgba(244,63,94,0.08)')}
        >
          {busy === 'reject' ? '⏳ Rejecting…' : '❌ Reject'}
        </button>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE — Clubs Approval
// ══════════════════════════════════════════════════════════════════════════════
function ClubsApproval({ showToast, onCountChange }) {
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = () => {
    setLoading(true)
    API.get('/admin/clubs/pending')
      .then(r => { setClubs(r.data); onCountChange(r.data.length) })
      .catch(() => showToast('Failed to load pending clubs', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [])

  const approve = async (id) => {
    await API.put(`/admin/clubs/${id}/approve`)
    setClubs(prev => { const n = prev.filter(c => c.id !== id); onCountChange(n.length); return n })
    showToast('Club approved! They can now log in.')
  }

  const reject = async (id) => {
    if (!window.confirm('Reject and permanently delete this club account?')) return
    await API.delete(`/admin/clubs/${id}/reject`)
    setClubs(prev => { const n = prev.filter(c => c.id !== id); onCountChange(n.length); return n })
    showToast('Club application rejected.')
  }

  if (loading) return <Spinner />

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <h2 style={S.pageTitle}>Pending Clubs</h2>
        {clubs.length > 0 && (
          <span style={{ background: 'rgba(167,139,250,0.2)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.4)', borderRadius: 20, padding: '4px 14px', fontSize: 13, fontWeight: 800 }}>
            {clubs.length} awaiting review
          </span>
        )}
      </div>

      {clubs.length === 0 ? (
        <Empty emoji="🏛️" text="All club applications have been reviewed. Nothing pending!" />
      ) : (
        <>
          <div style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 12, padding: '12px 18px', marginBottom: 20, display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 16 }}>ℹ️</span>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: 0 }}>
              Club accounts are blocked from logging in until approved. Review their details before granting access.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {clubs.map(c => (
              <ApprovalCard key={c.id} item={c} type="club" onApprove={approve} onReject={reject} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE — Companies Approval
// ══════════════════════════════════════════════════════════════════════════════
function CompaniesApproval({ showToast, onCountChange }) {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = () => {
    setLoading(true)
    API.get('/admin/companies/pending')
      .then(r => { setCompanies(r.data); onCountChange(r.data.length) })
      .catch(() => showToast('Failed to load pending companies', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [])

  const approve = async (id) => {
    await API.put(`/admin/companies/${id}/approve`)
    setCompanies(prev => { const n = prev.filter(c => c.id !== id); onCountChange(n.length); return n })
    showToast('Company approved! They can now log in.')
  }

  const reject = async (id) => {
    if (!window.confirm('Reject and permanently delete this company account?')) return
    await API.delete(`/admin/companies/${id}/reject`)
    setCompanies(prev => { const n = prev.filter(c => c.id !== id); onCountChange(n.length); return n })
    showToast('Company application rejected.')
  }

  if (loading) return <Spinner />

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <h2 style={S.pageTitle}>Pending Companies</h2>
        {companies.length > 0 && (
          <span style={{ background: 'rgba(251,146,60,0.2)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.4)', borderRadius: 20, padding: '4px 14px', fontSize: 13, fontWeight: 800 }}>
            {companies.length} awaiting review
          </span>
        )}
      </div>

      {companies.length === 0 ? (
        <Empty emoji="🏢" text="All company / recruiter applications have been reviewed. Nothing pending!" />
      ) : (
        <>
          <div style={{ background: 'rgba(251,146,60,0.06)', border: '1px solid rgba(251,146,60,0.2)', borderRadius: 12, padding: '12px 18px', marginBottom: 20, display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 16 }}>ℹ️</span>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: 0 }}>
              Company / recruiter accounts are blocked until approved. Verify legitimacy before granting access to post opportunities.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {companies.map(c => (
              <ApprovalCard key={c.id} item={c} type="company" onApprove={approve} onReject={reject} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE 1 — Analytics Dashboard
// ══════════════════════════════════════════════════════════════════════════════
function AnalyticsDashboard({ pendingClubs, pendingCompanies, setTab }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    API.get('/admin/analytics')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />
  if (!data) return <div style={S.empty}>Failed to load analytics</div>

  const roleColors = { student: '#a78bfa', faculty: '#67e8f9', club: '#34d399', company: '#fb923c', admin: '#fb7185' }

  return (
    <div>
      <h2 style={S.pageTitle}>Analytics Overview</h2>

      {/* Action Required Banner */}
      {(pendingClubs > 0 || pendingCompanies > 0) && (
        <div style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 14, padding: '16px 22px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 22 }}>🔔</span>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#fbbf24', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Action Required</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>
              {pendingClubs > 0 && <span>{pendingClubs} club{pendingClubs > 1 ? 's' : ''} pending approval  </span>}
              {pendingCompanies > 0 && <span>{pendingCompanies} compan{pendingCompanies > 1 ? 'ies' : 'y'} pending approval</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {pendingClubs > 0 && (
              <button onClick={() => setTab('clubs')} style={{ background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.35)', color: '#a78bfa', borderRadius: 10, padding: '7px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                Review Clubs →
              </button>
            )}
            {pendingCompanies > 0 && (
              <button onClick={() => setTab('companies')} style={{ background: 'rgba(251,146,60,0.15)', border: '1px solid rgba(251,146,60,0.35)', color: '#fb923c', borderRadius: 10, padding: '7px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                Review Companies →
              </button>
            )}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 36 }}>
        <StatCard icon="👥" label="Total Users"    value={data.users.total}       color="#a78bfa" />
        <StatCard icon="📅" label="Total Events"   value={data.events.total}      color="#67e8f9" sub={`${data.events.pending} pending · ${data.events.approved} approved`} />
        <StatCard icon="💬" label="Doubts Posted"  value={data.doubts}            color="#f472b6" />
        <StatCard icon="💼" label="Opportunities"  value={data.opportunities}     color="#34d399" />
        <StatCard icon="🏛️" label="Clubs Pending"  value={pendingClubs}           color="#a78bfa" />
        <StatCard icon="🏢" label="Companies Pending" value={pendingCompanies}    color="#fb923c" />
      </div>

      <h3 style={S.sectionTitle}>Users by Role</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 520 }}>
        {Object.entries(data.users.by_role).map(([role, count]) => {
          const pct = data.users.total > 0 ? Math.round((count / data.users.total) * 100) : 0
          return (
            <div key={role}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, textTransform: 'capitalize', fontWeight: 500 }}>{role}</span>
                <span style={{ color: roleColors[role] || '#a78bfa', fontWeight: 700, fontSize: 14 }}>{count} ({pct}%)</span>
              </div>
              <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: roleColors[role] || '#a78bfa', borderRadius: 4, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE 2 — Events Management
// ══════════════════════════════════════════════════════════════════════════════
function EventsManagement({ showToast }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchEvents = () => {
    setLoading(true)
    API.get('/admin/events/pending')
      .then(r => setEvents(r.data))
      .catch(() => showToast('Failed to load events', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { Promise.resolve().then(fetchEvents) }, [])

  const approve = async (id) => {
    try {
      await API.put(`/events/${id}/approve`)
      setEvents(prev => prev.filter(e => e.id !== id))
      showToast('Event approved!')
    } catch { showToast('Failed to approve', 'error') }
  }

  const reject = async (id) => {
    try {
      await API.delete(`/events/${id}`)
      setEvents(prev => prev.filter(e => e.id !== id))
      showToast('Event rejected and deleted.')
    } catch { showToast('Failed to reject', 'error') }
  }

  const CAT_COLORS = { workshop: '#67e8f9', hackathon: '#a78bfa', fest: '#f472b6', seminar: '#34d399', cultural: '#fb923c', other: '#94a3b8', technical: '#a78bfa' }

  if (loading) return <Spinner />

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <h2 style={S.pageTitle}>Pending Events</h2>
        {events.length > 0 && (
          <span style={{ background: 'rgba(244,114,182,0.18)', color: '#f472b6', border: '1px solid rgba(244,114,182,0.35)', borderRadius: 20, padding: '4px 14px', fontSize: 13, fontWeight: 800 }}>
            {events.length} pending
          </span>
        )}
      </div>
      {events.length === 0 ? (
        <Empty emoji="🎉" text="No pending events! All clear." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {events.map(ev => {
            const color = CAT_COLORS[ev.category?.toLowerCase()] || '#94a3b8'
            return (
              <div key={ev.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '22px 26px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{ background: color + '22', color, padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800, letterSpacing: 0.5 }}>{ev.category?.toUpperCase() || 'EVENT'}</span>
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>by {ev.posted_by_email}</span>
                  </div>
                  <h3 style={{ color: 'white', fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 800, marginBottom: 8 }}>{ev.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>{ev.description?.slice(0, 160)}…</p>
                  <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
                    {ev.date  && <span>📅 {ev.date}</span>}
                    {ev.venue && <span>📍 {ev.venue}</span>}
                    {ev.price && <span>💰 ₹{ev.price}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => approve(ev.id)} style={S.approveBtn}>✅ Approve</button>
                  <button onClick={() => reject(ev.id)}  style={S.rejectBtn}>❌ Reject</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE 3 — Users Management
// ══════════════════════════════════════════════════════════════════════════════
function UsersManagement({ showToast }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('all')

  useEffect(() => {
    API.get('/admin/users')
      .then(r => setUsers(r.data))
      .catch(() => showToast('Failed to load users', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const updateRole = async (id, role) => {
    try {
      await API.put(`/admin/users/${id}/role`, { role })
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u))
      showToast(`Role updated to ${role}`)
    } catch { showToast('Failed to update role', 'error') }
  }

  const deleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return
    try {
      await API.delete(`/admin/users/${id}`)
      setUsers(prev => prev.filter(u => u.id !== id))
      showToast('User deleted.')
    } catch { showToast('Failed to delete user', 'error') }
  }

  const ROLES = ['student', 'faculty', 'club', 'company', 'admin']
  const ROLE_COLORS = { student: '#a78bfa', faculty: '#67e8f9', club: '#34d399', company: '#fb923c', admin: '#fb7185' }

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    const matchSearch = u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.role?.toLowerCase().includes(q)
    const matchRole = filterRole === 'all' || u.role === filterRole
    return matchSearch && matchRole
  })

  if (loading) return <Spinner />

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 style={S.pageTitle}>Users</h2>
          <span style={{ color: '#67e8f9', fontSize: 16, fontWeight: 700 }}>({users.length})</span>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            placeholder="Search by name, email or role…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 16px', color: 'white', fontSize: 14, width: 260, fontFamily: 'Inter,sans-serif', outline: 'none' }}
          />
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            style={{ background: '#13102a', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '8px 14px', color: 'rgba(255,255,255,0.7)', fontSize: 13, cursor: 'pointer', fontFamily: 'Inter,sans-serif', outline: 'none' }}
          >
            <option value="all">All roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      <div style={{ overflowX: 'auto', borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
              {['Name', 'Email', 'Role', 'College', 'Actions'].map(h => (
                <th key={h} style={{ padding: '14px 18px', textAlign: 'left', color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', whiteSpace: 'nowrap', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                <td style={{ padding: '13px 18px', color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>{u.name}</td>
                <td style={{ padding: '13px 18px', color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{u.email}</td>
                <td style={{ padding: '13px 18px' }}>
                  <select
                    value={u.role}
                    onChange={e => updateRole(u.id, e.target.value)}
                    style={{ background: '#1a1035', border: `1px solid ${ROLE_COLORS[u.role] || '#a78bfa'}55`, borderRadius: 8, padding: '5px 10px', color: ROLE_COLORS[u.role] || '#a78bfa', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter,sans-serif', outline: 'none' }}
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td style={{ padding: '13px 18px', color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{u.college || '—'}</td>
                <td style={{ padding: '13px 18px' }}>
                  <button onClick={() => deleteUser(u.id, u.name)} style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.3)', color: '#fb7185', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'Inter,sans-serif', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(244,63,94,0.18)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(244,63,94,0.08)'}
                  >
                    🗑 Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={S.empty}>No users found</div>}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE 4 — Announcements
// ══════════════════════════════════════════════════════════════════════════════
function Announcements({ showToast }) {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: '', message: '', target: 'All' })
  const [sending, setSending] = useState(false)

  const fetchList = () => {
    API.get('/admin/announcements')
      .then(r => setList(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchList() }, [])

  const send = async (e) => {
    e.preventDefault()
    if (!form.title || !form.message) return showToast('Title and message are required', 'error')
    setSending(true)
    try {
      await API.post('/admin/announcements', form)
      showToast('Announcement sent!')
      setForm({ title: '', message: '', target: 'All' })
      fetchList()
    } catch { showToast('Failed to send announcement', 'error') }
    finally { setSending(false) }
  }

  const TARGETS = ['All', 'Students', 'Faculty', 'Clubs', 'Companies']
  const TARGET_COLORS = { All: '#a78bfa', Students: '#67e8f9', Faculty: '#34d399', Clubs: '#f472b6', Companies: '#fb923c' }

  return (
    <div>
      <h2 style={S.pageTitle}>Announcements</h2>

      <div style={{ ...S.card, marginBottom: 36, flexDirection: 'column', gap: 16 }}>
        <h3 style={{ color: 'white', fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 800, margin: 0 }}>📣 Send New Announcement</h3>
        <form onSubmit={send} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input placeholder="Title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} style={S.input} />
          <textarea placeholder="Message…" value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} rows={4} style={{ ...S.input, resize: 'vertical' }} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {TARGETS.map(t => (
              <button key={t} type="button" onClick={() => setForm(p => ({ ...p, target: t }))}
                style={{ padding: '7px 16px', borderRadius: 20, border: `1px solid ${form.target === t ? TARGET_COLORS[t] + '88' : 'rgba(255,255,255,0.1)'}`, background: form.target === t ? TARGET_COLORS[t] + '20' : 'transparent', color: form.target === t ? TARGET_COLORS[t] : 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: form.target === t ? 700 : 400, cursor: 'pointer', fontFamily: 'Inter,sans-serif', transition: 'all 0.15s' }}>
                {t}
              </button>
            ))}
          </div>
          <button type="submit" disabled={sending} style={{ background: sending ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg,#7c3aed,#a78bfa)', color: 'white', border: 'none', borderRadius: 12, padding: '13px 24px', fontWeight: 800, fontSize: 15, cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.7 : 1, fontFamily: 'Syne,sans-serif', letterSpacing: 0.3 }}>
            {sending ? 'Sending…' : '📣 Send Announcement'}
          </button>
        </form>
      </div>

      <h3 style={S.sectionTitle}>Past Announcements</h3>
      {loading ? <Spinner /> : list.length === 0 ? (
        <Empty emoji="📭" text="No announcements yet" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {list.map(a => (
            <div key={a.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '16px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 12, flexWrap: 'wrap' }}>
                <h4 style={{ color: 'white', fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700, margin: 0 }}>{a.title}</h4>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                  <span style={{ background: (TARGET_COLORS[a.target] || '#a78bfa') + '22', color: TARGET_COLORS[a.target] || '#a78bfa', border: `1px solid ${(TARGET_COLORS[a.target] || '#a78bfa')}44`, padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{a.target}</span>
                  <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>{new Date(a.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>{a.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN ADMIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [user] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'))
  const [toast, setToast] = useState({ msg: '', type: 'success' })
  const [pendingClubs, setPendingClubs] = useState(0)
  const [pendingCompanies, setPendingCompanies] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    if (user.role !== 'admin') { navigate('/dashboard') }
  }, [user, navigate])

  // Pre-fetch pending counts for sidebar badges
  useEffect(() => {
    if (user.role !== 'admin') return
    API.get('/admin/clubs/pending').then(r => setPendingClubs(r.data.length)).catch(() => {})
    API.get('/admin/companies/pending').then(r => setPendingCompanies(r.data.length)).catch(() => {})
  }, [user.role])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3500)
  }

  if (!user) return null

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':     return <AnalyticsDashboard pendingClubs={pendingClubs} pendingCompanies={pendingCompanies} setTab={setActiveTab} />
      case 'clubs':         return <ClubsApproval showToast={showToast} onCountChange={setPendingClubs} />
      case 'companies':     return <CompaniesApproval showToast={showToast} onCountChange={setPendingCompanies} />
      case 'events':        return <EventsManagement showToast={showToast} />
      case 'users':         return <UsersManagement showToast={showToast} />
      case 'announcements': return <Announcements showToast={showToast} />
      default:              return <AnalyticsDashboard pendingClubs={pendingClubs} pendingCompanies={pendingCompanies} setTab={setActiveTab} />
    }
  }

  const badgeCounts = { clubs: pendingClubs, companies: pendingCompanies }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#050510 0%,#0d0820 40%,#060315 100%)', fontFamily: "'Inter',sans-serif", color: 'white', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        .admin-tab-btn:hover { background: rgba(255,255,255,0.05) !important; color: rgba(255,255,255,0.8) !important; }
      `}</style>
      <Toast msg={toast.msg} type={toast.type} />

      {/* Top navbar */}
      <nav style={{ background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.07)', height: 64, padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}><UniLinkLogo /></div>
        <span style={{ background: 'rgba(251,113,133,0.12)', border: '1px solid rgba(251,113,133,0.28)', color: '#fb7185', padding: '6px 18px', borderRadius: 20, fontSize: 12, fontWeight: 800, letterSpacing: 1 }}>🛡️ ADMIN PANEL</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>{user.name}</span>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', borderRadius: 10, padding: '7px 16px', cursor: 'pointer', fontSize: 13, fontFamily: 'Inter,sans-serif' }}>← Back</button>
        </div>
      </nav>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside style={{ width: 228, background: 'rgba(255,255,255,0.015)', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '28px 12px', display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
          <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', padding: '0 8px', marginBottom: 8 }}>Navigation</div>
          {TABS.map(t => {
            const isActive = activeTab === t.key
            const cnt = badgeCounts[t.key]
            return (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className="admin-tab-btn"
                style={{
                  background: isActive ? 'rgba(167,139,250,0.14)' : 'transparent',
                  border: isActive ? '1px solid rgba(167,139,250,0.28)' : '1px solid transparent',
                  color: isActive ? '#a78bfa' : 'rgba(255,255,255,0.4)',
                  borderRadius: 12, padding: '11px 14px', cursor: 'pointer', fontSize: 14,
                  fontWeight: isActive ? 700 : 400, textAlign: 'left',
                  fontFamily: 'Inter,sans-serif', width: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  transition: 'all 0.15s',
                }}>
                <span>{t.icon} {t.label}</span>
                {cnt > 0 && <Badge count={cnt} color={t.key === 'clubs' ? '#a78bfa' : '#fb923c'} />}
              </button>
            )
          })}
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, padding: '36px 40px', overflowX: 'auto', minWidth: 0 }}>
          {renderPage()}
        </main>
      </div>
    </div>
  )
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const S = {
  pageTitle:    { fontFamily: 'Syne,sans-serif', fontSize: 26, fontWeight: 800, color: 'white', margin: 0 },
  sectionTitle: { fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 16, marginTop: 8 },
  card:         { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '22px 26px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 },
  empty:        { textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.25)', fontSize: 15 },
  approveBtn:   { background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399', padding: '9px 18px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'Inter,sans-serif', whiteSpace: 'nowrap' },
  rejectBtn:    { background: 'rgba(244,63,94,0.08)',  border: '1px solid rgba(244,63,94,0.3)',  color: '#fb7185', padding: '9px 18px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'Inter,sans-serif', whiteSpace: 'nowrap' },
  input:        { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px 14px', color: 'white', fontSize: 14, fontFamily: 'Inter,sans-serif', width: '100%', outline: 'none' },
}
