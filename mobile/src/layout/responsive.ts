import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

/**
 * Width-based layout tiers. Prefer these over Platform.isPad so Split View /
 * Slide Over and rotation adapt correctly.
 */
export const BREAKPOINTS = {
  /** ≤ compactMax — small phones */
  compactMax: 430,
  /** ≤ regularPhoneMax — large phones / narrow split panes */
  regularPhoneMax: 600,
  /** ≤ smallTabletMax — iPad mini / split view */
  smallTabletMax: 900,
} as const;

export type DeviceClass = 'compact' | 'regularPhone' | 'smallTablet' | 'regularTablet';

export function deviceClassForWidth(width: number): DeviceClass {
  if (width <= BREAKPOINTS.compactMax) return 'compact';
  if (width <= BREAKPOINTS.regularPhoneMax) return 'regularPhone';
  if (width <= BREAKPOINTS.smallTabletMax) return 'smallTablet';
  return 'regularTablet';
}

export function isPhoneClass(deviceClass: DeviceClass): boolean {
  return deviceClass === 'compact' || deviceClass === 'regularPhone';
}

export type ResponsiveLayout = {
  width: number;
  height: number;
  deviceClass: DeviceClass;
  isPhone: boolean;
  isTablet: boolean;
  /** Max width for primary reading / task surfaces */
  contentMaxWidth: number;
  /** Horizontal inset for primary surfaces */
  pageInset: number;
  /** ScreenLayout default horizontal padding (phones keep legacy 15) */
  screenPadding: number;
  /** Extra vertical rhythm between major sections */
  sectionGap: number;
  /** Centered dialog / form-sheet presentation */
  useContainedSheet: boolean;
  sheetMaxWidth: number;
  sheetClearance: number;
};

export function layoutForSize(width: number, height: number): ResponsiveLayout {
  const deviceClass = deviceClassForWidth(width);
  const isPhone = isPhoneClass(deviceClass);
  const isTablet = !isPhone;

  if (deviceClass === 'compact' || deviceClass === 'regularPhone') {
    return {
      width,
      height,
      deviceClass,
      isPhone: true,
      isTablet: false,
      // Match existing phone timeline clamp.
      contentMaxWidth: 480,
      pageInset: 16,
      screenPadding: 15,
      sectionGap: 0,
      useContainedSheet: false,
      sheetMaxWidth: 640,
      sheetClearance: 28,
    };
  }

  if (deviceClass === 'smallTablet') {
    return {
      width,
      height,
      deviceClass,
      isPhone: false,
      isTablet: true,
      contentMaxWidth: 720,
      pageInset: 24,
      screenPadding: 24,
      sectionGap: 8,
      useContainedSheet: true,
      sheetMaxWidth: 640,
      sheetClearance: 28,
    };
  }

  return {
    width,
    height,
    deviceClass,
    isPhone: false,
    isTablet: true,
    contentMaxWidth: 800,
    pageInset: 28,
    screenPadding: 32,
    sectionGap: 12,
    useContainedSheet: true,
    sheetMaxWidth: 680,
    sheetClearance: 32,
  };
}

/** Hook: window-size responsive layout (Split View / rotation safe). */
export function useResponsiveLayout(): ResponsiveLayout {
  const { width, height } = useWindowDimensions();
  return useMemo(() => layoutForSize(width, height), [width, height]);
}
