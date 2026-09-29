import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const PREFIX = 'journal-checkin';

export type JournalReminderSettings = {
  reminder_enabled?: boolean;
  reminder_time?: string | null;
  repeat_mode?: string;
  days_of_week?: number[];
};

function hourMinute(reminderTime?: string | null) {
  const [hourText, minuteText] = String(reminderTime || '20:00').split(':');
  const hour = Number(hourText);
  const minute = Number(minuteText);
  return {
    hour: Number.isFinite(hour) ? hour : 20,
    minute: Number.isFinite(minute) ? minute : 0,
  };
}

/** Settings use 0 = Monday … 6 = Sunday. Expo weekly triggers use 1 = Sunday … 7 = Saturday. */
function expoWeekday(index: number) {
  return index === 6 ? 1 : index + 2;
}

async function cancelJournalReminders() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((item) => item.identifier.startsWith(PREFIX))
      .map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier))
  );
}

export async function syncJournalReminder(settings: JournalReminderSettings | null | undefined) {
  if (Platform.OS === 'web') return 'off' as const;

  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
    await cancelJournalReminders();
    if (!settings?.reminder_enabled) return 'off' as const;

    const permission = await Notifications.requestPermissionsAsync();
    if (permission.status !== 'granted') return 'denied' as const;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('journal', {
        name: 'Journal',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const { hour, minute } = hourMinute(settings.reminder_time);
    const content = {
      title: 'Journal',
      body: 'Time to check in on your day.',
      data: { type: 'journal' },
      sound: false,
    };

    if (settings.repeat_mode === 'selected_days') {
      const days = Array.isArray(settings.days_of_week) ? settings.days_of_week : [];
      await Promise.all(days.map((day) => Notifications.scheduleNotificationAsync({
        identifier: `${PREFIX}-${day}`,
        content,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: expoWeekday(day),
          hour,
          minute,
          channelId: 'journal',
        },
      })));
      return 'scheduled' as const;
    }

    await Notifications.scheduleNotificationAsync({
      identifier: PREFIX,
      content,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        channelId: 'journal',
      },
    });
    return 'scheduled' as const;
  } catch {
    return 'off' as const;
  }
}
