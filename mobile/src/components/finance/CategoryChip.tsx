import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../ui/AppText';
import { Icon } from '../ui/Icon';
import { IconPencil, IconTrash } from 'tabler-icons-react-native';

interface CategoryChipProps {
  name: string;
  type: 'EXPENSE' | 'EARNING';
  onEdit?: () => void;
  onDelete?: () => void;
}

export function CategoryChip({ name, type, onEdit, onDelete }: CategoryChipProps) {
  const { colors } = useTheme();
  const isIncome = type === 'EARNING';
  const chipColor = isIncome ? '#34C759' : '#FF3B30';

  return (
    <View style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.left}>
        <View style={[styles.dot, { backgroundColor: chipColor }]} />
        <AppText style={[styles.name, { color: colors.text }]}>{name}</AppText>
        <View style={[styles.typeTag, { backgroundColor: `${chipColor}14` }]}>
          <AppText style={[styles.typeText, { color: chipColor }]}>{type === 'EARNING' ? 'IN' : 'OUT'}</AppText>
        </View>
      </View>
      <View style={styles.actions}>
        {onEdit && (
          <TouchableOpacity onPress={onEdit} style={[styles.actionBtn, { backgroundColor: colors.surfaceElevated }]} activeOpacity={0.6}>
            <Icon name={IconPencil} size={14} color={colors.text} />
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity onPress={onDelete} style={[styles.actionBtn, { backgroundColor: 'rgba(255,59,48,0.12)' }]} activeOpacity={0.6}>
            <Icon name={IconTrash} size={14} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  actions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionBtn: {
    width: 28,
    height: 28,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
