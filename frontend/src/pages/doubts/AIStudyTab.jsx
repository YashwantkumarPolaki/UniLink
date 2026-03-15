import { useState, useEffect, useRef } from 'react'
import { Upload, FileText, Sparkles, Brain, BookOpen, List, HelpCircle, RefreshCw, Send, ChevronDown } from 'lucide-react'
import { callAI, extractTextFromPDF, AI_PERSONAS } from './doubtsAI'
import { S } from './doubtsStyles'

export default function AIStudyTab({ user }) {
  const [pdfFile, setPdfFile] = useState(null)
  const [pdfText, setPdfText] = useState('')
  const [summary, setSummary] = useState(null)   // { overview, concepts, formulas, tips }
  const [summaryRaw, setSummaryRaw] = useState('')
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [chatMsgs, setChatMsgs] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [activePersona, setActivePersona] = useState(AI_PERSONAS[0])
  const [toolLoading, setToolLoading] = useState('')
  const [toolOutput, setToolOutput] = useState('')
  const [error, setError] = useState('')
  const fileRef = useRef()
  const chatEndRef = useRef()
  const dragRef = useRef(false)

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatMsgs])

  const handleFile = async (file) => {
    if (!file || file.type !== 'application/pdf') { setError('Please upload a valid PDF file.'); return }
    setError(''); setPdfFile(file); setPdfText(''); setSummary(null); setSummaryRaw(''); setChatMsgs([]); setToolOutput('')
    setExtracting(true)
    try {
      const text = await extractTextFromPDF(file)
      if (text.length < 60) { setError('PDF is image-based or empty. Please use a text-based PDF.'); setExtracting(false); return }
      setPdfText(text)
      await runSummarize(text, file.name)
    } catch (e) { setError('Could not read PDF: ' + e.message) }
    setExtracting(false)
  }

  const runSummarize = async (text = pdfText, name = pdfFile?.name) => {
    setSummaryLoading(true); setError(''); setSummary(null); setSummaryRaw('')
    try {
      const prompt = `You are an expert tutor for Indian engineering students. Analyze this course material and respond ONLY in this exact JSON (no markdown, no extra text):
{"overview":"2-3 sentence plain-language overview","concepts":["concept 1","concept 2","concept 3","concept 4","concept 5"],"formulas":["formula or rule 1","formula or rule 2"],"tips":["exam tip 1","exam tip 2","exam tip 3"]}

Material (first 4000 chars):
${text.slice(0, 4000)}`
      const raw = await callAI(prompt, 'gpt')
      const cleaned = raw.replace(/```json|```/g, '').trim()
      try {
        const parsed = JSON.parse(cleaned)
        setSummary(parsed)
      } catch {
        setSummaryRaw(raw)
      }
      setChatMsgs([{ role: 'ai', persona: activePersona, text: `Hi ${user?.name || 'there'}! 👋 I've read **${name}**. Ask me anything about it!` }])
    } catch (e) { setError(e.message) }
    setSummaryLoading(false)
  }

  const runTool = async (toolName) => {
    if (!pdfText) return
    setToolLoading(toolName); setToolOutput('')
    const prompts = {
      quiz: `Generate 5 multiple-choice quiz questions from this material. Format each as:\nQ: [question]\nA) [option] B) [option] C) [option] D) [option]\nAnswer: [letter]\n\nMaterial: ${pdfText.slice(0, 3000)}`,
      explain: `Identify the 3 most difficult or confusing concepts in this material and explain each one simply, like you're teaching a beginner. Material: ${pdfText.slice(0, 3000)}`,
      keypoints: `Extract the 8 most important key points from this material as clean bullet points. Be concise. Material: ${pdfText.slice(0, 3000)}`
    }
    try {
      const result3 = await callAI(prompts[toolName], activePersona.model)
      setToolOutput(result3)
    } catch (e) { setToolOutput('⚠️ ' + e.message) }
    setToolLoading('')
  }

  const sendChat = async () => {
    const q = chatInput.trim(); if (!q || !pdfText) return
    setChatInput('')
    setChatMsgs(prev => [...prev, { role: 'user', text: q }])
    setChatLoading(true)
    try {
      const history = chatMsgs.slice(-4).map(m => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.text}`).join('\n')
      const prompt = `${activePersona.style}\n\nYou are helping a student understand their course PDF. Answer ONLY from the PDF context below.\n\nPDF (excerpt): ${pdfText.slice(0, 2500)}\n\nChat history:\n${history}\n\nStudent question: ${q}\n\nAnswer in 3–4 sentences. Be clear and helpful.`
      const result = await callAI(prompt, activePersona.model)
      setChatMsgs(prev => [...prev, { role: 'ai', persona: activePersona, text: result }])
    } catch (e) { setChatMsgs(prev => [...prev, { role: 'ai', persona: activePersona, text: '⚠️ ' + e.message }]) }
    setChatLoading(false)
  }

  return (
    <div>
      {/* Upload */}
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); dragRef.current = true }}
        onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
        style={{ border: `2px dashed ${pdfFile ? 'rgba(167,139,250,0.5)' : 'rgba(255,255,255,0.15)'}`, borderRadius: 20, padding: '36px 24px', textAlign: 'center', cursor: 'pointer', background: 'rgba(167,139,250,0.04)', marginBottom: 24, transition: 'border-color 0.2s' }}>
        <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
        {extracting ? (
          <div style={{ color: '#a78bfa' }}>
            <div style={{ ...S.spinner, margin: '0 auto 10px' }} />
            Reading PDF...
          </div>
        ) : pdfFile ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <FileText size={28} color="#a78bfa" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ color: 'white', fontWeight: 600 }}>{pdfFile.name}</div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>Click to replace</div>
            </div>
          </div>
        ) : (
          <>
            <Upload size={40} color="rgba(167,139,250,0.6)" style={{ margin: '0 auto 12px' }} />
            <div style={{ color: 'white', fontWeight: 600, fontSize: 15 }}>Upload Course PDF</div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 4 }}>Click or drag &amp; drop • AI summarizes instantly</div>
          </>
        )}
      </div>

      {error && <div style={S.errorBox}><HelpCircle size={14} /> {error}</div>}

      {/* Summary + Tools grid */}
      {(summaryLoading || summary || summaryRaw) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 20, marginBottom: 24 }}>
          {/* Summary card */}
          <div style={{ ...S.glassCard, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Brain size={18} color="#a78bfa" />
              <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700 }}>AI Summary</span>
              {!summaryLoading && pdfText && (
                <button onClick={() => runSummarize()} style={{ ...S.iconBtn, marginLeft: 'auto' }}><RefreshCw size={13} /></button>
              )}
            </div>
            {summaryLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
                <div style={{ ...S.spinner, width: 16, height: 16 }} /> Analyzing your PDF...
              </div>
            ) : summary ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <div style={S.sectionLabel}>📌 Overview</div>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 1.7 }}>{summary.overview}</p>
                </div>
                <div>
                  <div style={S.sectionLabel}>🔑 Key Concepts</div>
                  {summary.concepts?.map((c, i) => <div key={i} style={S.bulletItem}>• {c}</div>)}
                </div>
                {summary.formulas?.length > 0 && (
                  <div>
                    <div style={S.sectionLabel}>💡 Formulas / Rules</div>
                    {summary.formulas.map((f, i) => <div key={i} style={{ ...S.bulletItem, fontFamily: 'monospace', background: 'rgba(167,139,250,0.1)', padding: '4px 8px', borderRadius: 6, marginBottom: 4 }}>⚡ {f}</div>)}
                  </div>
                )}
                <div>
                  <div style={S.sectionLabel}>📝 Exam Tips</div>
                  {summary.tips?.map((t, i) => <div key={i} style={{ ...S.bulletItem, color: '#34d399' }}>✔ {t}</div>)}
                </div>
              </div>
            ) : (
              <pre style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{summaryRaw}</pre>
            )}
          </div>

          {/* Right: Tools + Chat */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* AI Tools */}
            <div style={{ ...S.glassCard, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Sparkles size={16} color="#fbbf24" />
                <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14 }}>AI Study Tools</span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                {[
                  { id: 'quiz', label: '🧪 Generate Quiz', desc: '5 MCQs from your PDF' },
                  { id: 'explain', label: '💡 Explain Hard Parts', desc: 'Simplify complex topics' },
                  { id: 'keypoints', label: '📋 Key Points', desc: 'Extract 8 main points' }
                ].map(t => (
                  <button key={t.id} onClick={() => runTool(t.id)} disabled={!!toolLoading}
                    style={{ flex: '1 1 100%', background: toolLoading === t.id ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.04)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 12, padding: '10px 14px', color: toolLoading === t.id ? '#a78bfa' : 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'Inter,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{t.label}</span>
                    {toolLoading === t.id
                      ? <div style={{ ...S.spinner, width: 14, height: 14, borderWidth: 2 }} />
                      : <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{t.desc}</span>}
                  </button>
                ))}
              </div>
              {toolOutput && (
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '12px 14px', maxHeight: 240, overflowY: 'auto' }}>
                  <pre style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 1.75, whiteSpace: 'pre-wrap', margin: 0 }}>{toolOutput}</pre>
                </div>
              )}
            </div>

            {/* Chat */}
            <div style={{ ...S.glassCard, display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1, minHeight: 280 }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <BookOpen size={15} color="#67e8f9" />
                <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 13 }}>Ask PDF Questions</span>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                  {AI_PERSONAS.map(p => (
                    <button key={p.id} onClick={() => setActivePersona(p)}
                      style={{ padding: '3px 10px', borderRadius: 20, border: `1px solid ${activePersona.id === p.id ? p.border : 'rgba(255,255,255,0.08)'}`, background: activePersona.id === p.id ? p.bg : 'transparent', color: activePersona.id === p.id ? p.color : 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
                      {p.logo}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {chatMsgs.map((m, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '88%', background: m.role === 'user' ? 'rgba(167,139,250,0.2)' : (m.persona?.bg || 'rgba(255,255,255,0.04)'), border: `1px solid ${m.role === 'user' ? 'rgba(167,139,250,0.35)' : (m.persona?.border || 'rgba(255,255,255,0.07)')}`, borderRadius: 12, padding: '8px 12px', fontSize: 13, lineHeight: 1.65, color: 'rgba(255,255,255,0.85)', whiteSpace: 'pre-wrap' }}>
                      {m.role === 'ai' && m.persona && <div style={{ fontSize: 10, color: m.persona.color, fontWeight: 700, marginBottom: 4 }}>{m.persona.logo} {m.persona.name}</div>}
                      {m.text}
                    </div>
                  </div>
                ))}
                {chatLoading && <div style={{ fontSize: 12, color: activePersona.color, paddingLeft: 4, display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ ...S.spinner, width: 12, height: 12, borderWidth: 1.5, borderTopColor: activePersona.color }} /> {activePersona.name} is thinking...</div>}
                <div ref={chatEndRef} />
              </div>
              <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 8 }}>
                <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat() } }}
                  placeholder="Ask anything about this PDF..." style={{ ...S.input, flex: 1, padding: '9px 12px', fontSize: 13 }} />
                <button onClick={sendChat} disabled={!chatInput.trim() || chatLoading}
                  style={{ background: chatInput.trim() ? 'linear-gradient(135deg,#7c3aed,#a78bfa)' : 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 10, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: chatInput.trim() ? 'pointer' : 'not-allowed' }}>
                  <Send size={15} color="white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
