import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../../components/ui/AppText';
import { Icon } from '../../components/ui/Icon';
import { IconCamera, IconPencil, IconCheck, IconX, IconChevronRight } from 'tabler-icons-react-native';
import ScreenLayout from '../../components/common/ScreenLayout';
import { useAuth } from '../../context/AuthContext';
import { updateUser } from '../../api/user';
import DeleteConfirm from '../../components/ui/DeleteConfirm';
import { EditNameModal } from './components/EditNameModal';
import { TimezonePickerModal } from './components/TimezonePickerModal';

const Divider = () => {
  const { colors } = useTheme();
  return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
};

const SectionLabel = ({ label }: { label: string }) => {
  const { colors } = useTheme();
  return <AppText style={[styles.sectionLabel, { color: colors.subtext }]}>{label.toUpperCase()}</AppText>;
};

const InlineEditRow = ({ label, value, onSave }: { label: string, value: string, onSave: (val: string) => void }) => {
  const { colors, accentColor } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(value);

  if (isEditing) {
    return (
      <View style={[styles.menuItem, { backgroundColor: colors.surface, borderRadius: 12 }]}>
        <TextInput 
            value={text} 
            onChangeText={setText} 
            style={[styles.input, { color: colors.text }]}
            autoFocus
        />
        <View style={styles.row}>
            <TouchableOpacity onPress={() => { onSave(text); setIsEditing(false); }}><Icon name={IconCheck} size={20} color={accentColor} /></TouchableOpacity>
            <TouchableOpacity onPress={() => { setText(value); setIsEditing(false); }} style={{ marginLeft: 12 }}><Icon name={IconX} size={20} color={colors.subtext} /></TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.menuItem} onPress={() => setIsEditing(true)}>
      <AppText style={{ color: colors.text }}>{label}</AppText>
      <View style={styles.row}><AppText style={{ color: colors.subtext, marginRight: 8 }}>{value}</AppText><Icon name={IconPencil} size={16} color={colors.subtext} /></View>
    </TouchableOpacity>
  );
};

export default function AccountScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [timezonePickerVisible, setTimezonePickerVisible] = useState(false);
  const [userData, setUserData] = useState({ 
    firstName: user?.first_name || '', 
    lastName: user?.last_name || '',
    timezone: user?.timezone || 'UTC'
  });

  const handleUpdate = async (updates: Partial<typeof userData>) => {
    await updateUser({
      first_name: updates.firstName ?? userData.firstName,
      last_name: updates.lastName ?? userData.lastName,
      timezone: updates.timezone ?? userData.timezone,
    });
    setUserData(prev => ({ ...prev, ...updates }));
  };

  const fullName = `${userData.firstName} ${userData.lastName}`.trim() || user?.email || 'Account';
  const initials = (userData.firstName[0] || userData.lastName[0] || user?.email?.[0] || 'A').toUpperCase();

  return (
    <ScreenLayout title="ACCOUNT" showBack={true}>
      <TimezonePickerModal 
        visible={timezonePickerVisible}
        onClose={() => setTimezonePickerVisible(false)}
        onSelect={(timezone) => handleUpdate({ timezone })}
        currentTimezone={userData.timezone}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.profileHeader, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity style={styles.avatarContainer}>
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.border }]}><AppText style={{color: colors.text, fontSize: 32}}>{initials}</AppText></View>
            <View style={[styles.editBadge, { backgroundColor: colors.surface, borderColor: colors.card }]}>
                <Icon name={IconCamera} size={14} color={colors.text} />
            </View>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <AppText style={[styles.displayName, { color: colors.text }]}>{fullName}</AppText>
          </View>
        </View>

        <SectionLabel label="Personal Info" />
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <InlineEditRow label="First Name" value={userData.firstName} onSave={(firstName) => handleUpdate({ firstName })} />
          <Divider />
          <InlineEditRow label="Last Name" value={userData.lastName} onSave={(lastName) => handleUpdate({ lastName })} />
          <Divider />
          <View style={styles.menuItem}>
            <AppText style={{ color: colors.text }}>Email</AppText>
            <AppText style={{ color: colors.subtext }}>{user?.email}</AppText>
          </View>
          <Divider />
          <TouchableOpacity style={styles.menuItem} onPress={() => setTimezonePickerVisible(true)}>
            <AppText style={{ color: colors.text }}>Timezone</AppText>
            <View style={styles.row}><AppText style={{ color: colors.subtext, marginRight: 8 }}>{userData.timezone}</AppText><Icon name={IconChevronRight} size={16} color={colors.subtext} /></View>
          </TouchableOpacity>
        </View>

        <SectionLabel label="Danger Zone" />
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.error }]}>
          <TouchableOpacity style={styles.menuItem} onPress={() => setDeleteModalVisible(true)}>
            <AppText style={{ color: colors.error, fontWeight: '600' }}>Delete Account</AppText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <DeleteConfirm
        visible={deleteModalVisible}
        title="Delete Account"
        message="Are you sure you want to permanently delete your account? This action cannot be undone."
        onConfirm={() => setDeleteModalVisible(false)}
        onCancel={() => setDeleteModalVisible(false)}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  profileHeader: { padding: 24, borderRadius: 16, borderWidth: 1, marginBottom: 24, alignItems: 'center' },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  editBadge: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
  headerInfo: { alignItems: 'center' },
  displayName: { fontSize: 22, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center' },
  section: { borderRadius: 16, borderWidth: 1, marginBottom: 24, overflow: 'hidden' },
  sectionLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.8, marginBottom: 8, paddingHorizontal: 4 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18 },
  divider: { height: 1, marginHorizontal: 16 },
  input: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, flex: 1, marginRight: 12 },
});
