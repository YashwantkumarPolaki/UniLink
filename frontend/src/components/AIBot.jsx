import { useState, useRef, useEffect } from 'react'
import { askAI } from '../services/aiService'

const SYSTEM_PROMPT = `You are UniLink AI — a smart assistant for Indian college students.
Help with: academic questions, subject doubts, career advice, internship tips, interview prep, and using the UniLink platform.
UniLink features: Events (find/join college events), Doubts (ask peers + AI), Opportunities (internships/jobs), Mock Interview (AI interviewer), Lost & Found (campus board), Exam Countdown (track exams).
Keep answers concise and clear. Be friendly and student-focused. Use short paragraphs or bullet points when listing things.`

export default function AIBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hey! I'm UniLink AI 🤖\nAsk me anything — academics, career tips, or how to use UniLink features!" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef()
  const inputRef = useRef()

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  const send = async () => {
    const q = input.trim()
    if (!q || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: q }])
    setLoading(true)
    try {
      const history = messages.slice(-6)
        .map(m => `${m.role === 'user' ? 'Student' : 'UniLink AI'}: ${m.text}`)
        .join('\n')
      const prompt = history ? `${history}\nStudent: ${q}` : q
      const reply = await askAI(prompt, SYSTEM_PROMPT)
      setMessages(prev => [...prev, { role: 'ai', text: reply }])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: '⚠️ ' + (e.message || 'Something went wrong. Try again.') }])
    }
    setLoading(false)
  }

  const clearChat = () => {
    setMessages([{ role: 'ai', text: "Hey! I'm UniLink AI 🤖\nAsk me anything — academics, career tips, or how to use UniLink features!" }])
  }

  return (
    <>
      <style>{`
        @keyframes botBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 1; }
          40% { transform: translateY(-5px); opacity: 0.7; }
        }
        @keyframes botPulse {
          0% { box-shadow: 0 8px 32px rgba(124,58,237,0.5); }
          50% { box-shadow: 0 8px 48px rgba(124,58,237,0.8), 0 0 0 8px rgba(124,58,237,0.1); }
          100% { box-shadow: 0 8px 32px rgba(124,58,237,0.5); }
        }
        .aibot-btn { animation: botPulse 2.5s ease-in-out infinite; }
        .aibot-btn:hover { transform: scale(1.08) !important; }
        .aibot-input:focus { border-color: rgba(167,139,250,0.5) !important; outline: none !important; }
      `}</style>

      {/* Chat Window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 90, right: 24, width: 360, height: 520,
          background: 'rgba(10,10,22,0.98)', backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(167,139,250,0.2)', borderRadius: 22,
          display: 'flex', flexDirection: 'column', zIndex: 9998,
          boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(167,139,250,0.08)',
        }}>

          {/* Header */}
          <div style={{
            padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', alignItems: 'center', gap: 10, borderRadius: '22px 22px 0 0',
            background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(167,139,250,0.05))',
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, boxShadow: '0 4px 12px rgba(124,58,237,0.4)',
            }}>🤖</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 14, fontFamily: 'Syne,sans-serif' }}>UniLink AI</div>
              <div style={{ color: '#34d399', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
                Always online
              </div>
            </div>
            <button onClick={clearChat} title="Clear chat" style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
              fontSize: 12, padding: '4px 10px', fontFamily: 'Inter,sans-serif',
            }}>Clear</button>
            <button onClick={() => setOpen(false)} style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)',
              cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: '2px 6px',
            }}>✕</button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '14px 14px',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '86%',
                  background: m.role === 'user'
                    ? 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(167,139,250,0.25))'
                    : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${m.role === 'user' ? 'rgba(167,139,250,0.35)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  padding: '10px 14px',
                  color: 'rgba(255,255,255,0.88)',
                  fontSize: 13, lineHeight: 1.65, whiteSpace: 'pre-wrap',
                  fontFamily: 'Inter,sans-serif',
                }}>{m.text}</div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingLeft: 4 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 7, height: 7, borderRadius: '50%', background: '#a78bfa',
                    animation: `botBounce 1.2s ease infinite ${i * 0.18}s`,
                  }} />
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', gap: 8, borderRadius: '0 0 22px 22px',
          }}>
            <input
              ref={inputRef}
              className="aibot-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder="Ask anything..."
              disabled={loading}
              style={{
                flex: 1, background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12, padding: '10px 14px',
                color: 'white', fontSize: 13,
                fontFamily: 'Inter,sans-serif', transition: 'border-color 0.2s',
              }}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              style={{
                width: 40, height: 40, borderRadius: 12, border: 'none', flexShrink: 0,
                cursor: (!loading && input.trim()) ? 'pointer' : 'not-allowed',
                background: (!loading && input.trim())
                  ? 'linear-gradient(135deg,#7c3aed,#a78bfa)'
                  : 'rgba(255,255,255,0.07)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 17, color: 'white', transition: 'background 0.2s',
              }}
            >↑</button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        className="aibot-btn"
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: 24, right: 24,
          width: 56, height: 56, borderRadius: '50%',
          border: 'none', cursor: 'pointer', zIndex: 9999,
          background: open
            ? 'rgba(100,40,200,0.9)'
            : 'linear-gradient(135deg,#7c3aed,#a78bfa)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, transition: 'transform 0.2s, background 0.2s',
        }}
      >
        {open ? '✕' : '🤖'}
      </button>
    </>
  )
}
