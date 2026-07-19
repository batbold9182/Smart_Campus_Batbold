# Smart Campus System

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React Native](https://img.shields.io/badge/React_Native-61DAFB?style=flat&logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=flat&logo=expo&logoColor=white)](https://expo.dev/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat&logo=socket.io)](https://socket.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-DB00FF?style=flat&logo=cloudinary&logoColor=white)](https://cloudinary.com/)

**Smart Campus System** is a full-stack university management platform for students, faculty, and admins. It runs as a cross-platform mobile app (iOS, Android, Web) built with React Native/Expo, backed by a Node.js/Express REST API with real-time Socket.io communication.

---

## Features

### Authentication & Authorization
- JWT-based login and registration with role detection (admin / faculty / student)
- Tokens stored securely — SecureStore on native, AsyncStorage on web
- Automatic session expiry handling with redirect to login
- OTP-based password reset via email (nodemailer, 15-minute expiry)
- Password complexity enforcement (min 8 chars, uppercase, digit, special character)

### Role-Based Dashboards
- **Admin** — manage users, courses, enrollments, schedules, notifications
- **Faculty** — manage assignments, grades, attendance per course
- **Student** — view schedule, submit assignments, check grades and attendance

### Assignments & Grades
- Faculty create and delete assignments with file uploads (PDF, JPG, DOCX, up to 10 MB)
- Students submit files stored on Cloudinary; faculty can download submissions
- Grades recorded per student per course (0–6 scale) with pagination
- Cascade cleanup — deleting a course removes all related assignments, submissions, grades, and Cloudinary files

### Attendance
- Faculty record and update daily attendance per course session
- Students view their own attendance history
- No future-dated records; duplicate prevention via database unique constraint

### Real-Time Buddy Chats
- Three Socket.io namespaces: Lunch Buddy, Learning Buddy, Party Buddy
- Live presence tracking (online user count broadcast)
- Message history with cursor-based pagination
- XSS sanitization on all inbound messages
- Per-user (5 concurrent) and per-IP (20 total) connection rate limiting

### Notifications
- Admin sends bulk notifications to selected recipients
- Students/faculty see unread count badge; mark-as-read support

### Schedule Management
- Admin assigns courses to faculty with day/time/room
- Students enroll in specific schedule slots
- Time format normalisation (e.g. "9:00" → "09:00") prevents duplicate slots

### Online Library
- Search books via OpenLibrary API

### Offline & Network Handling
- Animated offline banner appears when network is lost
- Reconnects and refreshes data automatically on reconnect

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React Native, Expo (file-based routing via Expo Router) |
| State management | Zustand, TanStack Query |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Real-time | Socket.io |
| File storage | Cloudinary |
| Authentication | JWT (jsonwebtoken) |
| Email / OTP | Nodemailer |
| Error tracking | Sentry |
| API docs | Swagger / OpenAPI (`/api/docs` in dev) |
| Other | Axios, compression, Morgan, Helmet, express-rate-limit |

---

## Project Structure

```
smart-campus/
├── backend/
│   ├── config/          # DB, Cloudinary, Swagger, academic hierarchy
│   ├── middleware/       # Auth, role, validation, socket auth, rate limit, error handler
│   ├── models/          # Mongoose schemas (admin, faculty, student domains)
│   ├── routes/          # REST endpoints grouped by domain
│   ├── socket/          # Socket.io namespace handlers
│   └── utils/           # Shared date utilities
└── frontend/
    ├── app/             # Expo Router screens (auth, admin, faculty, student)
    ├── components/      # Shared UI components and design-system (ui/)
    ├── config/          # Axios instance (clientAPI.ts)
    ├── constants/       # App-wide constants
    ├── contexts/        # Auth and Theme context providers
    ├── hooks/           # Custom hooks (socket lifecycle, network, auth guard)
    ├── services/        # API call functions per domain
    ├── store/           # Zustand stores (user, notifications, schedule)
    ├── styles/          # Design tokens (colors, spacing, radius)
    ├── types/           # TypeScript interfaces
    └── utils/           # Logger, haptics
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally or a MongoDB Atlas URI
- Cloudinary account
- Gmail account (for OTP emails)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/smart-campus.git
cd smart-campus
```

### 2. Install dependencies
```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 3. Configure environment variables

**`backend/.env`**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/smart_campus
JWT_SECRET=<min 32 character random string>
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
EMAIL_SERVICE=gmail
EMAIL_USER=
EMAIL_PASS=
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081
SENTRY_DSN=
```

**`frontend/.env`**
```
EXPO_PUBLIC_API_URL=http://<your-machine-lan-ip>:5000
```

> For a physical device, use your machine's LAN IP (e.g. `192.168.1.x`), not `localhost`.

### 4. Run

```bash
# Backend (port 5000)
cd backend && node server.js

# Frontend
cd frontend && npm start        # Expo dev server
# or
cd frontend && npm run web      # Browser
cd frontend && npm run android  # Android emulator/device
cd frontend && npm run ios      # iOS simulator
```

API documentation is available at `http://localhost:5000/api/docs` when the backend is running in development mode.

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Backend port (default 5000) |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Min 32 characters — server exits on startup if missing or too short |
| `JWT_EXPIRES_IN` | No | Token TTL (default `7d`) |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary account name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |
| `EMAIL_SERVICE` | No | Nodemailer service (default `gmail`) |
| `EMAIL_USER` | Yes | Email address for OTP sending |
| `EMAIL_PASS` | Yes | App password for email account |
| `ALLOWED_ORIGINS` | Yes | Comma-separated CORS origins |
| `SENTRY_DSN` | No | Sentry DSN for error tracking |
| `RATE_LIMIT_WINDOW_MS` | No | Rate limit window in ms (default 15 min) |
| `RATE_LIMIT_MAX` | No | Max requests per window on data routes (default 600, keyed per user) |
| `LIBRARY_RATE_LIMIT_MAX` | No | Max OpenLibrary searches per window (default 30) |
| `AUTH_RATE_LIMIT_MAX` | No | Max auth requests per window, IP-keyed (default 15) |
| `OTP_RATE_LIMIT_MAX` | No | Max OTP requests per window, email-keyed (default 5) |
| `TRUST_PROXY_HOPS` | No | Number of reverse proxies in front of the server (default 0). Set to 1 behind nginx / a load balancer / a PaaS router. Never set to `true` — that lets clients forge `X-Forwarded-For` and evade rate limits |
| `RESET_TOKEN_TTL_MINUTES` | No | OTP expiry in minutes (default 15) |
| `MAX_UPLOAD_BYTES` | No | Max upload size in bytes (default 10 MB) |
