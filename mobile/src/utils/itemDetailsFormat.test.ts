/**
 * Run: npx --yes tsx src/utils/itemDetailsFormat.test.ts
 */
import assert from 'node:assert/strict';
import {
  buildEventScheduleDisplay,
  formatClockTime,
  formatDuration,
  formatEndClockTime,
  formatFriendlyDate,
  formatHabitGoal,
  formatRepeatDays,
  nonemptyText,
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
assert.equal(formatDuration('02:30:00'), '2h 30m');
assert.equal(formatDuration('00:00:00'), null);

assert.equal(
  formatEndClockTime('09:00:00', '01:30:00'),
  formatClockTime('10:30:00'),
);
assert.equal(formatEndClockTime('09:00', null), null);
assert.equal(formatEndClockTime(null, '01:00:00'), null);
assert.equal(formatEndClockTime('09:00', '00:00:00'), null);

assert.ok(formatFriendlyDate('2026-10-28')?.includes('28'));
assert.equal(formatHabitGoal({ has_target: false }), 'No daily goal');
assert.equal(formatHabitGoal({ has_target: true, target_value: 2, target_type: 'COUNT' }), '2 times per day');

assert.equal(nonemptyText('  hello  '), 'hello');
assert.equal(nonemptyText('   '), null);
assert.equal(nonemptyText(null), null);
assert.equal(nonemptyText(undefined), null);

// Screenshot-style event: 17:00–19:30 (2h 30m)
{
  const schedule = buildEventScheduleDisplay({
    date: '2026-10-30',
    start_time: '17:00:00',
    duration: '02:30:00',
  });
  assert.ok(schedule.dateLabel?.includes('30'));
  assert.equal(schedule.startLabel, formatClockTime('17:00:00'));
  assert.equal(schedule.endLabel, formatClockTime('19:30:00'));
  assert.equal(schedule.durationLabel, '2h 30m');
  assert.equal(schedule.crossesMidnight, false);
}

// Cross-midnight: end must include the next calendar date
{
  const schedule = buildEventScheduleDisplay({
    date: '2026-10-30',
    start_time: '23:00:00',
    duration: '02:00:00',
  });
  assert.equal(schedule.crossesMidnight, true);
  assert.ok(schedule.endLabel);
  assert.ok(schedule.endLabel!.includes(formatClockTime('01:00:00')!));
  assert.ok(schedule.endLabel!.includes('31') || schedule.endLabel!.includes('Oct'));
  assert.equal(schedule.durationLabel, '2 hours');
}

// Missing start/duration — do not fabricate end
{
  const schedule = buildEventScheduleDisplay({
    date: '2026-10-30',
    start_time: null,
    duration: '01:00:00',
  });
  assert.equal(schedule.startLabel, null);
  assert.equal(schedule.endLabel, null);
  assert.equal(schedule.durationLabel, '1 hour');
}

{
  const schedule = buildEventScheduleDisplay({
    date: '2026-10-30',
    start_time: '09:00:00',
    duration: null,
  });
  assert.equal(schedule.startLabel, formatClockTime('09:00:00'));
  assert.equal(schedule.endLabel, null);
  assert.equal(schedule.durationLabel, null);
}

console.log('itemDetailsFormat.test.ts: all assertions passed');
