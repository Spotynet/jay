/**
 * Card-connected duration layout: rails descend from icon centers;
 * intervening cards indent past active lines; full-width end cards
 * receive the rail at their top edge (no elbow).
 */

import {
  TimelineInterval,
  buildTimelineInterval,
  collectTimelineIntervals,
  sectionIdForMinutes,
} from './timelineInterval';
import { AgendaItem, minutesFromMidnight } from './timelineLayout';
import { TIMELINE_TOKENS } from './timelineTokens';

/** Measured in-flow END card bounds key (must match TimelineDurationEndCard). */
export function durationEndBoundsKey(itemId: string): string {
  return `end:${itemId}`;
}

export const CONNECTED_RAIL_WIDTH = TIMELINE_TOKENS.durationRailWidth;
export const CONNECTED_RAIL_CLEARANCE = TIMELINE_TOKENS.durationRailClearance;
export const CONNECTED_MIN_RAIL_SPAN = TIMELINE_TOKENS.durationMinRailSpan;
export const CONNECTED_MIN_CARD_WIDTH = TIMELINE_TOKENS.durationMinCardWidth;
export const CONNECTED_END_CARD_HEIGHT = TIMELINE_TOKENS.durationEndCardHeight;

/** Opaque card surface in timeline-body coordinates (no margins/headings). */
export type CardBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/** Placed end card — rail enters top edge at endY; body extends below. */
export type ConnectedEndCard = {
  itemId: string;
  type: string;
  title: string;
  /** Clock label for the true end (e.g. "14:20"), not "Ends …". */
  endTimeLabel: string;
  /** True scheduled end Y — top edge of the end card. */
  topY: number;
  left: number;
  width: number;
  height: number;
  /** Own rail X must lie within [left, left+width]. */
  railX: number;
  overflow: boolean;
  isCompleted: boolean;
};

export type ConnectedRail = {
  itemId: string;
  type: string;
  railX: number;
  startY: number;
  /** Meets end-card top (or day clip if no end card). */
  endY: number;
  title: string;
  endCard: ConnectedEndCard | null;
  /** Cross-midnight clip — rail only, no END card. */
  continuesPastMidnight: boolean;
};

export type ConnectedCardPlacement = {
  itemId: string;
  indent: number;
  cardLeft: number;
  iconCenterX: number;
  cardTopY: number;
  cardBottomY: number;
  hasExternalRail: boolean;
  overflow: boolean;
};

export type ConnectedOverflowGroup = {
  key: string;
  memberIds: string[];
  count: number;
  displayStartMinutes: number;
  displayEndMinutes: number;
};

export type ConnectedDurationLayout = {
  placements: ConnectedCardPlacement[];
  placementById: Map<string, ConnectedCardPlacement>;
  rails: ConnectedRail[];
  overflowGroups: ConnectedOverflowGroup[];
};

export type ConnectedLayoutInput = {
  items: AgendaItem[];
  sectionYs: Record<string, number>;
  cardBounds: Record<string, CardBounds>;
  contentLeft: number;
  contentRight: number;
  iconCenterOffset: number;
  estimatedCardHeight: number;
  sectionCardTopOffset: number;
  railWidth?: number;
  clearance?: number;
  minRailSpan?: number;
  minCardWidth?: number;
  endCardHeight?: number;
};

type ActiveLine = {
  itemId: string;
  railX: number;
  startY: number;
  endY: number;
  endBlockLeft: number;
  endBlockRight: number;
  endBlockTop: number;
  endBlockBottom: number;
};

function sortTimedItems(items: AgendaItem[]): AgendaItem[] {
  return [...items].sort((a, b) => {
    const am = a.startTime ? minutesFromMidnight(a.startTime) : 0;
    const bm = b.startTime ? minutesFromMidnight(b.startTime) : 0;
    if (am !== bm) return am - bm;
    return a.id.localeCompare(b.id);
  });
}

function verticalOverlap(a0: number, a1: number, b0: number, b1: number): boolean {
  return a0 < b1 && a1 > b0;
}

/**
 * Place a full-width end card. Surviving unrelated rails pass BEHIND the
 * opaque surface — they must not compress the card to icon-only width.
 */
export function placeConnectedEndCard(args: {
  itemId: string;
  ownRailX: number;
  endY: number;
  contentLeft: number;
  contentRight: number;
  /** @deprecated Ignored — end cards no longer clear surviving rails. */
  activeLines?: ReadonlyArray<Pick<ActiveLine, 'itemId' | 'railX' | 'startY' | 'endY'>>;
  railWidth?: number;
  clearance?: number;
  minCardWidth?: number;
  endCardHeight: number;
  type: string;
  title: string;
  endTimeLabel: string;
  isCompleted: boolean;
}): ConnectedEndCard {
  const {
    itemId,
    ownRailX,
    endY,
    contentLeft,
    contentRight,
    endCardHeight,
    type,
    title,
    endTimeLabel,
    isCompleted,
  } = args;

  const width = Math.max(0, contentRight - contentLeft);
  return {
    itemId,
    type,
    title,
    endTimeLabel,
    topY: endY,
    left: contentLeft,
    width,
    height: endCardHeight,
    railX: ownRailX,
    overflow: false,
    isCompleted,
  };
}

/** Opaque card surface used to punch rail holes (surface only — not block chrome). */
export type RailOccluder = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

export type RailSegment = { top: number; height: number };

/** Tiny seam bias (px) — not a substitute for real surface bounds. */
export const RAIL_OCCLUSION_SEAM_PX = 0.5;

export function railHorizontallyIntersects(
  railLeft: number,
  railRight: number,
  occluder: Pick<RailOccluder, 'left' | 'right'>,
): boolean {
  return railLeft < occluder.right && railRight > occluder.left;
}

/**
 * Split a vertical rail into visible segments behind intersecting opaque card
 * surfaces only. Own terminus is endY (not punched as an occluder).
 */
export function visibleRailSegments(
  startY: number,
  endY: number,
  occluders: readonly RailOccluder[],
  railLeft: number,
  railRight: number,
): RailSegment[] {
  if (!(endY > startY + 1)) return [];
  const seam = RAIL_OCCLUSION_SEAM_PX;
  const merged = mergeOcclusionRanges(
    occluders
      .filter((o) => railHorizontallyIntersects(railLeft, railRight, o))
      .map((o) => ({
        top: Math.max(startY, o.top),
        bottom: Math.min(endY, o.bottom),
      }))
      .filter((o) => o.bottom > o.top + seam),
  );

  const segments: RailSegment[] = [];
  let cursor = startY;
  for (const hole of merged) {
    if (hole.top > cursor + seam) {
      segments.push({ top: cursor, height: hole.top - cursor });
    }
    cursor = Math.max(cursor, hole.bottom);
  }
  if (endY > cursor + seam) {
    segments.push({ top: cursor, height: endY - cursor });
  }
  return segments;
}

function mergeOcclusionRanges(
  ranges: Array<{ top: number; bottom: number }>,
): Array<{ top: number; bottom: number }> {
  if (ranges.length === 0) return [];
  const sorted = [...ranges].sort((a, b) => a.top - b.top);
  const out: Array<{ top: number; bottom: number }> = [{ ...sorted[0] }];
  for (let i = 1; i < sorted.length; i++) {
    const last = out[out.length - 1];
    const cur = sorted[i];
    if (cur.top <= last.bottom + 0.5) {
      last.bottom = Math.max(last.bottom, cur.bottom);
    } else {
      out.push({ ...cur });
    }
  }
  return out;
}

/**
 * Place timed cards with indent past active duration lines; emit connected rails
 * and full-width end cards (rail enters top edge).
 */
export function buildConnectedDurationLayout(
  input: ConnectedLayoutInput,
): ConnectedDurationLayout {
  const railWidth = input.railWidth ?? CONNECTED_RAIL_WIDTH;
  const clearance = input.clearance ?? CONNECTED_RAIL_CLEARANCE;
  const minRailSpan = input.minRailSpan ?? CONNECTED_MIN_RAIL_SPAN;
  const minCardWidth = input.minCardWidth ?? CONNECTED_MIN_CARD_WIDTH;
  const endCardHeight = input.endCardHeight ?? CONNECTED_END_CARD_HEIGHT;

  const timed = sortTimedItems(input.items.filter((i) => i.startTime != null));
  const intervalsById = new Map(
    collectTimelineIntervals(timed).map((iv) => [iv.itemId, iv]),
  );

  // Pass 1: place start cards + provisional rails (end cards deferred so
  // later-overlapping rails can constrain end-card width).
  const activeLinesPass1: ActiveLine[] = [];
  const placements: ConnectedCardPlacement[] = [];
  const provisionalRails: Array<{
    item: AgendaItem;
    interval: TimelineInterval;
    railX: number;
    startY: number;
    endY: number;
  }> = [];
  const overflowMembers: AgendaItem[] = [];

  for (const item of timed) {
    const startMins = minutesFromMidnight(item.startTime!);
    const startSectionId = sectionIdForMinutes(startMins);
    const sectionY = input.sectionYs[startSectionId];
    const measured = input.cardBounds[item.id];

    let cardTopY: number;
    let cardBottomY: number;
    if (measured && measured.height > 0) {
      cardTopY = measured.y;
      cardBottomY = measured.y + measured.height;
    } else if (typeof sectionY === 'number') {
      cardTopY = sectionY + input.sectionCardTopOffset;
      cardBottomY = cardTopY + input.estimatedCardHeight;
    } else {
      cardTopY = 0;
      cardBottomY = input.estimatedCardHeight;
    }

    let rightmostObstruction = input.contentLeft - clearance;
    for (const line of activeLinesPass1) {
      const hitsRail = verticalOverlap(cardTopY, cardBottomY, line.startY, line.endY);
      const hitsEnd = verticalOverlap(
        cardTopY,
        cardBottomY,
        line.endBlockTop,
        line.endBlockBottom,
      );
      if (hitsRail) {
        rightmostObstruction = Math.max(
          rightmostObstruction,
          line.railX + railWidth / 2,
        );
      }
      if (hitsEnd) {
        rightmostObstruction = Math.max(rightmostObstruction, line.endBlockRight);
      }
    }

    let cardLeft = input.contentLeft;
    if (rightmostObstruction >= input.contentLeft - clearance + 0.5) {
      cardLeft = rightmostObstruction + clearance;
    }

    const available = input.contentRight - cardLeft;
    let overflow = false;
    if (available < minCardWidth) {
      cardLeft = Math.max(input.contentLeft, input.contentRight - minCardWidth);
      overflow = true;
      overflowMembers.push(item);
    }

    const indent = Math.max(0, cardLeft - input.contentLeft);
    const iconCenterX = cardLeft + input.iconCenterOffset;

    const interval = intervalsById.get(item.id) ?? buildTimelineInterval(item);
    let hasExternalRail = false;
    let endY = Number.NaN;

    if (interval && !overflow) {
      const endSectionId = sectionIdForMinutes(interval.displayEndMinutes);
      const sectionEndY = input.sectionYs[endSectionId];
      const measuredEnd = input.cardBounds[durationEndBoundsKey(item.id)];
      // Visual rail target = in-flow END card top when measured; else section
      // heading + normal card offset (same map as ordinary cards).
      if (measuredEnd && measuredEnd.height > 0) {
        endY = measuredEnd.y;
      } else if (typeof sectionEndY === 'number' && Number.isFinite(sectionEndY)) {
        endY = sectionEndY + input.sectionCardTopOffset;
      }
      if (Number.isFinite(endY)) {
        const span = endY - cardBottomY;
        const needSpan = interval.continuesPastMidnight
          ? minRailSpan
          : Math.max(minRailSpan, endCardHeight * 0.35 + 12);
        if (span >= needSpan) {
          hasExternalRail = true;
        }
      }
    }

    placements.push({
      itemId: item.id,
      indent,
      cardLeft,
      iconCenterX,
      cardTopY,
      cardBottomY,
      hasExternalRail,
      overflow,
    });

    if (hasExternalRail && interval && Number.isFinite(endY)) {
      // Provisional end block = thin rail only; full end cards in pass 2.
      activeLinesPass1.push({
        itemId: item.id,
        railX: iconCenterX,
        startY: cardBottomY,
        endY,
        endBlockLeft: iconCenterX - clearance,
        endBlockRight: iconCenterX + clearance,
        endBlockTop: endY,
        endBlockBottom: endY + endCardHeight,
      });
      provisionalRails.push({
        item,
        interval,
        railX: iconCenterX,
        startY: cardBottomY,
        endY,
      });
    }
  }

  // Pass 2: full-width end cards (rails pass behind; no horizontal compression).
  const rails: ConnectedRail[] = [];
  for (const prov of provisionalRails) {
    const continues = prov.interval.continuesPastMidnight;
    let endCard: ConnectedEndCard | null = null;
    if (!continues) {
      endCard = placeConnectedEndCard({
        itemId: prov.item.id,
        ownRailX: prov.railX,
        endY: prov.endY,
        contentLeft: input.contentLeft,
        contentRight: input.contentRight,
        endCardHeight,
        type: String(prov.item.type),
        title: prov.item.title || String(prov.item.type),
        endTimeLabel: prov.interval.endLabel,
        isCompleted: !!prov.item.isCompleted,
      });
      const measured = input.cardBounds[durationEndBoundsKey(prov.item.id)];
      if (measured && measured.height > 0) {
        endCard = {
          ...endCard,
          topY: measured.y,
          height: measured.height,
        };
      }
    }

    rails.push({
      itemId: prov.item.id,
      type: String(prov.item.type),
      railX: prov.railX,
      startY: prov.startY,
      endY: prov.endY,
      title: prov.item.title || String(prov.item.type),
      endCard,
      continuesPastMidnight: continues,
    });
  }

  const placementById = new Map(placements.map((p) => [p.itemId, p]));
  const overflowGroups = buildOverflowGroups(overflowMembers, intervalsById);

  return {
    placements,
    placementById,
    rails,
    overflowGroups,
  };
}

function buildOverflowGroups(
  members: AgendaItem[],
  intervalsById: Map<string, TimelineInterval>,
): ConnectedOverflowGroup[] {
  if (members.length === 0) return [];
  const seen = new Set<string>();
  const unique = members.filter((m) => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });
  const sorted = sortTimedItems(unique);
  const groups: ConnectedOverflowGroup[] = [];
  for (const item of sorted) {
    const iv = intervalsById.get(item.id);
    const start = iv?.displayStartMinutes ?? minutesFromMidnight(item.startTime!);
    const end = iv?.displayEndMinutes ?? start;
    const last = groups[groups.length - 1];
    if (last && start < last.displayEndMinutes) {
      last.memberIds.push(item.id);
      last.count += 1;
      last.displayEndMinutes = Math.max(last.displayEndMinutes, end);
    } else {
      groups.push({
        key: `connected-overflow-${item.id}-${start}`,
        memberIds: [item.id],
        count: 1,
        displayStartMinutes: start,
        displayEndMinutes: end,
      });
    }
  }
  return groups;
}

export function connectedScheduleSignature(items: AgendaItem[]): string {
  return collectTimelineIntervals(items)
    .map((iv) => `${iv.itemId}:${iv.displayStartMinutes}-${iv.displayEndMinutes}`)
    .sort()
    .join('|');
}

export function scheduledIconCenterOffset(
  paddingH: number = TIMELINE_TOKENS.scheduledCardPaddingH,
  iconBox: number = TIMELINE_TOKENS.scheduledIconContainer,
): number {
  return paddingH + iconBox / 2;
}
