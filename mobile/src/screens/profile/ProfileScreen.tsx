import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../../components/ui/AppText';
import { Icon } from '../../components/ui/Icon';
import { 
  IconUser, IconShield, IconCalendar, IconBell, IconPalette, IconColorSwatch, 
  IconDatabase, IconCloud, IconHelp, IconInfoCircle, IconLogout, IconChevronRight 
} from 'tabler-icons-react-native';
import ScreenLayout from '../../components/common/ScreenLayout';
import { useAuth } from '../../context/AuthContext';
import { ColorPickerModal } from './components/ColorPickerModal';

const Divider = () => {
  const { colors } = useTheme();
  return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
};

const MenuItem = ({ icon, label, onPress, rightElement }: { icon: any, label: string, onPress?: () => void, rightElement?: React.ReactNode }) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} disabled={!!rightElement && !onPress}>
      <View style={styles.menuLeft}>
        <Icon name={icon} size={22} color={colors.subtext} />
        <AppText style={[styles.menuText, { color: colors.text }]}>{label}</AppText>
      </View>
      {rightElement || <Icon name={IconChevronRight} size={20} color={colors.subtext} />}
    </TouchableOpacity>
  );
};

export default function ProfileScreen() {
  const { colors, theme, setTheme, accentColor, setAccentColor } = useTheme();
  const { signOut } = useAuth();
  const navigation = useNavigation<any>();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <ScreenLayout title="Profile" contentStyle={{ padding: 0 }}>
      <ColorPickerModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        onSelect={setAccentColor}
        currentColor={accentColor}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 10 }]}>
          <MenuItem icon={IconUser} label="Account" onPress={() => navigation.navigate('Account')} />
          <Divider />
          <MenuItem icon={IconShield} label="Security" onPress={() => navigation.navigate('Security')} />
          </View>
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <MenuItem icon={IconCalendar} label="Day Setup" onPress={() => navigation.navigate('DaySetup')} />
          <Divider />
          <MenuItem icon={IconBell} label="Notifications" onPress={() => navigation.navigate('Notifications')} />
          <Divider />
          <MenuItem 
            icon={IconPalette} 
            label="Theme" 
            rightElement={
              <Switch 
                value={theme === 'dark'} 
                onValueChange={(val) => setTheme(val ? 'dark' : 'light')} 
                trackColor={{ true: colors.accent, false: colors.border }}
                thumbColor={colors.background}
                ios_backgroundColor={colors.border}
              />
            } 
          />
          <Divider />
          <MenuItem 
            icon={IconColorSwatch} 
            label="Accent Color" 
            onPress={() => setModalVisible(true)}
            rightElement={
              <View style={[styles.accentCircle, { backgroundColor: accentColor, borderColor: colors.card }]} />
            }
          />
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <MenuItem icon={IconHelp} label="Help" />
          <Divider />
          <MenuItem icon={IconInfoCircle} label="About" />
        </View>

        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.card }]} onPress={signOut}>
          <Icon name={IconLogout} size={20} color="#FF3B30" />
          <AppText style={styles.logoutText}>Log Out</AppText>
        </TouchableOpacity>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 20 },
  section: { borderRadius: 16, borderWidth: 1, marginBottom: 24, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuText: { fontSize: 16 },
  divider: { height: 1, marginHorizontal: 16 },
  accentCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16, borderRadius: 16 },
  logoutText: { fontSize: 16, color: '#FF3B30', fontWeight: '600' }
});
