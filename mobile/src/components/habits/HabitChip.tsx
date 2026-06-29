import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../ui/AppText';
import { Icon } from '../../components/ui/Icon';
import { IconCheck, IconFlame } from 'tabler-icons-react-native';
import { HABIT_ICONS } from '../../constants/habitIcons';
import Svg, { Circle } from 'react-native-svg';

interface HabitChipProps {
  name: string;
  iconName: string;
  isCompleted: boolean;
  progress: number;
  targetValue: number;
  hasTarget: boolean;
  targetType: 'COUNT' | 'TIME';
  daysOfWeek: number[];
  history: { date: string; completed: boolean }[];
  onToggle: () => Promise<void>;
  onIncrement: () => Promise<void>;
  onDecrement: () => Promise<void>;
}

export const HabitChip = ({ name, iconName, isCompleted, progress, targetValue, hasTarget, targetType, daysOfWeek, history, onToggle, onIncrement, onDecrement }: HabitChipProps) => {
  const { colors, entityColors } = useTheme();
  const habitColor = entityColors.habits;
  
  const getStreak = () => {
    // Helper to get YYYY-MM-DD in local time
    const toDateStr = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const completedDates = new Set(history.filter(h => h.completed).map(h => h.date));
    const now = new Date();
    
    let streak = 0;
    
    // 1. Check if today is completed (only if scheduled)
    const todayIdx = (now.getDay() + 6) % 7;
    const todayStr = toDateStr(now);
    
    if (daysOfWeek.includes(todayIdx)) {
        if (completedDates.has(todayStr)) {
            streak = 1;
        } else {
            // Today is scheduled, but not completed. 
            // Streak might still be valid from yesterday.
            streak = 0;
        }
    }
    
    // 2. Start checking from yesterday
    let checkDate = new Date(now);
    checkDate.setDate(checkDate.getDate() - 1);
    
    // Iterate backwards
    while (true) {
      const dateStr = toDateStr(checkDate);
      // Convert JS Sunday-based (0-6) to Monday-based (0-6)
      const dayIdx = (checkDate.getDay() + 6) % 7;
      
      if (daysOfWeek.includes(dayIdx)) {
        if (completedDates.has(dateStr)) {
            streak++;
        } else {
            // Missed a scheduled day. Streak broken.
            break;
        }
      }
      
      checkDate.setDate(checkDate.getDate() - 1);
      // Safety break to prevent infinite loop
      if (streak > 365) break;
    }
    return streak;
  };

  const streak = getStreak();
  
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((progress || 0) / (targetValue || 1)) * circumference;
  const showProgress = hasTarget && targetType === 'COUNT';

  const [lastTap, setLastTap] = useState(0);

  const handlePress = async () => {
    if (showProgress) {
      const now = Date.now();
      const DOUBLE_TAP_DELAY = 300;
      if (now - lastTap < DOUBLE_TAP_DELAY) {
          await onDecrement();
          setLastTap(0);
      } else {
          setLastTap(now);
          setTimeout(async () => {
              if (lastTap !== 0) {
                  await onIncrement();
                  setLastTap(0);
              }
          }, DOUBLE_TAP_DELAY);
      }
    } else {
      await onToggle();
    }
  };

  const handleLongPress = async () => {
    await onToggle();
  };

  const selectedIcon = HABIT_ICONS.find(i => i.name === iconName)?.icon || IconCheck;

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} onLongPress={handleLongPress} activeOpacity={0.8}>
      <View style={styles.circleContainer}>
        <Svg width={46} height={46} style={styles.svg}>
          <Circle 
            cx="23" cy="23" r={radius} 
            stroke={isCompleted ? habitColor : colors.border} 
            strokeWidth="2" 
            fill="transparent" 
          />
          {showProgress && (
             <Circle 
               cx="23" cy="23" r={radius} 
               stroke={habitColor} 
               strokeWidth="2" 
               fill="transparent" 
               strokeDasharray={`${circumference} ${circumference}`}
               strokeDashoffset={strokeDashoffset}
               strokeLinecap="round"
               transform="rotate(-90 23 23)"
             />
          )}
        </Svg>
        <Icon 
          name={selectedIcon} 
          size={20} 
          color={isCompleted ? habitColor : colors.subtext}
          style={styles.icon}
        />
        {streak >= 3 && (
            <View style={[styles.streakBadge, { backgroundColor: '#FF9500' }]}>
                <Icon name={IconFlame} size={12} color="#FFFFFFB3" />
                <AppText style={[styles.streakCount, { color: '#FFFFFFB3' }]}>{streak}</AppText>
            </View>
        )}
      </View>
      <AppText style={[styles.name, { color: isCompleted ? colors.text : colors.subtext }]}>
        {name}
      </AppText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', width: 60, gap: 6 },
  circleContainer: { width: 46, height: 46, justifyContent: 'center', alignItems: 'center', overflow: 'visible' },
  svg: { position: 'absolute', top: 0, left: 0 },
  icon: { position: 'absolute' },
  name: { fontSize: 10, textAlign: 'center', fontWeight: '400', letterSpacing: 3, marginTop: 5 },
  streakBadge: { position: 'absolute', top: -4, right: -4, paddingHorizontal: 4, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 2, zIndex: 10, elevation: 10 },
  streakCount: { fontSize: 9, fontWeight: '800' }
});
