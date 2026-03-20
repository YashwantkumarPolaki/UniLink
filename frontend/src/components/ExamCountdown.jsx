import { useState, useEffect } from 'react'
import { Plus, Trash2, X, Clock } from 'lucide-react'

const STORAGE_KEY = 'unilink_exams'

function getExams() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] }
  catch { return [] }
}
function saveExams(exams) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(exams))
}

function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState(null)
  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate) - new Date()
      if (diff <= 0) { setTimeLeft(null); return }
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft({ d, h, m, s })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [targetDate])
  return timeLeft
}

function CountdownItem({ exam, onDelete }) {
  const timeLeft = useCountdown(exam.datetime)
  const isPast = !timeLeft && new Date(exam.datetime) < new Date()
  const urgency = timeLeft
    ? timeLeft.d === 0
      ? '#fb7185'
      : timeLeft.d <= 3
        ? '#fbbf24'
        : '#34d399'
    : '#a78bfa'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      {/* Color dot */}
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: urgency, boxShadow: `0 0 8px ${urgency}`, flexShrink: 0 }} />

      {/* Subject */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: 'white', fontSize: 14, fontWeight: 600, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {exam.subject}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
          {new Date(exam.datetime).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} at {new Date(exam.datetime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Countdown */}
      {isPast ? (
        <div style={{ fontSize: 12, color: '#a78bfa', fontWeight: 700, background: 'rgba(167,139,250,0.1)', padding: '4px 10px', borderRadius: 8 }}>Done ✅</div>
      ) : timeLeft ? (
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {timeLeft.d > 0 && <Seg val={timeLeft.d} label="d" color={urgency} />}
          <Seg val={timeLeft.h} label="h" color={urgency} />
          <Seg val={timeLeft.m} label="m" color={urgency} />
          <Seg val={timeLeft.s} label="s" color={urgency} />
        </div>
      ) : null}

      {/* Delete */}
      <button onClick={() => onDelete(exam.id)}
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.2)', padding: 4, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <Trash2 size={13} />
      </button>
    </div>
  )
}

function Seg({ val, label, color }) {
  return (
    <div style={{ textAlign: 'center', minWidth: 30 }}>
      <div style={{ color, fontSize: 15, fontWeight: 800, fontFamily: 'Syne, sans-serif', lineHeight: 1 }}>{String(val).padStart(2, '0')}</div>
      <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9, letterSpacing: 1 }}>{label}</div>
    </div>
  )
}

export default function ExamCountdown() {
  const [exams, setExams] = useState(getExams)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ subject: '', datetime: '' })

  useEffect(() => { saveExams(exams) }, [exams])

  const addExam = () => {
    if (!form.subject.trim() || !form.datetime) return
    const newExam = { id: Date.now().toString(), subject: form.subject.trim(), datetime: form.datetime }
    setExams(prev => [...prev, newExam].sort((a, b) => new Date(a.datetime) - new Date(b.datetime)))
    setForm({ subject: '', datetime: '' })
    setShowAdd(false)
  }

  const deleteExam = (id) => setExams(prev => prev.filter(e => e.id !== id))

  // Min datetime for picker = now
  const minDatetime = new Date(Date.now() - 60000).toISOString().slice(0, 16)

  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '24px 28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={16} color="#fbbf24" />
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'white', fontSize: 15 }}>Exam Countdown</span>
          {exams.length > 0 && (
            <span style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>{exams.length}</span>
          )}
        </div>
        <button onClick={() => setShowAdd(s => !s)}
          style={{ display: 'flex', alignItems: 'center', gap: 5, background: showAdd ? 'rgba(255,255,255,0.08)' : 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 10, padding: '6px 12px', color: '#fbbf24', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
          {showAdd ? <><X size={12} /> Cancel</> : <><Plus size={12} /> Add Exam</>}
        </button>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, marginBottom: 20 }}>Saved locally on your device</p>

      {/* Add form */}
      {showAdd && (
        <div style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 14, padding: '16px', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Subject / Exam name..."
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', color: 'white', fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif', width: '100%', boxSizing: 'border-box' }} />
          <input type="datetime-local" value={form.datetime} onChange={e => setForm(f => ({ ...f, datetime: e.target.value }))} min={minDatetime}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', color: 'white', fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif', width: '100%', boxSizing: 'border-box', colorScheme: 'dark' }} />
          <button onClick={addExam} disabled={!form.subject.trim() || !form.datetime}
            style={{ background: form.subject && form.datetime ? 'linear-gradient(135deg, #d97706, #fbbf24)' : 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 10, padding: '10px', color: 'white', fontWeight: 700, fontSize: 13, cursor: form.subject && form.datetime ? 'pointer' : 'not-allowed', fontFamily: 'Syne, sans-serif' }}>
            Add Countdown →
          </button>
        </div>
      )}

      {/* List */}
      {exams.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '28px 0', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📅</div>
          No exams added yet. Add your exam schedule!
        </div>
      ) : (
        <div>
          {exams.map(exam => <CountdownItem key={exam.id} exam={exam} onDelete={deleteExam} />)}
        </div>
      )}
    </div>
  )
}
