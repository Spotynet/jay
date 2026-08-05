import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, ScrollView, Alert, TouchableOpacity, Modal, FlatList } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/common/ScreenLayout';
import AppDatePicker from '../../components/common/AppDatePicker';
import { AppText } from '../../components/ui/AppText';
import { Icon } from '../../components/ui/Icon';
import { createTransaction, updateTransaction, deleteTransaction, getAccounts, getCategories } from '../../api/finance';
import { AuthButton } from '../auth/components/AuthButton';
import {
  IconCalendar,
  IconMinus,
  IconPlus,
  IconTrendingDown,
  IconTrendingUp,
  IconWallet,
  IconTag,
  IconChevronDown,
  IconTrash,
} from 'tabler-icons-react-native';
import DeleteConfirm from '../../components/ui/DeleteConfirm';

const formatMoney = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

const toAmountString = (amount: number) => amount.toFixed(2);

const normalizeAmount = (value: string) => {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

const sanitizeAmountInput = (value: string) => {
  const cleaned = value.replace(/[^0-9.]/g, '');
  const [whole, ...rest] = cleaned.split('.');
  if (rest.length === 0) return whole;
  return `${whole}.${rest.join('').slice(0, 2)}`;
};

export default function TransactionEntryScreen() {
  const { colors, entityColors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const transaction = route.params?.transaction;

  const [amount, setAmount] = useState(transaction?.amount != null ? Number(transaction.amount).toFixed(2) : '0.00');
  const [type, setType] = useState<'EXPENSE' | 'EARNING'>(transaction?.type || 'EXPENSE');
  const [account, setAccount] = useState<any>(transaction?.account || null);
  const [category, setCategory] = useState<any>(transaction?.category || null);
  const [date, setDate] = useState(transaction?.date ? new Date(transaction.date) : new Date());
  const [description, setDescription] = useState(transaction?.description || '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [a, c] = await Promise.all([getAccounts(), getCategories()]);
      setAccounts(Array.isArray(a) ? a : []);
      setCategories(Array.isArray(c) ? c : []);
    };
    fetchData();
  }, []);

  const filteredCategories = categories.filter((c: any) => {
    if (type === 'EXPENSE') return c.type === 'EXPENSE';
    return c.type === 'EARNING';
  });

  const updateAmount = (nextAmount: number) => {
    setAmount(toAmountString(Math.max(0, nextAmount)));
  };

  const saveTransaction = async () => {
    const numericValue = normalizeAmount(amount);
    if (numericValue <= 0) {
      Alert.alert('Error', 'Please enter an amount');
      return;
    }

    setLoading(true);
    try {
      const data = {
        amount: numericValue,
        type,
        account: account?.id || null,
        category: category?.id || null,
        date: date.toISOString().split('T')[0],
        description,
      };

      if (transaction) {
        await updateTransaction(transaction.id, data);
      } else {
        await createTransaction(data);
      }
      Alert.alert('Success', 'Transaction saved');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!transaction) return;
    setLoading(true);
    try {
      await deleteTransaction(transaction.id);
      Alert.alert('Deleted', 'Transaction removed');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to delete');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const selectedAmount = normalizeAmount(amount);

  return (
    <ScreenLayout
      title={transaction ? 'EDIT TRANSACTION' : 'NEW TRANSACTION'}
      showBack={true}
      rightOption={
        transaction
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
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {/* Type Selection */}
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <AppText style={[styles.sectionLabel, { color: colors.subtext }]}>TYPE</AppText>
            <View style={styles.typeRow}>
              {([
                { value: 'EXPENSE', label: 'Expense', icon: IconTrendingDown, color: '#FF3B30' },
                { value: 'EARNING', label: 'Income', icon: IconTrendingUp, color: '#34C759' },
              ] as const).map((opt) => {
                const isSelected = type === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => { setType(opt.value); setCategory(null); }}
                    activeOpacity={0.8}
                    style={[
                      styles.typeOption,
                      {
                        backgroundColor: isSelected ? `${opt.color}12` : colors.surfaceElevated,
                        borderColor: isSelected ? opt.color : colors.border,
                      },
                    ]}
                  >
                    <View style={[styles.typeIconWrap, { backgroundColor: isSelected ? `${opt.color}18` : colors.surface }]}>
                      <Icon name={opt.icon} size={18} color={isSelected ? opt.color : colors.subtext} />
                    </View>
                    <AppText bold style={[styles.typeLabel, { color: isSelected ? opt.color : colors.text }]}>
                      {opt.label}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Amount */}
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <AppText style={[styles.sectionLabel, { color: colors.subtext }]}>AMOUNT</AppText>
            <View style={[styles.amountCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
              <View style={styles.amountRow}>
                <TouchableOpacity
                  onPress={() => updateAmount(selectedAmount - 5)}
                  activeOpacity={0.8}
                  style={[styles.adjustBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
                >
                  <Icon name={IconMinus} size={18} color={colors.text} />
                </TouchableOpacity>

                <View style={[styles.amountDisplay, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                  <AppText style={[styles.currency, { color: entityColors.finance }]}>$</AppText>
                  <TextInput
                    style={[styles.amountInput, { color: colors.text }]}
                    value={amount}
                    onChangeText={(text) => setAmount(sanitizeAmountInput(text))}
                    onBlur={() => setAmount(toAmountString(normalizeAmount(amount)))}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={colors.subtext}
                    textAlign="center"
                    selectTextOnFocus
                  />
                </View>

                <TouchableOpacity
                  onPress={() => updateAmount(selectedAmount + 5)}
                  activeOpacity={0.8}
                  style={[styles.adjustBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
                >
                  <Icon name={IconPlus} size={18} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Details */}
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <AppText style={[styles.sectionLabel, { color: colors.subtext }]}>DETAILS</AppText>

            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}
              placeholder="Description"
              placeholderTextColor={colors.subtext}
              value={description}
              onChangeText={setDescription}
            />

            {/* Account Picker */}
            <TouchableOpacity
              style={[styles.pickerField, { borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}
              onPress={() => setShowAccountPicker(true)}
              activeOpacity={0.8}
            >
              <Icon name={IconWallet} size={18} color={colors.subtext} />
              <View style={styles.pickerCopy}>
                <AppText style={[styles.fieldLabel, { color: colors.subtext }]}>ACCOUNT</AppText>
                <AppText style={[styles.fieldValue, { color: account ? colors.text : colors.subtext }]}>
                  {account?.name || 'Select account'}
                </AppText>
              </View>
              <Icon name={IconChevronDown} size={16} color={colors.subtext} />
            </TouchableOpacity>

            {/* Category Picker */}
            <TouchableOpacity
              style={[styles.pickerField, { borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}
              onPress={() => setShowCategoryPicker(true)}
              activeOpacity={0.8}
            >
              <Icon name={IconTag} size={18} color={colors.subtext} />
              <View style={styles.pickerCopy}>
                <AppText style={[styles.fieldLabel, { color: colors.subtext }]}>CATEGORY</AppText>
                <AppText style={[styles.fieldValue, { color: category ? colors.text : colors.subtext }]}>
                  {category?.name || 'Select category'}
                </AppText>
              </View>
              <Icon name={IconChevronDown} size={16} color={colors.subtext} />
            </TouchableOpacity>

            {/* Date */}
            <TouchableOpacity
              style={[styles.pickerField, { borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.8}
            >
              <Icon name={IconCalendar} size={18} color={colors.subtext} />
              <View style={styles.pickerCopy}>
                <AppText style={[styles.fieldLabel, { color: colors.subtext }]}>DATE</AppText>
                <AppText style={[styles.fieldValue, { color: colors.text }]}>{date.toDateString()}</AppText>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Fixed footer */}
        <View style={[styles.footer, { backgroundColor: colors.background }]}>
          <AuthButton title={transaction ? 'Update Transaction' : 'Save Transaction'} onPress={saveTransaction} loading={loading} />
        </View>
      </View>

      {/* Modals */}
      <Modal visible={showAccountPicker} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowAccountPicker(false)} activeOpacity={1}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <AppText bold style={[styles.modalTitle, { color: colors.text }]}>Select Account</AppText>
            <FlatList
              data={accounts}
              keyExtractor={(item: any) => item.id.toString()}
              renderItem={({ item }: any) => (
                <TouchableOpacity
                  style={[styles.modalItem, { borderBottomColor: colors.border }]}
                  onPress={() => { setAccount(item); setShowAccountPicker(false); }}
                >
                  <AppText style={[styles.modalItemText, { color: colors.text }]}>{item.name}</AppText>
                  <AppText style={[styles.modalItemMeta, { color: colors.subtext }]}>
                    ${parseFloat(item.initial_balance || 0).toFixed(2)}
                  </AppText>
                </TouchableOpacity>
              )}
            />
            {accounts.length === 0 && (
              <AppText style={[styles.modalEmpty, { color: colors.subtext }]}>No accounts yet. Create one in settings.</AppText>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showCategoryPicker} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowCategoryPicker(false)} activeOpacity={1}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <AppText bold style={[styles.modalTitle, { color: colors.text }]}>Select Category</AppText>
            <FlatList
              data={filteredCategories}
              keyExtractor={(item: any) => item.id.toString()}
              renderItem={({ item }: any) => (
                <TouchableOpacity
                  style={[styles.modalItem, { borderBottomColor: colors.border }]}
                  onPress={() => { setCategory(item); setShowCategoryPicker(false); }}
                >
                  <AppText style={[styles.modalItemText, { color: colors.text }]}>{item.name}</AppText>
                </TouchableOpacity>
              )}
            />
            {filteredCategories.length === 0 && (
              <AppText style={[styles.modalEmpty, { color: colors.subtext }]}>No categories yet. Create one in settings.</AppText>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      <AppDatePicker visible={showDatePicker} onClose={() => setShowDatePicker(false)} value={date} onChange={setDate} mode="date" label="Date" />
      <DeleteConfirm visible={showDeleteConfirm} onCancel={() => setShowDeleteConfirm(false)} onConfirm={handleDelete} />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerBtn: { padding: 8 },
  container: { paddingVertical: 20, gap: 16, paddingHorizontal: 0 },
  footer: { paddingBottom: 20, paddingTop: 10, paddingHorizontal: 20 },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  typeIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeLabel: {
    fontSize: 15,
  },
  amountCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 16,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  adjustBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  amountDisplay: {
    flex: 1,
    minHeight: 84,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currency: {
    position: 'absolute',
    left: 20,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  amountInput: {
    width: '100%',
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 38,
    paddingVertical: 12,
    paddingHorizontal: 14,
    textAlign: 'center',
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  pickerField: {
    minHeight: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pickerCopy: {
    flex: 1,
    gap: 2,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  fieldValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '60%' },
  modalTitle: { fontSize: 16, marginBottom: 16 },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modalItemText: { fontSize: 16, fontWeight: '500' },
  modalItemMeta: { fontSize: 14 },
  modalEmpty: { textAlign: 'center', paddingVertical: 24, fontSize: 14 },
});
