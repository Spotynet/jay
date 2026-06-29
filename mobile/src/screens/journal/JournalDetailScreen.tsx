import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../../components/ui/AppText';
import { Icon } from '../../components/ui/Icon';
import ScreenLayout from '../../components/common/ScreenLayout';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { getJournalEntries } from '../../api/journal';
import { IconEdit, IconMoodSmile, IconBolt, IconCalendar } from 'tabler-icons-react-native';

export default function JournalDetailScreen() {
  const { colors, entityColors } = useTheme();
  const journalColor = entityColors.journal;
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const isFocused = useIsFocused();
  const { entryId } = route.params;

  const [entry, setEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchEntry = async () => {
    try {
      const data = await getJournalEntries();
      const found = data.find((e: any) => e.id === entryId);
      setEntry(found);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchEntry();
    }
  }, [isFocused, entryId]);

  if (loading) {
    return (
      <ScreenLayout title="JOURNAL DETAIL" showBack={true}>
        <View style={styles.center}>
          <ActivityIndicator color={journalColor} />
        </View>
      </ScreenLayout>
    );
  }

  if (!entry) {
    return (
      <ScreenLayout title="JOURNAL DETAIL" showBack={true}>
        <View style={styles.center}>
          <AppText style={{ color: colors.subtext }}>Entry not found</AppText>
        </View>
      </ScreenLayout>
    );
  }

  const dateObj = new Date(entry.date + 'T00:00:00');
  const formattedDate = dateObj.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  return (
    <ScreenLayout 
      title="JOURNAL DETAIL" 
      showBack={true}
      rightOption={{
        icon: () => <Icon name={IconEdit} size={20} color={colors.text} />,
        onPress: () => navigation.navigate('JournalEntry', { entry })
      }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.headerSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.dateRow}>
            <Icon name={IconCalendar} size={18} color={journalColor} />
            <AppText style={[styles.dateText, { color: colors.text }]}>{formattedDate}</AppText>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <AppText style={styles.label}>HIGHLIGHT</AppText>
          <AppText style={[styles.highlightText, { color: colors.text }]}>{entry.highlight}</AppText>
        </View>

        {entry.notes ? (
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <AppText style={styles.label}>NOTES & ANNOTATIONS</AppText>
            <AppText style={[styles.notesText, { color: colors.text }]}>{entry.notes}</AppText>
          </View>
        ) : null}

        <View style={styles.ratingsRow}>
          {entry.mood_score !== null && entry.mood_score !== undefined && (
            <View style={[styles.ratingBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.ratingHeader}>
                <Icon name={IconMoodSmile} size={16} color={journalColor} />
                <AppText style={styles.label}>MOOD</AppText>
              </View>
              <AppText style={[styles.scoreValue, { color: colors.text }]}>{entry.mood_score}<AppText style={{ fontSize: 14, color: colors.subtext }}>/10</AppText></AppText>
            </View>
          )}

          {entry.energy_score !== null && entry.energy_score !== undefined && (
            <View style={[styles.ratingBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.ratingHeader}>
                <Icon name={IconBolt} size={16} color="#FF9500" />
                <AppText style={styles.label}>ENERGY</AppText>
              </View>
              <AppText style={[styles.scoreValue, { color: colors.text }]}>{entry.energy_score}<AppText style={{ fontSize: 14, color: colors.subtext }}>/10</AppText></AppText>
            </View>
          )}
        </View>

        {entry.custom_ratings && entry.custom_ratings.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <AppText style={styles.label}>CUSTOM TAGS</AppText>
            <View style={styles.customGrid}>
              {entry.custom_ratings.map((rating: any) => (
                <View key={rating.label} style={[styles.customItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <AppText style={[styles.customLabel, { color: colors.subtext }]}>{rating.label}</AppText>
                  <AppText style={[styles.customScore, { color: colors.text }]}>{rating.score}</AppText>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 20, gap: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerSection: { padding: 16, borderRadius: 16, borderWidth: 1 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dateText: { fontSize: 16, fontWeight: '600' },
  section: { padding: 20, borderRadius: 16, borderWidth: 1, gap: 12 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', color: '#8E8E93' },
  highlightText: { fontSize: 18, fontWeight: '500', lineHeight: 26 },
  notesText: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  ratingsRow: { flexDirection: 'row', gap: 12 },
  ratingBox: { flex: 1, padding: 20, borderRadius: 16, borderWidth: 1, gap: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  ratingHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scoreValue: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  customGrid: { gap: 12, marginTop: 4 },
  customItem: { padding: 16, borderRadius: 12, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  customLabel: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  customScore: { fontSize: 18, fontWeight: '700' }
});
