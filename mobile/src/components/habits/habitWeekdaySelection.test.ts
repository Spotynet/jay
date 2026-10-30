/**
 * Run: npx --yes tsx src/components/habits/habitWeekdaySelection.test.ts
 */
import assert from 'node:assert/strict';
import {
  isWeekdaySelected,
  normalizeDaysOfWeek,
} from './habitWeekdaySelection';

assert.deepEqual(normalizeDaysOfWeek([0, 1, 2, 3, 4, 5, 6]), [0, 1, 2, 3, 4, 5, 6]);
assert.deepEqual(normalizeDaysOfWeek(['0', '1', '4']), [0, 1, 4]);
assert.deepEqual(normalizeDaysOfWeek([0, '0', 1, 9, 'x']), [0, 1]);
assert.deepEqual(normalizeDaysOfWeek(null), []);
assert.deepEqual(normalizeDaysOfWeek(undefined), []);

assert.equal(isWeekdaySelected([0, 1, 2, 3, 4], 0), true);
assert.equal(isWeekdaySelected([0, 1, 2, 3, 4], 5), false);
// Stringly API values must not silently fail includes(number).
assert.equal(isWeekdaySelected(normalizeDaysOfWeek(['0', '1']), 0), true);

console.log('habitWeekdaySelection.test.ts: all assertions passed');
