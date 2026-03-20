// ─── GEMINI 2.0 AI CALL ───────────────────────────────────────────────────────
import { askAI } from '../../services/aiService'

export async function callAI(prompt, _model = 'gemini') {
  try {
    return await askAI(prompt)
  } catch (e) {
    throw new Error(e.message || 'AI unavailable. Please try again.')
  }
}

// ─── PDF EXTRACTOR (PDF.js via CDN) ──────────────────────────────────────────
export async function extractTextFromPDF(file) {
  if (!window.pdfjsLib) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
  }
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let text = ''
  for (let i = 1; i <= Math.min(pdf.numPages, 25); i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    text += content.items.map(it => it.str).join(' ') + '\n'
  }
  return text.trim()
}

// ─── AI PERSONAS — same Gemini model, different prompt styles ─────────────────
export const AI_PERSONAS = [
  {
    id: 'simple',
    model: 'simple',
    name: 'Simple Explain',
    logo: '🟢',
    color: '#10a37f',
    bg: 'rgba(16,163,127,0.08)',
    border: 'rgba(16,163,127,0.3)',
    style: 'Explain like I\'m a student in simple words. Use numbered steps and short sentences. Avoid jargon. Start directly with the answer.'
  },
  {
    id: 'detailed',
    model: 'detailed',
    name: 'Deep Dive',
    logo: '🔵',
    color: '#4285f4',
    bg: 'rgba(66,133,244,0.08)',
    border: 'rgba(66,133,244,0.3)',
    style: 'Give a comprehensive, detailed explanation with examples, edge cases, and real-world applications. Use clear structure. Start directly with the answer.'
  }
]

// ─── CREDITS CONFIG ──────────────────────────────────────────────────────────
export const CREDIT_RULES = {
  ask: 1, answer: 5, upvote_received: 3,
  best_answer: 10, faculty_verified: 15, downvote: -2
}

export function getRank(credits) {
  if (credits >= 1000) return { label: 'Campus Mentor', color: '#f59e0b', icon: '👑' }
  if (credits >= 400)  return { label: 'Expert',        color: '#a78bfa', icon: '🔥' }
  if (credits >= 150)  return { label: 'Contributor',   color: '#67e8f9', icon: '⚡' }
  if (credits >= 50)   return { label: 'Learner',       color: '#34d399', icon: '📘' }
  return                      { label: 'Beginner',      color: '#94a3b8', icon: '🌱' }
}

export function detectDifficulty(text) {
  const hard = ['proof','theorem','eigenvalue','integral','fourier','lagrange','hamiltonian','topology','convolution','NP-hard']
  const med  = ['algorithm','recursion','derivative','matrix','probability','complexity','polymorphism','pointer','query']
  const t = text.toLowerCase()
  if (hard.some(w => t.includes(w))) return { level: 'Hard',   color: '#fb7185', bg: 'rgba(251,113,133,0.1)' }
  if (med.some(w =>  t.includes(w))) return { level: 'Medium', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)'  }
  return                                     { level: 'Easy',   color: '#34d399', bg: 'rgba(52,211,153,0.1)'  }
}
