import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, Switch } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../../components/ui/AppText';
import { Icon } from '../../components/ui/Icon';
import FormScreen from '../../components/common/FormScreen';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import AppDatePicker from '../../components/common/AppDatePicker';
import { AppTimePicker } from '../../components/common/AppTimePicker';
import { IconEdit, IconPlus } from 'tabler-icons-react-native';
import { createTask, updateTask, deleteTask, getTaskById } from '../../api/tasks';
import { getProjects } from '../../api/projects';
import DeleteConfirm from '../../components/ui/DeleteConfirm';
import { toLocalDateString, parseLocalDate } from '../../utils/date';

type ProjectOption = { id: number; name: string; status: string };

export default function TaskEntryScreen() {
  const { colors, accentColor } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const isFocused = useIsFocused();
  const task = route.params?.task;
  const parentId = route.params?.parentId;

  const [name, setName] = useState(task?.name || '');
  const [description, setDescription] = useState(task?.description || '');
  const hasParent = !!(parentId || task?.parent);
  const [hasDate, setHasDate] = useState(!!(task?.due_date || route.params?.date));
  const [date, setDate] = useState(
    task?.due_date
      ? parseLocalDate(task.due_date)
      : route.params?.date
        ? parseLocalDate(route.params.date)
        : new Date()
  );
  const [time, setTime] = useState(task?.due_time ? new Date(`1970-01-01T${task.due_time}`) : new Date());
  const [hasTime, setHasTime] = useState(!!task?.due_time);
  const [hasDuration, setHasDuration] = useState(!!task?.duration);
  const [hours, setHours] = useState(task?.duration ? parseInt(task.duration.split(':')[0], 10) : 0);
  const [minutes, setMinutes] = useState(task?.duration ? parseInt(task.duration.split(':')[1], 10) : 15);
  const [projectId, setProjectId] = useState<number | null>(task?.project ?? route.params?.projectId ?? null);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subtasks, setSubtasks] = useState<any[]>(Array.isArray(task?.subtasks) ? task.subtasks : []);

  useEffect(() => {
    if (!isFocused) return;
    getProjects()
      .then((data) => setProjects(Array.isArray(data) ? data : []))
      .catch(() => {});
    if (task?.id && !hasParent) {
      getTaskById(task.id)
        .then((data) => setSubtasks(Array.isArray(data?.subtasks) ? data.subtasks : []))
        .catch(() => {});
    }
  }, [isFocused, task?.id, hasParent]);

  const projectOptions = projects.filter(
    (project) => project.status === 'ACTIVE' || project.id === projectId
  );

  const saveTask = async () => {
    if (loading) return;
    if (!name.trim()) {
      setError('Enter a task name.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const data: {
        name: string;
        description: string;
        due_date: string | null;
        due_time: string | null;
        duration: string | null;
        status: string;
        project: number | null;
        parent?: number;
      } = {
        name: name.trim(),
        description,
        due_date: hasDate ? toLocalDateString(date) : null,
        due_time: hasDate && hasTime ? time.toTimeString().slice(0, 5) : null,
        duration: hasDuration ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00` : null,
        status: task?.status || 'PENDING',
        project: projectId,
      };
      const parent = parentId || task?.parent;
      if (parent) data.parent = parent;

      if (task) await updateTask(task.id, data);
      else await createTask(data);
      navigation.goBack();
    } catch (e) {
      setError("Couldn't save this task.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    try {
      await deleteTask(task.id);
      setDeleteModalVisible(false);
      navigation.goBack();
    } catch (e) {
      setDeleteModalVisible(false);
      setError("Couldn't delete this task.");
    }
  };

  return (
    <FormScreen
      title={task ? 'EDIT TASK' : 'NEW TASK'}
      showBack
      rightOption={task ? {
        render: () => (
          <TouchableOpacity onPress={() => setDeleteModalVisible(true)}>
            <AppText style={[styles.deleteText, { color: colors.error }]}>Delete</AppText>
          </TouchableOpacity>
        ),
      } : undefined}
      submitTitle="Save Task"
      onSubmit={saveTask}
      loading={loading}
      error={error}
      submitStyle={{ backgroundColor: accentColor }}
    >
      <View style={styles.field}>
        <AppText style={[styles.label, { color: colors.subtext }]}>NAME</AppText>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          placeholder="Task name"
          placeholderTextColor={colors.subtext}
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.field}>
        <AppText style={[styles.label, { color: colors.subtext }]}>DESCRIPTION</AppText>
        <TextInput
          style={[styles.input, styles.textArea, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          placeholder="Optional description"
          placeholderTextColor={colors.subtext}
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />
      </View>

      {hasParent ? null : (
      <View style={styles.field}>
        <AppText style={[styles.label, { color: colors.subtext }]}>PROJECT</AppText>
        <View style={styles.chipRow}>
          <TouchableOpacity
            style={[styles.chip, { backgroundColor: projectId == null ? accentColor : colors.surface, borderColor: projectId == null ? accentColor : colors.border }]}
            onPress={() => setProjectId(null)}
          >
            <AppText style={[styles.chipText, { color: projectId == null ? '#FFFFFF' : colors.text }]}>None</AppText>
          </TouchableOpacity>
          {projectOptions.map((project) => {
            const selected = projectId === project.id;
            return (
              <TouchableOpacity
                key={project.id}
                style={[styles.chip, { backgroundColor: selected ? accentColor : colors.surface, borderColor: selected ? accentColor : colors.border }]}
                onPress={() => setProjectId(project.id)}
              >
                <AppText style={[styles.chipText, { color: selected ? '#FFFFFF' : colors.text }]}>{project.name}</AppText>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      )}

      <View style={[styles.field, styles.switchCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.switchHeader}>
          <AppText style={[styles.label, { color: colors.subtext, marginBottom: 0 }]}>DATE</AppText>
          <Switch
            value={hasDate}
            onValueChange={(on) => {
              setHasDate(on);
              if (!on) setHasTime(false);
            }}
            trackColor={{ true: accentColor }}
          />
        </View>
        {hasDate && (
          <TouchableOpacity style={styles.pickerRow} onPress={() => setShowDatePicker(true)}>
            <AppText style={{ color: colors.text, fontSize: 16 }}>{date.toLocaleDateString()}</AppText>
            <Icon name={IconEdit} size={20} color={colors.subtext} />
          </TouchableOpacity>
        )}
      </View>

      {hasDate && (
      <View style={[styles.field, styles.switchCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.switchHeader}>
          <AppText style={[styles.label, { color: colors.subtext, marginBottom: 0 }]}>TIME</AppText>
          <Switch value={hasTime} onValueChange={setHasTime} trackColor={{ true: accentColor }} />
        </View>
        {hasTime && (
          <TouchableOpacity style={styles.pickerRow} onPress={() => setShowTimePicker(true)}>
            <AppText style={{ color: colors.text, fontSize: 16 }}>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</AppText>
            <Icon name={IconEdit} size={20} color={colors.subtext} />
          </TouchableOpacity>
        )}
      </View>
      )}

      <View style={[styles.field, styles.switchCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.switchHeader}>
          <AppText style={[styles.label, { color: colors.subtext, marginBottom: 0 }]}>DURATION</AppText>
          <Switch value={hasDuration} onValueChange={setHasDuration} trackColor={{ true: accentColor }} />
        </View>
        {hasDuration && (
          <View style={styles.durationRow}>
            <View style={styles.durationField}>
              <TextInput
                style={[styles.smallInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                keyboardType="numeric"
                value={String(hours)}
                onChangeText={(v) => setHours(parseInt(v, 10) || 0)}
                placeholder="0"
                placeholderTextColor={colors.subtext}
              />
              <AppText style={{ color: colors.subtext }}>H</AppText>
            </View>
            <View style={styles.durationField}>
              <TextInput
                style={[styles.smallInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                keyboardType="numeric"
                value={String(minutes)}
                onChangeText={(v) => setMinutes(parseInt(v, 10) || 0)}
                placeholder="0"
                placeholderTextColor={colors.subtext}
              />
              <AppText style={{ color: colors.subtext }}>M</AppText>
            </View>
          </View>
        )}
      </View>

      {task && !hasParent && (
        <View style={styles.field}>
          <View style={styles.switchHeader}>
            <AppText style={[styles.label, { color: colors.subtext, marginBottom: 0 }]}>SUBTASKS</AppText>
            <TouchableOpacity
              onPress={() => navigation.navigate('TaskEntry', { parentId: task.id, projectId: task.project })}
              hitSlop={8}
            >
              <Icon name={IconPlus} size={16} color={colors.text} />
            </TouchableOpacity>
          </View>
          {subtasks.length === 0 ? (
            <AppText style={[styles.subtaskEmpty, { color: colors.subtext }]}>No subtasks yet.</AppText>
          ) : (
            subtasks.map((subtask) => (
              <TouchableOpacity
                key={subtask.id}
                style={styles.subtaskRow}
                onPress={() => navigation.navigate('TaskEntry', { task: subtask })}
              >
                <AppText style={{ color: colors.text, fontSize: 15 }} numberOfLines={1}>{subtask.name}</AppText>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}

      <AppDatePicker visible={showDatePicker} onClose={() => setShowDatePicker(false)} value={date} onChange={setDate} mode="date" label="Select Date" />
      <AppTimePicker visible={showTimePicker} onClose={() => setShowTimePicker(false)} value={time} onChange={setTime} label="Select Time" />
      <DeleteConfirm
        visible={deleteModalVisible}
        title="Delete Task"
        message={`Are you sure you want to delete "${task?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
      />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 24 },
  label: { fontSize: 11, fontWeight: '600', letterSpacing: 1.5, marginBottom: 8 },
  input: { borderRadius: 12, borderWidth: 1, padding: 16, fontSize: 16 },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 14, fontWeight: '500' },
  pickerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  switchCard: { borderRadius: 12, borderWidth: 1, padding: 16 },
  switchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  durationRow: { flexDirection: 'row', gap: 16, marginTop: 12 },
  durationField: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  smallInput: { padding: 8, borderRadius: 8, borderWidth: 1, width: 52, textAlign: 'center' },
  deleteText: { fontSize: 14, fontWeight: '600' },
  subtaskEmpty: { fontSize: 13, marginTop: 10 },
  subtaskRow: { paddingVertical: 10 },
});
