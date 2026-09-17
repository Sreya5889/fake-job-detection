# Fake Job Detection

> **Tagline:** “Detect Fake Jobs Before They Detect You”

---

## 📌 Project Overview
**Fake Job Detection** is a full-stack cybersecurity platform designed to protect job seekers from fraudulent employment scams, phishing portals, advance-fee schemes, and identity theft.

### Available Major Features:
1. **User Authentication & Profiles:** Secure registration and login with bcrypt password hashing, JWT authorization, and profile management.
2. **Text Analysis:** Scans job descriptions for linguistic red flags, unrealistic salary claims, urgency tactics, and upfront registration fee demands.
3. **URL Analysis:** Checks career portal domains for spoofing, deceptive subdomains, suspicious TLDs, and domain registration age with SSRF protection.
4. **Image Analysis (OCR):** Accepts flyers, social media ads, WhatsApp recruitment screenshots, and offer letters for automated text extraction via Tesseract OCR and risk classification.
5. **Voice Analysis (Speech-to-Text):** Accepts recruiter voice clips and phone recordings to identify verbal fraud patterns, coercion, and informal payment requests.
6. **Analysis History & Reports:** Searchable, filterable history isolated per user with individual report viewing and deletion.
7. **Security Dashboard:** Real-time analytics, safe vs. high-risk breakdown, and aggregate threat metrics.

---

## 🏗️ Technology Stack

- **Frontend:** React (JavaScript, HTML5, CSS3, Vite, React Router DOM, Lucide React)
- **Backend:** Node.js, Express.js (REST API, JWT Authentication, Multer, Helmet, CORS, Tesseract.js)
- **Database:** Supabase (Cloud PostgreSQL, Row Level Security, Indexes, Cascading Foreign Keys)

---

## 🌐 URLs

- **Frontend URL:** `http://localhost:5173`
- **Backend URL:** `http://localhost:5000`
- **Backend Health Check:** `http://localhost:5000/api/health`

---

## 🚀 Setup Instructions

### 1. Clone or Open the Project
```bash
cd hireguard
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Install Backend Dependencies
```bash
cd backend
npm install
cd ..
```

### 4. Configure Backend Environment Variables
Create or edit `backend/.env`:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
JWT_SECRET=your_jwt_secret_key_at_least_32_chars
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE_MB=10
```

### 5. Configure Frontend API URL
Create or edit `.env` in the root directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_USE_MOCK=false
```

### 6. Configure Supabase Database
1. Create a project on [Supabase](https://supabase.com).
2. Open the **SQL Editor** in your Supabase project dashboard.
3. Run the SQL schema from `backend/database/schema.sql`.
4. Copy your project **URL** and **service_role key** from **Project Settings → API** into `backend/.env`.

### 7. Start Backend Server
```bash
cd backend
npm start
```
*Backend runs at `http://localhost:5000`.*

### 8. Start Frontend Application
In a separate terminal window:
```bash
npm run dev
```
*Frontend runs at `http://localhost:5173`.*

---

## 🔒 Security Features
- **Password Security:** Salted bcrypt hashing (`$2a$10$...`) with plain-text never persisted or returned.
- **JWT Protection:** Signed tokens required on all protected analysis, history, dashboard, and user endpoints.
- **Data Isolation:** User analyses are strictly partitioned by authenticated user ID with cross-user access denied (`403 Forbidden`).
- **Input Validation & Sanitization:** Strict schemas for text, URLs, and multipart file uploads (size limits and MIME type enforcement).
- **CORS Protection:** Preflight `OPTIONS` allowed with explicit methods, headers, and credentials support.
