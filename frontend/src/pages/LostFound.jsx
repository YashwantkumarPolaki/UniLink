import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, MapPin, Phone, Clock, X, Upload, CheckCircle, Trash2 } from 'lucide-react'
import API from '../api'
import Navbar from '../components/Navbar'

const glass = {
  background: 'rgba(255,255,255,0.04)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.08)',
}

export default function LostFound() {
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({ title: '', description: '', category: 'lost', location: '', contact: '', image_base64: '' })
  const [imgPreview, setImgPreview] = useState('')
  const fileRef = useRef()
  const navigate = useNavigate()

  useEffect(() => {
    const u = localStorage.getItem('user')
    if (!u) { navigate('/login'); return }
    const parsed = JSON.parse(u)
    if (parsed.role !== 'student') { navigate('/dashboard'); return }
    setUser(parsed)
    fetchPosts()
  }, [])

  useEffect(() => {
    let result = posts
    if (activeTab !== 'all') result = result.filter(p => p.category === activeTab)
    if (search.trim()) result = result.filter(p =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase())
    )
    setFiltered(result)
  }, [posts, activeTab, search])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const res = await API.get('/lost-found/')
      setPosts(res.data)
    } catch { setError('Could not load posts.') }
    setLoading(false)
  }

  const handleImage = (file) => {
    if (!file) return
    if (file.size > 600000) { setError('Image must be under 500KB'); return }
    const reader = new FileReader()
    reader.onload = (e) => {
      setImgPreview(e.target.result)
      setForm(f => ({ ...f, image_base64: e.target.result }))
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.location || !form.contact) {
      setError('Please fill in all required fields.'); return
    }
    setSubmitting(true); setError(''); setSuccess('')
    try {
      await API.post('/lost-found/', form)
      setSuccess('Post created successfully!')
      setShowModal(false)
      setForm({ title: '', description: '', category: 'lost', location: '', contact: '', image_base64: '' })
      setImgPreview('')
      fetchPosts()
    } catch (e) { setError(e.response?.data?.detail || 'Failed to create post.') }
    setSubmitting(false)
  }

  const handleResolve = async (id) => {
    try {
      await API.put(`/lost-found/${id}/resolve`)
      fetchPosts()
    } catch (e) { setError(e.response?.data?.detail || 'Failed to resolve.') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post?')) return
    try {
      await API.delete(`/lost-found/${id}`)
      fetchPosts()
    } catch (e) { setError(e.response?.data?.detail || 'Failed to delete.') }
  }

  const categoryColor = (cat) => cat === 'lost'
    ? { color: '#fb7185', bg: 'rgba(251,113,133,0.12)', border: 'rgba(251,113,133,0.3)' }
    : { color: '#34d399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.3)' }

  const statusColor = (s) => s === 'resolved'
    ? { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' }
    : { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #050510 0%, #0d0820 40%, #060315 100%)', fontFamily: "'Inter', sans-serif" }}>
      {/* Background orbs */}
      <div style={{ position: 'fixed', top: '-20%', left: '-10%', width: '60vw', height: '60vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-10%', right: '-10%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,113,133,0.08) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />

      <Navbar />

      <div className="page-pad" style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 48px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.25)', color: '#fb7185', padding: '6px 16px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: 2, marginBottom: 16, fontFamily: 'Syne, sans-serif' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fb7185', boxShadow: '0 0 8px #fb7185', display: 'inline-block' }} />
            STUDENTS ONLY · CAMPUS
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24 }}>
            <div>
              <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 42, fontWeight: 800, color: 'white', lineHeight: 1.1, marginBottom: 10, letterSpacing: -1 }}>
                🔍 Lost &amp; Found
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>Lost something on campus? Found something? Post it here.</p>
            </div>
            <button onClick={() => { setShowModal(true); setError(''); setSuccess('') }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #7c3aed, #fb7185)', border: 'none', borderRadius: 14, padding: '13px 24px', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Syne, sans-serif', boxShadow: '0 8px 32px rgba(124,58,237,0.35)', whiteSpace: 'nowrap' }}>
              <Plus size={16} /> Report Item
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && <div style={{ background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.3)', color: '#fb7185', padding: '12px 18px', borderRadius: 12, marginBottom: 20, fontSize: 14 }}>{error}</div>}
        {success && <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399', padding: '12px 18px', borderRadius: 12, marginBottom: 20, fontSize: 14 }}>{success}</div>}

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
          {[['all', '📋 All'], ['lost', '❌ Lost'], ['found', '✅ Found']].map(([val, label]) => (
            <button key={val} onClick={() => setActiveTab(val)}
              style={{ padding: '9px 20px', borderRadius: 20, border: activeTab === val ? '1px solid rgba(167,139,250,0.5)' : '1px solid rgba(255,255,255,0.1)', background: activeTab === val ? 'rgba(167,139,250,0.15)' : 'transparent', color: activeTab === val ? '#a78bfa' : 'rgba(255,255,255,0.45)', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.2s' }}>
              {label}
            </button>
          ))}
          <div style={{ flex: 1, position: 'relative', minWidth: 200 }}>
            <Search size={14} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or location..."
              style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 14px 10px 36px', color: 'white', fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }} />
          </div>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.3)', fontSize: 15 }}>Loading posts...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No posts found</div>
            <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>Be the first to report a lost or found item!</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {filtered.map(post => {
              const cc = categoryColor(post.category)
              const sc = statusColor(post.status)
              const isOwner = user && post.posted_by === user.uid
              return (
                <div key={post.id} style={{ ...glass, borderRadius: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.5)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
                  {/* Image */}
                  {post.image_base64 ? (
                    <div style={{ height: 180, overflow: 'hidden', flexShrink: 0 }}>
                      <img src={post.image_base64} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div style={{ height: 90, background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(251,113,133,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>
                      {post.category === 'lost' ? '😟' : '🎁'}
                    </div>
                  )}
                  {/* Content */}
                  <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                      <div>
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, padding: '3px 10px', borderRadius: 6, background: cc.bg, color: cc.color, border: `1px solid ${cc.border}`, fontFamily: 'Syne, sans-serif', display: 'inline-block', marginBottom: 8 }}>
                          {post.category.toUpperCase()}
                        </span>
                        <h3 style={{ color: 'white', fontSize: 16, fontWeight: 700, lineHeight: 1.3, margin: 0 }}>{post.title}</h3>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6, background: sc.bg, color: sc.color, whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {post.status === 'resolved' ? '✅ Resolved' : '🔓 Open'}
                      </span>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{post.description}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 'auto' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                        <MapPin size={12} /> {post.location}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                        <Phone size={12} /> {post.contact}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
                        <Clock size={11} /> {new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    {/* Actions */}
                    {isOwner && post.status === 'open' && (
                      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                        <button onClick={() => handleResolve(post.id)}
                          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: 10, padding: '8px', color: '#34d399', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                          <CheckCircle size={13} /> Mark Resolved
                        </button>
                        <button onClick={() => handleDelete(post.id)}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.25)', borderRadius: 10, padding: '8px 14px', color: '#fb7185', cursor: 'pointer', fontSize: 12 }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div className="modal-box" style={{ ...glass, borderRadius: 24, padding: '36px', width: '100%', maxWidth: 520, position: 'relative', boxShadow: '0 40px 80px rgba(0,0,0,0.6)', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 18, right: 18, background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}><X size={16} /></button>
            <h2 style={{ fontFamily: 'Syne, sans-serif', color: 'white', fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Report an Item</h2>

            {error && <div style={{ background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.3)', color: '#fb7185', padding: '10px 14px', borderRadius: 10, marginBottom: 16, fontSize: 13 }}>{error}</div>}

            {/* Category toggle */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {['lost', 'found'].map(c => (
                <button key={c} onClick={() => setForm(f => ({ ...f, category: c }))}
                  style={{ flex: 1, padding: '10px', borderRadius: 12, border: form.category === c ? `1px solid ${c === 'lost' ? 'rgba(251,113,133,0.5)' : 'rgba(52,211,153,0.5)'}` : '1px solid rgba(255,255,255,0.1)', background: form.category === c ? (c === 'lost' ? 'rgba(251,113,133,0.15)' : 'rgba(52,211,153,0.15)') : 'transparent', color: form.category === c ? (c === 'lost' ? '#fb7185' : '#34d399') : 'rgba(255,255,255,0.4)', cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'Syne, sans-serif' }}>
                  {c === 'lost' ? '❌ I Lost It' : '✅ I Found It'}
                </button>
              ))}
            </div>

            {/* Fields */}
            {[
              { label: 'Item Title *', key: 'title', placeholder: 'e.g. Black iPhone 15, Blue Water Bottle' },
              { label: 'Description *', key: 'description', placeholder: 'Describe the item, any distinguishing features...', multi: true },
              { label: 'Location *', key: 'location', placeholder: 'e.g. Library 2nd Floor, Canteen Block B' },
              { label: 'Contact (WhatsApp/Email) *', key: 'contact', placeholder: 'How can someone reach you?' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 7, textTransform: 'uppercase', fontFamily: 'Syne, sans-serif' }}>{f.label}</label>
                {f.multi ? (
                  <textarea value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} rows={3}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '11px 14px', color: 'white', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }} />
                ) : (
                  <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '11px 14px', color: 'white', fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }} />
                )}
              </div>
            ))}

            {/* Image upload */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 7, textTransform: 'uppercase', fontFamily: 'Syne, sans-serif' }}>Photo (optional, max 500KB)</label>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImage(e.target.files[0])} />
              <div onClick={() => fileRef.current?.click()}
                style={{ border: `2px dashed ${imgPreview ? 'rgba(167,139,250,0.5)' : 'rgba(255,255,255,0.12)'}`, borderRadius: 14, padding: imgPreview ? 0 : '24px', textAlign: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.02)', overflow: 'hidden' }}>
                {imgPreview ? (
                  <img src={imgPreview} alt="preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <Upload size={24} color="rgba(255,255,255,0.25)" />
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Click to upload a photo</span>
                  </div>
                )}
              </div>
            </div>

            <button onClick={handleSubmit} disabled={submitting}
              style={{ width: '100%', background: submitting ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg, #7c3aed, #fb7185)', border: 'none', borderRadius: 14, padding: '14px', color: 'white', fontWeight: 700, fontSize: 15, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'Syne, sans-serif', boxShadow: '0 8px 32px rgba(124,58,237,0.3)' }}>
              {submitting ? 'Posting...' : 'Post Report →'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
