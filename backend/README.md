# Fake Job Detection — Backend API
> **Tagline:** “Detect Fake Jobs Before They Detect You”  
> **Backend Stack:** Node.js • Express.js • Supabase PostgreSQL • JWT • ES Modules

---

## 📌 Problem Statement
Online job fraud has surged dramatically, with malicious actors advertising fake employment opportunities to solicit upfront fees, harvest banking and identity credentials, or exploit candidates as unwitting money mules. Job seekers need an automated, multi-modal verification platform that analyzes recruitment descriptions, career portal URLs, advertisement screenshots, and recruiter calls before they disclose personal information.

---

## 🏗️ Backend Architecture

```
   ┌──────────────────────────────────────────────┐
   │         React Frontend (Client App)          │
   └──────────────────────┬───────────────────────┘
                          │ HTTP REST / JSON (Bearer JWT)
   ┌──────────────────────▼───────────────────────┐
   │             Express.js Gateway               │
   │      (Helmet, CORS, Rate Limit, Multer)      │
   └──────────────────────┬───────────────────────┘
                          │
       ┌──────────────────┼──────────────────┐
       │                  │                  │
┌──────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐
│ Auth Service│    │Analysis Svc │    │Dashboard Svc│
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │
       │           ┌──────▼────────┐         │
       │           │Detector Engine│         │
       │           │(Rule / ML API)│         │
       │           └──────┬────────┘         │
       │                  │                  │
   ┌───▼──────────────────▼──────────────────▼────┐
   │            Supabase PostgreSQL               │
   │    (users, analyses, indicators tables)      │
   └──────────────────────────────────────────────┘
```

---

## 📁 Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── env.js                     # Environment variable validation & config
│   │   └── supabase.js                # Supabase client instantiation
│   ├── controllers/
│   │   ├── authController.js          # Register, login, get current user
│   │   ├── analysisController.js      # Multi-modal analysis handlers & history CRUD
│   │   ├── dashboardController.js     # Aggregate stats (total, low, medium, high)
│   │   └── userController.js          # Profile view & update
│   ├── routes/
│   │   ├── authRoutes.js              # /api/auth
│   │   ├── analysisRoutes.js          # /api/analysis
│   │   ├── dashboardRoutes.js         # /api/dashboard
│   │   └── userRoutes.js              # /api/users
│   ├── middleware/
│   │   ├── authMiddleware.js          # Bearer JWT verification & req.user attachment
│   │   ├── errorMiddleware.js         # Centralized error handler (400, 401, 403, 404, 500)
│   │   ├── uploadMiddleware.js        # Multer with file type & size validation
│   │   └── validationMiddleware.js    # Request body validator runner
│   ├── services/
│   │   ├── authService.js             # Password hashing (bcrypt) & JWT operations
│   │   ├── analysisService.js         # DB operations for analyses & indicators
│   │   ├── detectorService.js         # Modular rule-based scam detection engine
│   │   ├── urlAnalysisService.js      # URL safety & SSRF prevention
│   │   ├── imageAnalysisService.js    # Image file validation & OCR interface
│   │   └── voiceAnalysisService.js    # Audio validation & STT transcription interface
│   ├── validators/
│   │   ├── authValidator.js           # Registration & login schemas
│   │   └── analysisValidator.js       # Text & URL input schemas
│   ├── utils/
│   │   ├── trustScore.js              # 0-100 Trust Score & Risk Level calculation
│   │   ├── response.js                # Standardized JSON response utilities
│   │   └── logger.js                  # Request logging & formatters
│   ├── app.js                         # Express app, Helmet, CORS, Rate Limit, Routes
│   └── server.js                      # Server startup & /api/health endpoint
├── tests/
│   ├── auth.test.js                   # Auth & validation tests
│   ├── detector.test.js               # Rule-based detector tests
│   ├── url.test.js                    # SSRF and URL validation tests
│   └── runAllTests.js                 # Complete test runner
├── uploads/                           # Destination directory for incoming multipart files
├── schema.sql                         # Supabase PostgreSQL schema with tables, indexes & RLS
├── .env.example                       # Documented environment template
├── .env                               # Local development configuration
├── .gitignore                         # Git exclusion rules
├── package.json                       # ES modules, dependencies & scripts
└── README.md                          # Complete documentation
```

---

## 🗄️ Database Setup (Supabase PostgreSQL)

1. Create a free project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Paste and execute the contents of [`schema.sql`](./schema.sql).

### Database Schema Overview:
- **`users` Table:** `id` (UUID primary key), `name`, `email` (unique index), `password_hash`, `created_at`, `updated_at`.
- **`analyses` Table:** `id` (UUID), `user_id` (foreign key `users.id` with `ON DELETE CASCADE`), `input_type` (`text`, `url`, `image`, `voice`), `input_text`, `input_url`, `image_path`, `transcription`, `trust_score` (0–100), `risk_level` (`LOW`, `MEDIUM`, `HIGH`), `prediction`, `explanation`, `created_at`.
- **`indicators` Table:** `id` (UUID), `analysis_id` (foreign key `analyses.id` with `ON DELETE CASCADE`), `indicator`, `severity` (`LOW`, `MEDIUM`, `HIGH`), `description`, `created_at`.
- **Row Level Security (RLS):** Enabled on all tables.

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

| Variable | Description | Default / Example |
|---|---|---|
| `PORT` | HTTP port for Express | `5000` |
| `NODE_ENV` | Environment mode | `development` / `production` |
| `FRONTEND_URL` | Allowed origin for CORS | `http://localhost:3000` |
| `SUPABASE_URL` | Your Supabase Project URL | `https://xxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Public Anon key | `eyJhb...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret Service Role key | `eyJhb...` |
| `JWT_SECRET` | Secret key for signing JWTs | Minimum 32 characters |
| `JWT_EXPIRES_IN` | Token validity duration | `7d` |
| `MAX_FILE_SIZE_MB` | Upload file size limit | `10` |

---

## 🚀 Installation & Running

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Run in Development Mode (with hot reload)
```bash
npm run dev
```

### 3. Run in Production Mode
```bash
npm start
```

### 4. Run Test Suite
```bash
npm test
```

---

## 📡 API Endpoints Reference

### Health
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | No | Server status & environment health |

### Authentication (`/api/auth`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Register new user account |
| `POST` | `/api/auth/login` | No | Authenticate user & receive JWT |
| `GET` | `/api/auth/me` | Yes | Get currently authenticated user profile |

### Multi-Modal Analysis (`/api/analysis`)
| Method | Endpoint | Auth | Format | Description |
|---|---|---|---|---|
| `POST` | `/api/analysis/text` | Yes | JSON | Analyze raw job description text |
| `POST` | `/api/analysis/url` | Yes | JSON | Analyze job posting URL (with SSRF protection) |
| `POST` | `/api/analysis/image` | Yes | multipart/form-data | Upload job flyer/ad image (field: `image`) |
| `POST` | `/api/analysis/voice` | Yes | multipart/form-data | Upload recruiter call audio (field: `audio`) |
| `GET` | `/api/analysis/history` | Yes | JSON | List current user's scan history |
| `GET` | `/api/analysis/:id` | Yes | JSON | Retrieve detailed report by ID |
| `DELETE` | `/api/analysis/:id` | Yes | JSON | Delete user-owned report |

### Dashboard & Profile (`/api/dashboard`, `/api/users`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/stats` | Yes | Aggregate stats (total, low, medium, high risk counts) |
| `GET` | `/api/users/me` | Yes | View user profile |
| `PUT` | `/api/users/me` | Yes | Update user profile name/email |

---

## 🧪 Example API Requests

### 1. Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Sreya", "email": "sreya@example.com", "password": "password123"}'
```

### 2. Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "sreya@example.com", "password": "password123"}'
```

### 3. Analyze Job Text (Protected)
```bash
curl -X POST http://localhost:5000/api/analysis/text \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"text": "URGENT HIRING: Data entry from home. Earn $5,000/week no experience. Contact @recruiter on Telegram. Registration fee of $150 required via wire transfer."}'
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "input_type": "text",
    "trust_score": 25,
    "risk_level": "HIGH",
    "prediction": "SUSPICIOUS",
    "indicators": [
      {
        "indicator": "Advance Registration or Training Fee",
        "severity": "HIGH",
        "description": "The job posting asks the applicant for upfront payment, registration fees, training charges, or equipment deposits."
      },
      {
        "indicator": "Unrealistic or Exaggerated Salary",
        "severity": "HIGH",
        "description": "Promises disproportionately high earnings for entry-level work with zero experience required."
      },
      {
        "indicator": "Suspicious / Anonymous Communication Channel",
        "severity": "MEDIUM",
        "description": "Directs candidates to communicate exclusively over anonymous encrypted messengers or unverified personal emails."
      }
    ],
    "explanation": "High risk detected! This job opportunity exhibits characteristics strongly associated with fraudulent recruitment (Advance Registration or Training Fee, Unrealistic or Exaggerated Salary). Never transfer funds or disclose banking information."
  }
}
```

---

## 🛡️ Security Implementation
1. **SSRF Protection (`urlAnalysisService.js`):** Blocks local network access (`localhost`, `127.0.0.1`, `::1`), private ranges (`10.x.x.x`, `172.16-31.x.x`, `192.168.x.x`), and cloud metadata APIs (`169.254.169.254`).
2. **Password Security:** Salted hashing with `bcrypt` (never plaintext).
3. **Authentication Isolation:** Every analysis and history item query is scoped by `user_id = req.user.id` verified from the signed JWT. Users cannot view or delete others' reports.
4. **Helmet & Rate Limiting:** HTTP security headers and rate limiter (200 requests / 15 minutes).
5. **No Secrets Exposed:** Service-role keys and stack traces are suppressed in API responses.

---

## 🤖 Replacing Demo Detector with a Real Machine Learning Model
The AI detection architecture is decoupled inside [`src/services/detectorService.js`](./src/services/detectorService.js).

To plug in a trained machine learning model in the future:
1. Open [`src/services/detectorService.js`](./src/services/detectorService.js).
2. Keep the `analyzeJob(text)` function signature.
3. Replace the rule matching loop with your ML inference call (e.g. calling a Python FastAPI model endpoint or TensorFlow/ONNX model):
```javascript
export async function analyzeJob(text) {
  // Call your trained ML microservice
  const response = await fetch('http://ml-model:8000/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  const mlOutput = await response.json();
  
  return {
    engine: 'BERT-Fraud-Classifier v2.0',
    trust_score: mlOutput.trust_score,
    risk_level: mlOutput.risk_level,
    prediction: mlOutput.prediction,
    indicators: mlOutput.indicators,
    explanation: mlOutput.explanation
  };
}
```
**No controllers, routes, or database schemas will need to be changed!**
