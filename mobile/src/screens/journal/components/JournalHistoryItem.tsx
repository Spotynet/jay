import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { AppText } from '../../../components/ui/AppText';
import { Icon } from '../../../components/ui/Icon';
import { IconChevronRight, IconMoodSmile, IconBolt } from 'tabler-icons-react-native';

interface JournalHistoryItemProps {
  entry: {
    id: number;
    date: string;
    highlight: string;
    mood_score?: number;
    energy_score?: number;
    custom_ratings?: { label: string, score: number }[];
  };
  onPress: () => void;
}

export const JournalHistoryItem = ({ entry, onPress }: JournalHistoryItemProps) => {
  const { colors, entityColors } = useTheme();
  const journalColor = entityColors.journal;
  
  const dateObj = new Date(entry.date + 'T00:00:00');
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const dayNum = dateObj.getDate();
  const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.dateBlock}>
          <AppText style={[styles.dayName, { color: journalColor }]}>{dayName}</AppText>
          <AppText style={[styles.dayNum, { color: colors.text }]}>{dayNum}</AppText>
          <AppText style={[styles.monthName, { color: colors.subtext }]}>{monthName}</AppText>
        </View>

        <View style={styles.mainInfo}>
          <AppText style={[styles.highlight, { color: colors.text }]} numberOfLines={2}>
            {entry.highlight}
          </AppText>
          
          <View style={styles.metaRow}>
            {entry.mood_score !== null && entry.mood_score !== undefined && (
              <View style={styles.scoreItem}>
                <Icon name={IconMoodSmile} size={14} color={journalColor} />
                <AppText style={[styles.scoreText, { color: colors.subtext }]}>{entry.mood_score}</AppText>
              </View>
            )}
            {entry.energy_score !== null && entry.energy_score !== undefined && (
              <View style={styles.scoreItem}>
                <Icon name={IconBolt} size={14} color="#FF9500" />
                <AppText style={[styles.scoreText, { color: colors.subtext }]}>{entry.energy_score}</AppText>
              </View>
            )}
            {entry.custom_ratings && entry.custom_ratings.length > 0 && (
              <AppText style={[styles.customCount, { color: colors.subtext + '80' }]}>
                • {entry.custom_ratings.length} {entry.custom_ratings.length === 1 ? 'tag' : 'tags'}
              </AppText>
            )}
          </View>
        </View>

        <Icon name={IconChevronRight} size={20} color={colors.border} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  content: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16,
  },
  dateBlock: {
    alignItems: 'center',
    width: 45,
    marginRight: 16,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.05)',
    paddingRight: 12,
  },
  dayName: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  dayNum: { fontSize: 18, fontWeight: '700', marginVertical: 2 },
  monthName: { fontSize: 10, fontWeight: '600' },
  mainInfo: { flex: 1, gap: 4 },
  highlight: { fontSize: 15, fontWeight: '500', lineHeight: 20 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  scoreItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  scoreText: { fontSize: 12, fontWeight: '600' },
  customCount: { fontSize: 12, fontWeight: '500' }
});
