import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../../components/ui/AppText';
import { Icon } from '../../components/ui/Icon';
import ScreenLayout from '../../components/common/ScreenLayout';
import { SettingsRow } from '../../components/common/SettingsRow';
import { AppTimePicker } from '../../components/common/AppTimePicker';
import { IconHistory, IconChevronRight, IconPlus, IconX } from 'tabler-icons-react-native';
import { useNavigation } from '@react-navigation/native';
import { formatReminderSummary } from '../../utils/journalScheduling';
import { getJournalSettings, updateJournalSettings } from '../../api/journal';

const DEFAULT_SETTINGS = {
  reminder_enabled: false,
  reminder_time: '20:00:00',
  repeat_mode: 'every_day',
  days_of_week: [],
  default_tags: []
};

export default function JournalSettingsScreen() {
  const { colors, entityColors } = useTheme();
  const navigation = useNavigation<any>();
  
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await getJournalSettings();
      setSettings(data);
    } catch (e) {
      console.error(e);
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (updates: any) => {
    const currentSettings = settings || DEFAULT_SETTINGS;
    const next = { ...currentSettings, ...updates };
    
    // Ensure time format is HH:MM:SS
    if (next.reminder_time && !next.reminder_time.includes(':00')) {
        const parts = next.reminder_time.split(':');
        next.reminder_time = `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:00`;
    }
    
    setSettings(next);
    try {
      await updateJournalSettings(next);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to update settings');
    }
  };

  const addDefaultTag = () => {
    if (newTag.trim()) {
      const tag = newTag.trim().toLowerCase();
      const currentTags = settings?.default_tags || [];
      if (!currentTags.includes(tag)) {
        saveSettings({ default_tags: [...currentTags, tag] });
      }
      setNewTag('');
    }
  };

  const removeDefaultTag = (tag: string) => {
    const currentTags = settings?.default_tags || [];
    saveSettings({ default_tags: currentTags.filter((t: string) => t !== tag) });
  };

  if (loading) return <ScreenLayout title="MANAGE JOURNAL" showBack={true}><ActivityIndicator style={{marginTop: 50}} /></ScreenLayout>;

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const displaySettings = settings || DEFAULT_SETTINGS;

  return (
    <ScreenLayout title="MANAGE JOURNAL" showBack={true}>
      <ScrollView contentContainerStyle={styles.container}>
        
        <TouchableOpacity 
          style={[styles.historyRow, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => navigation.navigate('JournalHistory')}
        >
          <View style={styles.historyLeft}>
            <Icon name={IconHistory} size={20} color={entityColors.journal} />
            <AppText style={[styles.historyText, { color: colors.text }]}>View Journal History</AppText>
          </View>
          <Icon name={IconChevronRight} size={20} color={colors.subtext} />
        </TouchableOpacity>

        <SettingsRow
          label="SCHEDULED REMINDER"
          summary={formatReminderSummary(displaySettings)}
          value={displaySettings.reminder_enabled}
          onValueChange={(val) => saveSettings({ reminder_enabled: val })}
          accentColor={entityColors.journal}
          onSummaryPress={() => displaySettings.reminder_enabled && setShowTimePicker(true)}
        >
          <View style={styles.expandedContent}>
            <TouchableOpacity style={styles.timeRow} onPress={() => setShowTimePicker(true)}>
              <AppText style={{ color: colors.text }}>Fixed time</AppText>
              <AppText style={{ color: entityColors.journal, fontWeight: '600' }}>
                {displaySettings.reminder_time.substring(0, 5)}
              </AppText>
            </TouchableOpacity>

            <View style={styles.repeatRow}>
              <TouchableOpacity 
                style={[styles.repeatBtn, displaySettings.repeat_mode === 'every_day' && { borderColor: entityColors.journal }]}
                onPress={() => saveSettings({ repeat_mode: 'every_day' })}
              >
                <AppText style={[styles.repeatLabel, { color: displaySettings.repeat_mode === 'every_day' ? colors.text : colors.subtext }]}>Every day</AppText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.repeatBtn, displaySettings.repeat_mode === 'selected_days' && { borderColor: entityColors.journal }]}
                onPress={() => saveSettings({ repeat_mode: 'selected_days' })}
              >
                <AppText style={[styles.repeatLabel, { color: displaySettings.repeat_mode === 'selected_days' ? colors.text : colors.subtext }]}>Selected days</AppText>
              </TouchableOpacity>
            </View>

            {displaySettings.repeat_mode === 'selected_days' && (
              <View style={styles.daySelector}>
                {days.map((day, idx) => (
                  <TouchableOpacity 
                    key={day} 
                    onPress={() => {
                        const currentDays = displaySettings.days_of_week || [];
                        const newDays = currentDays.includes(idx) 
                            ? currentDays.filter((d: number) => d !== idx) 
                            : [...currentDays, idx];
                        saveSettings({ days_of_week: newDays });
                    }} 
                    style={styles.dayItem}
                  >
                    <AppText style={[styles.dayText, { color: (displaySettings.days_of_week || []).includes(idx) ? entityColors.journal : colors.subtext }]}>{day}</AppText>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </SettingsRow>

        <SettingsRow
          label="DEFAULT TAGS"
          summary={`${(displaySettings.default_tags || []).length} defaults defined`}
          value={true}
          onValueChange={() => {}}
          accentColor={entityColors.journal}
        >
          <View style={styles.expandedContent}>
            <View style={styles.addTagRow}>
              <TextInput 
                style={[styles.tagInput, { color: colors.text, borderColor: colors.border }]}
                placeholder="Add default tag..."
                placeholderTextColor={colors.subtext}
                value={newTag}
                onChangeText={setNewTag}
                onSubmitEditing={addDefaultTag}
              />
              <TouchableOpacity 
                style={[styles.addBtn, { backgroundColor: entityColors.journal }]} 
                onPress={addDefaultTag}
              >
                <Icon name={IconPlus} size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.tagGrid}>
              {(displaySettings.default_tags || []).map((tag: string) => (
                <View key={tag} style={[styles.tagBlock, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <AppText style={[styles.tagLabel, { color: colors.text }]}>{tag}</AppText>
                  <TouchableOpacity onPress={() => removeDefaultTag(tag)} style={styles.removeBtn}>
                    <Icon name={IconX} size={14} color={colors.subtext} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </SettingsRow>

        <AppText style={[styles.hint, { color: colors.subtext }]}>
          {displaySettings.reminder_enabled 
            ? "Your journal will appear in your timeline at this scheduled time." 
            : "Journal is in manual-only mode. Create entries anytime using the + action."}
        </AppText>
      </ScrollView>

      <AppTimePicker 
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        value={new Date('1970-01-01T' + (displaySettings.reminder_time || '20:00:00'))} 
        onChange={(date) => {
            const timeStr = date.getHours().toString().padStart(2, '0') + ':' + 
                            date.getMinutes().toString().padStart(2, '0') + ':00';
            saveSettings({ reminder_time: timeStr });
        }} 
        label="Reminder Time"
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 20, gap: 16 },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderRadius: 16, borderWidth: 1, alignItems: 'center' },
  historyLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  historyText: { fontSize: 16, fontWeight: '600' },
  expandedContent: { gap: 16 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  repeatRow: { flexDirection: 'row', gap: 12 },
  repeatBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center' },
  repeatLabel: { fontSize: 13, fontWeight: '600' },
  daySelector: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  dayItem: { paddingVertical: 8 },
  dayText: { fontSize: 13, fontWeight: '600' },
  hint: { fontSize: 13, textAlign: 'center', marginTop: 8, paddingHorizontal: 20 },
  addTagRow: { flexDirection: 'row', gap: 12 },
  tagInput: { flex: 1, height: 48, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, fontSize: 15 },
  addBtn: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagBlock: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  tagLabel: { fontSize: 13, fontWeight: '600', textTransform: 'capitalize' },
  removeBtn: { width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' }
});
