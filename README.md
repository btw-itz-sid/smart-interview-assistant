# Smart Interview Assistant

AI-powered interview preparation platform built with React, Node.js, TypeScript, PostgreSQL, Prisma, and OpenAI.

This project helps candidates practice realistic technical, behavioral, company-specific, and job-description-based interviews. It also includes resume analysis, ATS scoring, progress analytics, streaks, XP, badges, and an interview readiness score.

## Why This Project Stands Out

Most interview prep tools focus on static question banks. Smart Interview Assistant is designed around real preparation workflows:

- Scenario-based AI interview questions instead of generic definitions.
- AI answer evaluation with score and feedback.
- Real-time hint support during interviews.
- STAR-L inspired behavioral interview practice.
- Company-specific interview preparation.
- Job-description-to-interview generation.
- Resume PDF upload and ATS-style scoring.
- Dashboard analytics, topic progress, readiness score, streaks, XP, and badges.
- Printable interview report export for saving completed sessions as PDF.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Recharts, Framer Motion |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL, Prisma ORM |
| AI | OpenAI API |
| Auth | JWT, bcryptjs |
| Security | Helmet, CORS, express-rate-limit |
| Docs | Swagger UI |
| Deployment | Railway backend, Vercel frontend |

## Features

### Authentication

- Register and login.
- JWT-based protected routes.
- Password hashing with bcryptjs.

### AI Mock Interviews

- Topic and difficulty based interview generation.
- Answer evaluation with feedback and score.
- Interview history and detail view.
- Hint endpoint for coaching during interviews.
- Printable interview report with question breakdown, answers, scores, and AI feedback.

### Specialized Interview Modes

- Company-specific interview generation.
- Job-description-based interview generation.
- Behavioral interview generation and answer evaluation.
- Timed pressure-mode experience in the frontend.

### Resume Tools

- PDF resume upload and text extraction.
- Resume analysis and suggestions.
- Advanced ATS-style scoring.
- Interview topic suggestions from resume content.
- AI resume generation based on user progress.

### Analytics and Gamification

- Dashboard overview.
- Topic progress.
- Interview readiness score.
- Daily streak tracking.
- XP and level system.
- Achievement badges.

## Project Structure

```text
smart-interview-assistant/
  backend/
    prisma/
      schema.prisma
      migrations/
    src/
      config/
      controllers/
      docs/
      middlewares/
      models/
      repositories/
      routes/
      services/
      types/
      utils/
    package.json
    railway.json
  frontend/
    src/
      components/
      context/
      pages/
      services/
    package.json
    vercel.json
  README.md
```

## Local Setup

### Prerequisites

- Node.js 18 or newer.
- PostgreSQL.
- OpenAI API key.

### Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/interview_db?schema=public"
JWT_SECRET="replace_with_a_long_random_secret"
OPENAI_API_KEY="your_openai_api_key_here"
FRONTEND_URL="http://localhost:5173"
```

Initialize Prisma:

```bash
npx prisma generate
npx prisma db push
```

Run backend:

```bash
npm run dev
```

Backend health check:

```text
http://localhost:5000/api/health
```

Swagger docs:

```text
http://localhost:5000/api/docs
```

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Run frontend:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

## Quality Checks

Backend:

```bash
cd backend
npm run lint
npm run build
npm test
```

Frontend:

```bash
cd frontend
npm run build
```

## Deployment

### Backend on Railway

Use the `backend` directory as the service root and set:

```env
DATABASE_URL=your_production_postgres_url
JWT_SECRET=your_production_jwt_secret
OPENAI_API_KEY=your_openai_api_key
FRONTEND_URL=https://your-vercel-domain.vercel.app
NODE_ENV=production
```

Railway uses:

- Build: Nixpacks
- Start command: `npm start`
- Health check: `/api/health`

### Frontend on Vercel

Use the `frontend` directory as the project root and set:

```env
VITE_API_URL=https://your-railway-backend-domain.up.railway.app/api
```

The included `vercel.json` rewrites routes to `index.html` for React Router support.

## Roadmap

- Google OAuth.
- Voice interview mode.
- PWA support.
- Email reminders.
- Dark mode with system preference.

## License

MIT License. See [LICENSE](LICENSE).
