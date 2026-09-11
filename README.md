# Fake Job Detection — AI-Powered Cybersecurity Platform
> **Tagline:** “Detect Fake Jobs Before They Detect You”

---

## 📌 Project Overview
**Fake Job Detection** is a modern, responsive cybersecurity and AI-powered web application designed to protect job seekers from fraudulent employment scams, phishing portals, advance-fee schemes, and identity theft.

The system allows candidates to evaluate potential job listings across **4 multi-modal input channels**:
1. **Text Analysis:** Scans job descriptions for linguistic red flags, unrealistic salary claims, urgency tactics, and upfront registration fee demands.
2. **URL Analysis:** Checks career portal domains for spoofing, deceptive subdomains, suspicious TLDs, and domain registration age.
3. **Image Analysis (OCR Ready):** Accepts flyers, social media ads, WhatsApp recruitment screenshots, and offer letters for automated text extraction and risk analysis.
4. **Voice Analysis (Audio Transcription Ready):** Enables in-browser recording of recruiter phone calls and voicemails to detect coercion and informal payment requests.

---

## 🏗️ Architecture & Technology Stack

```
   ┌──────────────────────────────────────────────┐
   │         React Frontend (Client App)          │
   │   (Vite + React Router + CSS3 Design System) │
   └──────────────────────┬───────────────────────┘
                          │
                     REST / JSON
                          │
   ┌──────────────────────▼───────────────────────┐
   │         Node.js + Express Backend            │
   │    (API Gateway, AI Models, OCR & Speech)    │
   └──────────────────────┬───────────────────────┘
                          │
   ┌──────────────────────▼───────────────────────┐
   │             Supabase Database                │
   │   (PostgreSQL, Authentication & Storage)     │
   └──────────────────────────────────────────────┘
```

### Technology Breakdown
- **Frontend Framework:** React (Functional Components & Hooks)
- **Routing:** React Router DOM (Single Page Application with Protected Routes)
- **Styling:** Vanilla CSS3 Design System with CSS variables, Glassmorphism, and Cyber/AI dark mode palette
- **Icons:** Lucide React
- **API Layer:** Modular REST client in `src/services/api.js` with integrated heuristic fallback in `src/services/mockApi.js`
- **Audio:** Native Web Audio & `MediaRecorder` API
- **Build Tool:** Vite

---

## 🚀 Getting Started

### 1. Installation
```bash
cd hireguard
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`

### 3. Production Build
```bash
npm run build
```

---

## 🔄 Connecting to the Node.js Backend

The frontend is pre-configured to communicate with the Node.js backend. In `src/services/api.js`:
- Base URL: `http://localhost:5000/api` (configurable via `VITE_API_URL`)
- Toggle Mock Mode: Set `VITE_USE_MOCK=false` in `.env` or run against a live server.

### Backend Endpoints Expected:
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Authenticate user & return JWT |
| `GET` | `/api/auth/me` | Fetch active user profile |
| `POST` | `/api/analysis/text` | Submit job description text for AI evaluation |
| `POST` | `/api/analysis/url` | Submit career URL for domain threat analysis |
| `POST` | `/api/analysis/image` | Submit image screenshot for OCR & AI analysis |
| `POST` | `/api/analysis/voice` | Submit audio recording blob for voice fraud analysis |
| `GET` | `/api/analysis/history` | Retrieve user scan history |
| `GET` | `/api/analysis/:id` | Fetch specific scan report |
| `DELETE` | `/api/analysis/:id` | Delete scan from history |
| `GET` | `/api/dashboard/stats` | Retrieve aggregate statistics and threat distributions |

---

## 🎓 Viva & Presentation Talking Points
1. **Multi-Modal Threat Detection:** Demonstrates handling varied real-world data types (text, URL, images, and audio).
2. **Explainable AI (XAI):** Rather than giving a simple "yes/no", the system outputs a 0–100 Trust Score, categorized severity cards, and clear human-readable explanations.
3. **Safety & Ethical AI:** Contains explicit disclaimers clarifying that the system provides heuristic risk estimation to empower candidate diligence, avoiding absolute liability claims.
4. **Separation of Concerns:** Component UI never directly makes low-level fetch requests; all network activity flows through the dedicated `services/api.js` abstraction.
