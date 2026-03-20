import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import API from '../api'

// ─── Star Field Canvas ─────────────────────────────────────────────────────────
function StarCanvas() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    const stars = Array.from({ length: 160 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.3, o: Math.random() * 0.5 + 0.1,
      dir: Math.random() > 0.5 ? 1 : -1, speed: Math.random() * 0.004 + 0.002,
    }))
    let animId
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      stars.forEach(s => {
        s.o += s.speed * s.dir
        if (s.o > 0.65 || s.o < 0.08) s.dir *= -1
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${s.o})`; ctx.fill()
      })
      animId = requestAnimationFrame(draw)
    }
    draw()
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />
}

// ─── Login Page ───────────────────────────────────────────────────────────────
export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const response = await API.post('/auth/login', { email, password })
      localStorage.setItem('token', response.data.access_token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      navigate('/dashboard')
    } catch {
      setError('Invalid email or password!')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d1a', fontFamily: "'Inter', sans-serif", position: 'relative', overflowX: 'hidden' }}>
      <style>{`* { box-sizing: border-box; } input:focus { border-color: #7c5cbf !important; box-shadow: 0 0 0 3px rgba(124,92,191,0.15) !important; outline: none !important; }`}</style>

      <StarCanvas />

      {/* Purple glow behind card */}
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '80vw', height: '80vh', background: 'radial-gradient(ellipse at center, rgba(124,92,191,0.15) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Floating Navbar */}
      <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 100, width: '100%', maxWidth: 840, padding: '0 24px' }}>
        <div style={{ background: 'rgba(13,13,26,0.8)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 50, padding: '12px 24px', display: 'flex', alignItems: 'center' }}>
          <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <img src="/logo.svg" alt="UniLink" style={{ width: '40px', height: '34px' }} />
            <span style={{ color: 'white', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '22px', letterSpacing: '0.5px' }}>UniLink</span>
          </div>
        </div>
      </div>

      {/* Centered card */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '80px 24px 40px', position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: 440 }}
        >
          <div style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 48 }}>

            <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 32, fontWeight: 800, color: 'white', margin: '0 0 8px' }}>Welcome back</h2>
            <p style={{ color: '#666', fontSize: 14, margin: '0 0 32px' }}>Sign in to your UniLink account</p>

            {error && <div style={S.errorBox}>{error}</div>}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={S.label}>EMAIL</label>
                <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} style={S.input} required />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={S.label}>PASSWORD</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} style={{ ...S.input, paddingRight: 44 }} required />
                  <button type="button" onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1 }}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} style={loading ? S.btnDisabled : S.btn}>
                {loading ? 'Signing in...' : 'Sign In →'}
              </button>
            </form>

            <p style={{ textAlign: 'center', color: '#666', fontSize: 14, marginTop: 24, marginBottom: 0 }}>
              Don't have an account?{' '}
              <Link to="/signup" style={{ color: '#7c5cbf', fontWeight: 600, textDecoration: 'none' }}>Create one →</Link>
            </p>
          </div>
        </motion.div>
      </div>

    </div>
  )
}

// ─── Page Styles ──────────────────────────────────────────────────────────────
const S = {
  label:      { fontSize: 12, color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 500 },
  input:      { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px', color: 'white', fontSize: 14, width: '100%', fontFamily: "'Inter',sans-serif", transition: 'border-color 0.2s, box-shadow 0.2s' },
  btn:        { padding: '14px', borderRadius: 12, border: 'none', background: '#7c5cbf', color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer', width: '100%', fontFamily: "'Inter',sans-serif", transition: 'background 0.2s' },
  btnDisabled:{ padding: '14px', borderRadius: 12, border: 'none', background: 'rgba(124,92,191,0.35)', color: 'rgba(255,255,255,0.4)', fontSize: 15, fontWeight: 600, cursor: 'not-allowed', width: '100%', fontFamily: "'Inter',sans-serif" },
  errorBox:   { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: 10, padding: '12px 16px', fontSize: 14, marginBottom: 20 },
}
