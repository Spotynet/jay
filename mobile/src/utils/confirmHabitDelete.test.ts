/**
 * Run: npx --yes tsx src/utils/confirmHabitDelete.test.ts
 */
import assert from 'node:assert/strict';
import { habitDeleteAlertMessage } from './habitDeleteCopy';

assert.equal(
  habitDeleteAlertMessage('Gym'),
  'Delete “Gym” and its completion history? This can’t be undone.',
);
assert.equal(
  habitDeleteAlertMessage('  '),
  'Delete “this habit” and its completion history? This can’t be undone.',
);
assert.match(habitDeleteAlertMessage('Read'), /completion history/);
assert.doesNotMatch(habitDeleteAlertMessage('Read'), /occurrence|selected day/i);

console.log('confirmHabitDelete.test.ts: all assertions passed');
