import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Switch, Linking, Platform, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../../components/ui/AppText';
import { Icon } from '../../components/ui/Icon';
import { IconSettings, IconClock } from 'tabler-icons-react-native';
import ScreenLayout from '../../components/common/ScreenLayout';
import AppDatePicker from '../../components/common/AppDatePicker';

const Divider = () => {
  const { colors } = useTheme();
  return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
};

const SectionLabel = ({ label }: { label: string }) => {
  const { colors } = useTheme();
  return <AppText style={[styles.sectionLabel, { color: colors.subtext }]}>{label.toUpperCase()}</AppText>;
};

export default function NotificationsScreen() {
  const { colors, accentColor } = useTheme();
  const [permissionStatus, setPermissionStatus] = useState<string>('granted');
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [planningReminderEnabled, setPlanningReminderEnabled] = useState(false);
  const [habitReminderEnabled, setHabitReminderEnabled] = useState(true);
  const [taskReminderEnabled, setTaskReminderEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const openSettings = () => {
    if (Platform.OS === 'ios') Linking.openURL('app-settings:');
    else Linking.openSettings();
  };

  const isControlsDisabled = permissionStatus !== 'granted' || !remindersEnabled;

  return (
    <ScreenLayout title="NOTIFICATIONS" showBack={true}>
      <AppDatePicker
        value={reminderTime}
        onChange={(d) => setReminderTime(d)}
        includeDate={false}
        includeTime={true}
        visible={showPicker}
        onClose={() => setShowPicker(false)}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <SectionLabel label="Permissions" />
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.menuItem}>
                <AppText style={{ color: colors.text }}>Notification Permission</AppText>
                <AppText style={{ color: permissionStatus === 'granted' ? accentColor : colors.error }}>
                    {permissionStatus === 'granted' ? 'Allowed' : permissionStatus === 'denied' ? 'Disabled' : 'Not determined'}
                </AppText>
            </View>
            {permissionStatus !== 'granted' && (
                <>
                    <Divider />
                    <TouchableOpacity style={styles.menuItem} onPress={openSettings}>
                        <AppText style={{ color: colors.text }}>Open System Settings</AppText>
                        <Icon name={IconSettings} size={20} color={colors.subtext} />
                    </TouchableOpacity>
                </>
            )}
        </View>

        <SectionLabel label="Reminders" />
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.menuItem}>
                <AppText style={{ color: colors.text }}>Master Notifications</AppText>
                <Switch 
                    value={remindersEnabled} 
                    onValueChange={setRemindersEnabled}
                    trackColor={{ true: accentColor, false: colors.border }}
                    thumbColor={colors.background}
                />
            </View>
            <Divider />
            <View style={styles.menuItem}>
                <AppText style={{ color: isControlsDisabled ? colors.subtext : colors.text }}>Daily Planning Reminder</AppText>
                <Switch 
                    value={planningReminderEnabled} 
                    onValueChange={setPlanningReminderEnabled}
                    disabled={isControlsDisabled}
                    trackColor={{ true: accentColor, false: colors.border }}
                    thumbColor={colors.background}
                />
            </View>
            {planningReminderEnabled && !isControlsDisabled && (
                <>
                    <Divider />
                    <TouchableOpacity style={styles.menuItem} onPress={() => setShowPicker(true)}>
                        <AppText style={{ color: colors.subtext }}>Reminder Time</AppText>
                        <View style={styles.row}>
                            <AppText style={{ color: colors.text, marginRight: 8 }}>{reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</AppText>
                            <Icon name={IconClock} size={16} color={colors.subtext} />
                        </View>
                    </TouchableOpacity>
                </>
            )}
            <Divider />
            <View style={styles.menuItem}>
                <AppText style={{ color: isControlsDisabled ? colors.subtext : colors.text }}>Habit Reminders</AppText>
                <Switch 
                    value={habitReminderEnabled} 
                    onValueChange={setHabitReminderEnabled}
                    disabled={isControlsDisabled}
                    trackColor={{ true: accentColor, false: colors.border }}
                    thumbColor={colors.background}
                />
            </View>
            <Divider />
            <View style={styles.menuItem}>
                <AppText style={{ color: isControlsDisabled ? colors.subtext : colors.text }}>Task Reminders</AppText>
                <Switch 
                    value={taskReminderEnabled} 
                    onValueChange={setTaskReminderEnabled}
                    disabled={isControlsDisabled}
                    trackColor={{ true: accentColor, false: colors.border }}
                    thumbColor={colors.background}
                />
            </View>
        </View>
        
        <AppText style={[styles.info, { color: colors.subtext }]}>
          Manage how and when you receive reminders from JAY. {isControlsDisabled ? '\n\nNote: Notifications are disabled by OS permissions or master toggle.' : ''}
        </AppText>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  section: { borderRadius: 16, borderWidth: 1, marginBottom: 24, overflow: 'hidden' },
  sectionLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.8, marginBottom: 8, paddingHorizontal: 4 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18 },
  row: { flexDirection: 'row', alignItems: 'center' },
  divider: { height: 1, marginHorizontal: 16 },
  info: { fontSize: 13, paddingHorizontal: 4, lineHeight: 18 },
});
