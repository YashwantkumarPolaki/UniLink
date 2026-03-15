import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api'

export default function Admin() {
  const [user, setUser] = useState(null)
  const [pendingEvents, setPendingEvents] = useState([])
  const [allEvents, setAllEvents] = useState([])
  const [tab, setTab] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      const u = await API.get('/auth/me')
      const userData = u.data.user
      setUser(userData)
      if (userData.role !== 'admin') { navigate('/dashboard'); return }
    } catch { navigate('/login'); return }

    try {
      const res = await API.get('/events/')
      const all = res.data
      setPendingEvents(all.filter(e => e.status === 'pending'))
      setAllEvents(all)
    } catch { }

    setLoading(false)
  }

  const approveEvent = async (id) => {
    try {
      await API.put(`/events/${id}/approve`)
      setMessage('✅ Event approved successfully!')
      fetchAll()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.detail || 'Failed to approve'))
    }
  }

  const rejectEvent = async (id) => {
    try {
      await API.delete(`/events/${id}`)
      setMessage('🗑️ Event rejected and deleted!')
      fetchAll()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.detail || 'Failed to reject'))
    }
  }

  const TABS = [
    { key: 'pending', label: '⏳ Pending Approval', count: pendingEvents.length },
    { key: 'all', label: '📋 All Events', count: allEvents.length },
  ]

  return (
    <div style={S.root}>
      <div style={S.bg1} /><div style={S.bg2} />

      <nav style={S.nav}>
        <div style={S.brand} onClick={() => navigate('/dashboard')}>
          <span style={S.brandUni}>Uni</span><span style={S.brandLink}>Link</span>
        </div>
        <div style={S.navCenter}>
          <span style={S.adminBadge}>🛡️ ADMIN PANEL</span>
        </div>
        <span style={S.navUser}>👤 {user?.name || 'Admin'}</span>
      </nav>

      <div style={S.page}>
        <div style={S.header}>
          <h1 style={S.pageTitle}>Admin Panel 🛡️</h1>
          <p style={S.pageSub}>Manage events, users and platform content</p>
        </div>

        <div style={S.statsRow}>
          {[
            { icon: '⏳', label: 'Pending Events', value: pendingEvents.length, color: '#f472b6' },
            { icon: '✅', label: 'Approved Events', value: allEvents.filter(e => e.status === 'approved').length, color: '#34d399' },
            { icon: '📋', label: 'Total Events', value: allEvents.length, color: '#a78bfa' },
          ].map(s => (
            <div key={s.label} style={S.statCard}>
              <span style={{ fontSize: 32 }}>{s.icon}</span>
              <div>
                <div style={{ ...S.statValue, color: s.color }}>{s.value}</div>
                <div style={S.statLabel}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {message && <div style={S.message}>{message}</div>}

        <div style={S.tabs}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ ...S.tabBtn, ...(tab === t.key ? S.tabActive : {}) }}>
              {t.label}
              <span style={S.tabCount}>{t.count}</span>
            </button>
          ))}
        </div>

        {tab === 'pending' && (
          <div style={S.section}>
            {loading ? (
              <div style={S.empty}>Loading...</div>
            ) : pendingEvents.length === 0 ? (
              <div style={S.empty}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
                <p>No pending events! All clear.</p>
              </div>
            ) : (
              pendingEvents.map(event => (
                <EventRow key={event.id} event={event}
                  onApprove={() => approveEvent(event.id)}
                  onReject={() => rejectEvent(event.id)} />
              ))
            )}
          </div>
        )}

        {tab === 'all' && (
          <div style={S.section}>
            {allEvents.length === 0 ? (
              <div style={S.empty}>No events yet</div>
            ) : (
              allEvents.map(event => (
                <EventRow key={event.id} event={event}
                  onApprove={() => approveEvent(event.id)}
                  onReject={() => rejectEvent(event.id)}
                  showStatus />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function EventRow({ event, onApprove, onReject, showStatus }) {
  const CAT_COLORS = {
    workshop: '#67e8f9', hackathon: '#a78bfa', fest: '#f472b6',
    seminar: '#34d399', cultural: '#fb923c', other: '#94a3b8', technical: '#a78bfa'
  }
  const color = CAT_COLORS[event.category?.toLowerCase()] || '#94a3b8'

  return (
    <div style={S.eventRow}>
      <div style={S.eventRowLeft}>
        <span style={{ background: color + '20', color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>
          {event.category?.toUpperCase()}
        </span>
        <h3 style={S.eventTitle}>{event.title}</h3>
        <p style={S.eventDesc}>{event.description?.slice(0, 120)}...</p>
        <div style={S.eventMeta}>
          <span>📅 {event.date}</span>
          <span>📍 {event.venue}</span>
          <span>👤 {event.posted_by_email}</span>
          {event.price && event.price !== 'Free' && <span>💰 ₹{event.price}</span>}
        </div>
      </div>
      <div style={S.eventRowRight}>
        {showStatus && (
          <span style={{
            padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
            background: event.status === 'approved' ? 'rgba(52,211,153,0.15)' : 'rgba(244,63,94,0.15)',
            color: event.status === 'approved' ? '#34d399' : '#fb7185',
            marginBottom: 12, display: 'block', textAlign: 'center'
          }}>
            {event.status?.toUpperCase()}
          </span>
        )}
        {event.status === 'pending' && (
          <>
            <button onClick={onApprove} style={S.approveBtn}>✅ Approve</button>
            <button onClick={onReject} style={S.rejectBtn}>❌ Reject</button>
          </>
        )}
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
  navCenter: { position: 'absolute', left: '50%', transform: 'translateX(-50%)' },
  adminBadge: { background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', color: '#a78bfa', padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: 1 },
  navUser: { fontSize: 14, color: 'rgba(255,255,255,0.5)' },
  page: { maxWidth: 1000, margin: '0 auto', padding: '40px 24px' },
  header: { marginBottom: 32 },
  pageTitle: { fontFamily: 'Syne,sans-serif', fontSize: 32, fontWeight: 800, marginBottom: 8 },
  pageSub: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 32 },
  statCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 },
  statValue: { fontFamily: 'Syne,sans-serif', fontSize: 28, fontWeight: 800 },
  statLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 13 },
  message: { background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399', padding: '12px 16px', borderRadius: 12, marginBottom: 24, fontSize: 14, textAlign: 'center' },
  tabs: { display: 'flex', gap: 8, marginBottom: 24 },
  tabBtn: { padding: '10px 20px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 14, fontFamily: 'Inter,sans-serif', display: 'flex', alignItems: 'center', gap: 8 },
  tabActive: { background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.4)', color: '#a78bfa', fontWeight: 600 },
  tabCount: { background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: 10, fontSize: 12 },
  section: { display: 'flex', flexDirection: 'column', gap: 16 },
  empty: { textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.3)', fontSize: 15 },
  eventRow: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24 },
  eventRowLeft: { flex: 1, display: 'flex', flexDirection: 'column', gap: 8 },
  eventRowRight: { display: 'flex', flexDirection: 'column', gap: 8, minWidth: 120 },
  eventTitle: { fontFamily: 'Syne,sans-serif', fontSize: 17, fontWeight: 700, color: 'white' },
  eventDesc: { color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.6 },
  eventMeta: { display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, color: 'rgba(255,255,255,0.35)' },
  approveBtn: { background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399', padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'Inter,sans-serif' },
  rejectBtn: { background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', color: '#fb7185', padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'Inter,sans-serif' },
}
