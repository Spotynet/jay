/** Minimum non-shrinking item width (ring + label breathing room). */
export const DAY_METRIC_ITEM_WIDTH = 72;
/** Gap between items in overflow (scroll) mode only. */
export const DAY_METRIC_ITEM_GAP = 14;
/** Avoid fit/overflow flicker when width sits on the boundary. */
export const DAY_METRIC_FIT_HYSTERESIS = 8;

/** Minimum width needed to place `count` ring items without compressing. */
export function ringsRequiredWidth(
  count: number,
  itemWidth = DAY_METRIC_ITEM_WIDTH,
  gap = DAY_METRIC_ITEM_GAP,
): number {
  if (count <= 0) return 0;
  return count * itemWidth + Math.max(0, count - 1) * gap;
}

/**
 * Decide fit vs overflow with light hysteresis so measurement feedback
 * does not flip modes every frame at the boundary.
 */
export function ringsShouldFit(
  availableWidth: number,
  count: number,
  currentlyFits: boolean,
  itemWidth = DAY_METRIC_ITEM_WIDTH,
  gap = DAY_METRIC_ITEM_GAP,
): boolean {
  if (availableWidth <= 0 || count <= 0) return false;
  const required = ringsRequiredWidth(count, itemWidth, gap);
  if (currentlyFits) {
    return availableWidth >= required;
  }
  return availableWidth >= required + DAY_METRIC_FIT_HYSTERESIS;
}
