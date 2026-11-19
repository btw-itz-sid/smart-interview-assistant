-- Align the database with schema.prisma.
-- The init migration only created User / Interview / Question / Progress.
-- Later models (Streak, Badge, ResumeAnalysis) and interview-mode columns
-- existed in Prisma schema but were never migrated.

ALTER TABLE "Interview" ADD COLUMN IF NOT EXISTS "difficulty" TEXT NOT NULL DEFAULT 'medium';
ALTER TABLE "Interview" ADD COLUMN IF NOT EXISTS "type" TEXT NOT NULL DEFAULT 'general';
ALTER TABLE "Interview" ADD COLUMN IF NOT EXISTS "company" TEXT;
ALTER TABLE "Interview" ADD COLUMN IF NOT EXISTS "timeSpent" INTEGER;
ALTER TABLE "Interview" ADD COLUMN IF NOT EXISTS "hintsUsed" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "timeSpent" INTEGER;
ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "hintUsed" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS "Streak" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" TIMESTAMP(3),
    "totalXP" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Streak_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Streak_userId_key" ON "Streak"("userId");

CREATE TABLE IF NOT EXISTS "Badge" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "badgeType" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Badge_userId_badgeType_key" ON "Badge"("userId", "badgeType");

CREATE TABLE IF NOT EXISTS "ResumeAnalysis" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "atsScore" INTEGER NOT NULL,
    "grade" TEXT NOT NULL,
    "breakdown" TEXT NOT NULL,
    "suggestions" TEXT NOT NULL,
    "keywordCount" INTEGER NOT NULL DEFAULT 0,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "targetRole" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResumeAnalysis_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Streak_userId_fkey'
    ) THEN
        ALTER TABLE "Streak"
            ADD CONSTRAINT "Streak_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Badge_userId_fkey'
    ) THEN
        ALTER TABLE "Badge"
            ADD CONSTRAINT "Badge_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ResumeAnalysis_userId_fkey'
    ) THEN
        ALTER TABLE "ResumeAnalysis"
            ADD CONSTRAINT "ResumeAnalysis_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
