/**
 * Run: npx --yes tsx src/utils/journalReviewCompletion.test.ts
 */
import assert from 'node:assert/strict';
import {
  areAllRequiredHabitsReviewed,
  isHabitExplicitlyReviewed,
  isJournalDayReviewComplete,
  isScoreExplicitlyRecorded,
} from './journalReviewCompletion';

// ── Mood / energy presence ─────────────────────────────────────────────────
assert.equal(isScoreExplicitlyRecorded(null), false);
assert.equal(isScoreExplicitlyRecorded(undefined), false);
assert.equal(isScoreExplicitlyRecorded(NaN), false);
assert.equal(isScoreExplicitlyRecorded(0), false);
assert.equal(isScoreExplicitlyRecorded(5.5), false, 'fractional default must not count');
assert.equal(isScoreExplicitlyRecorded(1), true);
assert.equal(isScoreExplicitlyRecorded(10), true);
assert.equal(isScoreExplicitlyRecorded(7), true);

// ── Habit reviewed mapping ─────────────────────────────────────────────────
assert.equal(isHabitExplicitlyReviewed('COMPLETED'), true);
assert.equal(isHabitExplicitlyReviewed('FAILED'), true, 'FAILED = Missed counts as reviewed');
assert.equal(isHabitExplicitlyReviewed('failed'), true);
assert.equal(isHabitExplicitlyReviewed('PENDING'), false);
assert.equal(isHabitExplicitlyReviewed('SKIPPED'), false, 'SKIPPED has no product rule');
assert.equal(isHabitExplicitlyReviewed(null), false);
assert.equal(isHabitExplicitlyReviewed(undefined), false);
assert.equal(isHabitExplicitlyReviewed('UNKNOWN'), false);

assert.equal(areAllRequiredHabitsReviewed([], false), false, 'loading must not look complete');
assert.equal(areAllRequiredHabitsReviewed([], true), true, 'zero habits when ready');
assert.equal(
  areAllRequiredHabitsReviewed(
    [
      { id: 1, status: 'COMPLETED' },
      { id: 2, status: 'FAILED' },
    ],
    true,
  ),
  true,
);
assert.equal(
  areAllRequiredHabitsReviewed([{ id: 1, status: 'COMPLETED' }, { id: 2, status: 'PENDING' }], true),
  false,
);

function day(
  partial: Partial<Parameters<typeof isJournalDayReviewComplete>[0]> & {
    habitsReady?: boolean;
  },
) {
  return isJournalDayReviewComplete({
    moodScore: 7,
    energyScore: 6,
    habits: [],
    habitsReady: true,
    ...partial,
  });
}

// No Mood → incomplete (screenshot: Mood “—”)
assert.equal(day({ moodScore: null }), false);
assert.equal(day({ moodScore: undefined }), false);

// No Energy → incomplete
assert.equal(day({ energyScore: null }), false);

// Untouched slider default → incomplete
assert.equal(day({ moodScore: null, energyScore: null }), false);

// Mood/Energy recorded, one habit unanswered → incomplete
assert.equal(
  day({
    habits: [
      { id: 1, status: 'COMPLETED' },
      { id: 2, status: 'PENDING' },
    ],
  }),
  false,
);

// All Completed → complete
assert.equal(
  day({
    habits: [
      { id: 1, status: 'COMPLETED' },
      { id: 2, status: 'COMPLETED' },
    ],
  }),
  true,
);

// All Missed (FAILED) → complete
assert.equal(
  day({
    habits: [
      { id: 1, status: 'FAILED' },
      { id: 2, status: 'FAILED' },
    ],
  }),
  true,
);

// Mixed Completed/Missed → complete
assert.equal(
  day({
    habits: [
      { id: 1, status: 'COMPLETED' },
      { id: 2, status: 'FAILED' },
    ],
  }),
  true,
);

// SKIPPED in the mix → incomplete
assert.equal(
  day({
    habits: [
      { id: 1, status: 'COMPLETED' },
      { id: 2, status: 'SKIPPED' },
    ],
  }),
  false,
);

// Reset one habit → incomplete
assert.equal(
  day({
    habits: [
      { id: 1, status: 'COMPLETED' },
      { id: 2, status: 'PENDING' },
    ],
  }),
  false,
);

// Clear Mood/Energy → incomplete
assert.equal(day({ moodScore: null, energyScore: 8, habits: [] }), false);
assert.equal(day({ moodScore: 8, energyScore: null, habits: [] }), false);

// Zero eligible habits with Mood/Energy → complete
assert.equal(day({ habits: [], habitsReady: true }), true);

// Habit list loading/error → not falsely complete
assert.equal(day({ habits: [], habitsReady: false }), false);
assert.equal(
  day({
    habitsReady: false,
    habits: [{ id: 1, status: 'COMPLETED' }],
  }),
  false,
);

// Stable-ID matching despite reordering (same coverage)
const orderedA = day({
  habits: [
    { id: 10, status: 'FAILED' },
    { id: 20, status: 'COMPLETED' },
  ],
});
const orderedB = day({
  habits: [
    { id: 20, status: 'COMPLETED' },
    { id: 10, status: 'FAILED' },
  ],
});
assert.equal(orderedA, true);
assert.equal(orderedB, true);

// Different dates remain independent at the call-site (pure input)
const dateA = day({ moodScore: 5, energyScore: 5, habits: [{ id: 1, status: 'COMPLETED' }] });
const dateB = day({ moodScore: null, energyScore: 5, habits: [{ id: 1, status: 'COMPLETED' }] });
assert.equal(dateA, true);
assert.equal(dateB, false);

console.log('journalReviewCompletion.test.ts: all assertions passed');
