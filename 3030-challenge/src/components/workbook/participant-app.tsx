"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Award,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  ClipboardCheck,
  Crown,
  Camera,
  Download,
  Dumbbell,
  Flame,
  Gauge,
  Heart,
  Leaf,
  Medal,
  MessageSquare,
  Moon,
  Ruler,
  RotateCcw,
  Scale,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Star,
  Sunrise,
  Target,
  TimerReset,
  Trash2,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, TextArea } from "@/components/ui/field";
import { WorkoutCaptureField } from "@/components/workbook/workout-capture-field";
import {
  clearLocalData,
  createOrUpdateProfile,
  defaultWorkbook,
  exportLocalData,
  getProfile,
  getUnlockedClub,
  getWorkbook,
  importLocalData,
  saveWorkbook,
} from "@/lib/storage/local";
import { trackEvent } from "@/lib/analytics/client";
import { featureFlags } from "@/lib/featureFlags";
import { cn } from "@/lib/utils";
import { clearWorkoutAttachments } from "@/lib/storage/workout-attachments";
import { clearProgressPhotos, deleteProgressPhoto, listProgressPhotos, saveProgressPhoto, validateProgressPhotoSize, type ProgressPhotoPreview } from "@/lib/storage/progress-photos";
import type { DayEntry, ParticipantProfile, ProgressCheckIn, ProgressCustomMetric, WeeklyReview, Workbook, WorkoutAttachmentFieldKey } from "@/types";

const desiredResults = ["More energy", "Fat loss", "Strength", "Fitness", "Confidence", "Routine", "Mobility", "Better health", "Other"];

const onboardingSteps = [
  ["Choose your workouts", Dumbbell],
  ["Schedule your daily 30 minutes", CalendarDays],
  ["Tick movement + nutrition habits", ClipboardCheck],
  ["Review weekly and keep building momentum", Trophy],
] as const;

const hacks = [
  { id: "lay-it-out", title: "Lay it out", copy: "Set out gym clothes the night before.", category: "Prep", icon: Sunrise },
  { id: "water-first", title: "Drink water first", copy: "Start your day with a big glass of water.", category: "Nutrition", icon: Gauge },
  { id: "ten-minute-start", title: "10-minute start rule", copy: "Commit to just 10 minutes. Starting is the hardest part.", category: "Mindset", icon: TimerReset },
  { id: "walk-after-meals", title: "Walk after meals", copy: "Take a 10-15 minute walk after meals.", category: "Movement", icon: Activity },
  { id: "schedule-it", title: "Schedule it", copy: "Treat workouts like appointments.", category: "Prep", icon: CalendarDays },
  { id: "protein-first", title: "Protein first", copy: "Protein at each meal helps energy and recovery.", category: "Nutrition", icon: Leaf },
  { id: "prioritise-sleep", title: "Prioritise sleep", copy: "Better sleep improves recovery and consistency.", category: "Recovery", icon: Moon },
  { id: "reduce-friction", title: "Reduce friction", copy: "Keep workout gear, snacks and water within reach.", category: "Prep", icon: Sparkles },
  { id: "stack-good-habits", title: "Stack good habits", copy: "Attach new habits to something you already do.", category: "Mindset", icon: BookOpen },
  { id: "never-miss-twice", title: "Never miss twice", copy: "One missed day is normal. Two is a pattern.", category: "Mindset", icon: ShieldCheck },
  { id: "make-it-obvious", title: "Make it obvious", copy: "Put reminders where you will see them.", category: "Prep", icon: Star },
  { id: "accountability-check-in", title: "Accountability check-in", copy: "Tell someone what you are doing and when.", category: "Mindset", icon: MessageSquare },
] as const;

const continuationChoices = ["Repeat 30/30", "Step up to 45/45", "Step up to 60/60", "Continue with coaching / PT", "Set a new 30-day goal"];
const prepActions = ["protein prep", "lunches", "healthy snacks", "fruit and veg", "grocery shop", "water bottle ready"];
const badgeDefinitions = [
  { id: "day-1-started", label: "Day 1 Started", day: 1, icon: CheckCircle2, copy: "You started. That matters." },
  { id: "3-day-momentum", label: "3-Day Momentum", day: 3, icon: Flame, copy: "Three proof points in a row." },
  { id: "7-day-streak", label: "7-Day Streak", day: 7, icon: Medal, copy: "A full week of showing up." },
  { id: "14-day-halfway", label: "14-Day Halfway", day: 14, icon: Target, copy: "Halfway is not a place to coast." },
  { id: "21-day-strong", label: "21-Day Strong", day: 21, icon: Trophy, copy: "This is becoming your rhythm." },
  { id: "3030-finisher", label: "30/30 Finisher", day: 30, icon: Crown, copy: "Thirty days. Thirty wins." },
  { id: "6060-builder", label: "60/60 Builder", day: 60, icon: Sparkles, copy: "Built for the next level." },
  { id: "90-day-legend", label: "90-Day Legend", day: 90, icon: Award, copy: "Long-game consistency." },
] as const;

const milestoneDays = new Set([1, 7, 14, 21, 30]);
const measurementFields = ["weight", "waist", "hips", "chest", "arm", "thigh"] as const;
const bodyScanFields = ["bodyFatPercentage", "muscleMass", "skeletalMuscleMass", "visceralFatRating", "biologicalAge", "bmr", "bodyWater", "leanBodyMass", "bodyCompositionScore"] as const;
const scoreFields = ["energyScore", "confidenceScore", "sleepScore", "stressScore"] as const;
const bookletPages = [
  ["starting_point", "Starting Point page"],
  ["weekly_check_in", "Weekly Check-In page"],
  ["body_scan_report", "Body scan report"],
] as const;

function labelFromKey(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function emptyProgressDraft(weekNumber = 1): Partial<ProgressCheckIn> {
  return {
    type: "weekly",
    weekNumber,
    date: todayDate(),
    energyScore: 7,
    confidenceScore: 7,
    sleepScore: 7,
    stressScore: 5,
    customMetrics: [{ name: "", value: "", unit: "" }],
    shareWithCoachRequested: false,
    source: "manual",
  };
}

function hasAnyMeasurement(checkIn: Partial<ProgressCheckIn>) {
  return measurementFields.some((field) => Boolean(checkIn[field]));
}

function hasAnyBodyScan(checkIn: Partial<ProgressCheckIn>) {
  return bodyScanFields.some((field) => Boolean(checkIn[field])) || Boolean(checkIn.customMetrics?.some((metric) => metric.name || metric.value || metric.unit));
}

function progressCheckInStreak(checkIns: ProgressCheckIn[]) {
  const weeks = new Set(checkIns.filter((checkIn) => checkIn.type === "weekly" && checkIn.weekNumber).map((checkIn) => checkIn.weekNumber as number));
  let streak = 0;
  for (let week = 1; week <= 12; week += 1) {
    if (weeks.has(week)) streak += 1;
    else if (streak) break;
  }
  return streak;
}

function workoutNumber(workoutKey: "workout1" | "workout2") {
  return workoutKey === "workout1" ? 1 : 2;
}

function workoutFieldMetadata(workoutKey: "workout1" | "workout2", fieldType: "focus" | "warmup" | "cardio" | "coach_notes" | "exercise") {
  return { workoutNumber: workoutNumber(workoutKey), fieldType };
}

function stats(workbook: Workbook) {
  const completedDays = workbook.days.filter((day) => day.completedAt || (day.workoutComplete && day.habitComplete));
  const firstOpenIndex = workbook.days.findIndex((day) => !day.completedAt && !(day.workoutComplete && day.habitComplete));
  const currentDay = firstOpenIndex === -1 ? workbook.days.length : firstOpenIndex + 1;
  let streak = 0;
  for (const day of [...workbook.days].reverse()) {
    if (day.completedAt || (day.workoutComplete && day.habitComplete)) {
      streak += 1;
    } else if (streak) {
      break;
    }
  }
  const weekStart = Math.floor((Math.max(currentDay, 1) - 1) / 7) * 7;
  const weekDays = workbook.days.slice(weekStart, weekStart + 7);
  const weekCompleted = weekDays.filter((day) => day.completedAt || (day.workoutComplete && day.habitComplete)).length;
  return {
    completed: completedDays.length,
    currentDay,
    streak,
    percent: Math.round((completedDays.length / workbook.days.length) * 100),
    weekNumber: Math.floor((Math.max(currentDay, 1) - 1) / 7) + 1,
    weekCompleted,
  };
}

function badgeForDay(dayNumber: number) {
  return [...badgeDefinitions].reverse().find((badge) => dayNumber >= badge.day)?.label ?? "Day 1 Started";
}

function nextBadge(completed: number) {
  return badgeDefinitions.find((badge) => completed < badge.day) ?? badgeDefinitions[badgeDefinitions.length - 1];
}

function setupProgress(workbook: Workbook, profile: ParticipantProfile | null) {
  const checks = [
    Boolean(profile?.firstName),
    workbook.why.desiredResults.length > 0 || workbook.why.commitment.trim().length > 0,
    Boolean(workbook.workouts.workout1.focus || workbook.workouts.workout1.exercises.some((exercise) => exercise.name)),
    Boolean(workbook.nutrition.morningChoices || workbook.nutrition.waterGoal),
    Boolean(workbook.rituals.morningRitual || workbook.prepActions.length),
  ];
  const complete = checks.filter(Boolean).length;
  return { complete, total: checks.length, percent: Math.round((complete / checks.length) * 100) };
}

function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("progress-track h-3 overflow-hidden rounded-full bg-zinc-200", className)} data-animated="true">
      <div className="h-full rounded-full bg-gradient-to-r from-lime-400 via-teal-300 to-lime-300 transition-all duration-700" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

function ProgressRing({ percent }: { percent: number }) {
  return (
    <div className="animate-soft-pulse grid size-28 place-items-center rounded-full p-2 transition-all duration-700" style={{ background: `conic-gradient(#a3e635 ${percent * 3.6}deg, #2dd4bf ${percent * 3.6 + 16}deg, #e4e4e7 0deg)` }}>
      <div className="grid size-20 place-items-center rounded-full bg-white text-2xl font-black shadow-inner shadow-zinc-950/5">{percent}%</div>
    </div>
  );
}

function SetupProgress({ workbook, profile }: { workbook: Workbook; profile: ParticipantProfile | null }) {
  const progress = setupProgress(workbook, profile);
  return (
    <Card className="border-lime-100 bg-lime-50/80">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black text-lime-950">Setup your challenge</p>
          <p className="mt-1 text-xs font-bold text-lime-800">{progress.complete}/{progress.total} setup steps ready</p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-lime-900">{progress.percent}%</span>
      </div>
      <ProgressBar value={progress.percent} className="mt-4 bg-lime-100" />
    </Card>
  );
}

function BadgeGrid({ workbook, compact = false }: { workbook: Workbook; compact?: boolean }) {
  return (
    <div className={cn("grid gap-2", compact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4")}>
      {badgeDefinitions.map((badge) => {
        const unlocked = workbook.badges.includes(badge.label);
        const Icon = badge.icon;
        return (
          <div key={badge.id} className={cn("rounded-lg border p-3 transition", unlocked ? "animate-badge-glow border-lime-200 bg-zinc-950 text-white" : "border-zinc-200 bg-white text-zinc-500")}>
            <div className={cn("mb-3 grid size-9 place-items-center rounded-lg", unlocked ? "bg-lime-300 text-zinc-950" : "bg-zinc-100 text-zinc-400")}>
              {unlocked ? <Icon size={18} /> : <Circle size={18} />}
            </div>
            <p className="text-sm font-black">{badge.label}</p>
            {!compact ? <p className={cn("mt-1 text-xs font-bold leading-5", unlocked ? "text-zinc-300" : "text-zinc-500")}>{unlocked ? badge.copy : `Unlock at Day ${badge.day}`}</p> : null}
          </div>
        );
      })}
    </div>
  );
}

function MilestoneCelebration({ dayNumber, badge }: { dayNumber: number; badge: string }) {
  if (!milestoneDays.has(dayNumber)) return null;
  return (
    <Card className="animate-scale-in overflow-hidden border-lime-200 bg-zinc-950 text-white">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="grid size-16 shrink-0 place-items-center rounded-lg bg-lime-300 text-zinc-950 shadow-[0_0_36px_rgba(190,242,100,0.35)]">
          <Award size={30} />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-lime-200">Milestone unlocked</p>
          <h2 className="mt-1 text-2xl font-black">{badge}</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-300">You are building proof. One day at a time.</p>
        </div>
      </div>
    </Card>
  );
}

function PageHeader({ eyebrow, title, copy }: { eyebrow?: string; title: string; copy?: string }) {
  return (
    <header className="grid gap-2">
      {eyebrow ? <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">{eyebrow}</p> : null}
      <h1 className="text-3xl font-black leading-tight text-zinc-950 sm:text-4xl">{title}</h1>
      {copy ? <p className="max-w-2xl text-base leading-7 text-zinc-600">{copy}</p> : null}
    </header>
  );
}

function LoadingState() {
  return (
    <main className="grid min-h-screen place-items-center bg-zinc-950 p-5 text-white">
      <div className="w-full max-w-sm rounded-lg border border-white/10 bg-white/5 p-6">
        <div className="h-3 w-24 rounded-full bg-lime-300" />
        <div className="mt-5 h-8 w-52 rounded-lg bg-white/15" />
        <div className="mt-3 h-4 w-full rounded-lg bg-white/10" />
        <p className="mt-5 text-sm font-bold text-zinc-300">Loading your challenge workbook...</p>
      </div>
    </main>
  );
}

function SidePanel({ workbook }: { workbook: Workbook }) {
  const current = stats(workbook);
  const upcomingBadge = nextBadge(current.completed);
  return (
    <div className="grid gap-4">
      <Card className="premium-card grid justify-items-center text-center">
        <ProgressRing percent={current.percent} />
        <p className="mt-3 text-sm font-bold text-zinc-500">Overall progress</p>
        <ProgressBar value={current.percent} className="mt-3 w-full" />
      </Card>
      <Card>
        <p className="text-sm font-bold text-zinc-500">This week</p>
        <p className="mt-2 text-3xl font-black">{current.weekCompleted}/7</p>
        <p className="mt-1 text-sm text-zinc-600">Week {current.weekNumber} movement days complete.</p>
        <ProgressBar value={(current.weekCompleted / 7) * 100} className="mt-4" />
      </Card>
      <Card className="border-lime-100 bg-lime-50">
        <div className="flex items-start gap-3">
          <Medal className="mt-1 shrink-0 text-lime-800" />
          <div>
            <p className="font-black text-lime-950">Next badge</p>
            <p className="mt-1 text-sm font-bold text-lime-900">{upcomingBadge.label}</p>
            <p className="mt-1 text-xs leading-5 text-lime-800">{Math.max(0, upcomingBadge.day - current.completed)} day{upcomingBadge.day - current.completed === 1 ? "" : "s"} to go.</p>
          </div>
        </div>
      </Card>
      <Card className="border-purple-100 bg-purple-50">
        <p className="font-black text-purple-950">Do not miss twice</p>
        <p className="mt-2 text-sm leading-6 text-purple-900">If momentum dips, restart with 10 minutes and ask your coach for a simple check-in.</p>
      </Card>
    </div>
  );
}

function SetupRequired() {
  return (
    <main className="grid min-h-screen place-items-center bg-zinc-50 p-5">
      <Card className="w-full max-w-md">
        <PageHeader title="Unlock your challenge first" copy="Enter your club code and password before your workbook is created on this device." />
        <ButtonLink href="/" className="mt-5 w-full">Go to unlock</ButtonLink>
      </Card>
    </main>
  );
}

function CheckboxRow({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return (
    <label className={cn("flex min-h-14 items-center gap-3 rounded-lg border p-3 font-black transition", checked ? "animate-tick-pop border-lime-300 bg-lime-50" : "border-zinc-200 bg-white")}>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

export function ParticipantApp({ view, dayNumber = 1, weekNumber = 1 }: { view: string; dayNumber?: number; weekNumber?: number }) {
  const router = useRouter();
  const [profile, setProfile] = useState<ParticipantProfile | null>(null);
  const [workbook, setWorkbook] = useState<Workbook | null>(null);
  const [firstName, setFirstName] = useState("");
  const [notice, setNotice] = useState("");
  const [progressDraft, setProgressDraft] = useState<Partial<ProgressCheckIn>>(() => emptyProgressDraft());
  const [progressPhotos, setProgressPhotos] = useState<ProgressPhotoPreview[]>([]);
  const [photoMessage, setPhotoMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      const currentProfile = getProfile();
      setProfile(currentProfile);
      setWorkbook(getWorkbook());
      trackEvent(view === "dashboard" ? "dashboard_viewed" : "app_loaded", currentProfile);
    });
    return () => {
      cancelled = true;
    };
  }, [view]);

  useEffect(() => {
    let cancelled = false;
    if (view !== "progress") return;
    listProgressPhotos()
      .then((photos) => {
        if (cancelled) {
          photos.forEach((photo) => URL.revokeObjectURL(photo.objectUrl));
          return;
        }
        setProgressPhotos((current) => {
          current.forEach((photo) => URL.revokeObjectURL(photo.objectUrl));
          return photos;
        });
      })
      .catch(() => setPhotoMessage("Progress photos could not be loaded on this device."));
    return () => {
      cancelled = true;
      setProgressPhotos((current) => {
        current.forEach((photo) => URL.revokeObjectURL(photo.objectUrl));
        return [];
      });
    };
  }, [view]);

  const currentStats = useMemo(() => (workbook ? stats(workbook) : null), [workbook]);

  if (!workbook || !currentStats) return <LoadingState />;
  const loadedWorkbook = workbook;
  const loadedStats = currentStats;

  function update(next: Workbook) {
    saveWorkbook(next);
    setWorkbook({ ...next });
  }

  function updateProfile(patch: Partial<ParticipantProfile>) {
    if (!profile) return;
    const updated = createOrUpdateProfile({ ...profile, ...patch, firstName: patch.firstName ?? profile.firstName, clubId: profile.clubId, clubName: profile.clubName });
    setProfile(updated);
  }

  function updateDay(day: DayEntry, patch: Partial<DayEntry>) {
    const days = [...loadedWorkbook.days];
    days[day.dayNumber - 1] = { ...day, ...patch, updatedAt: new Date().toISOString() };
    update({ ...loadedWorkbook, days });
  }

  function completeDay(day: DayEntry) {
    const badge = badgeForDay(day.dayNumber);
    const badgeAlreadyUnlocked = loadedWorkbook.badges.includes(badge);
    const nextBadges = badgeAlreadyUnlocked ? loadedWorkbook.badges : [...loadedWorkbook.badges, badge];
    const days = [...loadedWorkbook.days];
    days[day.dayNumber - 1] = { ...day, workoutComplete: true, habitComplete: true, completedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    update({ ...loadedWorkbook, days, badges: nextBadges });
    setNotice(day.dayNumber === 1 ? "Day 1 complete. You are officially moving." : `Day ${day.dayNumber} complete. Momentum is building.`);
    trackEvent("day_completed", profile, { workoutChecked: true, habitChecked: true, dayCompleted: true }, { dayNumber: day.dayNumber });
    if (!badgeAlreadyUnlocked) trackEvent("badge_unlocked", profile, { badgeId: badge });
  }

  function updateReview(review: WeeklyReview, patch: Partial<WeeklyReview>) {
    const weeklyReviews = [...loadedWorkbook.weeklyReviews];
    weeklyReviews[review.weekNumber - 1] = { ...review, ...patch };
    update({ ...loadedWorkbook, weeklyReviews });
  }

  async function refreshProgressPhotos() {
    const photos = await listProgressPhotos();
    setProgressPhotos((current) => {
      current.forEach((photo) => URL.revokeObjectURL(photo.objectUrl));
      return photos;
    });
  }

  function updateProgressDraft(patch: Partial<ProgressCheckIn>) {
    setProgressDraft((current) => ({ ...current, ...patch }));
  }

  function updateCustomMetric(index: number, patch: Partial<ProgressCustomMetric>) {
    const customMetrics = [...(progressDraft.customMetrics ?? [{ name: "", value: "", unit: "" }])];
    const existing = customMetrics[index] ?? { name: "", value: "", unit: "" };
    customMetrics[index] = { ...existing, ...patch };
    setProgressDraft((current) => ({ ...current, customMetrics }));
  }

  function saveProgressCheckIn() {
    const now = new Date().toISOString();
    const type = progressDraft.type ?? "weekly";
    const checkIn: ProgressCheckIn = {
      id: crypto.randomUUID(),
      type,
      weekNumber: type === "weekly" ? Number(progressDraft.weekNumber ?? loadedStats.weekNumber) : undefined,
      date: progressDraft.date ?? todayDate(),
      weight: progressDraft.weight,
      waist: progressDraft.waist,
      hips: progressDraft.hips,
      chest: progressDraft.chest,
      arm: progressDraft.arm,
      thigh: progressDraft.thigh,
      bodyFatPercentage: progressDraft.bodyFatPercentage,
      muscleMass: progressDraft.muscleMass,
      skeletalMuscleMass: progressDraft.skeletalMuscleMass,
      visceralFatRating: progressDraft.visceralFatRating,
      biologicalAge: progressDraft.biologicalAge,
      bmr: progressDraft.bmr,
      bodyWater: progressDraft.bodyWater,
      leanBodyMass: progressDraft.leanBodyMass,
      bodyCompositionScore: progressDraft.bodyCompositionScore,
      energyScore: progressDraft.energyScore,
      confidenceScore: progressDraft.confidenceScore,
      sleepScore: progressDraft.sleepScore,
      stressScore: progressDraft.stressScore,
      mainGoal: progressDraft.mainGoal,
      weeklyWin: progressDraft.weeklyWin,
      weeklyObstacle: progressDraft.weeklyObstacle,
      nextWeekFocus: progressDraft.nextWeekFocus,
      customMetrics: (progressDraft.customMetrics ?? []).filter((metric) => metric.name || metric.value || metric.unit),
      shareWithCoachRequested: Boolean(progressDraft.shareWithCoachRequested),
      source: progressDraft.source ?? "manual",
      createdAt: now,
      updatedAt: now,
    };
    const checkIns = [checkIn, ...loadedWorkbook.progressVault.checkIns].slice(0, 24);
    update({
      ...loadedWorkbook,
      progressVault: {
        ...loadedWorkbook.progressVault,
        privacyMode: checkIn.shareWithCoachRequested ? "coach_review_requested" : loadedWorkbook.progressVault.privacyMode,
        checkIns,
      },
    });
    const measurementAdded = hasAnyMeasurement(checkIn);
    const bodyScanAdded = hasAnyBodyScan(checkIn);
    if (measurementAdded) trackEvent("measurement_added", profile, { measurementAdded: true, checkInType: checkIn.type, checkInWeek: checkIn.weekNumber });
    if (bodyScanAdded) trackEvent("body_scan_added", profile, { bodyScanAdded: true, checkInType: checkIn.type, checkInWeek: checkIn.weekNumber });
    if (checkIn.shareWithCoachRequested) trackEvent("coach_review_requested", profile, { coachReviewRequested: true, checkInType: checkIn.type, checkInWeek: checkIn.weekNumber });
    trackEvent("progress_check_in_completed", profile, {
      checkInType: checkIn.type,
      checkInWeek: checkIn.weekNumber,
      checkInStreak: progressCheckInStreak(checkIns),
      progressPhotoAdded: progressPhotos.length > 0,
      bodyScanAdded,
      measurementAdded,
      coachReviewRequested: checkIn.shareWithCoachRequested,
    });
    setNotice("Progress check-in saved locally. Exact measurements and notes were not sent to your club.");
    setProgressDraft(emptyProgressDraft(loadedStats.weekNumber));
  }

  async function addProgressPhoto(angle: "before" | "front" | "side" | "back" | "weekly" | "scan_page", file?: File) {
    if (!file) return;
    setPhotoMessage("");
    if (!validateProgressPhotoSize(file)) {
      setPhotoMessage("This photo is too large for local storage. Try a smaller image.");
      return;
    }
    const checkInId = progressDraft.type === "starting_point" ? "starting-point" : `week-${progressDraft.weekNumber ?? loadedStats.weekNumber}`;
    try {
      await saveProgressPhoto(checkInId, angle, file);
      await refreshProgressPhotos();
      trackEvent("progress_photo_added", profile, { progressPhotoAdded: true, checkInType: progressDraft.type ?? "weekly", checkInWeek: progressDraft.weekNumber ?? loadedStats.weekNumber });
      setPhotoMessage("Photo saved locally on this device.");
    } catch {
      setPhotoMessage("Photo could not be saved on this device. Try a smaller image or free up storage.");
    }
  }

  async function removeProgressPhoto(photoId: string) {
    await deleteProgressPhoto(photoId);
    await refreshProgressPhotos();
    setPhotoMessage("Photo removed from this device.");
  }

  if (view === "welcome") {
    const club = getUnlockedClub();
    if (!club) return <SetupRequired />;
    return (
      <main className="dark-product-bg grid min-h-screen place-items-center p-5 text-white">
        <section className="animate-scale-in w-full max-w-xl rounded-lg border border-white/10 bg-white p-6 text-zinc-950 shadow-2xl shadow-black/30 sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-lg bg-lime-300 text-zinc-950"><CheckCircle2 size={24} /></div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">Club unlocked</p>
              <p className="text-sm font-bold text-zinc-500">Your workbook is ready to create.</p>
            </div>
          </div>
          <h1 className="text-3xl font-black leading-tight sm:text-4xl">Welcome to the 30/30 Challenge at {club.clubName}.</h1>
          <p className="mt-3 leading-7 text-zinc-600">You are joining with this club. Your private workbook will live on this device.</p>
          <div className="mt-6 grid gap-4">
            <Field label="What should we call you?" value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder="First name only" autoComplete="given-name" />
            <Button
              onClick={() => {
                const p = createOrUpdateProfile({ firstName, clubId: club.clubId, clubName: club.clubName });
                setProfile(p);
                trackEvent("participant_created", p, { completed: true });
                router.push("/onboarding");
              }}
              disabled={!firstName.trim()}
            >
              Build my plan <ChevronRight size={18} />
            </Button>
            <p className="flex gap-2 text-sm leading-6 text-zinc-600"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />First name only. No account, email, phone or health measurements required.</p>
          </div>
        </section>
      </main>
    );
  }

  const shell = (children: React.ReactNode) => <AppShell side={<SidePanel workbook={workbook} />}>{children}</AppShell>;

  if (!profile) {
    return shell(
      <Card className="mx-auto w-full max-w-xl">
        <PageHeader title="Finish your setup" copy="Your club is unlocked, but your workbook still needs a first name before you start." />
        <ButtonLink href="/welcome" className="mt-5 w-full">Add first name</ButtonLink>
      </Card>,
    );
  }

  if (view === "onboarding") {
    return shell(
      <section className="grid gap-5">
        <Card className="overflow-hidden bg-zinc-950 text-white">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-bold text-lime-300">Hey {profile.firstName}</p>
              <h1 className="mt-2 text-3xl font-black leading-tight sm:text-5xl">Let&apos;s build your plan.</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300">For the next 30 days, your goal is simple: 30 minutes of intentional movement each day. Done beats perfect.</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="text-3xl font-black text-lime-200">30</p>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-400">minutes daily</p>
            </div>
          </div>
        </Card>
        <SetupProgress workbook={workbook} profile={profile} />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {onboardingSteps.map(([step, Icon], index) => (
            <Card key={step} className="interactive-lift min-h-36" style={{ animationDelay: `${index * 60}ms` }}>
              <div className="grid size-10 place-items-center rounded-lg bg-teal-50 text-teal-700"><Icon size={22} /></div>
              <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-zinc-400">Step {index + 1}</p>
              <p className="mt-1 font-black">{step}</p>
            </Card>
          ))}
        </div>
        <Card className="border-teal-100 bg-teal-50">
          <p className="font-black text-teal-950">Privacy-safe by design</p>
          <p className="mt-2 text-sm leading-6 text-teal-900">Your personal notes, goals and reflections are stored on this device only. Your club can only see basic progress such as days completed, current day reached and whether you may need a check-in.</p>
        </Card>
        <Card className="grid gap-4 md:grid-cols-3">
          <Field label="Start date" type="date" defaultValue={profile.startDate} onBlur={(event) => updateProfile({ startDate: event.target.value })} />
          <Field label="Main goal optional" defaultValue={profile.mainGoal} onBlur={(event) => updateProfile({ mainGoal: event.target.value })} placeholder="e.g. rebuild routine" />
          <Field label="Coach/PT name optional" defaultValue={profile.coachName} onBlur={(event) => updateProfile({ coachName: event.target.value })} placeholder="Optional" />
        </Card>
        <ButtonLink href="/why" onClick={() => trackEvent("onboarding_completed", profile, { completed: true })}>Start My Why <ChevronRight size={18} /></ButtonLink>
      </section>
    );
  }

  if (view === "why") {
    return shell(
      <section className="grid gap-5">
        <PageHeader eyebrow="Private workbook" title="My Why" copy="This is your reason to keep showing up. Choose what matters, then write the plan you will come back to when life gets busy." />
        <SetupProgress workbook={workbook} profile={profile} />
        <div className="grid gap-2 sm:grid-cols-3">
          {desiredResults.map((item) => {
            const selected = workbook.why.desiredResults.includes(item);
            return (
              <button
                key={item}
                onClick={() => update({ ...workbook, why: { ...workbook.why, desiredResults: selected ? workbook.why.desiredResults.filter((value) => value !== item) : [...workbook.why.desiredResults, item] } })}
                className={cn("interactive-lift min-h-14 rounded-lg border p-3 text-left font-black transition", selected ? "border-lime-300 bg-lime-100" : "border-zinc-200 bg-white hover:border-zinc-300")}
              >
                {item}
              </button>
            );
          })}
        </div>
        <Card className="grid gap-4">
          <p className="rounded-lg bg-zinc-50 p-3 text-sm font-bold leading-6 text-zinc-600">Momentum beats perfection. Keep this honest and simple.</p>
          <TextArea label="My top 3 reasons" value={workbook.why.topReasons.join("\n")} onChange={(event) => update({ ...workbook, why: { ...workbook.why, topReasons: event.target.value.split("\n").slice(0, 3) } })} />
          <TextArea label="What could get in my way?" value={workbook.why.obstacles} onChange={(event) => update({ ...workbook, why: { ...workbook.why, obstacles: event.target.value } })} />
          <TextArea label="My backup plan when life gets busy" value={workbook.why.backupPlan} onChange={(event) => update({ ...workbook, why: { ...workbook.why, backupPlan: event.target.value } })} />
          <TextArea label="My commitment" value={workbook.why.commitment} onChange={(event) => update({ ...workbook, why: { ...workbook.why, commitment: event.target.value, signedAt: new Date().toISOString() } })} />
        </Card>
        <ButtonLink href="/workouts" onClick={() => trackEvent("my_why_completed", profile, { completed: true })}>Next: Workouts <ChevronRight size={18} /></ButtonLink>
      </section>
    );
  }

  if (view === "workouts") {
    return shell(
      <section className="grid gap-5">
        <PageHeader eyebrow="Workout setup" title="Build two go-to workouts" copy="Your coach can help fill this in. Keep the plan simple, repeatable and easy to follow later." />
        <SetupProgress workbook={workbook} profile={profile} />
        <Card className="grid gap-3 border-teal-100 bg-teal-50">
          <p className="font-black text-teal-950">Coach tip: record a short 10-30 second clip so the member can replay the movement later.</p>
          <p className="text-sm leading-6 text-teal-900">Videos and notes stay on this device unless cloud video sync is added later.</p>
        </Card>
        <div className="grid min-w-0 gap-4 xl:grid-cols-2">
          {(["workout1", "workout2"] as const).map((key) => {
            const workout = workbook.workouts[key];
            return (
              <Card key={key} className="grid min-w-0 gap-4 overflow-hidden premium-card">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-black">{workout.name}</h2>
                  <span className="rounded-full bg-zinc-950 px-3 py-1 text-xs font-black text-lime-300">{workout.code}</span>
                </div>
                {[
                  ["focus", "focus"],
                  ["warmUp", "warmup"],
                  ["cardioFinisher", "cardio"],
                  ["coachNotes", "coach_notes"],
                ].map(([field, fieldType]) => (
                  <WorkoutCaptureField
                    key={field}
                    label={labelFromKey(field)}
                    fieldKey={`${key}.${field}` as WorkoutAttachmentFieldKey}
                    value={(workout as unknown as Record<string, string>)[field]}
                    onChange={(value) => update({ ...workbook, workouts: { ...workbook.workouts, [key]: { ...workout, [field]: value } } })}
                    analyticsMetadata={workoutFieldMetadata(key, fieldType as "focus" | "warmup" | "cardio" | "coach_notes")}
                    profile={profile}
                    rows={field === "coachNotes" ? 4 : 3}
                  />
                ))}
                <div className="grid min-w-0 gap-3">
                  <p className="text-sm font-black text-zinc-700">Exercises</p>
                  {workout.exercises.map((exercise, index) => (
                    <div key={`${workout.code}-${index}`} className="grid min-w-0 gap-3 rounded-lg border border-zinc-200 bg-white/85 p-3 shadow-sm shadow-zinc-950/[0.02]">
                      <WorkoutCaptureField
                        label={`Exercise ${index + 1}`}
                        fieldKey={`${key}.exercise${index + 1}` as WorkoutAttachmentFieldKey}
                        value={exercise.name}
                        onChange={(value) => {
                          const exercises = [...workout.exercises];
                          exercises[index] = { ...exercise, name: value };
                          update({ ...workbook, workouts: { ...workbook.workouts, [key]: { ...workout, exercises } } });
                        }}
                        analyticsMetadata={workoutFieldMetadata(key, "exercise")}
                        profile={profile}
                        placeholder="Exercise name, cues or coaching notes"
                        rows={2}
                      />
                      <div className="grid min-w-0 gap-2 sm:grid-cols-2">
                        <Field label="Sets" value={exercise.sets} onChange={(event) => {
                          const exercises = [...workout.exercises];
                          exercises[index] = { ...exercise, sets: event.target.value };
                          update({ ...workbook, workouts: { ...workbook.workouts, [key]: { ...workout, exercises } } });
                        }} />
                        <Field label="Reps" value={exercise.reps} onChange={(event) => {
                          const exercises = [...workout.exercises];
                          exercises[index] = { ...exercise, reps: event.target.value };
                          update({ ...workbook, workouts: { ...workbook.workouts, [key]: { ...workout, exercises } } });
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
        <ButtonLink href="/nutrition" onClick={() => trackEvent("workout_setup_completed", profile, { completed: true })}>Next: Nutrition <ChevronRight size={18} /></ButtonLink>
      </section>
    );
  }

  if (view === "nutrition") {
    return shell(
      <section className="grid gap-5">
        <PageHeader eyebrow="Nutrition setup" title="Eat Like a Legend" copy="A simple plan beats a perfect plan you never use. Keep it repeatable." />
        <SetupProgress workbook={workbook} profile={profile} />
        <Card className="grid gap-4">
          <p className="rounded-lg bg-zinc-50 p-3 text-sm font-bold leading-6 text-zinc-600">Keep it simple. Make it repeatable.</p>
          {["morningChoices", "lunchChoices", "dinnerChoices", "snacksRecovery", "waterGoal"].map((key) => (
            <TextArea key={key} label={labelFromKey(key)} value={String(workbook.nutrition[key] ?? "")} onChange={(event) => update({ ...workbook, nutrition: { ...workbook.nutrition, [key]: event.target.value } })} />
          ))}
        </Card>
        <div className="grid gap-2 sm:grid-cols-5">
          {["Protein at each meal", "Fruit and veg daily", "Water first", "Plan ahead", "Keep it simple"].map((rule) => <span key={rule} className="interactive-lift rounded-lg border border-lime-200 bg-lime-50 p-3 text-sm font-black">{rule}</span>)}
        </div>
        <ButtonLink href="/rituals" onClick={() => trackEvent("nutrition_setup_completed", profile, { completed: true })}>Next: Rituals <ChevronRight size={18} /></ButtonLink>
      </section>
    );
  }

  if (view === "rituals") {
    return shell(
      <section className="grid gap-5">
        <PageHeader eyebrow="Prep and rituals" title="Make consistency easier" copy="Set up the small rituals that reduce friction before your day gets busy. Done beats perfect." />
        <SetupProgress workbook={workbook} profile={profile} />
        <Card className="grid gap-4">
          <TextArea label="Shopping list" value={workbook.shoppingList} onChange={(event) => update({ ...workbook, shoppingList: event.target.value })} />
          <div className="grid gap-2 sm:grid-cols-3">
            {prepActions.map((action) => {
              const selected = workbook.prepActions.includes(action);
              return (
                <button key={action} onClick={() => update({ ...workbook, prepActions: selected ? workbook.prepActions.filter((item) => item !== action) : [...workbook.prepActions, action] })} className={cn("interactive-lift min-h-12 rounded-lg border p-3 text-left text-sm font-black capitalize", selected ? "border-lime-300 bg-lime-100" : "border-zinc-200 bg-zinc-50")}>
                  {action}
                </button>
              );
            })}
          </div>
        </Card>
        <Card className="grid gap-4">
          {["morningRitual", "eveningReset", "nonNegotiables", "whenLifeGetsBusy", "accountabilityPeople", "bounceBackPlan"].map((key) => (
            <TextArea key={key} label={labelFromKey(key)} value={String(workbook.rituals[key] ?? "")} onChange={(event) => update({ ...workbook, rituals: { ...workbook.rituals, [key]: event.target.value } })} />
          ))}
        </Card>
        <ButtonLink href="/dashboard" onClick={() => trackEvent("ritual_setup_completed", profile, { completed: true })}>Go to Dashboard <ChevronRight size={18} /></ButtonLink>
      </section>
    );
  }

  if (view === "day") {
    const day = workbook.days[dayNumber - 1] ?? workbook.days[0];
    const dayDone = Boolean(day.completedAt || (day.workoutComplete && day.habitComplete));
    const dayBadge = badgeForDay(day.dayNumber);
    return shell(
      <section className="grid gap-5">
        <Card className="overflow-hidden bg-zinc-950 text-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-lime-300">Daily tracker</p>
              <h1 className="mt-2 text-4xl font-black leading-none">Day {day.dayNumber}</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-300">Plan the minimum. Tick the two actions. Keep private notes here only on this device.</p>
            </div>
            <span className={cn("rounded-full px-3 py-1 text-xs font-black", dayDone ? "bg-lime-300 text-zinc-950" : "bg-white/10 text-zinc-300")}>{dayDone ? "Complete" : "Ready"}</span>
          </div>
        </Card>
        {notice || day.completedAt ? (
          <>
          <MilestoneCelebration dayNumber={day.dayNumber} badge={dayBadge} />
          <Card className="border-lime-200 bg-lime-50">
            <div className="flex items-start gap-3">
              <Award className="mt-1 text-lime-700" />
              <div>
                <p className="font-black text-zinc-950">{notice || `Day ${day.dayNumber} complete.`}</p>
                <p className="mt-1 text-sm leading-6 text-zinc-700">Small actions stack up. Come back tomorrow and keep the chain moving.</p>
              </div>
            </div>
          </Card>
          </>
        ) : null}
        <Card className="grid gap-4 premium-card">
          <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
            <p className="font-black text-teal-950">Low energy today?</p>
            <p className="mt-1 text-sm leading-6 text-teal-900">Do 10 minutes. Starting counts. Don&apos;t miss twice.</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <TextArea label="Planned workout / movement" value={day.plannedWorkoutMovement} onChange={(event) => updateDay(day, { plannedWorkoutMovement: event.target.value })} />
            <TextArea label="Planned nutrition / habit" value={day.plannedNutritionHabit} onChange={(event) => updateDay(day, { plannedNutritionHabit: event.target.value })} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <CheckboxRow checked={day.workoutComplete} label="Workout / movement complete" onChange={(checked) => { updateDay(day, { workoutComplete: checked }); trackEvent("workout_ticked", profile, { workoutChecked: checked }, { dayNumber: day.dayNumber }); }} />
            <CheckboxRow checked={day.habitComplete} label="Nutrition / habit complete" onChange={(checked) => { updateDay(day, { habitComplete: checked }); trackEvent("habit_ticked", profile, { habitChecked: checked }, { dayNumber: day.dayNumber }); }} />
          </div>
          <TextArea label="Private note (stored on this device only)" value={day.privateNote} onChange={(event) => updateDay(day, { privateNote: event.target.value })} />
          <Button onClick={() => completeDay(day)} className={dayDone ? "animate-badge-glow" : undefined}>{day.dayNumber === 1 ? "Complete Day 1" : "Mark day complete"}</Button>
        </Card>
      </section>
    );
  }

  if (view === "week") {
    const review = workbook.weeklyReviews[weekNumber - 1] ?? workbook.weeklyReviews[0];
    return shell(
      <section className="grid gap-5">
        <Card className="bg-zinc-950 text-white">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-lime-300">Weekly review</p>
          <h1 className="mt-2 text-4xl font-black leading-tight">Week {review.weekNumber} Review</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300">Days {review.daysRange}. Your written reflection stays private. Your club only receives the completion count.</p>
        </Card>
        <Card className="grid gap-4">
          <p className="rounded-lg bg-zinc-50 p-3 text-sm font-bold leading-6 text-zinc-600">Lock in the learning. Two minutes now makes next week easier.</p>
          {[
            ["whatWentWell", "What I did well this week"],
            ["whatCanImprove", "What I can improve next week"],
            ["biggestWins", "My biggest wins"],
            ["top3Rituals", "My top 3 rituals for next week"],
          ].map(([key, label]) => (
            <TextArea key={key} label={label} value={String((review as unknown as Record<string, string>)[key])} onChange={(event) => updateReview(review, { [key]: event.target.value } as Partial<WeeklyReview>)} />
          ))}
          <Field label="Days completed this week" type="number" min={0} max={7} value={review.daysCompletedThisWeek} onChange={(event) => updateReview(review, { daysCompletedThisWeek: Number(event.target.value) })} />
          <Button onClick={() => { updateReview(review, { completedAt: new Date().toISOString() }); setNotice("Weekly review complete. You have a clearer plan for the next seven days."); trackEvent("weekly_review_completed", profile, { daysCompletedThisWeek: review.daysCompletedThisWeek }, { weekNumber: review.weekNumber }); }}>Complete review</Button>
        </Card>
        {notice ? <Card className="animate-scale-in border-lime-200 bg-lime-50 font-black">{notice}</Card> : null}
      </section>
    );
  }

  if (view === "hacks") {
    const savedHacks = workbook.settings.savedHacks ?? [];
    const tryTodayHacks = workbook.settings.tryTodayHacks ?? [];
    const toggleHack = (type: "savedHacks" | "tryTodayHacks", id: string) => {
      const current = workbook.settings[type] ?? [];
      update({
        ...workbook,
        settings: {
          ...workbook.settings,
          [type]: current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
        },
      });
      trackEvent("hack_viewed", profile, { action: type === "savedHacks" ? "saved" : "try_today", section: id });
    };
    return shell(
      <section className="grid gap-5">
        <Card className="bg-zinc-950 text-white">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-lime-300">Hacks and rituals</p>
          <h1 className="mt-2 text-4xl font-black leading-tight">Small moves that make the challenge easier.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300">Use these when motivation is low or your week gets messy. Save the ones that feel useful.</p>
        </Card>
        <div className="grid gap-3 md:grid-cols-3">
          <Card className="border-lime-100 bg-lime-50"><p className="text-sm font-bold text-lime-800">Saved rituals</p><p className="mt-1 text-3xl font-black">{savedHacks.length}</p></Card>
          <Card className="border-teal-100 bg-teal-50"><p className="text-sm font-bold text-teal-800">Try today</p><p className="mt-1 text-3xl font-black">{tryTodayHacks.length}</p></Card>
          <Card className="border-purple-100 bg-purple-50"><p className="text-sm font-bold text-purple-800">Top reminder</p><p className="mt-1 font-black">Never miss twice.</p></Card>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {hacks.map((hack, index) => {
            const Icon = hack.icon;
            const saved = savedHacks.includes(hack.id);
            const trying = tryTodayHacks.includes(hack.id);
            return (
            <Card key={hack.id} className={cn("interactive-lift min-h-48", saved && "border-lime-200 bg-lime-50")} style={{ animationDelay: `${index * 35}ms` }}>
              <div className="flex items-start justify-between gap-3">
                <div className="grid size-10 place-items-center rounded-lg bg-zinc-950 text-lime-300"><Icon size={19} /></div>
                <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-black text-zinc-600">{hack.category}</span>
              </div>
              <h2 className="mt-4 font-black">{hack.title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{hack.copy}</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <Button variant={saved ? "primary" : "outline"} onClick={() => toggleHack("savedHacks", hack.id)} className="min-h-10 px-3 py-2 text-xs">{saved ? "Saved" : "Save this"}</Button>
                <Button variant={trying ? "soft" : "outline"} onClick={() => toggleHack("tryTodayHacks", hack.id)} className="min-h-10 px-3 py-2 text-xs">{trying ? "Trying today" : "Try today"}</Button>
              </div>
            </Card>
          );})}
        </div>
      </section>
    );
  }

  if (view === "progress") {
    const checkIns = workbook.progressVault.checkIns;
    const latest = checkIns[0];
    const checkInStreak = progressCheckInStreak(checkIns);
    const bodyScanCount = checkIns.filter(hasAnyBodyScan).length;
    const coachReviewCount = checkIns.filter((checkIn) => checkIn.shareWithCoachRequested).length;
    const measurementCount = checkIns.filter(hasAnyMeasurement).length;

    return shell(
      <section className="grid gap-5">
        <Card className="overflow-hidden bg-zinc-950 text-white">
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-lime-300">Progress Vault</p>
              <h1 className="mt-2 text-4xl font-black leading-tight">Progress beyond the scale.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300">Optional check-ins for photos, measurements, body scan metrics, energy, confidence and week-by-week wins. Private by default.</p>
            </div>
            <div className="grid size-24 place-items-center rounded-full bg-lime-300 text-zinc-950">
              <TrendingUp size={42} />
            </div>
          </div>
        </Card>

        <Card className="border-teal-100 bg-teal-50">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 shrink-0 text-teal-700" />
            <div>
              <p className="font-black text-teal-950">Privacy-first check-ins</p>
              <p className="mt-2 text-sm leading-6 text-teal-900">Progress photos, exact weight, measurements, body scan metrics and notes stay on this device. Your club only gets safe yes/no signals unless you explicitly request coach review in a future sharing flow.</p>
            </div>
          </div>
        </Card>

        <div className="grid gap-3 md:grid-cols-4">
          <Card className="interactive-lift"><CheckCircle2 className="text-lime-700" /><p className="mt-3 text-sm font-bold text-zinc-500">Check-ins</p><p className="text-3xl font-black">{checkIns.length}</p></Card>
          <Card className="interactive-lift"><Camera className="text-teal-700" /><p className="mt-3 text-sm font-bold text-zinc-500">Local photos</p><p className="text-3xl font-black">{progressPhotos.length}</p></Card>
          <Card className="interactive-lift"><Ruler className="text-purple-700" /><p className="mt-3 text-sm font-bold text-zinc-500">With measurements</p><p className="text-3xl font-black">{measurementCount}</p></Card>
          <Card className="interactive-lift"><Gauge className="text-zinc-900" /><p className="mt-3 text-sm font-bold text-zinc-500">Body scans</p><p className="text-3xl font-black">{bodyScanCount}</p></Card>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
          <Card className="grid gap-4 premium-card">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-teal-700">Progress Check-In</p>
              <h2 className="mt-2 text-2xl font-black">Save a starting point or weekly check-in</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">Use supportive, informational tracking only. Body scan estimates are not medical advice.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="grid gap-2 text-sm font-bold text-zinc-800">Check-in type
                <select className="min-h-12 rounded-lg border border-zinc-200 bg-white px-3 text-base outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100" value={progressDraft.type ?? "weekly"} onChange={(event) => updateProgressDraft({ type: event.target.value as ProgressCheckIn["type"] })}>
                  <option value="starting_point">Starting point</option>
                  <option value="weekly">Weekly check-in</option>
                </select>
              </label>
              <Field label="Date" type="date" value={progressDraft.date ?? todayDate()} onChange={(event) => updateProgressDraft({ date: event.target.value })} />
              <Field label="Week number" type="number" min={1} max={12} value={progressDraft.weekNumber ?? currentStats.weekNumber} onChange={(event) => updateProgressDraft({ weekNumber: Number(event.target.value) })} />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {measurementFields.map((field) => (
                <Field key={field} label={labelFromKey(field)} value={progressDraft[field] ?? ""} onChange={(event) => updateProgressDraft({ [field]: event.target.value } as Partial<ProgressCheckIn>)} placeholder={field === "weight" ? "Optional" : "cm"} />
              ))}
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <Scale className="text-teal-700" />
                <p className="font-black">Body scan metrics optional</p>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {bodyScanFields.map((field) => (
                  <Field key={field} label={labelFromKey(field)} value={progressDraft[field] ?? ""} onChange={(event) => updateProgressDraft({ [field]: event.target.value } as Partial<ProgressCheckIn>)} placeholder="Optional" />
                ))}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {(progressDraft.customMetrics ?? [{ name: "", value: "", unit: "" }]).map((metric, index) => (
                  <div key={index} className="grid gap-2 rounded-lg bg-zinc-50 p-3">
                    <Field label="Custom metric" value={metric.name} onChange={(event) => updateCustomMetric(index, { name: event.target.value })} placeholder="Metric name" />
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Field label="Value" value={metric.value} onChange={(event) => updateCustomMetric(index, { value: event.target.value })} />
                      <Field label="Unit" value={metric.unit} onChange={(event) => updateCustomMetric(index, { unit: event.target.value })} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              {scoreFields.map((field) => (
                <Field key={field} label={`${labelFromKey(field)} /10`} type="number" min={1} max={10} value={progressDraft[field] ?? ""} onChange={(event) => updateProgressDraft({ [field]: Number(event.target.value) } as Partial<ProgressCheckIn>)} />
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <TextArea label="Weekly win" value={progressDraft.weeklyWin ?? ""} onChange={(event) => updateProgressDraft({ weeklyWin: event.target.value })} placeholder="What improved this week?" />
              <TextArea label="What got in the way?" value={progressDraft.weeklyObstacle ?? ""} onChange={(event) => updateProgressDraft({ weeklyObstacle: event.target.value })} placeholder="Optional and private" />
              <TextArea label="Next week focus" value={progressDraft.nextWeekFocus ?? ""} onChange={(event) => updateProgressDraft({ nextWeekFocus: event.target.value })} />
              <TextArea label="Main goal reminder" value={progressDraft.mainGoal ?? ""} onChange={(event) => updateProgressDraft({ mainGoal: event.target.value })} />
            </div>

            <label className="flex min-h-14 items-center gap-3 rounded-lg border border-purple-200 bg-purple-50 p-3 font-black text-purple-950">
              <input type="checkbox" checked={Boolean(progressDraft.shareWithCoachRequested)} onChange={(event) => updateProgressDraft({ shareWithCoachRequested: event.target.checked })} />
              Request coach review for this check-in
            </label>
            <Button onClick={saveProgressCheckIn}>Save check-in locally</Button>
          </Card>

          <div className="grid gap-5">
            <Card className="grid gap-4">
              <div className="flex items-start gap-3">
                <Camera className="mt-1 text-teal-700" />
                <div>
                  <h2 className="font-black">Optional progress photos</h2>
                  <p className="mt-1 text-sm leading-6 text-zinc-600">Before, front, side, back or weekly photos are stored locally only.</p>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {(["before", "front", "side", "back", "weekly"] as const).map((angle) => (
                  <label key={angle} className="tap-scale grid min-h-12 cursor-pointer place-items-center rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-black hover:border-teal-300 hover:bg-teal-50">
                    <input className="sr-only" type="file" accept="image/*" capture="environment" onChange={(event) => addProgressPhoto(angle, event.target.files?.[0])} />
                    Add {labelFromKey(angle)} photo
                  </label>
                ))}
              </div>
              <p className="text-xs font-bold leading-5 text-zinc-500">Photos are not included in JSON export and are not visible to the club by default.</p>
              {photoMessage ? <p className="rounded-lg bg-lime-50 p-3 text-sm font-bold text-lime-900">{photoMessage}</p> : null}
              {progressPhotos.length ? (
                <div className="grid gap-3">
                  {progressPhotos.slice(0, 6).map((photo) => (
                    <div key={photo.id} className="grid gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                      {/* Local object URLs from IndexedDB cannot be optimized by next/image. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo.objectUrl} alt={`${photo.angle} progress preview`} className="max-h-44 w-full rounded-lg bg-zinc-950 object-contain" />
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-black capitalize">{photo.angle} photo saved</p>
                        <Button variant="danger" className="min-h-10 px-3 py-2 text-xs" onClick={() => removeProgressPhoto(photo.id)}><Trash2 size={16} />Remove</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </Card>

            <Card className="grid gap-4 border-purple-100 bg-purple-50">
              <div className="flex items-start gap-3">
                <ScanLine className="mt-1 text-purple-700" />
                <div>
                  <h2 className="font-black text-purple-950">Booklet page extraction concept</h2>
                  <p className="mt-1 text-sm leading-6 text-purple-900">Future flow: scan the Starting Point or Weekly Check-In page, extract values with OCR/AI, confirm them, then save locally.</p>
                </div>
              </div>
              <div className="grid gap-2">
                {bookletPages.map(([pageType, label]) => (
                  <button
                    key={pageType}
                    onClick={() => {
                      update({ ...workbook, progressVault: { ...workbook.progressVault, bookletScanDraft: { status: "captured", pageType, capturedAt: new Date().toISOString() } } });
                      trackEvent("booklet_scan_started", profile, { bookletPageType: pageType });
                      setNotice("Booklet scan captured as a future OCR step. Confirm-before-saving is intentionally scaffolded, not automated yet.");
                    }}
                    className="interactive-lift rounded-lg border border-purple-200 bg-white p-3 text-left text-sm font-black text-purple-950"
                  >
                    Scan My {label}
                  </button>
                ))}
              </div>
              <p className="text-xs font-bold leading-5 text-purple-900">No diagnosis, no body-shaming, no automatic coach sharing. Estimates and scanner outputs are informational only.</p>
            </Card>
          </div>
        </div>

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-black">Week-by-week comparison</h2>
              <p className="mt-1 text-sm text-zinc-600">Focus on consistency, energy, confidence and useful trends.</p>
            </div>
            <span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-black text-lime-900">{checkInStreak} week streak</span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {latest ? (
              <>
                <div className="rounded-lg bg-zinc-50 p-4">
                  <p className="text-sm font-bold text-zinc-500">Latest check-in</p>
                  <p className="mt-1 text-xl font-black">{latest.type === "starting_point" ? "Starting point" : `Week ${latest.weekNumber}`}</p>
                  <p className="mt-1 text-sm text-zinc-600">{latest.date}</p>
                </div>
                <div className="rounded-lg bg-teal-50 p-4">
                  <p className="text-sm font-bold text-teal-800">Example assistant insight</p>
                  <p className="mt-1 text-sm leading-6 text-teal-950">You completed {currentStats.weekCompleted} out of 7 days this week. If your energy or confidence scores improved, that is real progress.</p>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-zinc-50 p-4 text-sm font-bold leading-6 text-zinc-600 md:col-span-2">No check-ins yet. Add a starting point or Week 1 check-in when you are ready.</p>
            )}
          </div>
          {notice ? <p className="mt-4 rounded-lg bg-lime-50 p-3 text-sm font-black text-lime-900">{notice}</p> : null}
          {coachReviewCount ? <p className="mt-3 text-sm font-bold text-purple-800">{coachReviewCount} check-in{coachReviewCount === 1 ? "" : "s"} marked for future coach review.</p> : null}
        </Card>
      </section>
    );
  }

  if (view === "continue") {
    return shell(
      <section className="grid gap-5">
        <Card className="overflow-hidden bg-zinc-950 text-white">
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-lime-300">After day 30</p>
              <h1 className="mt-2 text-4xl font-black leading-tight">You did it. Choose what comes next.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300">Keep the next step simple. Payments and subscriptions are intentionally not part of this MVP.</p>
            </div>
            <div className="grid size-24 place-items-center rounded-full bg-lime-300 text-zinc-950">
              <Trophy size={42} />
            </div>
          </div>
        </Card>
        <div className="grid gap-3 md:grid-cols-3">
          <Card><p className="text-sm font-bold text-zinc-500">Days completed</p><p className="mt-1 text-3xl font-black">{currentStats.completed}</p></Card>
          <Card><p className="text-sm font-bold text-zinc-500">Current streak</p><p className="mt-1 text-3xl font-black">{currentStats.streak}</p></Card>
          <Card><p className="text-sm font-bold text-zinc-500">Badges unlocked</p><p className="mt-1 text-3xl font-black">{workbook.badges.length}</p></Card>
        </div>
        <Card className="border-teal-100 bg-teal-50">
          <p className="font-black text-teal-950">Recommended next step</p>
          <p className="mt-2 text-sm leading-6 text-teal-900">If the member wants structure, continue with coaching/PT. If they want independence, repeat 30/30 or step up gradually.</p>
        </Card>
        <div className="grid gap-3 md:grid-cols-2">
          {continuationChoices.map((choice) => {
            const selected = workbook.continuationChoice === choice;
            const coaching = choice.includes("coaching");
            return (
              <button
                key={choice}
                onClick={() => {
                  update({ ...workbook, continuationChoice: choice });
                  trackEvent(choice.includes("coaching") ? "coaching_interest_selected" : "challenge_extended", profile, { choice });
                }}
                className={cn("interactive-lift tap-scale rounded-lg border p-4 text-left transition", selected ? "border-lime-300 bg-lime-50" : coaching ? "border-purple-200 bg-purple-50 hover:border-purple-300" : "border-zinc-200 bg-white hover:border-zinc-300")}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-black">{choice}</p>
                  {coaching ? <span className="rounded-full bg-white px-2 py-1 text-xs font-black text-purple-800">Staff follow-up</span> : null}
                </div>
                <p className="mt-1 text-sm leading-6 text-zinc-600">{choice.includes("coaching") ? "Flag interest so staff can follow up." : "Keep momentum without adding complexity."}</p>
              </button>
            );
          })}
        </div>
        <Card className="border-purple-100 bg-purple-50">
          <h2 className="font-black text-purple-950">Continue as my ongoing fitness journal</h2>
          <p className="mt-2 text-sm leading-6 text-purple-900">Want to keep using this as your ongoing fitness journal? This feature is coming soon.</p>
          <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-purple-700">Feature flag: {String(featureFlags.enableOngoingJournal)}</p>
        </Card>
      </section>
    );
  }

  if (view === "settings") {
    return shell(
      <section className="grid gap-5">
        <PageHeader eyebrow="Device settings" title="Settings and local data" copy="Manage the workbook stored on this device. Export before clearing if you want a backup." />
        <Card className="grid gap-4 md:grid-cols-2">
          <Field label="Edit first name" defaultValue={profile.firstName} onBlur={(event) => updateProfile({ firstName: event.target.value })} />
          <Field label="Edit start date" type="date" defaultValue={profile.startDate} onBlur={(event) => updateProfile({ startDate: event.target.value })} />
          <div className="rounded-lg bg-zinc-50 p-4 md:col-span-2">
            <p className="text-sm font-bold text-zinc-500">Club</p>
            <p className="mt-1 text-lg font-black">{profile.clubName}</p>
          </div>
        </Card>
        <div className="grid gap-3 md:grid-cols-2">
          <Button variant="outline" onClick={() => { navigator.clipboard.writeText(exportLocalData()); setNotice("Local data copied to clipboard."); }}><Download size={18} />Export my local data</Button>
          <Button variant="outline" onClick={async () => { update(defaultWorkbook()); await clearWorkoutAttachments(); await clearProgressPhotos(); setNotice("Challenge reset on this device."); }}><RotateCcw size={18} />Reset challenge</Button>
        </div>
        <Card className="grid gap-4">
          <TextArea label="Import local data JSON" placeholder="Paste exported JSON here, then leave the field." onBlur={(event) => { if (event.target.value) { importLocalData(event.target.value); setProfile(getProfile()); setWorkbook(getWorkbook()); setNotice("Local data imported."); } }} />
          <Button variant="danger" onClick={async () => { if (window.confirm("Clear all 30/30 Challenge data from this device?")) { await clearWorkoutAttachments(); await clearProgressPhotos(); clearLocalData(); setNotice("Local challenge data cleared from this device."); router.push("/"); } }}>Clear local data</Button>
        </Card>
        {notice ? <Card className="border-lime-200 bg-lime-50 font-black">{notice}</Card> : null}
        <p className="text-sm leading-6 text-zinc-600">App version 0.1.0-mvp. Personal workout notes, nutrition notes, goals, reflections, Progress Vault check-ins and body metrics stay on this device only. Video and progress photo attachments are stored locally on this device and are not included in JSON export.</p>
      </section>
    );
  }

  const upcomingBadge = nextBadge(currentStats.completed);
  const UpcomingBadgeIcon = upcomingBadge.icon;
  const recoveryNeeded = currentStats.completed > 0 && currentStats.streak === 0;

  return shell(
    <section className="grid gap-5">
      <Card className="overflow-hidden bg-zinc-950 text-white">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-bold text-lime-300">Hey {profile.firstName}</p>
            <h1 className="mt-2 text-4xl font-black leading-none tracking-tight sm:text-6xl">Day {currentStats.currentDay} of 30</h1>
            <p className="mt-4 max-w-xl text-lg font-bold text-zinc-200">You&apos;re building momentum.</p>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{profile.clubName} 30/30 Challenge</p>
          </div>
          <ProgressRing percent={currentStats.percent} />
        </div>
        <ProgressBar value={currentStats.percent} className="mt-6 bg-white/10" />
      </Card>

      {recoveryNeeded ? (
        <Card className="border-amber-200 bg-amber-50">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 shrink-0 text-amber-700" />
            <div>
              <p className="font-black text-amber-950">No stress. Do not miss twice.</p>
              <p className="mt-1 text-sm leading-6 text-amber-900">Low energy today? Do 10 minutes. Starting counts.</p>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="interactive-lift"><CalendarDays className="text-teal-600" /><p className="mt-3 text-sm font-bold text-zinc-500">Current day</p><p className="text-4xl font-black">{currentStats.currentDay}</p></Card>
        <Card className="interactive-lift"><Check className="text-lime-700" /><p className="mt-3 text-sm font-bold text-zinc-500">Days completed</p><p className="text-4xl font-black">{currentStats.completed}</p></Card>
        <Card className="interactive-lift"><Flame className="text-purple-700" /><p className="mt-3 text-sm font-bold text-zinc-500">Current streak</p><p className="text-4xl font-black">{currentStats.streak}</p></Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.12fr_.88fr]">
        <Card className="premium-card grid gap-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-teal-700">Today&apos;s mission</p>
              <h2 className="mt-2 text-2xl font-black">30 minutes movement plus one habit.</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">Small actions stack up. One day at a time.</p>
            </div>
            <Target className="text-teal-600" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <Dumbbell className="text-zinc-900" />
              <p className="mt-3 font-black">Movement</p>
              <p className="mt-1 text-sm text-zinc-600">Plan or complete your 30 minutes.</p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <Leaf className="text-lime-700" />
              <p className="mt-3 font-black">Nutrition habit</p>
              <p className="mt-1 text-sm text-zinc-600">Tick one simple action today.</p>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <ButtonLink href={`/day/${currentStats.currentDay}`}>Plan today</ButtonLink>
            <ButtonLink href={`/day/${currentStats.currentDay}`} variant="dark">Complete today</ButtonLink>
            <ButtonLink href={`/week/${currentStats.weekNumber}`} variant="outline">Weekly review</ButtonLink>
          </div>
        </Card>

        <Card className="grid gap-4 border-lime-100 bg-lime-50">
          <div className="flex items-start gap-3">
            <div className="grid size-12 place-items-center rounded-lg bg-zinc-950 text-lime-300"><UpcomingBadgeIcon size={22} /></div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-lime-800">Next milestone</p>
              <h2 className="mt-1 text-xl font-black text-lime-950">{upcomingBadge.label}</h2>
              <p className="mt-1 text-sm leading-6 text-lime-900">{Math.max(0, upcomingBadge.day - currentStats.completed)} day{upcomingBadge.day - currentStats.completed === 1 ? "" : "s"} to go. Keep the chain moving.</p>
            </div>
          </div>
          <BadgeGrid workbook={workbook} compact />
        </Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-5">
        <ButtonLink href="/workouts" variant="outline"><Dumbbell size={18} />My workouts</ButtonLink>
        <ButtonLink href="/progress" variant="soft"><TrendingUp size={18} />Progress</ButtonLink>
        <ButtonLink href="/hacks" variant="soft"><Sparkles size={18} />Hacks</ButtonLink>
        <ButtonLink href="/why" variant="purple"><Heart size={18} />My why</ButtonLink>
        <ButtonLink href="/continue" variant="outline"><Trophy size={18} />What&apos;s next</ButtonLink>
      </div>
    </section>,
  );
}
