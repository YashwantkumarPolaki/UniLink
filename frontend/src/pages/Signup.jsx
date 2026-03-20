import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import API from '../api'

// ─── Star Field Canvas ─────────────────────────────────────────────────────────
function StarCanvas() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    const stars = Array.from({ length: 160 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.3, o: Math.random() * 0.5 + 0.1,
      dir: Math.random() > 0.5 ? 1 : -1, speed: Math.random() * 0.004 + 0.002,
    }))
    let animId
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      stars.forEach(s => {
        s.o += s.speed * s.dir
        if (s.o > 0.65 || s.o < 0.08) s.dir *= -1
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${s.o})`; ctx.fill()
      })
      animId = requestAnimationFrame(draw)
    }
    draw()
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />
}

// ─── Custom Select (unchanged) ────────────────────────────────────────────────
function CustomSelect({ name, value, onChange, options, placeholder, disabled }) {
  const [open, setOpen] = useState(false)
  const handleSelect = (val) => {
    onChange({ target: { name, value: val } })
    setOpen(false)
  }
  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        style={{ width: '100%', background: disabled ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)', border: `1px solid ${open ? 'rgba(124,92,191,0.5)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 10, padding: '12px 16px', color: value ? 'white' : 'rgba(255,255,255,0.3)', fontSize: 14, fontFamily: 'Inter, sans-serif', cursor: disabled ? 'not-allowed' : 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: disabled ? 0.5 : 1 }}
      >
        <span>{value || placeholder}</span>
        <span style={{ color: '#7c5cbf', fontSize: 12, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: '#13102a', border: '1px solid rgba(124,92,191,0.3)', borderRadius: 10, maxHeight: 220, overflowY: 'auto', zIndex: 1000, boxShadow: '0 16px 40px rgba(0,0,0,0.6)' }}>
          {options.map(opt => (
            <div key={opt} onClick={() => handleSelect(opt)}
              style={{ padding: '10px 16px', color: value === opt ? '#a78bfa' : 'rgba(255,255,255,0.7)', background: value === opt ? 'rgba(124,92,191,0.15)' : 'transparent', fontSize: 14, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: value === opt ? 600 : 400, transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,92,191,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = value === opt ? 'rgba(124,92,191,0.15)' : 'transparent'}
            >{opt}</div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const BRANCHES = [
  'CSE - AI & ML', 'CSE - Artificial Intelligence', 'CSE - Data Science',
  'CSE - Big Data Analytics', 'CSE - Cloud Computing',
  'CSE (Core)', 'CSE - Cyber Security', 'CSE - Software Engineering',
  'CSE - Business Systems (CSBS)', 'CSE - Design (CSD)', 'IT',
  'ECE', 'ECE - VLSI', 'EIE', 'EEE',
  'MECH', 'CIVIL', 'AEROSPACE', 'AUTOMOBILE', 'CHEMICAL', 'MECHATRONICS',
  'BIOMEDICAL', 'BIOTECHNOLOGY', 'BIOTECH - Genetic Engineering', 'BIOTECH - Regenerative Medicine',
  'B.Sc Computer Science', 'B.Sc Data Science', 'B.Sc AI', 'B.Sc Mathematics',
  'B.Sc Physics', 'B.Sc Chemistry', 'B.Sc Biotechnology', 'B.Sc Microbiology',
  'B.Sc Psychology', 'B.Sc Visual Communication', 'B.Sc Hospitality & Hotel Management',
  'B.Com', 'B.Com Accounting & Finance', 'B.Com Information Systems', 'B.Com Computer Applications',
  'BBA', 'BBA Business Analytics', 'BBA Digital Marketing',
  'BCA', 'BCA Data Science', 'BCA AI',
  'BA LLB', 'BBA LLB', 'LLB',
  'B.Arch', 'Interior Design',
  'MBBS', 'BDS', 'B.Pharm', 'B.Sc Nursing', 'B.Sc Medical Lab Technology',
  'B.Sc Cardiac Care Technology', 'B.Sc Neuroscience Technology',
]

const DEPARTMENTS = {
  'CSE - AI & ML': ['Machine Learning', 'Deep Learning', 'Computer Vision', 'NLP', 'Reinforcement Learning'],
  'CSE - Artificial Intelligence': ['AI Fundamentals', 'Expert Systems', 'Robotics AI', 'Cognitive Computing'],
  'CSE - Data Science': ['Statistical Modeling', 'Data Engineering', 'Business Intelligence', 'Data Visualization'],
  'CSE - Big Data Analytics': ['Hadoop & Spark', 'Data Warehousing', 'Real-time Analytics', 'NoSQL Databases'],
  'CSE - Cloud Computing': ['AWS', 'Azure', 'Google Cloud', 'DevOps & CI/CD', 'Containerization'],
  'CSE (Core)': ['Core CS', 'Algorithms & DS', 'Software Engineering', 'Networks & Security'],
  'CSE - Cyber Security': ['Network Security', 'Ethical Hacking', 'Digital Forensics', 'Cryptography'],
  'CSE - Software Engineering': ['Agile & Scrum', 'Software Architecture', 'Testing & QA', 'Full Stack Dev'],
  'CSE - Business Systems (CSBS)': ['ERP Systems', 'Business Analytics', 'Digital Transformation', 'Management Info Systems'],
  'CSE - Design (CSD)': ['UI/UX Design', 'Interaction Design', 'Product Design', 'Visual Computing'],
  'IT': ['Web Technology', 'Cloud Computing', 'Mobile Development', 'DevOps'],
  'ECE': ['Communication Systems', 'Signal Processing', 'Embedded Systems', 'RF & Microwave'],
  'ECE - VLSI': ['VLSI Design', 'Chip Design', 'Semiconductor Devices', 'FPGA'],
  'EIE': ['Industrial Instrumentation', 'Process Control', 'Sensors & Transducers', 'Automation'],
  'EEE': ['Power Systems', 'Control Systems', 'Power Electronics', 'Renewable Energy'],
  'MECH': ['Thermal Engineering', 'Design & Manufacturing', 'Robotics & Automation', 'CAD/CAM'],
  'CIVIL': ['Structural Engineering', 'Environmental Engineering', 'Transportation', 'Geotechnical'],
  'AEROSPACE': ['Aerodynamics', 'Propulsion', 'Avionics', 'Spacecraft Design'],
  'AUTOMOBILE': ['Vehicle Dynamics', 'EV Technology', 'Engine Design', 'Automotive Electronics'],
  'CHEMICAL': ['Process Engineering', 'Petrochemicals', 'Biochemical Engineering'],
  'MECHATRONICS': ['Robotics', 'Control Systems', 'Automation', 'Embedded Systems'],
  'BIOMEDICAL': ['Medical Devices', 'Clinical Engineering', 'Biomaterials', 'Medical Imaging'],
  'BIOTECHNOLOGY': ['Genetic Engineering', 'Microbiology', 'Bioinformatics', 'Industrial Biotech'],
  'BIOTECH - Genetic Engineering': ['Gene Editing', 'CRISPR', 'Molecular Biology', 'Genomics'],
  'BIOTECH - Regenerative Medicine': ['Stem Cell Research', 'Tissue Engineering', 'Organ Regeneration'],
  'B.Sc Computer Science': ['Programming', 'Data Structures', 'Web Development'],
  'B.Sc Data Science': ['Statistics', 'ML Basics', 'Data Analysis'],
  'B.Sc AI': ['AI Foundations', 'Neural Networks', 'Robotics'],
  'B.Sc Mathematics': ['Pure Mathematics', 'Applied Mathematics', 'Statistics'],
  'B.Sc Physics': ['Quantum Physics', 'Astrophysics', 'Applied Physics'],
  'B.Sc Chemistry': ['Organic', 'Inorganic', 'Physical Chemistry'],
  'B.Sc Biotechnology': ['Microbiology', 'Cell Biology', 'Biochemistry'],
  'B.Sc Microbiology': ['Medical Microbiology', 'Industrial Microbiology', 'Virology'],
  'B.Sc Psychology': ['Clinical Psychology', 'Organizational Psychology', 'Counseling'],
  'B.Sc Visual Communication': ['Photography', 'Film Making', 'Graphic Design'],
  'B.Sc Hospitality & Hotel Management': ['Hotel Operations', 'Food & Beverage', 'Tourism'],
  'B.Com': ['Accounting', 'Finance', 'Taxation'],
  'B.Com Accounting & Finance': ['Financial Accounting', 'Cost Accounting', 'Investment'],
  'B.Com Information Systems': ['Business IT', 'Database Management', 'ERP'],
  'B.Com Computer Applications': ['Programming', 'Web Design', 'Business Applications'],
  'BBA': ['Management', 'Marketing', 'HR', 'Finance'],
  'BBA Business Analytics': ['Data Analytics', 'Business Intelligence', 'Decision Science'],
  'BBA Digital Marketing': ['SEO', 'Social Media', 'Content Marketing', 'Performance Marketing'],
  'BCA': ['Programming', 'Web Development', 'Database Management'],
  'BCA Data Science': ['Data Analysis', 'Python', 'Statistics'],
  'BCA AI': ['AI Fundamentals', 'ML Basics', 'Python AI'],
  'BA LLB': ['Constitutional Law', 'Criminal Law', 'Civil Law'],
  'BBA LLB': ['Corporate Law', 'Business Law', 'Intellectual Property'],
  'LLB': ['General Law', 'Litigation', 'Legal Research'],
  'B.Arch': ['Architectural Design', 'Urban Planning', 'Structural Systems'],
  'Interior Design': ['Space Planning', 'Interior Architecture', 'Furniture Design'],
  'MBBS': ['General Medicine', 'Surgery', 'Pediatrics', 'Gynecology'],
  'BDS': ['Oral Medicine', 'Orthodontics', 'Dental Surgery'],
  'B.Pharm': ['Pharmaceutical Chemistry', 'Pharmacology', 'Drug Design'],
  'B.Sc Nursing': ['Medical Nursing', 'Surgical Nursing', 'Community Health'],
  'B.Sc Medical Lab Technology': ['Clinical Biochemistry', 'Hematology', 'Microbiology'],
  'B.Sc Cardiac Care Technology': ['Cardiac Diagnostics', 'ICU Care', 'ECG Technology'],
  'B.Sc Neuroscience Technology': ['Neurology', 'Brain Imaging', 'Neurological Care'],
}

const ROLES = ['student', 'faculty', 'club', 'company']
const ROLE_LABELS = { student: '🎓 Student', faculty: '👨‍🏫 Faculty', club: '🏛️ Club', company: '🏢 Company / Recruiter' }

// ─── Smart Email Detection (unchanged) ───────────────────────────────────────
const COLLEGE_PATTERNS = [
  { pattern: /ra(\d{2})\d+@srmist\.edu\.in/,           college: 'SRM Institute of Science and Technology', shortName: 'SRMIST', extractYear: m => 2000 + parseInt(m[1]), duration: 4 },
  { pattern: /(\d{2})[a-z]{3}\d+@vitstudent\.ac\.in/,  college: 'VIT University',    shortName: 'VIT',       extractYear: m => 2000 + parseInt(m[1]), duration: 4 },
  { pattern: /(\d{4})\d+@student\.annauniv\.edu/,       college: 'Anna University',   shortName: 'Anna Univ', extractYear: m => parseInt(m[1]),          duration: 4 },
  { pattern: /(\d{2})[a-z]{2,4}\d+@cb\.amrita\.edu/,   college: 'Amrita University', shortName: 'Amrita',    extractYear: m => 2000 + parseInt(m[1]), duration: 4 },
  { pattern: /f(\d{4})\d+@.*bits-pilani\.ac\.in/,       college: 'BITS Pilani',       shortName: 'BITS',      extractYear: m => parseInt(m[1]),          duration: 4 },
  { pattern: /(\d{2})[a-z]\d+@.*manipal\.edu/,          college: 'Manipal University',shortName: 'Manipal',   extractYear: m => 2000 + parseInt(m[1]), duration: 4 },
]

function detectFromEmail(email) {
  for (const c of COLLEGE_PATTERNS) {
    const match = email.match(c.pattern)
    if (match && c.extractYear) {
      const joinYear    = c.extractYear(match)
      const now         = new Date()
      const academicYr  = now.getMonth() + 1 >= 7 ? now.getFullYear() : now.getFullYear() - 1
      const yearOfStudy = academicYr - joinYear + 1
      return { college: c.college, shortName: c.shortName, joinYear, yearOfStudy: Math.min(Math.max(yearOfStudy, 1), c.duration), graduationYear: joinYear + c.duration, isValid: yearOfStudy >= 1 && yearOfStudy <= c.duration }
    }
  }
  return null
}

const YEAR_SUFFIX = { 1: 'st', 2: 'nd', 3: 'rd', 4: 'th', 5: 'th' }

// ─── Signup Page ──────────────────────────────────────────────────────────────
export default function Signup() {
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    role: 'student', college: '', branch: '', department: '',
    faculty_department: '',
    club_name: '',
    company_name: '', recruiter_name: '', hiring_process: '', salary_range: '',
    join_year: '', year_of_study: '', graduation_year: '',
    manual_join_year: '', manual_duration: '4',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailInfo, setEmailInfo] = useState(null)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'email') {
      const detected = detectFromEmail(value)
      setEmailInfo(detected)
      if (detected) {
        setForm(prev => ({ ...prev, email: value, college: detected.college, join_year: detected.joinYear, year_of_study: detected.yearOfStudy, graduation_year: detected.graduationYear }))
        return
      }
    }
    if (name === 'manual_join_year' || name === 'manual_duration') {
      setForm(prev => {
        const jy  = name === 'manual_join_year' ? parseInt(value) : parseInt(prev.manual_join_year)
        const dur = name === 'manual_duration'  ? parseInt(value) : parseInt(prev.manual_duration)
        const now = new Date()
        const acYr = now.getMonth() + 1 >= 7 ? now.getFullYear() : now.getFullYear() - 1
        const yos  = jy ? Math.min(Math.max(acYr - jy + 1, 1), dur) : ''
        return { ...prev, [name]: value, join_year: jy || '', year_of_study: yos, graduation_year: jy ? jy + dur : '' }
      })
      return
    }
    setForm(prev => ({ ...prev, [name]: value, ...(name === 'branch' ? { department: '' } : {}) }))
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await API.post('/auth/signup', form)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed!')
    } finally { setLoading(false) }
  }

  const role = form.role

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d1a', fontFamily: "'Inter', sans-serif", position: 'relative', overflowX: 'hidden' }}>
      <style>{`* { box-sizing: border-box; } input:focus, select:focus { border-color: #7c5cbf !important; box-shadow: 0 0 0 3px rgba(124,92,191,0.15) !important; outline: none !important; }`}</style>

      <StarCanvas />

      {/* Purple glow */}
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '80vw', height: '80vh', background: 'radial-gradient(ellipse at center, rgba(124,92,191,0.12) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Floating Navbar */}
      <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 100, width: '100%', maxWidth: 840, padding: '0 24px' }}>
        <div style={{ background: 'rgba(13,13,26,0.8)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 50, padding: '12px 24px', display: 'flex', alignItems: 'center' }}>
          <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <img src="/logo.svg" alt="UniLink" style={{ width: '40px', height: '34px' }} />
            <span style={{ color: 'white', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '22px', letterSpacing: '0.5px' }}>UniLink</span>
          </div>
        </div>
      </div>

      {/* Scrollable card area */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '100vh', padding: '96px 24px 60px', position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: 600 }}
        >
          <div style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '48px 44px' }}>

            <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 32, fontWeight: 800, color: 'white', margin: '0 0 8px' }}>Create your account</h2>
            <p style={{ color: '#666', fontSize: 14, margin: '0 0 32px' }}>Join UniLink and connect with your campus</p>

            {error && <div style={S.error}>{error}</div>}

            <form onSubmit={handleSignup} style={S.form}>

              {/* ROLE */}
              <div style={S.inputGroup}>
                <label style={S.label}>I AM A</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {ROLES.map(r => (
                    <button key={r} type="button" onClick={() => handleChange({ target: { name: 'role', value: r } })}
                      style={{ padding: '10px 14px', borderRadius: 10, border: `1px solid ${role === r ? 'rgba(124,92,191,0.6)' : 'rgba(255,255,255,0.1)'}`, background: role === r ? 'rgba(124,92,191,0.18)' : 'rgba(255,255,255,0.03)', color: role === r ? '#a78bfa' : 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: role === r ? 700 : 400, fontFamily: 'Inter, sans-serif', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
                    >{ROLE_LABELS[r]}</button>
                  ))}
                </div>
              </div>

              {/* Name + Email */}
              <div style={S.row}>
                <div style={S.inputGroup}>
                  <label style={S.label}>FULL NAME</label>
                  <input name="name" placeholder="Your full name" value={form.name} onChange={handleChange} style={S.input} required />
                </div>
                <div style={S.inputGroup}>
                  <label style={S.label}>COLLEGE EMAIL</label>
                  <input name="email" type="email" placeholder="ra2211003@srmist.edu.in" value={form.email} onChange={handleChange} style={S.input} required />
                </div>
              </div>

              {/* Smart email detection */}
              {form.email && emailInfo && emailInfo.isValid && (
                <div style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 12, padding: '14px 18px', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                  <span style={{ color: '#34d399', fontSize: 13, fontWeight: 700 }}>✅ {emailInfo.shortName} detected</span>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>📅 Joined: {emailInfo.joinYear}</span>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>📚 {emailInfo.yearOfStudy}{YEAR_SUFFIX[emailInfo.yearOfStudy] || 'th'} Year</span>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>🎓 Graduating: {emailInfo.graduationYear}</span>
                </div>
              )}

              {/* Manual college inputs */}
              {!emailInfo && (
                <>
                  <div style={S.inputGroup}>
                    <label style={S.label}>COLLEGE NAME</label>
                    <input name="college" placeholder="Your college name" value={form.college} onChange={handleChange} style={S.input} required />
                  </div>
                  {role === 'student' && (
                    <div style={S.row}>
                      <div style={S.inputGroup}>
                        <label style={S.label}>JOIN YEAR</label>
                        <CustomSelect name="manual_join_year" value={form.manual_join_year ? String(form.manual_join_year) : ''} onChange={handleChange} options={['2018','2019','2020','2021','2022','2023','2024','2025','2026']} placeholder="Year you joined" />
                      </div>
                      <div style={S.inputGroup}>
                        <label style={S.label}>COURSE DURATION</label>
                        <CustomSelect name="manual_duration" value={form.manual_duration} onChange={handleChange} options={['2','3','4','5']} placeholder="Years" />
                      </div>
                    </div>
                  )}
                  {form.join_year && form.graduation_year && (
                    <div style={{ background: 'rgba(124,92,191,0.08)', border: '1px solid rgba(124,92,191,0.2)', borderRadius: 10, padding: '10px 16px', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      <span style={{ color: '#a78bfa', fontSize: 12 }}>📚 Year {form.year_of_study} of {form.manual_duration}</span>
                      <span style={{ color: '#a78bfa', fontSize: 12 }}>🎓 Graduating: {form.graduation_year}</span>
                    </div>
                  )}
                </>
              )}

              <div style={S.inputGroup}>
                <label style={S.label}>PASSWORD</label>
                <input name="password" type="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} style={S.input} required />
              </div>

              {/* STUDENT fields */}
              {role === 'student' && (
                <div style={S.row}>
                  <div style={S.inputGroup}>
                    <label style={S.label}>BRANCH / SPECIALIZATION</label>
                    <CustomSelect name="branch" value={form.branch} onChange={handleChange} options={BRANCHES} placeholder="Select Branch" />
                  </div>
                  <div style={S.inputGroup}>
                    <label style={S.label}>DOMAIN</label>
                    <CustomSelect name="department" value={form.department} onChange={handleChange} options={DEPARTMENTS[form.branch] || []} placeholder="Select Domain" disabled={!form.branch} />
                  </div>
                </div>
              )}

              {/* FACULTY fields */}
              {role === 'faculty' && (
                <div style={S.inputGroup}>
                  <label style={S.label}>DEPARTMENT</label>
                  <CustomSelect name="faculty_department" value={form.faculty_department} onChange={handleChange}
                    options={['Computer Science & Engineering','Information Technology','Electronics & Communication','Electrical Engineering','Mechanical Engineering','Civil Engineering','Biotechnology','Physics','Chemistry','Mathematics','Management Studies','Law','Architecture','Medical Sciences','Other']}
                    placeholder="Select Department" />
                </div>
              )}

              {/* CLUB fields */}
              {role === 'club' && (
                <div style={S.inputGroup}>
                  <label style={S.label}>CLUB NAME</label>
                  <input name="club_name" placeholder="e.g. IEEE Student Branch, Coding Club" value={form.club_name} onChange={handleChange} style={S.input} required />
                </div>
              )}

              {/* COMPANY fields */}
              {role === 'company' && (
                <>
                  <div style={S.row}>
                    <div style={S.inputGroup}>
                      <label style={S.label}>COMPANY NAME</label>
                      <input name="company_name" placeholder="e.g. Google India" value={form.company_name} onChange={handleChange} style={S.input} required />
                    </div>
                    <div style={S.inputGroup}>
                      <label style={S.label}>RECRUITER NAME</label>
                      <input name="recruiter_name" placeholder="Your name" value={form.recruiter_name} onChange={handleChange} style={S.input} required />
                    </div>
                  </div>
                  <div style={S.row}>
                    <div style={S.inputGroup}>
                      <label style={S.label}>HIRING PROCESS</label>
                      <CustomSelect name="hiring_process" value={form.hiring_process} onChange={handleChange} options={['On-Campus', 'Off-Campus', 'Both']} placeholder="Select Hiring Mode" />
                    </div>
                    <div style={S.inputGroup}>
                      <label style={S.label}>STIPEND / SALARY RANGE</label>
                      <input name="salary_range" placeholder="e.g. ₹20,000/mo or ₹8–12 LPA" value={form.salary_range} onChange={handleChange} style={S.input} />
                    </div>
                  </div>
                </>
              )}

              <button type="submit" disabled={loading} style={loading ? S.btnDisabled : S.btn}>
                {loading ? 'Creating account...' : 'Create Account →'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#666', marginBottom: 0 }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#7c5cbf', textDecoration: 'none', fontWeight: 600 }}>Sign in →</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  label:      { fontSize: 12, color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 0 },
  input:      { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px', color: 'white', fontSize: 14, fontFamily: 'Inter, sans-serif', outline: 'none', width: '100%', transition: 'border-color 0.2s, box-shadow 0.2s' },
  btn:        { background: '#7c5cbf', color: 'white', padding: '14px', borderRadius: 12, border: 'none', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter',sans-serif", width: '100%', marginTop: 8, transition: 'background 0.2s' },
  btnDisabled:{ background: 'rgba(124,92,191,0.35)', color: 'rgba(255,255,255,0.4)', padding: '14px', borderRadius: 12, border: 'none', fontSize: 15, fontWeight: 600, cursor: 'not-allowed', fontFamily: "'Inter',sans-serif", width: '100%', marginTop: 8 },
  error:      { background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', color: '#fb7185', padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 14 },
  form:       { display: 'flex', flexDirection: 'column', gap: 20 },
  row:        { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: 8 },
}
