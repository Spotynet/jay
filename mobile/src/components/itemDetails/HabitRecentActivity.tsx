import React, { useMemo } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../ui/AppText';
import {
  HabitDayStrip,
  type HabitDayStripItem,
} from '../habits/HabitDayStrip';
import { mapActivityDayToStripItem } from '../habits/habitDayStripActivity';
import {
  HabitActivityDay,
  buildHabitRecentActivity,
  formatActivityDayExplanation,
  formatActivityRangeCaption,
} from '../../utils/habitRecentActivity';
import { toLocalDateString } from '../../utils/date';

type HabitRecentActivityProps = {
  habit: any;
  occurrenceDate: string;
  historyUnavailable?: boolean;
};

/**
 * Read-only seven-day activity strip ending on the selected occurrence.
 * Renders HabitDayStrip (activity mode) — same tiles as Edit schedule.
 */
export function HabitRecentActivity({
  habit,
  occurrenceDate,
  historyUnavailable,
}: HabitRecentActivityProps) {
  const { colors, entityColors } = useTheme();
  const accent = entityColors.habits;
  const todayDate = toLocalDateString(new Date());

  const activityDays: HabitActivityDay[] = useMemo(
    () =>
      buildHabitRecentActivity({
        occurrenceDate,
        todayDate,
        daysOfWeek: habit?.days_of_week,
        frequency: habit?.frequency,
        history: habit?.history,
        createdAt: habit?.created_at,
        historyUnavailable,
      }),
    [
      occurrenceDate,
      todayDate,
      habit?.days_of_week,
      habit?.frequency,
      habit?.history,
      habit?.created_at,
      historyUnavailable,
    ],
  );

  const explain = (day: HabitActivityDay) => {
    Alert.alert('Day status', formatActivityDayExplanation(day.date, day.state, day.selected));
  };

  const days: HabitDayStripItem[] = useMemo(
    () => activityDays.map((day) => mapActivityDayToStripItem(day, explain)),
    [activityDays],
  );

  const rangeCaption = formatActivityRangeCaption(occurrenceDate);

  if (!occurrenceDate) return null;

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <AppText style={[styles.sectionTitle, { color: colors.subtext }]}>
          Recent activity
        </AppText>
        <AppText style={[styles.range, { color: colors.subtext }]}>{rangeCaption}</AppText>
      </View>

      <View
        style={[
          styles.group,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <HabitDayStrip mode="activity" days={days} accent={accent} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    alignSelf: 'stretch',
    width: '100%',
    marginBottom: 22,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
    marginLeft: 2,
    marginRight: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  range: {
    fontSize: 12,
    fontWeight: '500',
  },
  group: {
    alignSelf: 'stretch',
    width: '100%',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
});
