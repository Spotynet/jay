/**
 * Bottom clearance for overlays that must sit above the visible tab bar.
 *
 * Native bottom tabs (`createNativeBottomTabNavigator`) do NOT provide
 * `BottomTabBarHeightContext`. Floating / translucent system bars often
 * occlude the bottom of the tab scene even when the overlay parent and the
 * safe-area frame share the same bottom edge — the old
 * `parentBottomY - safeContentBottomY` delta then collapses to 0 and only the
 * aesthetic gap was applied (the failed “raise the offset” fix).
 *
 * Correct model (one coordinate system — window bottom = 0 upward):
 *   tabTopFromWindowBottom = max(safeAreaBottom, documentedFallback)
 *   tabOverlapInParent     = max(0, tabTopFromWindowBottom - parentClearanceFromWindow)
 *   bottomOffset           = tabOverlapInParent + gap
 *
 * Fallbacks are documented estimates for when safe-area under-reports a
 * floating bar — not measured native geometry.
 */

/** Clear space between overlay bottom and visible tab-bar top. */
export const TAB_CHROME_GAP = 16;
/**
 * Minimum distance from window bottom → top of a standard UITabBar content
 * region when safe-area under-reports (excludes home indicator).
 */
export const FALLBACK_NATIVE_TAB_BAR = 49;
/**
 * Documented estimate for floating / iPad liquid-glass tab chrome
 * (bar + bottom margin to the visible top edge). Not a runtime measurement.
 */
export const FALLBACK_NATIVE_TAB_BAR_WIDE = 110;

export type FloatingChromeBottomArgs = {
  /** How far above the window bottom the positioning parent already ends. */
  parentClearanceFromWindow: number;
  /** `useSafeAreaInsets().bottom` — may include tab bar + home indicator. */
  safeAreaBottom: number;
  /** Clear space between shortcut bottom and tab-bar top. Default 15. */
  gap?: number;
  /**
   * When the JS bottom-tab navigator already lays the scene above the bar
   * (`BottomTabBarHeightContext`), pass that height so we only keep `gap`.
   */
  jsTabBarHeight?: number | null;
  /**
   * Documented minimum window-bottom → tab-top distance when safe-area
   * under-reports. Use 0 on web / when no native floating bar is possible.
   */
  fallbackTabTopFromWindow?: number;
};

export type FloatingChromeClearance = {
  /**
   * Absolute `bottom` style for the overlay inside its positioning parent:
   * remaining tab overlap in parent coords + gap.
   */
  bottomOffset: number;
  /**
   * How much of the parent’s bottom edge still sits under the tab obstruction
   * (excludes the aesthetic gap).
   */
  tabOverlap: number;
  /** Effective window-bottom → tab-top distance used for the calculation. */
  tabTopFromWindow: number;
};

/**
 * Pure layout helper — unit-tested. Prefer `useFloatingChromeBottom` in UI.
 */
export function floatingChromeClearance(
  args: FloatingChromeBottomArgs,
): FloatingChromeClearance {
  const gap = args.gap ?? TAB_CHROME_GAP;

  // JS / web tab bar: scene flex-layout already ends at the bar’s top.
  if (args.jsTabBarHeight != null && args.jsTabBarHeight > 0) {
    return { bottomOffset: gap, tabOverlap: 0, tabTopFromWindow: args.jsTabBarHeight };
  }

  const parentClearance = Math.max(0, args.parentClearanceFromWindow);
  const safeBottom = Math.max(0, args.safeAreaBottom);
  const fallback = Math.max(0, args.fallbackTabTopFromWindow ?? 0);

  // Prefer the larger of reported safe-area bottom and the documented native
  // fallback so under-reported floating bars still clear.
  const tabTopFromWindow = Math.max(safeBottom, fallback);
  const tabOverlap = Math.max(0, tabTopFromWindow - parentClearance);

  return {
    tabOverlap,
    tabTopFromWindow,
    bottomOffset: tabOverlap + gap,
  };
}

/**
 * Trailing padding for vertical scroll *content* that may extend behind
 * floating / translucent tab chrome.
 *
 * = remaining tab overlap in the scroll parent + breathing room (`gap`).
 * Does not reserve space for dismissed overlays. Never negative.
 * Identical to `FloatingChromeClearance.bottomOffset` for the same inputs.
 */
export function scrollContentBottomClearance(
  clearance: Pick<FloatingChromeClearance, 'tabOverlap'>,
  gap: number = TAB_CHROME_GAP,
): number {
  return Math.max(0, clearance.tabOverlap) + Math.max(0, gap);
}
