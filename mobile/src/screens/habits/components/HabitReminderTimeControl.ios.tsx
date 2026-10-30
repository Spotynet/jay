import React from 'react';
import { StyleSheet } from 'react-native';
import { Host, DatePicker } from '@expo/ui/swift-ui';
import { datePickerStyle } from '@expo/ui/swift-ui/modifiers';

type Props = {
  value: Date;
  onChange: (date: Date) => void;
};

/**
 * Trailing native compact time control (SwiftUI DatePicker, hourAndMinute).
 * Updates the habit-editor draft only — persistence stays on Save.
 */
export function HabitReminderTimeControl({ value, onChange }: Props) {
  return (
    <Host matchContents style={styles.host} ignoreSafeArea="all">
      <DatePicker
        selection={value}
        displayedComponents={['hourAndMinute']}
        modifiers={[datePickerStyle('compact')]}
        onDateChange={onChange}
      />
    </Host>
  );
}

const styles = StyleSheet.create({
  host: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minHeight: 36,
  },
});
