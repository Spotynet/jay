import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import ScreenLayout from '../../components/common/ScreenLayout';
import { AppText } from '../../components/ui/AppText';
import { createProject, updateProject, deleteProject } from '../../api/projects';
import { getAreas } from '../../api/planning';
import DeleteConfirm from '../../components/ui/DeleteConfirm';

const STATUS_OPTIONS = ['ACTIVE', 'COMPLETED', 'ARCHIVED'] as const;

export default function ProjectEntryScreen() {
  const { colors, accentColor } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const isFocused = useIsFocused();

  const existingProject = route.params?.project;

  const [name, setName] = useState(existingProject?.name || '');
  const [description, setDescription] = useState(existingProject?.description || '');
  const [status, setStatus] = useState<string>(existingProject?.status || 'ACTIVE');
  const [dueDate, setDueDate] = useState<Date | null>(existingProject?.due_date ? new Date(existingProject.due_date + 'T00:00:00') : null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [areaId, setAreaId] = useState<number | null>(existingProject?.area || null);
  const [areas, setAreas] = useState<any[]>([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isFocused) {
      getAreas().then(setAreas).catch(() => {});
    }
  }, [isFocused]);

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Project name is required');
      return;
    }

    setSaving(true);
    try {
      const projectData = {
        name: name.trim(),
        description: description.trim(),
        status,
        due_date: dueDate ? formatDate(dueDate) : undefined,
        area: areaId || undefined,
      };

      if (existingProject) {
        await updateProject(existingProject.id, projectData);
      } else {
        await createProject(projectData);
      }
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save project');
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
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to delete project');
    }
  };

  return (
    <ScreenLayout 
      title={existingProject ? 'EDIT PROJECT' : 'NEW PROJECT'} 
      showBack={true}
      rightOption={existingProject ? {
        icon: () => (
          <TouchableOpacity onPress={() => setDeleteModalVisible(true)}>
            <AppText style={[styles.deleteText, { color: colors.error }]}>Delete</AppText>
          </TouchableOpacity>
        )
      } : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Name */}
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

        {/* Description */}
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

        {/* Status */}
        <View style={styles.field}>
          <AppText style={[styles.label, { color: colors.subtext }]}>STATUS</AppText>
          <View style={styles.statusRow}>
            {STATUS_OPTIONS.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.statusChip, { backgroundColor: status === s ? accentColor : colors.surface, borderColor: status === s ? accentColor : colors.border }]}
                onPress={() => setStatus(s)}
              >
                <AppText style={[styles.statusText, { color: status === s ? '#FFFFFF' : colors.text }]}>{s}</AppText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Due Date */}
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
              onChange={(event, selectedDate) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selectedDate) setDueDate(selectedDate);
              }}
            />
          )}
        </View>

        {/* Area */}
        {areas.length > 0 && (
          <View style={styles.field}>
            <AppText style={[styles.label, { color: colors.subtext }]}>AREA</AppText>
            <View style={styles.areaRow}>
              <TouchableOpacity
                style={[styles.areaChip, { backgroundColor: !areaId ? accentColor : colors.surface, borderColor: !areaId ? accentColor : colors.border }]}
                onPress={() => setAreaId(null)}
              >
                <AppText style={[styles.areaText, { color: !areaId ? '#FFFFFF' : colors.text }]}>None</AppText>
              </TouchableOpacity>
              {areas.map((area) => (
                <TouchableOpacity
                  key={area.id}
                  style={[styles.areaChip, { backgroundColor: areaId === area.id ? (area.color || accentColor) : colors.surface, borderColor: areaId === area.id ? (area.color || accentColor) : colors.border }]}
                  onPress={() => setAreaId(area.id)}
                >
                  <AppText style={[styles.areaText, { color: areaId === area.id ? '#FFFFFF' : colors.text }]}>{area.name}</AppText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveButton, { backgroundColor: accentColor }]}
          onPress={handleSave}
          disabled={saving}
        >
          <AppText style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Project'}</AppText>
        </TouchableOpacity>
      </ScrollView>

      <DeleteConfirm
        visible={deleteModalVisible}
        title="Delete Project"
        message={`Are you sure you want to delete "${existingProject?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 40 },
  field: { marginBottom: 24 },
  label: { fontSize: 11, fontWeight: '600', letterSpacing: 1.5, marginBottom: 8 },
  input: { borderRadius: 12, borderWidth: 1, padding: 16, fontSize: 16 },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  statusRow: { flexDirection: 'row', gap: 8 },
  statusChip: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  statusText: { fontSize: 13, fontWeight: '600' },
  dateButton: { borderRadius: 12, borderWidth: 1, padding: 16 },
  dateText: { fontSize: 16 },
  areaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  areaChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
  areaText: { fontSize: 14, fontWeight: '500' },
  saveButton: { borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 16 },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  deleteText: { fontSize: 14, fontWeight: '600' },
});
