import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { HabitReminderTimeControl } from './components/HabitReminderTimeControl';
import { HABIT_ICONS } from '../../constants/habitIcons';
import { createHabit, updateHabit, deleteHabit } from '../../api/habits';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useUnsavedChangesGuard } from '../../hooks/useUnsavedChangesGuard';
import { DetailSection } from '../../components/itemDetails/DetailRows';
import { HabitScheduleDayPicker } from '../../components/habits/HabitScheduleDayPicker';
import { normalizeDaysOfWeek } from '../../components/habits/habitWeekdaySelection';
import { confirmHabitDelete } from '../../utils/confirmHabitDelete';
import { HabitDeleteRowIcon } from './components/HabitDeleteRowIcon';

/** Horizontal inset shared by Goal / Notifications rows. */
const ROW_PAD_H = 16;
const ROW_PAD_V = 13;
/** Default everyday schedule when API omits days. */
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

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
  const { colors, entityColors, isDark } = useTheme();
  const habitColor = entityColors.habits;
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const habit = route.params?.habit;
  const fromDetails = !!route.params?.fromDetails;
  const isEditing = !!habit;

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
  const [iconName, setIconName] = useState(habit?.icon || 'Activity');
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<number[]>(() => {
    const normalized = normalizeDaysOfWeek(habit?.days_of_week);
    return normalized.length > 0 ? normalized : [...ALL_DAYS];
  });

  /** Sync bypass so successful Save/Delete does not re-trigger discard. */
  const bypassRef = useRef(false);

  const initialSnapshot = useMemo(
    () => {
      const normalized = normalizeDaysOfWeek(habit?.days_of_week);
      return snapshotHabitDraft({
        name: habit?.name || '',
        iconName: habit?.icon || 'Activity',
        selectedDays: normalized.length > 0 ? normalized : [...ALL_DAYS],
        hasTarget: habit?.has_target || false,
        targetValue: habit?.target_value || 1,
        targetType: habit?.target_type || 'COUNT',
        hasReminder: !!habit?.reminder_time,
        reminderKey: habit?.reminder_time
          ? String(habit.reminder_time).slice(0, 5)
          : reminderTime.toTimeString().slice(0, 5),
      });
    },
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
  const isDirty = !bypassRef.current && currentSnapshot !== initialSnapshot;

  useUnsavedChangesGuard(isDirty, {
    bypassRef,
    title: 'Discard changes?',
    message: "Your changes to this habit haven’t been saved.",
    keepLabel: 'Keep Editing',
    discardLabel: 'Discard Changes',
  });

  // Interactive modal dismiss cannot always be intercepted safely — disable
  // while dirty; Cancel remains available and uses the native confirmation.
  useEffect(() => {
    navigation.setOptions?.({ gestureEnabled: !isDirty });
    return () => {
      navigation.setOptions?.({ gestureEnabled: true });
    };
  }, [navigation, isDirty]);

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const selectedIcon =
    HABIT_ICONS.find((i) => i.name === iconName)?.icon || HABIT_ICONS[0].icon;

  const leaveAfterSuccess = () => {
    bypassRef.current = true;
    if (fromDetails && typeof navigation.pop === 'function') {
      // Leave HabitEntry and the deleted/stale ItemDetails underneath.
      navigation.pop(2);
      return;
    }
    navigation.goBack();
  };

  const saveHabit = async () => {
    if (loading || deleting) return;
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
      bypassRef.current = true;
      navigation.goBack();
    } catch {
      setError("Couldn't save this habit.");
    } finally {
      setLoading(false);
    }
  };

  const performDelete = async () => {
    if (!habit || deleting || loading) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteHabit(habit.id);
      leaveAfterSuccess();
    } catch {
      setError("Couldn't delete this habit.");
    } finally {
      setDeleting(false);
    }
  };

  const confirmDelete = () => {
    if (!habit || deleting || loading) return;
    const label = name.trim() || habit.name || 'this habit';
    confirmHabitDelete(label, () => {
      void performDelete();
    });
  };

  const daysLocked = loading || deleting;

  return (
    <FormScreen
      title={isEditing ? 'Edit Habit' : 'New Habit'}
      submitPlacement="header"
      cancelLabel="Cancel"
      submitTitle="Save"
      onSubmit={saveHabit}
      loading={loading}
      submitDisabled={!isDirty || deleting}
      submitAccent={habitColor}
      error={error}
      scrollContentStyle={styles.scrollPad}
    >
      <IconPickerModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelect={setIconName}
      />

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
        <HabitScheduleDayPicker
          selectedDays={selectedDays}
          onToggleDay={toggleDay}
          disabled={daysLocked}
          accent={habitColor}
        />
      </DetailSection>

      <DetailSection title="Goal">
        <View
          style={[
            styles.configRow,
            hasTarget && {
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: colors.border,
            },
          ]}
        >
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

      <DetailSection title="Notifications">
        <View
          style={[
            styles.configRow,
            hasReminder && {
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: colors.border,
            },
          ]}
        >
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
          <View style={styles.configRow}>
            <AppText style={[styles.configLabel, { color: colors.text }]}>Time</AppText>
            <HabitReminderTimeControl value={reminderTime} onChange={setReminderTime} />
          </View>
        ) : null}
      </DetailSection>

      {isEditing ? (
        <Pressable
          onPress={confirmDelete}
          disabled={deleting || loading}
          style={({ pressed }) => [
            styles.deletePressable,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: pressed || deleting || loading ? 0.55 : 1,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Delete habit"
          accessibilityState={{ disabled: deleting || loading, busy: deleting }}
        >
          {/* Explicit RN row — do not rely on Pressable defaults or Host children. */}
          <View style={styles.deleteRow} collapsable={false}>
            <HabitDeleteRowIcon color={colors.error} />
            <AppText style={[styles.deleteLabel, { color: colors.error }]}>
              {deleting ? 'Deleting…' : 'Delete habit'}
            </AppText>
          </View>
        </Pressable>
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
  configRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ROW_PAD_H,
    paddingVertical: ROW_PAD_V,
    minHeight: 52,
    gap: 12,
  },
  configLabel: {
    fontSize: 16,
    fontWeight: '500',
    flexShrink: 1,
  },
  goalFields: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: ROW_PAD_H,
    paddingBottom: ROW_PAD_V,
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
  deletePressable: {
    marginTop: 24,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 48,
    overflow: 'hidden',
  },
  deleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  deleteLabel: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },
});
