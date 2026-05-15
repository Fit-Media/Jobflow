"use client";

type SpeechWindow = Window & {
  SpeechRecognition?: unknown;
  webkitSpeechRecognition?: unknown;
};

export type BrowserCapabilities = {
  supportsIndexedDB: boolean;
  supportsVideoCapture: boolean;
  supportsVoiceInput: boolean;
  isIOS: boolean;
  isStandalonePWA: boolean;
  isMobileLike: boolean;
};

export function getBrowserCapabilities(): BrowserCapabilities {
  if (typeof window === "undefined") {
    return {
      supportsIndexedDB: false,
      supportsVideoCapture: false,
      supportsVoiceInput: false,
      isIOS: false,
      isStandalonePWA: false,
      isMobileLike: false,
    };
  }

  const nav = window.navigator;
  const ua = nav.userAgent;
  const speechWindow = window as SpeechWindow;
  const isIPadOSDesktopMode = nav.platform === "MacIntel" && nav.maxTouchPoints > 1;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || isIPadOSDesktopMode;
  const standaloneMedia = window.matchMedia?.("(display-mode: standalone)").matches ?? false;
  const navigatorStandalone = "standalone" in nav && Boolean((nav as Navigator & { standalone?: boolean }).standalone);

  return {
    supportsIndexedDB: "indexedDB" in window,
    supportsVideoCapture: typeof document !== "undefined" && "capture" in document.createElement("input"),
    supportsVoiceInput: Boolean(speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition),
    isIOS,
    isStandalonePWA: standaloneMedia || navigatorStandalone,
    isMobileLike: isIOS || nav.maxTouchPoints > 1 || window.innerWidth < 768,
  };
}

export function capabilityAnalyticsMetadata() {
  const capabilities = getBrowserCapabilities();
  return {
    isIOS: capabilities.isIOS,
    supportsIndexedDB: capabilities.supportsIndexedDB,
    supportsVideoCapture: capabilities.supportsVideoCapture,
    supportsVoiceInput: capabilities.supportsVoiceInput,
    isStandalonePWA: capabilities.isStandalonePWA,
    isMobileLike: capabilities.isMobileLike,
  };
}
