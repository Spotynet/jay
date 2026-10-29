export type ItemDetailsKind = 'habit' | 'task' | 'event';

/** Route params / payload for timeline item details. */
export type ItemDetailsParams = {
  kind: ItemDetailsKind;
  entityId: string;
  occurrenceDate: string;
  /** Optional project name for tasks (display only until reload). */
  projectName?: string;
  /** Initial completion hint from the agenda card. */
  isCompleted?: boolean;
};

export function headerTitleFor(kind: ItemDetailsKind): string {
  if (kind === 'habit') return 'Habit';
  if (kind === 'task') return 'Task';
  return 'Event';
}

export function categoryLabel(kind: ItemDetailsKind): string {
  if (kind === 'habit') return 'Habit';
  if (kind === 'task') return 'Task';
  return 'Event';
}
