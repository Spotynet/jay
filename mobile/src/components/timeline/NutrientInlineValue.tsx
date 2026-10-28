import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { IconFlame, IconDroplet, IconBread, IconMeat } from 'tabler-icons-react-native';
import { Icon } from '../ui/Icon';
import { TIMELINE_TOKENS } from '../../utils/timelineTokens';

export const NUTRIENT_COLORS = {
  calories: '#929399',
  fat: '#8B9CF7',
  carbs: '#E8A15A',
  protein: '#E07AB5',
} as const;

type NutrientKind = keyof typeof NUTRIENT_COLORS;

const ICONS: Record<NutrientKind, any> = {
  calories: IconFlame,
  fat: IconDroplet,
  carbs: IconBread,
  protein: IconMeat,
};

const LABELS: Record<NutrientKind, string> = {
  calories: 'calories',
  fat: 'fat',
  carbs: 'carbs',
  protein: 'protein',
};

interface NutrientInlineValueProps {
  kind: NutrientKind;
  value: number | string;
  textColor?: string;
  size?: 'sm' | 'md';
}

export function NutrientInlineValue({
  kind,
  value,
  textColor = '#929399',
  size = 'md',
}: NutrientInlineValueProps) {
  const iconSize = size === 'sm' ? 13 : TIMELINE_TOKENS.nutrientIconSize;
  const fontSize = size === 'sm' ? 12 : TIMELINE_TOKENS.summaryFontSize;
  const display =
    typeof value === 'number'
      ? kind === 'calories'
        ? Math.round(value)
        : Number.isInteger(value)
          ? value
          : value.toFixed(1)
      : value;

  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`${display} ${LABELS[kind]}`}
    >
      <Icon name={ICONS[kind]} size={iconSize} color={NUTRIENT_COLORS[kind]} stroke={1.75} />
      <Text style={[styles.text, { color: textColor, fontSize }]}>{display}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  text: {
    fontWeight: '500',
  },
});
