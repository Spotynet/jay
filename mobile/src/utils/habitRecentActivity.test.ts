/**
 * Run: npx --yes tsx src/utils/habitRecentActivity.test.ts
 */
import assert from 'node:assert/strict';
import {
  buildHabitRecentActivity,
  formatActivityRangeCaption,
  habitCreatedLocalDate,
  isHabitScheduledOnDate,
  mondayBasedDayIndex,
  resolveHabitActivityState,
  sevenDayWindowEndingOn,
} from './habitRecentActivity';
import { parseLocalDate } from './date';

// ── Window boundaries ──────────────────────────────────────────────────────

{
  const dates = sevenDayWindowEndingOn('2026-10-29');
  assert.equal(dates.length, 7);
  assert.equal(dates[0], '2026-10-23');
  assert.equal(dates[6], '2026-10-29');
}

// Local DST spring-forward (US): Mar 8 2026 — still consecutive calendar days.
{
  const dates = sevenDayWindowEndingOn('2026-03-10');
  assert.deepEqual(dates, [
    '2026-03-04',
    '2026-03-05',
    '2026-03-06',
    '2026-03-07',
    '2026-03-08',
    '2026-03-09',
    '2026-03-10',
  ]);
}

// Local DST fall-back: Nov 1 2026 week still seven calendar days.
{
  const dates = sevenDayWindowEndingOn('2026-11-02');
  assert.equal(dates[0], '2026-10-27');
  assert.equal(dates[6], '2026-11-02');
}

assert.ok(formatActivityRangeCaption('2026-10-29').includes('–'));
assert.ok(formatActivityRangeCaption('2026-10-20').includes('–'));

// ── Schedule eligibility (current recurrence only) ─────────────────────────

{
  const wed = parseLocalDate('2026-10-28'); // Wednesday → index 2
  assert.equal(mondayBasedDayIndex(wed), 2);
  assert.equal(isHabitScheduledOnDate(wed, [0, 1, 2, 3, 4], 'WEEKLY'), true);
  assert.equal(isHabitScheduledOnDate(wed, [5, 6], 'WEEKLY'), false);
  assert.equal(isHabitScheduledOnDate(wed, [], 'DAILY'), true);
  assert.equal(isHabitScheduledOnDate(wed, [], 'WEEKLY'), false);
}

// ── State resolution ───────────────────────────────────────────────────────

assert.equal(
  resolveHabitActivityState({
    date: '2026-10-20',
    todayDate: '2026-10-29',
    scheduled: true,
    completed: false,
    createdLocalDate: '2026-10-25',
  }),
  'before_start',
);

assert.equal(
  resolveHabitActivityState({
    date: '2026-10-30',
    todayDate: '2026-10-29',
    scheduled: true,
    completed: false,
    createdLocalDate: null,
  }),
  'future',
);

assert.equal(
  resolveHabitActivityState({
    date: '2026-10-28',
    todayDate: '2026-10-29',
    scheduled: false,
    completed: false,
    createdLocalDate: null,
  }),
  'unscheduled',
);

assert.equal(
  resolveHabitActivityState({
    date: '2026-10-28',
    todayDate: '2026-10-29',
    scheduled: true,
    completed: true,
    createdLocalDate: null,
  }),
  'completed',
);

assert.equal(
  resolveHabitActivityState({
    date: '2026-10-28',
    todayDate: '2026-10-29',
    scheduled: true,
    completed: false,
    createdLocalDate: null,
  }),
  'missed',
);

assert.equal(
  resolveHabitActivityState({
    date: '2026-10-29',
    todayDate: '2026-10-29',
    scheduled: true,
    completed: false,
    createdLocalDate: null,
  }),
  'open_today',
);

assert.equal(
  resolveHabitActivityState({
    date: '2026-10-29',
    todayDate: '2026-10-29',
    scheduled: true,
    completed: false,
    createdLocalDate: null,
    historyUnavailable: true,
  }),
  'unknown',
);

// Future must never be missed even if scheduled and incomplete.
assert.equal(
  resolveHabitActivityState({
    date: '2026-11-01',
    todayDate: '2026-10-29',
    scheduled: true,
    completed: false,
    createdLocalDate: null,
  }),
  'future',
);

// Unscheduled past day is not a failure.
assert.equal(
  resolveHabitActivityState({
    date: '2026-10-25',
    todayDate: '2026-10-29',
    scheduled: false,
    completed: false,
    createdLocalDate: null,
  }),
  'unscheduled',
);

assert.equal(habitCreatedLocalDate('2026-10-15T18:30:00Z'), '2026-10-15');
assert.equal(habitCreatedLocalDate(null), null);

// ── Everyday vs selected-day window ────────────────────────────────────────

{
  const everyday = buildHabitRecentActivity({
    occurrenceDate: '2026-10-29',
    todayDate: '2026-10-29',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    frequency: 'WEEKLY',
    history: [
      { date: '2026-10-27', completed: true },
      { date: '2026-10-28', status: 'COMPLETED' },
    ],
    createdAt: '2026-01-01',
  });
  assert.equal(everyday.length, 7);
  assert.equal(everyday.find((d) => d.date === '2026-10-27')?.state, 'completed');
  assert.equal(everyday.find((d) => d.date === '2026-10-28')?.state, 'completed');
  assert.equal(everyday.find((d) => d.date === '2026-10-26')?.state, 'missed');
  assert.equal(everyday.find((d) => d.date === '2026-10-29')?.state, 'open_today');
}

{
  // Weekdays only; weekend unscheduled; selected historical occurrence.
  const weekdays = buildHabitRecentActivity({
    occurrenceDate: '2026-10-24', // Saturday
    todayDate: '2026-10-29',
    daysOfWeek: [0, 1, 2, 3, 4],
    frequency: 'WEEKLY',
    history: [{ date: '2026-10-23', completed: true }], // Friday
    createdAt: '2026-01-01',
  });
  assert.equal(weekdays[0].date, '2026-10-18'); // Sun
  assert.equal(weekdays.find((d) => d.date === '2026-10-19')?.state, 'missed'); // Mon
  assert.equal(weekdays.find((d) => d.date === '2026-10-23')?.state, 'completed');
  assert.equal(weekdays.find((d) => d.date === '2026-10-24')?.state, 'unscheduled'); // Sat
  assert.equal(weekdays.find((d) => d.date === '2026-10-18')?.state, 'unscheduled'); // Sun
}

{
  // Dates before creation are not missed.
  const young = buildHabitRecentActivity({
    occurrenceDate: '2026-10-29',
    todayDate: '2026-10-29',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    frequency: 'WEEKLY',
    history: [],
    createdAt: '2026-10-27T12:00:00Z',
  });
  assert.equal(young.find((d) => d.date === '2026-10-25')?.state, 'before_start');
  assert.equal(young.find((d) => d.date === '2026-10-27')?.state, 'missed');
}

{
  // Occurrence window in the future relative to today — no missed futures.
  const futureEnd = buildHabitRecentActivity({
    occurrenceDate: '2026-11-02',
    todayDate: '2026-10-29',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    frequency: 'WEEKLY',
    history: [{ date: '2026-10-28', completed: true }],
    createdAt: '2026-01-01',
  });
  assert.equal(futureEnd.find((d) => d.date === '2026-10-28')?.state, 'completed');
  assert.equal(futureEnd.find((d) => d.date === '2026-10-29')?.state, 'open_today');
  assert.equal(futureEnd.find((d) => d.date === '2026-10-30')?.state, 'future');
  assert.equal(futureEnd.find((d) => d.date === '2026-11-02')?.state, 'future');
}

{
  const missing = buildHabitRecentActivity({
    occurrenceDate: '2026-10-29',
    todayDate: '2026-10-29',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    history: null,
    historyUnavailable: true,
  });
  assert.ok(missing.every((d) => d.state === 'unknown'));
}

console.log('habitRecentActivity.test.ts: all assertions passed');
