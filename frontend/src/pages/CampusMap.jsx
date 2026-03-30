import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

// SRM KTR coordinates (center of campus)
const SRM_KTR_LAT = 12.8230
const SRM_KTR_LNG = 80.0444

const CAMPUS_DATA = [
  {
    id: 'university_building',
    name: 'University Building (UB)',
    icon: '🏛️',
    color: '#818cf8',
    glow: 'rgba(129,140,248,0.3)',
    description: '1st year classes, Administration, Registrar, Chancellor Office',
    floors: [
      {
        floor: 'Ground Floor',
        rooms: [
          { name: 'Registrar Office', type: 'admin', icon: '🏢' },
          { name: 'Finance Department', type: 'admin', icon: '💰' },
          { name: 'Examination Cell', type: 'admin', icon: '📋' },
          { name: 'Student Affairs Office', type: 'admin', icon: '🎓' },
          { name: 'Xerox / Reprography', type: 'facility', icon: '🖨️' },
          { name: 'UB Canteen', type: 'facility', icon: '🍽️' },
        ]
      },
      {
        floor: '1st Floor',
        rooms: [
          { name: 'UB Seminar Hall 1', type: 'seminar', icon: '🎤' },
          { name: 'UB Seminar Hall 2', type: 'seminar', icon: '🎤' },
          { name: 'Conference Room', type: 'seminar', icon: '🪑' },
          { name: 'VC & Admin Offices', type: 'admin', icon: '👔' },
          { name: 'UB Classrooms (101–112)', type: 'classroom', icon: '📖' },
        ]
      },
      {
        floor: '2nd Floor',
        rooms: [
          { name: 'UB Classrooms (201–212)', type: 'classroom', icon: '📖' },
          { name: 'UB Seminar Hall 3', type: 'seminar', icon: '🎤' },
          { name: 'Faculty Cabins', type: 'admin', icon: '🏢' },
        ]
      },
      {
        floor: '3rd Floor',
        rooms: [
          { name: 'UB Classrooms (301–312)', type: 'classroom', icon: '📖' },
          { name: 'Language Lab', type: 'lab', icon: '🗣️' },
          { name: 'UB Seminar Hall 4', type: 'seminar', icon: '🎤' },
        ]
      },
    ]
  },
  {
    id: 'tech_park1',
    name: 'Tech Park (TP)',
    icon: '🏢',
    color: '#34d399',
    glow: 'rgba(52,211,153,0.3)',
    description: 'Main high-rise for CSE, ECE, EEE, AI/ML — 2nd year & above',
    floors: [
      {
        floor: 'Ground Floor',
        rooms: [
          { name: 'TP Canteen / Food Court', type: 'facility', icon: '🍽️' },
          { name: 'ATM / Bank Counter', type: 'facility', icon: '🏧' },
          { name: 'TP-G Classrooms', type: 'classroom', icon: '📖' },
          { name: 'Stationery Shop', type: 'facility', icon: '📝' },
        ]
      },
      {
        floor: '1st Floor',
        rooms: [
          { name: 'CSE Seminar Hall TP1-S1', type: 'seminar', icon: '🎤' },
          { name: 'CSE Department Office', type: 'admin', icon: '🏢' },
          { name: 'CSE Classrooms (101–110)', type: 'classroom', icon: '📖' },
          { name: 'AI & ML Lab', type: 'lab', icon: '🤖' },
        ]
      },
      {
        floor: '2nd Floor',
        rooms: [
          { name: 'ECE Seminar Hall TP-S2', type: 'seminar', icon: '🎤' },
          { name: 'ECE Department Office', type: 'admin', icon: '🏢' },
          { name: 'ECE Classrooms (201–210)', type: 'classroom', icon: '📖' },
          { name: 'Embedded Systems Lab', type: 'lab', icon: '⚡' },
        ]
      },
      {
        floor: '3rd Floor',
        rooms: [
          { name: 'EEE Seminar Hall TP-S3', type: 'seminar', icon: '🎤' },
          { name: 'EEE Department Office', type: 'admin', icon: '🏢' },
          { name: 'EEE Classrooms (301–310)', type: 'classroom', icon: '📖' },
          { name: 'Power Electronics Lab', type: 'lab', icon: '⚡' },
        ]
      },
      {
        floor: '4th Floor',
        rooms: [
          { name: 'IT Seminar Hall TP-S4', type: 'seminar', icon: '🎤' },
          { name: 'IT Department Office', type: 'admin', icon: '🏢' },
          { name: 'IT Classrooms (401–410)', type: 'classroom', icon: '📖' },
          { name: 'Networking Lab', type: 'lab', icon: '🌐' },
        ]
      },
      {
        floor: '5th–7th Floor',
        rooms: [
          { name: 'AI/ML & Data Science Dept', type: 'admin', icon: '🤖' },
          { name: 'Research Labs', type: 'lab', icon: '🔬' },
          { name: 'Seminar Halls (TP-S5, S6)', type: 'seminar', icon: '🎤' },
          { name: 'Robotics & IoT Lab', type: 'lab', icon: '🦾' },
        ]
      },
    ]
  },
  {
    id: 'tech_park2',
    name: 'Tech Park 2.0 (TP2)',
    icon: '🏗️',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.3)',
    description: 'Newer block for 2nd/3rd year students — additional classrooms & labs',
    floors: [
      {
        floor: 'Ground Floor',
        rooms: [
          { name: 'TP2 Canteen', type: 'facility', icon: '🍽️' },
          { name: 'TP2-G Classrooms', type: 'classroom', icon: '📖' },
        ]
      },
      {
        floor: '1st–3rd Floor',
        rooms: [
          { name: 'TP2 Seminar Halls (S1–S3)', type: 'seminar', icon: '🎤' },
          { name: 'TP2 Classrooms (101–310)', type: 'classroom', icon: '📖' },
          { name: 'Programming Labs', type: 'lab', icon: '💻' },
          { name: 'Faculty Cabins', type: 'admin', icon: '🏢' },
        ]
      },
    ]
  },
  {
    id: 'mech_blocks',
    name: 'Mech Blocks (A–E)',
    icon: '⚙️',
    color: '#fb7185',
    glow: 'rgba(251,113,133,0.3)',
    description: 'Mechanical, Aero, Civil, Chemical Engineering blocks with workshops',
    floors: [
      {
        floor: 'Mech A & B',
        rooms: [
          { name: 'Mech Seminar Hall A1', type: 'seminar', icon: '🎤' },
          { name: 'Mech Seminar Hall B1', type: 'seminar', icon: '🎤' },
          { name: 'Mech A Classrooms', type: 'classroom', icon: '📖' },
          { name: 'Mech Dept Office', type: 'admin', icon: '🏢' },
          { name: 'Strength of Materials Lab', type: 'lab', icon: '🔩' },
          { name: 'Fluid Mechanics Lab', type: 'lab', icon: '💧' },
        ]
      },
      {
        floor: 'Mech C & D',
        rooms: [
          { name: 'Manufacturing Lab', type: 'lab', icon: '🔧' },
          { name: 'CAD/CAM Lab', type: 'lab', icon: '🖥️' },
          { name: 'Thermal Lab', type: 'lab', icon: '🌡️' },
          { name: 'Mech C&D Classrooms', type: 'classroom', icon: '📖' },
        ]
      },
      {
        floor: 'Mech E + Hangars',
        rooms: [
          { name: 'Aeronautical Hangar 1', type: 'lab', icon: '✈️' },
          { name: 'Aeronautical Hangar 2', type: 'lab', icon: '✈️' },
          { name: 'Aero Dept Office', type: 'admin', icon: '🏢' },
          { name: 'Aero Seminar Hall', type: 'seminar', icon: '🎤' },
          { name: 'Workshop (Fitting, Welding)', type: 'lab', icon: '🔨' },
        ]
      },
    ]
  },
  {
    id: 'tp_ganesan_audi',
    name: 'TP Ganesan Auditorium',
    icon: '🎭',
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.3)',
    description: "One of Asia's largest auditoriums — 4,000 seats, main venue for all major events",
    floors: [
      {
        floor: 'Main Hall',
        rooms: [
          { name: 'Main Auditorium (4,000 seats)', type: 'auditorium', icon: '🎭' },
          { name: 'Green Rooms (L & R)', type: 'facility', icon: '🎬' },
          { name: 'Sound & Light Control Room', type: 'facility', icon: '🎛️' },
          { name: 'VIP Lounge', type: 'facility', icon: '🛋️' },
          { name: 'Event Coordination Office', type: 'admin', icon: '🏢' },
        ]
      },
    ]
  },
  {
    id: 'central_library',
    name: 'Central Library',
    icon: '📚',
    color: '#67e8f9',
    glow: 'rgba(103,232,249,0.3)',
    description: 'Books, journals, digital resources, silent study halls',
    floors: [
      {
        floor: 'Ground Floor',
        rooms: [
          { name: 'Issue / Return Counter', type: 'facility', icon: '📋' },
          { name: 'Book Stacks (Engg)', type: 'facility', icon: '📚' },
          { name: 'Newspaper & Magazines', type: 'facility', icon: '📰' },
          { name: 'Xerox / Printing', type: 'facility', icon: '🖨️' },
        ]
      },
      {
        floor: '1st Floor',
        rooms: [
          { name: 'Digital Library (80 PCs)', type: 'lab', icon: '🖥️' },
          { name: 'Silent Reading Hall', type: 'facility', icon: '🤫' },
          { name: 'E-Resources / NPTEL Access', type: 'facility', icon: '💻' },
          { name: 'Reference Section', type: 'facility', icon: '📖' },
        ]
      },
      {
        floor: '2nd Floor',
        rooms: [
          { name: 'PG & PhD Research Section', type: 'facility', icon: '🎓' },
          { name: 'GD Room 1', type: 'seminar', icon: '🪑' },
          { name: 'GD Room 2', type: 'seminar', icon: '🪑' },
        ]
      }
    ]
  },
  {
    id: 'medical_block',
    name: 'Medical / Health Science Block',
    icon: '🏥',
    color: '#f472b6',
    glow: 'rgba(244,114,182,0.3)',
    description: 'Hospital, Dental, Pharmacy, Biotech — separate campus zone',
    floors: [
      {
        floor: 'Ground Floor',
        rooms: [
          { name: 'Student Health Centre', type: 'facility', icon: '🏥' },
          { name: 'Pharmacy / Medicine Counter', type: 'facility', icon: '💊' },
          { name: 'OPD Reception', type: 'admin', icon: '📋' },
          { name: 'Emergency Room', type: 'facility', icon: '🚨' },
        ]
      },
      {
        floor: '1st Floor',
        rooms: [
          { name: 'Anatomy Lab', type: 'lab', icon: '🔬' },
          { name: 'Biochemistry Lab', type: 'lab', icon: '🧪' },
          { name: 'Medical Seminar Hall (80 seats)', type: 'seminar', icon: '🎤' },
          { name: 'Microbiology Lab', type: 'lab', icon: '🦠' },
        ]
      }
    ]
  },
  {
    id: 'boys_hostel',
    name: 'Boys Hostels (14+ Blocks)',
    icon: '🏠',
    color: '#10b981',
    glow: 'rgba(16,185,129,0.3)',
    description: 'Himalaya, Nilgiri, Vindhya, Aravalli & 10+ more blocks',
    floors: [
      {
        floor: 'All Blocks',
        rooms: [
          { name: 'Himalaya Block', type: 'facility', icon: '🏠' },
          { name: 'Nilgiri Block', type: 'facility', icon: '🏠' },
          { name: 'Vindhya Block', type: 'facility', icon: '🏠' },
          { name: 'Aravalli Block', type: 'facility', icon: '🏠' },
          { name: 'Hostel Common Room', type: 'facility', icon: '🛋️' },
          { name: 'Hostel Canteen', type: 'facility', icon: '🍽️' },
          { name: 'Indoor Games Room', type: 'facility', icon: '🏓' },
          { name: 'Warden / Security Office', type: 'admin', icon: '🏢' },
          { name: 'Laundry Block', type: 'facility', icon: '👕' },
        ]
      }
    ]
  },
  {
    id: 'girls_hostel',
    name: 'Girls Hostels (6+ Blocks)',
    icon: '🏡',
    color: '#fb7185',
    glow: 'rgba(251,113,133,0.3)',
    description: 'Kaveri, Ganga, Yamuna, Saraswati & more — secured campus zone',
    floors: [
      {
        floor: 'All Blocks',
        rooms: [
          { name: 'Kaveri Block', type: 'facility', icon: '🏡' },
          { name: 'Ganga Block', type: 'facility', icon: '🏡' },
          { name: 'Yamuna Block', type: 'facility', icon: '🏡' },
          { name: 'Saraswati Block', type: 'facility', icon: '🏡' },
          { name: 'Hostel Common Room', type: 'facility', icon: '🛋️' },
          { name: 'Hostel Canteen', type: 'facility', icon: '🍽️' },
          { name: 'Warden / Security Office', type: 'admin', icon: '🏢' },
          { name: 'Laundry Block', type: 'facility', icon: '👕' },
        ]
      }
    ]
  },
  {
    id: 'sports_complex',
    name: 'Sports Complex',
    icon: '🏟️',
    color: '#34d399',
    glow: 'rgba(52,211,153,0.3)',
    description: 'Indoor stadium, gym, outdoor grounds, swimming pool',
    floors: [
      {
        floor: 'All Areas',
        rooms: [
          { name: 'Indoor Badminton Courts (6)', type: 'facility', icon: '🏸' },
          { name: 'Table Tennis Hall', type: 'facility', icon: '🏓' },
          { name: 'Basketball Court', type: 'facility', icon: '🏀' },
          { name: 'Volleyball Court', type: 'facility', icon: '🏐' },
          { name: 'Gym (24hr)', type: 'facility', icon: '💪' },
          { name: 'Swimming Pool', type: 'facility', icon: '🏊' },
          { name: 'Cricket Ground', type: 'facility', icon: '🏏' },
          { name: 'Football Ground', type: 'facility', icon: '⚽' },
          { name: "Sports Director's Office", type: 'admin', icon: '🏢' },
        ]
      }
    ]
  },
]

const TYPE_COLORS = {
  classroom:  { color: '#818cf8', bg: 'rgba(129,140,248,0.12)', border: 'rgba(129,140,248,0.25)' },
  seminar:    { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)' },
  lab:        { color: '#34d399', bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.25)' },
  auditorium: { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.25)' },
  admin:      { color: '#67e8f9', bg: 'rgba(103,232,249,0.12)', border: 'rgba(103,232,249,0.25)' },
  facility:   { color: '#9ca3af', bg: 'rgba(156,163,175,0.1)',  border: 'rgba(156,163,175,0.2)' },
}

export default function CampusMap() {
  const navigate = useNavigate()
  const [search, setSearch]         = useState('')
  const [selected, setSelected]     = useState(null)
  const [activeFloor, setActiveFloor] = useState(0)
  const [filterType, setFilterType] = useState('all')
  const [location, setLocation]     = useState(null)  // { lat, lng, accuracy }
  const [locError, setLocError]     = useState(null)
  const [locLoading, setLocLoading] = useState(false)

  // Real-time GPS location
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocError('Geolocation not supported by your browser')
      return
    }
    setLocLoading(true)
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: Math.round(pos.coords.accuracy) })
        setLocLoading(false)
        setLocError(null)
      },
      (err) => {
        setLocError(err.message)
        setLocLoading(false)
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    )
    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  // Distance from SRM KTR center (rough check if on campus)
  const distFromCampus = location
    ? Math.round(Math.sqrt(Math.pow((location.lat - SRM_KTR_LAT) * 111000, 2) + Math.pow((location.lng - SRM_KTR_LNG) * 111000 * Math.cos(SRM_KTR_LAT * Math.PI / 180), 2)))
    : null

  const onCampus = distFromCampus !== null && distFromCampus < 1500

  // Search across all buildings and rooms
  const searchResults = useMemo(() => {
    if (search.trim().length < 2) return []
    const q = search.toLowerCase()
    const results = []
    CAMPUS_DATA.forEach(building => {
      building.floors.forEach(floor => {
        floor.rooms.forEach(room => {
          if (room.name.toLowerCase().includes(q) || building.name.toLowerCase().includes(q) || room.type.includes(q)) {
            results.push({ building, floor: floor.floor, room })
          }
        })
      })
    })
    return results.slice(0, 15)
  }, [search])

  const openBuilding = (b) => { setSelected(b); setActiveFloor(0); setSearch('') }

  const filteredRooms = selected
    ? selected.floors[activeFloor]?.rooms.filter(r => filterType === 'all' || r.type === filterType) || []
    : []

  const allTypesInFloor = selected
    ? [...new Set(selected.floors[activeFloor]?.rooms.map(r => r.type) || [])]
    : []

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d1a', fontFamily: "'Inter',sans-serif", paddingBottom: 60 }}>
      <style>{`* { box-sizing: border-box; } input { outline: none; } ::-webkit-scrollbar{width:6px} ::-webkit-scrollbar-thumb{background:rgba(124,92,191,0.4);border-radius:3px} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>

      {/* Navbar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(13,13,26,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '7px 14px', color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer', fontFamily: 'Inter,sans-serif', flexShrink: 0 }}>← Back</button>
        <div style={{ flex: 1, minWidth: 160 }}>
          <h1 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: 'white', fontFamily: 'Syne,sans-serif' }}>🗺️ SRM KTR Campus Map</h1>
          <p style={{ margin: 0, fontSize: 11, color: '#555' }}>SRM Institute of Science and Technology, Kattankulathur</p>
        </div>

        {/* Live Location Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: onCampus ? 'rgba(16,185,129,0.1)' : locLoading ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.08)', border: `1px solid ${onCampus ? 'rgba(16,185,129,0.3)' : locLoading ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.2)'}`, borderRadius: 10, padding: '7px 14px', flexShrink: 0 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: onCampus ? '#10b981' : locLoading ? '#f59e0b' : '#ef4444', animation: locLoading ? 'pulse 1s infinite' : 'none' }} />
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: onCampus ? '#10b981' : locLoading ? '#f59e0b' : '#ef4444' }}>
              {locLoading ? 'Getting location...' : locError ? 'Location denied' : onCampus ? '📍 You are on campus' : '📍 Off campus'}
            </div>
            {location && <div style={{ fontSize: 10, color: '#555' }}>±{location.accuracy}m accuracy · {distFromCampus}m from center</div>}
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Seminar hall, lab, canteen..."
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '9px 16px', color: 'white', fontSize: 13, fontFamily: 'Inter,sans-serif', width: 260 }} />
          {searchResults.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: '#1a1730', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, zIndex: 100, maxHeight: 360, overflowY: 'auto', boxShadow: '0 16px 48px rgba(0,0,0,0.6)' }}>
              {searchResults.map((r, i) => {
                const tc = TYPE_COLORS[r.room.type] || TYPE_COLORS.facility
                return (
                  <div key={i} onClick={() => openBuilding(r.building)}
                    style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>{r.room.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>{r.room.name}</div>
                      <div style={{ fontSize: 11, color: '#555' }}>{r.building.name} · {r.floor}</div>
                    </div>
                    <span style={{ fontSize: 10, color: tc.color, background: tc.bg, border: `1px solid ${tc.border}`, borderRadius: 8, padding: '2px 7px', textTransform: 'capitalize', flexShrink: 0 }}>{r.room.type}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px' }}>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {Object.entries({ classroom: '📖 Classroom', seminar: '🎤 Seminar Hall', lab: '🔬 Lab', auditorium: '🎭 Auditorium', admin: '🏢 Office', facility: '🏠 Facility' }).map(([type, label]) => {
            const c = TYPE_COLORS[type]
            return <span key={type} style={{ fontSize: 11, color: c.color, background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10, padding: '4px 10px', fontWeight: 600 }}>{label}</span>
          })}
        </div>

        {/* Building Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: 14, marginBottom: 28 }}>
          {CAMPUS_DATA.map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              onClick={() => openBuilding(b)}
              style={{ background: selected?.id === b.id ? `${b.color}18` : 'rgba(255,255,255,0.03)', border: `1px solid ${selected?.id === b.id ? b.color + '55' : 'rgba(255,255,255,0.08)'}`, borderRadius: 16, padding: '18px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: selected?.id === b.id ? `0 0 24px ${b.glow}` : 'none' }}>
              <div style={{ fontSize: 30, marginBottom: 8 }}>{b.icon}</div>
              <div style={{ color: b.color, fontWeight: 700, fontSize: 14, fontFamily: 'Syne,sans-serif', marginBottom: 4 }}>{b.name}</div>
              <div style={{ color: '#555', fontSize: 11, lineHeight: 1.5, marginBottom: 10 }}>{b.description}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '2px 8px' }}>{b.floors.length} section{b.floors.length > 1 ? 's' : ''}</span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '2px 8px' }}>{b.floors.reduce((a, f) => a + f.rooms.length, 0)} rooms</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Detail Panel */}
        <AnimatePresence>
          {selected && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${selected.color}33`, borderRadius: 20, padding: '24px', boxShadow: `0 0 60px ${selected.glow}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 32 }}>{selected.icon}</span>
                  <div>
                    <h2 style={{ margin: 0, color: selected.color, fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 800 }}>{selected.name}</h2>
                    <p style={{ margin: 0, color: '#555', fontSize: 12 }}>{selected.description}</p>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 13px', color: 'rgba(255,255,255,0.5)', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>✕ Close</button>
              </div>

              {/* Floor Tabs */}
              <div style={{ display: 'flex', gap: 7, marginBottom: 16, flexWrap: 'wrap' }}>
                {selected.floors.map((f, idx) => (
                  <button key={idx} onClick={() => { setActiveFloor(idx); setFilterType('all') }}
                    style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${activeFloor === idx ? selected.color + '88' : 'rgba(255,255,255,0.1)'}`, background: activeFloor === idx ? selected.color + '22' : 'transparent', color: activeFloor === idx ? selected.color : 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: activeFloor === idx ? 700 : 400, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                    {f.floor}
                  </button>
                ))}
              </div>

              {/* Type Filter */}
              {allTypesInFloor.length > 1 && (
                <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
                  <button onClick={() => setFilterType('all')} style={{ padding: '4px 11px', borderRadius: 14, border: `1px solid ${filterType === 'all' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)'}`, background: filterType === 'all' ? 'rgba(255,255,255,0.08)' : 'transparent', color: filterType === 'all' ? 'white' : 'rgba(255,255,255,0.3)', fontSize: 11, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>All</button>
                  {allTypesInFloor.map(t => {
                    const tc = TYPE_COLORS[t] || TYPE_COLORS.facility
                    return <button key={t} onClick={() => setFilterType(t)} style={{ padding: '4px 11px', borderRadius: 14, border: `1px solid ${filterType === t ? tc.border : 'rgba(255,255,255,0.08)'}`, background: filterType === t ? tc.bg : 'transparent', color: filterType === t ? tc.color : 'rgba(255,255,255,0.3)', fontSize: 11, cursor: 'pointer', fontFamily: 'Inter,sans-serif', textTransform: 'capitalize', fontWeight: filterType === t ? 700 : 400 }}>{t}</button>
                  })}
                </div>
              )}

              {/* Rooms */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 10 }}>
                {filteredRooms.map((room, i) => {
                  const tc = TYPE_COLORS[room.type] || TYPE_COLORS.facility
                  return (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.025 }}
                      style={{ background: tc.bg, border: `1px solid ${tc.border}`, borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 20, flexShrink: 0 }}>{room.icon}</span>
                      <div>
                        <div style={{ color: 'white', fontSize: 12, fontWeight: 600, lineHeight: 1.3 }}>{room.name}</div>
                        <div style={{ color: tc.color, fontSize: 10, marginTop: 2, textTransform: 'capitalize' }}>{room.type}</div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
