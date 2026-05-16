# 30/30 Challenge

Brand-neutral digital fitness challenge workbook for clubs, studios, PTs and wellness businesses.

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Demo club access:

- `DEMO30` / `DEMO30`
- `ALPHA30` / `START30`
- `BETA30` / `START30`
- `STUDIO30` / `START30`

## Backend Choice

The MVP uses typed Next.js API routes with seeded demo data in `src/lib/clubs/seed.ts`. This is the fastest sensible MVP path because the product can be demoed immediately without provisioning accounts. The service boundaries are intentionally shaped for Firebase Firestore or Supabase.

Recommended production backend: Supabase.

Suggested tables:

- `clubs`
- `participant_metadata`
- `analytics_events`
- `club_staff_notes`

Policies should allow public validation by code/password through a server route only, participant metadata writes by anonymous participant ID, and admin reads behind real auth.

## Privacy Model

Participants do not create accounts. The app does not ask for emails, phone numbers, surnames, addresses, date of birth, weight, body measurements, injury details or medical data.

Stored locally only:

- why, goals and reflections
- workout, nutrition and daily notes
- workout video attachments
- Progress Vault check-ins, measurements, body scan values and progress photos
- rituals, shopping list and prep actions
- weekly review written answers
- continuation journal content

Backend-safe data:

- club configuration
- anonymous participant ID
- first name
- progress metadata
- high-level events and completion counts

The analytics helper in `src/lib/analytics/client.ts` has an explicit privacy guard comment. Do not add private text fields to analytics metadata.

## Design and Motion

The MVP uses a lightweight CSS animation system in `src/app/globals.css` rather than adding a motion dependency. This keeps the app fast on mobile and simple to deploy on Cloud Run.

Motion principles:

- subtle fade/slide/scale entrances
- animated progress bars and badge glow moments
- tap/hover lift for cards and buttons
- no heavy confetti or distracting effects
- `prefers-reduced-motion` is respected globally

The visual system remains brand-neutral: charcoal, white, lime, teal, and a restrained purple accent. Public pages must never show outside brand names, agency marks, club identities, or a public club dropdown before club code validation.

## Local Storage Model

Local keys:

- `3030:club`
- `3030:participantProfile`
- `3030:workbook`
- `3030:analyticsQueue`

Workout video attachments are stored in IndexedDB under `3030-workout-attachments`. They are not included in the JSON export/import flow.

Progress photos are stored in IndexedDB under `3030-progress-photos`. Progress Vault check-in text and metric values are stored in the local workbook. Progress photo blobs are not included in JSON export/import.

Export/import/reset are available from `/settings`.

## Workout Video and Voice Capture

Workout setup supports local-only quick capture for workout focus, warm-up, cardio finisher, coach notes, and the first three exercises in Workout 1 and Workout 2.

Stable attachment field keys:

- `workout1.focus`
- `workout1.warmUp`
- `workout1.cardioFinisher`
- `workout1.coachNotes`
- `workout1.exercise1`
- `workout1.exercise2`
- `workout1.exercise3`
- `workout2.focus`
- `workout2.warmUp`
- `workout2.cardioFinisher`
- `workout2.coachNotes`
- `workout2.exercise1`
- `workout2.exercise2`
- `workout2.exercise3`

Video capture uses native browser file input:

```html
<input type="file" accept="video/*" capture="environment" />
```

This is the safest v1 path for iPhone Safari because it lets iOS open the native camera or video picker. Inline playback uses IndexedDB Blob data, object URLs, and:

```html
<video controls playsInline preload="metadata" />
```

Short clips work best. The MVP allows up to 25MB per attached video and recommends 10-30 second clips.

Videos recorded on one device stay on that device. To let a participant replay a coach video on their own phone, record or attach the video while using the app on the participant's phone. Cloud video sync is a future feature.

iPhone/PWA limitations:

- iPhone Safari native file input should work, but it may open either camera or picker depending on iOS settings.
- Installed PWA behavior may vary by iOS version.
- IndexedDB storage quota is not unlimited and can be affected by device storage pressure.
- If playback preview fails, the app offers an `Open video` fallback using the same local object URL.
- JSON export does not include video blobs.

Voice input uses the browser Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`) where available. Unsupported browsers show a manual typing fallback. Raw audio is never stored; only final transcript text is written into the local workbook field.

## Analytics Model

Events are queued locally when offline and posted to `/api/analytics` when online. Event metadata should contain completion booleans, day/week numbers, stage and device type only. The API rejects obvious private-text key names.

Safe workout capture events:

- `voice_input_started`
- `voice_input_completed`
- `video_attachment_added`
- `video_attachment_removed`
- `video_attachment_opened`
- `video_attachment_played`
- `video_attachment_failed`

Allowed video/voice metadata is intentionally generic: field type, workout number, size bucket, and coarse browser capability flags. Do not send transcript text, file names, exact file sizes, object URLs, video content, workout text, nutrition text, reflections, goals or reasons.

Safe Progress Vault events:

- `progress_check_in_completed`
- `progress_photo_added`
- `body_scan_added`
- `measurement_added`
- `coach_review_requested`
- `booklet_scan_started`

Allowed Progress Vault metadata is yes/no and coarse only: check-in type, week number, check-in streak, photo added yes/no, body scan added yes/no, measurement added yes/no, coach review requested yes/no, and booklet page type. Do not send exact weight, measurements, body fat percentage, body scan values, private notes, photo blobs, photo file names or OCR text.

## Progress Vault and Booklet Scanning

`/progress` is an optional, privacy-first Progress Vault surface. It supports:

- starting point or weekly check-ins
- optional measurements
- optional body scan metric fields and custom metric rows
- energy, confidence, sleep and stress scores
- weekly win, obstacle and next focus fields
- optional local progress photos
- a future-facing booklet scan/OCR concept

Progress Vault language should focus on progress, energy, confidence, strength and consistency. Avoid body-shaming, diagnosis and medical/nutrition claims. Body scan metrics are informational estimates only.

Booklet scanning is scaffolded as a product concept only. The intended future flow is: user photographs a Starting Point page, Weekly Check-In page or body scan report; OCR/AI extracts values; the app shows a confirmation screen; the user edits and confirms before saving locally. Do not auto-share extracted values with a club or coach.

## Adding Clubs

For MVP, add records to `src/lib/clubs/seed.ts`. In production, move this to Supabase/Firebase and validate credentials only through a server route.

## Admin Login

V1 admin pages are scaffolded without real auth:

- `/admin`
- `/admin/clubs`
- `/admin/participants`
- `/admin/insights`
- `/club-admin`
- `/club-admin/dashboard`

Replace this with Supabase Auth, Firebase Auth or another provider before launch.

## Deployment Notes

Set production environment variables for the selected backend and move demo seed validation out of source code. Keep white-label branding disabled by default. Do not add public club dropdowns or public-facing third-party marks.

Current Cloud Run demo service:

- Project: `fitmedia-e51e4`
- Region: `australia-southeast1`
- Service: `challenge-3030`
- Required env vars: `NODE_ENV=production`, `NEXT_TELEMETRY_DISABLED=1`

## Known Limitations

- Demo data is static.
- Admin auth is scaffolded.
- PWA manifest is present; a full service worker caching strategy should be added before production.
- QR launch, reminder integrations, payments and app-store modes are feature-flagged or TODO only.

## Future TODO

- QR code club launch links
- Reminder integrations
- Staff task/check-in workflow
- White-label club branding after unlock only
- PDF export
- Push notifications
- Lead capture mode
- PT intro offer workflow
- Member referral challenges
- iOS/Android app-store product
- Paid ongoing journal subscription
