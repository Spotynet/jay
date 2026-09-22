import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../ui/AppText';
import { Icon } from '../ui/Icon';
import { IconTarget, IconWallet } from 'tabler-icons-react-native';

interface DaySummaryCardProps {
  tasksRemaining: number;
  tasksTotal: number;
  habitsCompleted: number;
  habitsTotal: number;
  eventsToday: number;
  paymentsCount?: number;
}

export default function DaySummaryCard({
  tasksRemaining,
  tasksTotal,
  habitsCompleted,
  habitsTotal,
  eventsToday,
  paymentsCount = 0,
}: DaySummaryCardProps) {
  const { colors, entityColors } = useTheme();

  const totalItems = tasksTotal + habitsTotal + eventsToday + paymentsCount;
  const completedItems = (tasksTotal - tasksRemaining) + habitsCompleted;
  const completionPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const isComplete = completionPct === 100;

  return (
    <View style={styles.card}>
      <View style={styles.statChip}>
        <Icon name={IconTarget} size={16} color={entityColors.habits} />
        <AppText bold style={[styles.statValue, { color: colors.text }]}>
          {habitsCompleted}/{habitsTotal}
        </AppText>
      </View>

      <View style={styles.statChip}>
        <Icon name={IconWallet} size={16} color={entityColors.finance} />
        <AppText bold style={[styles.statValue, { color: colors.text }]}>
          {paymentsCount}
        </AppText>
      </View>

      {totalItems > 0 && (
        <View style={styles.progressRow}>
          <View style={[styles.progressTrack, { backgroundColor: colors.surfaceElevated }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${completionPct}%`,
                  backgroundColor: isComplete ? '#34C759' : colors.accent,
                },
              ]}
            />
          </View>
          <AppText
            bold
            style={[
              styles.progressPct,
              { color: isComplete ? '#34C759' : colors.subtext },
            ]}
          >
            {completionPct}%
          </AppText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statValue: {
    fontSize: 13,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressPct: {
    fontSize: 11,
    minWidth: 28,
    textAlign: 'right',
  },
});
