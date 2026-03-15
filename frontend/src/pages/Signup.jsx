import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../api'

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
        style={{
          width: '100%',
          background: disabled ? 'rgba(255,255,255,0.02)' : '#1a1035',
          border: `1px solid ${open ? 'rgba(167,139,250,0.5)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: 12,
          padding: '12px 16px',
          color: value ? 'white' : 'rgba(255,255,255,0.3)',
          fontSize: 14,
          fontFamily: 'Inter, sans-serif',
          cursor: disabled ? 'not-allowed' : 'pointer',
          textAlign: 'left',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <span>{value || placeholder}</span>
        <span style={{ color: '#a78bfa', fontSize: 12, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0, right: 0,
          background: '#1a1035',
          border: '1px solid rgba(167,139,250,0.3)',
          borderRadius: 12,
          maxHeight: 220,
          overflowY: 'auto',
          zIndex: 1000,
          boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
        }}>
          {options.map(opt => (
            <div
              key={opt}
              onClick={() => handleSelect(opt)}
              style={{
                padding: '10px 16px',
                color: value === opt ? '#a78bfa' : 'rgba(255,255,255,0.7)',
                background: value === opt ? 'rgba(167,139,250,0.15)' : 'transparent',
                fontSize: 14,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                fontWeight: value === opt ? 600 : 400,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(167,139,250,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = value === opt ? 'rgba(167,139,250,0.15)' : 'transparent'}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

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

// ─── Smart Email Detection ────────────────────────────────────────────────────
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
      return {
        college: c.college, shortName: c.shortName, joinYear,
        yearOfStudy: Math.min(Math.max(yearOfStudy, 1), c.duration),
        graduationYear: joinYear + c.duration,
        isValid: yearOfStudy >= 1 && yearOfStudy <= c.duration,
      }
    }
  }
  return null
}

const YEAR_SUFFIX = { 1: 'st', 2: 'nd', 3: 'rd', 4: 'th', 5: 'th' }

export default function Signup() {
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    role: 'student', college: '', branch: '', department: '',
    faculty_department: '',
    club_name: '',
    company_name: '', recruiter_name: '', hiring_process: '', salary_range: '',
    join_year: '', year_of_study: '', graduation_year: '',
    // manual college fields (shown when email doesn't auto-detect)
    manual_join_year: '', manual_duration: '4',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailInfo, setEmailInfo] = useState(null)   // detected college info
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target

    // Run email detection live
    if (name === 'email') {
      const detected = detectFromEmail(value)
      setEmailInfo(detected)
      if (detected) {
        setForm(prev => ({
          ...prev,
          email: value,
          college: detected.college,
          join_year: detected.joinYear,
          year_of_study: detected.yearOfStudy,
          graduation_year: detected.graduationYear,
        }))
        return
      }
    }

    // Manual join year / duration → recalculate year_of_study + graduation_year
    if (name === 'manual_join_year' || name === 'manual_duration') {
      setForm(prev => {
        const jy  = name === 'manual_join_year' ? parseInt(value) : parseInt(prev.manual_join_year)
        const dur = name === 'manual_duration'  ? parseInt(value) : parseInt(prev.manual_duration)
        const now = new Date()
        const acYr = now.getMonth() + 1 >= 7 ? now.getFullYear() : now.getFullYear() - 1
        const yos  = jy ? Math.min(Math.max(acYr - jy + 1, 1), dur) : ''
        return {
          ...prev,
          [name]: value,
          join_year: jy || '',
          year_of_study: yos,
          graduation_year: jy ? jy + dur : '',
        }
      })
      return
    }

    setForm(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'branch' ? { department: '' } : {})
    }))
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await API.post('/auth/signup', form)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed!')
    } finally {
      setLoading(false)
    }
  }

  const role = form.role

  return (
    <div style={S.root}>
      <div style={S.bg1} /><div style={S.bg2} /><div style={S.bg3} />

      <div style={S.wrapper}>
        <div style={S.leftPanel}>
          <div style={S.brand}>
            <span style={S.brandUni}>Uni</span>
            <span style={S.brandLink}>Link</span>
          </div>
          <h2 style={S.leftTitle}>Your college universe starts here</h2>
          <p style={S.leftDesc}>Events, doubts, opportunities — all personalized for your branch and interests.</p>
          <div style={S.features}>
            {[
              { icon: '📅', text: 'Branch-specific event recommendations' },
              { icon: '💬', text: 'Peer-to-peer doubt solving' },
              { icon: '💼', text: 'Curated internship opportunities' },
              { icon: '🎓', text: 'Built for SRM students' },
            ].map(f => (
              <div key={f.text} style={S.feature}>
                <span style={S.featureIcon}>{f.icon}</span>
                <span style={S.featureText}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={S.card}>
          <div style={S.cardGlow} />
          <h1 style={S.title}>Create Account</h1>
          <p style={S.subtitle}>Join thousands of students on UniLink</p>

          {error && <div style={S.error}>{error}</div>}

          <form onSubmit={handleSignup} style={S.form}>

            {/* ROLE — always first */}
            <div style={S.inputGroup}>
              <label style={S.label}>I am a</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {ROLES.map(r => (
                  <button
                    key={r} type="button"
                    onClick={() => handleChange({ target: { name: 'role', value: r } })}
                    style={{
                      padding: '10px 14px', borderRadius: 12, border: `1px solid ${role === r ? 'rgba(167,139,250,0.6)' : 'rgba(255,255,255,0.1)'}`,
                      background: role === r ? 'rgba(167,139,250,0.18)' : '#1a1035',
                      color: role === r ? '#a78bfa' : 'rgba(255,255,255,0.5)',
                      fontSize: 13, fontWeight: role === r ? 700 : 400,
                      fontFamily: 'Inter, sans-serif', cursor: 'pointer', textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                  >{ROLE_LABELS[r]}</button>
                ))}
              </div>
            </div>

            {/* Name + Email */}
            <div style={S.row}>
              <div style={S.inputGroup}>
                <label style={S.label}>Full Name</label>
                <input name="name" placeholder="Your full name" value={form.name} onChange={handleChange} style={S.input} required />
              </div>
              <div style={S.inputGroup}>
                <label style={S.label}>College Email</label>
                <input name="email" type="email" placeholder="ra2211003@srmist.edu.in" value={form.email} onChange={handleChange} style={S.input} required />
              </div>
            </div>

            {/* Smart email detection result */}
            {form.email && emailInfo && emailInfo.isValid && (
              <div style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 14, padding: '14px 18px', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                <span style={{ color: '#34d399', fontSize: 13, fontWeight: 700 }}>✅ {emailInfo.shortName} detected</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>📅 Joined: {emailInfo.joinYear}</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>📚 {emailInfo.yearOfStudy}{YEAR_SUFFIX[emailInfo.yearOfStudy] || 'th'} Year</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>🎓 Graduating: {emailInfo.graduationYear}</span>
              </div>
            )}

            {/* Manual college inputs (shown only when email doesn't auto-detect) */}
            {!emailInfo && (
              <>
                <div style={S.inputGroup}>
                  <label style={S.label}>College Name</label>
                  <input name="college" placeholder="Your college name" value={form.college} onChange={handleChange} style={S.input} required />
                </div>
                {role === 'student' && (
                  <div style={S.row}>
                    <div style={S.inputGroup}>
                      <label style={S.label}>Join Year</label>
                      <CustomSelect name="manual_join_year" value={form.manual_join_year ? String(form.manual_join_year) : ''}
                        onChange={handleChange}
                        options={['2018','2019','2020','2021','2022','2023','2024','2025','2026']}
                        placeholder="Year you joined" />
                    </div>
                    <div style={S.inputGroup}>
                      <label style={S.label}>Course Duration</label>
                      <CustomSelect name="manual_duration" value={form.manual_duration}
                        onChange={handleChange}
                        options={['2','3','4','5']}
                        placeholder="Years" />
                    </div>
                  </div>
                )}
                {form.join_year && form.graduation_year && (
                  <div style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 12, padding: '10px 16px', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <span style={{ color: '#a78bfa', fontSize: 12 }}>📚 Year {form.year_of_study} of {form.manual_duration}</span>
                    <span style={{ color: '#a78bfa', fontSize: 12 }}>🎓 Graduating: {form.graduation_year}</span>
                  </div>
                )}
              </>
            )}

            <div style={S.inputGroup}>
              <label style={S.label}>Password</label>
              <input name="password" type="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} style={S.input} required />
            </div>

            {/* STUDENT fields */}
            {role === 'student' && (
              <div style={S.row}>
                <div style={S.inputGroup}>
                  <label style={S.label}>Branch / Specialization</label>
                  <CustomSelect name="branch" value={form.branch} onChange={handleChange} options={BRANCHES} placeholder="Select Branch" />
                </div>
                <div style={S.inputGroup}>
                  <label style={S.label}>Domain</label>
                  <CustomSelect name="department" value={form.department} onChange={handleChange} options={DEPARTMENTS[form.branch] || []} placeholder="Select Domain" disabled={!form.branch} />
                </div>
              </div>
            )}

            {/* FACULTY fields */}
            {role === 'faculty' && (
              <div style={S.inputGroup}>
                <label style={S.label}>Department</label>
                <CustomSelect name="faculty_department" value={form.faculty_department} onChange={handleChange}
                  options={['Computer Science & Engineering','Information Technology','Electronics & Communication','Electrical Engineering','Mechanical Engineering','Civil Engineering','Biotechnology','Physics','Chemistry','Mathematics','Management Studies','Law','Architecture','Medical Sciences','Other']}
                  placeholder="Select Department" />
              </div>
            )}

            {/* CLUB fields */}
            {role === 'club' && (
              <div style={S.inputGroup}>
                <label style={S.label}>Club Name</label>
                <input name="club_name" placeholder="e.g. IEEE Student Branch, Coding Club" value={form.club_name} onChange={handleChange} style={S.input} required />
              </div>
            )}

            {/* COMPANY fields */}
            {role === 'company' && (
              <>
                <div style={S.row}>
                  <div style={S.inputGroup}>
                    <label style={S.label}>Company Name</label>
                    <input name="company_name" placeholder="e.g. Google India" value={form.company_name} onChange={handleChange} style={S.input} required />
                  </div>
                  <div style={S.inputGroup}>
                    <label style={S.label}>Recruiter Name</label>
                    <input name="recruiter_name" placeholder="Your name" value={form.recruiter_name} onChange={handleChange} style={S.input} required />
                  </div>
                </div>
                <div style={S.row}>
                  <div style={S.inputGroup}>
                    <label style={S.label}>Hiring Process</label>
                    <CustomSelect name="hiring_process" value={form.hiring_process} onChange={handleChange}
                      options={['On-Campus', 'Off-Campus', 'Both']} placeholder="Select Hiring Mode" />
                  </div>
                  <div style={S.inputGroup}>
                    <label style={S.label}>Stipend / Salary Range</label>
                    <input name="salary_range" placeholder="e.g. ₹20,000/mo or ₹8–12 LPA" value={form.salary_range} onChange={handleChange} style={S.input} />
                  </div>
                </div>
              </>
            )}

            <button type="submit" style={loading ? S.btnDisabled : S.btn} disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <p style={S.switchText}>
            Already have an account?{' '}
            <Link to="/login" style={S.switchLink}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

const glass = {
  background: 'rgba(255,255,255,0.04)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.08)',
}

const S = {
  root: { minHeight: '100vh', background: 'linear-gradient(160deg, #050510 0%, #0d0820 40%, #060315 100%)', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative', overflow: 'hidden' },
  bg1: { position: 'fixed', top: '-20%', left: '-10%', width: '60vw', height: '60vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 65%)', pointerEvents: 'none' },
  bg2: { position: 'fixed', top: '30%', right: '-15%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 65%)', pointerEvents: 'none' },
  bg3: { position: 'fixed', bottom: '-10%', left: '25%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 65%)', pointerEvents: 'none' },
  wrapper: { display: 'flex', gap: 48, alignItems: 'center', maxWidth: 1100, width: '100%', position: 'relative', zIndex: 1 },
  leftPanel: { flex: 1, padding: '0 24px' },
  brand: { display: 'flex', marginBottom: 32 },
  brandUni: { fontFamily: 'Syne, sans-serif', fontSize: 40, fontWeight: 800, color: 'white', letterSpacing: -1 },
  brandLink: { fontFamily: 'Syne, sans-serif', fontSize: 40, fontWeight: 800, background: 'linear-gradient(90deg, #a78bfa, #67e8f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: -1 },
  leftTitle: { fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, color: 'white', lineHeight: 1.3, marginBottom: 16 },
  leftDesc: { color: 'rgba(255,255,255,0.4)', fontSize: 15, lineHeight: 1.8, marginBottom: 40 },
  features: { display: 'flex', flexDirection: 'column', gap: 20 },
  feature: { display: 'flex', alignItems: 'center', gap: 16 },
  featureIcon: { fontSize: 24, width: 44, height: 44, borderRadius: 12, background: 'rgba(167,139,250,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  featureText: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },
  card: { ...glass, borderRadius: 28, padding: '48px 44px', width: '100%', maxWidth: 560, position: 'relative', overflow: 'visible', boxShadow: '0 40px 80px rgba(0,0,0,0.5)' },
  cardGlow: { position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 60%)', pointerEvents: 'none' },
  title: { fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 8 },
  subtitle: { color: 'rgba(255,255,255,0.35)', fontSize: 14, marginBottom: 32 },
  error: { background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', color: '#fb7185', padding: '12px 16px', borderRadius: 12, marginBottom: 20, fontSize: 14 },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'Syne, sans-serif' },
  input: { background: '#1a1035', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 16px', color: 'white', fontSize: 14, fontFamily: 'Inter, sans-serif', outline: 'none' },
  btn: { background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', color: 'white', padding: '14px', borderRadius: 14, border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'Syne, sans-serif', boxShadow: '0 8px 32px rgba(124,58,237,0.4)', marginTop: 8 },
  btnDisabled: { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)', padding: '14px', borderRadius: 14, border: 'none', fontSize: 16, fontWeight: 700, cursor: 'not-allowed', fontFamily: 'Syne, sans-serif', marginTop: 8 },
  switchText: { textAlign: 'center', marginTop: 24, fontSize: 14, color: 'rgba(255,255,255,0.3)' },
  switchLink: { color: '#a78bfa', textDecoration: 'none', fontWeight: 600 },
}