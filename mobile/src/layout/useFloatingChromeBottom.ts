import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, Platform, useWindowDimensions, View } from 'react-native';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsiveLayout } from './responsive';
import {
  FALLBACK_NATIVE_TAB_BAR,
  FALLBACK_NATIVE_TAB_BAR_WIDE,
  TAB_CHROME_GAP,
  floatingChromeClearance,
  type FloatingChromeClearance,
} from './tabBarClearance';

type MeasureState = {
  /** Window Y of the positioning parent’s bottom edge. */
  parentBottomY: number;
};

/**
 * Bottom offset + tab overlap for overlays that must clear the visible tab bar.
 *
 * Coordinate system: window bottom. Uses measureInWindow(parent) + safe-area
 * bottom inset + a documented native-tabs fallback when safe-area under-reports
 * floating chrome (common on iPad).
 */
export function useFloatingChromeBottom(gap: number = TAB_CHROME_GAP): FloatingChromeClearance & {
  onParentLayout: (e: LayoutChangeEvent) => void;
  parentRef: (node: View | null) => void;
} {
  const insets = useSafeAreaInsets();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const layout = useResponsiveLayout();
  // Optional — only set by the JS BottomTabView (web). Native tabs leave this undefined.
  const jsTabBarHeight = useContext(BottomTabBarHeightContext);

  const fallbackTabTopFromWindow = useMemo(() => {
    if (Platform.OS === 'web') return 0;
    // Native tabs only — JS tab bar is handled via context above.
    if (jsTabBarHeight != null && jsTabBarHeight > 0) return 0;
    if (layout.isTablet || Math.min(windowWidth, windowHeight) >= 768) {
      return FALLBACK_NATIVE_TAB_BAR_WIDE;
    }
    // Phone: prefer safe-area; keep a compact UIKit floor when inset is empty.
    return FALLBACK_NATIVE_TAB_BAR;
  }, [layout.isTablet, windowWidth, windowHeight, jsTabBarHeight]);

  const [measure, setMeasure] = useState<MeasureState>(() => ({
    // Assume flush until the first measure — forces fallback/safe-area clearance
    // rather than an optimistic “already clear” gap-only result.
    parentBottomY: windowHeight,
  }));

  const parentNodeRef = useRef<View | null>(null);

  const applyMeasure = useCallback((parentBottomY: number) => {
    setMeasure((prev) => {
      if (Math.abs(prev.parentBottomY - parentBottomY) < 0.5) return prev;
      return { parentBottomY };
    });
  }, []);

  const remasureParent = useCallback(() => {
    const node = parentNodeRef.current;
    if (!node || typeof node.measureInWindow !== 'function') return;
    node.measureInWindow((_x, y, _w, height) => {
      applyMeasure(y + height);
    });
  }, [applyMeasure]);

  const parentRef = useCallback(
    (node: View | null) => {
      parentNodeRef.current = node;
      if (node) {
        requestAnimationFrame(() => remasureParent());
      }
    },
    [remasureParent],
  );

  const onParentLayout = useCallback(
    (_e: LayoutChangeEvent) => {
      remasureParent();
    },
    [remasureParent],
  );

  useEffect(() => {
    remasureParent();
  }, [remasureParent, windowHeight, windowWidth, insets.bottom]);

  const clearance = useMemo(() => {
    const parentClearanceFromWindow = Math.max(
      0,
      windowHeight - measure.parentBottomY,
    );
    return floatingChromeClearance({
      parentClearanceFromWindow,
      safeAreaBottom: insets.bottom,
      gap,
      jsTabBarHeight: jsTabBarHeight ?? null,
      fallbackTabTopFromWindow,
    });
  }, [
    measure.parentBottomY,
    windowHeight,
    insets.bottom,
    gap,
    jsTabBarHeight,
    fallbackTabTopFromWindow,
  ]);

  return {
    ...clearance,
    onParentLayout,
    parentRef,
  };
}
