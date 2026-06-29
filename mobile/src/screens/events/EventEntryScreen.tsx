import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../../components/ui/AppText';
import { Icon } from '../../components/ui/Icon';
import ScreenLayout from '../../components/common/ScreenLayout';
import { AuthButton } from '../auth/components/AuthButton';
import { useNavigation, useRoute } from '@react-navigation/native';
import AppDatePicker from '../../components/common/AppDatePicker';
import { AppTimePicker } from '../../components/common/AppTimePicker';
import { IconEdit } from 'tabler-icons-react-native';
import { createEvent, updateEvent } from '../../api/events';

export default function EventEntryScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const event = route.params?.event;

  const [name, setName] = useState(event?.name || '');
  const [description, setDescription] = useState(event?.description || '');
  const [location, setLocation] = useState(event?.location || '');
  const [date, setDate] = useState(event?.date ? new Date(event.date) : new Date());
  const [startTime, setStartTime] = useState(event?.start_time ? new Date(`1970-01-01T${event.start_time}`) : new Date());
  
  const [hours, setHours] = useState(event?.duration ? parseInt(event.duration.split(':')[0]) : 1);
  const [minutes, setMinutes] = useState(event?.duration ? parseInt(event.duration.split(':')[1]) : 0);
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const saveEvent = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const data = {
        name,
        description,
        date: date.toISOString().split('T')[0],
        start_time: startTime.toTimeString().slice(0, 5),
        duration: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`,
        location
      };
      if (event) await updateEvent(event.id, data);
      else await createEvent(data);
      Alert.alert('Success', 'Event saved!');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenLayout title={event ? "Edit Event" : "New Event"} showBack={true}>
      <ScrollView contentContainerStyle={styles.container}>
        <TextInput
          style={[styles.timePicker, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border, fontSize: 16, width: '100%' }]}
          placeholder="Event Name"
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

        <TextInput
          style={[styles.timePicker, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border, width: '100%' }]}
          placeholder="Location"
          placeholderTextColor={colors.subtext}
          value={location}
          onChangeText={setLocation}
        />

        <View style={[styles.timePicker, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <AppText style={[styles.subtitleLabel, { color: colors.subtext, marginBottom: 12 }]}>DATE</AppText>
          <TouchableOpacity style={styles.timeRow} onPress={() => setShowDatePicker(true)}>
            <AppText style={{ color: colors.text, fontSize: 16 }}>{date.toLocaleDateString()}</AppText>
            <Icon name={IconEdit} size={20} color={colors.subtext} />
          </TouchableOpacity>
        </View>

        <View style={[styles.timePicker, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <AppText style={[styles.subtitleLabel, { color: colors.subtext, marginBottom: 12 }]}>START TIME</AppText>
          <TouchableOpacity style={styles.timeRow} onPress={() => setShowStartTimePicker(true)}>
            <AppText style={{ color: colors.text, fontSize: 16 }}>{startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</AppText>
            <Icon name={IconEdit} size={20} color={colors.subtext} />
          </TouchableOpacity>
        </View>

        <View style={[styles.timePicker, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <AppText style={[styles.subtitleLabel, { color: colors.subtext, marginBottom: 12 }]}>DURATION</AppText>
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
        </View>
        
        <AppDatePicker visible={showDatePicker} onClose={() => setShowDatePicker(false)} value={date} onChange={(d) => setDate(d)} mode="date" label="Select Date" />
        <AppTimePicker visible={showStartTimePicker} onClose={() => setShowStartTimePicker(false)} value={startTime} onChange={(d) => setStartTime(d)} label="Start Time" />
      </ScrollView>
      <View style={styles.footer}>
        <AuthButton title={loading ? "Saving..." : "Save"} onPress={saveEvent} loading={loading} />
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
