/**
 * Shared day-overview metric derivation for the Today timeline rings.
 *
 * Scope (selected day only):
 * - Tasks: items returned for that date (timed + untimed), completed = status COMPLETED.
 * - Habits: habits eligible for that date (API date filter / repeat), completed = occurrence flag.
 * - Events: count of events on that date — no completion semantics.
 * - Due: outstanding finance budget reminders for that date — count, not completion.
 */

export type DayMetricKind = 'completion' | 'count';

export type DayMetricModel = {
  id: string;
  label: string;
  kind: DayMetricKind;
  /** Completed count (completion) or primary count (count). */
  value: number;
  /** Eligible total (completion) or same as value for simple counts. */
  total: number;
  color: string;
  onPress?: () => void;
};

export function clampProgress(completed: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(1, Math.max(0, completed / total));
}

export function formatRemainingStatus(completed: number, total: number): string {
  if (total <= 0) return 'None planned';
  const remaining = Math.max(0, total - completed);
  if (remaining === 0) return 'All done';
  return remaining === 1 ? '1 left' : `${remaining} left`;
}

export function formatCountStatus(count: number, emptyLabel: string, nonemptyLabel: (n: number) => string): string {
  if (count <= 0) return emptyLabel;
  return nonemptyLabel(count);
}

export function accessibilityMetricLabel(metric: DayMetricModel): string {
  if (metric.kind === 'completion') {
    const remaining = Math.max(0, metric.total - metric.value);
    if (metric.total <= 0) {
      return `${metric.label}: none planned`;
    }
    if (remaining === 0) {
      return `${metric.label}: ${metric.value} of ${metric.total} completed, all done`;
    }
    return `${metric.label}: ${metric.value} of ${metric.total} completed, ${remaining} remaining`;
  }
  if (metric.total <= 0) {
    return `${metric.label}: none`;
  }
  return `${metric.label}: ${metric.value}`;
}

export function buildTaskHabitMetrics(input: {
  tasks: Array<{ status?: string }>;
  habits: Array<{ completed?: boolean }>;
  entityColors: { tasks: string; habits: string };
}): DayMetricModel[] {
  const taskTotal = input.tasks.length;
  const taskDone = input.tasks.filter((t) => t.status === 'COMPLETED').length;
  const habitTotal = input.habits.length;
  const habitDone = input.habits.filter((h) => !!h.completed).length;

  return [
    {
      id: 'tasks',
      label: 'tasks',
      kind: 'completion',
      value: taskDone,
      total: taskTotal,
      color: input.entityColors.tasks,
    },
    {
      id: 'habits',
      label: 'habits',
      kind: 'completion',
      value: habitDone,
      total: habitTotal,
      color: input.entityColors.habits,
    },
  ];
}

export function buildEventCountMetric(
  events: unknown[],
  color: string,
): DayMetricModel {
  const total = events.length;
  return {
    id: 'events',
    label: 'events',
    kind: 'count',
    value: total,
    total,
    color,
  };
}

/**
 * Finance “due” ring: outstanding budget reminders for the selected day.
 * These are not completable via a checkbox — present as a count of dues.
 */
export function buildDueCountMetric(dueItems: unknown[], color: string): DayMetricModel {
  const total = dueItems.length;
  return {
    id: 'due',
    label: 'due',
    kind: 'count',
    value: total,
    total,
    color,
  };
}
