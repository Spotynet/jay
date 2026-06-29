import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import Card from '../common/Card';
import { toggleHabitCompletion } from '../../api/habits';

interface HabitCardProps {
  habit: {
    id: number;
    name: string;
    description: string;
    reminder_time?: string;
    completed: boolean;
  };
  date: string;
  onToggle: () => void;
}

export default function HabitCard({ habit, date, onToggle }: HabitCardProps) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(habit.completed);

  // Sync internal state with prop changes (e.g., when navigation happens)
  React.useEffect(() => {
    setCompleted(habit.completed);
  }, [habit.completed]);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const result = await toggleHabitCompletion(habit.id, date);
      setCompleted(result.completed);
      onToggle();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        <View style={styles.info}>
          <Text style={[styles.title, { color: colors.text }]}>{habit.name}</Text>
          {habit.description ? <Text style={{ color: colors.subtext }}>{habit.description}</Text> : null}
          {habit.reminder_time ? <Text style={{ color: colors.accent, marginTop: 4 }}>Reminder: {habit.reminder_time.slice(0, 5)}</Text> : null}
        </View>
        <TouchableOpacity 
          style={[styles.checkbox, { borderColor: colors.accent }]} 
          onPress={handleToggle}
          disabled={loading}
        >
          <Ionicons 
            name={completed ? "checkbox" : "ellipse-outline"} 
            size={24} 
            color={completed ? colors.accent : colors.accent} 
          />
        </TouchableOpacity>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 10 },
  content: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  info: { flex: 1 },
  title: { fontSize: 16, fontWeight: 'bold' },
  checkbox: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
});
