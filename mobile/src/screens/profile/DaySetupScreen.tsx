import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../../components/ui/AppText';
import { Icon } from '../../components/ui/Icon';
import { IconChevronRight, IconClock } from 'tabler-icons-react-native';
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

export default function DaySetupScreen() {
  const { colors, accentColor } = useTheme();
  const [dayStart, setDayStart] = useState(new Date(new Date().setHours(6, 0)));
  const [dayEnd, setDayEnd] = useState(new Date(new Date().setHours(22, 0)));
  const [planningTime, setPlanningTime] = useState(new Date(new Date().setHours(8, 0)));
  const [promptEnabled, setPromptEnabled] = useState(true);
  
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showPlanPicker, setShowPlanPicker] = useState(false);

  return (
    <ScreenLayout title="DAY SETUP" showBack={true}>
      <AppDatePicker visible={showStartPicker} value={dayStart} onChange={setDayStart} onClose={() => setShowStartPicker(false)} includeTime={true} includeDate={false} label="Day Start" />
      <AppDatePicker visible={showEndPicker} value={dayEnd} onChange={setDayEnd} onClose={() => setShowEndPicker(false)} includeTime={true} includeDate={false} label="Day End" />
      <AppDatePicker visible={showPlanPicker} value={planningTime} onChange={setPlanningTime} onClose={() => setShowPlanPicker(false)} includeTime={true} includeDate={false} label="Planning Time" />

      <ScrollView contentContainerStyle={styles.container}>
        <SectionLabel label="Day Boundaries" />
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity style={styles.menuItem} onPress={() => setShowStartPicker(true)}>
            <AppText style={{ color: colors.text }}>Day Start</AppText>
            <View style={styles.row}><AppText style={{ color: colors.subtext, marginRight: 8 }}>{dayStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</AppText><Icon name={IconClock} size={16} color={colors.subtext} /></View>
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity style={styles.menuItem} onPress={() => setShowEndPicker(true)}>
            <AppText style={{ color: colors.text }}>Day End</AppText>
            <View style={styles.row}><AppText style={{ color: colors.subtext, marginRight: 8 }}>{dayEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</AppText><Icon name={IconClock} size={16} color={colors.subtext} /></View>
          </TouchableOpacity>
        </View>

        <SectionLabel label="Planning" />
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.menuItem}>
            <AppText style={{ color: colors.text }}>Prompt me to plan my day</AppText>
            <Switch 
                value={promptEnabled} 
                onValueChange={setPromptEnabled}
                trackColor={{ true: accentColor, false: colors.border }}
                thumbColor={colors.background}
            />
          </View>
          {promptEnabled && (
            <>
                <Divider />
                <TouchableOpacity style={styles.menuItem} onPress={() => setShowPlanPicker(true)}>
                    <AppText style={{ color: colors.text }}>Planning Time</AppText>
                    <View style={styles.row}><AppText style={{ color: colors.subtext, marginRight: 8 }}>{planningTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</AppText><Icon name={IconClock} size={16} color={colors.subtext} /></View>
                </TouchableOpacity>
            </>
          )}
        </View>
        
        <AppText style={[styles.info, { color: colors.subtext }]}>
          Customize your daily schedule boundaries to frame your experience and receive helpful planning reminders.
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
