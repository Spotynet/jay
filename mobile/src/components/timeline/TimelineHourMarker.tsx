import React, { useState } from 'react';
import { View, StyleSheet, Text, Pressable, Platform } from 'react-native';
import { IconPlus } from 'tabler-icons-react-native';
import { useTheme } from '../../context/ThemeContext';
import { Icon } from '../ui/Icon';
import { AgendaTypeCount } from '../../utils/timelineLayout';
import { useTimelineTokens } from '../../layout/useTimelineTokens';
import { timelineColumnStyles, rowInsetStyle } from './timelineColumns';
import { HourTypeSummary } from './HourTypeSummary';

interface TimelineHourMarkerProps {
  label: string;
  onAdd?: () => void;
  /** Empty hours keep the full-width content-column guide. */
  showGuide?: boolean;
  /** Populated-hour type breakdown; replaces a generic item count. */
  typeCounts?: AgendaTypeCount[];
}

/**
 * Exact-time section header (o’clock or occupied non-o’clock).
 * Columns: [ time ] [ + ] [ full guide | flex-line + type summary ]
 */
export function TimelineHourMarker({
  label,
  onAdd,
  showGuide = true,
  typeCounts,
}: TimelineHourMarkerProps) {
  const { colors, isDark } = useTheme();
  const T = useTimelineTokens();
  const [pressed, setPressed] = useState(false);
  const guideColor = isDark ? T.hourGuideColorDark : T.hourGuideColorLight;
  const mask = colors.background;
  const showSummary = Array.isArray(typeCounts) && typeCounts.length > 0;

  return (
    <View
      style={[
        timelineColumnStyles.row,
        rowInsetStyle(T.pageInset),
        styles.boundary,
        { minHeight: T.boundaryHeight },
      ]}
      pointerEvents="box-none"
    >
      <View style={[timelineColumnStyles.timeColumn, styles.baseline]}>
        <Text style={[timelineColumnStyles.timeLabel, styles.timeLabel, { color: colors.subtext }]}>
          {label}
        </Text>
      </View>

      <View style={[timelineColumnStyles.railColumn, styles.baseline]}>
        <Pressable
          onPress={onAdd}
          disabled={!onAdd}
          onPressIn={() => setPressed(true)}
          onPressOut={() => setPressed(false)}
          hitSlop={{ top: 10, bottom: 14, left: 12, right: 12 }}
          style={({ focused }) => [
            styles.addHit,
            { opacity: onAdd ? 1 : 0.35 },
            focused && Platform.OS === 'web'
              ? { outlineStyle: 'solid', outlineWidth: 2, outlineColor: colors.accent } as any
              : null,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Add item at ${label}`}
        >
          <View
            style={[
              styles.addMask,
              {
                width: T.addMaskSize,
                height: T.addMaskSize,
                borderRadius: T.addMaskSize / 2,
                backgroundColor: pressed ? colors.surfaceElevated : mask,
              },
            ]}
          >
            <Icon
              name={IconPlus}
              size={T.addIconSize}
              color={colors.subtext}
              stroke={T.addIconStroke}
            />
          </View>
        </Pressable>
      </View>

      <View style={[timelineColumnStyles.contentColumn, styles.trailing]}>
        {showSummary ? (
          <View style={[styles.populatedHeader, { gap: T.headerGuideCountGap }]}>
            <View
              style={[styles.flexGuide, { backgroundColor: guideColor }]}
              accessible={false}
              importantForAccessibility="no"
              accessibilityElementsHidden
              pointerEvents="none"
            />
            <HourTypeSummary counts={typeCounts!} />
          </View>
        ) : showGuide ? (
          <View
            style={[styles.guide, { backgroundColor: guideColor }]}
            accessible={false}
            importantForAccessibility="no"
            accessibilityElementsHidden
            pointerEvents="none"
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  boundary: {
    alignItems: 'center',
  },
  baseline: {
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  timeLabel: {
    lineHeight: 14,
    includeFontPadding: false,
  },
  addHit: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMask: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  trailing: {
    justifyContent: 'center',
    minWidth: 0,
  },
  populatedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    minWidth: 0,
  },
  flexGuide: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
    height: StyleSheet.hairlineWidth,
  },
  guide: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
});
