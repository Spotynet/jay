/**
 * Pure checks for whether a duration rail/badge can mount from measured Ys.
 * Separates data readiness from React Native view mounting.
 */

import { sectionIdForMinutes, TimelineInterval } from './timelineInterval';

export type DurationRailGeometry = {
  itemId: string;
  startSectionId: string;
  endSectionId: string;
  startY: number;
  endY: number;
  height: number;
  renderable: boolean;
  reason: 'ok' | 'missing-start-y' | 'missing-end-y' | 'non-positive-span';
};

/** Minimum rail height (px) before we skip drawing a degenerate segment. */
export const DURATION_RAIL_MIN_SPAN_PX = 2;

export function resolveDurationRailGeometry(
  interval: Pick<TimelineInterval, 'itemId' | 'displayStartMinutes' | 'displayEndMinutes'>,
  sectionYs: Record<string, number>,
  minSpanPx: number = DURATION_RAIL_MIN_SPAN_PX,
): DurationRailGeometry {
  const startSectionId = sectionIdForMinutes(interval.displayStartMinutes);
  const endSectionId = sectionIdForMinutes(interval.displayEndMinutes);
  const startY = sectionYs[startSectionId];
  const endY = sectionYs[endSectionId];

  if (typeof startY !== 'number' || !Number.isFinite(startY)) {
    return {
      itemId: interval.itemId,
      startSectionId,
      endSectionId,
      startY: Number.NaN,
      endY: typeof endY === 'number' ? endY : Number.NaN,
      height: 0,
      renderable: false,
      reason: 'missing-start-y',
    };
  }
  if (typeof endY !== 'number' || !Number.isFinite(endY)) {
    return {
      itemId: interval.itemId,
      startSectionId,
      endSectionId,
      startY,
      endY: Number.NaN,
      height: 0,
      renderable: false,
      reason: 'missing-end-y',
    };
  }
  const height = endY - startY;
  if (!(height > minSpanPx)) {
    return {
      itemId: interval.itemId,
      startSectionId,
      endSectionId,
      startY,
      endY,
      height,
      renderable: false,
      reason: 'non-positive-span',
    };
  }
  return {
    itemId: interval.itemId,
    startSectionId,
    endSectionId,
    startY,
    endY,
    height,
    renderable: true,
    reason: 'ok',
  };
}

/** Prune section Y map to ids that still exist (keeps onLayout results). */
export function pruneSectionYs(
  prev: Record<string, number>,
  validIds: Iterable<string>,
): Record<string, number> {
  const valid = new Set(validIds);
  let changed = false;
  const next: Record<string, number> = {};
  for (const [id, y] of Object.entries(prev)) {
    if (valid.has(id)) next[id] = y;
    else changed = true;
  }
  return changed ? next : prev;
}
