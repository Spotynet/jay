import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { TimelineGroup } from '../../utils/timelineLayout';
import { TIMELINE_TOKENS as T } from '../../utils/timelineTokens';
import { timelineColumnStyles } from './timelineColumns';
import { TimelineGroupSummary } from './TimelineGroupSummary';
import { TimelineEventCard } from './TimelineEventCard';

interface TimelineTimeGroupProps {
  group: TimelineGroup;
  onItemPress?: (item: TimelineGroup['items'][number]) => void;
  onGroupPress?: (group: TimelineGroup) => void;
}

/**
 * Event cards for one timestamp group.
 * Item counts live in the hour header — not repeated above the cards.
 * Nutrition meta (when present) still renders above the cards.
 */
export function TimelineTimeGroup({ group, onItemPress, onGroupPress }: TimelineTimeGroupProps) {
  const { colors } = useTheme();
  const showOffHourLabel = group.minute !== 0;
  const showNutrition = !!group.nutrition;

  const cards = (
    <>
      {showNutrition ? (
        <TimelineGroupSummary
          nutrition={group.nutrition}
          onPress={onGroupPress ? () => onGroupPress(group) : undefined}
        />
      ) : null}
      {group.items.map((item) => (
        <TimelineEventCard
          key={item.id}
          item={item}
          onPress={() => onItemPress?.(item)}
        />
      ))}
    </>
  );

  if (!showOffHourLabel) {
    return (
      <View
        style={styles.exactHourStack}
        accessibilityRole="summary"
        accessibilityLabel={`Entries at ${group.timestampLabel}`}
      >
        {cards}
      </View>
    );
  }

  return (
    <View
      style={[timelineColumnStyles.row, styles.offHourRow]}
      accessibilityRole="summary"
      accessibilityLabel={`Entries at ${group.timestampLabel}`}
    >
      <View style={timelineColumnStyles.timeColumn}>
        <Text style={[timelineColumnStyles.timeLabel, { color: colors.subtext }]}>
          {group.timestampLabel}
        </Text>
      </View>
      <View style={timelineColumnStyles.railColumn} />
      <View style={[timelineColumnStyles.contentColumn, styles.stack]}>
        {cards}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    gap: T.cardGap,
    width: '100%',
    minWidth: 0,
  },
  exactHourStack: {
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    gap: T.cardGap,
    width: '100%',
    minWidth: 0,
    paddingLeft: T.pageInset + T.contentOffsetX,
    paddingRight: T.pageInset,
  },
  offHourRow: {
    alignItems: 'center',
    width: '100%',
  },
});
