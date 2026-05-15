export type ChallengeMode = "30_day" | "60_day" | "90_day";
export type LicenceStatus = "trial" | "active" | "expired" | "comped";
export type ChallengeStatus = "onboarding" | "active" | "completed_30" | "extended" | "inactive";
export type RiskLevel = "low" | "medium" | "high";

export type Club = {
  clubId: string;
  clubCode: string;
  clubPassword: string;
  clubName: string;
  publicDisplayName: string;
  brandLogoUrl?: string;
  brandPrimaryColor?: string;
  brandSecondaryColor?: string;
  status: "active" | "inactive";
  ownerName?: string;
  ownerEmail?: string;
  createdAt: string;
  updatedAt: string;
  maxParticipants?: number;
  campaignStartDate?: string;
  campaignEndDate?: string;
  challengeMode: ChallengeMode;
  licenceStatus: LicenceStatus;
  licenceRenewalDate?: string;
  notes?: string;
};

export type ParticipantProfile = {
  participantId: string;
  firstName: string;
  clubId: string;
  clubName: string;
  startDate: string;
  coachName?: string;
  mainGoal?: string;
  localDataVersion: number;
  createdAt: string;
  updatedAt: string;
};

export type ParticipantMetadata = {
  participantId: string;
  firstName: string;
  clubId: string;
  createdAt: string;
  lastActiveAt: string;
  currentDayReached: number;
  totalDaysCompleted: number;
  currentStreak: number;
  longestStreak: number;
  challengeStatus: ChallengeStatus;
  extensionType?: "repeat_30" | "45_45" | "60_60" | "90_day";
  onboardingCompleted: boolean;
  myWhyCompleted: boolean;
  workoutSetupCompleted: boolean;
  nutritionSetupCompleted: boolean;
  ritualsSetupCompleted: boolean;
  lastEventAt?: string;
  lastCompletedDay?: number;
  inactiveRiskLevel: RiskLevel;
  coachingInterestSelected: boolean;
  continuationSelected?: string;
  contacted?: boolean;
};

export type Workout = {
  name: string;
  code: "W1" | "W2";
  focus: string;
  warmUp: string;
  exercises: { name: string; sets: string; reps: string }[];
  cardioFinisher: string;
  coachNotes: string;
};

export type WorkoutAttachment = {
  id: string;
  fieldKey: string;
  type: "video";
  fileName: string;
  mimeType: string;
  size: number;
  createdAt: string;
  localBlobKey: string;
};

export type WorkoutAttachmentFieldKey =
  | "workout1.focus" | "workout1.warmUp" | "workout1.cardioFinisher" | "workout1.coachNotes"
  | "workout1.exercise1" | "workout1.exercise2" | "workout1.exercise3"
  | "workout2.focus" | "workout2.warmUp" | "workout2.cardioFinisher" | "workout2.coachNotes"
  | "workout2.exercise1" | "workout2.exercise2" | "workout2.exercise3";

export type DayEntry = {
  dayNumber: number;
  date?: string;
  plannedWorkoutMovement: string;
  plannedNutritionHabit: string;
  workoutComplete: boolean;
  habitComplete: boolean;
  privateNote: string;
  completedAt?: string;
  updatedAt: string;
};

export type WeeklyReview = {
  weekNumber: number;
  daysRange: string;
  whatWentWell: string;
  whatCanImprove: string;
  biggestWins: string;
  top3Rituals: string;
  daysCompletedThisWeek: number;
  completedAt?: string;
};

export type Workbook = {
  why: {
    desiredResults: string[];
    topReasons: string[];
    obstacles: string;
    backupPlan: string;
    commitment: string;
    signedAt?: string;
  };
  workouts: { workout1: Workout; workout2: Workout };
  movementOptions: Record<string, string | boolean>;
  nutrition: Record<string, string | boolean>;
  rituals: Record<string, string | string[] | boolean>;
  shoppingList: string;
  prepActions: string[];
  days: DayEntry[];
  weeklyReviews: WeeklyReview[];
  continuationChoice?: string;
  settings: { remindersEnabled: boolean; minimumMode: boolean };
  badges: string[];
  version: number;
};

export type AnalyticsEventType =
  | "app_loaded" | "club_code_submitted" | "club_code_success" | "club_code_failed"
  | "participant_created" | "onboarding_started" | "onboarding_completed"
  | "my_why_started" | "my_why_completed" | "workout_setup_started" | "workout_setup_completed"
  | "nutrition_setup_started" | "nutrition_setup_completed" | "ritual_setup_started" | "ritual_setup_completed"
  | "dashboard_viewed" | "day_viewed" | "day_planned" | "workout_ticked" | "habit_ticked" | "day_completed"
  | "weekly_review_started" | "weekly_review_completed" | "hack_viewed" | "ritual_builder_completed"
  | "settings_opened" | "challenge_completed_30" | "challenge_extended" | "coaching_interest_selected"
  | "inactive_3_days" | "inactive_7_days" | "add_to_home_prompt_shown" | "add_to_home_completed"
  | "voice_input_started" | "voice_input_completed" | "video_attachment_added" | "video_attachment_removed"
  | "video_attachment_opened" | "video_attachment_played" | "video_attachment_failed";

export type AnalyticsEvent = {
  eventId: string;
  participantId?: string;
  clubId?: string;
  timestamp: string;
  eventType: AnalyticsEventType;
  dayNumber?: number;
  weekNumber?: number;
  challengeDay?: number;
  challengeStage?: string;
  deviceType: "mobile" | "tablet" | "desktop";
  appVersion: string;
  metadata?: Record<string, string | number | boolean | undefined>;
};
