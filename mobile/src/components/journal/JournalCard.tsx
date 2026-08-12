import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

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
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.card, { borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
      <LinearGradient
        colors={isDark ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0)'] : ['rgba(0,0,0,0.04)', 'rgba(0,0,0,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
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
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginVertical: 8,
    overflow: 'hidden',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardTitle: { fontWeight: 'bold' },
  metrics: { flexDirection: 'row', gap: 10 },
  metric: { fontSize: 12, fontWeight: '600' },
});
