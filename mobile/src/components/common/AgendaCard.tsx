import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../ui/AppText';
import { Icon } from '../ui/Icon';
import { IconCheck } from 'tabler-icons-react-native';
import { ENTITY_ICONS } from '../../constants/entityIcons';

interface AgendaCardProps {
  title: string;
  type: 'event' | 'task' | 'habit' | 'journal' | 'finance';
  timeRange: string;
  location?: string;
  projectName?: string;
  isActive?: boolean;
  isCompleted?: boolean;
  isOverdue?: boolean;
  onToggle?: () => void;
  onPress?: () => void;
  startTime?: Date;
  durationMinutes?: number;
  verticalAlign?: 'center' | 'flex-start';
  icon?: any;
  compact?: boolean;
}

export const AgendaCard = ({ title, type, timeRange, location, projectName, isActive, isCompleted, onToggle, onPress, startTime, durationMinutes, verticalAlign = 'flex-start', icon, compact }: AgendaCardProps) => {
  const { colors, accentColor, entityColors } = useTheme();
  
  // Pluralize type to match keys in entityColors (tasks, habits, events, journals, finance)
  const entityKey = (type === 'journal' || type === 'finance' ? type : type + 's') as keyof typeof entityColors;
  const entityColor = entityColors[entityKey] || accentColor;
  
  const isPast = startTime && startTime.getTime() < new Date().getTime();
  const showCompletedStyle = isCompleted || (type === 'event' && isPast);

  const timeBit = timeRange ? String(timeRange).slice(0, 5) : '';
  const metaLine = compact
    ? ''
    : [timeBit, projectName, location].filter(Boolean).join(' · ');

  return (
    <TouchableOpacity style={[styles.card, compact && styles.cardCompact, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={onPress} activeOpacity={0.8}>
      <View style={[
        styles.cardBorder, 
        showCompletedStyle ? { backgroundColor: colors.subtext } : {
          backgroundColor: entityColor,
          shadowColor: entityColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 4,
          elevation: 4
        }
      ]} />
      <View style={[styles.cardContent, compact && styles.cardContentCompact, { justifyContent: compact ? 'center' : verticalAlign }]}>
        
        <View style={styles.headerRow}>
          {compact && (
            <Icon name={icon || ENTITY_ICONS[type]} size={12} color={showCompletedStyle ? colors.subtext : entityColor} />
          )}
          <Text style={[styles.title, compact && styles.titleCompact, { flex: 1, color: colors.text, paddingLeft: compact ? 4 : 6 }, showCompletedStyle && { color: colors.subtext, textDecorationLine: 'line-through' }]} numberOfLines={1} ellipsizeMode="tail">{title}</Text>
          {(type === 'task' || type === 'habit') && (
            <TouchableOpacity style={[styles.checkbox, compact && styles.checkboxCompact, showCompletedStyle && { borderColor: entityColor, backgroundColor: entityColor }]} onPress={onToggle}>
                {showCompletedStyle && <Icon name={IconCheck} size={12} color={colors.background} />}
            </TouchableOpacity>
          )}
        </View>

        {metaLine ? (
          <Text style={[styles.infoText, { color: colors.subtext }]} numberOfLines={1}>{metaLine}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { 
    borderRadius: 8, 
    borderWidth: 0.5, 
    borderLeftWidth: 0,
    borderTopWidth: 0.5,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    overflow: 'hidden', 
    flex: 1,
    padding: 5,
    justifyContent: 'flex-start',
    marginLeft: 6,
    marginRight: 6
  },
  cardBorder: { position: 'absolute', left: 0, top: 0, width: 3, height: '100%' },
  cardContent: { padding: 5, gap: 2, alignItems: 'flex-start' },
  cardContentCompact: { flex: 1, paddingVertical: 0, paddingHorizontal: 6, gap: 0, justifyContent: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
  checkbox: { width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: 'gray', justifyContent: 'center', alignItems: 'center', marginTop: 1, marginLeft: 8 },
  checkboxCompact: { marginTop: 0, width: 14, height: 14 },
  title: { fontSize: 12, fontWeight: '600', paddingLeft: 5, textAlign: 'left' },
  titleCompact: { fontSize: 11, lineHeight: 14, paddingLeft: 4 },
  cardCompact: { padding: 0, marginLeft: 0, marginRight: 0, justifyContent: 'center' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 1, marginTop: 6 },
  infoText: { fontSize: 9, textAlign: 'left' },
});
