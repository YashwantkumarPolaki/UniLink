import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import UniLinkLogo from '../components/UniLinkLogo'

// ─── Star Field Canvas ─────────────────────────────────────────────────────────
function StarCanvas() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    const stars = Array.from({ length: 180 }, () => ({
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

// ─── Count Up ─────────────────────────────────────────────────────────────────
function CountUp({ to, suffix = '', isActive }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!isActive) return
    setCount(0)
    let frame = 0; const totalFrames = 70
    const timer = setInterval(() => {
      frame++
      const eased = 1 - Math.pow(1 - frame / totalFrames, 3)
      setCount(Math.floor(eased * to))
      if (frame >= totalFrames) { setCount(to); clearInterval(timer) }
    }, 1800 / totalFrames)
    return () => clearInterval(timer)
  }, [isActive, to])
  return <>{count}{suffix}</>
}

// ─── Feature Mockups ───────────────────────────────────────────────────────────
function EventsMockup() {
  return (
    <div style={{ background: 'rgba(124,92,191,0.04)', border: '1px solid rgba(124,92,191,0.18)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 380 }}>
      <div style={{ fontSize: 11, color: '#7c5cbf', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>Upcoming Events</div>
      {[{ title: 'Smart India Hackathon', meta: 'CSE · Feb 15', tag: 'OPEN' }, { title: 'Cultural Fest 2026', meta: 'All Branches · Mar 2', tag: 'SOON' }, { title: 'ML Workshop', meta: 'AI/ML · Mar 10', tag: 'OPEN' }].map((e, i, arr) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
          <div>
            <div style={{ color: 'white', fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{e.title}</div>
            <div style={{ color: '#555', fontSize: 12 }}>{e.meta}</div>
          </div>
          <span style={{ background: 'rgba(124,92,191,0.15)', color: '#a78bfa', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(124,92,191,0.3)', whiteSpace: 'nowrap' }}>{e.tag}</span>
        </div>
      ))}
    </div>
  )
}

function DoubtsMockup() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%', maxWidth: 380 }}>
      <div style={{ alignSelf: 'flex-end', background: 'rgba(124,92,191,0.18)', border: '1px solid rgba(124,92,191,0.3)', borderRadius: '18px 18px 4px 18px', padding: '12px 16px', maxWidth: '82%' }}>
        <div style={{ color: 'white', fontSize: 14, lineHeight: 1.5 }}>How does dynamic programming work? Confused about memoization vs tabulation.</div>
      </div>
      <div style={{ alignSelf: 'flex-start', background: 'rgba(15,15,32,0.9)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px 18px 18px 4px', padding: '14px 16px', maxWidth: '92%' }}>
        <div style={{ fontSize: 10, color: '#7c5cbf', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 8 }}>✦ AI ANSWER</div>
        <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 1.65 }}>DP breaks problems into overlapping subproblems. <span style={{ color: '#a78bfa' }}>Memoization</span> is top-down, <span style={{ color: '#a78bfa' }}>tabulation</span> is bottom-up.</div>
      </div>
      <div style={{ alignSelf: 'flex-end', background: 'rgba(124,92,191,0.18)', border: '1px solid rgba(124,92,191,0.3)', borderRadius: '18px 18px 4px 18px', padding: '12px 16px', maxWidth: '70%' }}>
        <div style={{ color: 'white', fontSize: 14 }}>Can you show a Fibonacci example?</div>
      </div>
    </div>
  )
}

function InterviewMockup() {
  return (
    <div style={{ background: 'rgba(124,92,191,0.04)', border: '1px solid rgba(124,92,191,0.18)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 340 }}>
      <div style={{ fontSize: 11, color: '#7c5cbf', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>Interview Score</div>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 72, fontWeight: 800, color: 'white', lineHeight: 1 }}>8</span>
        <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 32, fontWeight: 800, color: '#7c5cbf' }}>/10</span>
      </div>
      {[{ label: 'Problem Solving', pct: 85 }, { label: 'Code Quality', pct: 75 }, { label: 'Communication', pct: 90 }].map(({ label, pct }) => (
        <div key={label} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: '#666', fontSize: 12 }}>{label}</span>
            <span style={{ color: '#a78bfa', fontSize: 12, fontWeight: 600 }}>{pct}%</span>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
            <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg,#7c3aed,#a78bfa)', borderRadius: 2 }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function OpportunitiesMockup() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 380 }}>
      {[{ company: 'Google', role: 'SWE Intern', salary: '₹80K/mo', location: 'Bangalore', tag: 'ON CAMPUS' }, { company: 'Zepto', role: 'Product Engineer', salary: '₹60K/mo', location: 'Mumbai', tag: 'OFF CAMPUS' }].map((j, i) => (
        <div key={i} style={{ background: 'rgba(124,92,191,0.04)', border: '1px solid rgba(124,92,191,0.18)', borderRadius: 16, padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 16, marginBottom: 3 }}>{j.company}</div>
              <div style={{ color: '#777', fontSize: 13 }}>{j.role}</div>
            </div>
            <span style={{ background: 'rgba(124,92,191,0.15)', color: '#a78bfa', fontSize: 9, fontWeight: 700, padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(124,92,191,0.3)', whiteSpace: 'nowrap' }}>{j.tag}</span>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <span style={{ color: '#555', fontSize: 12 }}>{j.salary}</span>
            <span style={{ color: '#555', fontSize: 12 }}>{j.location}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Feature Section (own component for useInView hook) ───────────────────────
function FeatureSection({ tag, heading, body, visual, flip }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const textBlock = (
    <motion.div initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }} style={{ flex: '1 1 0', maxWidth: 500 }}>
      <div style={{ fontSize: 12, color: '#7c5cbf', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>{tag}</div>
      <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 'clamp(34px,4vw,52px)', lineHeight: 1.1, margin: '0 0 24px' }}>
        <span style={{ color: 'white', display: 'block' }}>{heading[0]}</span>
        <span style={{ color: 'rgba(255,255,255,0.28)', display: 'block' }}>{heading[1]}</span>
      </h2>
      <p style={{ color: '#666', fontSize: 17, lineHeight: 1.8, margin: 0 }}>{body}</p>
    </motion.div>
  )
  const visualBlock = (
    <motion.div className="feat-visual" initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay: 0.2 }} style={{ flex: '1 1 0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {visual}
    </motion.div>
  )
  return (
    <div ref={ref} className="feat-row" style={{ display: 'flex', alignItems: 'center', gap: 80, padding: '120px 48px', maxWidth: 1100, margin: '0 auto' }}>
      {flip ? <>{visualBlock}{textBlock}</> : <>{textBlock}{visualBlock}</>}
    </div>
  )
}

// ─── Stats Banner ─────────────────────────────────────────────────────────────
function StatsBanner() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  return (
    <section ref={ref} style={{ background: 'rgba(8,8,18,0.95)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '80px 24px', position: 'relative', zIndex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', maxWidth: 700, margin: '0 auto', flexWrap: 'wrap' }}>
        {[['500', '+', 'STUDENTS'], ['50', '+', 'EVENTS'], ['200', '+', 'DOUBTS SOLVED']].map(([num, suf, label], i, arr) => (
          <div key={label} style={{ flex: '1 1 160px', textAlign: 'center', padding: '20px 24px', borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
            <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 48, color: 'white', lineHeight: 1 }}>
              <CountUp to={parseInt(num)} suffix={suf} isActive={isInView} />
            </div>
            <div style={{ fontSize: 11, color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 10 }}>{label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate()
  useEffect(() => { window.scrollTo(0, 0) }, [])

  const features = [
    { tag: '🗓 EVENTS',        heading: ['Your campus,', 'always in the loop.'],    body: 'Hackathons, cultural fests, workshops — filtered by your branch and year. Never miss what matters to you.',   visual: <EventsMockup />,        flip: false },
    { tag: '💬 DOUBTS',        heading: ['Ask anything.', 'Get answers fast.'],     body: 'Post your doubts, get answers from peers and AI instantly. No more waiting for office hours.',                  visual: <DoubtsMockup />,        flip: true  },
    { tag: '🎯 MOCK INTERVIEW', heading: ["Practice like it's", 'the real thing.'], body: 'AI-powered interviews tailored to your target company. Get scored and improve with every session.',           visual: <InterviewMockup />,     flip: false },
    { tag: '💼 OPPORTUNITIES',  heading: ['Your next role', 'starts here.'],         body: 'Campus placements and off-campus drives curated for your branch and graduation year.',                         visual: <OpportunitiesMockup />, flip: true  },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d1a', fontFamily: "'Inter', sans-serif", overflowX: 'hidden', position: 'relative' }}>
      <style>{`
        html { scroll-behavior: smooth; }
        * { box-sizing: border-box; }
        @media (max-width: 768px) {
          .feat-visual { display: none !important; }
          .feat-row { flex-direction: column !important; padding: 64px 24px !important; gap: 32px !important; }
          .hero-btns { flex-direction: column !important; align-items: stretch !important; }
          .hero-stats { flex-direction: column !important; gap: 20px !important; }
        }
      `}</style>

      <StarCanvas />
      <div style={{ position: 'fixed', top: '-20%', left: '-10%', width: '60vw', height: '60vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '30%', right: '-15%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Floating Navbar */}
      <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 100, width: '100%', maxWidth: 840, padding: '0 24px' }}>
        <div style={{ background: 'rgba(13,13,26,0.8)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 50, padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <UniLinkLogo />
          <button onClick={() => navigate('/login')} style={{ background: '#7c5cbf', border: 'none', color: 'white', borderRadius: 50, padding: '8px 22px', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>Sign In</button>
        </div>
      </div>

      {/* Hero */}
      <section style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px', position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 50, padding: '6px 16px', fontSize: 12, color: '#888', letterSpacing: '0.1em', marginBottom: 32 }}>
          ✦ Now Live
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }} style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 'clamp(48px,7vw,96px)', lineHeight: 1.05, margin: '0 0 20px' }}>
          <span style={{ color: 'white', display: 'block' }}>Your College</span>
          <span style={{ color: 'rgba(255,255,255,0.32)', display: 'block' }}>Universe.</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.30 }} style={{ color: '#666', fontSize: 18, margin: '0 0 40px', lineHeight: 1.6 }}>
          Events. Doubts. Opportunities. All in one place.
        </motion.p>
        <motion.div className="hero-btns" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }} style={{ display: 'flex', gap: 14, marginBottom: 80 }}>
          <button onClick={() => navigate('/signup')} style={{ background: '#7c5cbf', border: 'none', color: 'white', borderRadius: 50, padding: '13px 30px', fontWeight: 600, fontSize: 16, cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>Get Started →</button>
          <button onClick={() => navigate('/login')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'white', borderRadius: 50, padding: '13px 30px', fontWeight: 600, fontSize: 16, cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>Sign In</button>
        </motion.div>
        <motion.div className="hero-stats" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.60 }} style={{ display: 'flex', gap: 60, alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 32 }}>
          {[['500+', 'STUDENTS'], ['50+', 'EVENTS'], ['200+', 'DOUBTS SOLVED']].map(([n, l]) => (
            <div key={l} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 28, color: 'white' }}>{n}</span>
              <span style={{ fontSize: 11, color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{l}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section style={{ position: 'relative', zIndex: 1 }}>
        {features.map((f, i) => <FeatureSection key={i} {...f} />)}
      </section>

      {/* Stats */}
      <StatsBanner />

      {/* Footer */}
      <footer style={{ position: 'relative', zIndex: 1, overflow: 'hidden', textAlign: 'center', lineHeight: 0.85 }}>
        <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 'clamp(80px,15vw,200px)', color: 'transparent', WebkitTextStroke: '1px rgba(255,255,255,0.08)', userSelect: 'none', letterSpacing: -4 }}>
          UNILINK
        </div>
      </footer>
    </div>
  )
}
