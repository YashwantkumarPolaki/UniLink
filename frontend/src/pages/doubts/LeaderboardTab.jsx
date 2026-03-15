import { Trophy, Medal, Crown, Star, Zap, TrendingUp } from 'lucide-react'
import { getRank, CREDIT_RULES } from './doubtsAI'
import { S } from './doubtsStyles'

// Demo leaderboard data — in production, fetch from backend
const DEMO_LEADERS = [
  { name: 'Priya Sharma',   email: 'priya@srm.edu',   credits: 1240, answers: 87, best: 12, role: 'student' },
  { name: 'Dr. Ramesh K',   email: 'ramesh@srm.edu',  credits: 980,  answers: 62, best: 31, role: 'faculty' },
  { name: 'Arjun Dev',      email: 'arjun@srm.edu',   credits: 720,  answers: 54, best: 8,  role: 'student' },
  { name: 'Sneha Iyer',     email: 'sneha@srm.edu',   credits: 510,  answers: 41, best: 6,  role: 'student' },
  { name: 'Prof. Meena',    email: 'meena@srm.edu',   credits: 430,  answers: 28, best: 19, role: 'faculty' },
  { name: 'Kiran Raj',      email: 'kiran@srm.edu',   credits: 290,  answers: 23, best: 3,  role: 'student' },
  { name: 'Divya N',        email: 'divya@srm.edu',   credits: 185,  answers: 15, best: 2,  role: 'student' },
  { name: 'Ravi Kumar',     email: 'ravi@srm.edu',    credits: 95,   answers: 9,  best: 0,  role: 'student' },
]

const MEDAL_COLORS = ['#fbbf24', '#94a3b8', '#fb923c']
const MEDAL_ICONS  = [<Crown size={18} />, <Medal size={18} />, <Medal size={18} />]

export default function LeaderboardTab({ user }) {
  const currentUserRank = DEMO_LEADERS.findIndex(l => l.email === user?.email)
  const currentUser = currentUserRank >= 0 ? DEMO_LEADERS[currentUserRank] : { name: user?.name || 'You', email: user?.email, credits: 20, answers: 0, best: 0, role: 'student' }
  const rank = getRank(currentUser.credits)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
      {/* Leaderboard */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <Trophy size={22} color="#fbbf24" />
          <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 800 }}>Top Doubt Solvers</span>
          <span style={{ ...S.chip, marginLeft: 8 }}>This Month</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {DEMO_LEADERS.map((leader, i) => {
            const lRank = getRank(leader.credits)
            const isTop3 = i < 3
            const isCurrentUser = leader.email === user?.email
            return (
              <div key={leader.email} style={{
                ...S.glassCard,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                border: isCurrentUser ? '1px solid rgba(167,139,250,0.4)' : isTop3 ? `1px solid ${MEDAL_COLORS[i]}30` : 'rgba(255,255,255,0.07)',
                background: isCurrentUser ? 'rgba(167,139,250,0.07)' : isTop3 ? `${MEDAL_COLORS[i]}06` : 'rgba(255,255,255,0.03)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {isTop3 && <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: MEDAL_COLORS[i], borderRadius: '18px 0 0 18px' }} />}

                {/* Rank number */}
                <div style={{ width: 36, textAlign: 'center', flexShrink: 0 }}>
                  {isTop3
                    ? <span style={{ color: MEDAL_COLORS[i] }}>{MEDAL_ICONS[i]}</span>
                    : <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15, color: 'rgba(255,255,255,0.3)' }}>#{i + 1}</span>
                  }
                </div>

                {/* Avatar placeholder */}
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg,${lRank.color}40,${lRank.color}20)`, border: `2px solid ${lRank.color}60`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                  {lRank.icon}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14, color: isCurrentUser ? '#a78bfa' : 'white' }}>
                      {leader.name}
                    </span>
                    {leader.role === 'faculty' && <span style={{ ...S.badge, background: 'rgba(103,232,249,0.1)', color: '#67e8f9', fontSize: 10 }}>🎓 Faculty</span>}
                    {isCurrentUser && <span style={{ ...S.badge, background: 'rgba(167,139,250,0.15)', color: '#a78bfa', fontSize: 10 }}>You</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>💬 {leader.answers} answers</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>⭐ {leader.best} best</span>
                    <span style={{ fontSize: 11, color: lRank.color, fontWeight: 600 }}>{lRank.icon} {lRank.label}</span>
                  </div>
                </div>

                {/* Credits */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 18, color: isTop3 ? MEDAL_COLORS[i] : 'white' }}>{leader.credits}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>credits</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Right sidebar: Your profile + Rules */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Your Profile Card */}
        <div style={{ ...S.glassCard, padding: 24, border: '1px solid rgba(167,139,250,0.2)', background: 'rgba(167,139,250,0.06)' }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: `linear-gradient(135deg,${rank.color}40,${rank.color}15)`, border: `3px solid ${rank.color}70`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 12px' }}>
              {rank.icon}
            </div>
            <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 18, color: 'white' }}>{currentUser.name}</div>
            <div style={{ fontSize: 13, color: rank.color, fontWeight: 700, marginTop: 4 }}>{rank.label}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            {[
              { label: 'Credits', value: currentUser.credits, color: '#a78bfa' },
              { label: 'Rank',    value: currentUserRank >= 0 ? `#${currentUserRank + 1}` : 'Unranked', color: '#fbbf24' },
              { label: 'Answers', value: currentUser.answers, color: '#34d399' },
              { label: 'Best ⭐', value: currentUser.best,    color: '#67e8f9' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontFamily: 'Syne,sans-serif', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Progress to next rank */}
          <NextRankProgress credits={currentUser.credits} rank={rank} />
        </div>

        {/* Credit Rules */}
        <div style={{ ...S.glassCard, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Zap size={16} color="#fbbf24" />
            <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14 }}>How to Earn Credits</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { action: 'Ask a question',      pts: '+1',  color: '#34d399' },
              { action: 'Answer a question',   pts: '+5',  color: '#34d399' },
              { action: 'Receive an upvote',   pts: '+3',  color: '#34d399' },
              { action: 'Best answer chosen',  pts: '+10', color: '#a78bfa' },
              { action: 'Faculty verified',    pts: '+15', color: '#fbbf24' },
              { action: 'Receive a downvote',  pts: '−2',  color: '#fb7185' },
            ].map(r => (
              <div key={r.action} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{r.action}</span>
                <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 14, color: r.color }}>{r.pts}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rank Tiers */}
        <div style={{ ...S.glassCard, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <TrendingUp size={16} color="#a78bfa" />
            <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14 }}>Rank Tiers</span>
          </div>
          {[
            { label: '🌱 Beginner',       range: '0–50',     color: '#94a3b8' },
            { label: '📘 Learner',         range: '50–150',   color: '#34d399' },
            { label: '⚡ Contributor',     range: '150–400',  color: '#67e8f9' },
            { label: '🔥 Expert',          range: '400–1000', color: '#a78bfa' },
            { label: '👑 Campus Mentor',   range: '1000+',    color: '#f59e0b' },
          ].map(r => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: 13, color: r.color, fontWeight: 600 }}>{r.label}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{r.range} pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function NextRankProgress({ credits, rank }) {
  const thresholds = [50, 150, 400, 1000, Infinity]
  const labels =     ['Learner', 'Contributor', 'Expert', 'Campus Mentor', '']
  const nextIdx = thresholds.findIndex(t => credits < t)
  if (nextIdx < 0 || nextIdx >= thresholds.length - 1) return (
    <div style={{ textAlign: 'center', fontSize: 12, color: '#fbbf24', fontWeight: 700 }}>👑 Maximum Rank Achieved!</div>
  )
  const prev = nextIdx === 0 ? 0 : thresholds[nextIdx - 1]
  const next = thresholds[nextIdx]
  const pct = Math.round(((credits - prev) / (next - prev)) * 100)
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
        <span>Next: {labels[nextIdx]}</span>
        <span>{next - credits} more pts</span>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
        <div style={{ width: pct + '%', height: '100%', background: 'linear-gradient(90deg,#7c3aed,#a78bfa)', borderRadius: 4, transition: 'width 0.8s ease' }} />
      </div>
    </div>
  )
}
