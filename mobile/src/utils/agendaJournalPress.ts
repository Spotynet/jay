import { AgendaItem } from './timelineLayout';
import { resolveAgendaEditorTarget } from './agendaNavigation';

export type AgendaJournalPressDeps = {
  navigateToJournalTab: () => void;
  /** Must never be invoked for Journal items. */
  completeOrUncomplete?: (item: AgendaItem) => void;
};

export type AgendaJournalPressResult = 'navigated-journal' | 'ignored';

/**
 * Journal card press: navigate to the Journal tab only.
 * Does not mutate completion / review state.
 */
export function handleJournalAgendaPress(
  item: AgendaItem,
  deps: AgendaJournalPressDeps,
): AgendaJournalPressResult {
  const target = resolveAgendaEditorTarget(item);
  if (target.kind !== 'journal') return 'ignored';
  deps.navigateToJournalTab();
  return 'navigated-journal';
}
