import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import Card from '../common/Card';

interface JournalCardProps {
  entry: {
    id: number;
    date: string;
    content: string;
    mood: number;
    energy: number;
  };
}

export default function JournalCard({ entry }: JournalCardProps) {
  const { colors } = useTheme();

  return (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="book-outline" size={16} color={colors.accent} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Journal Entry</Text>
        </View>
        <View style={styles.metrics}>
          <Text style={[styles.metric, { color: colors.accent }]}>Mood: {entry.mood || '-'}/10</Text>
          <Text style={[styles.metric, { color: colors.accent }]}>Energy: {entry.energy || '-'}/10</Text>
        </View>
      </View>
      <Text style={{ color: colors.text }}>{entry.content}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardTitle: { fontWeight: 'bold' },
  metrics: { flexDirection: 'row', gap: 10 },
  metric: { fontSize: 12, fontWeight: '600' },
});
