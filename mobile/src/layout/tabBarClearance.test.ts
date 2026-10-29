/**
 * Run: npx --yes tsx src/layout/tabBarClearance.test.ts
 */
import assert from 'node:assert/strict';
import {
  FALLBACK_NATIVE_TAB_BAR,
  FALLBACK_NATIVE_TAB_BAR_WIDE,
  TAB_CHROME_GAP,
  floatingChromeClearance,
  scrollContentBottomClearance,
} from './tabBarClearance';

{
  // JS tabs: scene already above the bar → gap only.
  const r = floatingChromeClearance({
    parentClearanceFromWindow: 0,
    safeAreaBottom: 34,
    jsTabBarHeight: 64,
    fallbackTabTopFromWindow: FALLBACK_NATIVE_TAB_BAR,
  });
  assert.equal(r.bottomOffset, TAB_CHROME_GAP);
  assert.equal(r.tabOverlap, 0);
  assert.equal(TAB_CHROME_GAP, 16);
}

{
  // Parent flush with window; safe-area reports full tab + home indicator.
  const r = floatingChromeClearance({
    parentClearanceFromWindow: 0,
    safeAreaBottom: 83,
    fallbackTabTopFromWindow: FALLBACK_NATIVE_TAB_BAR,
  });
  assert.equal(r.tabTopFromWindow, 83);
  assert.equal(r.tabOverlap, 83);
  assert.equal(r.bottomOffset, 83 + TAB_CHROME_GAP);
}

{
  // Root-cause case: parent and safe-area share the same bottom (overlap
  // delta was 0 previously). Parent already cleared by safe-area amount →
  // only gap — unless fallback tab top is taller (floating overhang).
  const r = floatingChromeClearance({
    parentClearanceFromWindow: 83,
    safeAreaBottom: 83,
    fallbackTabTopFromWindow: FALLBACK_NATIVE_TAB_BAR,
  });
  assert.equal(r.tabOverlap, 0);
  assert.equal(r.bottomOffset, TAB_CHROME_GAP);
}

{
  // Floating iPad: safe-area under-reports (0); parent flush → use wide fallback.
  const r = floatingChromeClearance({
    parentClearanceFromWindow: 0,
    safeAreaBottom: 0,
    fallbackTabTopFromWindow: FALLBACK_NATIVE_TAB_BAR_WIDE,
  });
  assert.equal(r.tabTopFromWindow, FALLBACK_NATIVE_TAB_BAR_WIDE);
  assert.equal(r.tabOverlap, FALLBACK_NATIVE_TAB_BAR_WIDE);
  assert.equal(r.bottomOffset, FALLBACK_NATIVE_TAB_BAR_WIDE + TAB_CHROME_GAP);
}

{
  // Parent already inset by 40; floating fallback 96 → remaining 56 + gap.
  const r = floatingChromeClearance({
    parentClearanceFromWindow: 40,
    safeAreaBottom: 20,
    fallbackTabTopFromWindow: FALLBACK_NATIVE_TAB_BAR_WIDE,
  });
  assert.equal(r.tabTopFromWindow, FALLBACK_NATIVE_TAB_BAR_WIDE);
  assert.equal(r.tabOverlap, FALLBACK_NATIVE_TAB_BAR_WIDE - 40);
  assert.equal(r.bottomOffset, FALLBACK_NATIVE_TAB_BAR_WIDE - 40 + TAB_CHROME_GAP);
}

{
  // Parent cleared past the tab top → gap only (no double-count).
  const r = floatingChromeClearance({
    parentClearanceFromWindow: 120,
    safeAreaBottom: 83,
    fallbackTabTopFromWindow: FALLBACK_NATIVE_TAB_BAR_WIDE,
  });
  assert.equal(r.tabOverlap, 0);
  assert.equal(r.bottomOffset, TAB_CHROME_GAP);
}

{
  // Scroll content padding = overlap + breathing room (same as bottomOffset).
  const flush = floatingChromeClearance({
    parentClearanceFromWindow: 0,
    safeAreaBottom: 83,
    fallbackTabTopFromWindow: FALLBACK_NATIVE_TAB_BAR,
  });
  assert.equal(scrollContentBottomClearance(flush), flush.bottomOffset);
  assert.equal(scrollContentBottomClearance(flush), 83 + TAB_CHROME_GAP);

  const alreadyClear = floatingChromeClearance({
    parentClearanceFromWindow: 120,
    safeAreaBottom: 83,
    fallbackTabTopFromWindow: FALLBACK_NATIVE_TAB_BAR_WIDE,
  });
  assert.equal(scrollContentBottomClearance(alreadyClear), TAB_CHROME_GAP);
  assert.equal(scrollContentBottomClearance({ tabOverlap: 0 }, 12), 12);
  assert.equal(scrollContentBottomClearance({ tabOverlap: -5 }), TAB_CHROME_GAP);
}

console.log('tabBarClearance.test.ts: all assertions passed');
