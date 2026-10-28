/**
 * Run: npx --yes tsx src/utils/itemDetailsFormat.test.ts
 */
import assert from 'node:assert/strict';
import {
  formatClockTime,
  formatDuration,
  formatFriendlyDate,
  formatHabitGoal,
  formatRepeatDays,
} from './itemDetailsFormat';

assert.equal(formatRepeatDays([0, 1, 2, 3, 4, 5, 6]), 'Every day');
assert.equal(formatRepeatDays([0, 1, 2, 3, 4]), 'Monday–Friday');
assert.equal(formatRepeatDays([5, 6]), 'Saturday–Sunday');
assert.equal(formatRepeatDays([0, 2, 4]), 'Monday, Wednesday, Friday');
assert.equal(formatRepeatDays([]), 'No repeat days');

assert.equal(formatClockTime('07:00:00'), new Date(1970, 0, 1, 7, 0).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
assert.equal(formatClockTime(null), null);

assert.equal(formatDuration('01:30:00'), '1h 30m');
assert.equal(formatDuration('00:15:00'), '15 min');
assert.equal(formatDuration('02:00:00'), '2 hours');

assert.ok(formatFriendlyDate('2026-10-28')?.includes('28'));
assert.equal(formatHabitGoal({ has_target: false }), 'No daily goal');
assert.equal(formatHabitGoal({ has_target: true, target_value: 2, target_type: 'COUNT' }), '2 times per day');

console.log('itemDetailsFormat.test.ts: all assertions passed');
