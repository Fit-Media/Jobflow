"use client";

import type { Club, DayEntry, ParticipantProfile, Workbook } from "@/types";
import { todayISO, uuid } from "@/lib/utils";

const profileKey = "3030:participantProfile";
const workbookKey = "3030:workbook";
const clubKey = "3030:club";

const blankWorkout = (code: "W1" | "W2") => ({
  name: code === "W1" ? "Workout 1" : "Workout 2",
  code,
  focus: "",
  warmUp: "",
  exercises: [
    { name: "", sets: "", reps: "" },
    { name: "", sets: "", reps: "" },
    { name: "", sets: "", reps: "" },
  ],
  cardioFinisher: "",
  coachNotes: "",
});

export function defaultWorkbook(): Workbook {
  const now = new Date().toISOString();
  return {
    why: { desiredResults: [], topReasons: ["", "", ""], obstacles: "", backupPlan: "", commitment: "" },
    workouts: { workout1: blankWorkout("W1"), workout2: blankWorkout("W2") },
    movementOptions: { treadmillWalk: false, stairsStepper: false, bikeRower: false, outdoorWalk: false, mobility: false, stretch: false, recovery: false, dailyStepTarget: "", weeklyMovementGoal: "" },
    nutrition: { morningChoices: "", lunchChoices: "", dinnerChoices: "", snacksRecovery: "", waterGoal: "", protein: false, fruitVeg: false, waterFirst: false, planAhead: false, simple: false },
    rituals: { dailyRituals: ["", "", ""], nonNegotiables: "", morningRitual: "", eveningReset: "", whenLifeGetsBusy: "", accountabilityPeople: "", bounceBackPlan: "", signedDate: "" },
    shoppingList: "",
    prepActions: [],
    days: Array.from({ length: 30 }, (_, index): DayEntry => ({ dayNumber: index + 1, plannedWorkoutMovement: "", plannedNutritionHabit: "", workoutComplete: false, habitComplete: false, privateNote: "", updatedAt: now })),
    weeklyReviews: [1, 2, 3, 4].map((weekNumber) => ({ weekNumber, daysRange: `${(weekNumber - 1) * 7 + 1}-${Math.min(weekNumber * 7, 30)}`, whatWentWell: "", whatCanImprove: "", biggestWins: "", top3Rituals: "", daysCompletedThisWeek: 0 })),
    progressVault: { checkIns: [], privacyMode: "private", bookletScanDraft: { status: "not_started" } },
    settings: { remindersEnabled: false, minimumMode: false, savedHacks: [], tryTodayHacks: [] },
    badges: [],
    version: 1,
  };
}

function read<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : null;
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function saveUnlockedClub(club: Club) {
  write(clubKey, { clubId: club.clubId, clubName: club.clubName, clubCode: club.clubCode });
}

export function getUnlockedClub(): Pick<Club, "clubId" | "clubName" | "clubCode"> | null {
  return read(clubKey);
}

export function getProfile() {
  return read<ParticipantProfile>(profileKey);
}

export function createOrUpdateProfile(input: Partial<ParticipantProfile> & { firstName: string; clubId: string; clubName: string }) {
  const existing = getProfile();
  const now = new Date().toISOString();
  const profile: ParticipantProfile = {
    participantId: existing?.participantId ?? uuid(),
    firstName: input.firstName.trim().split(" ")[0],
    clubId: input.clubId,
    clubName: input.clubName,
    startDate: input.startDate ?? existing?.startDate ?? todayISO(),
    coachName: input.coachName ?? existing?.coachName,
    mainGoal: input.mainGoal ?? existing?.mainGoal,
    localDataVersion: 1,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  write(profileKey, profile);
  return profile;
}

export function getWorkbook() {
  const existing = read<Workbook>(workbookKey);
  if (existing) {
    const settings = existing.settings ?? { remindersEnabled: false, minimumMode: false };
    return {
      ...existing,
      progressVault: existing.progressVault ?? { checkIns: [], privacyMode: "private", bookletScanDraft: { status: "not_started" } },
      settings: { ...settings, savedHacks: settings.savedHacks ?? [], tryTodayHacks: settings.tryTodayHacks ?? [] },
    };
  }
  const workbook = defaultWorkbook();
  write(workbookKey, workbook);
  return workbook;
}

export function saveWorkbook(workbook: Workbook) {
  write(workbookKey, workbook);
}

export function exportLocalData() {
  return JSON.stringify({ profile: getProfile(), club: getUnlockedClub(), workbook: getWorkbook() }, null, 2);
}

export function importLocalData(json: string) {
  const data = JSON.parse(json);
  if (data.profile) write(profileKey, data.profile);
  if (data.club) write(clubKey, data.club);
  if (data.workbook) write(workbookKey, data.workbook);
}

export function clearLocalData() {
  [profileKey, workbookKey, clubKey, "3030:analyticsQueue"].forEach((key) => localStorage.removeItem(key));
}
