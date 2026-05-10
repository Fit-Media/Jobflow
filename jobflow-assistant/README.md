# JobFlow Assistant

JobFlow Assistant is a private AI-powered job application assistant and interview coach for Andrew. It turns job alerts and pasted job descriptions into a lightweight CRM, tailored resume drafts, cover letters, short cover emails, document exports, follow-up reminders, approval items, and job-specific mock interview practice.

## Safety model

JobFlow is an assistant, not an autopilot.

- It never sends email automatically.
- It never submits a job application automatically.
- It never clicks final Submit, Apply, Send, or Confirm buttons.
- Gmail drafts require approved resume PDF, cover letter PDF, cover email, recipient, subject, and attachments.
- AI-generated resume, cover letter, cover email, screening answer, and interview content must be grounded in Andrew's verified profile and base resume.
- Prompt injection in emails and job descriptions is treated as untrusted content.
- Voice mode requires microphone consent. Transcript saving and audio recording are separate consent decisions.
- Risky actions are represented as approval items and audit events.

## Current build

The implemented MVP covers Phase 1, Phase 2, and Phase 3 surfaces:

- Manual job CRM with Kanban, table, calendar, job detail, follow-ups, documents, approvals, settings, and audit log pages.
- Resume Studio with original vs tailored resume, change summary, keyword emphasis, unsupported claim warnings, and approval/export actions.
- Cover Letter Studio.
- Cover Email Studio.
- Versioned document model and local DOCX/PDF export utilities.
- AI service layer with Zod-validated structured outputs for all requested prompt families.
- Text mock interview planning and post-interview feedback.
- Realtime voice, optional D-ID visual avatar, Gmail, Google Drive/Docs, Microsoft Graph, and guided browser service boundaries with safety guards.
- Prisma schema for the full product data model.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run prisma:generate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Required for a real local run:

- `DATABASE_URL`
- `JOBFLOW_DATABASE_MODE` set to `true` only when database persistence is ready
- `JOBFLOW_DEMO_USER_EMAIL` for the temporary auth boundary before Auth.js is wired
- `NEXTAUTH_SECRET`
- `APP_URL`
- `ENCRYPTION_KEY`

Required for live AI generation:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`

Optional but recommended:

- `OPENAI_INTERVIEW_MODEL`
- `OPENAI_REALTIME_MODEL`
- D-ID avatar variables if visual avatar interviews are enabled
- Google OAuth variables
- Microsoft OAuth variables
- S3 variables
- `REDIS_URL`

Model names are not hard-coded. If a model variable is missing, the AI service throws a clear setup error.

## Database setup

Create a PostgreSQL database and set `DATABASE_URL`, then run:

```bash
npm run prisma:migrate
npm run prisma:seed
```

The seed creates Andrew, a default profile, a base resume, sample jobs, and application records.

Mock interview CRM persistence is guarded by `JOBFLOW_DATABASE_MODE=true`. Until Auth.js is wired, persistence uses `JOBFLOW_DEMO_USER_EMAIL` as a TODO-safe local boundary instead of silently pretending production authentication exists.

## Google OAuth, Gmail, Drive, and Docs

Create a Google Cloud OAuth app and enable Gmail API, Google Drive API, and Google Docs API.

Start with minimal Gmail scopes:

- `openid`
- `email`
- `profile`
- `https://www.googleapis.com/auth/gmail.readonly`

Request Gmail draft scope only when Andrew enables Gmail drafts:

- `https://www.googleapis.com/auth/gmail.compose`

Drive/Docs features use:

- `https://www.googleapis.com/auth/drive.file`
- `https://www.googleapis.com/auth/documents`

The app must explain scopes before connection. Gmail passwords are never requested or stored.

## Microsoft Graph setup

Create an Azure app registration and configure the redirect URI from `.env.example`.

Planned Word Online/OneDrive scopes:

- `openid`
- `email`
- `profile`
- `offline_access`
- `Files.ReadWrite`

The current implementation includes the service boundary and UI placeholders.

## OpenAI and Realtime setup

Set:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `OPENAI_INTERVIEW_MODEL` for deeper feedback if desired
- `OPENAI_REALTIME_MODEL` for voice interviews

Realtime voice mode must request microphone permission in the browser. Transcript and audio storage are separate approvals.

## D-ID visual avatar setup

D-ID visual interviewer avatars are optional and disabled by default. See [docs/DID_AVATAR_SETUP.md](docs/DID_AVATAR_SETUP.md).

When enabled, avatar sessions must be labelled AI-generated, must not use Andrew's face or voice, and must not impersonate real recruiters, hiring managers, government panel members, or employers. If D-ID is not configured, the app falls back to voice-only interviews, then text interviews.

## Running tests

```bash
npm test
```

Tests currently cover:

- AI output schemas.
- Prompt injection detection.
- Unsupported claims detection.
- Gmail draft approval guard.
- Browser final-submit/CAPTCHA/MFA stops.
- CRM follow-up and duplicate logic.
- DOCX and PDF export utilities.
- Optional D-ID avatar fallback and AI-generated-avatar disclosure.

## Running Playwright

Guided Apply is represented as a safety-first service boundary in this MVP. When the visible browser worker is wired in, use Playwright headed mode only:

```bash
npx playwright test --headed
```

Do not automate final submission, CAPTCHA, MFA, login, legal attestation, or uncertain steps.

## Deployment notes

- Use PostgreSQL in production.
- Store OAuth tokens encrypted at rest using `ENCRYPTION_KEY`.
- Keep all secrets server-side.
- Configure S3-compatible storage or Drive/OneDrive for generated files.
- Add Redis/BullMQ for scheduled Gmail scans and daily digest jobs.
- Review OAuth scopes before production verification.

## Known limitations

- Auth.js/NextAuth OAuth routes are planned but not fully wired.
- Gmail, Google Docs/Drive, Microsoft Graph, and visible Playwright automation are service boundaries with UI placeholders.
- The MVP uses demo data for screens unless a database is connected and seeded.
- Live AI calls require environment variables and credentials.
- Voice interviews show the consent architecture and fallback until realtime transport is wired.
- Visual avatar interviews are optional and use a provider boundary until D-ID WebRTC transport is wired.

## Roadmap

- Complete OAuth flows and encrypted token persistence.
- Add Gmail ingestion jobs and duplicate detection review.
- Create Google Docs and export approved Docs to PDF.
- Create approved Gmail drafts with attachments.
- Add headed Playwright guided form filling.
- Add Microsoft Word Online/OneDrive upload and export.
- Wire D-ID Realtime Agents/WebRTC transport behind `DIDVisualAvatarProvider`.
- Add daily digest, recruiter reply detection, company research, selection criteria builder, and analytics.
