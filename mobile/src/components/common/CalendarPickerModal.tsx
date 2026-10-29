import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../ui/AppText';
import { ActionButton } from './ActionButton';
import { IconX } from 'tabler-icons-react-native';
import { toLocalDateString } from '../../utils/date';
import { startOfLocalDay } from './CalendarPickerContent';

interface CalendarPickerModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: Date;
  onSelect: (date: Date) => void;
}

/**
 * Today / Journal day navigator.
 *
 * iOS: native-stack `formSheet` + `sheetAllowedDetents: 'fitToContents'`
 *      (CalendarPickerScreen) — content-height sheet, not pageSheet fill.
 * Android: system date dialog.
 * Web: restrained custom grid fallback.
 */
export default function CalendarPickerModal({
  visible,
  onClose,
  selectedDate,
  onSelect,
}: CalendarPickerModalProps) {
  if (Platform.OS === 'android') {
    return (
      <AndroidDateDialog
        visible={visible}
        selectedDate={selectedDate}
        onSelect={onSelect}
        onClose={onClose}
      />
    );
  }

  if (Platform.OS === 'ios') {
    return (
      <IOSCalendarStackBridge
        visible={visible}
        selectedDate={selectedDate}
        onSelect={onSelect}
        onClose={onClose}
      />
    );
  }

  return (
    <WebCalendarSheet
      visible={visible}
      selectedDate={selectedDate}
      onSelect={onSelect}
      onClose={onClose}
    />
  );
}

/** Opens the content-fitting CalendarPicker stack screen while `visible`. */
function IOSCalendarStackBridge({
  visible,
  selectedDate,
  onSelect,
  onClose,
}: CalendarPickerModalProps) {
  const navigation = useNavigation<any>();
  const openedRef = useRef(false);
  const onSelectRef = useRef(onSelect);
  const onCloseRef = useRef(onClose);
  onSelectRef.current = onSelect;
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!visible) {
      openedRef.current = false;
      return;
    }
    if (openedRef.current) return;
    openedRef.current = true;

    navigation.navigate('CalendarPicker', {
      selectedDateMs: startOfLocalDay(selectedDate).getTime(),
      onPicked: (ms: number) => {
        onSelectRef.current(startOfLocalDay(new Date(ms)));
        onCloseRef.current();
      },
      onDismiss: () => {
        onCloseRef.current();
      },
    });
  }, [visible, selectedDate, navigation]);

  return null;
}

function AndroidDateDialog({
  visible,
  selectedDate,
  onSelect,
  onClose,
}: CalendarPickerModalProps) {
  if (!visible) return null;

  const onChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === 'dismissed') {
      onClose();
      return;
    }
    if (event.type === 'set' && date) {
      onSelect(startOfLocalDay(date));
      onClose();
    }
  };

  return (
    <DateTimePicker
      value={startOfLocalDay(selectedDate)}
      mode="date"
      display="calendar"
      onChange={onChange}
    />
  );
}

/** Web-only fallback — not claimed as native. Compact chrome. */
function WebCalendarSheet({
  visible,
  selectedDate,
  onSelect,
  onClose,
}: CalendarPickerModalProps) {
  const { colors, accentColor } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const [cursor, setCursor] = useState(() => startOfLocalDay(selectedDate));

  useEffect(() => {
    if (visible) setCursor(startOfLocalDay(selectedDate));
  }, [visible, selectedDate]);

  if (!visible) return null;

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay();
  const todayStr = toLocalDateString(new Date());
  const selectedStr = toLocalDateString(selectedDate);
  const sheetWidth = Math.min(windowWidth, 400);

  const monthLabel = cursor.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  const commitDay = (day: number) => {
    onSelect(new Date(year, month, day));
    onClose();
  };

  const shiftMonth = (delta: number) => {
    setCursor(new Date(year, month + delta, 1));
  };

  const cells: (number | null)[] = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.webOverlay} onPress={onClose}>
        <Pressable
          style={[
            styles.webSheet,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              width: sheetWidth,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <ActionButton
              icon={IconX}
              onPress={onClose}
              size={36}
              variant="plain"
              accessibilityLabel="Close"
            />
            <AppText style={[styles.headerTitle, { color: colors.subtext }]}>
              Choose date
            </AppText>
            <TouchableOpacity
              onPress={() => {
                onSelect(startOfLocalDay(new Date()));
                onClose();
              }}
              accessibilityRole="button"
              accessibilityLabel="Go to today"
              style={styles.todayHit}
            >
              <AppText style={[styles.todayAction, { color: accentColor }]}>Today</AppText>
            </TouchableOpacity>
          </View>

          <View style={styles.webMonthRow}>
            <TouchableOpacity onPress={() => shiftMonth(-1)} accessibilityLabel="Previous month">
              <AppText style={{ color: accentColor, fontSize: 15 }}>Prev</AppText>
            </TouchableOpacity>
            <AppText style={{ color: colors.text, fontWeight: '600' }}>{monthLabel}</AppText>
            <TouchableOpacity onPress={() => shiftMonth(1)} accessibilityLabel="Next month">
              <AppText style={{ color: accentColor, fontSize: 15 }}>Next</AppText>
            </TouchableOpacity>
          </View>

          <View style={styles.webGrid}>
            {cells.map((day, idx) => {
              if (day == null) {
                return <View key={`e-${idx}`} style={styles.webCell} />;
              }
              const date = new Date(year, month, day);
              const key = toLocalDateString(date);
              const selected = key === selectedStr;
              const isToday = key === todayStr;
              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.webCell,
                    selected && { backgroundColor: accentColor, borderRadius: 10 },
                    !selected &&
                      isToday && {
                        borderColor: accentColor,
                        borderWidth: 1,
                        borderRadius: 10,
                      },
                  ]}
                  onPress={() => commitDay(day)}
                >
                  <AppText
                    style={{
                      color: selected ? '#fff' : colors.text,
                      fontWeight: selected || isToday ? '600' : '400',
                    }}
                  >
                    {day}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  todayHit: {
    minWidth: 56,
    minHeight: 36,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  todayAction: {
    fontSize: 16,
    fontWeight: '600',
  },
  webOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  webSheet: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    maxWidth: '100%',
  },
  webMonthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  webGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  webCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
