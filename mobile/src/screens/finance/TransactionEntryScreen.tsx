import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import FormScreen from '../../components/common/FormScreen';
import Box from '../../components/ui/Box';
import Label from '../../components/ui/Label';
import Input from '../../components/ui/Input';
import AmountInput from '../../components/ui/AmountInput';
import SelectPicker from '../../components/ui/SelectPicker';
import AppDatePicker from '../../components/common/AppDatePicker';
import { AppText } from '../../components/ui/AppText';
import { Icon } from '../../components/ui/Icon';
import { createTransaction, updateTransaction, deleteTransaction, getCategories } from '../../api/finance';
import { toLocalDateString, parseLocalDate } from '../../utils/date';
import { IconTrendingDown, IconTrendingUp, IconCalendar, IconTrash, IconCash } from 'tabler-icons-react-native';
import DeleteConfirm from '../../components/ui/DeleteConfirm';

const normalizeAmount = (value: string) => {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

export default function TransactionEntryScreen() {
  const { colors, entityColors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const transaction = route.params?.transaction;

  const [amount, setAmount] = useState(transaction?.amount != null ? Number(transaction.amount).toFixed(2) : '0.00');
  const [type, setType] = useState<'EXPENSE' | 'EARNING'>(transaction?.type || 'EXPENSE');
  const [category, setCategory] = useState<any>(transaction?.category || null);
  const [date, setDate] = useState(transaction?.date ? parseLocalDate(transaction.date) : new Date());
  const [description, setDescription] = useState(transaction?.description || '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFreeExpense, setIsFreeExpense] = useState(
    transaction?.type === 'EXPENSE' && !transaction?.category
  );

  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const c = await getCategories();
      const list = Array.isArray(c) ? c : [];
      setCategories(list);
      const flat = list.flatMap((x: any) => {
        const children = Array.isArray(x.children) ? x.children : [];
        if (children.length === 0) return [x];
        return children;
      });
      if (transaction?.category && !category) {
        const match = flat.find((x: any) => x.id === (transaction.subcategory || transaction.category));
        if (match) setCategory(match);
      }
    };
    fetchData();
  }, []);

  const filteredCategories = categories.filter((c: any) => {
    if (type === 'EXPENSE') return c.type === 'EXPENSE';
    return c.type === 'EARNING';
  });

  const pickerItems = filteredCategories.flatMap((c: any) => {
    if (c.is_active === false) return [];
    const children = Array.isArray(c.children) ? c.children.filter((ch: any) => ch.is_active !== false) : [];
    if (children.length === 0) return [c];
    return children;
  });

  const saveTransaction = async () => {
    const numericValue = normalizeAmount(amount);
    if (numericValue <= 0) {
      Alert.alert('Error', 'Please enter an amount');
      return;
    }
    if (type === 'EXPENSE' && !isFreeExpense && !category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    setLoading(true);
    try {
      const data = {
        amount: numericValue,
        type,
        category: isFreeExpense ? null : (category?.parent || category?.id || null),
        subcategory: isFreeExpense ? null : (category?.parent ? category.id : null),
        date: toLocalDateString(date),
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

  return (
    <FormScreen
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
      submitTitle={transaction ? 'Update Transaction' : 'Save Transaction'}
      onSubmit={saveTransaction}
      loading={loading}
      scrollContentStyle={styles.container}
    >
      <Label>TYPE</Label>
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

      <Label>AMOUNT</Label>
      <AmountInput value={amount} onChangeValue={setAmount} />

      <Label>DESCRIPTION</Label>
      <Input
        placeholder="What was this for?"
        value={description}
        onChangeText={setDescription}
      />

      {type === 'EXPENSE' && (
        <>
          <Label>FREE EXPENSE</Label>
          <TouchableOpacity
            onPress={() => {
              const next = !isFreeExpense;
              setIsFreeExpense(next);
              if (next) setCategory(null);
            }}
            activeOpacity={0.8}
            style={[
              styles.freeExpenseRow,
              {
                backgroundColor: isFreeExpense ? `${entityColors.finance}12` : colors.surfaceElevated,
                borderColor: isFreeExpense ? entityColors.finance : colors.border,
              },
            ]}
          >
            <View style={[styles.freeExpenseCheck, { backgroundColor: isFreeExpense ? entityColors.finance : colors.surface, borderColor: isFreeExpense ? entityColors.finance : colors.border }]}>
              {isFreeExpense && <AppText bold style={{ color: '#FFF', fontSize: 12 }}>✓</AppText>}
            </View>
            <View style={{ flex: 1 }}>
              <AppText style={{ color: colors.text, fontSize: 14 }}>Free expense</AppText>
              <AppText style={{ color: colors.subtext, fontSize: 11 }}>Not assigned to any budget category</AppText>
            </View>
            <Icon name={IconCash} size={18} color={isFreeExpense ? entityColors.finance : colors.subtext} />
          </TouchableOpacity>
        </>
      )}

      <Label>CATEGORY</Label>
      <SelectPicker
        value={category ? { id: category.id, label: category.name } : null}
        options={pickerItems.map((c: any) => ({
          id: c.id,
          label: c.name,
        }))}
        onSelect={(opt) => {
          const match = pickerItems.find((c: any) => c.id === opt.id);
          if (match) setCategory(match);
        }}
        placeholder={isFreeExpense ? 'Not needed for free expense' : 'Select category'}
        isOpen={showCategoryPicker}
        onToggle={() => !isFreeExpense && setShowCategoryPicker(!showCategoryPicker)}
      />

      <Label>DATE</Label>
      <Box>
        <TouchableOpacity
          style={styles.pickerField}
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.8}
        >
          <View style={styles.pickerCopy}>
            <AppText style={[styles.fieldValue, { color: colors.text }]}>{date.toDateString()}</AppText>
          </View>
          <Icon name={IconCalendar} size={16} color={colors.subtext} />
        </TouchableOpacity>
      </Box>

      <AppDatePicker visible={showDatePicker} onClose={() => setShowDatePicker(false)} value={date} onChange={setDate} mode="date" label="Date" />
      <DeleteConfirm visible={showDeleteConfirm} onCancel={() => setShowDeleteConfirm(false)} onConfirm={handleDelete} />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  headerBtn: { padding: 8 },
  container: { gap: 16, paddingVertical: 20, alignItems: 'center' },
  typeRow: { flexDirection: 'row', gap: 8, width: '100%' },
  typeOption: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 16, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1 },
  typeIconWrap: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  typeLabel: { fontSize: 15 },
  pickerField: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
  pickerCopy: { flex: 1 },
  fieldValue: { fontSize: 16, fontWeight: '500' },
  freeExpenseRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, borderWidth: 1 },
  freeExpenseCheck: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
});
