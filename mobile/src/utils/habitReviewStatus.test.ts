/**
 * Run: npx --yes tsx src/utils/habitReviewStatus.test.ts
 */
import assert from 'node:assert/strict';
import {
  isHabitSegmentSelected,
  nextHabitStatusAfterSegmentTap,
  normalizeHabitLogStatus,
} from './habitReviewStatus';
import { isHabitExplicitlyReviewed, isJournalDayReviewComplete } from './journalReviewCompletion';

assert.equal(normalizeHabitLogStatus(null), 'PENDING');
assert.equal(normalizeHabitLogStatus('failed'), 'FAILED');

// PENDING must not look like SKIPPED selected
assert.equal(isHabitSegmentSelected('PENDING', 'SKIPPED'), false);
assert.equal(isHabitSegmentSelected('PENDING', 'COMPLETED'), false);
assert.equal(isHabitSegmentSelected('PENDING', 'FAILED'), false);
assert.equal(isHabitSegmentSelected('SKIPPED', 'SKIPPED'), true);
assert.equal(isHabitSegmentSelected('COMPLETED', 'COMPLETED'), true);
assert.equal(isHabitSegmentSelected('FAILED', 'FAILED'), true);

// Incomplete → complete → incomplete → complete (status transitions)
let status: string = 'PENDING';
assert.equal(isHabitExplicitlyReviewed(status), false);

status = nextHabitStatusAfterSegmentTap(status, 'COMPLETED');
assert.equal(status, 'COMPLETED');
assert.equal(isHabitExplicitlyReviewed(status), true);

status = nextHabitStatusAfterSegmentTap(status, 'FAILED');
assert.equal(status, 'FAILED');
assert.equal(isHabitExplicitlyReviewed(status), true, 'Completed → Missed stays reviewed');

status = nextHabitStatusAfterSegmentTap(status, 'FAILED');
assert.equal(status, 'PENDING');
assert.equal(isHabitExplicitlyReviewed(status), false, 're-tap clears to unanswered');

status = nextHabitStatusAfterSegmentTap(status, 'COMPLETED');
assert.equal(status, 'COMPLETED');

// Selector sync across those transitions
const base = {
  moodScore: 7 as number | null,
  energyScore: 6 as number | null,
  habitsReady: true,
};
assert.equal(
  isJournalDayReviewComplete({
    ...base,
    habits: [
      { id: 1, status: 'COMPLETED' },
      { id: 2, status: 'FAILED' },
    ],
  }),
  true,
);
assert.equal(
  isJournalDayReviewComplete({
    ...base,
    habits: [
      { id: 1, status: 'COMPLETED' },
      { id: 2, status: 'PENDING' },
    ],
  }),
  false,
);
assert.equal(
  isJournalDayReviewComplete({
    ...base,
    habits: [
      { id: 1, status: 'COMPLETED' },
      { id: 2, status: 'FAILED' },
    ],
  }),
  true,
);

// Clear mood → incomplete even if habits reviewed
assert.equal(
  isJournalDayReviewComplete({
    moodScore: null,
    energyScore: 6,
    habitsReady: true,
    habits: [{ id: 1, status: 'COMPLETED' }],
  }),
  false,
);

console.log('habitReviewStatus.test.ts: all assertions passed');
