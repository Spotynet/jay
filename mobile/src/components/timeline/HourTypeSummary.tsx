import React, { useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { IconCircleDot } from 'tabler-icons-react-native';
import { useTheme, ENTITY_COLORS } from '../../context/ThemeContext';
import { ENTITY_ICONS } from '../../constants/entityIcons';
import { Icon } from '../ui/Icon';
import {
  AgendaItemType,
  AgendaTypeCount,
  formatAgendaTypeSummary,
} from '../../utils/timelineLayout';
import { TIMELINE_TOKENS as T } from '../../utils/timelineTokens';

/** Maps AgendaItemType → ThemeContext entityColors key. */
const ENTITY_COLOR_KEY: Record<AgendaItemType, keyof typeof ENTITY_COLORS> = {
  habit: 'habits',
  task: 'tasks',
  event: 'events',
  journal: 'journal',
  finance: 'finance',
};

function iconForType(type: string) {
  return ENTITY_ICONS[type as keyof typeof ENTITY_ICONS] ?? IconCircleDot;
}

function colorForType(type: string, entityColors: typeof ENTITY_COLORS, fallback: string) {
  const key = ENTITY_COLOR_KEY[type as AgendaItemType];
  return (key && entityColors[key]) || fallback;
}

interface HourTypeSummaryProps {
  counts: AgendaTypeCount[];
}

/**
 * Compact inline type breakdown for populated-hour headers:
 * [icon] N  [icon] N — no pills, intrinsic width.
 */
export function HourTypeSummary({ counts }: HourTypeSummaryProps) {
  const { colors, entityColors } = useTheme();
  const a11yLabel = useMemo(() => formatAgendaTypeSummary(counts), [counts]);

  if (counts.length === 0) return null;

  return (
    <View
      style={styles.row}
      accessible
      accessibilityRole="text"
      accessibilityLabel={a11yLabel}
      importantForAccessibility="yes"
    >
      {counts.map(({ type, count }) => (
        <View
          key={type}
          style={styles.entry}
          accessible={false}
          importantForAccessibility="no"
          accessibilityElementsHidden
        >
          <Icon
            name={iconForType(type)}
            size={T.headerTypeIconSize}
            color={colorForType(type, entityColors, colors.subtext)}
            stroke={1.75}
          />
          <Text
            style={[styles.count, { color: colors.subtext }]}
            numberOfLines={1}
          >
            {count}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: T.headerTypeGroupGap,
    flexGrow: 0,
    flexShrink: 0,
  },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: T.headerTypeIconGap,
  },
  count: {
    fontSize: T.headerCountFontSize,
    fontWeight: '500',
    lineHeight: 14,
    includeFontPadding: false,
    fontVariant: ['tabular-nums'],
  },
});
