import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api'
import Navbar from '../components/Navbar'
import { askAI } from '../services/aiService'

// ─── Constants ────────────────────────────────────────────────────────────────
const ROUNDS = ['Technical Round 1', 'Technical Round 2', 'HR Round', 'Managerial Round', 'System Design Round']
const DIFFICULTIES = ['Easy', 'Medium', 'Hard']
const ROLES = ['Software Engineer', 'Data Scientist', 'Product Manager', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'DevOps Engineer', 'Machine Learning Engineer', 'Data Analyst', 'Business Analyst']

function ScoreRing({ score, size = 120 }) {
  const r = (size - 12) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 70 ? '#34d399' : score >= 40 ? '#fbbf24' : '#fb7185'
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={10} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={10}
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1s ease', strokeLinecap: 'round' }} />
    </svg>
  )
}

function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3500); return () => clearTimeout(t) }, [onDone])
  const ok = type === 'success'
  return (
    <div style={{
      position: 'fixed', bottom: 32, right: 32, zIndex: 9999,
      background: ok ? 'rgba(52,211,153,0.12)' : 'rgba(251,113,133,0.12)',
      border: `1px solid ${ok ? 'rgba(52,211,153,0.4)' : 'rgba(251,113,133,0.4)'}`,
      color: ok ? '#34d399' : '#fb7185',
      borderRadius: 14, padding: '14px 22px', fontSize: 14, fontWeight: 600,
      fontFamily: 'Inter,sans-serif', display: 'flex', alignItems: 'center', gap: 10,
    }}>
      {ok ? '✅' : '❌'} {msg}
    </div>
  )
}

// ─── Setup Screen ─────────────────────────────────────────────────────────────
function SetupScreen({ onStart }) {
  const [form, setForm] = useState({ company: '', role: ROLES[0], round: ROUNDS[0], difficulty: DIFFICULTIES[1], timer: true })
  const set = k => v => setForm(f => ({ ...f, [k]: v }))

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={glass}>
        <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 800, marginBottom: 6 }}>🎯 Interview Setup</h2>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, marginBottom: 28 }}>Configure your mock interview session</p>

        <div style={field}>
          <label style={lbl}>Target Company</label>
          <input value={form.company} onChange={e => set('company')(e.target.value)}
            placeholder="e.g. Google, Amazon, Startup..." style={inp} />
        </div>

        <div style={field}>
          <label style={lbl}>Role / Position</label>
          <select value={form.role} onChange={e => set('role')(e.target.value)} style={inp}>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div style={field}>
          <label style={lbl}>Interview Round</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ROUNDS.map(r => (
              <button key={r} onClick={() => set('round')(r)} style={{
                padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                border: form.round === r ? '1px solid rgba(167,139,250,0.5)' : '1px solid rgba(255,255,255,0.1)',
                background: form.round === r ? 'rgba(167,139,250,0.18)' : 'rgba(255,255,255,0.04)',
                color: form.round === r ? '#a78bfa' : 'rgba(255,255,255,0.5)',
              }}>{r}</button>
            ))}
          </div>
        </div>

        <div style={field}>
          <label style={lbl}>Difficulty</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {DIFFICULTIES.map(d => {
              const col = d === 'Easy' ? '#34d399' : d === 'Medium' ? '#fbbf24' : '#fb7185'
              return (
                <button key={d} onClick={() => set('difficulty')(d)} style={{
                  flex: 1, padding: '10px 0', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  border: form.difficulty === d ? `1px solid ${col}55` : '1px solid rgba(255,255,255,0.1)',
                  background: form.difficulty === d ? `${col}18` : 'rgba(255,255,255,0.04)',
                  color: form.difficulty === d ? col : 'rgba(255,255,255,0.4)',
                }}>{d}</button>
              )
            })}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, marginBottom: 8 }}>
          <div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>⏱️ 3-Minute Timer per Question</p>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 2 }}>Simulates real interview pressure</p>
          </div>
          <button onClick={() => set('timer')(!form.timer)} style={{
            width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
            background: form.timer ? '#7c3aed' : 'rgba(255,255,255,0.1)',
            position: 'relative', transition: 'background 0.2s',
          }}>
            <span style={{
              position: 'absolute', top: 3, left: form.timer ? 23 : 3,
              width: 18, height: 18, borderRadius: '50%', background: 'white',
              transition: 'left 0.2s',
            }} />
          </button>
        </div>

        <button onClick={() => onStart(form)} disabled={!form.company.trim()} style={{
          width: '100%', padding: '14px 0', marginTop: 20, borderRadius: 14,
          background: form.company.trim() ? 'linear-gradient(135deg,#7c3aed,#a78bfa)' : 'rgba(255,255,255,0.08)',
          color: form.company.trim() ? 'white' : 'rgba(255,255,255,0.3)',
          border: 'none', fontSize: 16, fontWeight: 700, cursor: form.company.trim() ? 'pointer' : 'not-allowed',
          fontFamily: 'Syne,sans-serif',
        }}>
          🚀 Start Interview
        </button>
      </div>
    </div>
  )
}

// ─── Interview Screen ─────────────────────────────────────────────────────────
function InterviewScreen({ config, onComplete }) {
  const [currentQ, setCurrentQ] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [qNum, setQNum] = useState(1)             // 1-5 = active question number
  const [error, setError] = useState('')
  const [timeLeft, setTimeLeft] = useState(config.timer ? 180 : null)
  const [submitting, setSubmitting] = useState(false)
  const timerRef = useRef(null)

  const systemPrompt = `You are a strict technical interviewer at ${config.company} interviewing for a ${config.role} position.
Round: ${config.round}. Difficulty: ${config.difficulty}.
Rules:
- Ask ONE technical question at a time
- After the student answers: give Score: X/100 and brief feedback on their answer
- Then immediately ask the next question
- After exactly 5 questions and 5 answers, output ONLY this JSON (no extra text):
{
  "overall_score": <number 0-100>,
  "strengths": ["...", "..."],
  "improvements": ["...", "..."],
  "questions": [
    { "question": "...", "score": <number>, "feedback": "..." }
  ]
}
Start by asking Question 1 now. Do not introduce yourself, go straight to the question.`

  // Fetch first question on mount
  useEffect(() => { fetchQuestion('', true) }, [])

  // Timer
  useEffect(() => {
    if (timeLeft === null || loading || submitting) return
    if (timeLeft <= 0) { handleSubmit(true); return }
    timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(timerRef.current)
  }, [timeLeft, loading, submitting])

  const resetTimer = () => { if (config.timer) setTimeLeft(180) }

  const fetchQuestion = async (userAnswer, isFirst = false) => {
    setLoading(true)
    setError('')
    try {
      const prompt = isFirst ? 'Begin the interview. Ask Question 1 now.' : userAnswer
      const reply = await askAI(prompt, systemPrompt)

      // Detect JSON report (interview complete)
      const jsonStart = reply.indexOf('{')
      const jsonEnd = reply.lastIndexOf('}')
      if (jsonStart !== -1 && jsonEnd !== -1 && reply.includes('"overall_score"')) {
        try {
          const report = JSON.parse(reply.substring(jsonStart, jsonEnd + 1))
          onComplete(report)
          return
        } catch { /* not valid JSON yet, treat as regular response */ }
      }

      setCurrentQ(reply)
      if (!isFirst) setQNum(prev => prev + 1)
      resetTimer()
      setAnswer('')
    } catch (err) {
      setError(err.message || 'Failed to load question. Please try again.')
    } finally {
      setLoading(false)
      setSubmitting(false)
    }
  }

  const handleSubmit = (timedOut = false) => {
    const text = timedOut ? (answer.trim() || '[No answer — time expired]') : answer
    if (!text && !timedOut) return
    setSubmitting(true)
    clearTimeout(timerRef.current)
    setTimeLeft(null)
    fetchQuestion(text, false)
  }

  const timerColor = (timeLeft || 0) <= 30 ? '#fb7185' : (timeLeft || 0) <= 60 ? '#fbbf24' : '#34d399'
  const mins = Math.floor((timeLeft || 0) / 60)
  const secs = ((timeLeft || 0) % 60).toString().padStart(2, '0')
  const displayQ = Math.max(1, Math.min(qNum, 5))

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Progress */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            {loading && !currentQ ? 'Loading...' : `Question ${displayQ} of 5`}
          </span>
          <span style={{ fontSize: 13, color: '#a78bfa', fontWeight: 600 }}>
            {config.company} · {config.role} · {config.round}
          </span>
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 4 }}>
          <div style={{ height: '100%', borderRadius: 4, background: 'linear-gradient(90deg,#7c3aed,#a78bfa)', width: `${(displayQ / 5) * 100}%`, transition: 'width 0.5s ease' }} />
        </div>
      </div>

      <div style={glass}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa', letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'Syne,sans-serif', marginBottom: 10 }}>
              {loading && !currentQ ? 'Starting...' : `Question ${displayQ}`}
            </div>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
                <div style={{ width: 20, height: 20, border: '2px solid rgba(167,139,250,0.2)', borderTop: '2px solid #a78bfa', borderRadius: '50%', animation: 'spin 1s linear infinite', flexShrink: 0 }} />
                AI is thinking...
              </div>
            ) : error ? (
              <div>
                <p style={{ color: '#fb7185', fontSize: 14, marginBottom: 12 }}>⚠️ {error}</p>
                <button onClick={() => fetchQuestion(answer, qNum === 0)} style={{ padding: '8px 18px', borderRadius: 10, border: '1px solid rgba(251,113,133,0.4)', background: 'rgba(251,113,133,0.1)', color: '#fb7185', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                  Retry
                </button>
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: 'rgba(255,255,255,0.9)', whiteSpace: 'pre-wrap' }}>{currentQ}</p>
            )}
          </div>
          {timeLeft !== null && !loading && !error && (
            <div style={{ marginLeft: 20, textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 26, fontWeight: 800, color: timerColor, transition: 'color 0.5s' }}>
                {mins}:{secs}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1 }}>remaining</div>
            </div>
          )}
        </div>

        <textarea
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          placeholder="Type your answer here... Be detailed and structured."
          disabled={loading || submitting || !!error}
          rows={6}
          style={{
            width: '100%', background: '#0d0820', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 14, padding: '16px', color: 'white', fontSize: 14,
            fontFamily: 'Inter,sans-serif', outline: 'none', resize: 'vertical',
            lineHeight: 1.6, boxSizing: 'border-box',
            opacity: loading || submitting || error ? 0.5 : 1,
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
            💡 Tip: Structure your answer clearly (STAR method works well)
          </span>
          <button
            onClick={() => handleSubmit(false)}
            disabled={loading || submitting || !answer.trim() || !!error}
            style={{
              padding: '12px 28px', borderRadius: 12, border: 'none',
              cursor: !loading && !submitting && answer.trim() && !error ? 'pointer' : 'not-allowed',
              background: !loading && !submitting && answer.trim() && !error ? 'linear-gradient(135deg,#7c3aed,#a78bfa)' : 'rgba(255,255,255,0.08)',
              color: !loading && !submitting && answer.trim() && !error ? 'white' : 'rgba(255,255,255,0.3)',
              fontSize: 14, fontWeight: 700, fontFamily: 'Syne,sans-serif',
            }}>
            {submitting ? 'Submitting...' : 'Submit Answer →'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Report Screen ────────────────────────────────────────────────────────────
function ReportScreen({ report, config, onRetry }) {
  const navigate = useNavigate()
  const overall = report.overall_score ?? 0
  const color = overall >= 70 ? '#34d399' : overall >= 40 ? '#fbbf24' : '#fb7185'
  const grade = overall >= 85 ? 'Excellent' : overall >= 70 ? 'Good' : overall >= 50 ? 'Average' : 'Needs Work'

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ ...glass, textAlign: 'center', marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 24, fontWeight: 800, marginBottom: 4 }}>📊 Interview Report</h2>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, marginBottom: 32 }}>
          {config.company} · {config.role} · {config.round}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 24 }}>
          <div style={{ position: 'relative', width: 120, height: 120 }}>
            <ScoreRing score={overall} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 28, fontWeight: 800, color }}>{overall}</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1 }}>/100</span>
            </div>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 28, fontWeight: 800, color }}>{grade}</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Overall Performance</div>
            <div style={{ marginTop: 8, padding: '4px 12px', background: `${color}18`, border: `1px solid ${color}44`, borderRadius: 20, display: 'inline-block', fontSize: 12, fontWeight: 700, color }}>
              {config.difficulty} · {config.round}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{ ...glass, borderColor: 'rgba(52,211,153,0.2)' }}>
          <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700, color: '#34d399', marginBottom: 12 }}>✅ Strengths</h3>
          {(report.strengths || []).length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(report.strengths || []).map((s, i) => <li key={i} style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 1.5 }}>{s}</li>)}
            </ul>
          ) : <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>—</p>}
        </div>
        <div style={{ ...glass, borderColor: 'rgba(251,191,36,0.2)' }}>
          <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700, color: '#fbbf24', marginBottom: 12 }}>📈 Areas to Improve</h3>
          {(report.improvements || []).length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(report.improvements || []).map((s, i) => <li key={i} style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 1.5 }}>{s}</li>)}
            </ul>
          ) : <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>—</p>}
        </div>
      </div>

      <div style={{ ...glass, marginBottom: 24 }}>
        <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 700, marginBottom: 20 }}>📝 Question Breakdown</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {(report.questions || []).map((q, i) => {
            const sc = q.score ?? 0
            const c = sc >= 70 ? '#34d399' : sc >= 40 ? '#fbbf24' : '#fb7185'
            return (
              <div key={i} style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 13, fontWeight: 700, color: '#a78bfa' }}>Q{i + 1}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ height: 6, width: 80, background: 'rgba(255,255,255,0.08)', borderRadius: 3 }}>
                      <div style={{ height: '100%', width: `${sc}%`, background: c, borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: c, minWidth: 36 }}>{sc}/100</span>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5, marginBottom: q.feedback ? 8 : 0 }}>{q.question}</p>
                {q.feedback && (
                  <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8 }}>
                    💬 {q.feedback}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button onClick={onRetry} style={{ padding: '13px 32px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Syne,sans-serif' }}>
          🔄 Try Again
        </button>
        <button onClick={() => navigate('/dashboard')} style={{ padding: '13px 32px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Syne,sans-serif' }}>
          🏠 Dashboard
        </button>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MockInterview() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState('setup')
  const [config, setConfig] = useState(null)
  const [report, setReport] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    API.get('/auth/me').catch(() => navigate('/login'))
  }, [])

  const phaseLabel = { setup: 'Setup', interview: 'In Progress', report: 'Report' }

  return (
    <div style={root}>
      <div style={blob1} /><div style={blob2} /><div style={blob3} />
      <Navbar />

      <div style={page}>
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
            <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 34, fontWeight: 800, margin: 0 }}>Mock Interview 🎤</h1>
            {phase !== 'setup' && (
              <span style={{ padding: '4px 14px', background: phase === 'report' ? 'rgba(52,211,153,0.15)' : 'rgba(167,139,250,0.15)', border: `1px solid ${phase === 'report' ? 'rgba(52,211,153,0.4)' : 'rgba(167,139,250,0.4)'}`, color: phase === 'report' ? '#34d399' : '#a78bfa', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                {phaseLabel[phase]}
              </span>
            )}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>
            AI-powered interview practice — get <span style={{ color: '#a78bfa' }}>real-time scores</span> and feedback
          </p>
        </div>

        {phase === 'setup'     && <SetupScreen onStart={cfg => { setConfig(cfg); setPhase('interview') }} />}
        {phase === 'interview' && config && <InterviewScreen config={config} onComplete={r => { setReport(r); setPhase('report') }} />}
        {phase === 'report'    && report && <ReportScreen report={report} config={config} onRetry={() => { setReport(null); setPhase('setup') }} />}
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const glass = { background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '28px 28px' }
const field  = { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }
const lbl    = { fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: 'Syne,sans-serif' }
const inp    = { background: '#0d0820', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 16px', color: 'white', fontSize: 14, fontFamily: 'Inter,sans-serif', outline: 'none' }
const root   = { minHeight: '100vh', background: 'linear-gradient(160deg,#050510 0%,#0d0820 40%,#060315 100%)', fontFamily: "'Inter',sans-serif", color: 'white' }
const blob1  = { position: 'fixed', top: '-20%', left: '-10%', width: '60vw', height: '60vw', borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.12) 0%,transparent 65%)', pointerEvents: 'none' }
const blob2  = { position: 'fixed', top: '30%', right: '-15%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle,rgba(236,72,153,0.08) 0%,transparent 65%)', pointerEvents: 'none' }
const blob3  = { position: 'fixed', bottom: '-10%', left: '25%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle,rgba(16,185,129,0.06) 0%,transparent 65%)', pointerEvents: 'none' }
const page   = { maxWidth: 900, margin: '0 auto', padding: '48px 24px' }
