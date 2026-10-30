/**
 * Journal day review coverage — timeline “completed” means the day was reviewed,
 * not that every habit succeeded.
 *
 * Reviewed habit statuses (explicit):
 * - COMPLETED
 * - FAILED (product “Missed”)
 *
 * Not reviewed:
 * - PENDING / missing / null / unrecognized
 * - SKIPPED (no established product rule to count it)
 */

export const JOURNAL_SCORE_MIN = 1;
export const JOURNAL_SCORE_MAX = 10;

export type JournalHabitReviewStatus =
  | 'PENDING'
  | 'COMPLETED'
  | 'SKIPPED'
  | 'FAILED'
  | string
  | null
  | undefined;

export type JournalHabitReviewItem = {
  id: number;
  status?: JournalHabitReviewStatus;
};

export type JournalDayReviewInput = {
  moodScore: number | null | undefined;
  energyScore: number | null | undefined;
  /** Date-specific habit rows (same set as Journal tab / getHabitsForDate). */
  habits: JournalHabitReviewItem[];
  /**
   * False while habits are loading or the load failed.
   * Prevents treating an empty array as “zero required habits → complete”.
   */
  habitsReady: boolean;
};

/** Explicit mood/energy recording: integer in 1–10. Null/undefined/NaN = not recorded. */
export function isScoreExplicitlyRecorded(score: number | null | undefined): boolean {
  if (score === null || score === undefined) return false;
  if (typeof score !== 'number' || !Number.isFinite(score)) return false;
  const n = Math.trunc(score);
  if (n !== score) return false; // reject fractional placeholders
  return n >= JOURNAL_SCORE_MIN && n <= JOURNAL_SCORE_MAX;
}

/** Explicit Completed or Missed (FAILED). SKIPPED / PENDING do not count. */
export function isHabitExplicitlyReviewed(status: JournalHabitReviewStatus): boolean {
  const s = String(status ?? '')
    .trim()
    .toUpperCase();
  return s === 'COMPLETED' || s === 'FAILED';
}

/**
 * Every required habit for the date has an explicit Completed or Missed entry.
 * When habitsReady and the list is empty, coverage is vacuously true.
 */
export function areAllRequiredHabitsReviewed(
  habits: JournalHabitReviewItem[],
  habitsReady: boolean,
): boolean {
  if (!habitsReady) return false;
  for (const habit of habits) {
    if (!isHabitExplicitlyReviewed(habit.status)) return false;
  }
  return true;
}

/**
 * Pure Journal-day completion selector.
 * journalComplete = mood recorded ∧ energy recorded ∧ every required habit reviewed.
 */
export function isJournalDayReviewComplete(input: JournalDayReviewInput): boolean {
  if (!input.habitsReady) return false;
  if (!isScoreExplicitlyRecorded(input.moodScore)) return false;
  if (!isScoreExplicitlyRecorded(input.energyScore)) return false;
  return areAllRequiredHabitsReviewed(input.habits, true);
}
