import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../ui/AppText';
import { Icon } from '../ui/Icon';
import { IconChevronLeft, IconChevronRight } from 'tabler-icons-react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const SHEET_MAX_WIDTH = 480;
const GRID_PADDING = 12;
const WEEKDAY_BLOCK = 32;
// Handle, month navigation, and footer stay outside the scrolling grid.
const SHEET_CHROME = 188;

interface CalendarPickerModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: Date;
  onSelect: (date: Date) => void;
}

export default function CalendarPickerModal({ visible, onClose, selectedDate, onSelect }: CalendarPickerModalProps) {
  const { colors, accentColor } = useTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const today = new Date();
  const [displayMonth, setDisplayMonth] = useState(selectedDate.getMonth());
  const [displayYear, setDisplayYear] = useState(selectedDate.getFullYear());
  const [gridWidth, setGridWidth] = useState(0);

  useEffect(() => {
    if (visible) {
      setDisplayMonth(selectedDate.getMonth());
      setDisplayYear(selectedDate.getFullYear());
    }
  }, [visible, selectedDate]);

  const fallbackGridWidth = Math.min(windowWidth, SHEET_MAX_WIDTH) - GRID_PADDING * 2;
  const measuredWidth = gridWidth > 0 ? gridWidth : fallbackGridWidth;
  const cellSize = Math.max(1, Math.floor(measuredWidth / 7));
  const markerSize = Math.max(28, Math.min(42, cellSize - 6));
  const markerRadius = Math.round(markerSize * (14 / 42));

  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(displayYear, displayMonth, 1).getDay();
  const rowCount = Math.ceil((firstDayOfWeek + daysInMonth) / 7);
  const gridBlockHeight = WEEKDAY_BLOCK + rowCount * cellSize;
  const scrollMaxHeight = Math.max(96, Math.floor(windowHeight * 0.85 - SHEET_CHROME));
  const scrollHeight = Math.min(gridBlockHeight, scrollMaxHeight);
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

  const cellStyle = { width: cellSize, height: cellSize, flexShrink: 0 as const };
  const markerStyle = { width: markerSize, height: markerSize, borderRadius: markerRadius };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} onStartShouldSetResponder={() => true} onMoveShouldSetResponder={() => true}>
        <Pressable style={styles.sheetHost}>
          <Animated.View
            entering={FadeInDown.duration(300).springify()}
            exiting={FadeOut.duration(200)}
            style={[styles.container, { backgroundColor: colors.surface }]}
          >
            <View style={[styles.handle, { backgroundColor: colors.border }]} />

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

            <ScrollView
              style={[styles.scroll, { height: scrollHeight }]}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <View style={styles.gridPad}>
                <View
                  style={styles.gridMeasure}
                  onLayout={(event) => {
                    const next = Math.floor(event.nativeEvent.layout.width);
                    setGridWidth((prev) => (prev === next ? prev : next));
                  }}
                >
                  <View style={styles.weekdayRow}>
                    {WEEKDAYS.map((day) => (
                      <View key={day} style={[styles.weekdayCell, { width: cellSize }]}>
                        <AppText style={[styles.weekdayText, { color: colors.subtext }]}>{day}</AppText>
                      </View>
                    ))}
                  </View>

                  <View style={[styles.grid, { height: rowCount * cellSize, width: cellSize * 7 }]}>
                    {emptyDays.map((_, i) => (
                      <View key={`empty-${i}`} style={cellStyle} />
                    ))}
                    {daysArray.map((day) => {
                      const selected = isSelected(day);
                      const todayMark = isToday(day);
                      return (
                        <TouchableOpacity
                          key={day}
                          onPress={() => handleDayPress(day)}
                          activeOpacity={0.7}
                          style={[styles.dayCell, cellStyle]}
                        >
                          {selected ? (
                            <View style={[styles.marker, markerStyle, { backgroundColor: accentColor }]}>
                              <AppText bold style={[styles.selectedDayText, { color: '#FFFFFF' }]}>{day}</AppText>
                            </View>
                          ) : todayMark ? (
                            <View style={[styles.marker, styles.todayDay, markerStyle, { borderColor: accentColor }]}>
                              <AppText bold style={[styles.todayDayText, { color: accentColor }]}>{day}</AppText>
                            </View>
                          ) : (
                            <AppText style={[styles.dayText, { color: colors.text }]}>{day}</AppText>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </View>
            </ScrollView>

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
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  sheetHost: {
    width: '100%',
    maxWidth: SHEET_MAX_WIDTH,
    alignSelf: 'center',
  },
  container: {
    width: '100%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 0,
    overflow: 'hidden',
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
  scroll: {
    flexGrow: 0,
    flexShrink: 0,
    width: '100%',
  },
  scrollContent: {
    width: '100%',
  },
  gridPad: {
    width: '100%',
    paddingHorizontal: GRID_PADDING,
  },
  gridMeasure: {
    width: '100%',
  },
  weekdayRow: {
    flexDirection: 'row',
    height: 24,
    marginBottom: 8,
  },
  weekdayCell: {
    flexShrink: 0,
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
  },
  dayCell: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
  },
  marker: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDayText: {
    fontSize: 16,
  },
  todayDay: {
    borderWidth: 2,
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
