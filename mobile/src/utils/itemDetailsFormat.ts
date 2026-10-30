/** Human-readable formatting for item-details views. */

const DAY_LABELS_SHORT = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] as const;
const DAY_LABELS_LONG = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

/** Habit days_of_week uses 0=Monday … 6=Sunday. */
export function formatRepeatDays(days: number[] | null | undefined): string {
  if (!days || days.length === 0) return 'No repeat days';
  const sorted = [...new Set(days)].filter((d) => d >= 0 && d <= 6).sort((a, b) => a - b);
  if (sorted.length === 7) return 'Every day';
  if (sorted.length === 5 && [0, 1, 2, 3, 4].every((d) => sorted.includes(d))) {
    return 'Monday–Friday';
  }
  if (sorted.length === 2 && sorted[0] === 5 && sorted[1] === 6) {
    return 'Saturday–Sunday';
  }
  // Contiguous range → "Monday–Thursday"
  const contiguous =
    sorted.length > 1 && sorted.every((d, i) => i === 0 || d === sorted[i - 1] + 1);
  if (contiguous) {
    return `${DAY_LABELS_LONG[sorted[0]]}–${DAY_LABELS_LONG[sorted[sorted.length - 1]]}`;
  }
  return sorted.map((d) => DAY_LABELS_LONG[d]).join(', ');
}

export function shortDayLabels(days: number[] | null | undefined): string[] {
  if (!days) return [];
  return [...new Set(days)]
    .filter((d) => d >= 0 && d <= 6)
    .sort((a, b) => a - b)
    .map((d) => DAY_LABELS_SHORT[d]);
}

/** Accepts "07:00", "07:00:00", or Date → "7:00 AM" style via locale. */
export function formatClockTime(value: string | Date | null | undefined): string | null {
  if (value == null || value === '') return null;
  let date: Date;
  if (value instanceof Date) {
    date = value;
  } else {
    const raw = String(value).trim();
    const match = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?/);
    if (!match) return raw;
    date = new Date(1970, 0, 1, parseInt(match[1], 10), parseInt(match[2], 10), 0, 0);
  }
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function formatFriendlyDate(value: string | Date | null | undefined): string | null {
  if (value == null || value === '') return null;
  const date =
    value instanceof Date
      ? value
      : (() => {
          const s = String(value);
          // Prefer local YYYY-MM-DD
          const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
          if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
          return new Date(s);
        })();
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDuration(value: string | null | undefined): string | null {
  if (!value) return null;
  const parts = String(value).split(':');
  if (parts.length < 2) return null;
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  if (h === 0 && m === 0) return null;
  if (h === 0) return `${m} min`;
  if (m === 0) return h === 1 ? '1 hour' : `${h} hours`;
  return `${h}h ${m}m`;
}

type ParsedClock = { h: number; m: number; s: number };
type ParsedDuration = { h: number; m: number; s: number; totalSeconds: number };

function parseClockParts(value: string | null | undefined): ParsedClock | null {
  if (value == null || value === '') return null;
  const match = String(value).trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const s = parseInt(match[3] || '0', 10);
  if ([h, m, s].some((n) => Number.isNaN(n))) return null;
  return { h, m, s };
}

function parseDurationParts(value: string | null | undefined): ParsedDuration | null {
  if (!value) return null;
  const parts = String(value).trim().split(':');
  if (parts.length < 2) return null;
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  const s = parseInt(parts[2] || '0', 10) || 0;
  if ([h, m, s].some((n) => Number.isNaN(n))) return null;
  const totalSeconds = h * 3600 + m * 60 + s;
  if (totalSeconds <= 0) return null;
  return { h, m, s, totalSeconds };
}

function parseLocalDateParts(value: string | Date | null | undefined): Date | null {
  if (value == null || value === '') return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const s = String(value);
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Start clock + duration → end clock (local wall time).
 * Returns null when either value is missing/unparseable.
 * Does not invent midnight for untimed items.
 */
export function formatEndClockTime(
  start: string | null | undefined,
  duration: string | null | undefined,
): string | null {
  const startParts = parseClockParts(start);
  const dur = parseDurationParts(duration);
  if (!startParts || !dur) return null;
  const end = new Date(1970, 0, 1, startParts.h, startParts.m, startParts.s, 0);
  end.setSeconds(end.getSeconds() + dur.totalSeconds);
  return formatClockTime(end);
}

/** Read-only Event Details schedule fields (omit empty — never invent times). */
export type EventScheduleDisplay = {
  dateLabel: string | null;
  startLabel: string | null;
  /** Clock, or clock + date when the interval crosses midnight. */
  endLabel: string | null;
  durationLabel: string | null;
  crossesMidnight: boolean;
};

/**
 * Canonical event interval for Details: date + start_time + duration.
 * End is derived; duration is display-only (no write-back).
 */
export function buildEventScheduleDisplay(event: {
  date?: string | Date | null;
  start_time?: string | null;
  duration?: string | null;
}): EventScheduleDisplay {
  const dateLabel = formatFriendlyDate(event?.date ?? null);
  const startLabel = formatClockTime(event?.start_time ?? null);
  const durationLabel = formatDuration(event?.duration ?? null);
  const startParts = parseClockParts(event?.start_time);
  const dur = parseDurationParts(event?.duration);
  if (!startParts || !dur) {
    return {
      dateLabel,
      startLabel,
      endLabel: null,
      durationLabel,
      crossesMidnight: false,
    };
  }

  const baseDate = parseLocalDateParts(event?.date ?? null) ?? new Date(1970, 0, 1);
  const startDt = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate(),
    startParts.h,
    startParts.m,
    startParts.s,
    0,
  );
  const endDt = new Date(startDt.getTime() + dur.totalSeconds * 1000);
  const crossesMidnight =
    endDt.getFullYear() !== startDt.getFullYear() ||
    endDt.getMonth() !== startDt.getMonth() ||
    endDt.getDate() !== startDt.getDate();
  const endClock = formatClockTime(endDt);
  const endDateLabel = formatFriendlyDate(endDt);
  const endLabel =
    endClock && crossesMidnight && endDateLabel
      ? `${endClock} · ${endDateLabel}`
      : endClock;

  return {
    dateLabel,
    startLabel,
    endLabel,
    durationLabel,
    crossesMidnight,
  };
}

/** Nonempty trimmed text, or null (omit empty optional sections). */
export function nonemptyText(value: unknown): string | null {
  if (value == null) return null;
  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function formatHabitGoal(habit: {
  has_target?: boolean;
  target_value?: number;
  target_type?: string;
}): string {
  if (!habit?.has_target) return 'No daily goal';
  const value = habit.target_value ?? 1;
  if (habit.target_type === 'TIME') {
    return value === 1 ? '1 minute per day' : `${value} minutes per day`;
  }
  return value === 1 ? '1 time per day' : `${value} times per day`;
}

export function formatHabitSummaryLine(habit: {
  days_of_week?: number[];
  reminder_time?: string | null;
}): string {
  const days = formatRepeatDays(habit.days_of_week);
  const time = formatClockTime(habit.reminder_time ?? null);
  if (time) return `${days} · ${time}`;
  return days;
}
