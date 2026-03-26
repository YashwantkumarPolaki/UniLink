import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api'
import Navbar from '../components/Navbar'

function Toast({ msg, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000)
    return () => clearTimeout(t)
  }, [onDone])
  const isOk = type === 'success'
  return (
    <div style={{
      position: 'fixed', bottom: 32, right: 32, zIndex: 9999,
      background: isOk ? 'rgba(52,211,153,0.15)' : 'rgba(251,113,133,0.15)',
      border: `1px solid ${isOk ? 'rgba(52,211,153,0.5)' : 'rgba(251,113,133,0.5)'}`,
      boxShadow: `0 0 32px ${isOk ? 'rgba(52,211,153,0.25)' : 'rgba(251,113,133,0.25)'}`,
      color: isOk ? '#34d399' : '#fb7185',
      borderRadius: 14, padding: '14px 24px', fontSize: 14, fontWeight: 600,
      fontFamily: 'Inter,sans-serif', display: 'flex', alignItems: 'center', gap: 10,
    }}>
      {isOk ? '✅' : '❌'} {msg}
    </div>
  )
}

export default function Settings() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const fileRef = useRef()

  // Password form
  const [pwForm, setPwForm]   = useState({ current_password: '', new_password: '', confirm: '' })
  const [pwLoading, setPwLoading] = useState(false)

  // Avatar
  const [preview, setPreview]     = useState(user.avatar || '')
  const [avatarLoading, setAvatarLoading] = useState(false)

  // WhatsApp/Description (clubs & companies only)
  const [profileForm, setProfileForm] = useState({
    whatsapp_link: user.whatsapp_link || '',
    description: user.description || '',
  })
  const [profileLoading, setProfileLoading] = useState(false)

  // Toast
  const [toast, setToast] = useState(null)
  const showToast = (msg, type = 'success') => setToast({ msg, type })

  // ── Club/Company profile update ──────────────────────────────────────────
  const handleProfileSave = async e => {
    e.preventDefault()
    setProfileLoading(true)
    try {
      await API.post('/auth/update-profile', profileForm)
      const updated = { ...user, ...profileForm }
      localStorage.setItem('user', JSON.stringify(updated))
      showToast('Profile updated!')
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to update', 'error')
    } finally { setProfileLoading(false) }
  }

  // ── Password change ──────────────────────────────────────────────────────
  const handlePwChange = async e => {
    e.preventDefault()
    if (pwForm.new_password !== pwForm.confirm) { showToast('New passwords do not match', 'error'); return }
    if (pwForm.new_password.length < 8)          { showToast('Password must be at least 8 characters', 'error'); return }
    setPwLoading(true)
    try {
      await API.post('/auth/change-password', {
        current_password: pwForm.current_password,
        new_password:     pwForm.new_password,
      })
      showToast('Password updated successfully!')
      setPwForm({ current_password: '', new_password: '', confirm: '' })
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to update password', 'error')
    } finally {
      setPwLoading(false)
    }
  }

  // ── Avatar upload ────────────────────────────────────────────────────────
  const handleFileSelect = e => {
    const file = e.target.files[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast('Only JPG, PNG, or WebP allowed', 'error'); return
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast('Image must be under 2 MB', 'error'); return
    }
    // Resize to 200×200 via canvas
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 200; canvas.height = 200
      const ctx = canvas.getContext('2d')
      // Cover crop
      const s = Math.min(img.width, img.height)
      const sx = (img.width  - s) / 2
      const sy = (img.height - s) / 2
      ctx.drawImage(img, sx, sy, s, s, 0, 0, 200, 200)
      const b64 = canvas.toDataURL('image/jpeg', 0.85)
      setPreview(b64)
      URL.revokeObjectURL(url)
    }
    img.src = url
  }

  const handleAvatarSave = async () => {
    if (!preview || preview === user.avatar) { showToast('No new image selected', 'error'); return }
    setAvatarLoading(true)
    try {
      await API.post('/auth/upload-avatar', { avatar_base64: preview })
      // Update localStorage
      const updated = { ...user, avatar: preview }
      localStorage.setItem('user', JSON.stringify(updated))
      showToast('Profile picture updated!')
    } catch (err) {
      showToast(err.response?.data?.detail || 'Upload failed', 'error')
    } finally {
      setAvatarLoading(false)
    }
  }

  return (
    <div style={S.root}>
      <div style={S.bg1} /><div style={S.bg2} />
      <Navbar />

      <div style={S.page} className="page-pad">
        <div style={S.header}>
          <h1 style={S.title}>Settings ⚙️</h1>
          <p style={S.sub}>Manage your account preferences</p>
        </div>

        <div style={S.grid} className="two-col">

          {/* ── Profile Picture ────────────────────────────────────────── */}
          <div style={S.card}>
            <h2 style={S.cardTitle}>👤 Profile Picture</h2>
            <p style={S.cardSub}>JPG, PNG or WebP · max 2 MB</p>

            <div style={S.avatarRow}>
              {preview ? (
                <img src={preview} alt="avatar" style={S.avatarImg} />
              ) : (
                <div style={S.avatarPlaceholder}>
                  {user?.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button onClick={() => fileRef.current?.click()} style={S.ghostBtn}>
                  📁 Choose Image
                </button>
                {preview && preview !== user.avatar && (
                  <button onClick={handleAvatarSave} disabled={avatarLoading} style={S.gradBtn}>
                    {avatarLoading ? 'Saving...' : '💾 Save Avatar'}
                  </button>
                )}
              </div>
              <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp"
                style={{ display: 'none' }} onChange={handleFileSelect} />
            </div>

            {preview && preview !== user.avatar && (
              <p style={{ color: '#fbbf24', fontSize: 12, marginTop: 8 }}>
                ⚠️ Preview shown — click "Save Avatar" to apply
              </p>
            )}
          </div>

          {/* ── Club/Company Profile ───────────────────────────────────── */}
          {(user.role === 'club' || user.role === 'company') && (
            <div style={S.card}>
              <h2 style={S.cardTitle}>{user.role === 'club' ? '🏛️' : '🏢'} Community Profile</h2>
              <p style={S.cardSub}>Shown in the Events → Clubs &amp; Communities section</p>
              <form onSubmit={handleProfileSave} style={S.form}>
                <div style={S.field}>
                  <label style={S.label}>WhatsApp Group Link</label>
                  <input
                    type="url" placeholder="https://chat.whatsapp.com/..."
                    value={profileForm.whatsapp_link}
                    onChange={e => setProfileForm(p => ({ ...p, whatsapp_link: e.target.value }))}
                    style={S.input}
                  />
                </div>
                <div style={S.field}>
                  <label style={S.label}>Short Description</label>
                  <input
                    type="text" placeholder="e.g. Coding club for CSE students"
                    value={profileForm.description}
                    onChange={e => setProfileForm(p => ({ ...p, description: e.target.value }))}
                    style={S.input}
                    maxLength={120}
                  />
                </div>
                <button type="submit" disabled={profileLoading} style={profileLoading ? S.ghostBtn : S.gradBtn}>
                  {profileLoading ? 'Saving...' : 'Save Profile →'}
                </button>
              </form>
            </div>
          )}

          {/* ── Change Password ────────────────────────────────────────── */}
          <div style={S.card}>
            <h2 style={S.cardTitle}>🔒 Change Password</h2>
            <p style={S.cardSub}>Minimum 8 characters</p>

            <form onSubmit={handlePwChange} style={S.form}>
              {[
                { key: 'current_password', label: 'Current Password',  ph: 'Enter current password' },
                { key: 'new_password',     label: 'New Password',       ph: 'Min 8 characters' },
                { key: 'confirm',          label: 'Confirm New Password',ph: 'Repeat new password' },
              ].map(f => (
                <div key={f.key} style={S.field}>
                  <label style={S.label}>{f.label}</label>
                  <input
                    type="password" placeholder={f.ph}
                    value={pwForm[f.key]}
                    onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{
                      ...S.input,
                      ...(f.key === 'confirm' && pwForm.confirm && pwForm.new_password !== pwForm.confirm
                        ? { borderColor: 'rgba(251,113,133,0.5)' } : {})
                    }}
                    required
                  />
                  {f.key === 'confirm' && pwForm.confirm && pwForm.new_password !== pwForm.confirm && (
                    <span style={{ color: '#fb7185', fontSize: 12 }}>Passwords do not match</span>
                  )}
                </div>
              ))}

              <button type="submit" disabled={pwLoading} style={pwLoading ? S.ghostBtn : S.gradBtn}>
                {pwLoading ? 'Updating...' : 'Update Password →'}
              </button>
            </form>
          </div>

        </div>

        {/* Account info strip */}
        <div style={S.infoStrip}>
          {[
            { l: 'Name',    v: user.name },
            { l: 'Email',   v: user.email },
            { l: 'Role',    v: user.role?.toUpperCase() },
            { l: 'College', v: user.college },
            user.year_of_study ? { l: 'Year', v: `${user.year_of_study}${['st','nd','rd','th'][Math.min(user.year_of_study-1,3)]} Year` } : null,
            user.graduation_year ? { l: 'Graduating', v: user.graduation_year } : null,
          ].filter(Boolean).map(item => (
            <div key={item.l} style={S.infoItem}>
              <span style={S.infoLabel}>{item.l}</span>
              <span style={S.infoVal}>{item.v}</span>
            </div>
          ))}
        </div>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  )
}

const glass = { background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }

const S = {
  root: { minHeight: '100vh', background: 'linear-gradient(160deg,#050510 0%,#0d0820 40%,#060315 100%)', fontFamily: "'Inter',sans-serif", color: 'white' },
  bg1: { position: 'fixed', top: '-20%', left: '-10%', width: '60vw', height: '60vw', borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.12) 0%,transparent 65%)', pointerEvents: 'none' },
  bg2: { position: 'fixed', top: '30%', right: '-15%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle,rgba(236,72,153,0.08) 0%,transparent 65%)', pointerEvents: 'none' },
  page: { maxWidth: 900, margin: '0 auto', padding: '48px 24px' },
  header: { marginBottom: 40 },
  title: { fontFamily: 'Syne,sans-serif', fontSize: 34, fontWeight: 800, marginBottom: 8 },
  sub: { color: 'rgba(255,255,255,0.4)', fontSize: 15 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 },
  card: { ...glass, borderRadius: 24, padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 16 },
  cardTitle: { fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 700, color: 'white', margin: 0 },
  cardSub: { color: 'rgba(255,255,255,0.35)', fontSize: 13, margin: 0 },
  avatarRow: { display: 'flex', alignItems: 'center', gap: 20, marginTop: 8 },
  avatarImg: { width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(167,139,250,0.4)', flexShrink: 0 },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, fontFamily: 'Syne,sans-serif', flexShrink: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'Syne,sans-serif' },
  input: { background: '#1a1035', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 16px', color: 'white', fontSize: 14, fontFamily: 'Inter,sans-serif', outline: 'none', transition: 'border-color 0.2s' },
  gradBtn: { background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', color: 'white', border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Syne,sans-serif' },
  ghostBtn: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)', borderRadius: 12, padding: '11px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif' },
  infoStrip: { ...glass, borderRadius: 20, padding: '20px 28px', display: 'flex', flexWrap: 'wrap', gap: 28 },
  infoItem: { display: 'flex', flexDirection: 'column', gap: 4 },
  infoLabel: { fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'Syne,sans-serif' },
  infoVal: { fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.8)' },
}
