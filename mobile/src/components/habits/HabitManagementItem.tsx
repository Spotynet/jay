import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../../components/ui/AppText';
import { Icon } from '../../components/ui/Icon';
import { IconEdit } from 'tabler-icons-react-native';
import { HABIT_ICONS } from '../../constants/habitIcons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface HabitItemProps {
  name: string;
  iconName: string;
  daysOfWeek: number[];
  history: { date: string; completed: boolean }[];
  onPress: () => void;
}

export const HabitManagementItem = ({ name, iconName, daysOfWeek, history, onPress }: HabitItemProps) => {
  const { colors, entityColors } = useTheme();
  const habitColor = entityColors.habits;
  const selectedIcon = HABIT_ICONS.find(i => i.name === iconName)?.icon || null;

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
        }
    }
    
    // 2. Start checking from yesterday
    let checkDate = new Date(now);
    checkDate.setDate(checkDate.getDate() - 1);
    
    // Iterate backwards
    while (true) {
      const dateStr = toDateStr(checkDate);
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
      // Safety break
      if (streak > 365) break;
    }
    return streak;
  };

  const streak = getStreak();
  const summary = daysOfWeek.length === 7 ? 'Daily' : `${daysOfWeek.length} days/week`;

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBox, { backgroundColor: habitColor + '20' }]}>
            <Icon name={selectedIcon} size={20} color={colors.text} />
          </View>
          <View style={styles.content}>
            <AppText style={[styles.title, { color: colors.text, marginLeft: 12 }]}>{name}</AppText>
            <AppText style={[styles.summary, { color: colors.subtext, marginLeft: 12 }]}>{summary}</AppText>
          </View>
        </View>
        
        <View style={styles.headerRight}>
            {streak >= 3 && (
                <View style={[styles.streakChip, { backgroundColor: '#FF950020' }]}>
                    <Icon name={require('tabler-icons-react-native').IconFlame} size={16} color="#FF9500" />
                    <AppText style={[styles.streakText, { color: '#FF9500' }]}>{streak}</AppText>
                </View>
            )}
            <TouchableOpacity style={[styles.editBtn, { backgroundColor: colors.surface }]} onPress={onPress}>
              <Icon name={IconEdit} size={16} color={colors.text} />
            </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  content: { marginLeft: 12, flex: 1, gap: 1 },
  title: { fontSize: 16, fontWeight: '700' },
  summary: { fontSize: 13, fontWeight: '400' },
  editBtn: { padding: 8, borderRadius: 8, marginLeft: 8 },
  streakChip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 32, padding: 8, borderRadius: 8, marginLeft: 8 },
  streakText: { fontSize: 12, fontWeight: '700', marginLeft: 4 },
});
