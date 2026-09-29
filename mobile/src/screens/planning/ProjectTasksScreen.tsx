import React, { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { IconEdit, IconPlus } from 'tabler-icons-react-native';
import { useTheme } from '../../context/ThemeContext';
import ScreenLayout from '../../components/common/ScreenLayout';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { ActionButton } from '../../components/common/ActionButton';
import { getProjects } from '../../api/projects';
import { getAllTasks, toggleTaskCompletion, updateTask } from '../../api/tasks';
import { PlanTask, TaskList, compareTasks, isListed } from './PlanTaskList';

export default function ProjectTasksScreen() {
  const { colors, entityColors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const isFocused = useIsFocused();
  const inbox = route.params?.inbox === true;
  const initialProject = route.params?.project;

  const [project, setProject] = useState<any>(initialProject || null);
  const [tasks, setTasks] = useState<PlanTask[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (opts?: { keepError?: boolean }) => {
    try {
      const [projectData, taskData] = await Promise.all([
        getProjects(),
        getAllTasks(),
      ]);
      const projects = Array.isArray(projectData) ? projectData : [];
      const listed = (Array.isArray(taskData) ? taskData : []).filter(isListed).slice().sort(compareTasks);
      if (!inbox && initialProject?.id) {
        setProject(projects.find((item: any) => item.id === initialProject.id) || initialProject);
      }
      setTasks(inbox
        ? listed.filter((task) => task.project == null)
        : listed.filter((task) => task.project === initialProject?.id));
      if (!opts?.keepError) setError(null);
    } catch (err) {
      console.error('Failed to fetch project tasks', err);
      setError("Couldn't load these tasks.");
    }
  }, [inbox, initialProject?.id]);

  useEffect(() => {
    if (isFocused) fetchData();
  }, [isFocused, fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleToggleTask = async (taskId: number) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? { ...task, status: task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED' }
          : task
      )
    );
    try {
      await toggleTaskCompletion(taskId);
      fetchData();
    } catch (err) {
      console.error('Failed to toggle task', err);
      await fetchData({ keepError: true });
      setError("Couldn't update this task.");
    }
  };

  const moveTask = async (task: PlanTask, direction: 'up' | 'down') => {
    const siblings = tasks
      .filter((item) => item.parent === task.parent && item.status !== 'COMPLETED')
      .slice()
      .sort(compareTasks);
    const index = siblings.findIndex((item) => item.id === task.id);
    const target = index + (direction === 'up' ? -1 : 1);
    if (index < 0 || target < 0 || target >= siblings.length) return;
    const next = siblings.slice();
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    try {
      await Promise.all(next.map((item, order) => updateTask(item.id, { order: order + 1 })));
      fetchData();
    } catch (err) {
      console.error('Failed to reorder task', err);
      setError("Couldn't reorder this task.");
    }
  };
  const openNewTask = () => {
    if (inbox) navigation.navigate('TaskEntry');
    else navigation.navigate('TaskEntry', { projectId: project?.id });
  };

  return (
    <ScreenLayout
      title={inbox ? 'INBOX' : project?.name || 'PROJECT'}
      showBack
      rightOption={{
        render: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            {!inbox && project && (
              <ActionButton icon={IconEdit} onPress={() => navigation.navigate('ProjectEntry', { project })} size={40} />
            )}
            <ActionButton icon={IconPlus} onPress={openNewTask} size={40} />
          </View>
        ),
      }}
    >
      <ScrollView
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        <ErrorMessage message={error} />
        <TaskList
          tasks={tasks}
          taskColor={entityColors.tasks}
          emptyLabel={inbox ? 'No standalone tasks.' : 'No tasks yet.'}
          onToggle={handleToggleTask}
          onOpenTask={(task) => navigation.navigate('TaskEntry', { task })}
          onAddSubtask={(task) => navigation.navigate('TaskEntry', { parentId: task.id, projectId: task.project })}
          onMove={moveTask}
        />
      </ScrollView>
    </ScreenLayout>
  );
}
