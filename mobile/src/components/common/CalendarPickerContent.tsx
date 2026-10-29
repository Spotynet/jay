import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../ui/AppText';
import { ActionButton } from './ActionButton';
import { IconX } from 'tabler-icons-react-native';

/** Local calendar midnight — never UTC-serialize a day selection. */
export function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

type CalendarPickerContentProps = {
  selectedDate: Date;
  onSelect: (date: Date) => void;
  onClose: () => void;
};

/**
 * Header + native inline calendar. Intrinsic height only — no flex fill.
 * Used inside the fitToContents formSheet on iOS.
 */
export function CalendarPickerContent({
  selectedDate,
  onSelect,
  onClose,
}: CalendarPickerContentProps) {
  const { colors, accentColor, isDark } = useTheme();
  const [draft, setDraft] = useState(() => startOfLocalDay(selectedDate));
  const openedAtRef = useRef(0);
  const ignoreInitRef = useRef(true);

  useEffect(() => {
    setDraft(startOfLocalDay(selectedDate));
    openedAtRef.current = Date.now();
    ignoreInitRef.current = true;
    const t = setTimeout(() => {
      ignoreInitRef.current = false;
    }, 350);
    return () => clearTimeout(t);
  }, [selectedDate]);

  const commit = (date: Date) => {
    onSelect(startOfLocalDay(date));
  };

  const onChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (!date) return;
    const next = startOfLocalDay(date);
    setDraft(next);
    if (ignoreInitRef.current) return;
    if (Date.now() - openedAtRef.current < 300) return;
    commit(next);
  };

  return (
    <View
      style={[styles.root, { backgroundColor: colors.background }]}
      // Intrinsic size for formSheet fitToContents — do not flex:1.
      collapsable={false}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <ActionButton
          icon={IconX}
          onPress={onClose}
          size={36}
          variant="plain"
          accessibilityLabel="Close"
        />
        <AppText
          style={[styles.headerTitle, { color: colors.subtext }]}
          accessibilityRole="header"
        >
          Choose date
        </AppText>
        <TouchableOpacity
          onPress={() => commit(new Date())}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go to today"
          style={styles.todayHit}
        >
          <AppText style={[styles.todayAction, { color: accentColor }]}>Today</AppText>
        </TouchableOpacity>
      </View>

      <View style={styles.pickerWrap}>
        {Platform.OS === 'ios' ? (
          <DateTimePicker
            value={draft}
            mode="date"
            display="inline"
            onChange={onChange}
            themeVariant={isDark ? 'dark' : 'light'}
            accentColor={accentColor}
            style={styles.inlinePicker}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    // Content-height only. Safe-area bottom padding is supplied by the
    // formSheet fitToContents presentation (do not double-apply insets).
    paddingBottom: 14,
  },
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
  pickerWrap: {
    alignItems: 'center',
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  inlinePicker: {
    alignSelf: 'center',
  },
});
