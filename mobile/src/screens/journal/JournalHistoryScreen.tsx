import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, SectionList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../../components/ui/AppText';
import ScreenLayout from '../../components/common/ScreenLayout';
import { getJournalEntries } from '../../api/journal';
import { JournalHistoryItem } from './components/JournalHistoryItem';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Icon } from '../../components/ui/Icon';
import { IconBook, IconPlus, IconChevronDown, IconChevronUp } from 'tabler-icons-react-native';

export default function JournalHistoryScreen() {
  const { colors, entityColors } = useTheme();
  const journalColor = entityColors.journal;
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const fetchEntries = async () => {
    try {
      const data = await getJournalEntries();
      setEntries(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const sections = useMemo(() => {
    const grouped = entries.reduce((acc, entry) => {
        const date = new Date(entry.date + 'T00:00:00');
        const monthKey = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        if (!acc[monthKey]) acc[monthKey] = [];
        acc[monthKey].push(entry);
        return acc;
    }, {} as Record<string, any[]>);

    return Object.entries(grouped).map(([title, data]) => ({ title, data }));
  }, [entries]);

  const toggleSection = (title: string) => {
    const next = new Set(collapsedSections);
    if (next.has(title)) next.delete(title);
    else next.add(title);
    setCollapsedSections(next);
  };

  useEffect(() => {
    if (isFocused) {
      fetchEntries();
    }
  }, [isFocused]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEntries();
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconCircle, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Icon name={IconBook} size={40} color={colors.border} />
      </View>
      <AppText style={[styles.emptyTitle, { color: colors.text }]}>
        Your story begins here
      </AppText>
      <AppText style={[styles.emptyText, { color: colors.subtext }]}>
        Start capturing your daily highlights and reflections to see them here.
      </AppText>
      <TouchableOpacity 
        style={[styles.emptyBtn, { backgroundColor: journalColor }]}
        onPress={() => navigation.navigate('JournalEntry')}
      >
        <Icon name={IconPlus} size={18} color="#FFFFFF" />
        <AppText style={styles.emptyBtnText}>New Entry</AppText>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenLayout 
      title="JOURNAL HISTORY" 
      showBack={true}
      rightOption={{
        icon: () => <Icon name={IconPlus} size={20} color={colors.text} />,
        onPress: () => navigation.navigate('JournalEntry')
      }}
    >
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={journalColor} />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id.toString()}
          renderSectionHeader={({ section: { title, data } }) => (
            <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection(title)}>
                <AppText style={[styles.sectionTitle, { color: colors.subtext }]}>{title.toUpperCase()}</AppText>
                <Icon name={collapsedSections.has(title) ? IconChevronDown : IconChevronUp} size={18} color={colors.subtext} />
            </TouchableOpacity>
          )}
          renderItem={({ item, section }) => 
            collapsedSections.has(section.title) ? null : (
                <JournalHistoryItem 
                entry={item} 
                onPress={() => navigation.navigate('JournalDetail', { entryId: item.id })} 
                />
            )
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={journalColor} />
          }
        />
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingVertical: 20, paddingBottom: 40 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, marginBottom: 8 },
  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 2 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
  emptyIconCircle: { width: 80, height: 80, borderRadius: 40, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  emptyText: { fontSize: 14, fontWeight: '400', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  emptyBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 }
});
