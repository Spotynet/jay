import { AgendaItem } from './timelineLayout';

/** Extract the entity id from agenda ids like `h-12`, `t-3`, `e-9`. */
export function parseAgendaEntityId(agendaId: string): string | null {
  if (!agendaId) return null;
  const idx = agendaId.indexOf('-');
  if (idx < 0 || idx === agendaId.length - 1) return null;
  return agendaId.slice(idx + 1);
}

export type AgendaEditorTarget =
  /** Journal opens the Journal tab — not ItemDetails / JournalEntry. */
  | { kind: 'journal' }
  | { kind: 'habit'; entityId: string }
  | { kind: 'task'; entityId: string }
  | { kind: 'event'; entityId: string }
  | { kind: 'unsupported'; type: string };

/**
 * Map a timeline AgendaItem to a details/editor target.
 * Finance budget reminders have no details surface today.
 * Journal is identified by typed `item.type === 'journal'`.
 */
export function resolveAgendaEditorTarget(item: AgendaItem): AgendaEditorTarget {
  if (item.type === 'journal') {
    return { kind: 'journal' };
  }

  const entityId = parseAgendaEntityId(item.id);
  if (!entityId) return { kind: 'unsupported', type: String(item.type) };

  if (item.type === 'habit') return { kind: 'habit', entityId };
  if (item.type === 'task') return { kind: 'task', entityId };
  if (item.type === 'event') return { kind: 'event', entityId };

  return { kind: 'unsupported', type: String(item.type) };
}
