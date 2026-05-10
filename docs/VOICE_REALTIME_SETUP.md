# Voice and Realtime Setup Guide

Set `OPENAI_REALTIME_MODEL` in `.env.local` before enabling voice interviews.

Voice mode rules:

- Ask for microphone permission explicitly.
- Do not record audio by default.
- Save transcript only after Andrew approves transcript storage.
- Save audio only after a separate audio recording approval.
- Provide mute, pause, restart, and end controls.
- Provide text fallback when realtime setup is missing or the browser denies microphone access.
- Visual avatar mode is a separate optional provider and must fall back to voice-only mode when D-ID is disabled or unconfigured.

Realtime implementation should use the `src/lib/integrations/realtime.ts` consent checklist before opening a session.
