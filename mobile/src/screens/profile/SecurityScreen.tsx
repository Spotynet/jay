import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../../components/ui/AppText';
import { Icon } from '../../components/ui/Icon';
import { IconLogout, IconDeviceMobile, IconLock } from 'tabler-icons-react-native';
import ScreenLayout from '../../components/common/ScreenLayout';
import { useAuth } from '../../context/AuthContext';
import DeleteConfirm from '../../components/ui/DeleteConfirm';

const SectionLabel = ({ label }: { label: string }) => {
  const { colors } = useTheme();
  return <AppText style={[styles.sectionLabel, { color: colors.subtext }]}>{label.toUpperCase()}</AppText>;
};

export default function SecurityScreen() {
  const { colors } = useTheme();
  const { signOut, user } = useAuth();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  return (
    <ScreenLayout title="SECURITY" showBack={true}>
      <ScrollView contentContainerStyle={styles.container}>
        <SectionLabel label="Authentication" />
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.menuItem}>
            <AppText style={{ color: colors.text }}>Email Verification</AppText>
            <AppText style={{ color: colors.accent }}>Verified</AppText>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.menuItem}>
            <AppText style={{ color: colors.text }}>Biometric Lock</AppText>
            <AppText style={{ color: colors.subtext }}>Disabled</AppText>
          </View>
        </View>

        <SectionLabel label="Current Session" />
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.menuItem}>
            <View style={styles.row}>
                <Icon name={IconDeviceMobile} size={20} color={colors.subtext} style={{ marginRight: 12 }} />
                <View>
                    <AppText style={{ color: colors.text, fontWeight: '600' }}>{Platform.OS === 'ios' ? 'iPhone' : 'Android Device'}</AppText>
                    <AppText style={{ color: colors.subtext, fontSize: 13 }}>{user?.email || 'Active'}</AppText>
                </View>
            </View>
          </View>
        </View>

        <SectionLabel label="Security Actions" />
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.error }]}>
          <TouchableOpacity style={styles.menuItem} onPress={() => setDeleteModalVisible(true)}>
            <AppText style={{ color: colors.error, fontWeight: '600' }}>Sign Out All Devices</AppText>
            <Icon name={IconLogout} size={20} color={colors.error} />
          </TouchableOpacity>
        </View>

        <AppText style={[styles.info, { color: colors.subtext }]}>
          Keep your account secure by ensuring your email is verified and reviewing your active sessions regularly.
        </AppText>
      </ScrollView>

      <DeleteConfirm
        visible={deleteModalVisible}
        title="Sign Out All Devices"
        message="Are you sure you want to sign out from all your devices? You will need to log in again."
        onConfirm={signOut}
        onCancel={() => setDeleteModalVisible(false)}
      />
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
