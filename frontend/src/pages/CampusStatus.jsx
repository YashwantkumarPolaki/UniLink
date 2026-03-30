import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import API from '../api'

const SERVICES = [
  { id: 'university_building', name: 'University Building', icon: '🏫' },
  { id: 'tech_park1',         name: 'Tech Park 1',         icon: '🏢' },
  { id: 'tech_park2',         name: 'Tech Park 2',         icon: '🏗️' },
  { id: 'girls_hostel',       name: 'Girls Hostels',       icon: '🏠' },
  { id: 'boys_hostel',        name: 'Boys Hostels',        icon: '🏠' },
  { id: 'wifi',               name: 'Campus Wi-Fi',        icon: '📶' },
  { id: 'portal',             name: 'College Portal',      icon: '🌐' },
  { id: 'canteen',            name: 'Canteen',             icon: '🍽️' },
]

const STATUS_CONFIG = {
  operational: { label: 'Operational', color: '#10b981', bg: 'rgba(16,185,129,0.12)', dot: '#10b981', border: 'rgba(16,185,129,0.3)' },
  degraded:    { label: 'Degraded',    color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', dot: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
  down:        { label: 'Down',        color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  dot: '#ef4444', border: 'rgba(239,68,68,0.3)' },
}

const DEFAULT_SERVICES = SERVICES.map(s => ({ ...s, status: 'operational', votes: { operational: 0, degraded: 0, down: 0 }, total_reports: 0 }))

export default function CampusStatus() {
  const navigate = useNavigate()
  const [services, setServices]     = useState(DEFAULT_SERVICES)
  const [userVotes, setUserVotes]   = useState({})
  const [loading, setLoading]       = useState(true)
  const [reporting, setReporting]   = useState(null)
  const [toast, setToast]           = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [offline, setOffline]       = useState(false)

  const fetchStatus = useCallback(async () => {
    try {
      const res = await API.get('/status/')
      setServices(res.data.services)
      setUserVotes(res.data.user_votes || {})
      setLastUpdated(new Date())
      setOffline(false)
    } catch {
      // Backend offline — keep static cards visible
      setOffline(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 60000) // auto-refresh every 60s
    return () => clearInterval(interval)
  }, [fetchStatus])

  const handleReport = async (serviceId, status) => {
    if (offline) {
      showToast('⚠️ Backend offline — start the server to vote', 'error')
      return
    }
    setReporting(serviceId)
    try {
      await API.post(`/status/${serviceId}/report`, { status })
      showToast('✅ Status reported! Thanks for helping your campus.')
      await fetchStatus()
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to report status', 'error')
    } finally {
      setReporting(null)
    }
  }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const overall = services.length === 0 ? 'operational'
    : services.some(s => s.status === 'down')       ? 'down'
    : services.some(s => s.status === 'degraded')   ? 'degraded'
    : 'operational'

  const overallConf = STATUS_CONFIG[overall]

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d1a', fontFamily: "'Inter', sans-serif", padding: '0 0 60px' }}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(124,92,191,0.4); border-radius: 3px; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
      `}</style>

      {/* Navbar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(13,13,26,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '7px 14px', color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>← Back</button>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'white', fontFamily: 'Syne, sans-serif' }}>Campus Service Status</h1>
        <p style={{ margin: 0, fontSize: 12, color: '#666' }}>Crowd-reported · Updates every 60s {lastUpdated && `· Last fetched ${lastUpdated.toLocaleTimeString()}`}</p>
        {offline && <span style={{ fontSize: 11, color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 6, padding: '2px 8px', marginLeft: 8 }}>⚠️ Backend offline — showing defaults</span>}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>

        {/* Overall status banner */}
        {!loading && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: overallConf.bg, border: `1px solid ${overallConf.border}`, borderRadius: 16, padding: '20px 28px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: overallConf.dot, animation: overall !== 'operational' ? 'pulse 1.5s infinite' : 'none', flexShrink: 0 }} />
            <div>
              <div style={{ color: overallConf.color, fontWeight: 700, fontSize: 18 }}>
                {overall === 'operational' ? '✅ All Systems Operational' : overall === 'degraded' ? '⚠️ Some Services Degraded' : '🔴 Service Outage Detected'}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 2 }}>Based on recent student reports in the last 2 hours</div>
            </div>
          </motion.div>
        )}

        {/* Service Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
            {Array(8).fill(0).map((_, i) => (
              <div key={i} style={{ height: 160, background: 'rgba(255,255,255,0.04)', borderRadius: 16, animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
            {services.map((svc, i) => {
              const conf = STATUS_CONFIG[svc.status] || STATUS_CONFIG.operational
              const myVote = userVotes[svc.id]
              const isReporting = reporting === svc.id
              return (
                <motion.div key={svc.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: 14, backdropFilter: 'blur(12px)' }}>

                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 26 }}>{svc.icon}</span>
                      <span style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>{svc.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: conf.bg, border: `1px solid ${conf.border}`, borderRadius: 20, padding: '4px 10px' }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: conf.dot, animation: svc.status !== 'operational' ? 'pulse 1.5s infinite' : 'none' }} />
                      <span style={{ color: conf.color, fontSize: 11, fontWeight: 600 }}>{conf.label}</span>
                    </div>
                  </div>

                  {/* Votes */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {Object.entries(svc.votes || {}).map(([s, count]) => {
                      const c = STATUS_CONFIG[s]
                      return count > 0 ? (
                        <span key={s} style={{ fontSize: 11, color: c.color, background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10, padding: '2px 8px' }}>
                          {count} {s === 'operational' ? '✅' : s === 'degraded' ? '⚠️' : '🔴'}
                        </span>
                      ) : null
                    })}
                    {svc.total_reports === 0
                      ? <span style={{ fontSize: 11, color: '#555' }}>No reports yet</span>
                      : <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginLeft: 'auto' }}>
                          👥 {svc.total_reports} student{svc.total_reports !== 1 ? 's' : ''} reported
                        </span>
                    }
                  </div>

                  {/* Report buttons */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                    {['operational', 'degraded', 'down'].map(s => {
                      const c = STATUS_CONFIG[s]
                      const isMyVote = myVote === s
                      return (
                        <button key={s} onClick={() => handleReport(svc.id, s)} disabled={isReporting}
                          style={{ background: isMyVote ? c.bg : 'rgba(255,255,255,0.04)', border: `1px solid ${isMyVote ? c.border : 'rgba(255,255,255,0.08)'}`, borderRadius: 8, padding: '7px 4px', color: isMyVote ? c.color : 'rgba(255,255,255,0.4)', fontSize: 11, cursor: isReporting ? 'wait' : 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: isMyVote ? 700 : 400, transition: 'all 0.15s' }}>
                          {s === 'operational' ? '✅ OK' : s === 'degraded' ? '⚠️ Slow' : '🔴 Down'}
                        </button>
                      )
                    })}
                  </div>
                  {myVote && <div style={{ fontSize: 11, color: '#555', textAlign: 'center' }}>You reported: <span style={{ color: STATUS_CONFIG[myVote].color }}>{myVote}</span></div>}
                </motion.div>
              )
            })}
          </div>
        )}

        {/* How it works */}
        <div style={{ marginTop: 40, background: 'rgba(124,92,191,0.06)', border: '1px solid rgba(124,92,191,0.15)', borderRadius: 14, padding: '18px 22px' }}>
          <div style={{ color: '#a78bfa', fontWeight: 600, fontSize: 13, marginBottom: 8 }}>ℹ️ How crowd-reporting works</div>
          <div style={{ color: '#666', fontSize: 12, lineHeight: 1.7 }}>
            Each student can vote once per service every 2 hours. The status badge reflects the <strong style={{ color: 'rgba(255,255,255,0.5)' }}>majority vote</strong> of all recent reports.
            When a service recovers, students naturally vote "Operational" and the status flips back to green within minutes.
          </div>
        </div>
      </div>

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
