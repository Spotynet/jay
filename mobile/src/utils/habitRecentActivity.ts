/**
 * Seven-day habit activity window for details.
 *
 * Range: seven consecutive local calendar days ending on the selected
 * occurrence date (inclusive): [end - 6 … end].
 *
 * Distinguishes completion records from schedule eligibility. Schedule uses
 * the habit’s *current* `frequency` / `days_of_week` — historical schedule
 * edits are not versioned and cannot be reconstructed.
 */

import { parseLocalDate, toLocalDateString } from './date';

export type HabitActivityState =
  | 'completed'
  | 'missed'
  | 'open_today'
  | 'unscheduled'
  | 'future'
  | 'before_start'
  | 'unknown';

export type HabitHistoryEntry = {
  date: string;
  completed?: boolean;
  status?: string;
};

export type HabitActivityDay = {
  date: string;
  /** Short weekday label, e.g. "Fri". */
  dayLabel: string;
  state: HabitActivityState;
  /** Full accessible description. */
  accessibilityLabel: string;
  /** True when this column is the selected occurrence. */
  selected: boolean;
};

export type BuildHabitRecentActivityInput = {
  /** Selected occurrence YYYY-MM-DD (window end). */
  occurrenceDate: string;
  /** Local “today” YYYY-MM-DD — used for today vs future. */
  todayDate: string;
  daysOfWeek?: number[] | null;
  /** Backend frequency; DAILY schedules every day. */
  frequency?: string | null;
  history?: HabitHistoryEntry[] | null;
  /** ISO or YYYY-MM-DD habit creation time, if known. */
  createdAt?: string | null;
  /** When history could not be loaded. */
  historyUnavailable?: boolean;
};

const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
const DAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

/** Monday=0 … Sunday=6 for a local Date. */
export function mondayBasedDayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/**
 * Whether the habit is scheduled on this local calendar day, using current
 * recurrence fields only (no historical schedule versions).
 */
export function isHabitScheduledOnDate(
  date: Date,
  daysOfWeek: number[] | null | undefined,
  frequency?: string | null,
): boolean {
  if (frequency === 'DAILY') return true;
  const days = Array.isArray(daysOfWeek) ? daysOfWeek : [];
  if (days.length === 0) {
    // Empty WEEKLY list matches nothing on the timeline filter; empty + no
    // frequency treated as unscheduled rather than every-day.
    return frequency == null || frequency === '' ? false : frequency === 'DAILY';
  }
  return days.includes(mondayBasedDayIndex(date));
}

/** Local calendar date string for habit creation (date part only). */
export function habitCreatedLocalDate(
  createdAt: string | null | undefined,
): string | null {
  if (!createdAt) return null;
  const raw = String(createdAt).trim();
  const ymd = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  if (ymd) return ymd[1];
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return toLocalDateString(parsed);
}

export function sevenDayWindowEndingOn(endDateStr: string): string[] {
  const end = parseLocalDate(endDateStr);
  const dates: string[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(end.getFullYear(), end.getMonth(), end.getDate() - i);
    dates.push(toLocalDateString(d));
  }
  return dates;
}

function logCompleted(entry: HabitHistoryEntry | undefined): boolean {
  if (!entry) return false;
  if (entry.completed) return true;
  return String(entry.status || '').toUpperCase() === 'COMPLETED';
}

export function stateLabel(state: HabitActivityState): string {
  switch (state) {
    case 'completed':
      return 'Completed';
    case 'missed':
      return 'Not completed';
    case 'open_today':
      return 'Scheduled, still open';
    case 'unscheduled':
      return 'Not scheduled';
    case 'future':
      return 'Future';
    case 'before_start':
      return 'Before habit started';
    case 'unknown':
      return 'Unavailable';
    default:
      return 'Unknown';
  }
}

export function formatActivityDayExplanation(
  date: string,
  state: HabitActivityState,
  selected: boolean,
): string {
  const local = parseLocalDate(date);
  const dayIdx = mondayBasedDayIndex(local);
  const full = local.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const selectedBit = selected ? ' Selected day.' : '';
  return `${full} — ${stateLabel(state)}.${selectedBit}`;
}

export function resolveHabitActivityState(args: {
  date: string;
  todayDate: string;
  scheduled: boolean;
  completed: boolean;
  createdLocalDate: string | null;
  historyUnavailable?: boolean;
}): HabitActivityState {
  const { date, todayDate, scheduled, completed, createdLocalDate, historyUnavailable } =
    args;

  if (historyUnavailable) return 'unknown';

  if (createdLocalDate && date < createdLocalDate) return 'before_start';

  if (date > todayDate) return 'future';

  if (!scheduled) return 'unscheduled';

  if (completed) return 'completed';

  if (date === todayDate) return 'open_today';

  // Past scheduled day without a completion record.
  return 'missed';
}

export function buildHabitRecentActivity(
  input: BuildHabitRecentActivityInput,
): HabitActivityDay[] {
  const {
    occurrenceDate,
    todayDate,
    daysOfWeek,
    frequency,
    history,
    createdAt,
    historyUnavailable,
  } = input;

  const createdLocal = habitCreatedLocalDate(createdAt);
  const byDate = new Map<string, HabitHistoryEntry>();
  for (const entry of history || []) {
    if (entry?.date) byDate.set(entry.date, entry);
  }

  return sevenDayWindowEndingOn(occurrenceDate).map((date) => {
    const local = parseLocalDate(date);
    const dayIdx = mondayBasedDayIndex(local);
    const scheduled = isHabitScheduledOnDate(local, daysOfWeek, frequency);
    const entry = byDate.get(date);
    const completed = logCompleted(entry);
    const state = resolveHabitActivityState({
      date,
      todayDate,
      scheduled,
      completed,
      createdLocalDate: createdLocal,
      historyUnavailable: !!historyUnavailable,
    });

    const selected = date === occurrenceDate;
    const a11ySelected = selected ? ', selected day' : '';
    return {
      date,
      dayLabel: DAY_SHORT[dayIdx],
      state,
      selected,
      accessibilityLabel: `${DAY_NAMES[dayIdx]}, ${date}: ${stateLabel(state)}${a11ySelected}`,
    };
  });
}

/** Concise range for the Recent activity header, always shown. */
export function formatActivityRangeCaption(occurrenceDate: string): string {
  const dates = sevenDayWindowEndingOn(occurrenceDate);
  const start = parseLocalDate(dates[0]);
  const end = parseLocalDate(dates[6]);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const startLabel = start.toLocaleDateString([], opts);
  const endLabel = end.toLocaleDateString([], {
    ...opts,
    year: end.getFullYear() !== start.getFullYear() ? 'numeric' : undefined,
  });
  return `${startLabel}–${endLabel}`;
}
