# Backend Setup + PostgreSQL Linking

## 1) Configure environment

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL` for your local PostgreSQL.
3. Set `JWT_SECRET`.
4. Set `OPENAI_API_KEY` for AI endpoints.

Example:

`DATABASE_URL="postgresql://postgres:your_password@localhost:5432/interview_db?schema=public"`

If your DB password contains `@`, replace it with `%40`.

## 2) Initialize database

Run these commands inside `backend`:

```bash
npm install
npx prisma generate
npx prisma db push
```

Then start server:

```bash
npm run dev
```

Health check:

`http://localhost:5000/api/health`

Swagger docs:

`http://localhost:5000/api/docs`

## 3) Add new backend APIs (pattern used in this project)

For a new feature `notes`:

1. Create validation schema in `src/models/validation.ts`.
2. Create DB functions in `src/repositories/notes.repository.ts`.
3. Create business logic in `src/services/notes.service.ts`.
4. Create request handlers in `src/controllers/notes.controller.ts`.
5. Create route file in `src/routes/notes.routes.ts`.
6. Mount route in `src/app.ts` using:
   - `app.use('/api/notes', notesRoutes);`

Recommended route flow:

`Route -> validate middleware -> auth middleware (if needed) -> controller -> service -> repository`

## 4) Quick endpoint checklist

- Input validated with Zod
- Protected routes use `authMiddleware`
- Errors thrown with `ApiError`
- Response returned through `sendResponse`
- Add Swagger doc block for endpoint visibility in `/api/docs`
