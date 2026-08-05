import React, { useState } from 'react';
import { View, StyleSheet, TextInput, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/common/ScreenLayout';
import { AppText } from '../../components/ui/AppText';
import { Icon } from '../../components/ui/Icon';
import { createAccount, updateAccount, deleteAccount } from '../../api/finance';
import { AuthButton } from '../auth/components/AuthButton';
import { IconWallet, IconTrash } from 'tabler-icons-react-native';
import DeleteConfirm from '../../components/ui/DeleteConfirm';

const sanitizeAmountInput = (value: string) => {
  const cleaned = value.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  if (isNaN(parsed)) return '0.00';
  return parsed.toFixed(2);
};

export default function AccountEntryScreen() {
  const { colors, entityColors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const account = route.params?.account;

  const [name, setName] = useState(account?.name || '');
  const [balance, setBalance] = useState(
    account?.initial_balance != null ? parseFloat(account.initial_balance).toFixed(2) : '0.00'
  );
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const saveAccount = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter an account name');
      return;
    }

    setLoading(true);
    try {
      const data = { name: name.trim(), initial_balance: parseFloat(balance) || 0 };
      if (account) {
        await updateAccount(account.id, data);
      } else {
        await createAccount(data);
      }
      Alert.alert('Success', 'Account saved');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to save account');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!account) return;
    setLoading(true);
    try {
      await deleteAccount(account.id);
      Alert.alert('Deleted', 'Account removed');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to delete');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <ScreenLayout
      title={account ? 'EDIT ACCOUNT' : 'NEW ACCOUNT'}
      showBack={true}
      rightOption={
        account
          ? {
              render: () => (
                <TouchableOpacity onPress={() => setShowDeleteConfirm(true)} style={styles.headerBtn}>
                  <Icon name={IconTrash} size={20} color={colors.error} />
                </TouchableOpacity>
              ),
            }
          : undefined
      }
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <AppText style={[styles.sectionLabel, { color: colors.subtext }]}>ACCOUNT DETAILS</AppText>

          <View style={[styles.iconSection, { backgroundColor: `${entityColors.finance}14` }]}>
            <Icon name={IconWallet} size={32} color={entityColors.finance} />
          </View>

          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}
            placeholder="Account name (e.g. Main, Savings)"
            placeholderTextColor={colors.subtext}
            value={name}
            onChangeText={setName}
          />

          <View>
            <AppText style={[styles.fieldLabel, { color: colors.subtext }]}>INITIAL BALANCE</AppText>
            <View style={[styles.balanceInput, { borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}>
              <AppText style={[styles.balanceCurrency, { color: entityColors.finance }]}>$</AppText>
              <TextInput
                style={[styles.balanceField, { color: colors.text }]}
                value={balance}
                onChangeText={(text) => setBalance(sanitizeAmountInput(text))}
                onBlur={() => setBalance(sanitizeAmountInput(balance))}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.subtext}
              />
            </View>
          </View>
        </View>

        <AuthButton title={account ? 'Update Account' : 'Create Account'} onPress={saveAccount} loading={loading} />

        <DeleteConfirm visible={showDeleteConfirm} onCancel={() => setShowDeleteConfirm(false)} onConfirm={handleDelete} />
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerBtn: { padding: 8 },
  container: { paddingVertical: 20, gap: 16 },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  iconSection: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  balanceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    gap: 8,
  },
  balanceCurrency: {
    fontSize: 18,
    fontWeight: '800',
  },
  balanceField: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
  },
});
