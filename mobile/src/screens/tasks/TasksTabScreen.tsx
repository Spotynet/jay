import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { IconPlus, IconTarget, IconChecklist, IconCalendarEvent, IconChevronRight } from 'tabler-icons-react-native';
import ScreenLayout from '../../components/common/ScreenLayout';
import Card from '../../components/common/Card';
import { AppText } from '../../components/ui/AppText';
import { Icon } from '../../components/ui/Icon';
import { getGoals } from '../../api/planning';
import { getProjects } from '../../api/projects';
import { getAllTasks, toggleTaskCompletion } from '../../api/tasks';
import { getEventsForDate } from '../../api/events';
import { ActionButton } from '../../components/common/ActionButton';
import { toLocalDateString } from '../../utils/date';

export default function TasksTabScreen() {
  const { colors, entityColors } = useTheme();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const [refreshing, setRefreshing] = useState(false);

  const [goals, setGoals] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  const todayStr = toLocalDateString(new Date());

  const fetchData = async () => {
    try {
      const [goalsData, projectsData, tasksData, eventsData] = await Promise.all([
        getGoals().catch(() => []),
        getProjects().catch(() => []),
        getAllTasks().catch(() => []),
        getEventsForDate(todayStr).catch(() => []),
      ]);
      setGoals(goalsData);
      setProjects(projectsData);
      setTasks(tasksData);
      setEvents(eventsData);
    } catch (e) {
      console.error('Failed to fetch dashboard data:', e);
    }
  };

  useEffect(() => {
    if (isFocused) fetchData();
  }, [isFocused]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  const activeTasks = tasks.filter(t => t.status !== 'COMPLETED').slice(0, 5);
  const activeProjects = projects.filter(p => p.status === 'ACTIVE');
  const incompleteGoals = goals.filter(g => !g.completed);

  const handleToggleTask = async (taskId: number) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: t.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED' } : t));
    try {
      await toggleTaskCompletion(taskId);
      fetchData();
    } catch (e) {
      fetchData();
    }
  };

  return (
    <ScreenLayout 
      title="PLAN"
      rightOption={{
        icon: () => <Icon name={IconPlus} size={20} color={colors.text} />,
        onPress: () => navigation.navigate('TaskEntry')
      }}
    >
      <ScrollView 
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        {/* Goals Section */}
        <Section
          title="GOALS"
          icon={IconTarget}
          color={entityColors.habits}
          count={incompleteGoals.length}
          onSeeAll={() => {}}
          onAdd={() => {}}
        >
          {incompleteGoals.length === 0 ? (
            <EmptySection message="No goals yet. Start planning your areas." />
          ) : (
            incompleteGoals.slice(0, 3).map((goal) => (
              <View key={goal.id} style={[styles.goalRow, { borderBottomColor: colors.border }]}>
                <View style={[styles.goalDot, { backgroundColor: entityColors.habits }]} />
                <View style={styles.goalContent}>
                  <AppText style={[styles.goalTitle, { color: colors.text }]} numberOfLines={1}>{goal.title}</AppText>
                  {goal.target_date && (
                    <AppText style={[styles.goalMeta, { color: colors.subtext }]}>{goal.target_date}</AppText>
                  )}
                </View>
              </View>
            ))
          )}
        </Section>

        {/* Projects Section */}
        <Section
          title="PROJECTS"
          icon={IconChecklist}
          color={entityColors.tasks}
          count={activeProjects.length}
          onSeeAll={() => {}}
          onAdd={() => navigation.navigate('ProjectEntry')}
        >
          {activeProjects.length === 0 ? (
            <EmptySection message="No active projects. Create one to get started." />
          ) : (
            activeProjects.slice(0, 3).map((project) => (
              <TouchableOpacity 
                key={project.id} 
                style={[styles.projectCard, { backgroundColor: colors.surface }]}
                onPress={() => navigation.navigate('ProjectEntry', { project })}
                activeOpacity={0.7}
              >
                <View style={styles.projectHeader}>
                  <AppText style={[styles.projectName, { color: colors.text }]} numberOfLines={1}>{project.name}</AppText>
                  <View style={[styles.statusBadge, { backgroundColor: entityColors.tasks + '20' }]}>
                    <AppText style={[styles.statusText, { color: entityColors.tasks }]}>{project.status}</AppText>
                  </View>
                </View>
                {project.description ? (
                  <AppText style={[styles.projectDesc, { color: colors.subtext }]} numberOfLines={1}>{project.description}</AppText>
                ) : null}
                {project.due_date && (
                  <AppText style={[styles.projectMeta, { color: colors.subtext }]}>Due: {project.due_date}</AppText>
                )}
              </TouchableOpacity>
            ))
          )}
        </Section>

        {/* Today's Tasks Section */}
        <Section
          title="TODAY'S TASKS"
          icon={IconChecklist}
          color={entityColors.tasks}
          count={activeTasks.length}
          onSeeAll={() => navigation.navigate('TasksSettings')}
          onAdd={() => navigation.navigate('TaskEntry')}
        >
          {activeTasks.length === 0 ? (
            <EmptySection message="No tasks for today. You're all caught up!" />
          ) : (
            activeTasks.map((task) => (
              <TouchableOpacity 
                key={task.id}
                style={[styles.taskRow, { borderBottomColor: colors.border }]}
                onPress={() => navigation.navigate('TaskEntry', { task })}
                activeOpacity={0.7}
              >
                <TouchableOpacity 
                  style={[styles.checkbox, { borderColor: task.status === 'COMPLETED' ? entityColors.tasks : colors.border, backgroundColor: task.status === 'COMPLETED' ? entityColors.tasks : 'transparent' }]}
                  onPress={() => handleToggleTask(task.id)}
                >
                  {task.status === 'COMPLETED' && <AppText style={styles.checkmark}>✓</AppText>}
                </TouchableOpacity>
                <View style={styles.taskContent}>
                  <AppText 
                    style={[styles.taskName, { color: colors.text, textDecorationLine: task.status === 'COMPLETED' ? 'line-through' : 'none', opacity: task.status === 'COMPLETED' ? 0.6 : 1 }]} 
                    numberOfLines={1}
                  >
                    {task.name}
                  </AppText>
                  {task.due_time && (
                    <AppText style={[styles.taskTime, { color: colors.subtext }]}>{task.due_time.slice(0, 5)}</AppText>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </Section>

        {/* Events Section */}
        <Section
          title="UPCOMING EVENTS"
          icon={IconCalendarEvent}
          color={entityColors.events}
          count={events.length}
          onSeeAll={() => {}}
          onAdd={() => navigation.navigate('EventEntry')}
        >
          {events.length === 0 ? (
            <EmptySection message="No events scheduled for today." />
          ) : (
            events.slice(0, 3).map((event) => (
              <View key={event.id} style={[styles.eventRow, { borderBottomColor: colors.border }]}>
                <View style={[styles.eventTimeBadge, { backgroundColor: entityColors.events + '20' }]}>
                  <AppText style={[styles.eventTime, { color: entityColors.events }]}>{event.start_time?.slice(0, 5) || 'TBD'}</AppText>
                </View>
                <View style={styles.eventContent}>
                  <AppText style={[styles.eventName, { color: colors.text }]} numberOfLines={1}>{event.name}</AppText>
                  {event.location ? (
                    <AppText style={[styles.eventLocation, { color: colors.subtext }]} numberOfLines={1}>{event.location}</AppText>
                  ) : null}
                </View>
              </View>
            ))
          )}
        </Section>
      </ScrollView>
    </ScreenLayout>
  );
}

function Section({ title, icon, color, count, onSeeAll, onAdd, children }: {
  title: string;
  icon: any;
  color: string;
  count: number;
  onSeeAll: () => void;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Icon name={icon} size={18} color={color} />
          <AppText style={[styles.sectionTitle, { color: colors.subtext }]}>{title}</AppText>
          {count > 0 && (
            <View style={[styles.countBadge, { backgroundColor: color + '20' }]}>
              <AppText style={[styles.countText, { color }]}>{count}</AppText>
            </View>
          )}
        </View>
        <View style={styles.sectionActions}>
          <TouchableOpacity onPress={onAdd} style={styles.sectionAction} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon name={IconPlus} size={18} color={colors.subtext} />
          </TouchableOpacity>
          {count > 0 && (
            <TouchableOpacity onPress={onSeeAll} style={styles.sectionAction} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Icon name={IconChevronRight} size={18} color={colors.subtext} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );
}

function EmptySection({ message }: { message: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.emptySection}>
      <AppText style={[styles.emptyText, { color: colors.subtext }]}>{message}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flex: 1 },
  scrollContentContainer: { paddingBottom: 100 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 2 },
  sectionActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sectionAction: { padding: 4 },
  sectionContent: { paddingHorizontal: 20 },
  countBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  countText: { fontSize: 11, fontWeight: '700' },
  // Goal styles
  goalRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5 },
  goalDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  goalContent: { flex: 1 },
  goalTitle: { fontSize: 15, fontWeight: '500' },
  goalMeta: { fontSize: 12, marginTop: 2 },
  // Project styles
  projectCard: { padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 8 },
  projectHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  projectName: { fontSize: 15, fontWeight: '600', flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '600' },
  projectDesc: { fontSize: 13, marginBottom: 4 },
  projectMeta: { fontSize: 12 },
  // Task styles
  taskRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5 },
  checkbox: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  checkmark: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  taskContent: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  taskName: { fontSize: 15, fontWeight: '500', flex: 1 },
  taskTime: { fontSize: 12, marginLeft: 8 },
  // Event styles
  eventRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5 },
  eventTimeBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginRight: 12 },
  eventTime: { fontSize: 12, fontWeight: '700' },
  eventContent: { flex: 1 },
  eventName: { fontSize: 15, fontWeight: '500' },
  eventLocation: { fontSize: 12, marginTop: 2 },
  // Empty state
  emptySection: { paddingVertical: 20, alignItems: 'center' },
  emptyText: { fontSize: 13, textAlign: 'center' },
});
