import { StyleSheet, ViewStyle } from 'react-native';
import { TIMELINE_TOKENS as T } from '../../utils/timelineTokens';

/**
 * Shared three-column row geometry for hour boundaries and content.
 * [ time label ] [ rail / add ] [ flexible content ]
 */
export const timelineColumnStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: T.pageInset,
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

export function railAbsoluteLeft(): number {
  return T.pageInset + T.railCenterX - T.railThickness / 2;
}

export function contentColumnStyle(extra?: ViewStyle): ViewStyle {
  return { ...timelineColumnStyles.contentColumn, ...extra };
}
