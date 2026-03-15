import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import API from '../api'

// ─── Forgot Password Modal (unchanged logic) ───────────────────────────────────
function ForgotModal({ onClose }) {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const [showPw, setShowPw] = useState(false)
  const inputRefs = useRef([])
  const timerRef = useRef(null)

  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setTimeout(() => setResendTimer(t => t - 1), 1000)
    }
    return () => clearTimeout(timerRef.current)
  }, [resendTimer])

  const handleSendOtp = async () => {
    if (!email.trim()) return
    setLoading(true); setError('')
    try {
      await API.post('/auth/forgot-password', { email })
      setStep(2); setResendTimer(60)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send OTP')
    } finally { setLoading(false) }
  }

  const handleOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]; next[i] = val; setOtp(next)
    if (val && i < 5) inputRefs.current[i + 1]?.focus()
    if (next.every(d => d) && val) handleVerifyOtp(next.join(''))
  }
  const handleOtpKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputRefs.current[i - 1]?.focus()
  }

  const handleVerifyOtp = async (code) => {
    setLoading(true); setError('')
    try {
      await API.post('/auth/verify-otp', { email, otp: code || otp.join('') })
      setStep(3)
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid OTP')
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally { setLoading(false) }
  }

  const handleResend = async () => {
    if (resendTimer > 0) return
    setError('')
    try {
      await API.post('/auth/forgot-password', { email })
      setResendTimer(60); setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to resend OTP')
    }
  }

  const handleReset = async () => {
    if (newPw !== confirmPw) { setError('Passwords do not match'); return }
    if (newPw.length < 8)    { setError('Password must be at least 8 characters'); return }
    setLoading(true); setError('')
    try {
      await API.post('/auth/reset-password', { email, otp: otp.join(''), new_password: newPw })
      onClose('success')
    } catch (err) {
      setError(err.response?.data?.detail || 'Reset failed')
    } finally { setLoading(false) }
  }

  return (
    <div style={M.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={M.modal}>
        <div style={M.steps}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, background: step >= s ? 'linear-gradient(135deg,#7c3aed,#a78bfa)' : 'rgba(255,255,255,0.08)', color: step >= s ? 'white' : 'rgba(255,255,255,0.3)', border: step === s ? '2px solid #a78bfa' : '2px solid transparent' }}>{s}</div>
              {s < 3 && <div style={{ width: 40, height: 2, background: step > s ? '#a78bfa' : 'rgba(255,255,255,0.1)', borderRadius: 1 }} />}
            </div>
          ))}
        </div>

        {error && <div style={M.errorBox}>{error}</div>}

        {step === 1 && (
          <>
            <h2 style={M.title}>Forgot Password?</h2>
            <p style={M.sub}>Enter your registered email — we'll send a 6-digit OTP</p>
            <label style={M.label}>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" style={M.input} onKeyDown={e => e.key === 'Enter' && handleSendOtp()} autoFocus />
            <button onClick={handleSendOtp} disabled={loading || !email.trim()} style={loading || !email.trim() ? M.btnDisabled : M.btn}>{loading ? 'Sending...' : 'Send OTP →'}</button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 style={M.title}>Enter OTP</h2>
            <p style={M.sub}>Sent to <span style={{ color: '#a78bfa' }}>{email}</span></p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', margin: '24px 0' }}>
              {otp.map((d, i) => (
                <input key={i} ref={el => inputRefs.current[i] = el} type="text" inputMode="numeric" maxLength={1} value={d}
                  onChange={e => handleOtpChange(i, e.target.value)} onKeyDown={e => handleOtpKeyDown(i, e)} autoFocus={i === 0}
                  style={{ width: 45, height: 55, textAlign: 'center', fontSize: 24, fontWeight: 800, background: 'rgba(167,139,250,0.08)', border: d ? '2px solid #a78bfa' : '2px solid rgba(167,139,250,0.25)', borderRadius: 12, color: 'white', outline: 'none', fontFamily: 'Syne,sans-serif' }}
                />
              ))}
            </div>
            <button onClick={() => handleVerifyOtp('')} disabled={loading || otp.some(d => !d)} style={loading || otp.some(d => !d) ? M.btnDisabled : M.btn}>{loading ? 'Verifying...' : 'Verify OTP →'}</button>
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              {resendTimer > 0
                ? <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Resend in <span style={{ color: '#a78bfa' }}>{resendTimer}s</span></span>
                : <button onClick={handleResend} style={{ background: 'none', border: 'none', color: '#a78bfa', fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>Resend OTP</button>
              }
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 style={M.title}>Set New Password</h2>
            <p style={M.sub}>Choose a strong password (min 8 characters)</p>
            <label style={M.label}>New Password</label>
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <input type={showPw ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min 8 characters" style={{ ...M.input, marginBottom: 0 }} />
              <button onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 14 }}>{showPw ? '🙈' : '👁️'}</button>
            </div>
            <label style={M.label}>Confirm Password</label>
            <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Repeat new password" style={{ ...M.input, borderColor: confirmPw && newPw !== confirmPw ? 'rgba(251,113,133,0.5)' : undefined }} />
            {confirmPw && newPw !== confirmPw && <span style={{ color: '#fb7185', fontSize: 12, display: 'block', marginTop: -8, marginBottom: 8 }}>Passwords do not match</span>}
            <button onClick={handleReset} disabled={loading || !newPw || !confirmPw} style={loading || !newPw || !confirmPw ? M.btnDisabled : M.btn}>{loading ? 'Resetting...' : 'Reset Password →'}</button>
          </>
        )}

        <button onClick={() => onClose()} style={{ position: 'absolute', top: 16, right: 20, background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 20, cursor: 'pointer', lineHeight: 1 }}>✕</button>
      </div>
    </div>
  )
}

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
  const [showForgot, setShowForgot] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
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

  const handleForgotClose = (result) => {
    setShowForgot(false)
    if (result === 'success') setSuccessMsg('Password reset successful! Please sign in with your new password.')
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
          <span onClick={() => navigate('/')} style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 18, color: 'white', letterSpacing: -0.5, cursor: 'pointer' }}>UniLink</span>
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

            {error      && <div style={S.errorBox}>{error}</div>}
            {successMsg && <div style={S.successBox}>✅ {successMsg}</div>}

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

              <button type="button" onClick={() => setShowForgot(true)} style={{ background: 'none', border: 'none', color: '#7c5cbf', fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'right', padding: 0, alignSelf: 'flex-end' }}>
                Forgot password?
              </button>

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

      {showForgot && <ForgotModal onClose={handleForgotClose} />}
    </div>
  )
}

// ─── Modal Styles ─────────────────────────────────────────────────────────────
const M = {
  overlay:    { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 },
  modal:      { background: 'linear-gradient(160deg,#0d0820,#120a2e)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 24, padding: '40px 36px', width: '100%', maxWidth: 420, position: 'relative', boxShadow: '0 40px 80px rgba(0,0,0,0.6)' },
  steps:      { display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  title:      { fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 6 },
  sub:        { color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 },
  label:      { fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'Syne,sans-serif', display: 'block', marginBottom: 8 },
  input:      { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px', color: 'white', fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 16, fontFamily: 'Inter,sans-serif' },
  btn:        { width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: '#7c5cbf', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Syne,sans-serif' },
  btnDisabled:{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: 'rgba(124,92,191,0.3)', color: 'rgba(255,255,255,0.4)', fontSize: 15, fontWeight: 700, cursor: 'not-allowed', fontFamily: 'Syne,sans-serif' },
  errorBox:   { background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.3)', color: '#fb7185', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 16 },
}

// ─── Page Styles ──────────────────────────────────────────────────────────────
const S = {
  label:      { fontSize: 12, color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 500 },
  input:      { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px', color: 'white', fontSize: 14, width: '100%', fontFamily: "'Inter',sans-serif", transition: 'border-color 0.2s, box-shadow 0.2s' },
  btn:        { padding: '14px', borderRadius: 12, border: 'none', background: '#7c5cbf', color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer', width: '100%', fontFamily: "'Inter',sans-serif", transition: 'background 0.2s' },
  btnDisabled:{ padding: '14px', borderRadius: 12, border: 'none', background: 'rgba(124,92,191,0.35)', color: 'rgba(255,255,255,0.4)', fontSize: 15, fontWeight: 600, cursor: 'not-allowed', width: '100%', fontFamily: "'Inter',sans-serif" },
  errorBox:   { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: 10, padding: '12px 16px', fontSize: 14, marginBottom: 20 },
  successBox: { background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399', borderRadius: 10, padding: '12px 16px', fontSize: 14, marginBottom: 20 },
}
