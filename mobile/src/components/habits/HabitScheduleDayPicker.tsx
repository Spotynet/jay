import React, { useMemo } from 'react';
import { HabitDayStrip, type HabitDayStripItem } from './HabitDayStrip';
import { isWeekdaySelected } from './habitWeekdaySelection';

const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
const DAY_FULL = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

type HabitScheduleDayPickerProps = {
  selectedDays: number[];
  onToggleDay: (dayIndex: number) => void;
  disabled?: boolean;
  /** Habit accent (entity color). */
  accent: string;
};

/**
 * Maps draft recurrence selection → HabitDayStrip (schedule mode).
 * Selected = check; unselected = empty. No history dash/dot semantics.
 */
export function HabitScheduleDayPicker({
  selectedDays,
  onToggleDay,
  disabled = false,
  accent,
}: HabitScheduleDayPickerProps) {
  const days: HabitDayStripItem[] = useMemo(
    () =>
      DAY_SHORT.map((label, idx) => {
        const selected = isWeekdaySelected(selectedDays, idx);
        return {
          key: label,
          label,
          indicator: selected ? 'check' : 'empty',
          onPress: () => onToggleDay(idx),
          disabled,
          accessibilityLabel: `${DAY_FULL[idx]}${selected ? ', selected' : ', not selected'}`,
          accessibilityState: { selected, disabled },
        };
      }),
    [selectedDays, onToggleDay, disabled],
  );

  return <HabitDayStrip mode="schedule" days={days} accent={accent} />;
}
