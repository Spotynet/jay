/**
 * Run: npx --yes tsx src/utils/dayMetrics.test.ts
 */
import assert from 'node:assert/strict';
import {
  accessibilityMetricLabel,
  buildDueCountMetric,
  buildEventCountMetric,
  buildTaskHabitMetrics,
  clampProgress,
  formatCountStatus,
  formatRemainingStatus,
} from './dayMetrics';

assert.equal(clampProgress(2, 5), 0.4);
assert.equal(clampProgress(0, 0), 0);
assert.equal(clampProgress(5, 5), 1);
assert.equal(clampProgress(9, 5), 1);

assert.equal(formatRemainingStatus(0, 0), 'None planned');
assert.equal(formatRemainingStatus(0, 4), '4 left');
assert.equal(formatRemainingStatus(2, 5), '3 left');
assert.equal(formatRemainingStatus(5, 5), 'All done');
assert.equal(formatRemainingStatus(4, 5), '1 left');

assert.equal(formatCountStatus(0, 'None planned', (n) => `${n} planned`), 'None planned');
assert.equal(formatCountStatus(3, 'None planned', (n) => `${n} planned`), '3 planned');

{
  const [tasks, habits] = buildTaskHabitMetrics({
    tasks: [{ status: 'COMPLETED' }, { status: 'PENDING' }, { status: 'COMPLETED' }],
    habits: [{ completed: true }, { completed: false }],
    entityColors: { tasks: '#f00', habits: '#00f' },
  });
  assert.equal(tasks.value, 2);
  assert.equal(tasks.total, 3);
  assert.equal(habits.value, 1);
  assert.equal(habits.total, 2);
  assert.equal(formatRemainingStatus(tasks.value, tasks.total), '1 left');
}

{
  const events = buildEventCountMetric([{}, {}], '#0f0');
  assert.equal(events.kind, 'count');
  assert.equal(events.value, 2);
  assert.equal(events.total, 2);
}

{
  const due = buildDueCountMetric([], '#0a0');
  assert.equal(due.value, 0);
  assert.equal(due.kind, 'count');
}

assert.equal(
  accessibilityMetricLabel({
    id: 'habits',
    label: 'habits',
    kind: 'completion',
    value: 2,
    total: 5,
    color: '#00f',
  }),
  'habits: 2 of 5 completed, 3 remaining',
);

assert.equal(
  accessibilityMetricLabel({
    id: 'habits',
    label: 'habits',
    kind: 'completion',
    value: 0,
    total: 0,
    color: '#00f',
  }),
  'habits: none planned',
);

console.log('dayMetrics.test.ts: all assertions passed');
