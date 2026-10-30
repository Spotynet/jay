/**
 * Run: npx --yes tsx src/components/habits/habitDayStripMapping.test.ts
 */
import assert from 'node:assert/strict';
import {
  activityStateToIndicator,
  mapActivityDayToStripItem,
} from './habitDayStripActivity';
import type { HabitActivityDay, HabitActivityState } from '../../utils/habitRecentActivity';
import { isWeekdaySelected } from './habitWeekdaySelection';

function day(
  overrides: Partial<HabitActivityDay> & Pick<HabitActivityDay, 'state'>,
): HabitActivityDay {
  return {
    date: '2026-10-29',
    dayLabel: 'Wed',
    accessibilityLabel: 'Wednesday, 2026-10-29: completed',
    selected: false,
    ...overrides,
  };
}

const EXPECTED: Record<HabitActivityState, string> = {
  completed: 'check',
  missed: 'dot',
  open_today: 'open',
  unscheduled: 'dash',
  before_start: 'dash',
  future: 'future',
  unknown: 'unknown',
};

for (const [state, indicator] of Object.entries(EXPECTED) as [
  HabitActivityState,
  string,
][]) {
  assert.equal(
    activityStateToIndicator(state),
    indicator,
    `${state} → ${indicator}`,
  );
}

const completed = mapActivityDayToStripItem(
  day({
    state: 'completed',
    selected: true,
    date: '2026-10-30',
    dayLabel: 'Thu',
    accessibilityLabel: 'Thursday, 2026-10-30: Completed, selected day',
  }),
);
assert.equal(completed.indicator, 'check');
assert.equal(completed.label, 'Thu');
assert.equal(completed.key, '2026-10-30');
assert.equal(
  (completed as { referenceMarked?: boolean }).referenceMarked,
  undefined,
  'underline / referenceMarked removed from strip items',
);

const missed = mapActivityDayToStripItem(
  day({
    state: 'missed',
    accessibilityLabel: 'Wednesday, 2026-10-29: Not completed',
  }),
);
assert.equal(missed.indicator, 'dot');
assert.match(missed.accessibilityLabel, /Not completed/);

const unscheduled = mapActivityDayToStripItem(day({ state: 'unscheduled' }));
assert.equal(unscheduled.indicator, 'dash');

const open = mapActivityDayToStripItem(day({ state: 'open_today' }));
assert.equal(open.indicator, 'open');

const future = mapActivityDayToStripItem(day({ state: 'future' }));
assert.equal(future.indicator, 'future');

const unknown = mapActivityDayToStripItem(day({ state: 'unknown' }));
assert.equal(unknown.indicator, 'unknown');

// Schedule mapping: selected indices → check vs empty (Mon=0 … Sun=6)
const custom = [0, 1, 2, 4]; // Mon/Tue/Wed/Fri
for (let i = 0; i < 7; i++) {
  const selected = isWeekdaySelected(custom, i);
  assert.equal(selected ? 'check' : 'empty', selected ? 'check' : 'empty');
  assert.equal(selected, custom.includes(i));
}

console.log('habitDayStripMapping.test.ts: all assertions passed');
