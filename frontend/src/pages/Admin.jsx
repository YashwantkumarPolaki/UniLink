import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import API from '../api'
import UniLinkLogo from '../components/UniLinkLogo'

// ── Sidebar tabs ──────────────────────────────────────────────────────────────
const TABS = [
  { key: 'dashboard', label: '📊 Dashboard', icon: '📊' },
  { key: 'events',    label: '📅 Events',    icon: '📅' },
  { key: 'users',     label: '👥 Users',     icon: '👥' },
  { key: 'announcements', label: '📣 Announcements', icon: '📣' },
]

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, type }) {
  if (!msg) return null
  const bg = type === 'error' ? 'rgba(244,63,94,0.15)' : 'rgba(52,211,153,0.15)'
  const border = type === 'error' ? 'rgba(244,63,94,0.4)' : 'rgba(52,211,153,0.4)'
  const color = type === 'error' ? '#fb7185' : '#34d399'
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, background: bg, border: `1px solid ${border}`, color, padding: '12px 20px', borderRadius: 12, fontSize: 14, fontWeight: 600, maxWidth: 320 }}>
      {msg}
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner() {
  return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><div style={{ width: 36, height: 36, border: '3px solid rgba(167,139,250,0.2)', borderTop: '3px solid #a78bfa', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></div>
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color, sub }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: color + '22', border: `1px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 28, fontWeight: 800, color }}>{value}</div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{label}</div>
        {sub && <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE 1 — Analytics Dashboard
// ══════════════════════════════════════════════════════════════════════════════
function AnalyticsDashboard() {
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard icon="👥" label="Total Users" value={data.users.total} color="#a78bfa" />
        <StatCard icon="📅" label="Total Events" value={data.events.total} color="#67e8f9" sub={`${data.events.pending} pending · ${data.events.approved} approved`} />
        <StatCard icon="💬" label="Doubts Posted" value={data.doubts} color="#f472b6" />
        <StatCard icon="💼" label="Opportunities" value={data.opportunities} color="#34d399" />
      </div>

      <h3 style={S.sectionTitle}>Users by Role</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480 }}>
        {Object.entries(data.users.by_role).map(([role, count]) => {
          const pct = data.users.total > 0 ? Math.round((count / data.users.total) * 100) : 0
          return (
            <div key={role}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, textTransform: 'capitalize' }}>{role}</span>
                <span style={{ color: roleColors[role] || '#a78bfa', fontWeight: 700, fontSize: 14 }}>{count} ({pct}%)</span>
              </div>
              <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: roleColors[role] || '#a78bfa', borderRadius: 4, transition: 'width 0.6s ease' }} />
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

  useEffect(() => { fetchEvents() }, [])

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
      <h2 style={S.pageTitle}>Pending Events <span style={{ color: '#f472b6', fontSize: 18 }}>({events.length})</span></h2>
      {events.length === 0 ? (
        <div style={S.empty}><div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div><p>No pending events! All clear.</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {events.map(ev => {
            const color = CAT_COLORS[ev.category?.toLowerCase()] || '#94a3b8'
            return (
              <div key={ev.id} style={S.card}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ background: color + '22', color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{ev.category?.toUpperCase() || 'EVENT'}</span>
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>by {ev.posted_by_email}</span>
                  </div>
                  <h3 style={{ color: 'white', fontFamily: 'Syne,sans-serif', fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{ev.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.6, marginBottom: 10 }}>{ev.description?.slice(0, 150)}...</p>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                    {ev.date && <span>📅 {ev.date}</span>}
                    {ev.venue && <span>📍 {ev.venue}</span>}
                    {ev.price && <span>💰 ₹{ev.price}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => approve(ev.id)} style={S.approveBtn}>✅ Approve</button>
                  <button onClick={() => reject(ev.id)} style={S.rejectBtn}>❌ Reject</button>
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

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <Spinner />

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={S.pageTitle}>Users <span style={{ color: '#67e8f9', fontSize: 18 }}>({users.length})</span></h2>
        <input
          placeholder="Search by name, email or role..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 16px', color: 'white', fontSize: 14, width: 280, fontFamily: 'Inter,sans-serif' }}
        />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {['Name', 'Email', 'Role', 'College', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{u.name}</td>
                <td style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{u.email}</td>
                <td style={{ padding: '14px 16px' }}>
                  <select
                    value={u.role}
                    onChange={e => updateRole(u.id, e.target.value)}
                    style={{ background: '#1a1035', border: `1px solid ${ROLE_COLORS[u.role] || '#a78bfa'}44`, borderRadius: 8, padding: '5px 10px', color: ROLE_COLORS[u.role] || '#a78bfa', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{u.college || '—'}</td>
                <td style={{ padding: '14px 16px' }}>
                  <button onClick={() => deleteUser(u.id, u.name)} style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', color: '#fb7185', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'Inter,sans-serif' }}>
                    Delete
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

  return (
    <div>
      <h2 style={S.pageTitle}>Announcements</h2>

      {/* Send form */}
      <div style={{ ...S.card, marginBottom: 32, flexDirection: 'column', gap: 16 }}>
        <h3 style={{ color: 'white', fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 700 }}>Send New Announcement</h3>
        <form onSubmit={send} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            placeholder="Title"
            value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            style={S.input}
          />
          <textarea
            placeholder="Message..."
            value={form.message}
            onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
            rows={4}
            style={{ ...S.input, resize: 'vertical' }}
          />
          <select
            value={form.target}
            onChange={e => setForm(p => ({ ...p, target: e.target.value }))}
            style={{ ...S.input, cursor: 'pointer' }}
          >
            {TARGETS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <button type="submit" disabled={sending} style={{ background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', color: 'white', border: 'none', borderRadius: 12, padding: '12px 24px', fontWeight: 700, fontSize: 15, cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.7 : 1, fontFamily: 'Syne,sans-serif' }}>
            {sending ? 'Sending...' : '📣 Send Announcement'}
          </button>
        </form>
      </div>

      {/* Past announcements */}
      <h3 style={S.sectionTitle}>Past Announcements</h3>
      {loading ? <Spinner /> : list.length === 0 ? (
        <div style={S.empty}>No announcements yet</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {list.map(a => (
            <div key={a.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 12, flexWrap: 'wrap' }}>
                <h4 style={{ color: 'white', fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700 }}>{a.title}</h4>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                  <span style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{a.target}</span>
                  <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>{new Date(a.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.6 }}>{a.message}</p>
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
  const [user, setUser] = useState(null)
  const [toast, setToast] = useState({ msg: '', type: 'success' })
  const navigate = useNavigate()

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || '{}')
    if (u.role !== 'admin') { navigate('/dashboard'); return }
    setUser(u)
  }, [])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3000)
  }

  if (!user) return null

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':     return <AnalyticsDashboard />
      case 'events':        return <EventsManagement showToast={showToast} />
      case 'users':         return <UsersManagement showToast={showToast} />
      case 'announcements': return <Announcements showToast={showToast} />
      default:              return <AnalyticsDashboard />
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#050510 0%,#0d0820 40%,#060315 100%)', fontFamily: "'Inter',sans-serif", color: 'white', display: 'flex', flexDirection: 'column' }}>
      <Toast msg={toast.msg} type={toast.type} />

      {/* Top navbar */}
      <nav style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.07)', height: 64, padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}><UniLinkLogo /></div>
        <span style={{ background: 'rgba(251,113,133,0.15)', border: '1px solid rgba(251,113,133,0.3)', color: '#fb7185', padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>🛡️ ADMIN PANEL</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>{user.name}</span>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', borderRadius: 10, padding: '7px 14px', cursor: 'pointer', fontSize: 13 }}>← Back</button>
        </div>
      </nav>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside style={{ width: 220, background: 'rgba(255,255,255,0.02)', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '24px 12px', display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }} className="admin-sidebar">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              background: activeTab === t.key ? 'rgba(167,139,250,0.15)' : 'transparent',
              border: activeTab === t.key ? '1px solid rgba(167,139,250,0.3)' : '1px solid transparent',
              color: activeTab === t.key ? '#a78bfa' : 'rgba(255,255,255,0.45)',
              borderRadius: 12, padding: '11px 16px', cursor: 'pointer', fontSize: 14,
              fontWeight: activeTab === t.key ? 600 : 400,
              textAlign: 'left', fontFamily: 'Inter,sans-serif', width: '100%',
            }}>{t.label}</button>
          ))}
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, padding: '32px', overflowX: 'auto' }}>
          {renderPage()}
        </main>
      </div>
    </div>
  )
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const S = {
  pageTitle: { fontFamily: 'Syne,sans-serif', fontSize: 24, fontWeight: 800, color: 'white', marginBottom: 24 },
  sectionTitle: { fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 16, marginTop: 8 },
  card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 },
  empty: { textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.3)', fontSize: 15 },
  approveBtn: { background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399', padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'Inter,sans-serif', whiteSpace: 'nowrap' },
  rejectBtn: { background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', color: '#fb7185', padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'Inter,sans-serif', whiteSpace: 'nowrap' },
  input: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', color: 'white', fontSize: 14, fontFamily: 'Inter,sans-serif', width: '100%', outline: 'none' },
}
