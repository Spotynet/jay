/**
 * Focused tests for content-driven timeline grouping.
 * Run: npx --yes tsx src/utils/timelineLayout.test.ts
 */
import assert from 'node:assert/strict';
import {
  AgendaItem,
  buildHourIntervals,
  buildTimelineRows,
  buildTimelineSections,
  countAgendaItemTypes,
  findNowSectionIndex,
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
  // Every o’clock 0–23 plus occupied off-hour boundaries (06:30 here)
  const oclockRows = hourRows.filter(
    (r) => r.kind === 'hour' && r.minutesFromMidnight % 60 === 0,
  );
  assert.equal(oclockRows.length, 24);
  assert.ok(hourRows.some((r) => r.kind === 'hour' && r.timestampLabel === '06:30'));
  assert.ok(hourRows.some((r) => r.kind === 'hour' && r.hour === 9));
  assert.ok(hourRows.some((r) => r.kind === 'hour' && r.hour === 13));

  const lunch = rows.find((r) => r.kind === 'group' && r.hour === 13) as any;
  assert.ok(lunch);
  assert.equal(lunch.items.length, 4);
}

// --- intervals (legacy hour buckets still include off-hour groups) ---
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

// --- exact-minute sections ---
{
  const sections = buildTimelineSections([
    item('creatine', 7, 0, { type: 'habit', title: 'Creatine' }),
    item('gym', 7, 30, { type: 'event', title: 'Gym' }),
  ]);
  const s700 = sections.find((s) => s.hour === 7 && s.minute === 0);
  const s730 = sections.find((s) => s.hour === 7 && s.minute === 30);
  const s800 = sections.find((s) => s.hour === 8 && s.minute === 0);
  assert.ok(s700?.occupied);
  assert.equal(s700?.groups.flatMap((g) => g.items).length, 1);
  assert.equal(s700?.timestampLabel, '07:00');
  assert.ok(s730?.occupied);
  assert.equal(s730?.timestampLabel, '07:30');
  assert.equal(s730?.groups.flatMap((g) => g.items).length, 1);
  assert.equal(s800?.occupied, false);
  assert.equal(s800?.groups.length, 0);
  // Counts stay local to each exact minute (not hour-aggregated)
  assert.deepEqual(countAgendaItemTypes(s700!.groups.flatMap((g) => g.items)), [
    { type: 'habit', count: 1 },
  ]);
  assert.deepEqual(countAgendaItemTypes(s730!.groups.flatMap((g) => g.items)), [
    { type: 'event', count: 1 },
  ]);
  // Empty non-o'clock minutes are not emitted
  assert.equal(
    sections.filter((s) => s.hour === 7 && s.minute !== 0 && s.minute !== 30).length,
    0,
  );

  // Flat row sequence: each occupied minute is its own hour marker + group,
  // not a secondary label nested under 07:00.
  const rows = buildTimelineRows([
    item('creatine', 7, 0, { type: 'habit', title: 'Creatine' }),
    item('gym', 7, 30, { type: 'event', title: 'Gym' }),
  ]);
  const aroundSeven = rows.filter(
    (r) =>
      (r.kind === 'hour' && (r.hour === 7 || r.hour === 8)) ||
      (r.kind === 'group' && (r.hour === 7 || r.hour === 8)),
  );
  assert.deepEqual(
    aroundSeven.map((r) =>
      r.kind === 'hour'
        ? `hour:${r.timestampLabel}`
        : `group:${r.timestampLabel}:${r.items.map((i) => i.title).join(',')}`,
    ),
    [
      'hour:07:00',
      'group:07:00:Creatine',
      'hour:07:30',
      'group:07:30:Gym',
      'hour:08:00',
    ],
  );
}

{
  // Same groupId across different minutes must not collapse into one section
  const sections = buildTimelineSections([
    item('a', 7, 0, { groupId: 'workout' }),
    item('b', 7, 30, { groupId: 'workout' }),
  ]);
  assert.equal(sections.find((s) => s.timestampLabel === '07:00')?.groups.length, 1);
  assert.equal(sections.find((s) => s.timestampLabel === '07:30')?.groups.length, 1);
}

{
  // Seconds are ignored — 07:30:45 belongs to the 07:30 section
  const withSeconds = item('late', 7, 30);
  withSeconds.startTime = (() => {
    const d = at(7, 30);
    d.setSeconds(45);
    return d;
  })();
  const sections = buildTimelineSections([item('on', 7, 30), withSeconds]);
  const s730 = sections.find((s) => s.hour === 7 && s.minute === 30)!;
  assert.equal(s730.groups.flatMap((g) => g.items).length, 2);
  assert.equal(
    sections.filter((s) => s.hour === 7 && s.minute !== 0 && s.minute !== 30).length,
    0,
  );
}

{
  const sections = buildTimelineSections([
    item('a', 7, 30, { type: 'task', title: 'A' }),
    item('b', 7, 34, { type: 'task', title: 'B' }),
    item('c', 7, 34, { type: 'habit', title: 'C' }),
  ]);
  const s700 = sections.find((s) => s.hour === 7 && s.minute === 0)!;
  const s730 = sections.find((s) => s.hour === 7 && s.minute === 30)!;
  const s734 = sections.find((s) => s.hour === 7 && s.minute === 34)!;
  assert.equal(s700.occupied, false);
  assert.ok(s730.occupied);
  assert.equal(s730.groups.flatMap((g) => g.items).length, 1);
  assert.ok(s734.occupied);
  assert.equal(s734.groups.flatMap((g) => g.items).length, 2);
  assert.equal(s734.timestampLabel, '07:34');
  // Counts are local — 07:30 does not include 07:34 items
  assert.deepEqual(
    countAgendaItemTypes(s730.groups.flatMap((g) => g.items)),
    [{ type: 'task', count: 1 }],
  );
  assert.deepEqual(
    countAgendaItemTypes(s734.groups.flatMap((g) => g.items)),
    [
      { type: 'habit', count: 1 },
      { type: 'task', count: 1 },
    ],
  );
}

{
  const sections = buildTimelineSections([
    item('late', 7, 59, { type: 'task' }),
    item('next', 8, 0, { type: 'habit' }),
  ]);
  const labels = sections
    .filter((s) => s.occupied || s.minute === 0)
    .filter((s) => s.hour === 7 || s.hour === 8)
    .map((s) => s.timestampLabel);
  assert.deepEqual(labels, ['07:00', '07:59', '08:00']);
  assert.equal(sections.find((s) => s.timestampLabel === '07:59')?.occupied, true);
  assert.equal(sections.find((s) => s.timestampLabel === '08:00')?.occupied, true);
}

{
  // Moving the last item off a non-o'clock minute drops that section
  const before = buildTimelineSections([item('x', 7, 30)]);
  assert.ok(before.some((s) => s.hour === 7 && s.minute === 30));
  const after = buildTimelineSections([item('x', 7, 34)]);
  assert.equal(
    after.some((s) => s.hour === 7 && s.minute === 30),
    false,
  );
  assert.ok(after.some((s) => s.hour === 7 && s.minute === 34 && s.occupied));
}

{
  const sections = buildTimelineSections([
    item('a', 7, 0),
    item('b', 7, 30),
  ]);
  const now715 = at(7, 15);
  const idx = findNowSectionIndex(sections, now715);
  assert.equal(sections[idx].timestampLabel, '07:00');
  const now745 = at(7, 45);
  assert.equal(sections[findNowSectionIndex(sections, now745)].timestampLabel, '07:30');
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
