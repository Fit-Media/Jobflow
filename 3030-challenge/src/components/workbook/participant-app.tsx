"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Award,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardCheck,
  Download,
  Dumbbell,
  Flame,
  Heart,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
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
import type { DayEntry, ParticipantProfile, WeeklyReview, Workbook, WorkoutAttachmentFieldKey } from "@/types";

const desiredResults = ["More energy", "Fat loss", "Strength", "Fitness", "Confidence", "Routine", "Mobility", "Better health", "Other"];

const onboardingSteps = [
  ["Choose your workouts", Dumbbell],
  ["Schedule your daily 30 minutes", CalendarDays],
  ["Tick movement + nutrition habits", ClipboardCheck],
  ["Review weekly and keep building momentum", Trophy],
] as const;

const hacks = [
  ["Lay it out", "Set out gym clothes the night before."],
  ["Drink water first", "Start your day with a big glass of water."],
  ["10-minute start rule", "Commit to just 10 minutes. Starting is the hardest part."],
  ["Walk after meals", "Take a 10-15 minute walk after meals."],
  ["Schedule it", "Treat workouts like appointments."],
  ["Protein first", "Protein at each meal helps energy and recovery."],
  ["Prioritise sleep", "Better sleep improves recovery and consistency."],
  ["Reduce friction", "Keep workout gear, snacks and water within reach."],
  ["Stack good habits", "Attach new habits to something you already do."],
  ["Never miss twice", "One missed day is normal. Two is a pattern."],
  ["Make it obvious", "Put reminders where you will see them."],
  ["Accountability check-in", "Tell someone what you are doing and when."],
] as const;

const continuationChoices = ["Repeat 30/30", "Step up to 45/45", "Step up to 60/60", "Continue with coaching / PT", "Set a new 30-day goal"];
const prepActions = ["protein prep", "lunches", "healthy snacks", "fruit and veg", "grocery shop", "water bottle ready"];
const badgeLabels = ["Day 1 Started", "3-Day Momentum", "7-Day Streak", "Halfway There", "30/30 Finisher", "60/60 Builder", "90-Day Legend"];

function labelFromKey(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
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
  if (dayNumber >= 30) return "30/30 Finisher";
  if (dayNumber >= 15) return "Halfway There";
  if (dayNumber >= 7) return "7-Day Streak";
  if (dayNumber >= 3) return "3-Day Momentum";
  return "Day 1 Started";
}

function ProgressRing({ percent }: { percent: number }) {
  return (
    <div className="animate-soft-pulse grid size-28 place-items-center rounded-full transition-all duration-500" style={{ background: `conic-gradient(#a3e635 ${percent * 3.6}deg, #e4e4e7 0deg)` }}>
      <div className="grid size-20 place-items-center rounded-full bg-white text-2xl font-black">{percent}%</div>
    </div>
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
  return (
    <div className="grid gap-4">
      <Card className="grid justify-items-center text-center">
        <ProgressRing percent={current.percent} />
        <p className="mt-3 text-sm font-bold text-zinc-500">Overall progress</p>
      </Card>
      <Card>
        <p className="text-sm font-bold text-zinc-500">This week</p>
        <p className="mt-2 text-3xl font-black">{current.weekCompleted}/7</p>
        <p className="mt-1 text-sm text-zinc-600">Week {current.weekNumber} movement days complete.</p>
      </Card>
      <Card className="bg-teal-50">
        <p className="font-black text-teal-950">Next best action</p>
        <p className="mt-2 text-sm leading-6 text-teal-900">{current.completed >= 30 ? "Choose your next challenge step." : "Plan today, then tick movement and nutrition."}</p>
      </Card>
      <Card className="border-purple-100 bg-purple-50">
        <p className="font-black text-purple-950">Coach check-in prompt</p>
        <p className="mt-2 text-sm leading-6 text-purple-900">If you miss 3+ days, ask your coach to help you restart with a 10-minute minimum.</p>
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

  const currentStats = useMemo(() => (workbook ? stats(workbook) : null), [workbook]);

  if (!workbook || !currentStats) return <LoadingState />;
  const loadedWorkbook = workbook;

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
    const nextBadges = loadedWorkbook.badges.includes(badge) ? loadedWorkbook.badges : [...loadedWorkbook.badges, badge];
    const days = [...loadedWorkbook.days];
    days[day.dayNumber - 1] = { ...day, workoutComplete: true, habitComplete: true, completedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    update({ ...loadedWorkbook, days, badges: nextBadges });
    setNotice(day.dayNumber === 1 ? "Day 1 complete. You are officially moving." : `Day ${day.dayNumber} complete. Momentum is building.`);
    trackEvent("day_completed", profile, { workoutChecked: true, habitChecked: true, dayCompleted: true }, { dayNumber: day.dayNumber });
  }

  function updateReview(review: WeeklyReview, patch: Partial<WeeklyReview>) {
    const weeklyReviews = [...loadedWorkbook.weeklyReviews];
    weeklyReviews[review.weekNumber - 1] = { ...review, ...patch };
    update({ ...loadedWorkbook, weeklyReviews });
  }

  if (view === "welcome") {
    const club = getUnlockedClub();
    if (!club) return <SetupRequired />;
    return (
      <main className="grid min-h-screen place-items-center bg-zinc-950 p-5 text-white">
        <section className="w-full max-w-lg rounded-lg bg-white p-6 text-zinc-950 shadow-2xl sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">Club unlocked</p>
          <h1 className="mt-3 text-3xl font-black leading-tight">Welcome to the 30/30 Challenge at {club.clubName}.</h1>
          <p className="mt-3 text-zinc-600">You are joining with this club. Your private workbook will live on this device.</p>
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
              Continue <ChevronRight size={18} />
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
      <Card className="mx-auto max-w-xl">
        <PageHeader title="Finish your setup" copy="Your club is unlocked, but your workbook still needs a first name before you start." />
        <ButtonLink href="/welcome" className="mt-5 w-full">Add first name</ButtonLink>
      </Card>,
    );
  }

  if (view === "onboarding") {
    return shell(
      <section className="grid gap-5">
        <Card className="overflow-hidden bg-zinc-950 text-white">
          <p className="text-sm font-bold text-lime-300">Hey {profile.firstName}</p>
          <h1 className="mt-2 text-3xl font-black leading-tight sm:text-5xl">Welcome to your 30/30 Challenge.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300">For the next 30 days, your goal is simple: 30 minutes of intentional movement each day.</p>
        </Card>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {onboardingSteps.map(([step, Icon], index) => (
            <Card key={step} className="min-h-32">
              <Icon className="text-teal-600" size={22} />
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
        <PageHeader eyebrow="Private workbook" title="My Why" copy="Choose the reasons that matter, then write the plan you will come back to when life gets busy." />
        <div className="grid gap-2 sm:grid-cols-3">
          {desiredResults.map((item) => {
            const selected = workbook.why.desiredResults.includes(item);
            return (
              <button
                key={item}
                onClick={() => update({ ...workbook, why: { ...workbook.why, desiredResults: selected ? workbook.why.desiredResults.filter((value) => value !== item) : [...workbook.why.desiredResults, item] } })}
                className={cn("min-h-14 rounded-lg border p-3 text-left font-black transition", selected ? "border-lime-300 bg-lime-100" : "border-zinc-200 bg-white hover:border-zinc-300")}
              >
                {item}
              </button>
            );
          })}
        </div>
        <Card className="grid gap-4">
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
        <PageHeader eyebrow="Workout setup" title="Build two go-to workouts" copy="Keep these simple. They are your default plans when you walk into the club or train at home." />
        <Card className="grid gap-3 border-teal-100 bg-teal-50">
          <p className="font-black text-teal-950">Tip: A coach can type, dictate or attach quick videos to make the plan easy to follow later.</p>
          <p className="text-sm leading-6 text-teal-900">Videos and notes stay on this device unless cloud video sync is added later.</p>
        </Card>
        <div className="grid min-w-0 gap-4 xl:grid-cols-2">
          {(["workout1", "workout2"] as const).map((key) => {
            const workout = workbook.workouts[key];
            return (
              <Card key={key} className="grid min-w-0 gap-4 overflow-hidden">
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
                    <div key={`${workout.code}-${index}`} className="grid min-w-0 gap-3 rounded-lg bg-zinc-50 p-3">
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
        <PageHeader eyebrow="Nutrition setup" title="Eat Like a Legend" copy="A simple plan beats a perfect plan you never use. Keep these choices repeatable." />
        <Card className="grid gap-4">
          {["morningChoices", "lunchChoices", "dinnerChoices", "snacksRecovery", "waterGoal"].map((key) => (
            <TextArea key={key} label={labelFromKey(key)} value={String(workbook.nutrition[key] ?? "")} onChange={(event) => update({ ...workbook, nutrition: { ...workbook.nutrition, [key]: event.target.value } })} />
          ))}
        </Card>
        <div className="grid gap-2 sm:grid-cols-5">
          {["Protein at each meal", "Fruit and veg daily", "Water first", "Plan ahead", "Keep it simple"].map((rule) => <span key={rule} className="rounded-lg border border-lime-200 bg-lime-50 p-3 text-sm font-black">{rule}</span>)}
        </div>
        <ButtonLink href="/rituals" onClick={() => trackEvent("nutrition_setup_completed", profile, { completed: true })}>Next: Rituals <ChevronRight size={18} /></ButtonLink>
      </section>
    );
  }

  if (view === "rituals") {
    return shell(
      <section className="grid gap-5">
        <PageHeader eyebrow="Prep and rituals" title="Make consistency easier" copy="Set up the small rituals that reduce friction before your day gets busy." />
        <Card className="grid gap-4">
          <TextArea label="Shopping list" value={workbook.shoppingList} onChange={(event) => update({ ...workbook, shoppingList: event.target.value })} />
          <div className="grid gap-2 sm:grid-cols-3">
            {prepActions.map((action) => {
              const selected = workbook.prepActions.includes(action);
              return (
                <button key={action} onClick={() => update({ ...workbook, prepActions: selected ? workbook.prepActions.filter((item) => item !== action) : [...workbook.prepActions, action] })} className={cn("min-h-12 rounded-lg border p-3 text-left text-sm font-black capitalize", selected ? "border-lime-300 bg-lime-100" : "border-zinc-200 bg-zinc-50")}>
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
    return shell(
      <section className="grid gap-5">
        <PageHeader eyebrow="Daily tracker" title={`Day ${day.dayNumber}`} copy="Plan the minimum. Tick the two actions. Keep private notes here only on this device." />
        {notice || day.completedAt ? (
          <Card className="border-lime-200 bg-lime-50">
            <div className="flex items-start gap-3">
              <Award className="mt-1 text-lime-700" />
              <div>
                <p className="font-black text-zinc-950">{notice || `Day ${day.dayNumber} complete.`}</p>
                <p className="mt-1 text-sm leading-6 text-zinc-700">Small actions stack up. Come back tomorrow and keep the chain moving.</p>
              </div>
            </div>
          </Card>
        ) : null}
        <Card className="grid gap-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <TextArea label="Planned workout / movement" value={day.plannedWorkoutMovement} onChange={(event) => updateDay(day, { plannedWorkoutMovement: event.target.value })} />
            <TextArea label="Planned nutrition / habit" value={day.plannedNutritionHabit} onChange={(event) => updateDay(day, { plannedNutritionHabit: event.target.value })} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <CheckboxRow checked={day.workoutComplete} label="Workout / movement complete" onChange={(checked) => { updateDay(day, { workoutComplete: checked }); trackEvent("workout_ticked", profile, { workoutChecked: checked }, { dayNumber: day.dayNumber }); }} />
            <CheckboxRow checked={day.habitComplete} label="Nutrition / habit complete" onChange={(checked) => { updateDay(day, { habitComplete: checked }); trackEvent("habit_ticked", profile, { habitChecked: checked }, { dayNumber: day.dayNumber }); }} />
          </div>
          <TextArea label="Private note (stored on this device only)" value={day.privateNote} onChange={(event) => updateDay(day, { privateNote: event.target.value })} />
          <Button onClick={() => completeDay(day)}>{day.dayNumber === 1 ? "Complete Day 1" : "Mark day complete"}</Button>
        </Card>
        <Card className="border-teal-100 bg-teal-50">
          <p className="font-black text-teal-950">Minimum mode</p>
          <p className="mt-2 text-sm leading-6 text-teal-900">No stress. The rule is simple: do not miss twice. Do 10 minutes. Starting counts.</p>
        </Card>
      </section>
    );
  }

  if (view === "week") {
    const review = workbook.weeklyReviews[weekNumber - 1] ?? workbook.weeklyReviews[0];
    return shell(
      <section className="grid gap-5">
        <PageHeader eyebrow="Weekly review" title={`Week ${review.weekNumber} Review`} copy={`Days ${review.daysRange}. Keep the written reflection private and send only the completion count.`} />
        <Card className="grid gap-4">
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
        {notice ? <Card className="border-lime-200 bg-lime-50 font-black">{notice}</Card> : null}
      </section>
    );
  }

  if (view === "hacks") {
    return shell(
      <section className="grid gap-5">
        <PageHeader eyebrow="Hacks and rituals" title="Small moves that make the challenge easier" copy="Use these when motivation is low or your week gets messy." />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {hacks.map(([title, copy], index) => (
            <Card key={title} className="interactive-lift min-h-36" style={{ animationDelay: `${index * 35}ms` }}>
              <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-950 text-sm font-black text-lime-300">{index + 1}</div>
              <h2 className="mt-4 font-black">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{copy}</p>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (view === "continue") {
    return shell(
      <section className="grid gap-5">
        <PageHeader eyebrow="After day 30" title="What is next?" copy="Choose the next simple step. Payments and subscriptions are intentionally not part of this MVP." />
        <div className="grid gap-3 md:grid-cols-2">
          {continuationChoices.map((choice) => {
            const selected = workbook.continuationChoice === choice;
            return (
              <button
                key={choice}
                onClick={() => {
                  update({ ...workbook, continuationChoice: choice });
                  trackEvent(choice.includes("coaching") ? "coaching_interest_selected" : "challenge_extended", profile, { choice });
                }}
                className={cn("interactive-lift tap-scale rounded-lg border p-4 text-left transition", selected ? "border-lime-300 bg-lime-50" : "border-zinc-200 bg-white hover:border-zinc-300")}
              >
                <p className="font-black">{choice}</p>
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
          <Button variant="outline" onClick={async () => { update(defaultWorkbook()); await clearWorkoutAttachments(); setNotice("Challenge reset on this device."); }}><RotateCcw size={18} />Reset challenge</Button>
        </div>
        <Card className="grid gap-4">
          <TextArea label="Import local data JSON" placeholder="Paste exported JSON here, then leave the field." onBlur={(event) => { if (event.target.value) { importLocalData(event.target.value); setProfile(getProfile()); setWorkbook(getWorkbook()); setNotice("Local data imported."); } }} />
          <Button variant="danger" onClick={async () => { if (window.confirm("Clear all 30/30 Challenge data from this device?")) { await clearWorkoutAttachments(); clearLocalData(); setNotice("Local challenge data cleared from this device."); router.push("/"); } }}>Clear local data</Button>
        </Card>
        {notice ? <Card className="border-lime-200 bg-lime-50 font-black">{notice}</Card> : null}
        <p className="text-sm leading-6 text-zinc-600">App version 0.1.0-mvp. Personal workout notes, nutrition notes, goals and reflections stay on this device only. Video attachments are stored locally on this device and are not included in JSON export.</p>
      </section>
    );
  }

  return shell(
    <section className="grid gap-5">
      <Card className="overflow-hidden bg-zinc-950 text-white">
        <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-zinc-300">Hey {profile.firstName}</p>
            <h1 className="mt-1 text-3xl font-black leading-tight sm:text-5xl">{profile.clubName} 30/30 Challenge</h1>
            <p className="mt-4 text-lime-200">Momentum beats perfection.</p>
          </div>
          <ProgressRing percent={currentStats.percent} />
        </div>
      </Card>
      <div className="grid gap-3 sm:grid-cols-3">
        <Card><CalendarDays className="text-teal-600" /><p className="mt-3 text-sm font-bold text-zinc-500">Current day</p><p className="text-4xl font-black">{currentStats.currentDay}</p></Card>
        <Card><Check className="text-lime-700" /><p className="mt-3 text-sm font-bold text-zinc-500">Days completed</p><p className="text-4xl font-black">{currentStats.completed}</p></Card>
        <Card><Flame className="text-purple-700" /><p className="mt-3 text-sm font-bold text-zinc-500">Current streak</p><p className="text-4xl font-black">{currentStats.streak}</p></Card>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
        <Card className="grid gap-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-black">Today&apos;s checklist</p>
              <p className="mt-1 text-sm text-zinc-600">Day {currentStats.currentDay}: movement plus one nutrition habit.</p>
            </div>
            <Target className="text-teal-600" />
          </div>
          <div className="grid gap-2">
            <ButtonLink href={`/day/${currentStats.currentDay}`}>Plan today</ButtonLink>
            <ButtonLink href={`/day/${currentStats.currentDay}`} variant="dark">Mark today complete</ButtonLink>
            <ButtonLink href={`/week/${currentStats.weekNumber}`} variant="outline">Weekly review</ButtonLink>
          </div>
        </Card>
        <Card className="border-lime-100 bg-lime-50">
          <Award className="text-lime-800" />
          <p className="mt-3 font-black">Milestone badges</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {badgeLabels.map((badge) => <span key={badge} className={cn("rounded-full px-3 py-1 text-xs font-black", workbook.badges.includes(badge) ? "bg-zinc-950 text-lime-300" : "bg-white text-zinc-600")}>{badge}</span>)}
          </div>
        </Card>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <ButtonLink href="/workouts" variant="outline"><Dumbbell size={18} />My workouts</ButtonLink>
        <ButtonLink href="/hacks" variant="soft"><Sparkles size={18} />Hacks & rituals</ButtonLink>
        <ButtonLink href="/continue" variant="outline"><Heart size={18} />What&apos;s next</ButtonLink>
      </div>
    </section>,
  );
}
