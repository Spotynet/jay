import { StyleSheet } from 'react-native';

/**
 * Shared geometry for HabitDayStrip (Details recent activity + Edit schedule).
 * Weekday labels sit ABOVE equal-sized rounded squares.
 * Columns expand to fill the card; squares stay fixed-size.
 */
export const HABIT_DAY_TILE = {
  /** Fixed square indicator (width === height). */
  size: 30,
  radius: 8,
  borderWidth: StyleSheet.hairlineWidth,
  openBorderWidth: 1.5,
  /** Gap between the seven equal-width columns (spacing expands, not squares). */
  columnGap: 6,
  /** Vertical gap between weekday label and square. */
  labelToTileGap: 6,
  labelFontSize: 11,
  checkSize: 14,
  checkStroke: 2.4,
  dashFontSize: 16,
  unknownFontSize: 12,
  dotSize: 6,
  /** Strip insets inside a grouped card. */
  rowPadH: 10,
  rowPadTop: 12,
  rowPadBottom: 12,
  /** High-contrast check on solid habit accent. */
  onAccent: '#FFFFFF',
} as const;

export function habitDayQuietFill(isDark: boolean): string {
  return isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)';
}

/** Slightly softer fill for future / unavailable empty squares. */
export function habitDaySubduedFill(isDark: boolean): string {
  return isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
}
