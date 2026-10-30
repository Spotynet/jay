/**
 * Run: npx --yes tsx src/utils/agendaJournalPress.test.ts
 */
import assert from 'node:assert/strict';
import { handleJournalAgendaPress } from './agendaJournalPress';
import { agendaItemSupportsManualCompletion } from './agendaCompletionCapability';
import { AgendaItem } from './timelineLayout';

function journal(partial: Partial<AgendaItem> = {}): AgendaItem {
  return {
    id: 'journal',
    title: 'Journal Completed',
    type: 'journal',
    timeRange: '20:00',
    isActive: false,
    isCompleted: true,
    badge: 'check',
    startTime: new Date('2026-10-30T20:00:00'),
    ...partial,
  };
}

{
  let navigated = false;
  let toggled = false;
  const result = handleJournalAgendaPress(journal(), {
    navigateToJournalTab: () => {
      navigated = true;
    },
    completeOrUncomplete: () => {
      toggled = true;
    },
  });
  assert.equal(result, 'navigated-journal');
  assert.equal(navigated, true);
  assert.equal(toggled, false, 'Journal press must never call completion mutation');
}

{
  // Even if a stale onToggle sneaks onto the item, capability must stay false.
  const item = journal({
    onToggle: () => {
      throw new Error('journal onToggle must not run');
    },
  });
  assert.equal(agendaItemSupportsManualCompletion(item), false);
}

{
  assert.equal(
    agendaItemSupportsManualCompletion({
      id: 'h-1',
      title: 'Gym',
      type: 'habit',
      timeRange: '',
      isActive: true,
      startTime: null,
      onToggle: () => undefined,
    }),
    true,
  );
  assert.equal(
    agendaItemSupportsManualCompletion({
      id: 't-1',
      title: 'Task',
      type: 'task',
      timeRange: '',
      isActive: true,
      startTime: null,
      onToggle: () => undefined,
    }),
    true,
  );
}

{
  const habitNamedJournal: AgendaItem = {
    id: 'h-9',
    title: 'Journal',
    type: 'habit',
    timeRange: '',
    isActive: true,
    startTime: null,
    onToggle: () => undefined,
  };
  assert.equal(handleJournalAgendaPress(habitNamedJournal, {
    navigateToJournalTab: () => {
      throw new Error('must not navigate for habit');
    },
  }), 'ignored');
  assert.equal(agendaItemSupportsManualCompletion(habitNamedJournal), true);
}

console.log('agendaJournalPress.test.ts: all assertions passed');
