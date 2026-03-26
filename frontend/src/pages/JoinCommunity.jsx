import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import API from '../api'
import UniLinkLogo from '../components/UniLinkLogo'

const WHATSAPP_LINK = 'https://chat.whatsapp.com/FP4S2uLg8tjKB5pPHK0Gvc'

export default function JoinCommunity() {
  const [joined, setJoined] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const markJoined = () => {
    localStorage.setItem('whatsapp_joined', 'true')
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    localStorage.setItem('user', JSON.stringify({ ...user, whatsapp_verified: true }))
    API.put('/auth/whatsapp-verified').catch(() => {})
  }

  const handleWhatsAppClick = () => {
    markJoined()
    setJoined(true)
  }

  const handleAlreadyMember = () => {
    markJoined()
    navigate('/dashboard')
  }

  const handleEnter = () => {
    setLoading(true)
    markJoined()
    navigate('/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d1a', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative' }}>
      {/* Glow */}
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '80vw', height: '80vh', background: 'radial-gradient(ellipse at center, rgba(37,211,102,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Navbar */}
      <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 100, width: '100%', maxWidth: 840, padding: '0 24px' }}>
        <div style={{ background: 'rgba(13,13,26,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 50, padding: '12px 24px' }}>
          <UniLinkLogo />
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '48px 40px', maxWidth: 460, width: '100%', textAlign: 'center', position: 'relative', zIndex: 1 }}>

        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 36 }}>
          💬
        </div>

        <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 28, fontWeight: 800, color: 'white', margin: '0 0 12px' }}>
          Join the Community
        </h2>
        <p style={{ color: '#888', fontSize: 15, lineHeight: 1.6, margin: '0 0 32px' }}>
          UniLink is a community-first platform. Join our WhatsApp group to stay updated with announcements, events, and connect with peers.
        </p>

        {!joined ? (
          <>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsAppClick}
              style={{ display: 'block', background: '#25D366', color: 'white', borderRadius: 12, padding: '14px 24px', fontWeight: 700, fontSize: 16, textDecoration: 'none', marginBottom: 16 }}
            >
              Join WhatsApp Group →
            </a>
            <button
              onClick={handleAlreadyMember}
              style={{ background: 'transparent', border: 'none', color: '#555', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}
            >
              Already a member? Continue
            </button>
          </>
        ) : (
          <>
            <p style={{ color: '#25D366', fontSize: 14, marginBottom: 20 }}>✓ Great! Click below to enter UniLink</p>
            <button
              onClick={handleEnter}
              disabled={loading}
              style={{ width: '100%', background: 'linear-gradient(135deg,#7c5cbf,#5c3d9e)', color: 'white', border: 'none', borderRadius: 12, padding: '14px', fontWeight: 700, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Entering...' : "I've Joined — Enter UniLink →"}
            </button>
          </>
        )}
      </motion.div>
    </div>
  )
}
