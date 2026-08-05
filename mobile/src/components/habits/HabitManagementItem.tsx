import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../../components/ui/AppText';
import { Icon } from '../../components/ui/Icon';
import { IconPlayerPause } from 'tabler-icons-react-native';
import { HABIT_ICONS } from '../../constants/habitIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';

interface HabitItemProps {
  name: string;
  iconName: string;
  daysOfWeek: number[];
  history: { date: string; completed: boolean }[];
  isActive?: boolean;
  onPress: () => void;
  onLongPress?: () => void;
}

const WEEKDAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const PulseDot = ({ color }: { color: string }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(2.2, { duration: 1400, easing: Easing.out(Easing.ease) }),
      -1,
      true
    );
    opacity.value = withRepeat(
      withTiming(0, { duration: 1400, easing: Easing.out(Easing.ease) }),
      -1,
      true
    );
    return () => {
      cancelAnimation(scale);
      cancelAnimation(opacity);
    };
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.pulseWrap}>
      <View style={[styles.miniDot, { backgroundColor: color }]} />
      <Animated.View style={[styles.pulseRing, { backgroundColor: color }, ringStyle]} />
    </View>
  );
};

export const HabitManagementItem = ({ name, iconName, daysOfWeek, history, isActive = true, onPress, onLongPress }: HabitItemProps) => {
  const { colors, isDark, entityColors } = useTheme();
  const habitColor = entityColors.habits;
  const selectedIcon = HABIT_ICONS.find(i => i.name === iconName)?.icon || null;

  const schedule = new Set(daysOfWeek);
  const recent = history.slice(-7).reverse();

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={500}
      activeOpacity={0.6}
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          shadowColor: '#000',
          shadowOpacity: isDark ? 0.25 : 0.06,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 8,
          elevation: isDark ? 0 : 1,
        },
        !isActive && styles.inactive,
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: habitColor + '1A' }]}>
        <Icon name={selectedIcon} size={20} color={isActive ? habitColor : colors.subtext} />
      </View>

      <View style={styles.middle}>
        <AppText style={[styles.title, { color: isActive ? colors.text : colors.subtext }]} numberOfLines={1}>
          {name}
        </AppText>

        <View style={styles.weekRow}>
          {WEEKDAY_LETTERS.map((letter, i) => (
            <AppText
              key={i}
              style={[
                styles.weekLetter,
                { color: schedule.has(i) ? habitColor : (isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)') },
              ]}
            >
              {letter}
            </AppText>
          ))}
        </View>

        <View style={styles.heatRow}>
          {recent.map((h, i) => (
            <View
              key={i}
              style={[
                styles.heatDot,
                {
                  backgroundColor: isActive
                    ? h.completed
                      ? habitColor
                      : (isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.14)')
                    : colors.subtext + '22',
                },
              ]}
            />
          ))}
        </View>
      </View>

      {isActive ? (
        <View style={styles.statusWrap}>
          <PulseDot color={habitColor} />
        </View>
      ) : (
        <Icon name={IconPlayerPause} size={14} color={colors.subtext} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 12,
  },
  inactive: {
    opacity: 0.5,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  middle: {
    flex: 1,
    gap: 5,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  weekLetter: {
    fontSize: 10,
    fontWeight: '600',
    width: 12,
    textAlign: 'center',
  },
  heatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heatDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusWrap: {
    width: 18,
    alignItems: 'center',
  },
  pulseWrap: {
    width: 8,
    height: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pulseRing: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});