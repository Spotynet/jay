import React, { useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../../components/ui/AppText';
import { Icon } from '../../components/ui/Icon';
import FormScreen from '../../components/common/FormScreen';
import { useNavigation, useRoute } from '@react-navigation/native';
import AppDatePicker from '../../components/common/AppDatePicker';
import { AppTimePicker } from '../../components/common/AppTimePicker';
import { IconEdit } from 'tabler-icons-react-native';
import { createEvent, updateEvent } from '../../api/events';
import { toLocalDateString, parseLocalDate } from '../../utils/date';
import { useUnsavedChangesGuard } from '../../hooks/useUnsavedChangesGuard';

function snapshotEventDraft(values: {
  name: string;
  description: string;
  location: string;
  dateKey: string;
  startKey: string;
  hours: number;
  minutes: number;
}) {
  return JSON.stringify(values);
}

export default function EventEntryScreen() {
  const { colors, entityColors } = useTheme();
  const eventColor = entityColors.events;
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const event = route.params?.event;
  const initialDate = route.params?.date;
  const initialTime = route.params?.time;
  const occurrenceDate = route.params?.occurrenceDate as string | undefined;

  const [name, setName] = useState(event?.name || '');
  const [description, setDescription] = useState(event?.description || '');
  const [location, setLocation] = useState(event?.location || '');
  const [date, setDate] = useState(
    event?.date
      ? parseLocalDate(event.date)
      : initialDate
        ? parseLocalDate(initialDate)
        : new Date(),
  );
  const [startTime, setStartTime] = useState(
    event?.start_time
      ? new Date(`1970-01-01T${event.start_time}`)
      : initialTime
        ? new Date(`1970-01-01T${initialTime}`)
        : new Date(),
  );

  const [hours, setHours] = useState(event?.duration ? parseInt(event.duration.split(':')[0], 10) : 1);
  const [minutes, setMinutes] = useState(
    event?.duration ? parseInt(event.duration.split(':')[1], 10) : 0,
  );

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allowLeave, setAllowLeave] = useState(false);

  const initialSnapshot = useMemo(
    () =>
      snapshotEventDraft({
        name: event?.name || '',
        description: event?.description || '',
        location: event?.location || '',
        dateKey: toLocalDateString(
          event?.date
            ? parseLocalDate(event.date)
            : initialDate
              ? parseLocalDate(initialDate)
              : new Date(),
        ),
        startKey: (
          event?.start_time
            ? new Date(`1970-01-01T${event.start_time}`)
            : initialTime
              ? new Date(`1970-01-01T${initialTime}`)
              : new Date()
        )
          .toTimeString()
          .slice(0, 5),
        hours: event?.duration ? parseInt(event.duration.split(':')[0], 10) : 1,
        minutes: event?.duration ? parseInt(event.duration.split(':')[1], 10) : 0,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const isDirty =
    !allowLeave &&
    snapshotEventDraft({
      name,
      description,
      location,
      dateKey: toLocalDateString(date),
      startKey: startTime.toTimeString().slice(0, 5),
      hours,
      minutes,
    }) !== initialSnapshot;
  useUnsavedChangesGuard(isDirty);

  const saveEvent = async () => {
    if (loading) return;
    if (!name.trim()) {
      setError('Enter an event name.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const data = {
        name,
        description,
        date: toLocalDateString(date),
        start_time: startTime.toTimeString().slice(0, 5),
        duration: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`,
        location,
      };
      if (event) await updateEvent(event.id, data);
      else await createEvent(data);
      setAllowLeave(true);
      navigation.goBack();
    } catch (e) {
      setError("Couldn't save this event.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormScreen
      title={event ? 'Event details' : 'New event'}
      showBack
      submitTitle={loading ? 'Saving…' : 'Save'}
      onSubmit={saveEvent}
      loading={loading}
      error={error}
      submitStyle={{ backgroundColor: eventColor }}
    >
      <View style={styles.identity}>
        <AppText style={[styles.typeLabel, { color: eventColor }]}>Event</AppText>
        <TextInput
          style={[
            styles.titleInput,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
          ]}
          placeholder="Event name"
          placeholderTextColor={colors.subtext}
          value={name}
          onChangeText={setName}
          autoFocus={false}
          accessibilityLabel="Event name"
        />
        {occurrenceDate ? (
          <AppText style={[styles.occurrenceHint, { color: colors.subtext }]}>
            From timeline · {occurrenceDate}
          </AppText>
        ) : null}
      </View>

      <View style={styles.field}>
        <AppText style={[styles.label, { color: colors.subtext }]}>Notes</AppText>
        <TextInput
          style={[
            styles.input,
            styles.textArea,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
          ]}
          placeholder="Optional description"
          placeholderTextColor={colors.subtext}
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
          accessibilityLabel="Description"
        />
      </View>

      <View style={styles.field}>
        <AppText style={[styles.label, { color: colors.subtext }]}>Location</AppText>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
          ]}
          placeholder="Optional location"
          placeholderTextColor={colors.subtext}
          value={location}
          onChangeText={setLocation}
          accessibilityLabel="Location"
        />
      </View>

      <View style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TouchableOpacity
          style={styles.groupRow}
          onPress={() => setShowDatePicker(true)}
          accessibilityRole="button"
          accessibilityLabel="Event date"
        >
          <AppText style={[styles.groupLabel, { color: colors.subtext }]}>Date</AppText>
          <View style={styles.groupValue}>
            <AppText style={{ color: colors.text, fontSize: 16 }}>{date.toLocaleDateString()}</AppText>
            <Icon name={IconEdit} size={18} color={colors.subtext} />
          </View>
        </TouchableOpacity>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <TouchableOpacity
          style={styles.groupRow}
          onPress={() => setShowStartTimePicker(true)}
          accessibilityRole="button"
          accessibilityLabel="Start time"
        >
          <AppText style={[styles.groupLabel, { color: colors.subtext }]}>Start</AppText>
          <View style={styles.groupValue}>
            <AppText style={{ color: colors.text, fontSize: 16 }}>
              {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </AppText>
            <Icon name={IconEdit} size={18} color={colors.subtext} />
          </View>
        </TouchableOpacity>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.groupRow}>
          <AppText style={[styles.groupLabel, { color: colors.subtext }]}>Duration</AppText>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <TextInput
                style={[styles.smallInput, { color: colors.text, borderColor: colors.border }]}
                keyboardType="numeric"
                value={hours.toString()}
                onChangeText={(v) => setHours(parseInt(v, 10) || 0)}
                accessibilityLabel="Duration hours"
              />
              <AppText style={{ color: colors.subtext }}>H</AppText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <TextInput
                style={[styles.smallInput, { color: colors.text, borderColor: colors.border }]}
                keyboardType="numeric"
                value={minutes.toString()}
                onChangeText={(v) => setMinutes(parseInt(v, 10) || 0)}
                accessibilityLabel="Duration minutes"
              />
              <AppText style={{ color: colors.subtext }}>M</AppText>
            </View>
          </View>
        </View>
      </View>

      <AppDatePicker
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        value={date}
        onChange={(d) => setDate(d)}
        mode="date"
        label="Select Date"
      />
      <AppTimePicker
        visible={showStartTimePicker}
        onClose={() => setShowStartTimePicker(false)}
        value={startTime}
        onChange={(d) => setStartTime(d)}
        label="Start Time"
      />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  identity: { gap: 6, marginBottom: 16, marginTop: 8 },
  typeLabel: { fontSize: 12, fontWeight: '600' },
  titleInput: {
    fontSize: 22,
    fontWeight: '600',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  occurrenceHint: { fontSize: 12 },
  field: { marginBottom: 16, gap: 8 },
  label: { fontSize: 12, fontWeight: '600', letterSpacing: 0.4, textTransform: 'uppercase' },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    fontSize: 16,
  },
  textArea: { minHeight: 96, textAlignVertical: 'top' },
  group: { borderRadius: 16, borderWidth: 1, marginBottom: 16, overflow: 'hidden' },
  groupRow: {
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupLabel: { fontSize: 14 },
  groupValue: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 14 },
  smallInput: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    width: 50,
    textAlign: 'center',
  },
});
