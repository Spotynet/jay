import { AgendaItem } from './timelineLayout';

/**
 * Types that expose a genuine interactive completion control on timeline cards.
 * Journal completion is derived from the daily review — never toggled from the card.
 */
export function agendaItemSupportsManualCompletion(item: AgendaItem): boolean {
  if (item.type === 'journal' || item.type === 'finance' || item.type === 'event') {
    return false;
  }
  return (item.type === 'task' || item.type === 'habit') && typeof item.onToggle === 'function';
}
