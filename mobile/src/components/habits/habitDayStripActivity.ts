import type { HabitActivityDay, HabitActivityState } from '../../utils/habitRecentActivity';
import type { HabitDayIndicator, HabitDayStripItem } from './HabitDayStrip';

/**
 * Map domain history state → strip indicator.
 * Does not flatten history into a boolean — each state keeps a distinct visual cue.
 */
export function activityStateToIndicator(state: HabitActivityState): HabitDayIndicator {
  switch (state) {
    case 'completed':
      return 'check';
    case 'missed':
      return 'dot';
    case 'open_today':
      return 'open';
    case 'unscheduled':
    case 'before_start':
      return 'dash';
    case 'future':
      return 'future';
    case 'unknown':
      return 'unknown';
    default:
      return 'unknown';
  }
}

export function mapActivityDayToStripItem(
  day: HabitActivityDay,
  onExplain?: (day: HabitActivityDay) => void,
): HabitDayStripItem {
  return {
    key: day.date,
    label: day.dayLabel,
    indicator: activityStateToIndicator(day.state),
    accessibilityLabel: day.accessibilityLabel,
    accessibilityHint: onExplain ? 'Shows day status' : undefined,
    onPress: onExplain ? () => onExplain(day) : undefined,
  };
}
