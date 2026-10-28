import React from 'react';
import { View } from 'react-native';
import {
  IconClock,
  IconRepeat,
  IconBell,
  IconMapPin,
  IconCalendar,
  IconHourglass,
  IconNotes,
  IconFolder,
} from 'tabler-icons-react-native';
import { useTheme } from '../../context/ThemeContext';
import { DetailSection, DetailRow, ReadOnlyDays } from './DetailRows';
import {
  formatClockTime,
  formatDuration,
  formatFriendlyDate,
  formatHabitGoal,
  formatRepeatDays,
} from '../../utils/itemDetailsFormat';

export function HabitDetailsBody({
  habit,
  occurrenceDate,
}: {
  habit: any;
  occurrenceDate?: string;
}) {
  const { colors, entityColors } = useTheme();
  const accent = entityColors.habits;
  const days: number[] = Array.isArray(habit?.days_of_week) ? habit.days_of_week : [];
  const scheduleTime = formatClockTime(habit?.reminder_time);
  const repeat = formatRepeatDays(days);
  const goal = formatHabitGoal(habit);
  const reminderEnabled = !!habit?.reminder_time;

  return (
    <View>
      <DetailSection title="Schedule">
        {occurrenceDate ? (
          <DetailRow
            icon={IconCalendar}
            iconColor={accent}
            label="Occurrence"
            value={formatFriendlyDate(occurrenceDate) || occurrenceDate}
          />
        ) : null}
        <DetailRow
          icon={IconClock}
          iconColor={accent}
          label="Timeline time"
          value={scheduleTime || 'No scheduled time'}
        />
        <DetailRow
          icon={IconRepeat}
          iconColor={accent}
          label="Repeats"
          value={repeat}
          isLast
        />
        {days.length > 0 ? (
          <ReadOnlyDays
            selected={days}
            accentColor={accent}
            accessibilitySummary={`Repeats ${repeat}`}
          />
        ) : null}
      </DetailSection>

      <DetailSection title="Daily goal">
        <DetailRow value={goal} isLast />
      </DetailSection>

      <DetailSection title="Reminder">
        <DetailRow
          icon={IconBell}
          iconColor={accent}
          value={
            reminderEnabled && scheduleTime ? `Enabled · ${scheduleTime}` : 'No reminder'
          }
          isLast
        />
      </DetailSection>

      {habit?.description ? (
        <DetailSection title="Notes">
          <DetailRow
            icon={IconNotes}
            iconColor={colors.subtext}
            value={String(habit.description)}
            isLast
          />
        </DetailSection>
      ) : null}
    </View>
  );
}

export function TaskDetailsBody({
  task,
  projectName,
  occurrenceDate,
}: {
  task: any;
  projectName?: string;
  occurrenceDate?: string;
}) {
  const { entityColors } = useTheme();
  const accent = entityColors.tasks;
  const dueDate = formatFriendlyDate(task?.due_date || occurrenceDate);
  const dueTime = formatClockTime(task?.due_time);
  const duration = formatDuration(task?.duration);
  const status =
    task?.status === 'COMPLETED'
      ? 'Completed'
      : task?.status === 'PENDING'
        ? 'Pending'
        : task?.status
          ? String(task.status)
          : 'Pending';

  return (
    <View>
      <DetailSection title="Schedule">
        <DetailRow
          icon={IconCalendar}
          iconColor={accent}
          label="Due date"
          value={dueDate || 'Unscheduled'}
        />
        <DetailRow
          icon={IconClock}
          iconColor={accent}
          label="Time"
          value={dueTime || 'No time'}
          isLast={!duration}
        />
        {duration ? (
          <DetailRow
            icon={IconHourglass}
            iconColor={accent}
            label="Duration"
            value={duration}
            isLast
          />
        ) : null}
      </DetailSection>

      <DetailSection title="Status">
        <DetailRow value={status} isLast />
      </DetailSection>

      {projectName ? (
        <DetailSection title="Project">
          <DetailRow icon={IconFolder} iconColor={accent} value={projectName} isLast />
        </DetailSection>
      ) : null}

      {task?.description ? (
        <DetailSection title="Notes">
          <DetailRow icon={IconNotes} value={String(task.description)} isLast />
        </DetailSection>
      ) : null}
    </View>
  );
}

export function EventDetailsBody({ event }: { event: any }) {
  const { entityColors } = useTheme();
  const accent = entityColors.events;
  const date = formatFriendlyDate(event?.date);
  const start = formatClockTime(event?.start_time);
  const duration = formatDuration(event?.duration);

  return (
    <View>
      <DetailSection title="When">
        <DetailRow icon={IconCalendar} iconColor={accent} label="Date" value={date || 'No date'} />
        <DetailRow
          icon={IconClock}
          iconColor={accent}
          label="Start"
          value={start || 'No start time'}
          isLast={!duration}
        />
        {duration ? (
          <DetailRow
            icon={IconHourglass}
            iconColor={accent}
            label="Duration"
            value={duration}
            isLast
          />
        ) : null}
      </DetailSection>

      {event?.location ? (
        <DetailSection title="Location">
          <DetailRow icon={IconMapPin} iconColor={accent} value={String(event.location)} isLast />
        </DetailSection>
      ) : null}

      {event?.description ? (
        <DetailSection title="Notes">
          <DetailRow icon={IconNotes} value={String(event.description)} isLast />
        </DetailSection>
      ) : null}
    </View>
  );
}
