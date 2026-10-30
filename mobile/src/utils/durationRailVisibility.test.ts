/**
 * Run: npx --yes tsx src/utils/durationRailVisibility.test.ts
 */
import assert from 'node:assert/strict';
import { buildTimelineInterval } from './timelineInterval';
import { AgendaItem } from './timelineLayout';
import { pruneSectionYs, resolveDurationRailGeometry } from './durationRailVisibility';
import { timedCardContentLeft, durationGutterLeft } from './timelineDurationLayout';

const task: AgendaItem = {
  id: 't-1',
  title: 'test',
  type: 'task',
  timeRange: '12:05',
  isActive: true,
  startTime: new Date(2026, 9, 30, 12, 5, 0),
  durationMinutes: 135,
};

const iv = buildTimelineInterval(task)!;
assert.equal(iv.endMinutes, 14 * 60 + 20);
assert.equal(iv.endBadgeLabel, 'Ends 14:20');

{
  const empty = resolveDurationRailGeometry(iv, {});
  assert.equal(empty.renderable, false);
}

{
  const geo = resolveDurationRailGeometry(iv, {
    'section-12-5': 120,
    'section-14-20': 420,
  });
  assert.equal(geo.renderable, true);
  assert.ok(geo.endY > geo.startY);
}

assert.equal(durationGutterLeft(16, 82), 98);
assert.equal(timedCardContentLeft(16, 82), 98);

{
  const prev = { 'section-12-5': 10, 'section-13-0': 50, 'section-99-0': 999 };
  const next = pruneSectionYs(prev, ['section-12-5', 'section-13-0', 'now']);
  assert.deepEqual(next, { 'section-12-5': 10, 'section-13-0': 50 });
}

console.log('durationRailVisibility.test.ts: all assertions passed');
