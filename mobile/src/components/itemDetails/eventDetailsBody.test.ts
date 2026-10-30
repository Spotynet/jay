/**
 * Run: npx --yes tsx src/components/itemDetails/eventDetailsBody.test.ts
 *
 * Pure projection tests for Event Details content rules (no RN render).
 */
import assert from 'node:assert/strict';
import {
  buildEventScheduleDisplay,
  nonemptyText,
} from '../../utils/itemDetailsFormat';

function eventDetailsProjection(event: {
  name?: string;
  date?: string | null;
  start_time?: string | null;
  duration?: string | null;
  location?: string | null;
  description?: string | null;
}) {
  const schedule = buildEventScheduleDisplay(event);
  const scheduleRows: { label: string; value: string }[] = [];
  if (schedule.dateLabel) scheduleRows.push({ label: 'Date', value: schedule.dateLabel });
  if (schedule.startLabel) scheduleRows.push({ label: 'Start', value: schedule.startLabel });
  if (schedule.endLabel) scheduleRows.push({ label: 'End', value: schedule.endLabel });
  if (schedule.durationLabel) {
    scheduleRows.push({ label: 'Duration', value: schedule.durationLabel });
  }
  return {
    title: event.name?.trim() || 'Item',
    scheduleRows,
    location: nonemptyText(event.location),
    notes: nonemptyText(event.description),
  };
}

{
  const view = eventDetailsProjection({
    name: 'Yellow event',
    date: '2026-10-30',
    start_time: '17:00:00',
    duration: '02:30:00',
    location: '',
    description: '  ',
  });
  assert.equal(view.title, 'Yellow event');
  assert.deepEqual(
    view.scheduleRows.map((r) => r.label),
    ['Date', 'Start', 'End', 'Duration'],
  );
  assert.equal(view.location, null);
  assert.equal(view.notes, null);
}

{
  const view = eventDetailsProjection({
    name: 'Meetup',
    date: '2026-10-30',
    start_time: '18:00:00',
    duration: '01:00:00',
    location: '  Library hall  ',
    description: 'Bring slides.\nArrive early.',
  });
  assert.equal(view.location, 'Library hall');
  assert.equal(view.notes, 'Bring slides.\nArrive early.');
}

{
  const view = eventDetailsProjection({
    name: 'Late',
    date: '2026-10-30',
    start_time: '23:30:00',
    duration: '01:00:00',
  });
  const end = view.scheduleRows.find((r) => r.label === 'End');
  assert.ok(end);
  assert.ok(end!.value.includes('·') || /31|Oct/.test(end!.value));
}

{
  const view = eventDetailsProjection({
    name: '',
    date: null,
    start_time: null,
    duration: null,
  });
  assert.equal(view.title, 'Item');
  assert.equal(view.scheduleRows.length, 0);
}

console.log('eventDetailsBody.test.ts: all assertions passed');
