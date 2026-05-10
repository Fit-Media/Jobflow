import { demoMockInterviewPlan, demoPostInterviewFeedback } from "@/lib/ai/service";
import { getJobById, type DemoJob } from "@/lib/data/demo-data";

export type InterviewMode = "text" | "voice" | "visual_avatar";

export type InterviewType =
  | "recruiter"
  | "hiring_manager"
  | "government_panel"
  | "behavioural"
  | "technical"
  | "final_round"
  | "friendly_coach"
  | "tough_but_fair";

export type InterviewDifficulty = "easy" | "standard" | "challenging" | "tough_but_fair";

export type InterviewProviderStatus = {
  id: InterviewMode;
  label: string;
  available: boolean;
  fallbackMode?: InterviewMode;
  message: string;
};

export type InterviewStartInput = {
  jobId: string;
  interviewType: InterviewType;
  difficulty: InterviewDifficulty;
  transcriptConsent: boolean;
  audioConsent: boolean;
  videoConsent: boolean;
};

export type InterviewSessionStart = {
  provider: InterviewMode;
  sessionId: string;
  job: Pick<DemoJob, "id" | "title" | "company">;
  plan: ReturnType<typeof demoMockInterviewPlan>;
  firstQuestion: string;
  transport: "text" | "openai_realtime" | "did_webrtc";
  avatar?: {
    agentId: string;
    avatarId?: string;
    voiceId?: string;
    label: string;
    clearAiNotice: string;
  };
  consent: {
    transcript: boolean;
    audio: boolean;
    video: boolean;
  };
  safetyNotice: string;
};

export interface InterviewProvider {
  id: InterviewMode;
  getStatus(): InterviewProviderStatus;
  start(input: InterviewStartInput): Promise<InterviewSessionStart>;
  finish(transcript: string, saveTranscriptApproved: boolean): Promise<{
    feedback: ReturnType<typeof demoPostInterviewFeedback>;
    savedToCrm: boolean;
    timelineEvent: string;
  }>;
}

const noRecordingNotice =
  "No audio or video is stored unless Andrew explicitly consents. Transcript storage also requires Andrew's approval.";

function baseSession(input: InterviewStartInput, provider: InterviewMode, transport: InterviewSessionStart["transport"]) {
  const job = getJobById(input.jobId);
  return {
    provider,
    sessionId: `${provider}-${job.id}-${Date.now()}`,
    job: { id: job.id, title: job.title, company: job.company },
    plan: demoMockInterviewPlan(job),
    firstQuestion: `Thanks for joining, Andrew. To start, what interests you about the ${job.title} role at ${job.company}?`,
    transport,
    consent: {
      transcript: input.transcriptConsent,
      audio: input.audioConsent,
      video: input.videoConsent,
    },
    safetyNotice: noRecordingNotice,
  } satisfies InterviewSessionStart;
}

export class TextInterviewProvider implements InterviewProvider {
  id: InterviewMode = "text";

  getStatus(): InterviewProviderStatus {
    return {
      id: this.id,
      label: "Text mock interview",
      available: true,
      message: "Text interviews are available without microphone, voice, or avatar setup.",
    };
  }

  async start(input: InterviewStartInput) {
    return baseSession(input, this.id, "text");
  }

  async finish(transcript: string, saveTranscriptApproved: boolean) {
    return {
      feedback: demoPostInterviewFeedback(transcript),
      savedToCrm: saveTranscriptApproved,
      timelineEvent: saveTranscriptApproved
        ? "Mock interview completed and transcript feedback saved to the CRM timeline."
        : "Mock interview completed. Feedback generated without storing the transcript.",
    };
  }
}

export class OpenAIRealtimeVoiceProvider extends TextInterviewProvider {
  id: InterviewMode = "voice";

  getStatus(): InterviewProviderStatus {
    const configured = Boolean(process.env.OPENAI_REALTIME_MODEL);
    return {
      id: this.id,
      label: "Voice interview",
      available: configured,
      fallbackMode: configured ? undefined : "text",
      message: configured
        ? "OpenAI realtime voice is configured. Microphone permission and storage consent are still required."
        : "OPENAI_REALTIME_MODEL is not configured. Voice interviews fall back to text mode.",
    };
  }

  async start(input: InterviewStartInput) {
    if (!this.getStatus().available) {
      return new TextInterviewProvider().start(input);
    }
    return baseSession(input, this.id, "openai_realtime");
  }
}

export class DIDVisualAvatarProvider extends TextInterviewProvider {
  id: InterviewMode = "visual_avatar";

  getStatus(): InterviewProviderStatus {
    const enabled = process.env.ENABLE_DID_AVATAR_INTERVIEWS === "true";
    const configured = Boolean(process.env.DID_API_KEY && process.env.DID_AGENT_ID);
    const available = enabled && configured;

    return {
      id: this.id,
      label: "Visual avatar interview",
      available,
      fallbackMode: available ? undefined : "voice",
      message: available
        ? "D-ID visual avatar interviews are configured. The avatar is AI-generated and cannot use Andrew's face or voice."
        : "D-ID avatar interviews are disabled or missing DID_API_KEY/DID_AGENT_ID. The app falls back to voice, then text.",
    };
  }

  async start(input: InterviewStartInput) {
    if (!this.getStatus().available) {
      return new OpenAIRealtimeVoiceProvider().start(input);
    }

    const session = baseSession(input, this.id, "did_webrtc");
    return {
      ...session,
      avatar: {
        agentId: process.env.DID_AGENT_ID!,
        avatarId: process.env.DID_DEFAULT_AVATAR_ID,
        voiceId: process.env.DID_DEFAULT_VOICE_ID,
        label: avatarLabelForInterviewType(input.interviewType),
        clearAiNotice: "AI-generated interviewer avatar. Not a real recruiter, hiring manager, or Andrew.",
      },
    };
  }
}

export function avatarLabelForInterviewType(type: InterviewType) {
  const labels: Record<InterviewType, string> = {
    recruiter: "AI recruiter screen interviewer",
    hiring_manager: "AI hiring manager interviewer",
    government_panel: "AI government panel interviewer",
    behavioural: "AI behavioural interviewer",
    technical: "AI technical interviewer",
    final_round: "AI final-round interviewer",
    friendly_coach: "AI friendly coach",
    tough_but_fair: "AI tough but fair interviewer",
  };
  return labels[type];
}

export function getInterviewProvider(mode: InterviewMode): InterviewProvider {
  if (mode === "visual_avatar") return new DIDVisualAvatarProvider();
  if (mode === "voice") return new OpenAIRealtimeVoiceProvider();
  return new TextInterviewProvider();
}

export function getInterviewProviderStatuses() {
  return [
    new TextInterviewProvider().getStatus(),
    new OpenAIRealtimeVoiceProvider().getStatus(),
    new DIDVisualAvatarProvider().getStatus(),
  ];
}
