import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import ScreenLayout from '../../components/common/ScreenLayout';
import { getAllEvents } from '../../api/events';

export default function CalendarSettingsScreen() {
  const { colors } = useTheme();
  const [events, setEvents] = useState<any[]>([]);
  const isFocused = useIsFocused();
  const navigation = useNavigation<any>();

  const fetchEvents = async () => {
    try {
      const data = await getAllEvents();
      setEvents(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isFocused) fetchEvents();
  }, [isFocused]);

  return (
    <ScreenLayout title="Manage Events" showBack={true}>
      <FlatList
        contentContainerStyle={styles.container}
        data={events}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={<View style={[styles.groupedContainer, { backgroundColor: colors.surface, borderColor: colors.border }]} />}
        renderItem={({ item, index }) => (
          <View style={[styles.groupedContainer, index !== events.length - 1 && styles.borderBottom, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity 
                style={styles.row} 
                onPress={() => navigation.navigate('EventEntry', { event: item })}
                activeOpacity={0.7}
            >
                <View style={styles.content}>
                  <Text style={[styles.title, { color: colors.text }]}>{item.name}</Text>
                  <Text style={{ color: colors.subtext, fontSize: 12 }}>{item.date} • {item.start_time}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.subtext} />
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={<View style={[styles.groupedContainer, { backgroundColor: colors.surface, borderColor: colors.border }]} />}
      />
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.accent }]} 
        onPress={() => navigation.navigate('EventEntry')}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  groupedContainer: { borderRadius: 16, backgroundColor: '#1C1C1E', borderWidth: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  borderBottom: { borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.1)' },
  content: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
});
