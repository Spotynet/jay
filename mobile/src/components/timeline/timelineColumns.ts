import { StyleSheet, ViewStyle } from 'react-native';
import { TIMELINE_TOKENS as T } from '../../utils/timelineTokens';

/**
 * Shared three-column row geometry for hour boundaries and content.
 * [ time label ] [ rail / add ] [ flexible content ]
 *
 * Horizontal inset is applied by callers via `pageInset` so tablet widths
 * can widen margins without forking column geometry.
 */
export const timelineColumnStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeColumn: {
    width: T.timeColumnWidth,
    justifyContent: 'center',
  },
  timeLabel: {
    fontSize: 10.5,
    fontWeight: '500',
    letterSpacing: 0.2,
    textAlign: 'right',
    paddingRight: 4,
  },
  railColumn: {
    width: T.railColumnWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentColumn: {
    // Main-axis growth fills remaining row width. Never set flexGrow:0
    // on this column or cards collapse to icon width.
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
    marginLeft: T.timelineContentGap,
  },
});

export function rowInsetStyle(pageInset: number = T.pageInset): ViewStyle {
  return { paddingHorizontal: pageInset };
}

export function railAbsoluteLeft(pageInset: number = T.pageInset): number {
  return pageInset + T.railCenterX - T.railThickness / 2;
}

export function contentColumnStyle(extra?: ViewStyle): ViewStyle {
  return { ...timelineColumnStyles.contentColumn, ...extra };
}
