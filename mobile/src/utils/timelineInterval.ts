/**
 * Timed timeline interval normalization for duration rails / end badges.
 *
 * Layout note: TimelineAgenda is content-stacked (not minutes×px). Rails are
 * anchored to measured exact-minute sections so start/end labels stay truthful;
 * vertical span follows section stack distance, not a fixed px/minute scale.
 */

import {
  AgendaItem,
  TimedAgendaItem,
  formatHourLabel,
  minutesFromMidnight,
} from './timelineLayout';

export type TimelineInterval = {
  itemId: string;
  type: string;
  startMinutes: number;
  endMinutes: number;
  durationMinutes: number;
  /** Clipped to displayed local day [0, 1440). */
  displayStartMinutes: number;
  displayEndMinutes: number;
  continuesPastMidnight: boolean;
  startLabel: string;
  endLabel: string;
  durationLabel: string;
  rangeSubtitle: string;
  endBadgeLabel: string;
};

const DAY_MINUTES = 24 * 60;

export function formatClockFromMinutes(mins: number): string {
  const wrapped = ((Math.floor(mins) % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;
  const hour = Math.floor(wrapped / 60);
  const minute = wrapped % 60;
  return formatHourLabel(hour, minute);
}

export function formatDurationMinutes(minutes: number): string | null {
  if (!Number.isFinite(minutes) || minutes <= 0) return null;
  const total = Math.round(minutes);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return h === 1 ? '1h' : `${h}h`;
  return `${m}m`;
}

/** Parse API DurationField strings (`HH:MM:SS` / `HH:MM`) to whole minutes. */
export function parseDurationToMinutes(value: string | null | undefined): number | undefined {
  if (!value) return undefined;
  const parts = String(value).split(':');
  if (parts.length < 2) return undefined;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return undefined;
  const total = hours * 60 + minutes;
  return total > 0 ? total : undefined;
}

export function isTimedDurationEligible(item: AgendaItem): item is TimedAgendaItem & {
  durationMinutes: number;
} {
  if (item.startTime == null) return false;
  const d = item.durationMinutes;
  return typeof d === 'number' && Number.isFinite(d) && d > 0;
}

export function buildTimelineInterval(item: AgendaItem): TimelineInterval | null {
  if (!isTimedDurationEligible(item)) return null;
  const startMinutes = minutesFromMidnight(item.startTime);
  const durationMinutes = Math.round(item.durationMinutes);
  const endMinutes = startMinutes + durationMinutes;
  const continuesPastMidnight = endMinutes > DAY_MINUTES;
  const displayStartMinutes = startMinutes;
  const displayEndMinutes = Math.min(endMinutes, DAY_MINUTES);
  // Endpoint exclusive of 24:00 → show at 23:59 section if needed for badge anchor.
  const badgeEndMinutes =
    displayEndMinutes >= DAY_MINUTES ? DAY_MINUTES - 1 : displayEndMinutes;

  const startLabel = formatClockFromMinutes(startMinutes);
  const endLabel = formatClockFromMinutes(endMinutes);
  const durationLabel = formatDurationMinutes(durationMinutes) ?? '';
  const rangeSubtitle = `${startLabel}–${endLabel} · ${durationLabel}`;
  const endBadgeLabel = continuesPastMidnight
    ? `Continues · ends ${endLabel}`
    : `Ends ${formatClockFromMinutes(badgeEndMinutes)}`;

  return {
    itemId: item.id,
    type: String(item.type),
    startMinutes,
    endMinutes,
    durationMinutes,
    displayStartMinutes,
    displayEndMinutes: badgeEndMinutes,
    continuesPastMidnight,
    startLabel,
    endLabel,
    durationLabel,
    rangeSubtitle,
    endBadgeLabel,
  };
}

export function collectTimelineIntervals(items: AgendaItem[]): TimelineInterval[] {
  const out: TimelineInterval[] = [];
  for (const item of items) {
    const iv = buildTimelineInterval(item);
    if (iv) out.push(iv);
  }
  return out;
}

/** Exact minutes that need section anchors for end badges (within the local day). */
export function collectEndpointMinutes(intervals: TimelineInterval[]): number[] {
  const set = new Set<number>();
  for (const iv of intervals) {
    if (iv.displayEndMinutes > iv.displayStartMinutes) {
      set.add(iv.displayEndMinutes);
    }
  }
  return [...set].sort((a, b) => a - b);
}

/**
 * Assign rail lanes for overlapping intervals as half-open [start, end).
 * Sort by start, then end, then itemId. Reuse the lowest free lane.
 */
export function allocateIntervalLanes(
  intervals: TimelineInterval[],
): Array<TimelineInterval & { lane: number }> {
  const sorted = [...intervals].sort((a, b) => {
    if (a.displayStartMinutes !== b.displayStartMinutes) {
      return a.displayStartMinutes - b.displayStartMinutes;
    }
    if (a.displayEndMinutes !== b.displayEndMinutes) {
      return a.displayEndMinutes - b.displayEndMinutes;
    }
    return a.itemId.localeCompare(b.itemId);
  });

  const laneEnds: number[] = [];
  return sorted.map((iv) => {
    let lane = laneEnds.findIndex((end) => end <= iv.displayStartMinutes);
    if (lane < 0) {
      lane = laneEnds.length;
      laneEnds.push(iv.displayEndMinutes);
    } else {
      laneEnds[lane] = iv.displayEndMinutes;
    }
    return { ...iv, lane };
  });
}

export function sectionIdForMinutes(mins: number): string {
  const hour = Math.floor(mins / 60);
  const minute = mins % 60;
  return `section-${hour}-${minute}`;
}
