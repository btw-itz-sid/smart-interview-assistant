<div align="center">

# 🎯 Smart Interview Assistant

### AI-Powered Mock Interview Platform for Students & Job Seekers

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?style=flat-square&logo=openai&logoColor=white)](https://openai.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

**Practice interviews. Analyze your resume. Track your growth. Land the job.**

[Features](#-features) · [Tech Stack](#-tech-stack) · [Quick Start](#-quick-start) · [API Docs](#-api-documentation) · [Screenshots](#-screenshots)

</div>

---

## 🌟 Why Smart Interview Assistant?

Most interview prep tools are static — flashcards, YouTube videos, or basic Q&A bots. **Smart Interview Assistant** is a full-stack, AI-powered platform that:

- 🤖 **Generates personalized questions** based on topic + difficulty using GPT-4o-mini
- 📊 **Evaluates your answers** with detailed feedback and a score (0–10)
- 🔍 **Analyzes your resume** with a real ATS score, keyword gap analysis, and improvement tips
- 📈 **Tracks your progress** over time across every topic you practice
- 🏢 **Simulates company-specific interviews** for Google, Amazon, Microsoft, TCS, Infosys and more
- 📄 **Parses Job Descriptions** to create a tailored interview session in seconds
- 🎤 **Supports Voice Mode** — speak your answer and get AI feedback

---

## ✨ Features

### 🔐 Authentication
- Secure JWT-based login & registration
- Password hashing with bcryptjs
- Protected routes on frontend & backend

### 🤖 AI Mock Interview
- Choose any topic (React, Python, System Design, DSA, etc.)
- Set difficulty: Easy / Medium / Hard
- AI generates 3–10 targeted questions
- Submit answers → instant AI evaluation with score + detailed feedback
- Full Q&A session saved to history

### 🏢 Company-Specific Mode *(New)*
- Select target companies: Google, Amazon, Microsoft, Flipkart, TCS, Wipro, and more
- AI generates questions matching each company's known interview patterns
- Company-specific tips panel alongside your session

### 📄 JD-to-Interview Pipeline *(New)*
- Paste any Job Description
- AI extracts required skills and keywords automatically
- Generates a custom interview tailored to that exact role

### 📊 Advanced ATS Resume Analyzer
- Paste resume text or upload PDF
- **ATS Score (0–100)** across 5 dimensions:
  - Keyword Match (vs. JD or role keywords)
  - Section Completeness (Contact, Summary, Experience, Education, Skills)
  - Formatting Quality (bullets, length, readability)
  - Quantification Score (numbers/metrics in bullets)
  - Length Optimization
- Missing keyword highlights
- AI-powered improvement suggestions (3–5 specific tips)
- Interview topic suggestions based on resume content

### 📈 Progress Dashboard
- Total interviews, average score, sessions this week
- Topic-wise proficiency bars
- **Score trend charts** (line chart over time) *(New)*
- **Skill radar chart** across all practiced topics *(New)*
- Daily practice recommendation widget *(New)*
- Recent sessions quick-view

### 📚 Interview History
- Full Q&A transcript for every past session
- Score breakdown per question
- Filter by topic, date, score

### 🏆 Streak & Badges *(New)*
- Daily practice streak counter
- Milestone badges: "7-Day Warrior", "Perfect 10", "Resume Pro"
- XP points system

### 🌙 Dark Mode *(New)*
- Full system-preference-aware dark mode

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS |
| **Charts** | Recharts |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | PostgreSQL + Prisma ORM |
| **AI Engine** | OpenAI GPT-4o-mini (questions, evaluation, resume) |
| **Auth** | JWT + bcryptjs |
| **Validation** | Zod |
| **Rate Limiting** | express-rate-limit |
| **Security** | Helmet.js |
| **API Docs** | Swagger UI + swagger-jsdoc |
| **Caching** | node-cache |
| **Logging** | Winston |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- OpenAI API Key

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/smart-interview-assistant.git
cd smart-interview-assistant
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Copy env file and fill in values
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/smart_interview_db"
JWT_SECRET="your-super-secret-jwt-key-here"
OPENAI_API_KEY="sk-your-openai-key-here"
PORT=5000
NODE_ENV=development
```

```bash
# Run database migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# Start backend dev server
npm run dev
```

Backend runs at: `http://localhost:5000`
API Docs at: `http://localhost:5000/api/docs`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start frontend dev server
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 📁 Project Structure

```
smart-interview-assistant/
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # DB models: User, Interview, Question, Progress
│   │   └── migrations/          # Auto-generated migrations
│   └── src/
│       ├── controllers/         # Request handlers
│       │   ├── ai.controller.ts
│       │   ├── auth.controller.ts
│       │   ├── interview.controller.ts
│       │   ├── progress.controller.ts
│       │   └── resume.controller.ts
│       ├── services/            # Business logic
│       │   ├── ai.service.ts    # GPT-4o-mini wrapper
│       │   ├── auth.service.ts  # JWT + bcrypt
│       │   ├── interview.service.ts
│       │   ├── progress.service.ts
│       │   └── resume.service.ts
│       ├── routes/              # Express route definitions
│       ├── middlewares/         # auth, cache, error, rateLimit, validate
│       ├── repositories/        # Prisma DB queries
│       ├── utils/               # ApiError, logger, scoreCalculator
│       ├── types/               # TypeScript interfaces
│       ├── docs/                # Swagger spec
│       ├── app.ts               # Express app setup
│       └── server.ts            # Entry point
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── Dashboard.tsx      # Analytics overview
        │   ├── Interview.tsx      # Mock interview session
        │   ├── ResumeAnalyzer.tsx # ATS analysis
        │   ├── ChatHistory.tsx    # Past sessions
        │   ├── CompanyInterview.tsx  # Company-specific mode
        │   ├── JDInterview.tsx       # JD-to-Interview pipeline
        │   └── Login.tsx / Register.tsx
        ├── components/
        │   ├── Layout.tsx         # Sidebar + topbar shell
        │   ├── ChatBox.tsx        # Interview Q&A UI
        │   └── AppLogo.tsx
        ├── context/
        │   └── AuthContext.tsx    # Global auth state
        └── services/
            └── api.ts             # Axios instance
```

---

## 🔌 API Documentation

Full interactive docs available at: **`http://localhost:5000/api/docs`**

### Key Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login, get JWT | ❌ |
| POST | `/api/ai/interview/start` | Start mock interview | ✅ |
| POST | `/api/ai/interview/answer` | Submit & evaluate answer | ✅ |
| GET | `/api/ai/interview/history` | Get all past interviews | ✅ |
| POST | `/api/resume/analyze` | Analyze resume + ATS score | ✅ |
| POST | `/api/resume/suggest-topics` | Topics to practice from resume | ✅ |
| POST | `/api/resume/generate` | Generate AI resume | ✅ |
| GET | `/api/progress/analytics` | Dashboard analytics | ✅ |
| GET | `/api/progress/topics` | Topic-wise progress | ✅ |
| POST | `/api/ai/company-interview` | Company-specific interview | ✅ |
| POST | `/api/ai/jd-interview` | JD-to-Interview pipeline | ✅ |

---

## 📊 ATS Score Breakdown

| Dimension | Max Points | What's Checked |
|-----------|-----------|----------------|
| Keyword Match | 40 | Overlap with JD / role keywords |
| Section Completeness | 20 | Contact, Summary, Experience, Education, Skills |
| Formatting Quality | 20 | Bullets, no tables, readable structure |
| Quantification | 10 | Numbers/percentages in bullets |
| Length Optimization | 10 | 400–700 words = optimal |
| **Total** | **100** | |

---

## 🗺️ Roadmap

- [x] JWT Authentication
- [x] AI Mock Interview with evaluation
- [x] Resume Analysis with ATS score
- [x] Progress Analytics Dashboard
- [x] Interview History
- [x] AI Resume Generator
- [ ] Voice Interview Mode (Whisper API)
- [ ] Company-Specific Interview Mode
- [ ] JD-to-Interview Pipeline
- [ ] Score Trend Charts (Recharts)
- [ ] Daily Practice Recommendations
- [ ] Streak & Badge System
- [ ] Dark Mode
- [ ] Google OAuth
- [ ] Email Notifications
- [ ] PWA Support

---

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👨‍💻 Author

Built with ❤️ for students and job seekers who want to crack interviews smarter.

---

<div align="center">

**⭐ Star this repo if it helped you!**

</div>
