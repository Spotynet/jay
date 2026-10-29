import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { IconCheck } from 'tabler-icons-react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../ui/AppText';
import { Icon } from '../ui/Icon';
import {
  HabitActivityDay,
  HabitActivityState,
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
 * Tap shows a lightweight explanation only — never mutates completion.
 */
export function HabitRecentActivity({
  habit,
  occurrenceDate,
  historyUnavailable,
}: HabitRecentActivityProps) {
  const { colors, entityColors, isDark } = useTheme();
  const accent = entityColors.habits;
  const todayDate = toLocalDateString(new Date());

  const days: HabitActivityDay[] = useMemo(
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

  const rangeCaption = formatActivityRangeCaption(occurrenceDate);
  const quietFill = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  if (!occurrenceDate) return null;

  const explain = (day: HabitActivityDay) => {
    Alert.alert('Day status', formatActivityDayExplanation(day.date, day.state, day.selected));
  };

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
        <View style={styles.row}>
          {days.map((day) => (
            <Pressable
              key={day.date}
              onPress={() => explain(day)}
              style={styles.cell}
              accessibilityRole="button"
              accessibilityLabel={day.accessibilityLabel}
              accessibilityHint="Shows day status"
            >
              <AppText
                style={[
                  styles.dayLabel,
                  {
                    color: day.selected ? colors.text : colors.subtext,
                    fontWeight: day.selected ? '700' : '600',
                  },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
              >
                {day.dayLabel}
              </AppText>

              <DayIndicator
                state={day.state}
                accent={accent}
                quietFill={quietFill}
                border={colors.border}
                subtext={colors.subtext}
              />

              <View
                style={[
                  styles.selectionMark,
                  {
                    backgroundColor: day.selected ? accent : 'transparent',
                  },
                ]}
              />
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

function DayIndicator({
  state,
  accent,
  quietFill,
  border,
  subtext,
}: {
  state: HabitActivityState;
  accent: string;
  quietFill: string;
  border: string;
  subtext: string;
}) {
  if (state === 'completed') {
    return (
      <View style={[styles.indicator, { backgroundColor: accent, borderColor: accent }]}>
        <Icon name={IconCheck} size={14} color="#FFFFFF" stroke={2.4} />
      </View>
    );
  }

  if (state === 'missed') {
    return (
      <View style={[styles.indicator, { backgroundColor: quietFill, borderColor: 'transparent' }]}>
        <View style={[styles.dot, { backgroundColor: subtext }]} />
      </View>
    );
  }

  if (state === 'open_today') {
    return (
      <View
        style={[
          styles.indicator,
          { backgroundColor: 'transparent', borderColor: accent, borderWidth: 1.5 },
        ]}
      >
        <View style={[styles.openRing, { borderColor: accent }]} />
      </View>
    );
  }

  if (state === 'unscheduled' || state === 'before_start') {
    return (
      <View style={styles.plainSlot}>
        <AppText style={[styles.dash, { color: subtext }]}>—</AppText>
      </View>
    );
  }

  if (state === 'future') {
    return (
      <View style={styles.plainSlot}>
        <AppText style={[styles.dash, { color: subtext, opacity: 0.55 }]}>·</AppText>
      </View>
    );
  }

  // unknown
  return (
    <View style={[styles.indicator, { backgroundColor: quietFill, borderColor: border }]}>
      <AppText style={[styles.unknownMark, { color: subtext }]}>?</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 22 },
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
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
    paddingVertical: 2,
  },
  dayLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  indicator: {
    width: 28,
    height: 28,
    borderRadius: 9,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plainSlot: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  openRing: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
  },
  dash: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  unknownMark: {
    fontSize: 12,
    fontWeight: '700',
  },
  selectionMark: {
    width: 14,
    height: 3,
    borderRadius: 2,
    marginTop: 2,
  },
});
