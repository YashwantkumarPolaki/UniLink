import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import API from '../api'

const DOMAINS = ['EdTech','FinTech','HealthTech','AgriTech','GreenTech','SaaS','E-Commerce','Social Impact','Gaming','AI / ML','Web3','Other']
const SKILL_OPTIONS = ['React','Node.js','Python','ML/AI','UI/UX','Flutter','Django','FastAPI','Data Science','Marketing','Finance','DevOps','Blockchain','Video Editing','Content Writing']

function Badge({ text, color = '#7c5cbf' }) {
  return (
    <span style={{ background: `${color}22`, border: `1px solid ${color}44`, color, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>
      {text}
    </span>
  )
}

export default function CoFounder() {
  const navigate = useNavigate()
  const [ideas, setIdeas]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [tab, setTab]               = useState('all')      // 'all' | 'mine'
  const [showPost, setShowPost]     = useState(false)
  const [interestModal, setInterestModal] = useState(null) // idea object
  const [interestsList, setInterestsList] = useState(null) // { idea, list }
  const [toast, setToast]           = useState(null)
  const me = JSON.parse(localStorage.getItem('user') || '{}')

  const [form, setForm] = useState({ title: '', description: '', domain: '', skills_needed: [], team_size: 2 })
  const [interestMsg, setInterestMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchIdeas = useCallback(async () => {
    try {
      const res = await API.get('/cofounders/')
      setIdeas(res.data.ideas || [])
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchIdeas() }, [fetchIdeas])

  const myIdeas = ideas.filter(i => i.posted_by === me.user_id || i.posted_by_email === me.email)
  const displayed = tab === 'mine' ? myIdeas : ideas

  const toggleSkill = (skill) => {
    setForm(prev => ({
      ...prev,
      skills_needed: prev.skills_needed.includes(skill)
        ? prev.skills_needed.filter(s => s !== skill)
        : [...prev.skills_needed, skill]
    }))
  }

  const handlePost = async (e) => {
    e.preventDefault()
    if (!form.domain) return showToast('Please select a domain', 'error')
    if (form.skills_needed.length === 0) return showToast('Select at least one skill needed', 'error')
    setSubmitting(true)
    try {
      await API.post('/cofounders/', form)
      showToast('🚀 Idea posted!')
      setShowPost(false)
      setForm({ title: '', description: '', domain: '', skills_needed: [], team_size: 2 })
      await fetchIdeas()
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to post', 'error')
    } finally { setSubmitting(false) }
  }

  const handleInterest = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await API.post(`/cofounders/${interestModal.id}/interest`, { message: interestMsg })
      showToast("🤝 Interest sent! The founder will reach out.")
      setInterestModal(null)
      setInterestMsg('')
      await fetchIdeas()
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed', 'error')
    } finally { setSubmitting(false) }
  }

  const loadInterests = async (idea) => {
    try {
      const res = await API.get(`/cofounders/${idea.id}/interests`)
      setInterestsList({ idea, list: res.data.interests || [] })
    } catch (err) {
      showToast(err.response?.data?.detail || 'Could not load interests', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this idea?')) return
    try {
      await API.delete(`/cofounders/${id}`)
      showToast('Idea deleted')
      await fetchIdeas()
    } catch { showToast('Failed to delete', 'error') }
  }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d1a', fontFamily: "'Inter',sans-serif", paddingBottom: 60 }}>
      <style>{`* { box-sizing: border-box; } textarea,input,select { outline: none; } ::-webkit-scrollbar{width:6px} ::-webkit-scrollbar-thumb{background:rgba(124,92,191,0.4);border-radius:3px}`}</style>

      {/* Navbar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(13,13,26,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '7px 14px', color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>← Back</button>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'white', fontFamily: 'Syne,sans-serif' }}>🤝 Co-Founder Finder</h1>
            <p style={{ margin: 0, fontSize: 12, color: '#666' }}>Find your startup co-founder from your campus</p>
          </div>
        </div>
        <button onClick={() => setShowPost(true)}
          style={{ background: 'linear-gradient(135deg,#7c5cbf,#a78bfa)', border: 'none', borderRadius: 10, padding: '10px 20px', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
          + Post Idea
        </button>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 24px' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {['all', 'mine'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '8px 20px', borderRadius: 20, border: `1px solid ${tab === t ? 'rgba(124,92,191,0.5)' : 'rgba(255,255,255,0.1)'}`, background: tab === t ? 'rgba(124,92,191,0.18)' : 'transparent', color: tab === t ? '#a78bfa' : 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: tab === t ? 700 : 400, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
              {t === 'all' ? `All Ideas (${ideas.length})` : `My Ideas (${myIdeas.length})`}
            </button>
          ))}
        </div>

        {/* Ideas feed */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1,2,3].map(i => <div key={i} style={{ height: 140, background: 'rgba(255,255,255,0.04)', borderRadius: 16, animation: 'pulse 1.5s infinite' }} />)}
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#444' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>💡</div>
            <div style={{ fontSize: 16, color: '#555' }}>{tab === 'mine' ? "You haven't posted any ideas yet" : 'No ideas posted yet'}</div>
            <button onClick={() => setShowPost(true)} style={{ marginTop: 16, background: 'rgba(124,92,191,0.2)', border: '1px solid rgba(124,92,191,0.3)', borderRadius: 10, padding: '10px 24px', color: '#a78bfa', fontSize: 13, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>Post the first idea →</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {displayed.map((idea, i) => {
              const isOwner = idea.posted_by === me.user_id || idea.posted_by_email === me.email
              return (
                <motion.div key={idea.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '22px 24px', backdropFilter: 'blur(12px)' }}>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                        <h3 style={{ margin: 0, color: 'white', fontSize: 17, fontWeight: 700 }}>{idea.title}</h3>
                        <Badge text={idea.domain} color="#7c5cbf" />
                        <Badge text={`${idea.team_size} co-founder${idea.team_size > 1 ? 's' : ''} needed`} color="#06b6d4" />
                      </div>
                      <p style={{ margin: '0 0 12px', color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.6 }}>{idea.description}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                        {(idea.skills_needed || []).map(s => <Badge key={s} text={s} color="#10b981" />)}
                      </div>
                      <div style={{ fontSize: 12, color: '#555' }}>
                        Posted by <span style={{ color: '#a78bfa' }}>{idea.posted_by_name || idea.posted_by_email}</span>
                        {idea.branch && <span> · {idea.branch}</span>}
                        {idea.interest_count > 0 && <span style={{ color: '#f59e0b' }}> · {idea.interest_count} interested</span>}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                      {isOwner ? (
                        <>
                          <button onClick={() => loadInterests(idea)}
                            style={{ background: 'rgba(124,92,191,0.2)', border: '1px solid rgba(124,92,191,0.3)', borderRadius: 8, padding: '8px 14px', color: '#a78bfa', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter,sans-serif', whiteSpace: 'nowrap' }}>
                            👥 View Interests ({idea.interest_count})
                          </button>
                          <button onClick={() => handleDelete(idea.id)}
                            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '8px 14px', color: '#ef4444', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                            🗑 Delete
                          </button>
                        </>
                      ) : (
                        <button onClick={() => setInterestModal(idea)}
                          style={{ background: 'linear-gradient(135deg,#7c5cbf,#a78bfa)', border: 'none', borderRadius: 8, padding: '9px 18px', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif', whiteSpace: 'nowrap' }}>
                          🤝 I'm Interested
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Post Idea Modal */}
      <AnimatePresence>
        {showPost && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowPost(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#13102a', border: '1px solid rgba(124,92,191,0.3)', borderRadius: 20, padding: '36px 32px', width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
              <h2 style={{ margin: '0 0 24px', color: 'white', fontFamily: 'Syne,sans-serif', fontSize: 22 }}>💡 Post Your Idea</h2>
              <form onSubmit={handlePost} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label style={lbl}>IDEA TITLE</label>
                  <input value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="e.g. AI-powered study planner for students" required style={inp} />
                </div>
                <div>
                  <label style={lbl}>DESCRIPTION</label>
                  <textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} placeholder="What problem does it solve? What's your vision?" required rows={3} style={{ ...inp, resize: 'vertical' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={lbl}>DOMAIN</label>
                    <select value={form.domain} onChange={e => setForm(p => ({...p, domain: e.target.value}))} style={{ ...inp, cursor: 'pointer' }}>
                      <option value="">Select domain</option>
                      {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>CO-FOUNDERS NEEDED</label>
                    <select value={form.team_size} onChange={e => setForm(p => ({...p, team_size: parseInt(e.target.value)}))} style={{ ...inp, cursor: 'pointer' }}>
                      {[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={lbl}>SKILLS NEEDED (select all that apply)</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                    {SKILL_OPTIONS.map(s => {
                      const sel = form.skills_needed.includes(s)
                      return (
                        <button key={s} type="button" onClick={() => toggleSkill(s)}
                          style={{ padding: '6px 12px', borderRadius: 20, border: `1px solid ${sel ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.1)'}`, background: sel ? 'rgba(16,185,129,0.15)' : 'transparent', color: sel ? '#10b981' : 'rgba(255,255,255,0.5)', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter,sans-serif', fontWeight: sel ? 700 : 400 }}>
                          {s}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button type="button" onClick={() => setShowPost(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 13, color: 'rgba(255,255,255,0.5)', fontSize: 14, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>Cancel</button>
                  <button type="submit" disabled={submitting} style={{ flex: 2, background: submitting ? 'rgba(124,92,191,0.4)' : 'linear-gradient(135deg,#7c5cbf,#a78bfa)', border: 'none', borderRadius: 10, padding: 13, color: 'white', fontSize: 14, fontWeight: 600, cursor: submitting ? 'wait' : 'pointer', fontFamily: 'Inter,sans-serif' }}>
                    {submitting ? 'Posting...' : '🚀 Post Idea'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Express Interest Modal */}
      <AnimatePresence>
        {interestModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setInterestModal(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#13102a', border: '1px solid rgba(124,92,191,0.3)', borderRadius: 20, padding: '36px 32px', width: '100%', maxWidth: 480 }}>
              <h2 style={{ margin: '0 0 6px', color: 'white', fontFamily: 'Syne,sans-serif', fontSize: 20 }}>🤝 Express Interest</h2>
              <p style={{ margin: '0 0 22px', color: '#666', fontSize: 13 }}>in <span style={{ color: '#a78bfa' }}>{interestModal.title}</span></p>
              <form onSubmit={handleInterest} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={lbl}>YOUR PITCH (why you're a good fit)</label>
                  <textarea value={interestMsg} onChange={e => setInterestMsg(e.target.value)} placeholder="e.g. I'm a 3rd year CSE student with experience in React and ML. I've built 2 mini-projects and want to work on something impactful..." required rows={4} style={{ ...inp, resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" onClick={() => setInterestModal(null)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 13, color: 'rgba(255,255,255,0.5)', fontSize: 14, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>Cancel</button>
                  <button type="submit" disabled={submitting} style={{ flex: 2, background: submitting ? 'rgba(124,92,191,0.4)' : 'linear-gradient(135deg,#7c5cbf,#a78bfa)', border: 'none', borderRadius: 10, padding: 13, color: 'white', fontSize: 14, fontWeight: 600, cursor: submitting ? 'wait' : 'pointer', fontFamily: 'Inter,sans-serif' }}>
                    {submitting ? 'Sending...' : '🤝 Send Interest'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Interests Modal */}
      <AnimatePresence>
        {interestsList && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setInterestsList(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#13102a', border: '1px solid rgba(124,92,191,0.3)', borderRadius: 20, padding: '32px', width: '100%', maxWidth: 520, maxHeight: '80vh', overflowY: 'auto' }}>
              <h2 style={{ margin: '0 0 4px', color: 'white', fontFamily: 'Syne,sans-serif', fontSize: 20 }}>👥 Interested Students</h2>
              <p style={{ margin: '0 0 22px', color: '#555', fontSize: 13 }}>for: <span style={{ color: '#a78bfa' }}>{interestsList.idea.title}</span></p>
              {interestsList.list.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#444' }}>No one has expressed interest yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {interestsList.list.map(interest => (
                    <div key={interest.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px 18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div>
                          <span style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>{interest.name || 'Anonymous'}</span>
                          {interest.branch && <span style={{ color: '#666', fontSize: 12, marginLeft: 8 }}>· {interest.branch}</span>}
                        </div>
                        <a href={`mailto:${interest.email}`} style={{ background: 'rgba(124,92,191,0.2)', border: '1px solid rgba(124,92,191,0.3)', borderRadius: 8, padding: '5px 12px', color: '#a78bfa', fontSize: 11, textDecoration: 'none', fontWeight: 600 }}>
                          📧 Contact
                        </a>
                      </div>
                      <p style={{ margin: 0, color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.6 }}>"{interest.message}"</p>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => setInterestsList(null)} style={{ width: '100%', marginTop: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 12, color: 'rgba(255,255,255,0.5)', fontSize: 13, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
            style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', background: toast.type === 'error' ? 'rgba(239,68,68,0.9)' : 'rgba(16,185,129,0.9)', color: 'white', padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 500, zIndex: 999, backdropFilter: 'blur(10px)', whiteSpace: 'nowrap' }}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const lbl = { fontSize: 11, color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 6, display: 'block' }
const inp = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px 14px', color: 'white', fontSize: 14, fontFamily: 'Inter,sans-serif', width: '100%', colorScheme: 'dark' }
