export interface JournalSettings {
  reminder_enabled: boolean;
  reminder_time: string | null; // "HH:MM:SS"
  repeat_mode: 'every_day' | 'selected_days';
  days_of_week: number[]; // 0=Mon...6=Sun
}

export interface JournalEntry {
  id: number;
  date: string;
}

export type TimelineState = 'none' | 'placeholder' | 'completed';

export interface JournalTimelineResult {
  mode: 'manual' | 'scheduled';
  shouldAppearInTimeline: boolean;
  scheduledTime: string | null;
  matchedByRepeatRule: boolean;
  entryExists: boolean;
  timelineState: TimelineState;
}

export const formatReminderSummary = (settings: JournalSettings): string => {
  if (!settings.reminder_enabled) return 'Manual only';
  
  const time = settings.reminder_time ? settings.reminder_time.substring(0, 5) : '00:00';
  
  if (settings.repeat_mode === 'every_day') {
    return `${time} · Every day`;
  }
  
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayLabels = settings.days_of_week
    .sort((a, b) => a - b)
    .map(d => days[d])
    .join(', ');
    
  return `${time} · ${dayLabels}`;
};

/**
 * Computes the Journal timeline visibility and state for a specific date.
 */
export const getJournalTimelineState = (
  date: Date,
  settings: JournalSettings,
  existingEntry: JournalEntry | null
): JournalTimelineResult => {
  const mode = settings.reminder_enabled ? 'scheduled' : 'manual';
  
  if (mode === 'manual') {
    return {
      mode,
      shouldAppearInTimeline: false,
      scheduledTime: null,
      matchedByRepeatRule: false,
      entryExists: !!existingEntry,
      timelineState: 'none',
    };
  }

  // Scheduled mode
  const dayOfWeek = date.getDay() === 0 ? 6 : date.getDay() - 1; // Convert 0(Sun)-6(Sat) to 0(Mon)-6(Sun)
  
  const matchedByRepeatRule = 
    settings.repeat_mode === 'every_day' || 
    settings.days_of_week.includes(dayOfWeek);

  if (!matchedByRepeatRule) {
    return {
      mode,
      shouldAppearInTimeline: false,
      scheduledTime: null,
      matchedByRepeatRule: false,
      entryExists: !!existingEntry,
      timelineState: 'none',
    };
  }

  const entryExists = !!existingEntry;
  const timelineState: TimelineState = entryExists ? 'completed' : 'placeholder';

  return {
    mode,
    shouldAppearInTimeline: true,
    scheduledTime: settings.reminder_time,
    matchedByRepeatRule: true,
    entryExists,
    timelineState,
  };
};
