import React, { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
  Switch,
  Platform,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../../components/ui/AppText';
import { Icon } from '../../components/ui/Icon';
import FormScreen from '../../components/common/FormScreen';
import { IconPickerModal } from './components/IconPickerModal';
import { HABIT_ICONS } from '../../constants/habitIcons';
import { createHabit, updateHabit, deleteHabit } from '../../api/habits';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AppTimePicker } from '../../components/common/AppTimePicker';
import DeleteConfirm from '../../components/ui/DeleteConfirm';
import { useUnsavedChangesGuard } from '../../hooks/useUnsavedChangesGuard';
import { DetailSection } from '../../components/itemDetails/DetailRows';

const DAY_SHORT = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const DAY_FULL = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

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

function formatReminderTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function HabitEntryScreen() {
  const { colors, entityColors, isDark } = useTheme();
  const habitColor = entityColors.habits;
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const habit = route.params?.habit;
  const isEditing = !!habit;
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const [name, setName] = useState(habit?.name || '');
  const [targetValue, setTargetValue] = useState(habit?.target_value || 1);
  const [hasTarget, setHasTarget] = useState(habit?.has_target || false);
  const [targetType, setTargetType] = useState<'COUNT' | 'TIME'>(
    habit?.target_type || 'COUNT',
  );
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

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const selectedIcon =
    HABIT_ICONS.find((i) => i.name === iconName)?.icon || HABIT_ICONS[0].icon;

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
        reminder_time: hasReminder
          ? reminderTime.toTimeString().slice(0, 5)
          : null,
      };
      if (habit) await updateHabit(habit.id, data);
      else await createHabit(data);
      setAllowLeave(true);
      navigation.goBack();
    } catch {
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
    } catch {
      setDeleteModalVisible(false);
      setError("Couldn't delete this habit.");
    }
  };

  const rowDivider = {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  };

  return (
    <FormScreen
      title={isEditing ? 'Edit Habit' : 'New Habit'}
      submitPlacement="header"
      cancelLabel="Cancel"
      submitTitle={loading ? 'Saving…' : 'Save'}
      onSubmit={saveHabit}
      loading={loading}
      error={error}
      scrollContentStyle={styles.scrollPad}
    >
      <DeleteConfirm
        visible={deleteModalVisible}
        title="Delete Habit"
        message="Delete this habit and all of its completion history? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
      />
      <IconPickerModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelect={setIconName}
      />
      <AppTimePicker
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        value={reminderTime}
        onChange={(date: Date) => setReminderTime(date)}
        label="Reminder Time"
      />

      {/* Identity — editable counterpart of DetailsIdentity */}
      <View style={styles.identity}>
        <Pressable
          onPress={() => setModalVisible(true)}
          style={({ pressed }) => [
            styles.iconBox,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.surface,
              borderColor: colors.border,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Choose habit icon"
        >
          <Icon name={selectedIcon} size={22} color={habitColor} stroke={1.7} />
        </Pressable>

        <View style={styles.nameCol}>
          <TextInput
            style={[styles.nameInput, { color: colors.text }]}
            value={name}
            onChangeText={setName}
            placeholder="Habit name"
            placeholderTextColor={colors.subtext}
            autoFocus={false}
            autoCorrect
            returnKeyType="done"
            accessibilityLabel="Habit name"
            {...(Platform.OS === 'android' ? { includeFontPadding: false } : null)}
          />
        </View>
      </View>

      <DetailSection title="Schedule">
        <View style={styles.daysBlock}>
          <AppText style={[styles.rowLabel, { color: colors.subtext }]}>Repeat</AppText>
          <View style={styles.daysRow}>
            {DAY_SHORT.map((label, idx) => {
              const selected = selectedDays.includes(idx);
              return (
                <Pressable
                  key={label}
                  onPress={() => toggleDay(idx)}
                  style={({ pressed }) => [
                    styles.dayChip,
                    {
                      backgroundColor: selected ? habitColor + '22' : 'transparent',
                      borderColor: selected ? habitColor : colors.border,
                      opacity: pressed ? 0.75 : 1,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${DAY_FULL[idx]}${selected ? ', selected' : ''}`}
                >
                  <AppText
                    style={{
                      fontSize: 12,
                      fontWeight: selected ? '600' : '400',
                      color: selected ? colors.text : colors.subtext,
                    }}
                  >
                    {label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>
      </DetailSection>

      <DetailSection title="Daily goal">
        <View style={[styles.configRow, hasTarget && rowDivider]}>
          <AppText style={[styles.configLabel, { color: colors.text }]}>Daily goal</AppText>
          <Switch
            value={hasTarget}
            onValueChange={setHasTarget}
            trackColor={{ true: habitColor, false: colors.border }}
            thumbColor="#FFFFFF"
            ios_backgroundColor={colors.border}
            accessibilityLabel="Daily goal"
          />
        </View>
        {hasTarget ? (
          <View style={styles.goalFields}>
            <TextInput
              style={[
                styles.goalValue,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.background,
                },
              ]}
              keyboardType="number-pad"
              value={String(targetValue)}
              onChangeText={(t) => setTargetValue(parseInt(t, 10) || 1)}
              accessibilityLabel="Daily goal target value"
            />
            <Pressable
              style={({ pressed }) => [
                styles.goalUnit,
                {
                  borderColor: colors.border,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.background,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              onPress={() =>
                setTargetType(targetType === 'COUNT' ? 'TIME' : 'COUNT')
              }
              accessibilityRole="button"
              accessibilityLabel={`Goal unit, ${targetType === 'COUNT' ? 'count' : 'minutes'}. Tap to switch.`}
            >
              <AppText style={{ color: colors.text, fontSize: 15, fontWeight: '500' }}>
                {targetType === 'COUNT' ? 'Count' : 'Mins'}
              </AppText>
            </Pressable>
          </View>
        ) : null}
      </DetailSection>

      <DetailSection title="Reminder">
        <View style={[styles.configRow, hasReminder && rowDivider]}>
          <AppText style={[styles.configLabel, { color: colors.text }]}>Reminder</AppText>
          <Switch
            value={hasReminder}
            onValueChange={setHasReminder}
            trackColor={{ true: habitColor, false: colors.border }}
            thumbColor="#FFFFFF"
            ios_backgroundColor={colors.border}
            accessibilityLabel="Reminder"
          />
        </View>
        {hasReminder ? (
          <Pressable
            onPress={() => setShowTimePicker(true)}
            style={({ pressed }) => [
              styles.configRow,
              pressed && { opacity: 0.7 },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Reminder time, ${formatReminderTime(reminderTime)}`}
          >
            <AppText style={[styles.configLabel, { color: colors.text }]}>Time</AppText>
            <AppText style={[styles.timeValue, { color: habitColor }]}>
              {formatReminderTime(reminderTime)}
            </AppText>
          </Pressable>
        ) : null}
      </DetailSection>

      {isEditing ? (
        <View style={styles.destructiveBlock}>
          <Pressable
            onPress={() => setDeleteModalVisible(true)}
            style={({ pressed }) => [
              styles.deleteRow,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Delete habit"
          >
            <AppText style={[styles.deleteLabel, { color: colors.error }]}>
              Delete Habit
            </AppText>
          </Pressable>
          <AppText style={[styles.deleteHint, { color: colors.subtext }]}>
            Removes the habit and all completion history—not only one day.
          </AppText>
        </View>
      ) : null}
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  scrollPad: {
    paddingTop: 4,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    marginTop: 4,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  nameCol: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  nameInput: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 28,
    paddingVertical: Platform.OS === 'ios' ? 4 : 0,
    paddingHorizontal: 0,
    margin: 0,
  },
  daysBlock: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 10,
  },
  rowLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  dayChip: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  configRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    minHeight: 52,
    gap: 12,
  },
  configLabel: {
    fontSize: 16,
    fontWeight: '500',
    flexShrink: 1,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  goalFields: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 4,
  },
  goalValue: {
    width: 72,
    height: 44,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  goalUnit: {
    minWidth: 88,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destructiveBlock: {
    marginTop: 8,
    marginBottom: 8,
    gap: 8,
  },
  deleteRow: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  deleteLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteHint: {
    fontSize: 12,
    lineHeight: 16,
    paddingHorizontal: 4,
  },
});
