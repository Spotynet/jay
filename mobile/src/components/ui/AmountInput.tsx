import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Keyboard, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from './AppText';
import { Icon } from './Icon';
import { IconPlus, IconMinus } from 'tabler-icons-react-native';

const toAmountString = (v: number) => v.toFixed(2);
const sanitize = (text: string) => {
  const cleaned = text.replace(/[^0-9.]/g, '');
  const [whole, ...rest] = cleaned.split('.');
  if (rest.length === 0) return whole;
  return `${whole}.${rest.join('').slice(0, 2)}`;
};

interface AmountInputProps {
  value: string;
  onChangeValue: (v: string) => void;
  step?: number;
  placeholder?: string;
  prefix?: string;
}

export default function AmountInput({
  value,
  onChangeValue,
  step = 5,
  placeholder = '0.00',
  prefix = '$',
}: AmountInputProps) {
  const { colors, entityColors } = useTheme();
  const [focused, setFocused] = useState(false);

  const numeric = parseFloat(value) || 0;

  const adjust = (delta: number) => {
    const next = Math.max(0, numeric + delta);
    onChangeValue(toAmountString(next));
  };

  const handleTextChange = (text: string) => {
    const cleaned = sanitize(text);
    onChangeValue(cleaned);
  };

  const handleBlur = () => {
    setFocused(false);
    Keyboard.dismiss();
    const parsed = parseFloat(value) || 0;
    onChangeValue(toAmountString(parsed));
  };

  return (
    <View style={styles.row}>
      <TouchableOpacity
        onPress={() => adjust(-step)}
        activeOpacity={0.7}
        hitSlop={8}
        style={[styles.btn, { borderColor: focused ? entityColors.finance : colors.border }]}
      >
        <Icon name={IconMinus} size={16} color={focused ? entityColors.finance : colors.subtext} />
      </TouchableOpacity>

      <View style={styles.display}>
        <AppText style={[styles.prefix, { color: focused ? entityColors.finance : colors.subtext }]}>
          {prefix}
        </AppText>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={value}
          onChangeText={handleTextChange}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
          keyboardType="decimal-pad"
          placeholder={placeholder}
          placeholderTextColor={colors.subtext}
          textAlign="center"
          selectTextOnFocus
        />
      </View>

      <TouchableOpacity
        onPress={() => adjust(step)}
        activeOpacity={0.7}
        hitSlop={8}
        style={[styles.btn, { borderColor: focused ? entityColors.finance : colors.border }]}
      >
        <Icon name={IconPlus} size={16} color={focused ? entityColors.finance : colors.subtext} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    width: '100%',
  },
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  display: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  prefix: {
    position: 'absolute',
    left: 0,
    fontSize: 16,
    fontWeight: '700',
  },
  input: {
    width: '100%',
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 26,
    paddingVertical: 0,
    paddingHorizontal: 0,
    textAlign: 'center',
  },
});
