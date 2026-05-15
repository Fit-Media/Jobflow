import type { Club, ParticipantMetadata } from "@/types";

const now = new Date().toISOString();

export const seedClubs: Club[] = [
  { clubId: "club_alpha", clubCode: "ALPHA30", clubPassword: "START30", clubName: "Club Alpha", publicDisplayName: "Club Alpha", status: "active", createdAt: now, updatedAt: now, challengeMode: "30_day", licenceStatus: "active", licenceRenewalDate: "2026-12-31" },
  { clubId: "club_beta", clubCode: "BETA30", clubPassword: "START30", clubName: "Club Beta", publicDisplayName: "Club Beta", status: "active", createdAt: now, updatedAt: now, challengeMode: "30_day", licenceStatus: "trial", licenceRenewalDate: "2026-07-31" },
  { clubId: "demo_club", clubCode: "DEMO30", clubPassword: "DEMO30", clubName: "Demo Club", publicDisplayName: "Demo Club", status: "active", createdAt: now, updatedAt: now, challengeMode: "30_day", licenceStatus: "comped" },
  { clubId: "studio_demo", clubCode: "STUDIO30", clubPassword: "START30", clubName: "Studio Demo", publicDisplayName: "Studio Demo", status: "active", createdAt: now, updatedAt: now, challengeMode: "30_day", licenceStatus: "active" },
];

export const demoParticipants: ParticipantMetadata[] = [
  { participantId: "p1", firstName: "Mia", clubId: "club_alpha", createdAt: now, lastActiveAt: now, currentDayReached: 12, totalDaysCompleted: 10, currentStreak: 4, longestStreak: 7, challengeStatus: "active", onboardingCompleted: true, myWhyCompleted: true, workoutSetupCompleted: true, nutritionSetupCompleted: true, ritualsSetupCompleted: true, inactiveRiskLevel: "low", coachingInterestSelected: false },
  { participantId: "p2", firstName: "Sam", clubId: "club_alpha", createdAt: now, lastActiveAt: "2026-05-10T00:00:00.000Z", currentDayReached: 6, totalDaysCompleted: 4, currentStreak: 0, longestStreak: 3, challengeStatus: "active", onboardingCompleted: true, myWhyCompleted: true, workoutSetupCompleted: true, nutritionSetupCompleted: false, ritualsSetupCompleted: false, inactiveRiskLevel: "medium", coachingInterestSelected: true },
  { participantId: "p3", firstName: "Ava", clubId: "demo_club", createdAt: now, lastActiveAt: now, currentDayReached: 30, totalDaysCompleted: 30, currentStreak: 14, longestStreak: 14, challengeStatus: "completed_30", onboardingCompleted: true, myWhyCompleted: true, workoutSetupCompleted: true, nutritionSetupCompleted: true, ritualsSetupCompleted: true, inactiveRiskLevel: "low", coachingInterestSelected: true, continuationSelected: "Continue with coaching / PT" },
];

export function validateClub(code: string, password: string) {
  const club = seedClubs.find((item) => item.clubCode.toUpperCase() === code.trim().toUpperCase());
  if (!club || club.status !== "active" || club.clubPassword !== password.trim()) return null;
  return club;
}
