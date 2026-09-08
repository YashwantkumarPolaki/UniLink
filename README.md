# 🎓 UniLink — Campus Super-App

> **Centralized platform for college students** — events, doubts, opportunities, clubs, campus status and more, all in one stunning place.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-UniLink-7c3aed?style=for-the-badge&logo=vercel)](https://unilink-frontend.netlify.app)
[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://unilink-api.onrender.com)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

---

## 🚀 What is UniLink?

UniLink is a full-stack web application built for college students, faculty, clubs, and companies to connect and collaborate in one place. It eliminates the chaos of scattered WhatsApp groups, notice boards, and spreadsheets — replacing them with a beautiful, feature-rich platform.

---

## ✨ Features

### 👨‍🎓 For Students
| Feature | Description |
|---|---|
| 🏠 **Dashboard** | Personalized feed with announcements, upcoming events & quick stats |
| 📅 **Events** | Browse & register for college events (workshops, hackathons, fests) |
| 💬 **Doubt Forum** | Ask & answer academic doubts with upvotes and AI assistance |
| 💼 **Opportunities** | Browse internships, placements & freelance opportunities |
| 🤝 **Co-Founder Finder** | Find startup co-founders matching your skills |
| 🔍 **Lost & Found** | Report and find lost items on campus |
| 🎤 **Mock Interview** | AI-powered mock interviews with real-time feedback |
| 📊 **Campus Status** | Live mess menu, library seats, gym occupancy |

### 🏛️ For Clubs & 🏢 For Companies
| Feature | Description |
|---|---|
| 📣 **Post Events** | Clubs can post events pending admin approval |
| 💼 **Post Opportunities** | Companies can post job/internship listings |
| ✅ **Approval Flow** | Accounts require admin approval before going live |

### 🛡️ Admin Portal
| Feature | Description |
|---|---|
| 📊 **Analytics Dashboard** | User counts, event stats, pending approvals at a glance |
| 🏛️ **Club Approvals** | Review and approve/reject club account applications |
| 🏢 **Company Approvals** | Review and approve/reject recruiter account applications |
| 📅 **Event Moderation** | Approve or reject submitted events |
| 👥 **User Management** | Search, filter, change roles, delete users |
| 📣 **Announcements** | Broadcast messages to specific user groups |

---

## 🛠️ Tech Stack

### Frontend
```
React 18 + Vite          — UI framework & build tool
React Router v6          — Client-side routing
Axios                    — HTTP client
Framer Motion            — Animations
Vanilla CSS              — Styling (glassmorphism, dark mode)
Google Fonts (Syne, Inter) — Typography
```

### Backend
```
Python 3.11              — Runtime
FastAPI                  — REST API framework
Uvicorn                  — ASGI server
Firebase Admin SDK       — Firestore database
PyJWT / python-jose      — JWT authentication
Bcrypt                   — Password hashing
Google Generative AI     — Gemini AI integration
Groq                     — Fast LLM inference
```

### Infrastructure
```
Netlify                  — Frontend hosting
Render                   — Backend hosting
Firebase Firestore       — NoSQL database
```

---

## 📦 Dependencies (Pinned Versions)

### Backend — `requirements.txt`
```
fastapi==0.115.0
uvicorn==0.30.6
firebase-admin==6.5.0
python-jose[cryptography]==3.3.0
bcrypt==4.1.3
passlib==1.7.4
python-multipart==0.0.9
google-generativeai==0.8.3
groq==0.11.0
pydantic==2.9.2
httpx==0.27.2
```

### Frontend — `package.json`
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.26.2",
  "axios": "^1.7.7",
  "framer-motion": "^11.5.4",
  "vite": "^5.4.1"
}
```

---

## 🗂️ Project Structure

```
UniLink/
├── backend/
│   ├── main.py                  # FastAPI app entrypoint
│   ├── database.py              # Firebase/Firestore init
│   ├── config.py                # Environment config
│   ├── middleware/
│   │   └── auth_middleware.py   # JWT auth guards
│   ├── models/
│   │   ├── user.py              # User schema
│   │   ├── event.py             # Event schema
│   │   └── opportunity.py      # Opportunity schema
│   ├── routes/
│   │   ├── auth.py              # Signup, Login, Me
│   │   ├── admin.py             # Admin portal APIs
│   │   ├── events.py            # Events CRUD
│   │   ├── doubts.py            # Doubts forum
│   │   ├── opportunities.py    # Jobs/internships
│   │   ├── ai.py               # AI (Gemini/Groq)
│   │   ├── lost_found.py       # Lost & Found
│   │   ├── cofounders.py       # Co-Founder Finder
│   │   ├── status.py           # Campus Status
│   │   └── notifications.py    # Push notifications
│   └── services/
│       ├── auth_service.py     # JWT + bcrypt utils
│       └── gemini_service.py   # AI service layer
│
├── frontend/
│   ├── public/
│   │   └── sw.js               # Service Worker (PWA)
│   └── src/
│       ├── App.jsx              # Routes config
│       ├── api.js               # Axios instance + auth interceptor
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── AIBot.jsx
│       │   ├── UniLinkLogo.jsx
│       │   └── ExamCountdown.jsx
│       ├── pages/
│       │   ├── Admin.jsx        # ✨ Admin portal (NEW)
│       │   ├── Dashboard.jsx
│       │   ├── Events.jsx
│       │   ├── Doubts.jsx
│       │   ├── Opportunities.jsx
│       │   ├── Login.jsx
│       │   ├── Signup.jsx
│       │   ├── Settings.jsx
│       │   ├── MockInterview.jsx
│       │   ├── LostFound.jsx
│       │   ├── CoFounder.jsx
│       │   └── CampusStatus.jsx
│       └── services/
│           ├── geminiService.js
│           └── aiService.js
│
├── requirements.txt
├── render.yaml                  # Render deployment config
├── netlify.toml                 # Netlify deployment config
└── railway.toml                 # Railway deployment config
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- Firebase project with Firestore enabled

### 1. Clone the repo
```bash
git clone https://github.com/YashwantkumarPolaki/UniLink.git
cd UniLink
```

### 2. Backend setup
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt

# Add your Firebase credentials
# Place firebase_credentials.json in backend/
```

Create `backend/.env`:
```env
JWT_SECRET=your_secret_key
```

Run backend:
```bash
uvicorn main:app --reload --port 8000
```

### 3. Frontend setup
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:8000
VITE_GEMINI_KEY=your_gemini_api_key
VITE_GROQ_KEY=your_groq_api_key
```

Run frontend:
```bash
npm run dev
```

### 4. Open in browser
- **Frontend:** http://localhost:5173
- **Backend API docs:** http://localhost:8000/docs

---

## 🔐 User Roles

| Role | Signup | Approval Required | Capabilities |
|---|---|---|---|
| `student` | Free | ❌ No | Browse all content |
| `faculty` | Free | ❌ No | Browse + post doubts |
| `club` | Free | ✅ Yes (admin) | Post events, manage club profile |
| `company` | Free | ✅ Yes (admin) | Post opportunities |
| `admin` | Manual promotion | — | Full admin portal access |

---

## 🛡️ Admin Portal

Navigate to `/admin` (requires `admin` role).

**Tabs:**
- **📊 Dashboard** — Analytics overview + pending approvals alert
- **🏛️ Clubs** — Approve/reject club account applications
- **🏢 Companies** — Approve/reject company/recruiter applications  
- **📅 Events** — Moderate submitted events
- **👥 Users** — Manage all users, change roles
- **📣 Announcements** — Broadcast to user groups

---

## 🌐 Deployment

### Frontend (Netlify)
```toml
# netlify.toml
[build]
  base = "frontend"
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Backend (Render)
```yaml
# render.yaml
services:
  - type: web
    name: unilink-api
    runtime: python
    buildCommand: pip install -r backend/requirements.txt
    startCommand: uvicorn backend.main:app --host 0.0.0.0 --port $PORT
```

---

## 📸 Screenshots

> Admin Portal — Clubs & Companies Approval  
> Dark glassmorphism UI with real-time pending badge counts on sidebar tabs.

---

## 📄 License

MIT © 2026 Yashwant Kumar Polaki

---

## 🙌 Track

**WebDev Track** — Full-stack web application with React + FastAPI + Firebase

> Built for the UniLink submission — a real, production-ready campus super-app.
