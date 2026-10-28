/**
 * Content-driven daily timeline layout.
 * Empty hours stay compact; populated groups size to their cards.
 * Positions are NOT derived from minutes × pixelsPerMinute.
 */

export type AgendaItemType = 'event' | 'task' | 'habit' | 'journal' | 'finance';

/** Stable display order for hour-header type summaries. */
export const AGENDA_TYPE_ORDER: AgendaItemType[] = [
  'habit',
  'task',
  'event',
  'journal',
  'finance',
];

export const AGENDA_TYPE_LABELS: Record<AgendaItemType, string> = {
  habit: 'habit',
  task: 'task',
  event: 'event',
  journal: 'journal',
  finance: 'finance',
};

export type AgendaTypeCount = {
  type: AgendaItemType | string;
  count: number;
};

export function normalizeAgendaItemType(type: string): AgendaItemType | string {
  const t = (type || '').toLowerCase();
  if ((AGENDA_TYPE_ORDER as string[]).includes(t)) return t as AgendaItemType;
  return t || 'other';
}

/**
 * Count displayed items by canonical `type` for a populated hour header.
 * One visible occurrence → one count. Zero-count types are omitted.
 */
export function countAgendaItemTypes(items: AgendaItem[]): AgendaTypeCount[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = normalizeAgendaItemType(String(item.type));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const result: AgendaTypeCount[] = [];
  for (const type of AGENDA_TYPE_ORDER) {
    const count = counts.get(type);
    if (count && count > 0) {
      result.push({ type, count });
      counts.delete(type);
    }
  }
  // Any unexpected types — keep them so displayed items are never silently omitted.
  for (const [type, count] of counts) {
    if (count > 0) result.push({ type, count });
  }
  return result;
}

export function formatAgendaTypeSummary(counts: AgendaTypeCount[]): string {
  if (counts.length === 0) return '';
  return counts
    .map(({ type, count }) => {
      const base =
        AGENDA_TYPE_LABELS[type as AgendaItemType] ??
        (typeof type === 'string' && type.length ? type : 'item');
      const label = count === 1 ? base : `${base}s`;
      return `${count} ${label}`;
    })
    .join(', ');
}

export interface NutritionTotals {
  calories: number;
  fat: number;
  carbs: number;
  protein: number;
}

export interface AgendaItem {
  id: string;
  title: string;
  type: AgendaItemType | string;
  timeRange: string;
  location?: string;
  projectName?: string;
  isActive: boolean;
  isCompleted?: boolean;
  isOverdue?: boolean;
  onToggle?: () => void;
  onPress?: () => void;
  startTime: Date | null;
  durationMinutes?: number;
  /** Optional group identity — items with the same groupId stay together even across close times. */
  groupId?: string;
  subtitle?: string;
  nutrition?: NutritionTotals;
  badge?: 'neutral' | 'up' | 'check' | null;
  icon?: any;
}

export type TimedAgendaItem = AgendaItem & { startTime: Date };

export type TimelineGroup = {
  id: string;
  kind: 'group';
  /** Minutes from midnight for chronological order */
  minutesFromMidnight: number;
  hour: number;
  minute: number;
  timestampLabel: string;
  items: TimedAgendaItem[];
  nutrition?: NutritionTotals;
  showHourAdd: boolean;
};

export type TimelineHourMarker = {
  id: string;
  kind: 'hour';
  hour: number;
  minutesFromMidnight: number;
  timestampLabel: string;
};

export type TimelineNowMarker = {
  id: 'now';
  kind: 'now';
  minutesFromMidnight: number;
};

export type TimelineRow = TimelineHourMarker | TimelineGroup | TimelineNowMarker;

export function formatHourLabel(hour: number, minute = 0): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function minutesFromMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

function sumNutrition(items: TimedAgendaItem[]): NutritionTotals | undefined {
  const withNutrition = items.filter((i) => i.nutrition);
  if (withNutrition.length === 0) return undefined;
  return withNutrition.reduce(
    (acc, item) => ({
      calories: acc.calories + (item.nutrition?.calories ?? 0),
      fat: acc.fat + (item.nutrition?.fat ?? 0),
      carbs: acc.carbs + (item.nutrition?.carbs ?? 0),
      protein: acc.protein + (item.nutrition?.protein ?? 0),
    }),
    { calories: 0, fat: 0, carbs: 0, protein: 0 },
  );
}

/**
 * Group timed items that share the same timestamp (and optional groupId).
 * Distinct groupIds at the same minute remain separate groups.
 * Never uses title as a unique key.
 */
export function groupTimedItems(items: TimedAgendaItem[]): TimelineGroup[] {
  const sorted = [...items].sort((a, b) => {
    const dm = minutesFromMidnight(a.startTime) - minutesFromMidnight(b.startTime);
    if (dm !== 0) return dm;
    const ga = a.groupId ?? '';
    const gb = b.groupId ?? '';
    if (ga !== gb) return ga.localeCompare(gb);
    return a.id.localeCompare(b.id);
  });

  const groups: TimelineGroup[] = [];
  for (const item of sorted) {
    const mins = minutesFromMidnight(item.startTime);
    const hour = item.startTime.getHours();
    const minute = item.startTime.getMinutes();
    const groupKey = item.groupId ?? `t-${mins}`;
    const last = groups[groups.length - 1];
    const lastKey = last
      ? last.items[0].groupId ?? `t-${last.minutesFromMidnight}`
      : null;

    if (last && last.minutesFromMidnight === mins && lastKey === groupKey) {
      last.items.push(item);
      last.nutrition = sumNutrition(last.items);
      continue;
    }

    groups.push({
      id: `group-${groupKey}-${item.id}`,
      kind: 'group',
      minutesFromMidnight: mins,
      hour,
      minute,
      timestampLabel: formatHourLabel(hour, minute),
      items: [item],
      nutrition: sumNutrition([item]),
      showHourAdd: false,
    });
  }
  return groups;
}

export type TimelineHourInterval = {
  id: string;
  kind: 'interval';
  hour: number;
  minutesFromMidnight: number;
  timestampLabel: string;
  groups: TimelineGroup[];
};

/**
 * Build hour intervals. Every hour gets the same start-boundary marker;
 * groups live inside the interval body (never replace the marker).
 */
export function buildHourIntervals(
  items: AgendaItem[],
  options: { dayStartHour?: number; dayEndHour?: number } = {},
): TimelineHourInterval[] {
  const dayStart = options.dayStartHour ?? 0;
  const dayEnd = options.dayEndHour ?? 23;
  const timed = items.filter((i): i is TimedAgendaItem => i.startTime != null);
  const groups = groupTimedItems(timed);

  const groupsByHour = new Map<number, TimelineGroup[]>();
  groups.forEach((g) => {
    const list = groupsByHour.get(g.hour) ?? [];
    list.push(g);
    groupsByHour.set(g.hour, list);
  });

  const intervals: TimelineHourInterval[] = [];
  for (let hour = dayStart; hour <= dayEnd; hour++) {
    intervals.push({
      id: `interval-${hour}`,
      kind: 'interval',
      hour,
      minutesFromMidnight: hour * 60,
      timestampLabel: formatHourLabel(hour),
      groups: groupsByHour.get(hour) ?? [],
    });
  }
  return intervals;
}

/**
 * Flat chronological sequence: hour boundary, then groups in that hour.
 * Hour markers are ALWAYS emitted (populated hours do not replace them).
 */
export function buildTimelineRows(
  items: AgendaItem[],
  options: { now?: Date | null; dayStartHour?: number; dayEndHour?: number } = {},
): TimelineRow[] {
  const intervals = buildHourIntervals(items, options);
  const rows: TimelineRow[] = [];

  for (const interval of intervals) {
    rows.push({
      id: `hour-${interval.hour}`,
      kind: 'hour',
      hour: interval.hour,
      minutesFromMidnight: interval.minutesFromMidnight,
      timestampLabel: interval.timestampLabel,
    });
    for (const group of interval.groups) {
      rows.push({
        ...group,
        showHourAdd: false,
      });
    }
  }

  if (options.now) {
    const dayStart = options.dayStartHour ?? 0;
    const dayEnd = options.dayEndHour ?? 23;
    const nowMins = minutesFromMidnight(options.now);
    const nowHour = options.now.getHours();
    if (nowHour >= dayStart && nowHour <= dayEnd) {
      const insertAt = rows.findIndex((row) => row.minutesFromMidnight > nowMins);
      const nowRow: TimelineNowMarker = {
        id: 'now',
        kind: 'now',
        minutesFromMidnight: nowMins,
      };
      if (insertAt === -1) rows.push(nowRow);
      else rows.splice(insertAt, 0, nowRow);
    }
  }

  return rows;
}

/** Compact height invariant helpers for tests / docs */
export function isCompactRow(row: TimelineRow): boolean {
  return row.kind === 'hour' || row.kind === 'now';
}

export function isPopulatedRow(row: TimelineRow): boolean {
  return row.kind === 'group';
}
