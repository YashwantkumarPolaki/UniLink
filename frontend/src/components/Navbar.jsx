import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import API from '../api'
import UniLinkLogo from './UniLinkLogo'

const NAV_ITEMS = {
  student: ['Dashboard', 'Events', 'Doubts', 'Opportunities', 'Lost & Found', 'Mock Interview'],
  faculty: ['Dashboard', 'Events', 'Doubts', 'Opportunities', 'Lost & Found'],
  club:    ['Dashboard', 'Events', 'Opportunities', 'Lost & Found'],
  company: ['Dashboard', 'Opportunities'],
  admin:   ['Dashboard', 'Events', 'Doubts', 'Opportunities', 'Lost & Found', 'Admin'],
}

const NAV_PATHS = {
  'Dashboard':      '/dashboard',
  'Events':         '/events',
  'Doubts':         '/doubts',
  'Opportunities':  '/opportunities',
  'Lost & Found':   '/lost-found',
  'Mock Interview': '/mock-interview',
  'Admin':          '/admin',
}

const NAV_ICONS = {
  'Dashboard':      '🏠',
  'Events':         '📅',
  'Doubts':         '💬',
  'Opportunities':  '💼',
  'Lost & Found':   '🔍',
  'Mock Interview': '🎤',
  'Admin':          '🛡️',
}

const ROLE_COLORS = {
  student: '#a78bfa',
  faculty: '#67e8f9',
  club:    '#34d399',
  company: '#fb923c',
  admin:   '#fb7185',
}

function timeAgo(isoStr) {
  if (!isoStr) return ''
  const diff = (Date.now() - new Date(isoStr).getTime()) / 1000
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function Navbar() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const user      = JSON.parse(localStorage.getItem('user') || '{}')
  const role      = user?.role || 'student'
  const navItems  = NAV_ITEMS[role] || NAV_ITEMS.student
  const roleColor = ROLE_COLORS[role] || '#a78bfa'

  const [showBell, setShowBell]           = useState(false)
  const [announcements, setAnnouncements] = useState([])
  const [unread, setUnread]               = useState(0)
  const [menuOpen, setMenuOpen]           = useState(false)
  const bellRef = useRef(null)

  useEffect(() => {
    API.get('/auth/announcements')
      .then(r => {
        setAnnouncements(r.data)
        const seen = parseInt(localStorage.getItem('announcements_seen') || '0', 10)
        setUnread(r.data.filter(a => new Date(a.created_at).getTime() > seen).length)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setShowBell(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  const openBell = () => {
    setShowBell(v => !v)
    if (!showBell) {
      localStorage.setItem('announcements_seen', Date.now().toString())
      setUnread(0)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const Avatar = (
    user?.avatar
      ? <img src={user.avatar} alt="av" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${roleColor}55` }} />
      : <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: `linear-gradient(135deg,${roleColor}44,${roleColor}22)`,
          border: `2px solid ${roleColor}55`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: roleColor, fontSize: 14, fontWeight: 700, fontFamily: 'Syne,sans-serif',
        }}>
          {user?.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
  )

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .nav-links  { display: none !important; }
          .nav-right-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
          .nav-right-mobile { display: flex !important; }
          .main-nav { padding: 0 16px !important; }
        }
        @media (min-width: 769px) {
          .nav-hamburger { display: none !important; }
          .nav-right-mobile { display: none !important; }
        }
      `}</style>

      <nav className="main-nav" style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 40px', height: 64,
        fontFamily: "'Inter', sans-serif",
      }}>

        {/* Logo */}
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          <UniLinkLogo />
        </div>

        {/* Desktop nav links */}
        <div className="nav-links" style={{ display: 'flex', gap: 2 }}>
          {navItems.map(item => {
            const active = location.pathname === NAV_PATHS[item]
            return (
              <button key={item} onClick={() => navigate(NAV_PATHS[item])} style={{
                background: active ? 'rgba(167,139,250,0.12)' : 'transparent',
                border: active ? '1px solid rgba(167,139,250,0.25)' : '1px solid transparent',
                color: active ? '#a78bfa' : 'rgba(255,255,255,0.5)',
                borderRadius: 10, padding: '7px 16px', cursor: 'pointer',
                fontSize: 14, fontWeight: active ? 600 : 400, fontFamily: 'Inter,sans-serif',
              }}>
                {item}
              </button>
            )
          })}
        </div>

        {/* Desktop right side */}
        <div className="nav-right-desktop" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Bell */}
          <div ref={bellRef} style={{ position: 'relative' }}>
            <button onClick={openBell} style={{
              background: showBell ? 'rgba(167,139,250,0.12)' : 'rgba(255,255,255,0.05)',
              border: showBell ? '1px solid rgba(167,139,250,0.3)' : '1px solid rgba(255,255,255,0.08)',
              color: showBell ? '#a78bfa' : 'rgba(255,255,255,0.55)',
              borderRadius: 10, padding: '7px 10px', cursor: 'pointer', fontSize: 16, position: 'relative',
            }}>
              🔔
              {unread > 0 && (
                <span style={{ position: 'absolute', top: 2, right: 2, width: 8, height: 8, borderRadius: '50%', background: '#fb7185', border: '1.5px solid #000' }} />
              )}
            </button>
            {showBell && <BellDropdown announcements={announcements} />}
          </div>

          {Avatar}
          <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14 }}>{user?.name}</span>
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: 1,
            background: roleColor + '22', color: roleColor,
            border: `1px solid ${roleColor}40`, padding: '3px 10px', borderRadius: 20,
          }}>{role.toUpperCase()}</span>
          <button onClick={() => navigate('/settings')} style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.45)', borderRadius: 10, padding: '7px 12px',
            cursor: 'pointer', fontSize: 14,
          }}>⚙️</button>
          <button onClick={logout} style={{
            background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.35)', borderRadius: 10, padding: '7px 14px',
            cursor: 'pointer', fontSize: 13,
          }}>Sign Out</button>
        </div>

        {/* Mobile right: bell + avatar + hamburger */}
        <div className="nav-right-mobile" style={{ display: 'none', alignItems: 'center', gap: 10 }}>
          {/* Bell */}
          <div ref={bellRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <button onClick={openBell} style={{
              background: 'transparent', border: 'none',
              color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 20,
              padding: '4px', position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              lineHeight: 1,
            }}>
              🔔
              {unread > 0 && (
                <span style={{ position: 'absolute', top: 2, right: 2, width: 8, height: 8, borderRadius: '50%', background: '#fb7185', border: '1.5px solid #0d0820' }} />
              )}
            </button>
            {showBell && (
              <div style={{ position: 'fixed', top: 64, right: 12, left: 12, zIndex: 300 }}>
                <BellDropdown announcements={announcements} />
              </div>
            )}
          </div>

          {Avatar}

          {/* Hamburger */}
          <button className="nav-hamburger" onClick={() => setMenuOpen(v => !v)} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 5, padding: 4, height: 32,
          }}>
            {[0,1,2].map(i => (
              <span key={i} style={{
                display: 'block', width: 22, height: 2,
                background: menuOpen && i === 1 ? 'transparent' : 'rgba(255,255,255,0.7)',
                borderRadius: 2,
                transform: menuOpen
                  ? i === 0 ? 'translateY(7px) rotate(45deg)'
                  : i === 2 ? 'translateY(-7px) rotate(-45deg)' : 'none'
                  : 'none',
                transition: 'all 0.2s ease',
              }} />
            ))}
          </button>
        </div>
      </nav>

      {/* Mobile slide-down menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: 64, left: 0, right: 0, bottom: 0,
          background: 'rgba(10,6,28,0.98)',
          backdropFilter: 'blur(24px)',
          zIndex: 99, overflowY: 'auto',
          padding: '16px 0 40px',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* User info */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 24px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            marginBottom: 8,
          }}>
            {Avatar}
            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 15, fontFamily: 'Syne,sans-serif' }}>{user?.name}</div>
              <div style={{ color: roleColor, fontSize: 12, fontWeight: 600 }}>{role.toUpperCase()}</div>
            </div>
          </div>

          {/* Nav items */}
          {navItems.map(item => {
            const active = location.pathname === NAV_PATHS[item]
            return (
              <button key={item} onClick={() => navigate(NAV_PATHS[item])} style={{
                background: active ? `${roleColor}12` : 'transparent',
                border: 'none',
                borderLeft: active ? `3px solid ${roleColor}` : '3px solid transparent',
                color: active ? roleColor : 'rgba(255,255,255,0.65)',
                padding: '15px 24px', cursor: 'pointer',
                fontSize: 16, fontWeight: active ? 700 : 400,
                fontFamily: 'Inter,sans-serif', textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <span style={{ fontSize: 20, width: 28, textAlign: 'center' }}>{NAV_ICONS[item]}</span>
                {item}
              </button>
            )
          })}

          {/* Divider */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', margin: '8px 0' }} />

          {/* Settings */}
          <button onClick={() => navigate('/settings')} style={{
            background: 'transparent', border: 'none',
            borderLeft: '3px solid transparent',
            color: 'rgba(255,255,255,0.65)',
            padding: '15px 24px', cursor: 'pointer',
            fontSize: 16, fontWeight: 400, fontFamily: 'Inter,sans-serif',
            textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <span style={{ fontSize: 20, width: 28, textAlign: 'center' }}>⚙️</span>
            Settings
          </button>

          {/* Sign Out */}
          <button onClick={logout} style={{
            background: 'transparent', border: 'none',
            borderLeft: '3px solid transparent',
            color: '#fb7185',
            padding: '15px 24px', cursor: 'pointer',
            fontSize: 16, fontWeight: 400, fontFamily: 'Inter,sans-serif',
            textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <span style={{ fontSize: 20, width: 28, textAlign: 'center' }}>🚪</span>
            Sign Out
          </button>
        </div>
      )}
    </>
  )
}

function BellDropdown({ announcements }) {
  return (
    <div style={{
      position: 'absolute', top: 'calc(100% + 8px)', right: 0,
      width: 320, background: 'rgba(13,8,32,0.97)',
      border: '1px solid rgba(167,139,250,0.2)',
      borderRadius: 16, boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
      zIndex: 200, overflow: 'hidden',
    }}>
      <div style={{
        padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ color: 'white', fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15 }}>
          📣 Announcements
        </span>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
          {announcements.length} total
        </span>
      </div>
      <div style={{ maxHeight: 380, overflowY: 'auto' }}>
        {announcements.length === 0 ? (
          <div style={{ padding: '32px 18px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
            No announcements yet
          </div>
        ) : (
          announcements.map(a => (
            <div key={a.id} style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>{a.title}</span>
                <span style={{
                  fontSize: 10, padding: '2px 8px', borderRadius: 10,
                  background: 'rgba(167,139,250,0.12)', color: '#a78bfa', fontWeight: 600,
                }}>{a.target || 'All'}</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.5, margin: 0 }}>
                {a.message}
              </p>
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, marginTop: 6, display: 'block' }}>
                {timeAgo(a.created_at)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
