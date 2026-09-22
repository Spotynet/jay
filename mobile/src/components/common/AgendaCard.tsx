import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../ui/AppText';
import { Icon } from '../ui/Icon';
import { IconMapPin, IconClock, IconCheck, IconCash } from 'tabler-icons-react-native';
import { ENTITY_ICONS } from '../../constants/entityIcons';

interface AgendaCardProps {
  title: string;
  type: 'event' | 'task' | 'habit' | 'journal' | 'finance';
  timeRange: string;
  location?: string;
  isActive?: boolean;
  isCompleted?: boolean;
  isOverdue?: boolean;
  onToggle?: () => void;
  onPress?: () => void;
  startTime?: Date;
  durationMinutes?: number;
  verticalAlign?: 'center' | 'flex-start';
  icon?: any;
}

export const AgendaCard = ({ title, type, timeRange, location, isActive, isCompleted, onToggle, onPress, startTime, durationMinutes, verticalAlign = 'flex-start', icon }: AgendaCardProps) => {
  const { colors, accentColor, entityColors } = useTheme();
  
  // Pluralize type to match keys in entityColors (tasks, habits, events, journals, finance)
  const entityKey = (type === 'journal' || type === 'finance' ? type : type + 's') as keyof typeof entityColors;
  const entityColor = entityColors[entityKey] || accentColor;
  
  const isPast = startTime && startTime.getTime() < new Date().getTime();
  const showCompletedStyle = isCompleted || (type === 'event' && isPast);

  const showTime = timeRange && (type === 'event' || type === 'finance' || type === 'journal' || ((type === 'task' || type === 'habit') && timeRange !== ''));

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={onPress} activeOpacity={0.8}>
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
      <View style={[styles.cardContent, { justifyContent: verticalAlign }]}>
        
        <View style={styles.headerRow}>
          <Icon name={icon || ENTITY_ICONS[type]} size={15} color={showCompletedStyle ? colors.subtext : entityColor} />
          <Text style={[styles.title, { flex: 1, color: colors.text }, showCompletedStyle && { color: colors.subtext, textDecorationLine: 'line-through' }]} numberOfLines={1} ellipsizeMode="tail">{title}</Text>
          {(type === 'task' || type === 'habit') && (
            <TouchableOpacity style={[styles.checkbox, showCompletedStyle && { borderColor: entityColor, backgroundColor: entityColor }]} onPress={onToggle}>
                {showCompletedStyle && <Icon name={IconCheck} size={12} color={colors.background} />}
            </TouchableOpacity>
          )}
        </View>

        {showTime && (
            <View style={[styles.infoRow, { paddingLeft: 0 }]}>
                <Icon name={type === 'finance' ? IconCash : IconClock} size={15} color={colors.subtext} style={{ marginRight: 4 }} />
                <Text style={[styles.infoText, { color: colors.subtext }]}>{timeRange}</Text>
            </View>
        )}
        {location && (
            <View style={[styles.infoRow, { paddingLeft: 0 }]}>
                <Icon name={IconMapPin} size={15} color={colors.subtext} style={{ marginRight: 4 }} />
                <Text style={[styles.infoText, { color: colors.subtext }]} numberOfLines={1}>{location}</Text>
            </View>
        )}
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
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
  checkbox: { width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: 'gray', justifyContent: 'center', alignItems: 'center', marginTop: 1, marginLeft: 8 },
  title: { fontSize: 12, fontWeight: '600', paddingLeft: 5, textAlign: 'left' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 1, marginTop: 6 },
  infoText: { fontSize: 9, textAlign: 'left' },
});
