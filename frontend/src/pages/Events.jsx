import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api'
import Navbar from '../components/Navbar'

const CATEGORIES = ['All', 'Workshop', 'Hackathon', 'Fest', 'Seminar', 'Cultural']
const CAT_ICONS = { All: '🌐', Workshop: '🛠️', Hackathon: '💻', Fest: '🎉', Seminar: '🎓', Cultural: '🎭' }
const CAT_COLORS = { workshop: '#67e8f9', hackathon: '#a78bfa', fest: '#f472b6', seminar: '#34d399', cultural: '#fb923c', other: '#94a3b8' }

export default function Events() {
  const [events, setEvents] = useState([])
  const [recommended, setRecommended] = useState([])
  const [myPosts, setMyPosts] = useState([])
  const [category, setCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [selected, setSelected] = useState(null)
  const [registeredIds, setRegisteredIds] = useState(new Set())
  const navigate = useNavigate()

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    let currentUser = null
    try {
      const u = await API.get('/auth/me')
      currentUser = u.data.user
      setUser(currentUser)
    } catch { navigate('/login'); return }

    let allEvents = []
    try {
      const res = await API.get('/events/')
      allEvents = res.data.filter(e => e.status === 'approved')
      setEvents(allEvents)
    } catch { setEvents([]) }

    // Build registeredIds from event data
    if (currentUser) {
      const alreadyRegistered = new Set(
        allEvents
          .filter(e => Array.isArray(e.registered_users) && e.registered_users.includes(currentUser.id))
          .map(e => e.id)
      )
      setRegisteredIds(alreadyRegistered)
    }

    try {
      const rec = await API.get('/events/recommended')
      setRecommended(rec.data.recommended || [])
    } catch { setRecommended([]) }

    // Fetch my posted events (for club/company users)
    if (currentUser && (currentUser.role === 'club' || currentUser.role === 'admin')) {
      try {
        const mine = await API.get('/events/my')
        setMyPosts(mine.data)
      } catch { setMyPosts([]) }
    }

    setLoading(false)
  }

  const handleRegister = async (eventId, registrationLink) => {
    try {
      await API.post(`/events/${eventId}/register`)
      setRegisteredIds(prev => new Set([...prev, eventId]))
    } catch {
      // already registered or error — still open the link
    }
    if (registrationLink) window.open(registrationLink, '_blank')
  }

  const filtered = category === 'All'
    ? events
    : events.filter(e => e.category?.toLowerCase() === category.toLowerCase())

  // Workshops & Hackathons specifically for user's branch
  const branchSpecific = recommended.filter(
    e => e.category === 'workshop' || e.category === 'hackathon'
  )

  const categoryTitle = category === 'All' ? 'All Events' : `${category}s`

  return (
    <div style={S.root}>
      <div style={S.bg1} /><div style={S.bg2} /><div style={S.bg3} />

      <Navbar />

      <div style={S.page}>
        {/* Header */}
        <div style={S.header}>
          <div>
            <h1 style={S.pageTitle}>Events 🎯</h1>
            <p style={S.pageSub}>Discover events tailored for <span style={{color:'#a78bfa'}}>{user?.branch || 'your branch'}</span></p>
          </div>
          {user && (user.role === 'club' || user.role === 'admin') && (
            <button style={S.postBtn} onClick={() => navigate('/events/post')}>+ Post Event</button>
          )}
        </div>

        {/* My Posts — visible only to club/admin who posted */}
        {myPosts.length > 0 && (
          <div style={{ ...S.section, background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.12)', borderRadius: 20, padding: '24px 28px', marginBottom: 32 }}>
            <div style={S.secHead}>
              <span style={S.secIcon}>📋</span>
              <h2 style={S.secTitle}>My Posts</h2>
              <span style={{ ...S.tag, background: 'rgba(167,139,250,0.15)', color: '#a78bfa' }}>{myPosts.length} post{myPosts.length !== 1 ? 's' : ''}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {myPosts.map(ev => {
                const isPending = ev.status === 'pending'
                const color = isPending ? '#fb923c' : '#34d399'
                return (
                  <div key={ev.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '14px 20px', gap: 16, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ color: 'white', fontWeight: 700, fontSize: 15, fontFamily: 'Syne,sans-serif', marginBottom: 4 }}>{ev.title}</div>
                      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>{ev.category} · {ev.date}</div>
                    </div>
                    <span style={{ background: color + '22', color, border: `1px solid ${color}44`, padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                      {isPending ? '⏳ Pending Approval' : '✅ Approved'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Recommended for You — all categories */}
        {recommended.length > 0 && (
          <div style={S.section}>
            <div style={S.secHead}>
              <span style={S.secIcon}>⭐</span>
              <h2 style={S.secTitle}>Recommended for You</h2>
              <span style={S.tag}>{user?.branch}</span>
            </div>
            <div style={S.grid}>
              {recommended.slice(0, 3).map(e => (
                <EventCard
                  key={e.id} event={e}
                  onClick={() => setSelected(e)}
                  glow
                  isRegistered={registeredIds.has(e.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Workshops & Hackathons for Your Branch */}
        {branchSpecific.length > 0 && (
          <div style={S.section}>
            <div style={S.secHead}>
              <span style={S.secIcon}>🧠</span>
              <h2 style={S.secTitle}>Workshops &amp; Hackathons — For Your Branch</h2>
              <span style={{...S.tag, background:'rgba(103,232,249,0.15)', color:'#67e8f9'}}>
                {user?.branch}
              </span>
              {user?.department && (
                <span style={{...S.tag, background:'rgba(52,211,153,0.12)', color:'#34d399', marginLeft:4}}>
                  {user.department}
                </span>
              )}
            </div>
            <p style={S.secSub}>
              These workshops and hackathons match your specialization in {user?.branch}
              {user?.department ? ` — ${user.department}` : ''}.
            </p>
            <div style={S.grid}>
              {branchSpecific.map(e => (
                <EventCard
                  key={e.id} event={e}
                  onClick={() => setSelected(e)}
                  specialMatch
                  isRegistered={registeredIds.has(e.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div style={S.filterBar}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              style={{...S.filterBtn, ...(category===cat ? S.filterActive : {})}}>
              {CAT_ICONS[cat]} {cat}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        <div style={S.section}>
          <h2 style={S.secTitle}>
            {categoryTitle}
            <span style={S.countTag}>{filtered.length} events</span>
          </h2>

          {loading ? (
            <div style={S.empty}>⏳ Loading events...</div>
          ) : filtered.length === 0 ? (
            <div style={S.empty}>
              <div style={{fontSize:48,marginBottom:16}}>📭</div>
              <p>No {category === 'All' ? '' : category} events found</p>
              <p style={{fontSize:13,color:'rgba(255,255,255,0.3)',marginTop:8}}>Check back later!</p>
            </div>
          ) : (
            <div style={S.grid}>
              {filtered.map(e => (
                <EventCard
                  key={e.id} event={e}
                  onClick={() => setSelected(e)}
                  isRegistered={registeredIds.has(e.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {selected && (
        <EventModal
          event={selected}
          isRegistered={registeredIds.has(selected.id)}
          onClose={() => setSelected(null)}
          onRegister={handleRegister}
        />
      )}
    </div>
  )
}

function EventCard({ event, onClick, glow, specialMatch, isRegistered }) {
  const color = CAT_COLORS[event.category?.toLowerCase()] || '#94a3b8'
  const registeredCount = event.registered_users?.length || 0
  return (
    <div onClick={onClick} style={{
      background: 'rgba(255,255,255,0.04)',
      backdropFilter: 'blur(24px)',
      border: `1px solid ${glow || specialMatch ? 'rgba(167,139,250,0.35)' : 'rgba(255,255,255,0.07)'}`,
      borderRadius: 20, padding: 24, cursor: 'pointer',
      boxShadow: glow || specialMatch ? '0 0 24px rgba(167,139,250,0.1)' : 'none',
      transition: 'transform 0.2s, box-shadow 0.2s', position: 'relative',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 12px 40px rgba(0,0,0,0.3)' }}
      onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=glow||specialMatch?'0 0 24px rgba(167,139,250,0.1)':'none' }}
    >
      {/* Registered badge */}
      {isRegistered && (
        <div style={{
          position:'absolute', top:14, right:14,
          background:'rgba(52,211,153,0.15)', border:'1px solid rgba(52,211,153,0.4)',
          color:'#34d399', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700
        }}>✓ Registered</div>
      )}

      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
        <span style={{background:color+'20', color, padding:'4px 12px', borderRadius:20, fontSize:11, fontWeight:700, letterSpacing:1}}>
          {event.category?.toUpperCase()}
        </span>
        {glow && !isRegistered && <span style={{fontSize:11,color:'#a78bfa',fontWeight:600}}>⭐ RECOMMENDED</span>}
        {specialMatch && !isRegistered && <span style={{fontSize:11,color:'#67e8f9',fontWeight:600}}>🧠 BRANCH MATCH</span>}
      </div>

      <h3 style={{fontFamily:'Syne,sans-serif', fontSize:17, fontWeight:700, color:'white', marginBottom:8, lineHeight:1.4}}>
        {event.title}
      </h3>
      <p style={{color:'rgba(255,255,255,0.4)', fontSize:13, lineHeight:1.6, marginBottom:16}}>
        {event.description?.slice(0,90)}{event.description?.length > 90 ? '...' : ''}
      </p>

      <div style={{display:'flex', flexDirection:'column', gap:6, marginBottom:16}}>
        <span style={{color:'rgba(255,255,255,0.5)', fontSize:12}}>📅 {event.date} &nbsp;|&nbsp; 🕐 {event.time}</span>
        <span style={{color:'rgba(255,255,255,0.5)', fontSize:12}}>📍 {event.venue}</span>
        {event.eligible_branches?.length > 0 && (
          <span style={{color:'rgba(255,255,255,0.5)', fontSize:12}}>🎓 {event.eligible_branches.join(', ')}</span>
        )}
        {event.last_date_to_register && (
          <span style={{color:'rgba(255,255,255,0.4)', fontSize:12}}>⏰ Register by {event.last_date_to_register}</span>
        )}
      </div>

      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <span style={{
            background: event.price==='Free' ? 'rgba(52,211,153,0.15)' : 'rgba(167,139,250,0.15)',
            color: event.price==='Free' ? '#34d399' : '#a78bfa',
            padding:'5px 14px', borderRadius:20, fontSize:12, fontWeight:700
          }}>
            {!event.price || event.price==='Free' ? '🆓 Free' : '💰 ₹'+event.price}
          </span>
          {registeredCount > 0 && (
            <span style={{color:'rgba(255,255,255,0.3)', fontSize:12}}>👥 {registeredCount}</span>
          )}
        </div>
        <span style={{color:'#a78bfa', fontSize:13, fontWeight:600}}>View Details →</span>
      </div>
    </div>
  )
}

function EventModal({ event, isRegistered: initialRegistered, onClose, onRegister }) {
  const [registered, setRegistered] = useState(initialRegistered)
  const [registering, setRegistering] = useState(false)
  const registeredCount = event.registered_users?.length || 0

  const handleRegister = async () => {
    if (registering) return
    setRegistering(true)
    await onRegister(event.id, event.registration_link)
    setRegistered(true)
    setRegistering(false)
  }

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.7)',
      backdropFilter:'blur(8px)', zIndex:1000,
      display:'flex', alignItems:'center', justifyContent:'center', padding:24
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background:'linear-gradient(160deg,#0d0820,#050510)',
        border:'1px solid rgba(167,139,250,0.2)',
        borderRadius:28, padding:40, maxWidth:600, width:'100%',
        maxHeight:'85vh', overflowY:'auto', position:'relative',
        boxShadow:'0 40px 80px rgba(0,0,0,0.6)'
      }}>
        <button onClick={onClose} style={{
          position:'absolute', top:20, right:20,
          background:'rgba(255,255,255,0.08)', border:'none',
          color:'white', width:36, height:36, borderRadius:'50%',
          cursor:'pointer', fontSize:16
        }}>✕</button>

        <div style={{display:'flex', alignItems:'center', gap:12, flexWrap:'wrap', marginBottom:16}}>
          <span style={{
            background: (CAT_COLORS[event.category?.toLowerCase()]||'#94a3b8')+'20',
            color: CAT_COLORS[event.category?.toLowerCase()]||'#94a3b8',
            padding:'4px 14px', borderRadius:20, fontSize:11, fontWeight:700, letterSpacing:1
          }}>{event.category?.toUpperCase()}</span>
          {registered && (
            <span style={{background:'rgba(52,211,153,0.15)', border:'1px solid rgba(52,211,153,0.4)', color:'#34d399', padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:700}}>
              ✓ You're Registered
            </span>
          )}
          {registeredCount > 0 && (
            <span style={{color:'rgba(255,255,255,0.35)', fontSize:13}}>
              👥 {registeredCount} registered
            </span>
          )}
        </div>

        <h2 style={{fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, color:'white', margin:'0 0 8px'}}>
          {event.title}
        </h2>
        <p style={{color:'rgba(255,255,255,0.5)', fontSize:14, lineHeight:1.8, marginBottom:28}}>
          {event.description}
        </p>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:28}}>
          {[
            {icon:'📅', label:'Date', val: event.date},
            {icon:'🕐', label:'Time', val: event.time},
            {icon:'📍', label:'Venue', val: event.venue},
            {icon:'💰', label:'Entry Fee', val: event.price==='Free' ? '🆓 Free' : '₹'+event.price},
            {icon:'👥', label:'Team Size', val: event.team_size},
            {icon:'🏆', label:'Prizes / Perks', val: event.prizes},
            {icon:'⏰', label:'Last Date to Register', val: event.last_date_to_register},
            {icon:'🎓', label:'Eligible Branches', val: event.eligible_branches?.join(', ')},
          ].filter(item => item.val).map(item => (
            <div key={item.label} style={{
              background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)',
              borderRadius:14, padding:'14px 16px', display:'flex', gap:12, alignItems:'flex-start'
            }}>
              <span style={{fontSize:20}}>{item.icon}</span>
              <div>
                <div style={{fontSize:11, color:'rgba(255,255,255,0.35)', fontWeight:600, letterSpacing:1, textTransform:'uppercase', marginBottom:4}}>{item.label}</div>
                <div style={{fontSize:14, color:'white', fontWeight:500}}>{item.val}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Registration Action */}
        {registered ? (
          <div style={{display:'flex', flexDirection:'column', gap:12}}>
            <div style={{
              background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.25)',
              borderRadius:14, padding:'16px', textAlign:'center', color:'#34d399', fontSize:15, fontWeight:600
            }}>
              ✓ You are registered for this event!
            </div>
            {event.registration_link && (
              <button
                onClick={() => window.open(event.registration_link, '_blank')}
                style={{
                  width:'100%', background:'rgba(255,255,255,0.06)',
                  color:'rgba(255,255,255,0.7)', border:'1px solid rgba(255,255,255,0.1)',
                  borderRadius:14, padding:'14px', fontSize:15, fontWeight:600, cursor:'pointer',
                  fontFamily:'Syne,sans-serif'
                }}>
                Open Registration Form ↗
              </button>
            )}
          </div>
        ) : event.registration_link ? (
          <button
            onClick={handleRegister}
            disabled={registering}
            style={{
              width:'100%',
              background: registering ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg,#7c3aed,#a78bfa)',
              color: registering ? 'rgba(255,255,255,0.4)' : 'white',
              border:'none', borderRadius:14, padding:'16px',
              fontSize:16, fontWeight:700, cursor: registering ? 'not-allowed' : 'pointer',
              fontFamily:'Syne,sans-serif', boxShadow: registering ? 'none' : '0 8px 32px rgba(124,58,237,0.4)'
            }}>
            {registering ? 'Registering...' : 'Register Now →'}
          </button>
        ) : (
          <div style={{textAlign:'center', color:'rgba(255,255,255,0.3)', fontSize:14}}>
            No registration link provided — contact the organizer
          </div>
        )}
      </div>
    </div>
  )
}

const S = {
  root: { minHeight:'100vh', background:'linear-gradient(160deg,#050510 0%,#0d0820 40%,#060315 100%)', fontFamily:"'Inter',sans-serif", color:'white' },
  bg1: { position:'fixed', top:'-20%', left:'-10%', width:'60vw', height:'60vw', borderRadius:'50%', background:'radial-gradient(circle,rgba(124,58,237,0.12) 0%,transparent 65%)', pointerEvents:'none' },
  bg2: { position:'fixed', top:'30%', right:'-15%', width:'50vw', height:'50vw', borderRadius:'50%', background:'radial-gradient(circle,rgba(236,72,153,0.08) 0%,transparent 65%)', pointerEvents:'none' },
  bg3: { position:'fixed', bottom:'-10%', left:'25%', width:'40vw', height:'40vw', borderRadius:'50%', background:'radial-gradient(circle,rgba(16,185,129,0.06) 0%,transparent 65%)', pointerEvents:'none' },
  nav: { background:'rgba(255,255,255,0.03)', backdropFilter:'blur(24px)', borderBottom:'1px solid rgba(255,255,255,0.07)', position:'sticky', top:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 40px' },
  brand: { display:'flex', cursor:'pointer' },
  brandUni: { fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, color:'white' },
  brandLink: { fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, background:'linear-gradient(90deg,#a78bfa,#67e8f9)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' },
  navLinks: { display:'flex', gap:32 },
  navLink: { color:'rgba(255,255,255,0.4)', fontSize:14, cursor:'pointer', fontWeight:500 },
  navActive: { color:'white', fontWeight:700 },
  navUser: { fontSize:14, color:'rgba(255,255,255,0.5)' },
  page: { maxWidth:1200, margin:'0 auto', padding:'40px 24px' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:40 },
  pageTitle: { fontFamily:'Syne,sans-serif', fontSize:36, fontWeight:800, marginBottom:8 },
  pageSub: { color:'rgba(255,255,255,0.4)', fontSize:15 },
  postBtn: { background:'linear-gradient(135deg,#7c3aed,#a78bfa)', color:'white', border:'none', borderRadius:12, padding:'12px 24px', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'Syne,sans-serif' },
  section: { marginBottom:48 },
  secHead: { display:'flex', alignItems:'center', gap:12, marginBottom:8 },
  secIcon: { fontSize:20 },
  secTitle: { fontFamily:'Syne,sans-serif', fontSize:20, fontWeight:700, marginBottom:20, display:'flex', alignItems:'center', gap:12 },
  secSub: { color:'rgba(255,255,255,0.35)', fontSize:13, marginTop:-12, marginBottom:20 },
  tag: { background:'rgba(167,139,250,0.15)', color:'#a78bfa', padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:600 },
  countTag: { background:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.4)', padding:'3px 12px', borderRadius:20, fontSize:13 },
  filterBar: { display:'flex', gap:10, marginBottom:32, flexWrap:'wrap' },
  filterBtn: { display:'flex', alignItems:'center', gap:8, padding:'10px 20px', borderRadius:24, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.5)', fontSize:14, cursor:'pointer', fontFamily:'Inter,sans-serif' },
  filterActive: { background:'rgba(167,139,250,0.15)', border:'1px solid rgba(167,139,250,0.4)', color:'#a78bfa', fontWeight:600 },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:20 },
  empty: { textAlign:'center', padding:'80px 0', color:'rgba(255,255,255,0.3)', fontSize:15 },
}
