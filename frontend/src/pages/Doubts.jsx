import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain, MessageCircle, Trophy } from 'lucide-react'
import API from '../api'
import Navbar from '../components/Navbar'
import AIStudyTab    from './doubts/AIStudyTab'
import ForumTab      from './doubts/ForumTab'
import LeaderboardTab from './doubts/LeaderboardTab'

const TABS = [
  { id: 'ai-study', label: 'AI Study Helper', icon: <Brain size={15} /> },
  { id: 'forum',    label: 'Community Forum', icon: <MessageCircle size={15} /> },
  { id: 'credits',  label: 'Leaderboard',     icon: <Trophy size={15} /> },
]

export default function Doubts() {
  const [tab, setTab] = useState('forum')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    API.get('/auth/me')
      .then(r => { setUser(r.data.user); setLoading(false) })
      .catch(() => navigate('/login'))
  }, [])

  // AI Study tab only for students (and admins)
  const visibleTabs = TABS.filter(t =>
    t.id !== 'ai-study' || ['student', 'admin', undefined].includes(user?.role)
  )

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#050510,#0d0820)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, border: '3px solid rgba(167,139,250,0.2)', borderTop: '3px solid #a78bfa', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  )

  return (
    <div style={root}>
      {/* Ambient blobs */}
      <div style={blob1} /><div style={blob2} /><div style={blob3} />

      <Navbar />

      <div style={page}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Doubts &amp; Study AI 🧠</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>
            Upload PDFs, ask doubts, get answers from <span style={{ color: '#a78bfa' }}>AI + Community</span>
          </p>
        </div>

        {/* Tab Bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 6, width: 'fit-content' }}>
          {visibleTabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 22px', borderRadius: 12, border: tab === t.id ? '1px solid rgba(167,139,250,0.35)' : 'none',
                background: tab === t.id ? 'rgba(167,139,250,0.18)' : 'transparent',
                color: tab === t.id ? '#a78bfa' : 'rgba(255,255,255,0.4)',
                cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'Inter,sans-serif',
                transition: 'all 0.15s'
              }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'ai-study' && <AIStudyTab user={user} />}
        {tab === 'forum'    && <ForumTab user={user} />}
        {tab === 'credits'  && <LeaderboardTab user={user} />}
      </div>
    </div>
  )
}

// ─── Inline page-level styles ────────────────────────────────────────────────
const root  = { minHeight: '100vh', background: 'linear-gradient(160deg,#050510 0%,#0d0820 40%,#060315 100%)', fontFamily: "'Inter',sans-serif", color: 'white' }
const blob1 = { position: 'fixed', top: '-20%', left: '-10%', width: '60vw', height: '60vw', borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.12) 0%,transparent 65%)', pointerEvents: 'none' }
const blob2 = { position: 'fixed', top: '30%', right: '-15%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle,rgba(236,72,153,0.08) 0%,transparent 65%)', pointerEvents: 'none' }
const blob3 = { position: 'fixed', bottom: '-10%', left: '25%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle,rgba(16,185,129,0.06) 0%,transparent 65%)', pointerEvents: 'none' }
const page  = { maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }
