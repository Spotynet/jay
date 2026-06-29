import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { IconPlus } from 'tabler-icons-react-native';
import ScreenLayout from '../../components/common/ScreenLayout';
import { ActionButton } from '../../components/common/ActionButton';
import { getAllHabits, deleteHabit } from '../../api/habits';
import DeleteConfirm from '../../components/ui/DeleteConfirm';
import { HabitManagementItem } from '../../components/habits/HabitManagementItem';
import { AppText } from '../../components/ui/AppText';
import { useTheme } from '../../context/ThemeContext';

export default function HabitsSettingsScreen() {
  const { colors } = useTheme();
  const [habits, setHabits] = useState<any[]>([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [habitToActOn, setHabitToActOn] = useState<any>(null);
  const isFocused = useIsFocused();
  const navigation = useNavigation<any>();

  const fetchHabits = async () => {
    const data = await getAllHabits();
    setHabits(data);
  };

  const confirmDelete = (habit: any) => {
    setHabitToActOn(habit);
    setDeleteModalVisible(true);
  };

  const executeDelete = async () => {
    if (habitToActOn) {
      await deleteHabit(habitToActOn.id);
      setDeleteModalVisible(false);
      setHabitToActOn(null);
      fetchHabits();
    }
  };

  useEffect(() => {
    if (isFocused) fetchHabits();
  }, [isFocused]);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <AppText style={[styles.emptyTitle, { color: colors.text }]}>No Habits Yet</AppText>
      <AppText style={[styles.emptyDesc, { color: colors.subtext }]}>Create your first habit to get started.</AppText>
    </View>
  );

  return (
    <ScreenLayout 
      title="MANAGE HABITS" 
      showBack={true}
      rightOption={{
        icon: () => <ActionButton icon={IconPlus} onPress={() => navigation.navigate('HabitEntry')} size={40} />
      }}
    >
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemWrapper}>
            <HabitManagementItem
              name={item.name}
              iconName={item.icon}
              daysOfWeek={item.days_of_week || []}
              history={item.history || []}
              onPress={() => navigation.navigate('HabitEntry', { habit: item })}
            />
          </View>
        )}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={habits.length === 0 ? styles.flexGrow : styles.listContent}
      />
      <DeleteConfirm
        visible={deleteModalVisible}
        title="Delete Habit"
        message={`Are you sure you want to delete ${habitToActOn?.name}?`}
        onConfirm={executeDelete}
        onCancel={() => setDeleteModalVisible(false)}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingVertical: 10 },
  flexGrow: { flexGrow: 1, justifyContent: 'center' },
  itemWrapper: { marginBottom: 16 },
  emptyContainer: { alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  emptyDesc: { fontSize: 14, textAlign: 'center' },
});

