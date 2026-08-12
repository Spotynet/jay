import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

export const DEFAULT_COLOR_PALETTE = [
  '#FF3B30',
  '#FF9500',
  '#FFCC00',
  '#34C759',
  '#00C7BE',
  '#30B0C7',
  '#007AFF',
  '#5856D6',
  '#AF52DE',
  '#FF2D55',
];

interface ColorSwatchPickerProps {
  value: string;
  onChange: (color: string) => void;
  palette?: string[];
}

/** Circular color swatch picker. Selected swatch is ringed with a white border + shadow. */
export default function ColorSwatchPicker({
  value,
  onChange,
  palette = DEFAULT_COLOR_PALETTE,
}: ColorSwatchPickerProps) {
  return (
    <View style={styles.row}>
      {palette.map((c) => {
        const isSelected = c.toLowerCase() === value.toLowerCase();
        return (
          <TouchableOpacity
            key={c}
            style={[styles.swatch, { backgroundColor: c }, isSelected && styles.swatchSelected]}
            onPress={() => onChange(c)}
            activeOpacity={0.8}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  swatch: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  swatchSelected: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
});