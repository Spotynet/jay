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

/**
 * Start clock + duration → end clock (local wall time, same calendar day).
 * Returns null when either value is missing/unparseable.
 * Does not invent midnight for untimed items.
 */
export function formatEndClockTime(
  start: string | null | undefined,
  duration: string | null | undefined,
): string | null {
  if (!start || !duration) return null;
  const startMatch = String(start).trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  const durParts = String(duration).trim().split(':');
  if (!startMatch || durParts.length < 2) return null;
  const startH = parseInt(startMatch[1], 10);
  const startM = parseInt(startMatch[2], 10);
  const startS = parseInt(startMatch[3] || '0', 10);
  const durH = parseInt(durParts[0], 10) || 0;
  const durM = parseInt(durParts[1], 10) || 0;
  const durS = parseInt(durParts[2] || '0', 10) || 0;
  if ([startH, startM, startS, durH, durM, durS].some((n) => Number.isNaN(n))) {
    return null;
  }
  if (durH === 0 && durM === 0 && durS === 0) return null;
  const end = new Date(1970, 0, 1, startH, startM, startS, 0);
  end.setSeconds(end.getSeconds() + durH * 3600 + durM * 60 + durS);
  return formatClockTime(end);
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
