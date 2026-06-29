import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Switch } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../../components/ui/AppText';
import { Icon } from '../../components/ui/Icon';
import ScreenLayout from '../../components/common/ScreenLayout';
import { AuthButton } from '../auth/components/AuthButton';
import { IconPickerModal } from './components/IconPickerModal';
import { HABIT_ICONS } from '../../constants/habitIcons';
import { createHabit, updateHabit, deleteHabit } from '../../api/habits';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AppTimePicker } from '../../components/common/AppTimePicker';
import { IconEdit, IconTrash } from 'tabler-icons-react-native';
import DeleteConfirm from '../../components/ui/DeleteConfirm';
import { SettingsRow } from '../../components/common/SettingsRow';

export default function HabitEntryScreen() {
  const { colors, accentColor, entityColors } = useTheme();
  const habitColor = entityColors.habits;
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const habit = route.params?.habit;
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  
  const [name, setName] = useState(habit?.name || '');
  const [targetValue, setTargetValue] = useState(habit?.target_value || 1);
  const [hasTarget, setHasTarget] = useState(habit?.has_target || false);
  const [targetType, setTargetType] = useState<'COUNT' | 'TIME'>(habit?.target_type || 'COUNT');
  const [reminderTime, setReminderTime] = useState(habit?.reminder_time ? new Date(`1970-01-01T${habit.reminder_time}`) : new Date());
  const [hasReminder, setHasReminder] = useState(!!habit?.reminder_time);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [iconName, setIconName] = useState(habit?.icon || 'Activity');
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>(habit?.days_of_week || [0, 1, 2, 3, 4, 5, 6]);

  const days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const toggleDay = (day: number) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const getTargetSummary = () => {
    if (!hasTarget) return 'No daily goal';
    const unit = targetType === 'COUNT' ? (targetValue === 1 ? 'time' : 'times') : 'mins';
    return `${targetValue} ${unit} per day`;
  };

  const getReminderSummary = () => {
    if (!hasReminder) return 'No reminder';
    const time = reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (selectedDays.length === 7) return `${time} daily`;
    
    const isWeekdays = selectedDays.length === 5 && [0,1,2,3,4].every(d => selectedDays.includes(d));
    if (isWeekdays) return `${time} on weekdays`;
    
    const isWeekends = selectedDays.length === 2 && [5,6].every(d => selectedDays.includes(d));
    if (isWeekends) return `${time} on weekends`;
    
    return `${time} on selected days`;
  };

  const selectedIcon = HABIT_ICONS.find(i => i.name === iconName)?.icon || HABIT_ICONS[0].icon;

  const saveHabit = async () => {
    setLoading(true);
    try {
      const data = {
        name,
        icon: iconName,
        description: '',
        frequency: selectedDays.length > 0 ? 'WEEKLY' : 'DAILY',
        days_of_week: selectedDays,
        target_value: hasTarget ? targetValue : 1,
        has_target: hasTarget,
        target_type: hasTarget ? targetType : 'COUNT',
        category: 'General',
        reminder_time: hasReminder ? reminderTime.toTimeString().slice(0, 5) : null
      };
      if (habit) await updateHabit(habit.id, data);
      else await createHabit(data);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to save habit');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (habit) {
        await deleteHabit(habit.id);
        navigation.goBack();
    }
  };

  return (
    <ScreenLayout 
        title={habit ? "Edit Habit" : "New Habit"} 
        showBack={true}
        rightOption={habit ? {
            icon: () => <Icon name={IconTrash} size={20} color={colors.error} />,
            onPress: () => setDeleteModalVisible(true)
        } : undefined}
    >
      <DeleteConfirm 
        visible={deleteModalVisible} 
        title="Delete Habit" 
        message="Are you sure you want to delete this habit?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
      />
      <IconPickerModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        onSelect={setIconName}
        currentColor={iconName}
      />
      
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.nameRow}>
          <TouchableOpacity 
            style={[styles.smallIconCircle, { backgroundColor: colors.card, borderColor: colors.border }]} 
            onPress={() => setModalVisible(true)}
          >
            <Icon name={selectedIcon} size={20} color={habitColor} />
            <View style={[styles.editBadge, { backgroundColor: habitColor }]}>
              <Icon name={IconEdit} size={10} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <TextInput
            style={[styles.timePicker, { 
              backgroundColor: colors.card, 
              color: colors.text, 
              borderColor: colors.border,
              flex: 1,
              height: 60,
              fontSize: 16,
              padding: 16
            }]}
            placeholder="Habit Name"
            placeholderTextColor={colors.subtext}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={[styles.timePicker, { backgroundColor: colors.card, borderColor: colors.border, flexDirection: 'column', alignItems: 'flex-start' }]}>
          <AppText style={[styles.subtitleLabel, { color: colors.subtext, marginBottom: 20 }]}>DAYS</AppText>
          <View style={[styles.row, { width: '100%', justifyContent: 'space-between' }]}>
            {days.map((day, idx) => (
              <TouchableOpacity 
                key={day} 
                onPress={() => toggleDay(idx)} 
                style={[
                  styles.dayItem, 
                  { backgroundColor: 'transparent' }
                ]}
              >
                <AppText style={{ color: selectedDays.includes(idx) ? colors.text : colors.subtext }}>{day}</AppText>
                {selectedDays.includes(idx) && <View style={[styles.underline, { backgroundColor: habitColor, shadowColor: habitColor, shadowOpacity: 0.6, shadowRadius: 4, elevation: 3 }]} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <SettingsRow
          label="DAILY GOAL"
          summary={getTargetSummary()}
          value={hasTarget}
          onValueChange={setHasTarget}
          accentColor={habitColor}
        >
          <View style={styles.frequencyInput}>
            <TextInput 
              style={[styles.smallInput, { color: colors.text, borderColor: colors.border, height: 44 }]}
              keyboardType="numeric"
              value={targetValue.toString()}
              onChangeText={(t) => setTargetValue(parseInt(t) || 1)}
            />
            <TouchableOpacity 
              style={[styles.smallInput, { width: 120, borderColor: colors.border, justifyContent: 'center', height: 44 }]}
              onPress={() => setTargetType(targetType === 'COUNT' ? 'TIME' : 'COUNT')}
            >
              <AppText style={{ color: colors.text, letterSpacing: 2, textAlign: 'center', fontSize: 14 }}>
                {targetType === 'COUNT' ? 'Count' : 'Mins'}
              </AppText>
            </TouchableOpacity>
          </View>
        </SettingsRow>
        
        <SettingsRow
          label="REMINDERS"
          summary={getReminderSummary()}
          value={hasReminder}
          onValueChange={setHasReminder}
          accentColor={habitColor}
          onSummaryPress={() => setShowTimePicker(true)}
        >
          <TouchableOpacity 
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
            onPress={() => setShowTimePicker(true)}
          >
            <AppText style={{ color: colors.text, fontSize: 18, fontWeight: '500' }}>
              Set notification time
            </AppText>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <AppText style={{ color: habitColor, fontSize: 18, fontWeight: '600' }}>
                {reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </AppText>
              <Icon name={IconEdit} size={18} color={colors.subtext} />
            </View>
          </TouchableOpacity>
          <AppTimePicker 
            visible={showTimePicker}
            onClose={() => setShowTimePicker(false)}
            value={reminderTime} 
            onChange={(date: Date) => setReminderTime(date)} 
            label="Reminder Time"
          />
        </SettingsRow>
      </ScrollView>
      <View style={styles.footer}>
        <AuthButton title={loading ? "Saving..." : "Save"} onPress={saveHabit} loading={loading} style={{ backgroundColor: habitColor, width: '100%' }} />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16, alignItems: 'center', paddingBottom: 100, paddingTop: 20 },
  subtitleLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%' },
  smallIconCircle: { width: 60, height: 60, borderRadius: 16, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
  editBadge: { position: 'absolute', bottom: -2, right: -2, padding: 4, borderRadius: 10, borderWidth: 2, borderColor: '#09090A' },
  row: { flexDirection: 'row', gap: 10, alignSelf: 'flex-start' },
  dayItem: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 8, borderWidth: 1, borderColor: 'transparent' },
  underline: { height: 2, width: 14, marginTop: 4, borderRadius: 1, shadowOpacity: 0.8, shadowRadius: 4, elevation: 3 },
  timePicker: { paddingVertical: 20, paddingHorizontal: 24, borderRadius: 16, borderWidth: 1, width: '100%' },
  footer: { paddingBottom: 20, paddingTop: 10, width: '100%' },
  frequencyInput: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  smallInput: { padding: 8, borderRadius: 20, borderWidth: 1, width: 70, textAlign: 'center' }
});
