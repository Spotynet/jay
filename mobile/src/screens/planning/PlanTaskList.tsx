import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { IconArrowDown, IconArrowUp, IconChevronDown, IconChevronRight, IconPlus } from 'tabler-icons-react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../../components/ui/AppText';
import { Icon } from '../../components/ui/Icon';
import { toLocalDateString, parseLocalDate } from '../../utils/date';

export type PlanTask = {
  id: number;
  name: string;
  status: string;
  parent: number | null;
  project: number | null;
  due_date?: string | null;
  due_time?: string | null;
  order?: number;
};

export function isListed(task: PlanTask) {
  return task.status !== 'ARCHIVED';
}

export function formatDueLabel(due: string) {
  return parseLocalDate(due).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function relativeDay(due?: string | null) {
  if (!due) return null;
  const today = new Date();
  const todayStr = toLocalDateString(today);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (due === todayStr) return 'Today';
  if (due === toLocalDateString(tomorrow)) return 'Tomorrow';
  const date = parseLocalDate(due);
  const diffDays = Math.round((date.getTime() - parseLocalDate(todayStr).getTime()) / 86400000);
  if (diffDays > 1 && diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }
  return formatDueLabel(due);
}

export function compareTasks(a: PlanTask, b: PlanTask) {
  const orderDiff = (a.order || 0) - (b.order || 0);
  if (orderDiff !== 0) return orderDiff;
  return (a.due_date || '').localeCompare(b.due_date || '');
}

export function TaskList({
  tasks,
  taskColor,
  emptyLabel,
  onToggle,
  onOpenTask,
  onAddSubtask,
  onMove,
  taskMeta,
}: {
  tasks: PlanTask[];
  taskColor: string;
  emptyLabel: string;
  onToggle: (taskId: number) => void;
  onOpenTask: (task: PlanTask) => void;
  onAddSubtask: (task: PlanTask) => void;
  onMove?: (task: PlanTask, direction: 'up' | 'down') => void;
  taskMeta?: (task: PlanTask) => string;
}) {
  const { colors } = useTheme();
  const [completedOpen, setCompletedOpen] = useState(false);
  const openParents = tasks.filter((task) => {
    if (task.status === 'COMPLETED') return false;
    if (task.parent == null) return true;
    return !tasks.some((item) => item.id === task.parent && item.status !== 'COMPLETED');
  });
  const completed = tasks.filter((task) => task.status === 'COMPLETED');
  const childrenOf = (parentId: number, source: PlanTask[]) =>
    source.filter((task) => task.parent === parentId);

  return (
    <View>
      {openParents.length === 0 ? (
        <AppText style={[styles.emptyTasks, { color: colors.subtext }]}>{emptyLabel}</AppText>
      ) : (
        openParents.map((task) => (
          <View key={task.id}>
            <TaskRow
              task={task}
              taskColor={taskColor}
              contextLabel={taskMeta?.(task)}
              onToggle={() => onToggle(task.id)}
              onPress={() => onOpenTask(task)}
              onAddSubtask={() => onAddSubtask(task)}
              onMove={onMove}
            />
            {childrenOf(task.id, tasks).filter((child) => child.status !== 'COMPLETED').length > 0 && (
              <View style={[styles.subtaskGuide, { borderLeftColor: colors.border }]}>
                {childrenOf(task.id, tasks)
                  .filter((child) => child.status !== 'COMPLETED')
                  .map((child) => (
                    <TaskRow
                      key={child.id}
                      task={child}
                      taskColor={taskColor}
                      contextLabel={taskMeta?.(child)}
                      onToggle={() => onToggle(child.id)}
                      onPress={() => onOpenTask(child)}
                      onMove={onMove}
                    />
                  ))}
              </View>
            )}
          </View>
        ))
      )}

      {completed.length > 0 && (
        <View style={styles.completedBlock}>
          <TouchableOpacity style={styles.doneHeader} onPress={() => setCompletedOpen((open) => !open)} activeOpacity={0.7}>
            <AppText style={[styles.doneTitle, { color: colors.subtext }]}>{completed.length} completed</AppText>
            <Icon name={completedOpen ? IconChevronDown : IconChevronRight} size={16} color={colors.subtext} />
          </TouchableOpacity>
          {completedOpen && completed.filter((task) => task.parent == null || !completed.some((item) => item.id === task.parent)).map((task) => (
            <View key={task.id}>
              <TaskRow
                task={task}
                taskColor={taskColor}
                contextLabel={taskMeta?.(task)}
                indent={task.parent != null}
                onToggle={() => onToggle(task.id)}
                onPress={() => onOpenTask(task)}
              />
              {task.parent == null && childrenOf(task.id, completed).length > 0 && (
                <View style={[styles.subtaskGuide, { borderLeftColor: colors.border }]}>
                  {childrenOf(task.id, completed).map((child) => (
                    <TaskRow
                      key={child.id}
                      task={child}
                      taskColor={taskColor}
                      contextLabel={taskMeta?.(child)}
                      onToggle={() => onToggle(child.id)}
                      onPress={() => onOpenTask(child)}
                    />
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function TaskRow({
  task,
  taskColor,
  indent,
  contextLabel,
  onToggle,
  onPress,
  onAddSubtask,
  onMove,
}: {
  task: PlanTask;
  taskColor: string;
  indent?: boolean;
  contextLabel?: string;
  onToggle: () => void;
  onPress: () => void;
  onAddSubtask?: () => void;
  onMove?: (task: PlanTask, direction: 'up' | 'down') => void;
}) {
  const { colors } = useTheme();
  const done = task.status === 'COMPLETED';
  const timeBit = task.due_time ? task.due_time.slice(0, 5) : null;
  const timeLabel = contextLabel
    ? [contextLabel, timeBit].filter(Boolean).join(' · ')
    : [relativeDay(task.due_date), timeBit].filter(Boolean).join(' · ');

  return (
    <View style={[styles.taskRow, indent && styles.taskIndent, { borderBottomColor: colors.border + '30' }]}>
      <TouchableOpacity
        style={[styles.checkbox, { borderColor: taskColor, backgroundColor: done ? taskColor : 'transparent' }]}
        onPress={onToggle}
        hitSlop={6}
      >
        {done && <AppText style={styles.checkmark}>✓</AppText>}
      </TouchableOpacity>
      <TouchableOpacity style={styles.taskBody} onPress={onPress} activeOpacity={0.7}>
        <AppText
          style={[
            styles.taskName,
            {
              color: colors.text,
              textDecorationLine: done ? 'line-through' : 'none',
              opacity: done ? 0.6 : 1,
            },
          ]}
          numberOfLines={1}
        >
          {task.name}
        </AppText>
        {timeLabel ? (
          <AppText style={[styles.taskMeta, { color: colors.subtext }]} numberOfLines={1}>{timeLabel}</AppText>
        ) : null}
      </TouchableOpacity>
      {onMove && !done ? (
        <View style={styles.moveButtons}>
          <TouchableOpacity onPress={() => onMove(task, 'up')} hitSlop={6}>
            <Icon name={IconArrowUp} size={14} color={colors.subtext} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onMove(task, 'down')} hitSlop={6}>
            <Icon name={IconArrowDown} size={14} color={colors.subtext} />
          </TouchableOpacity>
        </View>
      ) : null}
      {onAddSubtask ? (
        <TouchableOpacity onPress={onAddSubtask} hitSlop={8} style={styles.addButton}>
          <Icon name={IconPlus} size={14} color={colors.subtext} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyTasks: { fontSize: 13, paddingVertical: 8 },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: 1,
  },
  taskIndent: { marginLeft: 26 },
  subtaskGuide: {
    marginLeft: 10,
    paddingLeft: 16,
    borderLeftWidth: 1,
  },
  completedBlock: { marginTop: 4 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  taskBody: { flex: 1 },
  taskName: { fontSize: 15, fontWeight: '500' },
  taskMeta: { fontSize: 12, marginTop: 2 },
  addButton: { padding: 4 },
  moveButtons: { gap: 2 },
  doneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  doneTitle: { fontSize: 13, fontWeight: '500' },
});
