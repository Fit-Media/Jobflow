export function getRealtimeSetupStatus() {
  return {
    configured: Boolean(process.env.OPENAI_REALTIME_MODEL),
    model: process.env.OPENAI_REALTIME_MODEL ?? null,
    message: process.env.OPENAI_REALTIME_MODEL
      ? "Realtime model configured. Microphone, transcript, and audio storage still require explicit consent."
      : "OPENAI_REALTIME_MODEL is not configured. Voice mock interviews will show setup guidance and text fallback.",
  };
}

export function getDidAvatarSetupStatus() {
  const enabled = process.env.ENABLE_DID_AVATAR_INTERVIEWS === "true";
  const configured = Boolean(process.env.DID_API_KEY && process.env.DID_AGENT_ID);

  return {
    enabled,
    configured,
    available: enabled && configured,
    agentId: process.env.DID_AGENT_ID ?? null,
    defaultAvatarId: process.env.DID_DEFAULT_AVATAR_ID ?? null,
    defaultVoiceId: process.env.DID_DEFAULT_VOICE_ID ?? null,
    message:
      enabled && configured
        ? "D-ID avatar mode is configured. It remains optional and clearly labelled as AI-generated."
        : "D-ID avatar mode is disabled or not configured. Visual avatar interviews fall back to voice-only mode.",
  };
}

export function voiceConsentChecklist(input: {
  microphoneApproved: boolean;
  saveTranscriptApproved: boolean;
  saveAudioApproved: boolean;
  saveVideoApproved?: boolean;
}) {
  return [
    { label: "Microphone permission", approved: input.microphoneApproved, required: true },
    { label: "Save transcript", approved: input.saveTranscriptApproved, required: false },
    { label: "Save audio recording", approved: input.saveAudioApproved, required: false },
    { label: "Save avatar video", approved: Boolean(input.saveVideoApproved), required: false },
  ];
}
