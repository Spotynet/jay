import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import Card from '../common/Card';
import { toggleTaskCompletion } from '../../api/tasks';
import { useNavigation } from '@react-navigation/native';

interface TaskCardProps {
  task: {
    id: number;
    name: string;
    description: string;
    status: string;
    subtasks?: any[];
  };
  onToggle: () => void;
}

export default function TaskCard({ task, onToggle }: TaskCardProps) {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  const handleToggle = async () => {
    try {
      await toggleTaskCompletion(task.id);
      onToggle();
    } catch (error) {
      console.error(error);
    }
  };

  const isCompleted = task.status === 'COMPLETED';

  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        <View style={styles.info}>
          <Text style={[styles.title, { color: colors.text }]}>{task.name}</Text>
          {task.description ? <Text style={{ color: colors.subtext }}>{task.description}</Text> : null}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => navigation.navigate('TaskEntry', { parentId: task.id })}>
            <Ionicons name="add-circle-outline" size={24} color={colors.subtext} style={{ marginRight: 10 }} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.checkbox} onPress={handleToggle}>
            <Ionicons 
              name={isCompleted ? "checkbox" : "square-outline"} 
              size={24} 
              color={colors.accent} 
            />
          </TouchableOpacity>
        </View>
      </View>
      {task.subtasks && task.subtasks.map((sub: any) => (
        <TouchableOpacity 
          key={sub.id} 
          style={styles.subtask}
          onPress={() => navigation.navigate('Today', { date: sub.due_date })}
        >
          <Ionicons name="return-down-forward-outline" size={16} color={colors.subtext} />
          <Text style={{ color: colors.text }}>{sub.name}</Text>
        </TouchableOpacity>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 10 },
  content: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  info: { flex: 1 },
  title: { fontSize: 16, fontWeight: 'bold' },
  actions: { flexDirection: 'row', alignItems: 'center' },
  checkbox: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  subtask: { flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingLeft: 10 },
});
