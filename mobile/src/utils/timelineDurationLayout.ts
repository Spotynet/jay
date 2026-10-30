/**
 * Legacy duration-lane helpers — preferred path is timelineConnectedDuration.
 * Kept for schedule signature / interval lane reuse in older tests.
 */

import {
  allocateIntervalLanes,
  collectTimelineIntervals,
} from './timelineInterval';
import { AgendaItem } from './timelineLayout';
import { TIMELINE_TOKENS } from './timelineTokens';

export const DURATION_MAX_VISIBLE_LANES = TIMELINE_TOKENS.durationMaxVisibleLanes;
export const DURATION_LANE_GAP = TIMELINE_TOKENS.durationLaneGap;
export const DURATION_RAIL_WIDTH = TIMELINE_TOKENS.durationRailWidth;
/** @deprecated Permanent gutter removed — always 0. */
export const DURATION_GUTTER_WIDTH = 0;

export type LanedInterval = ReturnType<typeof allocateIntervalLanes>[number];

export function allocateStableDurationLanes(items: AgendaItem[]) {
  return allocateIntervalLanes(collectTimelineIntervals(items));
}

export function durationScheduleSignature(items: AgendaItem[]): string {
  return collectTimelineIntervals(items)
    .map((iv) => `${iv.itemId}:${iv.displayStartMinutes}-${iv.displayEndMinutes}`)
    .sort()
    .join('|');
}

/** @deprecated No permanent gutter. */
export function durationGutterLeft(pageInset: number, contentOffsetX: number): number {
  return pageInset + contentOffsetX;
}

/** @deprecated Cards start at content left (no gutter). */
export function timedCardContentLeft(
  pageInset: number,
  contentOffsetX: number,
  _gutterWidth: number = 0,
): number {
  return pageInset + contentOffsetX;
}
