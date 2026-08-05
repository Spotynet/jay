import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Pressable, Dimensions } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../ui/AppText';
import { Icon } from '../ui/Icon';
import { IconChevronLeft, IconChevronRight } from 'tabler-icons-react-native';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarPickerModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: Date;
  onSelect: (date: Date) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CALENDAR_WIDTH = SCREEN_WIDTH - 48;
const CELL_SIZE = CALENDAR_WIDTH / 7;

export default function CalendarPickerModal({ visible, onClose, selectedDate, onSelect }: CalendarPickerModalProps) {
  const { colors, isDark, accentColor } = useTheme();
  const today = new Date();
  const [displayMonth, setDisplayMonth] = useState(selectedDate.getMonth());
  const [displayYear, setDisplayYear] = useState(selectedDate.getFullYear());

  useEffect(() => {
    if (visible) {
      setDisplayMonth(selectedDate.getMonth());
      setDisplayYear(selectedDate.getFullYear());
    }
  }, [visible, selectedDate]);

  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(displayYear, displayMonth, 1).getDay();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  const isToday = (day: number) =>
    day === today.getDate() && displayMonth === today.getMonth() && displayYear === today.getFullYear();

  const isSelected = (day: number) =>
    day === selectedDate.getDate() && displayMonth === selectedDate.getMonth() && displayYear === selectedDate.getFullYear();

  const prevMonth = () => {
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear(displayYear - 1);
    } else {
      setDisplayMonth(displayMonth - 1);
    }
  };

  const nextMonth = () => {
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear(displayYear + 1);
    } else {
      setDisplayMonth(displayMonth + 1);
    }
  };

  const goToToday = () => {
    setDisplayMonth(today.getMonth());
    setDisplayYear(today.getFullYear());
    onSelect(today);
    onClose();
  };

  const handleDayPress = (day: number) => {
    const newDate = new Date(displayYear, displayMonth, day);
    onSelect(newDate);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} onStartShouldSetResponder={() => true} onMoveShouldSetResponder={() => true}>
        <Pressable>
          <Animated.View
            entering={FadeInDown.duration(300).springify()}
            exiting={FadeOut.duration(200)}
            style={[styles.container, { backgroundColor: colors.surface }]}
          >
            {/* Handle bar */}
            <View style={[styles.handle, { backgroundColor: colors.border }]} />

            {/* Month Navigation */}
            <View style={styles.monthNav}>
              <TouchableOpacity onPress={prevMonth} style={[styles.navBtn, { backgroundColor: colors.surfaceElevated }]} activeOpacity={0.7}>
                <Icon name={IconChevronLeft} size={20} color={colors.text} />
              </TouchableOpacity>
              <View style={styles.monthCenter}>
                <AppText bold style={[styles.monthText, { color: colors.text }]}>{MONTHS[displayMonth]}</AppText>
                <AppText style={[styles.yearText, { color: colors.subtext }]}>{displayYear}</AppText>
              </View>
              <TouchableOpacity onPress={nextMonth} style={[styles.navBtn, { backgroundColor: colors.surfaceElevated }]} activeOpacity={0.7}>
                <Icon name={IconChevronRight} size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Weekday Headers */}
            <View style={styles.weekdayRow}>
              {WEEKDAYS.map((day) => (
                <View key={day} style={styles.weekdayCell}>
                  <AppText style={[styles.weekdayText, { color: colors.subtext }]}>{day}</AppText>
                </View>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.grid}>
              {emptyDays.map((_, i) => (
                <View key={`empty-${i}`} style={styles.dayCell} />
              ))}
              {daysArray.map((day) => {
                const selected = isSelected(day);
                const todayMark = isToday(day);
                return (
                  <TouchableOpacity
                    key={day}
                    onPress={() => handleDayPress(day)}
                    activeOpacity={0.7}
                    style={styles.dayCell}
                  >
                    {selected ? (
                      <View style={[styles.selectedDay, { backgroundColor: accentColor }]}>
                        <AppText bold style={[styles.selectedDayText, { color: '#FFFFFF' }]}>{day}</AppText>
                      </View>
                    ) : todayMark ? (
                      <View style={[styles.todayDay, { borderColor: accentColor }]}>
                        <AppText bold style={[styles.todayDayText, { color: accentColor }]}>{day}</AppText>
                      </View>
                    ) : (
                      <AppText style={[styles.dayText, { color: colors.text }]}>{day}</AppText>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Footer */}
            <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
              <TouchableOpacity onPress={goToToday} style={[styles.todayBtn, { backgroundColor: accentColor }]} activeOpacity={0.7}>
                <AppText bold style={[styles.todayBtnText, { color: '#FFFFFF' }]}>Today</AppText>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 0,
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthCenter: {
    alignItems: 'center',
  },
  monthText: {
    fontSize: 20,
  },
  yearText: {
    fontSize: 14,
    marginTop: 2,
  },
  weekdayRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  weekdayCell: {
    width: CELL_SIZE,
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  dayCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectedDay: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDayText: {
    fontSize: 16,
  },
  todayDay: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayDayText: {
    fontSize: 16,
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 8,
  },
  todayBtn: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayBtnText: {
    fontSize: 15,
    letterSpacing: 0.5,
  },
});
