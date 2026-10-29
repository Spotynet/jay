/**
 * Relative / absolute labels for the selected-occurrence card.
 */

import { parseLocalDate } from './date';

export type OccurrenceCardLabels = {
  /** “Today” / “Yesterday” / “Tomorrow” / localized weekday+date. */
  primary: string;
  /** Full weekday date when primary is relative; otherwise null. */
  secondary: string | null;
};

function calendarDayDelta(fromYmd: string, toYmd: string): number {
  const from = parseLocalDate(fromYmd);
  const to = parseLocalDate(toYmd);
  const ms = to.getTime() - from.getTime();
  return Math.round(ms / 86400000);
}

function fullWeekdayDate(ymd: string): string {
  const d = parseLocalDate(ymd);
  return d.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function compactWeekdayDate(ymd: string): string {
  const d = parseLocalDate(ymd);
  return d.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * @param occurrenceDate YYYY-MM-DD selected day
 * @param todayDate YYYY-MM-DD local today
 */
export function formatOccurrenceCardLabels(
  occurrenceDate: string,
  todayDate: string,
): OccurrenceCardLabels {
  if (!occurrenceDate) {
    return { primary: 'Unknown date', secondary: null };
  }

  const delta = calendarDayDelta(todayDate, occurrenceDate);

  if (delta === 0) {
    return { primary: 'Today', secondary: fullWeekdayDate(occurrenceDate) };
  }
  if (delta === -1) {
    return { primary: 'Yesterday', secondary: fullWeekdayDate(occurrenceDate) };
  }
  if (delta === 1) {
    return { primary: 'Tomorrow', secondary: fullWeekdayDate(occurrenceDate) };
  }

  // Non-adjacent: one localized line is enough — do not say “Today”.
  return {
    primary: Math.abs(delta) < 7 ? fullWeekdayDate(occurrenceDate) : compactWeekdayDate(occurrenceDate),
    secondary: null,
  };
}
