-- Align mock interview database enums with provider modes.
ALTER TYPE "MockInterviewMode" ADD VALUE IF NOT EXISTS 'visual_avatar';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_enum
    WHERE enumlabel = 'executive'
      AND enumtypid = '"InterviewDifficulty"'::regtype
  ) THEN
    ALTER TYPE "InterviewDifficulty" RENAME VALUE 'executive' TO 'tough_but_fair';
  END IF;
END $$;
