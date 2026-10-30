/**
 * Run: npx --yes tsx src/utils/timelineConnectedDuration.test.ts
 */
import assert from 'node:assert/strict';
import {
  buildConnectedDurationLayout,
  connectedScheduleSignature,
  placeConnectedEndCard,
  scheduledIconCenterOffset,
  visibleRailSegments,
  CONNECTED_MIN_RAIL_SPAN,
} from './timelineConnectedDuration';
import { AgendaItem } from './timelineLayout';
import { TIMELINE_TOKENS as T } from './timelineTokens';

function item(
  id: string,
  hour: number,
  minute: number,
  durationMinutes?: number,
  type = 'task',
  title?: string,
): AgendaItem {
  return {
    id,
    title: title ?? id,
    type,
    timeRange: '',
    isActive: true,
    startTime: new Date(2026, 9, 30, hour, minute, 0),
    durationMinutes,
  };
}

const contentLeft = T.pageInset + T.contentOffsetX;
const contentRight = 390;
const iconOff = scheduledIconCenterOffset();

function layout(args: {
  items: AgendaItem[];
  sectionYs: Record<string, number>;
  cardBounds?: Record<string, { x: number; y: number; width: number; height: number }>;
}) {
  return buildConnectedDurationLayout({
    items: args.items,
    sectionYs: args.sectionYs,
    cardBounds: args.cardBounds ?? {},
    contentLeft,
    contentRight,
    iconCenterOffset: iconOff,
    estimatedCardHeight: T.scheduledCardMinHeight,
    sectionCardTopOffset: T.boundaryHeight + T.intervalPadVertical,
    endCardHeight: T.durationEndCardHeight,
  });
}

assert.equal(iconOff, T.scheduledCardPaddingH + T.scheduledIconContainer / 2);

// PRIMARY: full-width end card; habit indented for start
{
  const a = item('a', 12, 5, 135, 'task', 'Deep work');
  const read = item('read', 13, 0, undefined, 'habit', 'Read');
  const sectionYs = {
    'section-12-5': 100,
    'section-13-0': 280,
    'section-14-20': 480,
  };
  const cardBounds = {
    a: { x: contentLeft, y: 140, width: 200, height: 52 },
    read: { x: contentLeft + 40, y: 310, width: 160, height: 46 },
  };
  const result = layout({ items: [a, read], sectionYs, cardBounds });
  const pa = result.placementById.get('a')!;
  const pr = result.placementById.get('read')!;
  assert.equal(pa.indent, 0);
  assert.ok(pa.hasExternalRail);
  const rail = result.rails[0];
  const endEstimate = 480 + T.boundaryHeight + T.intervalPadVertical;
  assert.equal(rail.endY, endEstimate);
  assert.ok(rail.endCard);
  assert.equal(rail.endCard!.left, contentLeft);
  assert.equal(rail.endCard!.width, contentRight - contentLeft);
  assert.equal(rail.endCard!.overflow, false);
  assert.equal(rail.endCard!.endTimeLabel, '14:20');
  assert.ok(pr.indent > 0);
}

// Reproduction: A 17:00–19:30, B 18:00–20:15 — A endpoint stays full width
{
  const a = item('a', 17, 0, 150, 'event', 'Yellow');
  const b = item('b', 18, 0, 135, 'task', 'Red');
  const sectionYs = {
    'section-17-0': 100,
    'section-18-0': 220,
    'section-19-30': 400,
    'section-20-15': 520,
  };
  const cardBounds = {
    a: { x: contentLeft, y: 130, width: 200, height: 52 },
    b: { x: contentLeft + 40, y: 250, width: 160, height: 52 },
    'end:a': { x: contentLeft, y: 430, width: contentRight - contentLeft, height: 46 },
    'end:b': { x: contentLeft, y: 550, width: contentRight - contentLeft, height: 46 },
  };
  const result = layout({ items: [a, b], sectionYs, cardBounds });
  const endA = result.rails.find((r) => r.itemId === 'a')!.endCard!;
  const railB = result.rails.find((r) => r.itemId === 'b')!;
  assert.equal(endA.overflow, false);
  assert.equal(endA.width, contentRight - contentLeft);
  assert.ok(railB.railX > result.rails.find((r) => r.itemId === 'a')!.railX);
  assert.equal(result.overflowGroups.length, 0, 'no nested overflow for two overlaps');

  // B’s rail is punched only by A’s measured surface, then continues
  const railLeft = railB.railX - 1;
  const railRight = railB.railX + 1;
  const segs = visibleRailSegments(
    railB.startY,
    railB.endY,
    [
      {
        left: contentLeft,
        right: contentRight,
        top: 430,
        bottom: 476,
      },
    ],
    railLeft,
    railRight,
  );
  assert.ok(segs.length >= 2, 'rail reappears below endpoint');
  assert.equal(segs[0].top, railB.startY);
  assert.equal(segs[0].top + segs[0].height, 430);
  assert.equal(segs[segs.length - 1].top, 476);

  // Non-intersecting (narrow) card must not clip the rail
  const noClip = visibleRailSegments(
    0,
    100,
    [{ left: 300, right: 380, top: 20, bottom: 80 }],
    railLeft,
    railRight,
  );
  assert.equal(noClip.length, 1);
  assert.deepEqual(noClip[0], { top: 0, height: 100 });
}

// Measured END top
{
  const a = item('a', 12, 5, 135, 'task', 'Deep work');
  const result = layout({
    items: [a],
    sectionYs: { 'section-12-5': 100, 'section-14-20': 480 },
    cardBounds: {
      a: { x: contentLeft, y: 140, width: 200, height: 52 },
      'end:a': { x: contentLeft, y: 520, width: 200, height: 52 },
    },
  });
  assert.equal(result.rails[0].endY, 520);
  assert.equal(result.rails[0].endCard!.topY, 520);
}

// End card ignores surviving rails — always full content width
{
  const end = placeConnectedEndCard({
    itemId: 'self',
    ownRailX: contentLeft + 20,
    endY: 400,
    contentLeft,
    contentRight,
    activeLines: [
      { itemId: 'other', railX: contentLeft + 80, startY: 200, endY: 500 },
    ],
    endCardHeight: 46,
    type: 'task',
    title: 'Self',
    endTimeLabel: '14:20',
    isCompleted: false,
  });
  assert.equal(end.left, contentLeft);
  assert.equal(end.width, contentRight - contentLeft);
  assert.equal(end.overflow, false);
}

// visibleRailSegments merges overlapping holes (horizontal hit required)
{
  const segs = visibleRailSegments(
    0,
    100,
    [
      { left: 0, right: 50, top: 20, bottom: 40 },
      { left: 0, right: 50, top: 35, bottom: 50 },
    ],
    10,
    12,
  );
  assert.equal(segs.length, 2);
  assert.deepEqual(segs[0], { top: 0, height: 20 });
  assert.deepEqual(segs[1], { top: 50, height: 50 });
}

// Stacked endpoints: rail visible in the inter-card gap
{
  const segs = visibleRailSegments(
    0,
    200,
    [
      { left: 0, right: 300, top: 40, bottom: 80 },
      { left: 0, right: 300, top: 100, bottom: 140 },
    ],
    50,
    52,
  );
  assert.equal(segs.length, 3);
  assert.deepEqual(segs[1], { top: 80, height: 20 });
}

// Screenshot scenario: Yellow 17:00–19:30, Red2 18:00–20:15, Red3 19:00–20:15
// Rails punch only measured card surfaces — not heading/padding chrome.
{
  const yellow = item('yellow', 17, 0, 150, 'event', 'Yellow');
  const red2 = item('red2', 18, 0, 135, 'task', 'Task 2');
  const red3 = item('red3', 19, 0, 75, 'task', 'Task 3');
  const sectionYs = {
    'section-17-0': 100,
    'section-18-0': 220,
    'section-19-0': 340,
    'section-19-30': 400,
    'section-20-15': 560,
  };
  // Block at 19:30: heading ~400–424, pad, yellow END surface 430–476, pad below.
  // Fake "block chrome" must NOT become an occluder — only end:yellow surface.
  const cardBounds = {
    yellow: { x: contentLeft, y: 130, width: 220, height: 52 },
    red2: { x: contentLeft + 36, y: 250, width: 180, height: 52 },
    red3: { x: contentLeft + 72, y: 370, width: 150, height: 52 },
    'end:yellow': {
      x: contentLeft,
      y: 430,
      width: contentRight - contentLeft,
      height: 46,
    },
    'end:red2': {
      x: contentLeft,
      y: 580,
      width: contentRight - contentLeft,
      height: 46,
    },
    'end:red3': {
      x: contentLeft,
      y: 634,
      width: contentRight - contentLeft,
      height: 46,
    },
  };
  const result = layout({ items: [yellow, red2, red3], sectionYs, cardBounds });
  const railY = result.rails.find((r) => r.itemId === 'yellow')!;
  const rail2 = result.rails.find((r) => r.itemId === 'red2')!;
  const rail3 = result.rails.find((r) => r.itemId === 'red3')!;
  assert.ok(railY.endCard);
  assert.equal(railY.endY, 430);
  assert.equal(rail2.endY, 580);
  assert.equal(rail3.endY, 634);

  const endYellow = {
    left: contentLeft,
    right: contentRight,
    top: 430,
    bottom: 476,
  };
  const endRed2 = {
    left: contentLeft,
    right: contentRight,
    top: 580,
    bottom: 626,
  };
  // Heading/pad "fake" occluder that must be ignored by product code — here we
  // only pass real surfaces into visibleRailSegments.
  const w = 1;
  const segs2 = visibleRailSegments(
    rail2.startY,
    rail2.endY,
    [endYellow],
    rail2.railX - w,
    rail2.railX + w,
  );
  assert.ok(segs2.length >= 2, 'red2 reappears below yellow END');
  assert.equal(segs2[0].top + segs2[0].height, 430);
  assert.equal(segs2[1].top, 476);
  // Continuous through chrome above yellow card (start → 430, no hole at 400)
  assert.equal(segs2[0].top, rail2.startY);

  const segs3 = visibleRailSegments(
    rail3.startY,
    rail3.endY,
    [endYellow, endRed2],
    rail3.railX - w,
    rail3.railX + w,
  );
  // Passes behind yellow, visible in gap, behind red2 END, then to own end.
  assert.ok(segs3.length >= 2);
  const gap = segs3.find((s) => s.top === 476);
  assert.ok(gap, 'visible in gap below yellow before red2 END');
  assert.ok(gap!.height > 0);
  // Own terminus — no segment after rail3.endY
  const last = segs3[segs3.length - 1];
  assert.ok(last.top + last.height <= rail3.endY + 0.5);

  // Yellow own rail terminates at own END — not punched then resumed
  const segsY = visibleRailSegments(
    railY.startY,
    railY.endY,
    [],
    railY.railX - w,
    railY.railX + w,
  );
  assert.equal(segsY.length, 1);
  assert.equal(segsY[0].top + segsY[0].height, railY.endY);
}

// Short duration
{
  const short = item('s', 10, 0, 5);
  const result = layout({
    items: [short],
    sectionYs: { 'section-10-0': 100, 'section-10-5': 118 },
    cardBounds: { s: { x: contentLeft, y: 130, width: 200, height: 52 } },
  });
  assert.equal(result.placementById.get('s')!.hasExternalRail, false);
  assert.equal(result.rails.length, 0);
}

// Valid span
{
  const ok = item('ok', 10, 0, 60);
  const result = layout({
    items: [ok],
    sectionYs: { 'section-10-0': 100, 'section-11-0': 220 },
    cardBounds: { ok: { x: contentLeft, y: 130, width: 200, height: 52 } },
  });
  assert.ok(result.rails[0].endCard);
  assert.ok(result.rails[0].endY - result.rails[0].startY >= CONNECTED_MIN_RAIL_SPAN);
}

// Completion signature stable
{
  const base = [item('a', 12, 0, 90), item('b', 12, 30, 60)];
  assert.equal(
    connectedScheduleSignature(base),
    connectedScheduleSignature(base.map((i) => ({ ...i, isCompleted: true }))),
  );
}

// Back-to-back
{
  const a = item('a', 8, 0, 30);
  const b = item('b', 8, 30, 30);
  const result = layout({
    items: [a, b],
    sectionYs: {
      'section-8-0': 40,
      'section-8-30': 160,
      'section-9-0': 280,
    },
    cardBounds: {
      a: { x: contentLeft, y: 70, width: 200, height: 46 },
      b: { x: contentLeft, y: 260, width: 200, height: 46 },
    },
  });
  assert.ok(result.rails.some((r) => r.itemId === 'a'));
  assert.equal(result.placementById.get('b')!.indent, 0);
}

console.log('timelineConnectedDuration.test.ts: all assertions passed');
