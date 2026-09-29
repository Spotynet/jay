import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import FormScreen from '../../components/common/FormScreen';
import { AppText } from '../../components/ui/AppText';
import ColorSwatchPicker from '../../components/ui/ColorSwatchPicker';
import { createProject, updateProject, deleteProject } from '../../api/projects';
import DeleteConfirm from '../../components/ui/DeleteConfirm';
import { toLocalDateString, parseLocalDate } from '../../utils/date';

export default function ProjectEntryScreen() {
  const { colors, accentColor } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const existingProject = route.params?.project;

  const [name, setName] = useState(existingProject?.name || '');
  const [description, setDescription] = useState(existingProject?.description || '');
  const [color, setColor] = useState(existingProject?.color || '');
  const [dueDate, setDueDate] = useState<Date | null>(existingProject?.due_date ? parseLocalDate(existingProject.due_date) : null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Enter a project name.');
      return;
    }
    setError(null);

    setSaving(true);
    try {
      const projectData = {
        name: name.trim(),
        description: description.trim(),
        status: existingProject?.status || 'ACTIVE',
        due_date: dueDate ? toLocalDateString(dueDate) : null,
        color,
      };

      if (existingProject) {
        await updateProject(existingProject.id, projectData);
      } else {
        await createProject(projectData);
      }
      navigation.goBack();
    } catch (e) {
      setError("Couldn't save this project.");
    } finally {
      setSaving(false);
    }
  };

  const setStatusAndLeave = async (nextStatus: 'COMPLETED' | 'ARCHIVED') => {
    if (!existingProject || saving) return;
    setSaving(true);
    setError(null);
    try {
      await updateProject(existingProject.id, {
        name: name.trim() || existingProject.name,
        description: description.trim(),
        status: nextStatus,
        due_date: dueDate ? toLocalDateString(dueDate) : null,
        color,
      });
      navigation.goBack();
    } catch (e) {
      setError(nextStatus === 'COMPLETED' ? "Couldn't complete this project." : "Couldn't archive this project.");
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async () => {
    if (!existingProject) return;
    try {
      await deleteProject(existingProject.id);
      setDeleteModalVisible(false);
      navigation.goBack();
    } catch (e) {
      setDeleteModalVisible(false);
      setError("Couldn't delete this project.");
    }
  };

  return (
    <FormScreen
      title={existingProject ? 'EDIT PROJECT' : 'NEW PROJECT'}
      showBack={true}
      rightOption={existingProject ? {
        render: () => (
          <TouchableOpacity onPress={() => setDeleteModalVisible(true)}>
            <AppText style={[styles.deleteText, { color: colors.error }]}>Delete</AppText>
          </TouchableOpacity>
        ),
      } : undefined}
      submitTitle="Save Project"
      onSubmit={handleSave}
      loading={saving}
      error={error}
      submitStyle={{ backgroundColor: accentColor }}
    >
      <View style={styles.field}>
        <AppText style={[styles.label, { color: colors.subtext }]}>NAME</AppText>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
          value={name}
          onChangeText={setName}
          placeholder="Project name"
          placeholderTextColor={colors.subtext}
        />
      </View>

      <View style={styles.field}>
        <AppText style={[styles.label, { color: colors.subtext }]}>DESCRIPTION</AppText>
        <TextInput
          style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Optional description"
          placeholderTextColor={colors.subtext}
          multiline
          numberOfLines={3}
        />
      </View>

      {existingProject && (
        <View style={styles.field}>
          <AppText style={[styles.label, { color: colors.subtext }]}>PROJECT</AppText>
          <View style={styles.statusRow}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => setStatusAndLeave('COMPLETED')}
            >
              <AppText style={[styles.statusText, { color: colors.text }]}>Complete</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => setStatusAndLeave('ARCHIVED')}
            >
              <AppText style={[styles.statusText, { color: colors.text }]}>Archive</AppText>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.field}>
        <AppText style={[styles.label, { color: colors.subtext }]}>COLOR</AppText>
        <ColorSwatchPicker value={color || '#007AFF'} onChange={setColor} />
      </View>

      <View style={styles.field}>
        <AppText style={[styles.label, { color: colors.subtext }]}>DUE DATE</AppText>
        <TouchableOpacity
          style={[styles.dateButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
          onPress={() => setShowDatePicker(true)}
        >
          <AppText style={[styles.dateText, { color: dueDate ? colors.text : colors.subtext }]}>
            {dueDate ? dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Select date'}
          </AppText>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={dueDate || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_event, selectedDate) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selectedDate) setDueDate(selectedDate);
            }}
          />
        )}
      </View>

      <DeleteConfirm
        visible={deleteModalVisible}
        title="Delete Project"
        message={`Are you sure you want to delete "${existingProject?.name}"? Its tasks will move to Inbox.`}
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
  statusRow: { flexDirection: 'row', gap: 8 },
  actionButton: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  statusText: { fontSize: 13, fontWeight: '600' },
  dateButton: { borderRadius: 12, borderWidth: 1, padding: 16 },
  dateText: { fontSize: 16 },
  deleteText: { fontSize: 14, fontWeight: '600' },
});
