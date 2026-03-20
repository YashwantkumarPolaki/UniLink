import { useNavigate, useLocation } from 'react-router-dom'

const NAV_ITEMS = {
  student: ['Dashboard', 'Events', 'Doubts', 'Opportunities', 'Mock Interview'],
  faculty: ['Dashboard', 'Events', 'Doubts', 'Opportunities'],
  club:    ['Dashboard', 'Events', 'Opportunities'],
  company: ['Dashboard', 'Opportunities'],
  admin:   ['Dashboard', 'Events', 'Doubts', 'Opportunities'],
}

const NAV_PATHS = {
  'Dashboard':      '/dashboard',
  'Events':         '/events',
  'Doubts':         '/doubts',
  'Opportunities':  '/opportunities',
  'Mock Interview': '/mock-interview',
}

const ROLE_COLORS = {
  student: '#a78bfa',
  faculty: '#67e8f9',
  club:    '#34d399',
  company: '#fb923c',
  admin:   '#fb7185',
}

export default function Navbar() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const user      = JSON.parse(localStorage.getItem('user') || '{}')
  const role      = user?.role || 'student'
  const navItems  = NAV_ITEMS[role] || NAV_ITEMS.student
  const roleColor = ROLE_COLORS[role] || '#a78bfa'

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <nav style={{
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
      <div style={{ display: 'flex', cursor: 'pointer', alignItems: 'center', gap: '8px' }}
           onClick={() => navigate('/dashboard')}>
        <img src="/logo.svg" alt="UniLink" style={{ width: '40px', height: '34px' }} />
        <span style={{ color: 'white', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '22px', letterSpacing: '0.5px' }}>UniLink</span>
      </div>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: 2 }}>
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

      {/* Right: avatar + name + role badge + settings + logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {user?.avatar ? (
          <img src={user.avatar} alt="av"
            style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${roleColor}55` }} />
        ) : (
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: `linear-gradient(135deg,${roleColor}44,${roleColor}22)`,
            border: `2px solid ${roleColor}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: roleColor, fontSize: 13, fontWeight: 700, fontFamily: 'Syne,sans-serif',
          }}>
            {user?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
        )}
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
    </nav>
  )
}
