import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface JournalSnapshotHeaderProps {
  entry: any;
  onPress: () => void;
}

export const JournalSnapshotHeader = ({ entry, onPress }: JournalSnapshotHeaderProps) => {
  const { colors, accentColor } = useTheme();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.container}>
      <View style={styles.iconBox}>
        <Ionicons name="book" size={14} color={accentColor} />
      </View>
      <Text style={[styles.text, { color: colors.text }]} numberOfLines={1}>
        {entry.content}
      </Text>
      {(entry.mood || entry.energy) && (
        <View style={styles.metrics}>
          {entry.mood && (
            <View style={styles.metricItem}>
              <Ionicons name="happy" size={12} color="#666" />
              <Text style={styles.metricText}>{entry.mood}</Text>
            </View>
          )}
          {entry.energy && (
            <View style={styles.metricItem}>
              <Ionicons name="battery-half" size={12} color="#666" />
              <Text style={styles.metricText}>{entry.energy}</Text>
            </View>
          )}
        </View>
      )}
      <Ionicons name="chevron-forward" size={14} color="#555" style={styles.chevron} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 0,
    borderBottomWidth: 0.5,
    borderBottomColor: '#222',
  },
  iconBox: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  text: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  metrics: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 8,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  metricText: {
    fontSize: 11,
    color: '#aaa',
    fontWeight: '600',
  },
  chevron: {
    opacity: 0.6,
  },
});
