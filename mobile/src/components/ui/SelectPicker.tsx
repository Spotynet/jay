import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from './AppText';
import { Icon } from './Icon';
import { IconChevronDown } from 'tabler-icons-react-native';

interface SelectOption {
  id: number | string;
  label: string;
  tag?: string;
}

interface SelectPickerProps {
  value?: SelectOption | null;
  options: SelectOption[];
  onSelect: (option: SelectOption) => void;
  placeholder?: string;
  isOpen: boolean;
  onToggle: () => void;
}

/**
 * Dropdown select — trigger field + floating scrollable option list.
 * Matches the app's Box/Input gradient and border style.
 */
export default function SelectPicker({
  value,
  options,
  onSelect,
  placeholder = 'Select an option',
  isOpen,
  onToggle,
}: SelectPickerProps) {
  const { colors, isDark } = useTheme();

  const gradient = (
    isDark
      ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0)']
      : ['rgba(0,0,0,0.04)', 'rgba(0,0,0,0)']
  ) as [string, string];

  return (
    <View style={[styles.wrapper, isOpen && styles.wrapperOpen]}>
      <TouchableOpacity
        style={[styles.trigger, { borderColor: colors.border }]}
        onPress={onToggle}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <AppText
          style={[styles.triggerText, { color: value ? colors.text : colors.subtext }]}
          numberOfLines={1}
        >
          {value?.label || placeholder}
        </AppText>
        <Icon
          name={IconChevronDown}
          size={16}
          color={colors.subtext}
          style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={[styles.dropdown, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <ScrollView style={styles.scroll} nestedScrollEnabled bounces={false}>
            {options.length === 0 ? (
              <AppText style={[styles.empty, { color: colors.subtext }]}>No options</AppText>
            ) : (
              options.map((item, index) => {
                const isSelected = item.id === value?.id;
                return (
                  <TouchableOpacity
                    key={item.id.toString()}
                    style={[
                      styles.option,
                      index > 0 && { borderTopWidth: 1, borderTopColor: colors.border + '30' },
                      isSelected && { backgroundColor: colors.surfaceElevated },
                    ]}
                    onPress={() => { onSelect(item); onToggle(); }}
                    activeOpacity={0.7}
                  >
                    {item.tag && (
                      <View style={[styles.tag, { backgroundColor: colors.surfaceElevated }]}>
                        <AppText style={[styles.tagText, { color: colors.subtext }]}>{item.tag}</AppText>
                      </View>
                    )}
                    <AppText style={[styles.optionText, { color: isSelected ? colors.text : colors.subtext }]}>
                      {item.label}
                    </AppText>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    zIndex: 1,
  },
  wrapperOpen: {
    zIndex: 9999,
  },
  trigger: {
    height: 60,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  triggerText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  dropdown: {
    position: 'absolute',
    top: 66,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 9999,
  },
  scroll: {
    maxHeight: 200,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '500',
  },
  empty: {
    textAlign: 'center',
    paddingVertical: 20,
    fontSize: 14,
  },
});
