<div align="center">

# 🧠 Smart Interview Assistant

**AI-Powered Interview Preparation Platform for the 2026 Job Market**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://typescriptlang.org)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js)](https://nodejs.org)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?logo=openai)](https://openai.com)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://prisma.io)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

---

## 🎯 What Makes This Different

Most interview prep tools are static — flashcards, YouTube videos, or basic Q&A bots. **Smart Interview Assistant** is built for the **AI era of 2026**, where interviewers test real engineering judgment, not memorized definitions.

- 🤖 **AI-Era Questions** — No textbook "What is X?" questions. Every question tests production debugging, architecture trade-offs, and AI-literacy
- 🧠 **Real-Time AI Coach** — Get directional hints during interviews without revealing the answer
- 🎯 **STAR-L Behavioral Mode** — Dedicated behavioral interview with per-component scoring (Situation/Task/Action/Result/Learning)
- ⏱️ **Pressure Mode** — Countdown timer with auto-submit to simulate real interview time pressure
- 📊 **Interview Readiness Score** — Composite 0-100 score across 5 dimensions like a "credit score" for interview prep
- 🏆 **Gamification** — Daily streaks, XP system, 10 levels, and achievement badges
- 🏢 **Company-Specific Prep** — Tailored interviews for Google, Amazon, Microsoft, Meta, and more
- 📄 **JD → Interview Pipeline** — Paste any job description, get a custom-tailored interview
- 🔍 **5-Dimension ATS Resume Analyzer** — Keyword match, sections, formatting, quantification, and length optimization
- 📝 **AI Resume Generator** — Industry-level, ATS-optimized resume based on your performance data

---

## ✨ Features

### 🔐 Authentication
- Secure JWT-based login & registration
- Password hashing with bcryptjs
- Protected routes on frontend & backend

### 🤖 AI Mock Interview (2026 Edition)
- Choose any topic (React, Python, System Design, DSA, etc.)
- Select difficulty (Easy / Medium / Hard)
- AI generates **real-world, scenario-based** questions — production debugging, scaling, trade-offs
- AI evaluates answers using **4-dimension scoring**: Technical Accuracy, Practical Depth, Communication, AI-Era Thinking
- Every question tests skills an AI tool can't fake for you

### 🧠 Real-Time AI Coach (Hint System)
- Click "Need a Hint?" during any question
- AI provides directional nudges without revealing the answer
- Hints tracked per interview — shows how self-sufficient you are

### 🎯 Behavioral Interview (STAR-L Framework)
- 6 focus areas: Adaptability, AI-Era Judgment, Leadership, Conflict, Ambiguity, General
- AI evaluates each STAR-L component separately (Situation, Task, Action, Result, Learning — 2 pts each)
- Visual breakdown bars for each component
- Tips panel with 2026-era behavioral interview strategies

### ⏱️ Pressure Mode (Timed Interview)
- Toggle countdown timer: 2, 3, or 5 minutes per question
- Auto-submit when time expires
- Visual timer with color changes (green → amber → red pulse)
- Simulates real interview time pressure

### 🏢 Company-Specific Interview
- 9 companies: Google, Amazon, Microsoft, Meta, Apple, Netflix, TCS, Infosys, Wipro
- Company-specific interview patterns and insider tips
- Role-specific questions

### 📄 JD → Interview Pipeline
- Paste any job description
- AI extracts niche skills and requirements
- Generates custom-tailored interview questions

### 📊 Interview Readiness Score
- Composite 0-100 readiness metric across 5 dimensions:
  - **Topic Breadth** (20%): How many topics practiced
  - **Average Score** (30%): Overall performance
  - **Consistency** (20%): Daily streak-based
  - **Volume** (15%): Total interviews completed
  - **Weak Topics** (15%): Fewer weak areas = better
- Visual circular gauge with actionable recommendations
- Labels: Just Starting → Building Foundation → Getting There → Interview Ready → Ready to Crush It

### 🏆 Gamification System
- **Daily Streaks**: Consecutive practice day tracking
- **XP System**: Earn XP for interviews, high scores, streaks, and badges
- **10 Levels**: Progress from Level 1 to Level 10 (5000 XP)
- **Achievement Badges**: First Interview, 7-Day Warrior, Perfect 10, Resume Pro, and more
- **Dashboard Widget**: Visual streak counter, XP progress bar, badge showcase

### 🔍 Resume Analyzer
- **5-Dimension ATS Score** (0-100): Keyword match, section completeness, formatting, quantification, length
- PDF upload with auto-text extraction
- AI-powered improvement suggestions
- Industry-level ATS scoring aligned with 2026 recruiter expectations

### 📝 AI Resume Generator
- Generates ATS-optimized, industry-level Markdown resume
- Based on your mock interview performance data
- Optional target role and company customization
- 2026 standards: Action + Result format, quantified metrics, AI literacy emphasis

### 📈 Dashboard & Analytics
- Score trend charts (Recharts)
- Topic proficiency bars
- Daily practice suggestion (weakest topic)
- Recent sessions overview

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS, Recharts, Framer Motion |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | PostgreSQL + Prisma ORM |
| **AI Engine** | OpenAI GPT-4o-mini with structured JSON output |
| **Security** | Helmet.js, express-rate-limit, JWT, bcryptjs |
| **Logging** | Winston |
| **Docs** | Swagger UI |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- OpenAI API key

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/smart-interview-assistant.git
cd smart-interview-assistant

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

**Backend** (`backend/.env`):
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/interview_db"
JWT_SECRET="your-jwt-secret-key"
OPENAI_API_KEY="sk-your-openai-key"
PORT=5000
FRONTEND_URL="http://localhost:5173"
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL="http://localhost:5000/api"
```

### 3. Database Setup

```bash
cd backend
npx prisma generate
npx prisma db push
```

### 4. Run

```bash
# Backend (Terminal 1)
cd backend && npm run dev

# Frontend (Terminal 2)
cd frontend && npm run dev
```

Open `http://localhost:5173` — register and start practicing!

---

## 📁 Project Structure

```
smart-interview-assistant/
├── backend/
│   ├── prisma/schema.prisma          # Database models
│   ├── src/
│   │   ├── config/                   # DB & env configuration
│   │   ├── controllers/              # Request handlers
│   │   ├── middlewares/              # Auth, validation, rate-limit, cache
│   │   ├── models/                   # Zod schemas & interfaces
│   │   ├── repositories/            # Database operations
│   │   │   ├── interview.repository.ts
│   │   │   ├── progress.repository.ts
│   │   │   ├── streak.repository.ts  # Gamification logic
│   │   │   └── user.repository.ts
│   │   ├── routes/                   # API route definitions
│   │   ├── services/                 # Business logic
│   │   │   ├── ai.service.ts         # OpenAI integration (850+ lines)
│   │   │   ├── interview.service.ts
│   │   │   ├── resume.service.ts
│   │   │   └── progress.service.ts
│   │   └── utils/                    # Logger, error handling, helpers
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatBox.tsx           # Interview UI with hints + timer
│   │   │   └── Layout.tsx            # Sidebar navigation
│   │   ├── context/AuthContext.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx         # Analytics + readiness + streak
│   │   │   ├── Interview.tsx         # Mock interview with pressure mode
│   │   │   ├── BehavioralInterview.tsx  # STAR-L framework
│   │   │   ├── CompanyInterview.tsx
│   │   │   ├── JDInterview.tsx
│   │   │   ├── ResumeAnalyzer.tsx
│   │   │   └── ChatHistory.tsx
│   │   └── services/api.ts
│   └── package.json
└── README.md
```

---

## 🗺 Roadmap

- [x] AI Mock Interview with real-world questions
- [x] STAR-L Behavioral Interview mode
- [x] Real-time AI Coach (hint system)
- [x] Timed Pressure Mode
- [x] Interview Readiness Score
- [x] Streak & XP gamification system
- [x] Achievement badges
- [x] Company-specific interviews
- [x] JD → Interview pipeline
- [x] 5-dimension ATS resume analyzer
- [x] AI resume generator
- [ ] Voice Interview Mode (Whisper API)
- [ ] Dark Mode (system-preference aware)
- [ ] Google OAuth
- [ ] Interview Report PDF export
- [ ] PWA support
- [ ] Email notifications

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <sub>Built with ❤️ for interview preparation in the AI era</sub>
</div>
