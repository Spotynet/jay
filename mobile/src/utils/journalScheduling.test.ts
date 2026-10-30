/**
 * Run: npx --yes tsx src/utils/journalScheduling.test.ts
 */
import assert from 'node:assert/strict';
import { getJournalTimelineState, JournalSettings } from './journalScheduling';

const scheduledEveryday: JournalSettings = {
  reminder_enabled: true,
  reminder_time: '20:00:00',
  repeat_mode: 'every_day',
  days_of_week: [],
};

const monday = new Date(2026, 9, 26); // local Mon

{
  const state = getJournalTimelineState(monday, scheduledEveryday, { id: 1, date: '2026-10-26' }, false);
  assert.equal(state.shouldAppearInTimeline, true);
  assert.equal(state.entryExists, true);
  assert.equal(state.timelineState, 'placeholder', 'entry alone does not complete');
}

{
  const state = getJournalTimelineState(monday, scheduledEveryday, { id: 1, date: '2026-10-26' }, true);
  assert.equal(state.timelineState, 'completed');
}

{
  const state = getJournalTimelineState(monday, scheduledEveryday, null, true);
  assert.equal(state.entryExists, false);
  assert.equal(state.timelineState, 'completed', 'review can complete without prior id if scores+habits say so');
}

{
  const manual: JournalSettings = {
    ...scheduledEveryday,
    reminder_enabled: false,
  };
  const state = getJournalTimelineState(monday, manual, { id: 1, date: '2026-10-26' }, true);
  assert.equal(state.shouldAppearInTimeline, false);
  assert.equal(state.timelineState, 'none');
}

console.log('journalScheduling.test.ts: all assertions passed');
