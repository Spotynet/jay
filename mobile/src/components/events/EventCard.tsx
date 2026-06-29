import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import Card from '../common/Card';

interface EventCardProps {
  event: {
    id: number;
    name: string;
    description: string;
    start_time: string;
    end_time: string;
    location: string;
  };
}

export default function EventCard({ event }: EventCardProps) {
  const { colors, entityColors } = useTheme();

  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        <View style={styles.info}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Ionicons name="calendar-outline" size={16} color={entityColors.events} />
            <Text style={[styles.title, { color: colors.text }]}>{event.name}</Text>
          </View>
          <Text style={{ color: colors.subtext }}>{event.start_time.slice(0, 5)} - {event.end_time.slice(0, 5)}</Text>
          {event.location ? <Text style={{ color: colors.subtext, fontSize: 12 }}>{event.location}</Text> : null}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 10 },
  content: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  info: { flex: 1 },
  title: { fontSize: 16, fontWeight: 'bold' },
});
