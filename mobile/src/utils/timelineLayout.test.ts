/**
 * Focused tests for content-driven timeline grouping.
 * Run: npx --yes tsx src/utils/timelineLayout.test.ts
 */
import assert from 'node:assert/strict';
import {
  AgendaItem,
  buildHourIntervals,
  buildTimelineRows,
  countAgendaItemTypes,
  formatAgendaTypeSummary,
  groupTimedItems,
} from './timelineLayout';
import { buildReferenceTimelineFixtures } from './timelineFixtures';

function at(h: number, m: number): Date {
  const d = new Date(2026, 0, 15);
  d.setHours(h, m, 0, 0);
  return d;
}

function item(
  id: string,
  hour: number,
  minute: number,
  extras: Partial<AgendaItem> = {},
): AgendaItem {
  return {
    id,
    title: extras.title ?? id,
    type: 'event',
    timeRange: `${hour}:${minute}`,
    startTime: at(hour, minute),
    isActive: true,
    ...extras,
  };
}

// --- grouping ---
{
  const groups = groupTimedItems([
    item('a', 13, 0, { groupId: 'lunch', title: 'Tilapia Fillets' }),
    item('b', 13, 0, { groupId: 'lunch', title: 'Tilapia Fillets' }),
    item('c', 13, 0, { groupId: 'lunch', title: 'Sweet Potato' }),
  ] as any);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].items.length, 3);
  assert.notEqual(groups[0].items[0].id, groups[0].items[1].id);
}

{
  const groups = groupTimedItems([
    item('x', 9, 0, { groupId: 'meal-a' }),
    item('y', 9, 0, { groupId: 'meal-b' }),
  ] as any);
  assert.equal(groups.length, 2);
}

{
  const groups = groupTimedItems([
    item('s', 6, 30, { groupId: 'sleep' }),
    item('b', 9, 0, { groupId: 'breakfast' }),
  ] as any);
  assert.equal(groups.length, 2);
  assert.equal(groups[0].minute, 30);
}

// --- hour boundaries always present ---
{
  const rows = buildTimelineRows([
    item('sleep', 6, 30, { groupId: 'sleep' }),
    item('bf1', 9, 0, { groupId: 'bf' }),
    item('bf2', 9, 0, { groupId: 'bf' }),
    item('l1', 13, 0, { groupId: 'lunch' }),
    item('l2', 13, 0, { groupId: 'lunch' }),
    item('l3', 13, 0, { groupId: 'lunch' }),
    item('l4', 13, 0, { groupId: 'lunch' }),
  ]);

  const hourRows = rows.filter((r) => r.kind === 'hour');
  // Every hour 0–23 has a boundary, including populated ones
  assert.equal(hourRows.length, 24);
  assert.ok(hourRows.some((r) => r.kind === 'hour' && r.hour === 6));
  assert.ok(hourRows.some((r) => r.kind === 'hour' && r.hour === 9));
  assert.ok(hourRows.some((r) => r.kind === 'hour' && r.hour === 13));

  const lunch = rows.find((r) => r.kind === 'group' && r.hour === 13) as any;
  assert.ok(lunch);
  assert.equal(lunch.items.length, 4);
}

// --- intervals ---
{
  const intervals = buildHourIntervals([
    item('gym', 7, 0, { groupId: 'gym' }),
    item('sleep', 6, 30, { groupId: 'sleep' }),
  ]);
  assert.equal(intervals.length, 24);
  assert.equal(intervals[6].groups.length, 1);
  assert.equal(intervals[6].groups[0].minute, 30);
  assert.equal(intervals[7].groups.length, 1);
  assert.equal(intervals[7].groups[0].items[0].title, 'gym');
  assert.equal(intervals[8].groups.length, 0);
}

// --- fixtures ---
{
  const fixtures = buildReferenceTimelineFixtures(at(0, 0));
  const rows = buildTimelineRows(fixtures);
  const groups = rows.filter((r) => r.kind === 'group');
  assert.equal(groups.length, 4);
  const lunch = groups.find((g) => g.kind === 'group' && g.hour === 13) as any;
  assert.equal(lunch.items.length, 4);
  const tilapia = lunch.items.filter((i: any) => i.title === 'Tilapia Fillets');
  assert.equal(tilapia.length, 2);
  assert.notEqual(tilapia[0].id, tilapia[1].id);
}

// --- hour type summary counts ---
{
  const counts = countAgendaItemTypes([
    item('h1', 7, 0, { type: 'habit' }),
    item('h2', 7, 0, { type: 'habit', isCompleted: true }),
    item('t1', 7, 5, { type: 'task' }),
  ]);
  assert.deepEqual(counts, [
    { type: 'habit', count: 2 },
    { type: 'task', count: 1 },
  ]);
  assert.equal(formatAgendaTypeSummary(counts), '2 habits, 1 task');
}

{
  const counts = countAgendaItemTypes([
    item('e1', 9, 0, { type: 'event' }),
    item('t1', 9, 0, { type: 'task' }),
    item('t2', 9, 15, { type: 'task' }),
    item('h1', 9, 30, { type: 'habit' }),
    item('j1', 9, 45, { type: 'journal' }),
  ]);
  assert.deepEqual(
    counts.map((c) => c.type),
    ['habit', 'task', 'event', 'journal'],
  );
  assert.equal(counts.find((c) => c.type === 'task')?.count, 2);
  assert.equal(formatAgendaTypeSummary(counts), '1 habit, 2 tasks, 1 event, 1 journal');
}

{
  const counts = countAgendaItemTypes([
    item('x1', 10, 0, { type: 'custom-widget' as any }),
    item('h1', 10, 0, { type: 'habit' }),
  ]);
  assert.equal(counts[0].type, 'habit');
  assert.equal(counts[1].type, 'custom-widget');
  assert.equal(counts[1].count, 1);
}

{
  assert.deepEqual(countAgendaItemTypes([]), []);
  assert.equal(formatAgendaTypeSummary([]), '');
}

console.log('timelineLayout.test.ts: all assertions passed');
