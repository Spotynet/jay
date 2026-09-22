import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../../components/ui/AppText';
import { Icon } from '../../components/ui/Icon';
import ScreenLayout from '../../components/common/ScreenLayout';
import { AuthButton } from '../auth/components/AuthButton';
import { useNavigation, useRoute } from '@react-navigation/native';
import AppDatePicker from '../../components/common/AppDatePicker';
import { IconEdit, IconTrash, IconPlus, IconX } from 'tabler-icons-react-native';
import { createJournalEntry, updateJournalEntry, deleteJournalEntry, getJournalSettings } from '../../api/journal';
import { SettingsRow } from '../../components/common/SettingsRow';
import { toLocalDateString } from '../../utils/date';
import { MoodEnergyRating } from './components/MoodEnergyRating';
import DeleteConfirm from '../../components/ui/DeleteConfirm';

export default function JournalEntryScreen() {
  const { colors, entityColors } = useTheme();
  const journalColor = entityColors.journal;
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const entry = route.params?.entry;
  const paramDate = route.params?.date;

  const [date, setDate] = useState(
    entry ? new Date(entry.date + 'T00:00:00') : 
    paramDate ? new Date(paramDate + 'T00:00:00') : 
    new Date()
  );
  const [highlight, setHighlight] = useState(entry?.highlight || '');
  const [notes, setNotes] = useState(entry?.notes || '');
  const [moodScore, setMoodScore] = useState(entry?.mood_score || 5);
  const [hasMood, setHasMood] = useState(!!entry?.mood_score);
  const [energyScore, setEnergyScore] = useState(entry?.energy_score || 5);
  const [hasEnergy, setHasEnergy] = useState(!!entry?.energy_score);
  const [customRatings, setCustomRatings] = useState<{label: string, score: number}[]>(entry?.custom_ratings || []);
  const [hasCustom, setHasCustom] = useState(entry?.custom_ratings?.length > 0);
  
  useEffect(() => {
    if (!entry) {
        getJournalSettings().then(settings => {
            if (settings.default_tags && settings.default_tags.length > 0) {
                setCustomRatings(settings.default_tags.map((tag: string) => ({ label: tag, score: 5 })));
                setHasCustom(true);
            }
        }).catch(console.error);
    }
  }, []);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [newTagLabel, setNewTagLabel] = useState('');

  const saveEntry = async () => {
    setLoading(true);
    try {
      const data = {
        date: toLocalDateString(date),
        highlight,
        notes,
        mood_score: hasMood ? moodScore : null,
        energy_score: hasEnergy ? energyScore : null,
        custom_ratings: hasCustom ? customRatings : []
      };

      if (entry) {
        await updateJournalEntry(entry.id, data);
      } else {
        await createJournalEntry(data);
      }
      navigation.goBack();
    } catch (e: any) {
      const errorMsg = e.message || 'Failed to save entry';
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteJournalEntry(entry.id);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to delete entry');
    }
  };

  const addCustomRating = () => {
    if (newTagLabel.trim()) {
      const label = newTagLabel.trim().toLowerCase();
      if (customRatings.find(r => r.label === label)) {
        Alert.alert('Error', 'This tag already exists');
        return;
      }
      setCustomRatings([...customRatings, { label, score: 5 }]);
      setNewTagLabel('');
    }
  };

  const removeCustomRating = (label: string) => {
    setCustomRatings(customRatings.filter(r => r.label !== label));
  };

  const updateCustomScore = (label: string, score: number) => {
    setCustomRatings(customRatings.map(r => r.label === label ? { ...r, score } : r));
  };

  return (
    <ScreenLayout 
      title={entry ? "Edit Journal" : "New Journal"} 
      showBack={true}
      rightOption={entry ? {
        icon: () => <Icon name={IconTrash} size={20} color={colors.error} />,
        onPress: () => setDeleteModalVisible(true)
      } : undefined}
    >
      <DeleteConfirm 
        visible={deleteModalVisible} 
        title="Delete Entry" 
        message="Are you sure you want to delete this journal entry?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={100}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity 
            style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setShowDatePicker(true)}
          >
            <AppText style={styles.subtitleLabel}>DATE</AppText>
            <View style={styles.dateRow}>
              <AppText style={[styles.dateText, { color: colors.text }]}>
                {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </AppText>
              <Icon name={IconEdit} size={18} color={colors.subtext} />
            </View>
          </TouchableOpacity>

          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <AppText style={styles.subtitleLabel}>HIGHLIGHT OF THE DAY</AppText>
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              placeholder="What made today special?"
              placeholderTextColor={colors.subtext}
              multiline
              maxLength={280}
              value={highlight}
              onChangeText={setHighlight}
            />
          </View>

          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <AppText style={styles.subtitleLabel}>NOTES & ANNOTATIONS</AppText>
            <TextInput
              style={[styles.textInput, { color: colors.text, minHeight: 80 }]}
              placeholder="Any other details..."
              placeholderTextColor={colors.subtext}
              multiline
              value={notes}
              onChangeText={setNotes}
            />
          </View>

          <SettingsRow
            label="MOOD"
            summary={hasMood ? `${moodScore}/10` : 'Not set'}
            value={hasMood}
            onValueChange={setHasMood}
            accentColor={journalColor}
          >
            <View style={styles.expandedContent}>
              <MoodEnergyRating 
                value={moodScore} 
                onChange={setMoodScore} 
                accentColor={journalColor} 
              />
            </View>
          </SettingsRow>

          <SettingsRow
            label="ENERGY"
            summary={hasEnergy ? `${energyScore}/10` : 'Not set'}
            value={hasEnergy}
            onValueChange={setHasEnergy}
            accentColor={journalColor}
          >
            <View style={styles.expandedContent}>
              <MoodEnergyRating 
                value={energyScore} 
                onChange={setEnergyScore} 
                accentColor={journalColor} 
              />
            </View>
          </SettingsRow>

          <SettingsRow
            label="CUSTOM TAGS"
            summary={hasCustom ? `${customRatings.length} tags` : 'Add dimensions'}
            value={hasCustom}
            onValueChange={setHasCustom}
            accentColor={journalColor}
          >
            <View style={styles.customContainer}>
              <View style={styles.addTagRow}>
                <TextInput 
                  style={[styles.tagInput, { color: colors.text, borderColor: colors.border }]}
                  placeholder="New tag (e.g. Work)"
                  placeholderTextColor={colors.subtext}
                  value={newTagLabel}
                  onChangeText={setNewTagLabel}
                  onSubmitEditing={addCustomRating}
                />
                <TouchableOpacity 
                  style={[styles.addBtn, { backgroundColor: journalColor }]} 
                  onPress={addCustomRating}
                >
                  <Icon name={IconPlus} size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {customRatings.map((rating, index) => (
                <View 
                  key={rating.label} 
                  style={[
                    styles.tagRatingItem, 
                    index > 0 && { borderTopWidth: 1, borderTopColor: colors.border + '40', paddingTop: 20 }
                  ]}
                >
                  <View style={styles.tagHeader}>
                    <AppText style={[styles.tagLabel, { color: colors.text }]}>{rating.label}</AppText>
                    <TouchableOpacity onPress={() => removeCustomRating(rating.label)} style={styles.removeBtn}>
                      <Icon name={IconX} size={14} color={colors.subtext} />
                    </TouchableOpacity>
                  </View>
                  <MoodEnergyRating 
                    value={rating.score} 
                    onChange={(val) => updateCustomScore(rating.label, val)} 
                    accentColor={journalColor} 
                  />
                </View>
              ))}
            </View>
          </SettingsRow>

          <AppDatePicker 
            visible={showDatePicker} 
            onClose={() => setShowDatePicker(false)} 
            value={date} 
            onChange={setDate} 
            mode="date" 
            label="Journal Date" 
          />
        </ScrollView>

        <View style={styles.footer}>
          <AuthButton 
            title={loading ? "Saving..." : "Save"} 
            onPress={saveEntry} 
            loading={loading} 
            style={{ backgroundColor: journalColor }}
          />
        </View>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16, paddingBottom: 120, paddingTop: 20 },
  section: { paddingVertical: 20, paddingHorizontal: 24, borderRadius: 16, borderWidth: 1, width: '100%' },
  subtitleLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase', color: '#8E8E93', marginBottom: 12 },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText: { fontSize: 17, fontWeight: '400' },
  textInput: { fontSize: 17, lineHeight: 26, minHeight: 40, padding: 0, textAlignVertical: 'top', fontWeight: '400' },
  footer: { paddingBottom: 20, paddingTop: 10, width: '100%' },
  customContainer: { gap: 24 },
  addTagRow: { flexDirection: 'row', gap: 12 },
  tagInput: { flex: 1, height: 48, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, fontSize: 15 },
  addBtn: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  tagRatingItem: { gap: 16 },
  expandedContent: { paddingTop: 4 },
  tagHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tagLabel: { fontSize: 15, fontWeight: '600', textTransform: 'capitalize' },
  removeBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center' }
});
