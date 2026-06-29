import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { AppText } from '../../../components/ui/AppText';

interface MoodEnergyRatingProps {
  value: number;
  onChange: (val: number) => void;
  accentColor: string;
}

export const MoodEnergyRating = ({ value, onChange, accentColor }: MoodEnergyRatingProps) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
          const isSelected = value === num;
          return (
            <TouchableOpacity
              key={num}
              onPress={() => onChange(num)}
              style={[
                styles.item,
                { 
                  borderColor: isSelected ? accentColor : colors.border,
                  backgroundColor: isSelected ? accentColor : 'transparent'
                }
              ]}
              activeOpacity={0.7}
            >
              <AppText 
                style={[
                  styles.text, 
                  { color: isSelected ? '#FFFFFF' : colors.text }
                ]}
              >
                {num}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.labels}>
        <AppText style={[styles.label, { color: colors.subtext }]}>Low</AppText>
        <AppText style={[styles.label, { color: colors.subtext }]}>High</AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%' },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    gap: 4
  },
  item: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 2,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
  }
});
