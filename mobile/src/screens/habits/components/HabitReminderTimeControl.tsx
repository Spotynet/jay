import React, { useState } from 'react';
import { Pressable, StyleSheet, Platform } from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useTheme } from '../../../context/ThemeContext';
import { AppText } from '../../../components/ui/AppText';
import AppDatePicker from '../../../components/common/AppDatePicker';

type Props = {
  value: Date;
  onChange: (date: Date) => void;
};

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

/**
 * Non-iOS reminder time control.
 * Android: system dialog via community DateTimePicker.
 * Web: existing AppDatePicker time mode.
 * Draft-only — persistence stays on Save.
 */
export function HabitReminderTimeControl({ value, onChange }: Props) {
  const { entityColors, isDark } = useTheme();
  const [open, setOpen] = useState(false);

  if (Platform.OS === 'android') {
    return (
      <>
        <Pressable
          onPress={() => setOpen(true)}
          style={({ pressed }) => [styles.hit, pressed && { opacity: 0.65 }]}
          accessibilityRole="button"
          accessibilityLabel={`Reminder time, ${formatTime(value)}`}
        >
          <AppText style={[styles.value, { color: entityColors.habits }]}>
            {formatTime(value)}
          </AppText>
        </Pressable>
        {open ? (
          <DateTimePicker
            value={value}
            mode="time"
            display="default"
            onChange={(event: DateTimePickerEvent, date?: Date) => {
              setOpen(false);
              if (event.type === 'set' && date) onChange(date);
            }}
            themeVariant={isDark ? 'dark' : 'light'}
          />
        ) : null}
      </>
    );
  }

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.hit, pressed && { opacity: 0.65 }]}
        accessibilityRole="button"
        accessibilityLabel={`Reminder time, ${formatTime(value)}`}
      >
        <AppText style={[styles.value, { color: entityColors.habits }]}>
          {formatTime(value)}
        </AppText>
      </Pressable>
      <AppDatePicker
        visible={open}
        onClose={() => setOpen(false)}
        value={value}
        onChange={onChange}
        mode="time"
        label="Reminder Time"
      />
    </>
  );
}

const styles = StyleSheet.create({
  hit: {
    minHeight: 44,
    justifyContent: 'center',
    paddingVertical: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
});
