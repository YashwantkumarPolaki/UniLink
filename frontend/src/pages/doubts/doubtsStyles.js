// Shared inline styles for the Doubts feature (matches existing project style)
export const S = {
  // Layout
  spinner: { width: 28, height: 28, border: '3px solid rgba(167,139,250,0.2)', borderTop: '3px solid #a78bfa', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  glassCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modal: { background: 'linear-gradient(160deg,#0d0820,#050510)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 28, padding: 36, maxWidth: 580, width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 40px 80px rgba(0,0,0,0.6)' },
  closeBtn: { position: 'absolute', top: 18, right: 18, background: 'rgba(255,255,255,0.08)', border: 'none', color: 'white', width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  // Form
  field: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'Syne,sans-serif' },
  input: { background: '#1a1035', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '11px 14px', color: 'white', fontSize: 14, fontFamily: 'Inter,sans-serif', outline: 'none', colorScheme: 'dark', width: '100%', boxSizing: 'border-box' },
  // Buttons
  gradBtn: { background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', color: 'white', border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Syne,sans-serif' },
  btnGhost: { background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.3)', border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'not-allowed', fontFamily: 'Syne,sans-serif' },
  iconBtn: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '5px 8px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  pillBtn: { padding: '7px 16px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 13, fontFamily: 'Inter,sans-serif' },
  pillActive: { background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.4)', color: '#a78bfa', fontWeight: 600 },
  selectSm: { background: '#1a1035', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 14px', color: 'rgba(255,255,255,0.6)', fontSize: 13, fontFamily: 'Inter,sans-serif', outline: 'none', colorScheme: 'dark' },
  // Text
  modalTitle: { fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 4, margin: 0 },
  sectionLabel: { fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, fontFamily: 'Syne,sans-serif' },
  bulletItem: { color: 'rgba(255,255,255,0.65)', fontSize: 13, lineHeight: 1.65, paddingLeft: 4, paddingTop: 3 },
  // Chips
  badge: { padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 },
  chip: { fontSize: 12, color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.05)', padding: '3px 10px', borderRadius: 10, display: 'inline-flex', alignItems: 'center' },
  // States
  errorBox: { background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.3)', color: '#fb7185', borderRadius: 10, padding: '10px 14px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 },
  emptyState: { textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.3)', fontSize: 14 },
}
