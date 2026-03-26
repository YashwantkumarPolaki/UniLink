import { useEffect, useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../api'
import Navbar from '../components/Navbar'
import ExamCountdown from '../components/ExamCountdown'
import usePushNotifications from '../hooks/usePushNotifications'

function StarField() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.2,
      alpha: Math.random(),
      speed: Math.random() * 0.005 + 0.002,
    }))
    let rafId
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      stars.forEach(s => {
        s.alpha += s.speed
        if (s.alpha > 1 || s.alpha < 0) s.speed *= -1
        ctx.save(); ctx.globalAlpha = s.alpha
        ctx.fillStyle = 'white'
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill()
        ctx.restore()
      })
      rafId = requestAnimationFrame(draw)
    }
    draw()
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(rafId); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />
}

function CursorTrail() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let trail = []
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)
    const onMove = (e) => {
      for (let i = 0; i < 5; i++) {
        trail.push({
          x: e.clientX + (Math.random() - 0.5) * 8,
          y: e.clientY + (Math.random() - 0.5) * 8,
          size: Math.random() * 6 + 2, alpha: 0.9,
          color: ['#a78bfa', '#67e8f9', '#f472b6', '#34d399'][Math.floor(Math.random() * 4)]
        })
      }
    }
    window.addEventListener('mousemove', onMove)
    let rafId
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      trail = trail.filter(p => p.alpha > 0.01)
      trail.forEach(p => {
        ctx.save(); ctx.globalAlpha = p.alpha
        ctx.shadowBlur = 12; ctx.shadowColor = p.color
        ctx.fillStyle = p.color
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill()
        ctx.restore()
        p.alpha *= 0.84; p.size *= 0.92
      })
      rafId = requestAnimationFrame(animate)
    }
    animate()
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('resize', resize); cancelAnimationFrame(rafId) }
  }, [])
  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999 }} />
}

const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Education is the most powerful weapon you can use to change the world.", author: "Nelson Mandela" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
]

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [animated, setAnimated] = useState(false)
  const [events, setEvents] = useState([])
  const [doubts, setDoubts] = useState([])
  const [quote] = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)])
  const [showCommunity, setShowCommunity] = useState(
    localStorage.getItem('community_banner_dismissed') !== 'true'
  )
  const navigate = useNavigate()
  const { isSubscribed, isSupported, requestPermission } = usePushNotifications()
  const [notifAsked, setNotifAsked] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) { navigate('/login'); return }
    setUser(JSON.parse(userData))
    setTimeout(() => setAnimated(true), 200)
    // Prompt for push notifications once
    setTimeout(() => {
      if (isSupported && !isSubscribed && !notifAsked) {
        setNotifAsked(true)
        requestPermission()
      }
    }, 3000)
  }, [])

  useEffect(() => {
    if (!user) return
    // Fetch events
    API.get('/events/').then(r => setEvents(r.data.slice(0, 3))).catch(() => {})
    // Fetch doubts
    API.get('/doubts/').then(r => setDoubts((r.data.doubts || []).slice(0, 3))).catch(() => {})
  }, [user])

  const cards = [
    { icon: '📅', title: 'Events', desc: 'Discover & join events at your college', color: '#818cf8', glow: 'rgba(129,140,248,0.5)', path: '/events', tag: 'EXPLORE' },
    { icon: '💬', title: 'Doubts', desc: 'Ask questions, get answers from peers', color: '#f472b6', glow: 'rgba(244,114,182,0.5)', path: '/doubts', tag: 'ASK' },
    { icon: '💼', title: 'Opportunities', desc: 'Internships, jobs & more curated for you', color: '#34d399', glow: 'rgba(52,211,153,0.5)', path: '/opportunities', tag: 'GROW' },
    { icon: '🔍', title: 'Lost & Found', desc: 'Lost something? Found something? Post it!', color: '#fb7185', glow: 'rgba(251,113,133,0.5)', path: '/lost-found', tag: 'CAMPUS' },
  ]

  const activity = [
    { icon: '🎉', text: 'You joined UniLink', time: 'Just now', color: '#a78bfa' },
    { icon: '✅', text: 'Profile setup complete', time: '1 min ago', color: '#34d399' },
    { icon: '🔍', text: 'Explore events & doubts', time: 'Pending', color: '#f472b6' },
    { icon: '💡', text: 'Post your first doubt', time: 'Pending', color: '#67e8f9' },
  ]

  if (!user) return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#a78bfa', fontSize: 18, fontFamily: 'Syne, sans-serif', letterSpacing: 2 }}>LOADING...</div>
    </div>
  )

  return (
    <div style={S.root}>
      <StarField />
      <CursorTrail />
      <div style={S.bgNebula1} />
      <div style={S.bgNebula2} />
      <div style={S.bgNebula3} />

      <Navbar />

      <div style={S.content} className="content-pad">

        {/* HERO */}
        <div style={{ ...S.hero, opacity: animated ? 1 : 0, transform: animated ? 'translateY(0)' : 'translateY(60px)', transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <div style={S.heroInner} className="hero-inner">
            <div style={S.heroText}>
              <div style={S.heroBadge}>
                <span style={S.heroBadgeDot} />
                {user.role.toUpperCase()} · UNILINK
              </div>
              <h1 style={S.heroH1} className="hero-h1">
                Hey,<br />
                <span style={S.heroName}>{user.name.split(' ')[0]}</span> 👋
              </h1>
              <p style={S.heroP}>Your entire college universe — events, doubts, and opportunities — in one stunning place.</p>
              <div style={S.heroActions} className="hero-actions">
                <Link to="/events" style={S.heroCTA}>Explore Now →</Link>
                <div style={S.heroStatRow} className="hero-stat-row">
                  {[['3+', 'Sections'], ['∞', 'Resources'], ['24/7', 'Live']].map(([n, l]) => (
                    <div key={l} style={S.heroStat}>
                      <span style={S.heroStatN}>{n}</span>
                      <span style={S.heroStatL}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={S.heroVisual} className="hero-visual">
              <div style={S.orb}>
                <div style={S.orbInner}>🎓</div>
                <div style={S.orbRing1} />
                <div style={S.orbRing2} />
              </div>
            </div>
          </div>
        </div>

        {/* QUOTE OF THE DAY */}
        <div className="quote-card" style={{ ...S.quoteCard, opacity: animated ? 1 : 0, transform: animated ? 'translateY(0)' : 'translateY(40px)', transition: 'all 0.8s ease 0.15s' }}>
          <div style={S.quoteIcon}>✦</div>
          <div style={S.quoteText}>"{quote.text}"</div>
          <div style={S.quoteAuthor}>— {quote.author}</div>
        </div>

        {/* COMMUNITY BANNER */}
        {showCommunity && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(167,139,250,0.06))',
            border: '1px solid rgba(167,139,250,0.2)',
            borderRadius: 16, padding: '12px 18px', marginBottom: 32,
            opacity: animated ? 1 : 0, transform: animated ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.6s ease 0.18s',
          }}>
            <div style={{ fontSize: 28, flexShrink: 0 }}>🎓</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <span style={{ color: 'white', fontWeight: 700, fontSize: 14, fontFamily: 'Syne,sans-serif' }}>UniLink Community</span>
                <span style={{ background: 'rgba(167,139,250,0.2)', color: '#a78bfa', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 6, letterSpacing: 1 }}>OFFICIAL</span>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Get announcements, updates &amp; connect with your campus</span>
            </div>
            <a
              href="https://chat.whatsapp.com/FP4S2uLg8tjKB5pPHK0Gvc"
              target="_blank" rel="noopener noreferrer"
              style={{
                background: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
                color: 'white', borderRadius: 20, padding: '7px 16px',
                fontSize: 12, fontWeight: 700, textDecoration: 'none',
                whiteSpace: 'nowrap', flexShrink: 0,
                boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
              }}>
              Join →
            </a>
            <button onClick={() => {
              setShowCommunity(false)
              localStorage.setItem('community_banner_dismissed', 'true')
            }} style={{
              background: 'transparent', border: 'none',
              color: 'rgba(255,255,255,0.25)', cursor: 'pointer',
              fontSize: 18, padding: '0 4px', flexShrink: 0, lineHeight: 1,
            }}>✕</button>
          </div>
        )}

        {/* QUICK ACCESS */}
        <SectionHeader label="QUICK ACCESS" animated={animated} delay={0.2} />
        <div style={S.cardsGrid} className="cards-grid">
          {cards.map((card, i) => (
            <div key={card.title} style={{ ...S.card, opacity: animated ? 1 : 0, transform: animated ? 'translateY(0) scale(1)' : 'translateY(60px) scale(0.95)', transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${0.3 + i * 0.15}s` }}>
              <div style={{ ...S.cardShine, background: `radial-gradient(circle at top right, ${card.glow}, transparent 60%)` }} />
              <div style={S.cardTop}>
                <div style={{ ...S.cardTag, color: card.color, borderColor: card.color + '44', background: card.color + '11' }}>{card.tag}</div>
                <span style={{ fontSize: 40 }}>{card.icon}</span>
              </div>
              <h3 style={{ ...S.cardTitle, color: card.color }}>{card.title}</h3>
              <p style={S.cardDesc}>{card.desc}</p>
              <Link to={card.path} style={{ ...S.cardCTA, background: `linear-gradient(135deg, ${card.color}22, ${card.color}11)`, border: `1px solid ${card.color}44`, color: card.color }}>
                Open {card.title} →
              </Link>
            </div>
          ))}
        </div>

        {/* EVENTS + DOUBTS PREVIEW */}
        <SectionHeader label="LIVE FEED" animated={animated} delay={0.5} />
        <div style={S.twoCol} className="two-col">

          {/* Upcoming Events */}
          <div style={{ ...S.previewCard, opacity: animated ? 1 : 0, transform: animated ? 'translateY(0)' : 'translateY(40px)', transition: 'all 0.8s ease 0.55s' }}>
            <div style={S.previewHeader}>
              <span style={S.previewTitle}>📅 Upcoming Events</span>
              <Link to="/events" style={S.previewLink}>View all →</Link>
            </div>
            {events.length === 0 ? (
              <div style={S.emptyState}>
                <div style={S.emptyIcon}>🎪</div>
                <p style={S.emptyText}>No events yet</p>
                <p style={S.emptySubText}>Be the first to post an event!</p>
              </div>
            ) : (
              <div style={S.previewList}>
                {events.map((ev, i) => (
                  <div key={i} style={S.previewItem}>
                    <div style={{ ...S.previewItemDot, background: '#818cf8' }} />
                    <div style={S.previewItemContent}>
                      <span style={S.previewItemTitle}>{ev.title}</span>
                      <span style={S.previewItemMeta}>{ev.venue} · {ev.date}</span>
                    </div>
                    <div style={{ ...S.previewItemBadge, color: '#818cf8', background: '#818cf822' }}>{ev.category}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Latest Doubts */}
          <div style={{ ...S.previewCard, opacity: animated ? 1 : 0, transform: animated ? 'translateY(0)' : 'translateY(40px)', transition: 'all 0.8s ease 0.65s' }}>
            <div style={S.previewHeader}>
              <span style={S.previewTitle}>💬 Latest Doubts</span>
              <Link to="/doubts" style={S.previewLink}>View all →</Link>
            </div>
            {doubts.length === 0 ? (
              <div style={S.emptyState}>
                <div style={S.emptyIcon}>🤔</div>
                <p style={S.emptyText}>No doubts yet</p>
                <p style={S.emptySubText}>Ask your first question!</p>
              </div>
            ) : (
              <div style={S.previewList}>
                {doubts.map((d, i) => (
                  <div key={i} style={S.previewItem}>
                    <div style={{ ...S.previewItemDot, background: '#f472b6' }} />
                    <div style={S.previewItemContent}>
                      <span style={S.previewItemTitle}>{d.title}</span>
                      <span style={S.previewItemMeta}>{d.subject} · {d.answers?.length || 0} answers</span>
                    </div>
                    <div style={{ ...S.previewItemBadge, color: d.is_resolved ? '#34d399' : '#f472b6', background: d.is_resolved ? '#34d39922' : '#f472b622' }}>
                      {d.is_resolved ? 'Solved' : 'Open'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RECENT ACTIVITY + PROFILE */}
        <SectionHeader label="YOUR SPACE" animated={animated} delay={0.7} />
        <div style={S.twoCol} className="two-col">

          {/* Recent Activity */}
          <div style={{ ...S.previewCard, opacity: animated ? 1 : 0, transform: animated ? 'translateY(0)' : 'translateY(40px)', transition: 'all 0.8s ease 0.75s' }}>
            <div style={S.previewHeader}>
              <span style={S.previewTitle}>⚡ Recent Activity</span>
            </div>
            <div style={S.activityList}>
              {activity.map((a, i) => (
                <div key={i} style={S.activityItem}>
                  <div style={{ ...S.activityIconBox, background: a.color + '22', boxShadow: `0 0 12px ${a.color}33` }}>
                    <span style={{ fontSize: 18 }}>{a.icon}</span>
                  </div>
                  <div style={S.activityContent}>
                    <span style={S.activityText}>{a.text}</span>
                    <span style={S.activityTime}>{a.time}</span>
                  </div>
                  <div style={{ ...S.activityDot, background: a.color }} />
                </div>
              ))}
            </div>
          </div>

          {/* Profile */}
          <div style={{ ...S.previewCard, opacity: animated ? 1 : 0, transform: animated ? 'translateY(0)' : 'translateY(40px)', transition: 'all 0.8s ease 0.85s' }}>
            <div style={S.previewHeader}>
              <span style={S.previewTitle}>👤 Your Profile</span>
            </div>
            <div style={S.profileTop}>
              <div style={S.avatarWrap}>
                <div style={S.avatar}>{user.name.charAt(0).toUpperCase()}</div>
                <div style={S.avatarGlow} />
              </div>
              <div>
                <h2 style={S.profileName}>{user.name}</h2>
                <p style={S.profileEmail}>{user.email}</p>
                <div style={S.onlineBadge}>● Online Now</div>
              </div>
            </div>
            <div style={S.profileDivider} />
            <div style={S.profileGrid}>
              {[
                { l: 'ROLE', v: user.role?.toUpperCase() },
                { l: 'COLLEGE', v: user.college },
                user.branch ? { l: 'BRANCH', v: user.branch } : null,
                user.year_of_study ? { l: 'YEAR', v: `${user.year_of_study}${['st','nd','rd','th'][Math.min(user.year_of_study-1,3)]} Year` } : null,
                user.graduation_year ? { l: 'GRADUATING', v: user.graduation_year } : null,
                { l: 'STATUS', v: 'Verified ✅' },
              ].filter(Boolean).map(item => (
                <div key={item.l} style={S.profileField}>
                  <span style={S.profileFieldLabel}>{item.l}</span>
                  <span style={S.profileFieldVal}>{item.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* EXAM COUNTDOWN */}
        <SectionHeader label="EXAM SCHEDULE" animated={animated} delay={0.9} />
        <div style={{ marginBottom: 40, opacity: animated ? 1 : 0, transform: animated ? 'translateY(0)' : 'translateY(40px)', transition: 'all 0.8s ease 0.95s' }}>
          <ExamCountdown />
        </div>

        {/* FOOTER */}
        <div style={S.footer}>
          <span style={S.footerText}>UniLink © 2026 · Built with ❤️ for college students</span>
          <span style={S.footerDot}>✦</span>
          <span style={S.footerText}>SRM Institute of Science and Technology</span>
        </div>

      </div>
    </div>
  )
}

function SectionHeader({ label, animated, delay }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, opacity: animated ? 1 : 0, transform: animated ? 'translateX(0)' : 'translateX(-20px)', transition: `all 0.6s ease ${delay}s` }}>
      <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, fontWeight: 700, letterSpacing: 3, fontFamily: 'Syne, sans-serif', whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(167,139,250,0.3), transparent)' }} />
    </div>
  )
}

const glass = {
  background: 'rgba(255,255,255,0.04)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.08)',
}

const S = {
  root: { minHeight: '100vh', background: 'linear-gradient(160deg, #050510 0%, #0d0820 40%, #060315 100%)', fontFamily: "'Inter', sans-serif", position: 'relative', overflowX: 'hidden' },
  bgNebula1: { position: 'fixed', top: '-20%', left: '-10%', width: '60vw', height: '60vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 },
  bgNebula2: { position: 'fixed', top: '30%', right: '-15%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 },
  bgNebula3: { position: 'fixed', bottom: '-10%', left: '25%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 },
  navbar: { ...glass, position: 'sticky', top: 0, zIndex: 100, height: 68, padding: '0 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: 'none', borderRight: 'none', borderTop: 'none', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  navLogo: { display: 'flex', alignItems: 'center' },
  navCenter: { display: 'flex', alignItems: 'center', gap: 4 },
  navLink: { color: 'rgba(255,255,255,0.55)', textDecoration: 'none', padding: '8px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500 },
  logoutBtn: { background: 'transparent', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 20px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontFamily: 'Inter, sans-serif' },
  content: { padding: '48px', position: 'relative', zIndex: 1, maxWidth: 1400, margin: '0 auto' },

  // Hero
  hero: { ...glass, borderRadius: 32, marginBottom: 24, overflow: 'hidden', position: 'relative', boxShadow: '0 40px 80px rgba(0,0,0,0.5)' },
  heroInner: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '64px 72px', gap: 48 },
  heroText: { flex: 1 },
  heroBadge: { display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)', color: '#a78bfa', padding: '6px 16px', borderRadius: 20, fontSize: 11, fontWeight: 600, letterSpacing: 2, marginBottom: 24, fontFamily: 'Syne, sans-serif' },
  heroBadgeDot: { width: 6, height: 6, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399', display: 'inline-block' },
  heroH1: { fontFamily: 'Syne, sans-serif', fontSize: 56, fontWeight: 800, color: 'white', lineHeight: 1.1, marginBottom: 20, letterSpacing: -2 },
  heroName: { background: 'linear-gradient(135deg, #a78bfa 0%, #67e8f9 50%, #f472b6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundSize: '200% auto', animation: 'shimmer 3s linear infinite' },
  heroP: { color: 'rgba(255,255,255,0.45)', fontSize: 16, lineHeight: 1.8, marginBottom: 40, maxWidth: 480 },
  heroActions: { display: 'flex', alignItems: 'center', gap: 40 },
  heroCTA: { background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', color: 'white', textDecoration: 'none', padding: '14px 32px', borderRadius: 14, fontSize: 15, fontWeight: 700, boxShadow: '0 8px 32px rgba(124,58,237,0.4)', fontFamily: 'Syne, sans-serif', whiteSpace: 'nowrap' },
  heroStatRow: { display: 'flex', gap: 28 },
  heroStat: { display: 'flex', flexDirection: 'column', gap: 2 },
  heroStatN: { color: 'white', fontSize: 22, fontWeight: 800, fontFamily: 'Syne, sans-serif' },
  heroStatL: { color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' },
  heroVisual: { flexShrink: 0, width: 260, height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  orb: { position: 'relative', width: 200, height: 200 },
  orbInner: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.4), rgba(167,139,250,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, boxShadow: '0 0 60px rgba(167,139,250,0.4)', animation: 'float 4s ease-in-out infinite' },
  orbRing1: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 160, height: 160, borderRadius: '50%', border: '1px solid rgba(167,139,250,0.2)' },
  orbRing2: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 200, height: 200, borderRadius: '50%', border: '1px dashed rgba(167,139,250,0.1)' },

  // Quote
  quoteCard: { ...glass, borderRadius: 20, padding: '28px 40px', marginBottom: 40, display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.3)', background: 'linear-gradient(135deg, rgba(167,139,250,0.08), rgba(103,232,249,0.05))' },
  quoteIcon: { fontSize: 28, color: '#a78bfa', flexShrink: 0 },
  quoteText: { flex: 1, color: 'rgba(255,255,255,0.75)', fontSize: 16, fontStyle: 'italic', lineHeight: 1.7, fontFamily: 'Syne, sans-serif' },
  quoteAuthor: { color: '#a78bfa', fontSize: 13, fontWeight: 600, flexShrink: 0 },

  // Cards
  cardsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 40 },
  card: { ...glass, borderRadius: 24, padding: '36px 32px', display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' },
  cardShine: { position: 'absolute', top: 0, right: 0, width: '100%', height: '100%', pointerEvents: 'none' },
  cardTop: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' },
  cardTag: { fontSize: 10, fontWeight: 700, letterSpacing: 2, padding: '4px 10px', borderRadius: 6, border: '1px solid', fontFamily: 'Syne, sans-serif' },
  cardTitle: { fontSize: 26, fontWeight: 800, fontFamily: 'Syne, sans-serif', letterSpacing: -0.5 },
  cardDesc: { color: 'rgba(255,255,255,0.4)', fontSize: 14, lineHeight: 1.7, flex: 1 },
  cardCTA: { textDecoration: 'none', padding: '12px 20px', borderRadius: 12, fontSize: 14, fontWeight: 600, textAlign: 'center', display: 'block', fontFamily: 'Syne, sans-serif' },

  // Two col
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40 },
  previewCard: { ...glass, borderRadius: 24, padding: '28px 32px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' },
  previewHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  previewTitle: { color: 'white', fontSize: 16, fontWeight: 700, fontFamily: 'Syne, sans-serif' },
  previewLink: { color: '#a78bfa', fontSize: 13, textDecoration: 'none', fontWeight: 600 },
  previewList: { display: 'flex', flexDirection: 'column', gap: 16 },
  previewItem: { display: 'flex', alignItems: 'center', gap: 14 },
  previewItemDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  previewItemContent: { flex: 1, display: 'flex', flexDirection: 'column', gap: 3 },
  previewItemTitle: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: 600 },
  previewItemMeta: { color: 'rgba(255,255,255,0.3)', fontSize: 12 },
  previewItemBadge: { fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6, flexShrink: 0 },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0', gap: 8 },
  emptyIcon: { fontSize: 40 },
  emptyText: { color: 'rgba(255,255,255,0.5)', fontSize: 15, fontWeight: 600 },
  emptySubText: { color: 'rgba(255,255,255,0.25)', fontSize: 13 },

  // Activity
  activityList: { display: 'flex', flexDirection: 'column', gap: 16 },
  activityItem: { display: 'flex', alignItems: 'center', gap: 16 },
  activityIconBox: { width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  activityContent: { flex: 1, display: 'flex', flexDirection: 'column', gap: 3 },
  activityText: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 500 },
  activityTime: { color: 'rgba(255,255,255,0.3)', fontSize: 12 },
  activityDot: { width: 6, height: 6, borderRadius: '50%', flexShrink: 0 },

  // Profile
  profileTop: { display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 },
  avatarWrap: { position: 'relative', flexShrink: 0 },
  avatar: { width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, fontFamily: 'Syne, sans-serif', boxShadow: '0 0 0 3px rgba(167,139,250,0.3)' },
  avatarGlow: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 90, height: 90, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.3), transparent)', pointerEvents: 'none' },
  profileName: { color: 'white', fontSize: 20, fontWeight: 800, fontFamily: 'Syne, sans-serif', marginBottom: 4 },
  profileEmail: { color: 'rgba(255,255,255,0.35)', fontSize: 13, marginBottom: 8 },
  onlineBadge: { color: '#34d399', fontSize: 12, fontWeight: 600 },
  profileDivider: { height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 20 },
  profileGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 },
  profileField: { display: 'flex', flexDirection: 'column', gap: 6 },
  profileFieldLabel: { fontSize: 10, color: 'rgba(255,255,255,0.25)', fontWeight: 700, letterSpacing: 2, fontFamily: 'Syne, sans-serif' },
  profileFieldVal: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: 600 },

  // Footer
  footer: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '32px 0 16px', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 16 },
  footerText: { color: 'rgba(255,255,255,0.2)', fontSize: 13 },
  footerDot: { color: '#a78bfa', fontSize: 16 },
}