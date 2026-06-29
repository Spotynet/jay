import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../ui/AppText';
import { Icon } from '../ui/Icon';
import { IconChevronLeft, IconChevronRight } from 'tabler-icons-react-native';
import Animated from 'react-native-reanimated';

interface DayScrollPickerProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

export const DayScrollPicker = ({ selectedDate, setSelectedDate }: DayScrollPickerProps) => {
  const { colors, accentColor } = useTheme();
  const flatListRef = useRef<FlatList>(null);
  const dates = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 14 + i);
    return d;
  });

  const getDayName = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'short' });
  const getDayNumber = (date: Date) => date.getDate();

  const navigateDay = (direction: number) => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(selectedDate.getDate() + direction);
    setSelectedDate(nextDate);
  };

  useEffect(() => {
    const index = dates.findIndex(d => d.toDateString() === selectedDate.toDateString());
    if (index !== -1) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ 
          index, 
          animated: true, 
          viewPosition: 0.5 
        });
      }, 100);
    }
  }, []); // Run once on mount

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigateDay(-1)} style={styles.navButton}>
        <Icon name={IconChevronLeft} size={20} color={colors.subtext} />
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={dates}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.toDateString()}
        getItemLayout={(_, index) => ({ length: 57, offset: 57 * index, index })}
        renderItem={({ item }) => {
          const isSelected = item.toDateString() === selectedDate.toDateString();
          return (
            <TouchableOpacity style={[styles.dayItem, { marginHorizontal: 6 }]} onPress={() => setSelectedDate(item)}>
              <AppText style={[isSelected ? styles.dayNameActive : styles.dayNameInactive, { color: isSelected ? colors.text : colors.subtext }]}>{getDayName(item)}</AppText>
              <AppText style={[isSelected ? styles.dayNumActive : styles.dayNumInactive, { color: isSelected ? colors.text : colors.subtext }]}>{getDayNumber(item)}</AppText>
              {isSelected && <Animated.View style={[styles.underline, { backgroundColor: accentColor }]} />}
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity onPress={() => navigateDay(1)} style={styles.navButton}>
        <Icon name={IconChevronRight} size={20} color={colors.subtext} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', height: 60 },
  navButton: { padding: 4 },
  dayItem: { width: 45, alignItems: 'center', justifyContent: 'center', gap: 2 },
  dayNameActive: { fontSize: 10, textTransform: 'uppercase' },
  dayNameInactive: { fontSize: 9, textTransform: 'uppercase' },
  dayNumActive: { fontSize: 16, fontWeight: '500' },
  dayNumInactive: { fontSize: 14, fontWeight: '500' },
  underline: { height: 2, width: 16, borderRadius: 1, marginTop: 2 }
});
