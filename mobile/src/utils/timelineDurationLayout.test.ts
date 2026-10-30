/**
 * Run: npx --yes tsx src/utils/timelineDurationLayout.test.ts
 */
import assert from 'node:assert/strict';
import {
  allocateStableDurationLanes,
  durationScheduleSignature,
  timedCardContentLeft,
  durationGutterLeft,
  DURATION_GUTTER_WIDTH,
} from './timelineDurationLayout';
import { AgendaItem } from './timelineLayout';

function item(
  id: string,
  hour: number,
  minute: number,
  durationMinutes: number,
  type = 'task',
): AgendaItem {
  return {
    id,
    title: id,
    type,
    timeRange: '',
    isActive: true,
    startTime: new Date(2026, 9, 30, hour, minute, 0),
    durationMinutes,
  };
}

// No permanent gutter — content starts at spine+offset
assert.equal(DURATION_GUTTER_WIDTH, 0);
assert.equal(durationGutterLeft(16, 82), 98);
assert.equal(timedCardContentLeft(16, 82), 98);

{
  const lanes = allocateStableDurationLanes([
    item('a', 12, 0, 60),
    item('b', 12, 30, 60),
    item('c', 13, 0, 30),
  ]);
  const lane = (id: string) => lanes.find((x) => x.itemId === id)!.lane;
  assert.equal(lane('a'), 0);
  assert.equal(lane('b'), 1);
  assert.equal(lane('c'), 0);
}

{
  const base = [item('a', 12, 0, 90), item('b', 12, 45, 45)];
  const sig1 = durationScheduleSignature(base);
  const lanes1 = allocateStableDurationLanes(base);
  const completed = base.map((i) => ({ ...i, isCompleted: true, title: 'renamed' }));
  assert.equal(durationScheduleSignature(completed), sig1);
  assert.deepEqual(
    lanes1.map((l) => [l.itemId, l.lane]),
    allocateStableDurationLanes(completed).map((l) => [l.itemId, l.lane]),
  );
}

console.log('timelineDurationLayout.test.ts: all assertions passed');
