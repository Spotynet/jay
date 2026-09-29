import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { IconChevronLeft, IconBell, IconCheck, IconChevronRight, IconList } from 'tabler-icons-react-native';
import { AppText } from '../../components/ui/AppText';
import { Icon } from '../../components/ui/Icon';
import { AppTimePicker } from '../../components/common/AppTimePicker';
import { getJournalSettings, updateJournalSettings } from '../../api/journal';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { syncJournalReminder } from '../../utils/journalReminder';

const DEFAULT_SETTINGS = {
  reminder_enabled: false,
  reminder_time: '20:00:00',
  repeat_mode: 'every_day',
  days_of_week: [],
};

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function JournalSettingsScreen() {
  const { colors, entityColors } = useTheme();
  const navigation = useNavigation<any>();
  const journalColor = entityColors.journal;

  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await getJournalSettings();
      setSettings(data);
      setError(null);
    } catch (e) {
      console.error(e);
      setError("Couldn't load journal settings.");
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (updates: any) => {
    const current = settings || DEFAULT_SETTINGS;
    const next = { ...current, ...updates };
    if (next.reminder_time && !next.reminder_time.includes(':00')) {
      const parts = next.reminder_time.split(':');
      next.reminder_time = `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:00`;
    }
    setSettings(next);
    setError(null);
    try {
      await updateJournalSettings(next);
      const scheduled = await syncJournalReminder(next);
      if (next.reminder_enabled && scheduled === 'denied') {
        setError('Allow notifications to get the journal reminder.');
      }
    } catch (e) {
      console.error(e);
      setError("Couldn't update journal settings.");
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator style={{ marginTop: 80 }} color={journalColor} />
      </View>
    );
  }

  const s = settings || DEFAULT_SETTINGS;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.surface }]}>
          <Icon name={IconChevronLeft} size={20} color={colors.text} />
        </TouchableOpacity>
        <AppText style={[styles.headerTitle, { color: colors.text }]}>JOURNAL SETTINGS</AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ErrorMessage message={error} />
        {/* Reminder Section */}
        <View style={styles.section}>
          <View style={styles.sectionLabelRow}>
            <View style={[styles.sectionDot, { backgroundColor: journalColor }]} />
            <AppText style={[styles.sectionLabel, { color: colors.subtext }]}>REMINDER</AppText>
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            {/* Toggle Row */}
            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <View style={[styles.iconWrap, { backgroundColor: journalColor + '15' }]}>
                  <Icon name={IconBell} size={18} color={journalColor} />
                </View>
                <View style={styles.toggleInfo}>
                  <AppText style={[styles.toggleLabel, { color: colors.text }]}>Daily Reminder</AppText>
                  <AppText style={[styles.toggleSummary, { color: s.reminder_enabled ? colors.subtext : colors.subtext + '80' }]}>
                    {s.reminder_enabled ? formatTime(s.reminder_time) : 'Off'}
                  </AppText>
                </View>
              </View>
              <Switch
                value={s.reminder_enabled}
                onValueChange={(val) => saveSettings({ reminder_enabled: val })}
                trackColor={{ true: journalColor, false: colors.border }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={colors.border}
              />
            </View>

            {s.reminder_enabled && (
              <>
                <View style={[styles.divider, { backgroundColor: 'rgba(255,255,255,0.04)' }]} />

                {/* Time Picker */}
                <TouchableOpacity style={styles.timeRow} onPress={() => setShowTimePicker(true)}>
                  <AppText style={[styles.timeLabel, { color: colors.text }]}>Time</AppText>
                  <AppText style={[styles.timeValue, { color: journalColor }]}>
                    {s.reminder_time.substring(0, 5)}
                  </AppText>
                </TouchableOpacity>

                <View style={[styles.divider, { backgroundColor: 'rgba(255,255,255,0.04)' }]} />

                {/* Repeat Mode */}
                <View style={styles.repeatRow}>
                  <TouchableOpacity
                    style={[styles.repeatBtn, s.repeat_mode === 'every_day' && { backgroundColor: journalColor + '18' }]}
                    onPress={() => saveSettings({ repeat_mode: 'every_day' })}
                  >
                    <AppText style={[styles.repeatText, { color: s.repeat_mode === 'every_day' ? journalColor : colors.subtext }]}>
                      Every day
                    </AppText>
                    {s.repeat_mode === 'every_day' && (
                      <Icon name={IconCheck} size={14} color={journalColor} />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.repeatBtn, s.repeat_mode === 'selected_days' && { backgroundColor: journalColor + '18' }]}
                    onPress={() => saveSettings({ repeat_mode: 'selected_days' })}
                  >
                    <AppText style={[styles.repeatText, { color: s.repeat_mode === 'selected_days' ? journalColor : colors.subtext }]}>
                      Select days
                    </AppText>
                    {s.repeat_mode === 'selected_days' && (
                      <Icon name={IconCheck} size={14} color={journalColor} />
                    )}
                  </TouchableOpacity>
                </View>

                {s.repeat_mode === 'selected_days' && (
                  <>
                    <View style={[styles.divider, { backgroundColor: 'rgba(255,255,255,0.04)' }]} />
                    <View style={styles.dayRow}>
                      {DAYS.map((day, idx) => {
                        const active = (s.days_of_week || []).includes(idx);
                        return (
                          <TouchableOpacity
                            key={idx}
                            onPress={() => {
                              const current = s.days_of_week || [];
                              const next = active ? current.filter((d: number) => d !== idx) : [...current, idx];
                              saveSettings({ days_of_week: next });
                            }}
                            style={[styles.dayCell, active && { backgroundColor: journalColor }]}
                          >
                            <AppText style={[styles.dayText, { color: active ? '#fff' : colors.subtext }]}>{day}</AppText>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </>
                )}
              </>
            )}
          </View>
        </View>

        {/* Hint */}
        <AppText style={[styles.hint, { color: colors.subtext }]}>
          {s.reminder_enabled
            ? 'You\'ll receive a reminder at the scheduled time to write in your journal.'
            : 'Journal is in manual mode. Open the Journal tab anytime to log your day.'}
        </AppText>

        {/* Habits Section */}
        <View style={styles.section}>
          <View style={styles.sectionLabelRow}>
            <View style={[styles.sectionDot, { backgroundColor: entityColors.habits }]} />
            <AppText style={[styles.sectionLabel, { color: colors.subtext }]}>HABITS</AppText>
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => navigation.navigate('HabitsSettings')}
              activeOpacity={0.6}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.iconWrap, { backgroundColor: entityColors.habits + '15' }]}>
                  <Icon name={IconList} size={18} color={entityColors.habits} />
                </View>
                <AppText style={[styles.menuLabel, { color: colors.text }]}>Manage Habits</AppText>
              </View>
              <Icon name={IconChevronRight} size={18} color={colors.subtext} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <AppTimePicker
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        value={new Date('1970-01-01T' + (s.reminder_time || '20:00:00'))}
        onChange={(date) => {
          const timeStr = date.getHours().toString().padStart(2, '0') + ':' +
                          date.getMinutes().toString().padStart(2, '0') + ':00';
          saveSettings({ reminder_time: timeStr });
        }}
        label="Reminder Time"
      />
    </View>
  );
}

function formatTime(time: string) {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 4,
  },
  scrollContent: {
    paddingHorizontal: 24,
    gap: 28,
  },
  section: {
    gap: 12,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  sectionDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2.5,
  },
  card: {
    borderRadius: 24,
    padding: 22,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleInfo: {
    gap: 2,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  toggleSummary: {
    fontSize: 13,
    fontWeight: '400',
  },
  divider: {
    height: 1,
    marginVertical: 18,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  timeValue: {
    fontSize: 20,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
  },
  repeatRow: {
    flexDirection: 'row',
    gap: 10,
  },
  repeatBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
  },
  repeatText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCell: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 12,
    fontWeight: '700',
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: 4,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
});
