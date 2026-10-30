/**
 * Journal habit segment control semantics (Completed / Missed / Skipped).
 * PENDING = unanswered (no segment selected).
 * Re-tapping the active segment clears back to PENDING.
 */

export type HabitLogStatus = 'PENDING' | 'COMPLETED' | 'SKIPPED' | 'FAILED';
export type HabitReviewSegment = 'COMPLETED' | 'SKIPPED' | 'FAILED';

export function normalizeHabitLogStatus(raw: unknown): HabitLogStatus {
  const s = String(raw ?? '')
    .trim()
    .toUpperCase();
  if (s === 'COMPLETED' || s === 'SKIPPED' || s === 'FAILED' || s === 'PENDING') {
    return s;
  }
  return 'PENDING';
}

/** Whether a segment button should appear selected. PENDING → none. */
export function isHabitSegmentSelected(
  status: unknown,
  segment: HabitReviewSegment,
): boolean {
  return normalizeHabitLogStatus(status) === segment;
}

/**
 * Next status after tapping a segment.
 * Active segment → PENDING (unanswered). Inactive → that status.
 */
export function nextHabitStatusAfterSegmentTap(
  current: unknown,
  tapped: HabitReviewSegment,
): HabitLogStatus {
  const status = normalizeHabitLogStatus(current);
  return status === tapped ? 'PENDING' : tapped;
}
