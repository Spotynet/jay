import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { IconChecklist, IconChevronDown, IconChevronRight, IconFolder, IconInbox, IconPlus } from 'tabler-icons-react-native';
import { useTheme } from '../../context/ThemeContext';
import ScreenLayout from '../../components/common/ScreenLayout';
import SectionCard from '../../components/common/SectionCard';
import SegmentedTabs from '../../components/common/SegmentedTabs';
import { AppText } from '../../components/ui/AppText';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { Icon } from '../../components/ui/Icon';
import { getProjects } from '../../api/projects';
import { getAllTasks, toggleTaskCompletion } from '../../api/tasks';
import { CreateNewModal } from '../today/components/CreateNewModal';
import { toLocalDateString } from '../../utils/date';
import {
  PlanTask,
  TaskList,
  compareTasks,
  formatDueLabel,
  isListed,
  relativeDay,
} from './PlanTaskList';

type Project = {
  id: number;
  name: string;
  status: string;
  due_date?: string | null;
  color?: string;
  description?: string;
};

function projectNameFor(task: PlanTask, projects: Project[]) {
  if (task.project == null) return 'Inbox';
  return projects.find((project) => project.id === task.project)?.name || 'Inbox';
}

export default function PlanScreen() {
  const { colors, entityColors } = useTheme();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const taskColor = entityColors.tasks;

  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<PlanTask[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [doneOpen, setDoneOpen] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [segment, setSegment] = useState('Projects');
  const [query, setQuery] = useState('');

  const fetchData = useCallback(async (opts?: { keepError?: boolean }) => {
    try {
      const [projectData, taskData] = await Promise.all([
        getProjects(),
        getAllTasks(),
      ]);
      setProjects(Array.isArray(projectData) ? projectData : []);
      const listed = (Array.isArray(taskData) ? taskData : []).filter(isListed).slice().sort(compareTasks);
      setTasks(listed);
      if (!opts?.keepError) setError(null);
    } catch (err) {
      console.error('Failed to fetch plan data', err);
      setError("Couldn't load your plan.");
    }
  }, []);

  useEffect(() => {
    if (isFocused) fetchData();
  }, [isFocused, fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const inboxTasks = tasks.filter((task) => task.project == null);
  const activeProjects = projects.filter((project) => project.status === 'ACTIVE');
  const doneProjects = projects.filter((project) => project.status === 'COMPLETED' || project.status === 'ARCHIVED');
  const isEmpty = projects.length === 0 && inboxTasks.length === 0;
  const todayStr = toLocalDateString(new Date());
  const needle = query.trim().toLowerCase();
  const matchesName = (name: string) => !needle || name.toLowerCase().includes(needle);
  const visibleActive = activeProjects.filter((project) => matchesName(project.name));
  const visibleDone = doneProjects.filter((project) => matchesName(project.name));
  const showInbox = matchesName('Inbox');

  const counts = (list: PlanTask[]) => {
    const open = list.filter((task) => task.status !== 'COMPLETED').length;
    return { open, total: list.length };
  };

  const upcomingGroups = tasks
    .filter((task) => task.due_date && task.due_date >= todayStr && task.status !== 'COMPLETED')
    .reduce((groups: { date: string; tasks: PlanTask[] }[], task) => {
      const found = groups.find((group) => group.date === task.due_date);
      if (found) found.tasks.push(task);
      else groups.push({ date: task.due_date as string, tasks: [task] });
      return groups;
    }, [])
    .sort((a, b) => a.date.localeCompare(b.date));

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

  return (
    <ScreenLayout
      title="PLAN"
      rightOption={{
        icon: IconPlus,
        onPress: () => setShowCreateMenu(true),
      }}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        <ErrorMessage message={error} />
        <SegmentedTabs tabs={['Projects', 'Upcoming']} active={segment} onChange={setSegment} />

        {segment === 'Upcoming' ? (
          upcomingGroups.length === 0 ? (
            <View style={styles.emptyWrap}>
              <AppText style={[styles.emptyTitle, { color: colors.text }]}>Nothing scheduled</AppText>
              <AppText style={[styles.emptyBody, { color: colors.subtext }]}>
                Tasks with a date show up here.
              </AppText>
            </View>
          ) : (
            upcomingGroups.map((group) => (
              <View key={group.date} style={styles.upcomingGroup}>
                <AppText style={[styles.upcomingTitle, { color: colors.text }]}>
                  {relativeDay(group.date) || group.date}
                </AppText>
                <TaskList
                  tasks={group.tasks}
                  taskColor={taskColor}
                  emptyLabel="No tasks."
                  onToggle={handleToggleTask}
                  onOpenTask={(task) => navigation.navigate('TaskEntry', { task })}
                  onAddSubtask={(task) => navigation.navigate('TaskEntry', { parentId: task.id, projectId: task.project, date: group.date })}
                  taskMeta={(task) => projectNameFor(task, projects)}
                />
              </View>
            ))
          )
        ) : (
          <>
            {segment === 'Projects' && (
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search projects"
                placeholderTextColor={colors.subtext}
                style={[styles.search, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
              />
            )}

            {isEmpty && (
              <View style={styles.emptyWrap}>
                <AppText style={[styles.emptyTitle, { color: colors.text }]}>Nothing planned yet</AppText>
                <AppText style={[styles.emptyBody, { color: colors.subtext }]}>
                  Add a project, or a task that stands on its own.
                </AppText>
              </View>
            )}

            {showInbox && (
            <DirectoryRow
              title="Inbox"
              icon={IconInbox}
              counts={counts(inboxTasks)}
              color={colors.text}
              onPress={() => navigation.navigate('ProjectTasks', { inbox: true })}
            />
            )}

            {visibleActive.map((project) => (
              <DirectoryRow
                key={project.id}
                title={project.name}
                icon={IconFolder}
                dueDate={project.due_date}
                status={project.status}
                counts={counts(tasks.filter((task) => task.project === project.id))}
                color={project.color || taskColor}
                onPress={() => navigation.navigate('ProjectTasks', { project })}
              />
            ))}

            {visibleDone.length > 0 && (
              <View style={styles.doneBlock}>
                <TouchableOpacity
                  style={styles.doneHeader}
                  onPress={() => setDoneOpen((open) => !open)}
                  activeOpacity={0.7}
                >
                  <AppText style={[styles.doneTitle, { color: colors.subtext }]}>
                    {visibleDone.length} completed
                  </AppText>
                  <Icon name={doneOpen ? IconChevronDown : IconChevronRight} size={16} color={colors.subtext} />
                </TouchableOpacity>
                {doneOpen && visibleDone.map((project) => (
                  <DirectoryRow
                    key={project.id}
                    title={project.name}
                    icon={IconFolder}
                    meta={project.status === 'ARCHIVED' ? 'Archived' : 'Completed'}
                    counts={counts(tasks.filter((task) => task.project === project.id))}
                    color={project.color || colors.subtext}
                    onPress={() => navigation.navigate('ProjectTasks', { project })}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <CreateNewModal
        visible={showCreateMenu}
        onClose={() => setShowCreateMenu(false)}
        title="Creation Hub"
        options={[
          { id: 'Project', label: 'NEW PROJECT', sub: 'GROUP RELATED TASKS', icon: IconFolder, entityKey: 'tasks' },
          { id: 'Task', label: 'NEW TASK', sub: 'A SINGLE NEXT STEP', icon: IconChecklist, entityKey: 'tasks' },
        ]}
        onSelect={(id) => {
          setShowCreateMenu(false);
          if (id === 'Project') navigation.navigate('ProjectEntry');
          else navigation.navigate('TaskEntry');
        }}
      />
    </ScreenLayout>
  );
}

function DirectoryRow({
  title,
  icon,
  dueDate,
  status,
  meta,
  counts,
  color,
  onPress,
}: {
  title: string;
  icon: any;
  dueDate?: string | null;
  status?: string;
  meta?: string;
  counts: { open: number; total: number };
  color: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const todayStr = toLocalDateString(new Date());
  const overdue = !!(dueDate && status === 'ACTIVE' && dueDate < todayStr);
  const dueLabel = dueDate ? formatDueLabel(dueDate) : meta;
  const doneRatio = counts.total > 0 ? (counts.total - counts.open) / counts.total : 0;

  return (
    <SectionCard>
      <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
        <View style={[styles.iconWell, { backgroundColor: color + '18' }]}>
          <Icon name={icon} size={18} color={color} />
        </View>
        <View style={styles.rowText}>
          <AppText style={[styles.rowTitle, { color: colors.text }]} numberOfLines={1}>{title}</AppText>
          {dueLabel ? (
            <AppText style={[styles.rowMeta, { color: overdue ? colors.error : colors.subtext }]} numberOfLines={1}>
              {dueLabel}
            </AppText>
          ) : null}
          {counts.total > 0 && (
            <View style={[styles.track, { backgroundColor: colors.border + '55' }]}>
              <View style={[styles.fill, { width: `${Math.round(doneRatio * 100)}%`, backgroundColor: color }]} />
            </View>
          )}
        </View>
        <View style={styles.rowEnd}>
          {counts.total > 0 && (
            <AppText style={[styles.rowCount, { color: colors.subtext }]}>{counts.open} / {counts.total}</AppText>
          )}
          <Icon name={IconChevronRight} size={16} color={colors.subtext} />
        </View>
      </TouchableOpacity>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: 16,
    paddingBottom: 32,
    gap: 16,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  emptyTitle: { fontSize: 16, fontWeight: '600' },
  emptyBody: { fontSize: 13, textAlign: 'center' },
  upcomingGroup: { gap: 4 },
  upcomingTitle: { fontSize: 16, fontWeight: '600' },
  search: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWell: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { fontSize: 16, fontWeight: '600' },
  rowMeta: { fontSize: 12 },
  track: { height: 3, borderRadius: 2, marginTop: 6, overflow: 'hidden' },
  fill: { height: 3, borderRadius: 2 },
  rowEnd: { alignItems: 'flex-end', gap: 6 },
  rowCount: { fontSize: 12, fontWeight: '600' },
  doneBlock: { gap: 4 },
  doneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  doneTitle: { fontSize: 13, fontWeight: '500' },
});
