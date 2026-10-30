/**
 * Run: npx --yes tsx src/utils/timelineInterval.test.ts
 */
import assert from 'node:assert/strict';
import {
  allocateIntervalLanes,
  buildTimelineInterval,
  collectEndpointMinutes,
  collectTimelineIntervals,
  formatClockFromMinutes,
  formatDurationMinutes,
  parseDurationToMinutes,
  sectionIdForMinutes,
} from './timelineInterval';
import { AgendaItem } from './timelineLayout';
import { buildTimelineSections } from './timelineLayout';

assert.equal(parseDurationToMinutes('02:15:00'), 135);
assert.equal(parseDurationToMinutes('00:05:00'), 5);
assert.equal(parseDurationToMinutes('00:00:00'), undefined);
assert.equal(formatDurationMinutes(135), '2h 15m');
assert.equal(formatClockFromMinutes(12 * 60 + 5), '12:05');
assert.equal(formatClockFromMinutes(14 * 60 + 20), '14:20');

const start = new Date(2026, 9, 30, 12, 5, 0);
const task: AgendaItem = {
  id: 't-1',
  title: 'Deep work',
  type: 'task',
  timeRange: '12:05',
  isActive: true,
  startTime: start,
  durationMinutes: 135,
};

const iv = buildTimelineInterval(task);
assert.ok(iv);
assert.equal(iv!.startMinutes, 12 * 60 + 5);
assert.equal(iv!.endMinutes, 14 * 60 + 20);
assert.equal(iv!.durationMinutes, 135);
assert.equal(iv!.endMinutes - iv!.startMinutes, 135);
assert.equal((iv!.endMinutes - iv!.startMinutes) / 60, 2.25);
assert.equal(iv!.rangeSubtitle, '12:05–14:20 · 2h 15m');
assert.equal(iv!.endBadgeLabel, 'Ends 14:20');
assert.equal(sectionIdForMinutes(iv!.displayEndMinutes), 'section-14-20');

assert.equal(buildTimelineInterval({ ...task, durationMinutes: 0 }), null);
assert.equal(buildTimelineInterval({ ...task, startTime: null }), null);

const endpoints = collectEndpointMinutes(collectTimelineIntervals([task]));
assert.deepEqual(endpoints, [14 * 60 + 20]);

const sections = buildTimelineSections([task], { endpointMinutes: endpoints });
assert.ok(sections.some((s) => s.id === 'section-12-5' && s.occupied));
assert.ok(
  sections.some((s) => s.id === 'section-14-20' && !s.occupied),
  'end minute is a compact endpoint anchor',
);

// Lane allocation: overlapping vs back-to-back [start, end)
const a = buildTimelineInterval({
  ...task,
  id: 'a',
  startTime: new Date(2026, 9, 30, 12, 0, 0),
  durationMinutes: 60,
})!;
const b = buildTimelineInterval({
  ...task,
  id: 'b',
  startTime: new Date(2026, 9, 30, 12, 30, 0),
  durationMinutes: 60,
})!;
const c = buildTimelineInterval({
  ...task,
  id: 'c',
  startTime: new Date(2026, 9, 30, 13, 0, 0),
  durationMinutes: 30,
})!;
const lanes = allocateIntervalLanes([a, b, c]);
const laneOf = (id: string) => lanes.find((x) => x.itemId === id)!.lane;
assert.equal(laneOf('a'), 0);
assert.equal(laneOf('b'), 1, 'overlaps a → new lane');
assert.equal(laneOf('c'), 0, 'starts when a ends → reuse lane 0');

// Identical starts — stable itemId tie-break, separate lanes
{
  const x = buildTimelineInterval({
    ...task,
    id: 'x',
    startTime: new Date(2026, 9, 30, 9, 0, 0),
    durationMinutes: 45,
  })!;
  const y = buildTimelineInterval({
    ...task,
    id: 'y',
    startTime: new Date(2026, 9, 30, 9, 0, 0),
    durationMinutes: 45,
  })!;
  const sameStart = allocateIntervalLanes([y, x]); // reverse input order
  assert.equal(sameStart.find((l) => l.itemId === 'x')!.lane, 0);
  assert.equal(sameStart.find((l) => l.itemId === 'y')!.lane, 1);
}

// Cross-midnight: clip display end; no "Ends" at 24:00 boundary as true end
{
  const late = buildTimelineInterval({
    ...task,
    id: 'late',
    startTime: new Date(2026, 9, 30, 23, 0, 0),
    durationMinutes: 120,
  })!;
  assert.equal(late.continuesPastMidnight, true);
  assert.equal(late.displayEndMinutes, 24 * 60 - 1);
  assert.ok(late.endBadgeLabel.startsWith('Continues'));
  assert.ok(!late.endBadgeLabel.startsWith('Ends '));

  const early = buildTimelineInterval({
    ...task,
    id: 'early',
    startTime: new Date(2026, 9, 30, 22, 30, 0),
    durationMinutes: 60,
  })!;
  const clippedLanes = allocateIntervalLanes([late, early]);
  assert.equal(clippedLanes.find((l) => l.itemId === 'early')!.lane, 0);
  assert.equal(clippedLanes.find((l) => l.itemId === 'late')!.lane, 1);
}

console.log('timelineInterval.test.ts: all assertions passed');
