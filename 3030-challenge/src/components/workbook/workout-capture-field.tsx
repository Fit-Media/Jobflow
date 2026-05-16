"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff, Play, RefreshCcw, Trash, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics/client";
import { capabilityAnalyticsMetadata, getBrowserCapabilities } from "@/lib/browser/capabilities";
import {
  deleteVideoAttachment,
  getVideoAttachment,
  maxWorkoutVideoBytes,
  saveVideoAttachment,
  validateVideoSize,
} from "@/lib/storage/workout-attachments";
import type { AnalyticsEvent, ParticipantProfile, WorkoutAttachmentFieldKey } from "@/types";

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  [index: number]: { transcript: string };
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: ((event?: { error?: string }) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;
type SpeechWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

type AttachmentPreview = {
  objectUrl: string;
  fileName: string;
  size: number;
};

type WorkoutCaptureFieldProps = {
  label: string;
  fieldKey: WorkoutAttachmentFieldKey;
  value: string;
  onChange: (value: string) => void;
  analyticsMetadata: AnalyticsEvent["metadata"];
  profile: ParticipantProfile | null;
  placeholder?: string;
  rows?: number;
};

function formatBytes(size: number) {
  const mb = size / (1024 * 1024);
  return `${mb.toFixed(mb >= 10 ? 0 : 1)}MB`;
}

function sizeBucket(size: number) {
  if (size < 5 * 1024 * 1024) return "small";
  if (size < 15 * 1024 * 1024) return "medium";
  return "large";
}

function getSpeechRecognition() {
  if (typeof window === "undefined") return null;
  const speechWindow = window as SpeechWindow;
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
}

export function WorkoutCaptureField({
  label,
  fieldKey,
  value,
  onChange,
  analyticsMetadata,
  profile,
  placeholder,
  rows = 3,
}: WorkoutCaptureFieldProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [message, setMessage] = useState("");
  const [playbackMessage, setPlaybackMessage] = useState("");
  const [attachment, setAttachment] = useState<AttachmentPreview | null>(null);
  const [isVideoBusy, setIsVideoBusy] = useState(false);
  const [capabilities, setCapabilities] = useState(() => getBrowserCapabilities());

  const loadAttachment = useCallback(async () => {
    const stored = await getVideoAttachment(fieldKey);
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = stored?.objectUrl ?? null;
    setAttachment(stored ? { objectUrl: stored.objectUrl, fileName: stored.fileName, size: stored.size } : null);
  }, [fieldKey]);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      setCapabilities(getBrowserCapabilities());
      loadAttachment().catch(() => {
        if (!cancelled) setMessage("Video could not be saved on this device. Try a shorter clip or free up storage.");
      });
    });
    return () => {
      cancelled = true;
      recognitionRef.current?.abort();
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    };
  }, [loadAttachment]);

  function startVoiceInput() {
    setMessage("");
    const Recognition = getSpeechRecognition();
    if (!Recognition) {
      setMessage("Voice input isn't supported on this browser. You can still type this manually.");
      return;
    }

    const recognition = new Recognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-AU";
    let finalTranscript = "";

    recognition.onresult = (event) => {
      let interimTranscript = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (result.isFinal) finalTranscript += result[0].transcript;
        else interimTranscript += result[0].transcript;
      }
      const captured = finalTranscript.trim();
      if (captured) onChange(`${value ? `${value} ` : ""}${captured}`.trim());
      if (interimTranscript.trim()) setMessage("Listening... keep speaking, then tap stop when finished.");
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      setMessage(event?.error === "not-allowed" || event?.error === "service-not-allowed" ? "Microphone permission was blocked. You can still type this manually." : "Voice input stopped. You can try again or type this manually.");
    };

    recognition.onend = () => {
      setIsListening(false);
      if (finalTranscript.trim()) trackEvent("voice_input_completed", profile, { ...analyticsMetadata, ...capabilityAnalyticsMetadata() });
    };

    setIsListening(true);
    trackEvent("voice_input_started", profile, { ...analyticsMetadata, ...capabilityAnalyticsMetadata() });
    recognition.start();
  }

  function stopVoiceInput() {
    recognitionRef.current?.stop();
    setIsListening(false);
  }

  async function handleVideo(file?: File) {
    if (!file) return;
    setMessage("");
    setPlaybackMessage("");
    if (!validateVideoSize(file)) {
      setMessage("This video is too large for local storage. Try recording a shorter clip.");
      return;
    }

    setIsVideoBusy(true);
    try {
      await saveVideoAttachment(fieldKey, file);
      await loadAttachment();
      trackEvent("video_attachment_added", profile, {
        ...analyticsMetadata,
        ...capabilityAnalyticsMetadata(),
        sizeBucket: sizeBucket(file.size),
        videoAttached: true,
      });
    } catch {
      setMessage("Video could not be saved on this device. Try a shorter clip or free up storage.");
    } finally {
      setIsVideoBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function removeVideo() {
    setIsVideoBusy(true);
    try {
      await deleteVideoAttachment(fieldKey);
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
      setAttachment(null);
      trackEvent("video_attachment_removed", profile, { ...analyticsMetadata, ...capabilityAnalyticsMetadata(), videoAttached: false });
    } catch {
      setMessage("Video could not be removed. Please try again.");
    } finally {
      setIsVideoBusy(false);
    }
  }

  function openVideo() {
    if (!attachment?.objectUrl) {
      setPlaybackMessage("Video could not be opened on this device. Try replacing it with a shorter clip.");
      trackEvent("video_attachment_failed", profile, { ...analyticsMetadata, ...capabilityAnalyticsMetadata() });
      return;
    }
    window.open(attachment.objectUrl, "_blank", "noopener,noreferrer");
    trackEvent("video_attachment_opened", profile, { ...analyticsMetadata, ...capabilityAnalyticsMetadata(), videoAttached: true });
  }

  function handleVideoPlayed() {
    setPlaybackMessage("");
    trackEvent("video_attachment_played", profile, { ...analyticsMetadata, ...capabilityAnalyticsMetadata(), videoAttached: true });
  }

  function handleVideoError() {
    setPlaybackMessage("This device had trouble previewing the video. Try Open video or replace the clip.");
    trackEvent("video_attachment_failed", profile, { ...analyticsMetadata, ...capabilityAnalyticsMetadata(), videoAttached: true });
  }

  return (
    <div className="grid min-w-0 gap-2">
      <label className="grid min-w-0 gap-2 text-sm font-bold text-zinc-800">
        {label}
        <textarea
          data-testid={`workout-field-${fieldKey}`}
          className="min-h-28 w-full min-w-0 resize-y rounded-lg border border-zinc-200 bg-white p-3 text-base leading-6 outline-none transition placeholder:text-zinc-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          rows={rows}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
      <div className="grid min-w-0 gap-2 sm:flex sm:flex-wrap">
        <Button type="button" data-testid={`voice-${fieldKey}`} variant={isListening ? "dark" : "outline"} className="min-h-11 px-3" onClick={isListening ? stopVoiceInput : startVoiceInput} title={capabilities.supportsVoiceInput ? "Dictate this field" : "Voice input may not be supported on this browser"} aria-label={`${isListening ? "Stop dictating" : "Dictate"} ${label}`}>
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          {isListening ? "Listening..." : "Dictate"}
        </Button>
        <Button type="button" data-testid={`video-${fieldKey}`} variant={attachment ? "soft" : "outline"} className="min-h-11 px-3" onClick={() => fileInputRef.current?.click()} disabled={isVideoBusy} aria-label={`${attachment ? "Replace" : "Add"} video for ${label}`}>
          <Video size={18} />
          {attachment ? "Replace video" : "Add video"}
        </Button>
        <input
          ref={fileInputRef}
          data-testid={`video-input-${fieldKey}`}
          type="file"
          accept="video/*"
          capture="environment"
          className="hidden"
          onChange={(event) => handleVideo(event.target.files?.[0])}
        />
      </div>
      {isListening ? <p className="rounded-lg bg-lime-50 p-3 text-sm font-bold text-lime-900">Listening... speak naturally, then tap stop.</p> : null}
      <p className="text-xs font-bold leading-5 text-zinc-500">Short clips work best - aim for 10-30 seconds. {capabilities.isIOS ? "On iPhone, this opens the native camera or video picker." : "Use Add video to record or choose a clip."}</p>
      {message ? <p className="rounded-lg bg-amber-50 p-3 text-sm font-bold leading-6 text-amber-900">{message}</p> : null}
      {attachment ? (
        <div className="animate-soft-enter grid min-w-0 gap-3 rounded-lg border border-teal-100 bg-white p-3 shadow-sm shadow-zinc-950/[0.04]">
          <div className="flex min-w-0 items-start gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-zinc-950 text-lime-300"><Play size={18} /></div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black">Video saved</p>
              <p className={cn("text-xs font-bold", attachment.size > maxWorkoutVideoBytes * 0.8 ? "text-amber-700" : "text-zinc-500")}>
                {formatBytes(attachment.size)} stored on this device
              </p>
            </div>
          </div>
          <video
            className="aspect-video max-h-64 w-full rounded-lg bg-zinc-950 object-contain"
            src={attachment.objectUrl}
            controls
            playsInline
            preload="metadata"
            onPlay={handleVideoPlayed}
            onError={handleVideoError}
          />
          {playbackMessage ? <p className="rounded-lg bg-amber-50 p-3 text-sm font-bold leading-6 text-amber-900">{playbackMessage}</p> : null}
          <div className="grid gap-2 sm:grid-cols-3">
            <Button type="button" variant="soft" onClick={openVideo} aria-label={`Open video for ${label}`}><Play size={18} />Open video</Button>
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} aria-label={`Replace video for ${label}`}><RefreshCcw size={18} />Replace</Button>
            <Button type="button" variant="danger" onClick={removeVideo} disabled={isVideoBusy} aria-label={`Remove video for ${label}`}><Trash size={18} />Remove</Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
