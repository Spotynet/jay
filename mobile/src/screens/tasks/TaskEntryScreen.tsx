import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Switch } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../../components/ui/AppText';
import { Icon } from '../../components/ui/Icon';
import ScreenLayout from '../../components/common/ScreenLayout';
import { AuthButton } from '../auth/components/AuthButton';
import { useNavigation, useRoute } from '@react-navigation/native';
import AppDatePicker from '../../components/common/AppDatePicker';
import { AppTimePicker } from '../../components/common/AppTimePicker';
import { IconEdit } from 'tabler-icons-react-native';
import { createTask, updateTask } from '../../api/tasks';

export default function TaskEntryScreen() {
  const { colors, accentColor } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const task = route.params?.task;
  const parentId = route.params?.parentId;

  const [name, setName] = useState(task?.name || '');
  const [description, setDescription] = useState(task?.description || '');
  const [date, setDate] = useState(task?.due_date ? new Date(task.due_date) : new Date());
  const [time, setTime] = useState(task?.due_time ? new Date(`1970-01-01T${task.due_time}`) : new Date());
  const [hasTime, setHasTime] = useState(!!task?.due_time);
  
  const [hasDuration, setHasDuration] = useState(!!task?.duration);
  const [hours, setHours] = useState(task?.duration ? parseInt(task.duration.split(':')[0]) : 0);
  const [minutes, setMinutes] = useState(task?.duration ? parseInt(task.duration.split(':')[1]) : 15);
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const saveTask = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const data = {
        name,
        description,
        due_date: date.toISOString().split('T')[0],
        due_time: hasTime ? time.toTimeString().slice(0, 5) : null,
        duration: hasDuration ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00` : null,
        status: task?.status || 'PENDING',
        parent: parentId || task?.parent
      };
      if (task) await updateTask(task.id, data);
      else await createTask(data);
      Alert.alert('Success', 'Task saved!');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenLayout title={task ? "Edit Task" : "New Task"} showBack={true}>
      <ScrollView contentContainerStyle={styles.container}>
        <TextInput
          style={[styles.timePicker, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border, fontSize: 16, width: '100%' }]}
          placeholder="Task Name"
          placeholderTextColor={colors.subtext}
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={[styles.timePicker, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border, textAlignVertical: 'top', width: '100%' }]}
          placeholder="Description"
          placeholderTextColor={colors.subtext}
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        <View style={[styles.timePicker, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <AppText style={[styles.subtitleLabel, { color: colors.subtext, marginBottom: 12 }]}>DATE</AppText>
          <TouchableOpacity style={styles.timeRow} onPress={() => setShowDatePicker(true)}>
            <AppText style={{ color: colors.text, fontSize: 16 }}>{date.toLocaleDateString()}</AppText>
            <Icon name={IconEdit} size={20} color={colors.subtext} />
          </TouchableOpacity>
        </View>

        <View style={[styles.timePicker, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <AppText style={[styles.subtitleLabel, { color: colors.subtext }]}>TIME</AppText>
            <Switch value={hasTime} onValueChange={setHasTime} trackColor={{ true: accentColor }} />
          </View>
          {hasTime && (
            <TouchableOpacity style={styles.timeRow} onPress={() => setShowTimePicker(true)}>
              <AppText style={{ color: colors.text, fontSize: 16 }}>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</AppText>
              <Icon name={IconEdit} size={20} color={colors.subtext} />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={[styles.timePicker, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <AppText style={[styles.subtitleLabel, { color: colors.subtext }]}>DURATION</AppText>
            <Switch value={hasDuration} onValueChange={setHasDuration} trackColor={{ true: accentColor }} />
          </View>
          {hasDuration && (
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <TextInput style={[styles.smallInput, { color: colors.text, borderColor: colors.border }]} keyboardType="numeric" value={hours.toString()} onChangeText={(v) => setHours(parseInt(v) || 0)} placeholder="0" />
                    <AppText style={{ color: colors.subtext }}>H</AppText>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <TextInput style={[styles.smallInput, { color: colors.text, borderColor: colors.border }]} keyboardType="numeric" value={minutes.toString()} onChangeText={(v) => setMinutes(parseInt(v) || 0)} placeholder="0" />
                    <AppText style={{ color: colors.subtext }}>M</AppText>
                </View>
            </View>
          )}
        </View>

        <AppDatePicker visible={showDatePicker} onClose={() => setShowDatePicker(false)} value={date} onChange={(d) => { setDate(d); }} mode="date" label="Select Date" />
        <AppTimePicker visible={showTimePicker} onClose={() => setShowTimePicker(false)} value={time} onChange={(d) => { setTime(d); }} label="Select Time" />
      </ScrollView>
      <View style={styles.footer}>
        <AuthButton title={loading ? "Saving..." : "Save"} onPress={saveTask} loading={loading} />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16, alignItems: 'center', paddingBottom: 100, paddingHorizontal: 25, paddingTop: 20 },
  subtitleLabel: { fontSize: 13, fontWeight: '400', letterSpacing: 3, textTransform: 'uppercase' },
  timePicker: { padding: 24, borderRadius: 20, borderWidth: 1, width: '100%' },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  footer: { paddingHorizontal: 25, paddingBottom: 20, paddingTop: 10 },
  smallInput: { padding: 8, borderRadius: 8, borderWidth: 1, width: 50, textAlign: 'center' }
});
