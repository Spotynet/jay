import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { AppText } from '../../../components/ui/AppText';
import { Icon } from '../../../components/ui/Icon';
import { IconFlame } from 'tabler-icons-react-native';
import { HABIT_ICONS } from '../../../constants/habitIcons';
import Svg, { Circle } from 'react-native-svg';

type HabitStatus = 'PENDING' | 'COMPLETED' | 'SKIPPED' | 'FAILED';

const STATUS_OPTIONS: { key: Exclude<HabitStatus, 'PENDING'>; symbol: string; label: string }[] = [
  { key: 'FAILED', symbol: '✕', label: 'Failed' },
  { key: 'SKIPPED', symbol: '−', label: 'Skipped' },
  { key: 'COMPLETED', symbol: '✓', label: 'Completed' },
];

interface HabitRowProps {
  habit: {
    id: number;
    name: string;
    icon: string;
    status: HabitStatus;
    completed: boolean;
    progress: number;
    target_value: number;
    has_target: boolean;
    target_type: 'COUNT' | 'TIME';
    history: { date: string; status: HabitStatus; completed: boolean }[];
  };
  date: string;
  onSetStatus: (habitId: number, date: string, status: HabitStatus) => Promise<void>;
  onIncrement: (habitId: number, date: string) => Promise<void>;
  onDecrement: (habitId: number, date: string) => Promise<void>;
  isLast?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const HabitRow = ({ habit, date, onSetStatus, onIncrement, onDecrement, isLast, style }: HabitRowProps) => {
  const { colors, isDark, entityColors } = useTheme();
  const habitColor = entityColors.habits;

  const status: HabitStatus = habit.status || 'PENDING';
  const isCompleted = status === 'COMPLETED';
  const selected = status === 'PENDING' ? 'SKIPPED' : status;

  const getStreak = () => {
    const toDateStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const statusByDate = new Map((habit.history || []).map(h => [h.date, h.status]));
    let streak = 0;
    const d = new Date();
    while (true) {
      const s = statusByDate.get(toDateStr(d));
      if (s === 'COMPLETED') streak++;
      else if (s === 'SKIPPED') { /* skipped preserves the streak */ }
      else break; // FAILED, PENDING, or not logged
      d.setDate(d.getDate() - 1);
      if (streak > 365) break;
    }
    return streak;
  };

  const streak = getStreak();
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const progress = habit.target_value > 0 ? (habit.progress / habit.target_value) : 0;
  const strokeDashoffset = circumference - progress * circumference;
  const showProgress = habit.has_target && habit.target_type === 'COUNT';

  const selectedIcon = HABIT_ICONS.find(i => i.name === habit.icon)?.icon;

  const [lastTap, setLastTap] = useState(0);

  const handlePress = async () => {
    if (!showProgress) return;
    const now = Date.now();
    if (now - lastTap < 300) {
      await onDecrement(habit.id, date);
      setLastTap(0);
    } else {
      setLastTap(now);
      setTimeout(async () => {
        if (lastTap !== 0) { await onIncrement(habit.id, date); setLastTap(0); }
      }, 300);
    }
  };

  const statusColor = (key: Exclude<HabitStatus, 'PENDING'>) => {
    if (key === 'FAILED') return { fill: colors.error + '14', glyph: colors.error };
    if (key === 'SKIPPED') return { fill: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', glyph: colors.subtext };
    return { fill: habitColor + '1F', glyph: habitColor };
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border + '40' },
        style,
      ]}
      onPress={handlePress}
      activeOpacity={showProgress ? 0.6 : 1}
    >
      <View style={styles.left}>
        {/* Ring */}
        <View style={styles.ringWrap}>
          <Svg width={34} height={34}>
            <Circle
              cx="17" cy="17" r={radius}
              stroke={isCompleted ? habitColor : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)')}
              strokeWidth="2.5"
              fill="transparent"
            />
            {showProgress && (
              <Circle
                cx="17" cy="17" r={radius}
                stroke={habitColor}
                strokeWidth="2.5"
                fill="transparent"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 17 17)"
              />
            )}
          </Svg>
          {selectedIcon && (
            <View style={styles.iconCenter}>
              <Icon
                name={selectedIcon}
                size={14}
                color={isCompleted ? habitColor : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)')}
              />
            </View>
          )}
        </View>

        {/* Name + progress */}
        <View style={styles.info}>
          <AppText style={[
            styles.name,
            { color: isCompleted ? colors.text : colors.subtext }
          ]}>
            {habit.name}
          </AppText>
          {showProgress && (
            <AppText style={[styles.sub, { color: habitColor }]}>
              {habit.progress}/{habit.target_value}
            </AppText>
          )}
        </View>
      </View>

      <View style={styles.right}>
        {streak >= 3 && (
          <View style={styles.streak}>
            <Icon name={IconFlame} size={10} color="#FF9500" />
            <AppText style={styles.streakNum}>{streak}</AppText>
          </View>
        )}

        {/* 3-state toggle */}
        <View style={[styles.seg, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }]}>
          {STATUS_OPTIONS.map(opt => {
            const active = selected === opt.key;
            const c = statusColor(opt.key);
            return (
              <TouchableOpacity
                key={opt.key}
                accessibilityLabel={opt.label}
                onPress={() => onSetStatus(habit.id, date, opt.key)}
                style={[styles.segBtn, active && { backgroundColor: c.fill }]}
                activeOpacity={0.6}
              >
                <AppText style={[styles.segTxt, { color: active ? c.glyph : colors.subtext + '55' }]}>
                  {opt.symbol}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  ringWrap: {
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCenter: {
    position: 'absolute',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  sub: {
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
  },
  streakNum: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF9500',
    fontVariant: ['tabular-nums'],
  },
  seg: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 11,
    padding: 2,
    gap: 1,
  },
  segBtn: {
    width: 34,
    height: 34,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  segTxt: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 18,
  },
});