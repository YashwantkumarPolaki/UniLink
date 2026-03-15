import { useState, useEffect } from 'react'
import { MessageCircle, ThumbsUp, ThumbsDown, CheckCircle, Star, AlertCircle, Plus, Send, Cpu, ChevronDown, ChevronUp } from 'lucide-react'
import API from '../../api'
import { callAI, AI_PERSONAS, detectDifficulty } from './doubtsAI'
import { S } from './doubtsStyles'

const SUBJECTS = ['Computer Science','Data Structures','Algorithms','Machine Learning',
  'Operating Systems','DBMS','Networks','Mathematics','Physics','Chemistry',
  'Electronics','Mechanics','English','Other']

export default function ForumTab({ user }) {
  const [doubts, setDoubts] = useState([])
  const [loading, setLoading] = useState(true)
  const [subject, setSubject] = useState('All')
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [showPost, setShowPost] = useState(false)
  // Local credits for session (in real app, fetched from backend)
  const [userCredits, setUserCredits] = useState(20)

  useEffect(() => { fetchDoubts() }, [])

  const fetchDoubts = async () => {
    setLoading(true)
    try {
      const res = await API.get('/doubts/')
      setDoubts(res.data.doubts || [])
    } catch { setDoubts([]) }
    setLoading(false)
  }

  const filtered = doubts
    .filter(d => subject === 'All' || d.subject === subject)
    .filter(d => filter === 'all' ? true : filter === 'resolved' ? d.is_resolved : !d.is_resolved)

  const stats = {
    total: doubts.length,
    open: doubts.filter(d => !d.is_resolved).length,
    resolved: doubts.filter(d => d.is_resolved).length,
    totalAnswers: doubts.reduce((a, d) => a + (d.answers?.length || 0), 0)
  }

  const onPosted = () => { setShowPost(false); fetchDoubts(); setUserCredits(c => c + 1) }
  const onAnswered = () => { fetchDoubts(); setUserCredits(c => c + 5) }

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Doubts', value: stats.total,       color: '#a78bfa' },
          { label: 'Open',         value: stats.open,        color: '#fbbf24' },
          { label: 'Resolved',     value: stats.resolved,    color: '#34d399' },
          { label: 'Answers',      value: stats.totalAnswers, color: '#67e8f9' },
        ].map(s => (
          <div key={s.label} style={{ ...S.glassCard, padding: '14px 22px', textAlign: 'center', minWidth: 100 }}>
            <div style={{ fontSize: 22, fontFamily: 'Syne,sans-serif', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
        <button onClick={() => setShowPost(true)} style={{ ...S.gradBtn, marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> Ask a Doubt
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {[['all','🌐 All'],['open','🔓 Open'],['resolved','✅ Resolved']].map(([f, l]) => (
            <button key={f} onClick={() => setFilter(f)} style={{ ...S.pillBtn, ...(filter === f ? S.pillActive : {}) }}>{l}</button>
          ))}
        </div>
        <select value={subject} onChange={e => setSubject(e.target.value)} style={S.selectSm}>
          <option value="All">All Subjects</option>
          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Suggested Doubts */}
      {filtered.filter(d => !d.is_resolved && d.answers?.length === 0).length > 0 && (
        <div style={{ ...S.glassCard, padding: '14px 18px', marginBottom: 18, borderColor: 'rgba(251,191,36,0.2)' }}>
          <div style={{ fontSize: 12, color: '#fbbf24', fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Star size={13} /> Unanswered — be the first to help! (+5 credits each)
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {filtered.filter(d => !d.is_resolved && d.answers?.length === 0).slice(0, 3).map(d => (
              <button key={d.id} onClick={() => setSelected(d)}
                style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 20, padding: '5px 14px', color: '#fbbf24', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                {d.title.slice(0, 40)}{d.title.length > 40 ? '...' : ''}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div style={S.emptyState}><div style={{ ...S.spinner, margin: '0 auto 14px' }} />Loading doubts...</div>
      ) : filtered.length === 0 ? (
        <div style={S.emptyState}><MessageCircle size={44} style={{ marginBottom: 12, opacity: 0.3 }} /><p>No doubts found. Be the first to ask!</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(d => <DoubtCard key={d.id} doubt={d} onClick={() => setSelected(d)} />)}
        </div>
      )}

      {showPost && <PostModal user={user} onClose={() => setShowPost(false)} onPosted={onPosted} />}
      {selected && <DetailModal doubt={selected} user={user} onClose={() => { setSelected(null); fetchDoubts() }} onAnswered={onAnswered} />}
    </div>
  )
}

function DoubtCard({ doubt: d, onClick }) {
  const diff = detectDifficulty(d.title + ' ' + d.description)
  return (
    <div onClick={onClick} style={{ ...S.glassCard, padding: '18px 22px', cursor: 'pointer', transition: 'transform 0.15s, border-color 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.borderColor = 'rgba(167,139,250,0.3)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
        <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700, color: 'white', lineHeight: 1.4, margin: 0 }}>{d.title}</h3>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <span style={{ ...S.badge, background: diff.bg, color: diff.color, border: `1px solid ${diff.color}30` }}>{diff.level}</span>
          <span style={{ ...S.badge, ...(d.is_resolved ? { background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' } : { background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }) }}>
            {d.is_resolved ? '✅ Resolved' : '🔓 Open'}
          </span>
        </div>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.6, margin: '0 0 12px' }}>
        {d.description?.slice(0, 120)}{d.description?.length > 120 ? '...' : ''}
      </p>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={S.chip}>📚 {d.subject || 'General'}</span>
        <span style={S.chip}><MessageCircle size={11} style={{ marginRight: 4 }} />{d.answers?.length || 0} answers</span>
        <span style={{ ...S.chip, marginLeft: 'auto', opacity: 0.5, fontSize: 11 }}>✉ {d.asked_by_email}</span>
      </div>
    </div>
  )
}

function PostModal({ user, onClose, onPosted }) {
  const [form, setForm] = useState({ title: '', description: '', subject: 'Computer Science', college: 'SRM KTR' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const diff = detectDifficulty(form.title + ' ' + form.description)

  const submit = async e => {
    e.preventDefault(); setLoading(true); setError('')
    try { await API.post('/doubts/', form); onPosted() }
    catch (err) { setError(err.response?.data?.detail || 'Failed to post') }
    finally { setLoading(false) }
  }

  return (
    <div onClick={onClose} style={S.overlay}>
      <div onClick={e => e.stopPropagation()} style={S.modal}>
        <button onClick={onClose} style={S.closeBtn}>✕</button>
        <h2 style={S.modalTitle}>Ask a Doubt ✏️</h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 20 }}>Community + AI will help you • +1 credit for asking</p>
        {error && <div style={{ ...S.errorBox, marginBottom: 16 }}>{error}</div>}
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={S.field}><label style={S.label}>Title *</label>
            <input name="title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. What is Big O notation?" style={S.input} required />
          </div>
          {form.title && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Detected difficulty:</span>
              <span style={{ ...S.badge, background: diff.bg, color: diff.color }}>{diff.level}</span>
            </div>
          )}
          <div style={S.field}><label style={S.label}>Description *</label>
            <textarea name="description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Describe your doubt in detail..." style={{ ...S.input, minHeight: 96, resize: 'vertical' }} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={S.field}><label style={S.label}>Subject *</label>
              <select value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} style={S.input}>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={S.field}><label style={S.label}>College</label>
              <input value={form.college} onChange={e => setForm(p => ({ ...p, college: e.target.value }))} style={S.input} />
            </div>
          </div>
          <button type="submit" disabled={loading} style={loading ? S.btnGhost : S.gradBtn}>{loading ? 'Posting...' : 'Post Doubt →'}</button>
        </form>
      </div>
    </div>
  )
}

function DetailModal({ doubt: d, user, onClose, onAnswered }) {
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [aiAnswers, setAiAnswers] = useState({})
  const [aiLoading, setAiLoading] = useState({})
  const [bestAnswer, setBestAnswer] = useState(null)
  const [upvotes, setUpvotes] = useState({})
  const [downvotes, setDownvotes] = useState({})
  const [showAllAI, setShowAllAI] = useState(false)

  const isOwner = user?.email === d.asked_by_email
  const diff = detectDifficulty(d.title + ' ' + d.description)

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h)
  }, [onClose])

  const postAnswer = async e => {
    e.preventDefault(); if (!answer.trim()) return
    setSubmitting(true); setError('')
    try { await API.post(`/doubts/${d.id}/answers`, { answer }); setAnswer(''); onAnswered() }
    catch (err) { setError(err.response?.data?.detail || 'Failed to post answer') }
    finally { setSubmitting(false) }
  }

  const resolve = async () => {
    try { await API.put(`/doubts/${d.id}/resolve`); onClose() }
    catch (err) { setError(err.response?.data?.detail || 'Failed to resolve') }
  }

  const getAI = async (persona) => {
    setAiLoading(p => ({ ...p, [persona.id]: true }))
    try {
      const prompt = `${persona.style}\n\nA student has this doubt:\nSubject: ${d.subject}\nTitle: ${d.title}\nDetail: ${d.description}\n\nAnswer in 3–5 sentences. Be helpful and educational.`
      const result = await callAI(prompt, persona.model)
      setAiAnswers(p => ({ ...p, [persona.id]: result }))
    } catch (e) { setAiAnswers(p => ({ ...p, [persona.id]: '⚠️ ' + e.message })) }
    setAiLoading(p => ({ ...p, [persona.id]: false }))
  }

  const getAllAI = async () => {
    setShowAllAI(true)
    for (const p of AI_PERSONAS) {
      if (!aiAnswers[p.id]) {
        await getAI(p)
        await new Promise(r => setTimeout(r, 4000)) // 4s gap to stay within free tier RPM (10 req/min)
      }
    }
  }

  return (
    <div onClick={onClose} style={S.overlay}>
      <div onClick={e => e.stopPropagation()} style={{ ...S.modal, maxWidth: 680 }}>
        <button onClick={onClose} style={S.closeBtn}>✕</button>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <span style={S.chip}>📚 {d.subject}</span>
          <span style={{ ...S.badge, background: diff.bg, color: diff.color }}>{diff.level}</span>
          <span style={{ ...S.badge, ...(d.is_resolved ? { background: 'rgba(52,211,153,0.12)', color: '#34d399' } : { background: 'rgba(251,191,36,0.12)', color: '#fbbf24' }) }}>
            {d.is_resolved ? '✅ Resolved' : '🔓 Open'}
          </span>
        </div>

        <h2 style={{ ...S.modalTitle, fontSize: 20, marginBottom: 8 }}>{d.title}</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.75, marginBottom: 22 }}>{d.description}</p>

        {/* Multi-AI Section */}
        <div style={{ ...S.glassCard, padding: 18, marginBottom: 20, borderColor: 'rgba(167,139,250,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Cpu size={16} color="#a78bfa" />
            <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14 }}>AI Perspectives</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginLeft: 'auto' }}>GPT-4o + Gemini</span>
          </div>

          {!showAllAI && Object.keys(aiAnswers).length === 0 ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={getAllAI} style={{ ...S.gradBtn, flex: 1, fontSize: 13 }}>🤖 Get All AI Answers</button>
              {AI_PERSONAS.map(p => (
                <button key={p.id} onClick={() => { setShowAllAI(true); getAI(p) }}
                  style={{ padding: '9px 14px', border: `1px solid ${p.border}`, background: p.bg, borderRadius: 10, color: p.color, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'Inter,sans-serif' }}>
                  {p.logo}
                </button>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {AI_PERSONAS.map(p => (
                <div key={p.id} style={{ background: p.bg, border: `1px solid ${p.border}`, borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: p.color, fontWeight: 700 }}>{p.logo} {p.name}</span>
                    {!aiAnswers[p.id] && !aiLoading[p.id] && <button onClick={() => getAI(p)} style={{ fontSize: 11, color: p.color, background: 'transparent', border: `1px solid ${p.border}`, borderRadius: 6, padding: '2px 8px', cursor: 'pointer' }}>Ask</button>}
                    {aiLoading[p.id] && <div style={{ ...S.spinner, width: 13, height: 13, borderWidth: 1.5, borderTopColor: p.color, borderColor: p.color + '40', marginLeft: 4 }} />}
                  </div>
                  {aiAnswers[p.id] && <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{aiAnswers[p.id]}</div>}
                  {!aiAnswers[p.id] && !aiLoading[p.id] && <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, fontStyle: 'italic' }}>Click "Ask" for this AI's perspective</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Community Answers */}
        {d.answers?.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ fontFamily: 'Syne,sans-serif', fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>
              💬 {d.answers.length} Community Answer{d.answers.length !== 1 ? 's' : ''}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {d.answers.map((a, i) => {
                const isBest = bestAnswer === i
                return (
                  <div key={i} style={{ background: isBest ? 'rgba(52,211,153,0.07)' : 'rgba(255,255,255,0.04)', border: `1px solid ${isBest ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 14, padding: '14px 16px', position: 'relative' }}>
                    {isBest && <div style={{ position: 'absolute', top: 10, right: 14, fontSize: 11, color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={12} /> Best Answer</div>}
                    <div style={{ fontSize: 11, color: '#a78bfa', fontWeight: 600, marginBottom: 6 }}>👤 {a.answered_by_email}</div>
                    <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: 10 }}>{a.answer}</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => setUpvotes(prev => ({ ...prev, [i]: (prev[i] || 0) + 1 }))}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 8, padding: '4px 10px', color: '#34d399', cursor: 'pointer', fontSize: 12 }}>
                        <ThumbsUp size={12} /> {upvotes[i] || 0}
                      </button>
                      <button onClick={() => setDownvotes(prev => ({ ...prev, [i]: (prev[i] || 0) + 1 }))}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.2)', borderRadius: 8, padding: '4px 10px', color: '#fb7185', cursor: 'pointer', fontSize: 12 }}>
                        <ThumbsDown size={12} /> {downvotes[i] || 0}
                      </button>
                      {isOwner && !d.is_resolved && (
                        <button onClick={() => setBestAnswer(i)}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 8, padding: '4px 10px', color: isBest ? '#fbbf24' : 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 12 }}>
                          <Star size={12} /> Mark Best
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Post Answer */}
        {!d.is_resolved && (
          <form onSubmit={postAnswer} style={{ marginBottom: 14 }}>
            <label style={{ ...S.label, marginBottom: 8, display: 'block' }}>Your Answer <span style={{ color: '#34d399', fontWeight: 700 }}>(+5 credits)</span></label>
            <textarea value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Share your knowledge or solution..."
              style={{ ...S.input, minHeight: 84, resize: 'vertical', marginBottom: 10 }} />
            {error && <div style={{ ...S.errorBox, marginBottom: 10 }}>{error}</div>}
            <button type="submit" disabled={submitting || !answer.trim()} style={{ ...(submitting || !answer.trim() ? S.btnGhost : S.gradBtn), display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px', fontSize: 14 }}>
              <Send size={14} /> {submitting ? 'Posting...' : 'Post Answer'}
            </button>
          </form>
        )}

        {isOwner && !d.is_resolved && (
          <button onClick={resolve} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399', borderRadius: 10, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Syne,sans-serif' }}>
            <CheckCircle size={14} /> Mark as Resolved
          </button>
        )}
      </div>
    </div>
  )
}
