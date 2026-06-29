import React, { useEffect, useState } from 'react';
import { View, StyleSheet, SectionList, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { IconPlus } from 'tabler-icons-react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenLayout from '../../components/common/ScreenLayout';
import { ActionButton } from '../../components/common/ActionButton';
import { getAllTasks, deleteTask, toggleTaskCompletion } from '../../api/tasks';
import { TaskManagementItem } from '../../components/tasks/TaskManagementItem';
import DeleteConfirm from '../../components/ui/DeleteConfirm';
import { AppText } from '../../components/ui/AppText';

export default function TasksSettingsScreen() {
  const { colors, accentColor } = useTheme();
  const [tasks, setTasks] = useState<any[]>([]);
  const [view, setView] = useState('All');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [taskToActOn, setTaskToActOn] = useState<any>(null);
  const [completedCollapsed, setCompletedCollapsed] = useState(true);
  const isFocused = useIsFocused();
  const navigation = useNavigation<any>();

  const fetchTasks = async () => {
    const data = await getAllTasks();
    setTasks(data);
  };

  const confirmDelete = (task: any) => {
    setTaskToActOn(task);
    setDeleteModalVisible(true);
  };

  const executeDelete = async () => {
    if (taskToActOn) {
      await deleteTask(taskToActOn.id);
      setDeleteModalVisible(false);
      setTaskToActOn(null);
      fetchTasks();
    }
  };

  const handleToggle = async (taskId: number) => {
    await toggleTaskCompletion(taskId);
    fetchTasks();
  };

  useEffect(() => {
    if (isFocused) fetchTasks();
  }, [isFocused]);

  let filteredTasks = tasks;
  if (view === 'Active') filteredTasks = tasks.filter(t => t.status !== 'COMPLETED');
  if (view === 'Completed') filteredTasks = tasks.filter(t => t.status === 'COMPLETED');

  const activeTasks = filteredTasks.filter(t => t.status !== 'COMPLETED');
  const completedTasks = filteredTasks.filter(t => t.status === 'COMPLETED');

  const sections = [
    { title: 'ACTIVE TASKS', data: activeTasks, isCompleted: false },
    { title: `COMPLETED TASKS (${completedTasks.length})`, data: completedCollapsed ? [] : completedTasks, isCompleted: true },
  ].filter(s => s.data.length > 0 || s.isCompleted);

  const renderFilterBar = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterBar}>
        {['All', 'Active', 'Completed'].map(v => (
            <TouchableOpacity key={v} onPress={() => setView(v)} style={[styles.filterChip, { backgroundColor: view === v ? accentColor : colors.surface }]}>
                <AppText style={[styles.filterText, { color: view === v ? 'white' : colors.text }]}>{v}</AppText>
            </TouchableOpacity>
        ))}
    </ScrollView>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <AppText style={[styles.emptyTitle, { color: colors.text }]}>No Tasks Found</AppText>
      <AppText style={[styles.emptyDesc, { color: colors.subtext }]}>Try changing your filters.</AppText>
    </View>
  );

  return (
    <ScreenLayout 
        title="MANAGE TASKS" 
        showBack={true}
        rightOption={{
            icon: () => <ActionButton icon={IconPlus} onPress={() => navigation.navigate('TaskEntry')} size={40} />
        }}
    >
      {renderFilterBar()}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id.toString()}
        renderSectionHeader={({ section }) => (
            <TouchableOpacity onPress={() => section.isCompleted && setCompletedCollapsed(!completedCollapsed)}>
                <View style={styles.sectionHeaderRow}>
                    <AppText style={[styles.sectionHeader, { color: colors.subtext }]}>{section.title}</AppText>
                    {section.isCompleted && <Ionicons name={completedCollapsed ? "chevron-down" : "chevron-up"} size={14} color={colors.subtext} />}
                </View>
            </TouchableOpacity>
        )}
        renderItem={({ item }) => (
          <View style={styles.itemWrapper}>
            <TaskManagementItem
              name={item.name}
              isCompleted={item.status === 'COMPLETED'}
              onToggle={() => handleToggle(item.id)}
              metadata={`${item.due_date} ${item.due_time ? item.due_time.slice(0, 5) : ''}`}
              category={item.category?.name}
              onPress={() => navigation.navigate('TaskEntry', { task: item })}
              onDelete={() => confirmDelete(item)}
            />
          </View>
        )}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={tasks.length === 0 ? styles.flexGrow : styles.listContent}
      />
      <DeleteConfirm
        visible={deleteModalVisible}
        title="Delete Task"
        message={`Are you sure you want to delete ${taskToActOn?.name}?`}
        onConfirm={executeDelete}
        onCancel={() => setDeleteModalVisible(false)}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  filterBar: { paddingHorizontal: 20, marginBottom: 10 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  filterText: { fontSize: 14, fontWeight: '600' },
  listContent: { paddingVertical: 10 },
  flexGrow: { flexGrow: 1, justifyContent: 'center' },
  itemWrapper: { marginBottom: 16 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 10, marginBottom: 16 },
  sectionHeader: { fontSize: 12, fontWeight: '700', letterSpacing: 0.8, marginRight: 8 },
  emptyContainer: { alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  emptyDesc: { fontSize: 14, textAlign: 'center' },
});
