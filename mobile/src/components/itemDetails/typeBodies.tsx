import React from 'react';
import { View } from 'react-native';
import { IconMapPin } from 'tabler-icons-react-native';
import { useTheme } from '../../context/ThemeContext';
import { DetailSection, DetailMetaRow, DetailRow } from './DetailRows';
import { HabitRecentActivity } from './HabitRecentActivity';
import { AppText } from '../ui/AppText';
import {
  buildEventScheduleDisplay,
  formatClockTime,
  formatDuration,
  formatFriendlyDate,
  formatHabitGoal,
  formatRepeatDays,
  nonemptyText,
} from '../../utils/itemDetailsFormat';

function NotesBlock({ text }: { text: string }) {
  const { colors } = useTheme();
  return (
    <DetailSection title="Notes">
      <View style={{ paddingHorizontal: 14, paddingVertical: 14 }}>
        <AppText style={{ fontSize: 15, lineHeight: 22, color: colors.text }}>
          {text}
        </AppText>
      </View>
    </DetailSection>
  );
}

/**
 * Habit supporting sections (Recent activity + Schedule + Notes).
 * Identity, occurrence, and primary action live in the custom `lead` on ItemDetailsScreen.
 */
export function HabitDetailsBody({
  habit,
  occurrenceDate,
  historyUnavailable,
}: {
  habit: any;
  occurrenceDate?: string;
  historyUnavailable?: boolean;
}) {
  const days: number[] = Array.isArray(habit?.days_of_week) ? habit.days_of_week : [];
  const clock = formatClockTime(habit?.reminder_time);
  const repeat = formatRepeatDays(days);
  const reminderEnabled = !!habit?.reminder_time;

  return (
    <View style={{ alignSelf: 'stretch', width: '100%' }}>
      {occurrenceDate ? (
        <HabitRecentActivity
          habit={habit}
          occurrenceDate={occurrenceDate}
          historyUnavailable={historyUnavailable}
        />
      ) : null}

      <DetailSection title="Schedule">
        <DetailMetaRow label="Time" value={clock || 'Anytime'} />
        <DetailMetaRow label="Repeats" value={repeat} />
        <DetailMetaRow
          label="Reminder"
          value={reminderEnabled && clock ? `Enabled · ${clock}` : 'Off'}
          isLast
        />
      </DetailSection>

      {habit?.description ? <NotesBlock text={String(habit.description)} /> : null}
    </View>
  );
}

/** @deprecated Prefer formatHabitGoal at call sites; kept for callers. */
export function habitGoalLabel(habit: any): string | null {
  if (!habit?.has_target) return null;
  return formatHabitGoal(habit);
}

/**
 * Task metadata only. Due date and scheduled time stay separate fields.
 * Omit rows/sections when the value is absent — never invent midnight.
 */
export function TaskDetailsBody({
  task,
  projectName,
}: {
  task: any;
  projectName?: string;
  /** Kept for callers; occurrence belongs in the primary-action region. */
  occurrenceDate?: string;
}) {
  const dueDate = formatFriendlyDate(task?.due_date);
  const dueTime = formatClockTime(task?.due_time);
  const duration = formatDuration(task?.duration);

  const scheduleRows: { label: string; value: string }[] = [];
  if (dueDate) scheduleRows.push({ label: 'Due date', value: dueDate });
  if (dueTime) scheduleRows.push({ label: 'Time', value: dueTime });
  if (duration) scheduleRows.push({ label: 'Duration', value: duration });

  return (
    <View>
      {scheduleRows.length > 0 ? (
        <DetailSection title="Schedule">
          {scheduleRows.map((row, index) => (
            <DetailMetaRow
              key={row.label}
              label={row.label}
              value={row.value}
              isLast={index === scheduleRows.length - 1}
            />
          ))}
        </DetailSection>
      ) : null}

      {projectName ? (
        <DetailSection title="Project">
          <DetailMetaRow label="Project" value={projectName} isLast />
        </DetailSection>
      ) : null}

      {task?.description ? <NotesBlock text={String(task.description)} /> : null}
    </View>
  );
}

/**
 * Event metadata. No completion action — events are not completable.
 * Schedule uses date + start_time + duration (end derived, read-only).
 * Empty location/notes are omitted (no filler rows).
 */
export function EventDetailsBody({ event }: { event: any }) {
  const schedule = buildEventScheduleDisplay(event);
  const location = nonemptyText(event?.location);
  const notes = nonemptyText(event?.description);

  const scheduleRows: { label: string; value: string }[] = [];
  if (schedule.dateLabel) scheduleRows.push({ label: 'Date', value: schedule.dateLabel });
  if (schedule.startLabel) scheduleRows.push({ label: 'Start', value: schedule.startLabel });
  if (schedule.endLabel) scheduleRows.push({ label: 'End', value: schedule.endLabel });
  if (schedule.durationLabel) {
    scheduleRows.push({ label: 'Duration', value: schedule.durationLabel });
  }

  return (
    <View style={{ alignSelf: 'stretch', width: '100%' }}>
      {scheduleRows.length > 0 ? (
        <DetailSection title="Schedule">
          {scheduleRows.map((row, index) => (
            <DetailMetaRow
              key={row.label}
              label={row.label}
              value={row.value}
              isLast={index === scheduleRows.length - 1}
            />
          ))}
        </DetailSection>
      ) : null}

      {location ? (
        <DetailSection title="Location">
          <DetailRow icon={IconMapPin} value={location} isLast />
        </DetailSection>
      ) : null}

      {notes ? <NotesBlock text={notes} /> : null}
    </View>
  );
}
