import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { IconChevronRight } from 'tabler-icons-react-native';
import { useTheme } from '../../context/ThemeContext';
import { Icon } from '../ui/Icon';
import { NutritionTotals } from '../../utils/timelineLayout';
import { NutrientInlineValue } from './NutrientInlineValue';

/**
 * Optional nutrition meta above cards. Item counts belong in the hour header.
 */
interface TimelineGroupSummaryProps {
  nutrition?: NutritionTotals;
  onPress?: () => void;
}

export function TimelineGroupSummary({ nutrition, onPress }: TimelineGroupSummaryProps) {
  const { colors } = useTheme();
  const muted = colors.subtext;
  if (!nutrition && !onPress) return null;
  if (!nutrition) return null;

  const Wrapper: any = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${Math.round(nutrition.calories)} calories`}
    >
      <View style={styles.nutrients}>
        <NutrientInlineValue kind="calories" value={nutrition.calories} textColor={muted} />
        <NutrientInlineValue kind="fat" value={nutrition.fat} textColor={muted} />
        <NutrientInlineValue kind="carbs" value={nutrition.carbs} textColor={muted} />
        <NutrientInlineValue kind="protein" value={nutrition.protein} textColor={muted} />
      </View>
      {onPress ? <Icon name={IconChevronRight} size={16} color={muted} stroke={1.6} /> : null}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    marginBottom: 6,
    minHeight: 0,
  },
  nutrients: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    flexShrink: 1,
  },
});
