# D-ID Visual Interviewer Avatar Setup

Visual Avatar Interview Mode is optional. The core MVP must work without D-ID.

Set these variables only when Andrew wants the avatar upgrade:

```bash
DID_API_KEY=""
DID_AGENT_ID=""
DID_DEFAULT_AVATAR_ID=""
DID_DEFAULT_VOICE_ID=""
ENABLE_DID_AVATAR_INTERVIEWS="true"
```

Behaviour:

- If `ENABLE_DID_AVATAR_INTERVIEWS` is not `true`, visual avatar mode is disabled.
- If D-ID credentials are missing, the app falls back to voice mode, then text mode.
- The avatar is clearly labelled as AI-generated.
- The avatar must not use Andrew's face or voice.
- The avatar must not impersonate real hiring managers, recruiters, panel members, or employers.
- No audio or video is stored unless Andrew explicitly consents.
- Transcript storage requires separate approval.
- Andrew must be able to delete transcripts, audio, or video records.

Provider architecture:

- `TextInterviewProvider`
- `OpenAIRealtimeVoiceProvider`
- `DIDVisualAvatarProvider`

The app talks to the provider abstraction, not directly to D-ID from the UI. When wiring the realtime transport, use D-ID Realtime Agents/WebRTC session APIs from the official D-ID docs and keep the API key server-side only.
