import React, { useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../../components/ui/AppText';
import { Icon } from '../../components/ui/Icon';
import FormScreen from '../../components/common/FormScreen';
import Box from '../../components/ui/Box';
import Label from '../../components/ui/Label';
import Input from '../../components/ui/Input';
import IconCircle from '../../components/ui/IconCircle';
import ToggleBox from '../../components/ui/ToggleBox';
import { IconPickerModal } from './components/IconPickerModal';
import { HABIT_ICONS } from '../../constants/habitIcons';
import { createHabit, updateHabit, deleteHabit } from '../../api/habits';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AppTimePicker } from '../../components/common/AppTimePicker';
import { IconTrash, IconEdit } from 'tabler-icons-react-native';
import DeleteConfirm from '../../components/ui/DeleteConfirm';
import { useUnsavedChangesGuard } from '../../hooks/useUnsavedChangesGuard';

function snapshotHabitDraft(values: {
  name: string;
  iconName: string;
  selectedDays: number[];
  hasTarget: boolean;
  targetValue: number;
  targetType: string;
  hasReminder: boolean;
  reminderKey: string;
}) {
  return JSON.stringify({
    ...values,
    selectedDays: [...values.selectedDays].sort((a, b) => a - b),
  });
}

export default function HabitEntryScreen() {
  const { colors, entityColors } = useTheme();
  const habitColor = entityColors.habits;
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const habit = route.params?.habit;
  const occurrenceDate = route.params?.occurrenceDate as string | undefined;
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const [name, setName] = useState(habit?.name || '');
  const [targetValue, setTargetValue] = useState(habit?.target_value || 1);
  const [hasTarget, setHasTarget] = useState(habit?.has_target || false);
  const [targetType, setTargetType] = useState<'COUNT' | 'TIME'>(habit?.target_type || 'COUNT');
  const [reminderTime, setReminderTime] = useState(
    habit?.reminder_time ? new Date(`1970-01-01T${habit.reminder_time}`) : new Date(),
  );
  const [hasReminder, setHasReminder] = useState(!!habit?.reminder_time);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [iconName, setIconName] = useState(habit?.icon || 'Activity');
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<number[]>(
    habit?.days_of_week || [0, 1, 2, 3, 4, 5, 6],
  );
  const [allowLeave, setAllowLeave] = useState(false);

  const initialSnapshot = useMemo(
    () =>
      snapshotHabitDraft({
        name: habit?.name || '',
        iconName: habit?.icon || 'Activity',
        selectedDays: habit?.days_of_week || [0, 1, 2, 3, 4, 5, 6],
        hasTarget: habit?.has_target || false,
        targetValue: habit?.target_value || 1,
        targetType: habit?.target_type || 'COUNT',
        hasReminder: !!habit?.reminder_time,
        reminderKey: habit?.reminder_time
          ? String(habit.reminder_time).slice(0, 5)
          : reminderTime.toTimeString().slice(0, 5),
      }),
    // Intentionally snapshot once from route params at mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const currentSnapshot = snapshotHabitDraft({
    name,
    iconName,
    selectedDays,
    hasTarget,
    targetValue,
    targetType,
    hasReminder,
    reminderKey: reminderTime.toTimeString().slice(0, 5),
  });
  const isDirty = !allowLeave && currentSnapshot !== initialSnapshot;
  useUnsavedChangesGuard(isDirty);

  const days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
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

    const isWeekdays =
      selectedDays.length === 5 && [0, 1, 2, 3, 4].every((d) => selectedDays.includes(d));
    if (isWeekdays) return `${time} on weekdays`;

    const isWeekends =
      selectedDays.length === 2 && [5, 6].every((d) => selectedDays.includes(d));
    if (isWeekends) return `${time} on weekends`;

    return `${time} on selected days`;
  };

  const selectedIcon = HABIT_ICONS.find((i) => i.name === iconName)?.icon || HABIT_ICONS[0].icon;

  const saveHabit = async () => {
    if (loading) return;
    if (!name.trim()) {
      setError('Enter a habit name.');
      return;
    }
    setError(null);
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
        reminder_time: hasReminder ? reminderTime.toTimeString().slice(0, 5) : null,
      };
      if (habit) await updateHabit(habit.id, data);
      else await createHabit(data);
      setAllowLeave(true);
      navigation.goBack();
    } catch (e) {
      setError("Couldn't save this habit.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!habit) return;
    try {
      await deleteHabit(habit.id);
      setAllowLeave(true);
      navigation.goBack();
    } catch (e) {
      setDeleteModalVisible(false);
      setError("Couldn't delete this habit.");
    }
  };

  return (
    <FormScreen
      title={habit ? 'Habit details' : 'New habit'}
      showBack
      rightOption={
        habit
          ? {
              icon: () => <Icon name={IconTrash} size={20} color={colors.error} />,
              onPress: () => setDeleteModalVisible(true),
            }
          : undefined
      }
      submitTitle={loading ? 'Saving…' : 'Save'}
      onSubmit={saveHabit}
      loading={loading}
      error={error}
      submitStyle={{ backgroundColor: habitColor }}
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

      <View style={styles.identity}>
        <IconCircle
          icon={selectedIcon}
          accentColor={habitColor}
          onPress={() => setModalVisible(true)}
        />
        <View style={styles.identityText}>
          <AppText style={[styles.typeLabel, { color: habitColor }]}>Habit</AppText>
          <Input
            style={styles.nameInput}
            placeholder="Habit name"
            value={name}
            onChangeText={setName}
            autoFocus={false}
          />
          {occurrenceDate ? (
            <AppText style={[styles.occurrenceHint, { color: colors.subtext }]}>
              Scheduled for {occurrenceDate}
            </AppText>
          ) : null}
        </View>
      </View>

      <Label>Repeat days</Label>
      <Box style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
        <View style={[styles.row, { width: '100%', justifyContent: 'space-between' }]}>
          {days.map((day, idx) => {
            const selected = selectedDays.includes(idx);
            return (
              <TouchableOpacity
                key={day}
                onPress={() => toggleDay(idx)}
                style={[
                  styles.dayItem,
                  {
                    backgroundColor: selected ? habitColor + '22' : 'transparent',
                    borderColor: selected ? habitColor : colors.border,
                  },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`${day}${selected ? ', selected' : ''}`}
              >
                <AppText
                  style={{
                    color: selected ? colors.text : colors.subtext,
                    fontWeight: selected ? '600' : '400',
                    fontSize: 13,
                  }}
                >
                  {day}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>
      </Box>

      <ToggleBox
        label="Daily goal"
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
            accessibilityLabel="Daily goal value"
          />
          <TouchableOpacity
            style={[
              styles.smallInput,
              { width: 120, borderColor: colors.border, justifyContent: 'center', height: 44 },
            ]}
            onPress={() => setTargetType(targetType === 'COUNT' ? 'TIME' : 'COUNT')}
            accessibilityRole="button"
            accessibilityLabel={`Goal unit, ${targetType === 'COUNT' ? 'count' : 'minutes'}`}
          >
            <AppText style={{ color: colors.text, letterSpacing: 1, textAlign: 'center', fontSize: 14 }}>
              {targetType === 'COUNT' ? 'Count' : 'Mins'}
            </AppText>
          </TouchableOpacity>
        </View>
      </ToggleBox>

      <ToggleBox
        label="Reminders"
        summary={getReminderSummary()}
        value={hasReminder}
        onValueChange={setHasReminder}
        accentColor={habitColor}
      >
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            minHeight: 48,
          }}
          onPress={() => setShowTimePicker(true)}
          accessibilityRole="button"
          accessibilityLabel="Set notification time"
        >
          <AppText style={{ color: colors.text, fontSize: 16, fontWeight: '500' }}>
            Notification time
          </AppText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <AppText style={{ color: habitColor, fontSize: 16, fontWeight: '600' }}>
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
      </ToggleBox>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    width: '100%',
    marginBottom: 8,
    marginTop: 8,
  },
  identityText: { flex: 1, gap: 4 },
  typeLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  nameInput: { flex: 0, width: '100%' },
  occurrenceHint: { fontSize: 12 },
  row: { flexDirection: 'row', gap: 6, alignSelf: 'flex-start' },
  dayItem: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
  },
  frequencyInput: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  smallInput: {
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    width: 70,
    textAlign: 'center',
  },
});
