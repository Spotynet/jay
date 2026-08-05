import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, ScrollView, Alert, TouchableOpacity, Modal, FlatList } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/common/ScreenLayout';
import { AppText } from '../../components/ui/AppText';
import { Icon } from '../../components/ui/Icon';
import { createBudget, updateBudget, deleteBudget, getCategories, getBudgets } from '../../api/finance';
import { AuthButton } from '../auth/components/AuthButton';
import { IconChartPie, IconTag, IconChevronDown, IconTrash, IconCalendar } from 'tabler-icons-react-native';
import DeleteConfirm from '../../components/ui/DeleteConfirm';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const sanitizeAmountInput = (value: string) => {
  const cleaned = value.replace(/[^0-9.]/g, '');
  const [whole, ...rest] = cleaned.split('.');
  if (rest.length === 0) return whole;
  return `${whole}.${rest.join('').slice(0, 2)}`;
};

export default function BudgetEntryScreen() {
  const { colors, entityColors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const budget = route.params?.budget;

  const now = new Date();
  const [amount, setAmount] = useState(budget?.amount != null ? parseFloat(budget.amount).toFixed(2) : '0.00');
  const [category, setCategory] = useState<any>(null);
  const [month, setMonth] = useState(budget?.month || now.getMonth() + 1);
  const [year, setYear] = useState(budget?.year || now.getFullYear());
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);
  const [existingBudgets, setExistingBudgets] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [c, b] = await Promise.all([getCategories(), getBudgets()]);
      setCategories(Array.isArray(c) ? c : []);
      setExistingBudgets(Array.isArray(b) ? b : []);

      if (budget?.category) {
        const cat = (Array.isArray(c) ? c : []).find((cat: any) => cat.id === budget.category);
        if (cat) setCategory(cat);
      }
    };
    fetchData();
  }, []);

  const expenseCategories = categories.filter((c: any) => c.type === 'EXPENSE');

  const saveBudget = async () => {
    const numericAmount = parseFloat(amount) || 0;
    if (numericAmount <= 0 || !category) {
      Alert.alert('Error', 'Please select a category and enter an amount');
      return;
    }

    setLoading(true);
    try {
      const data = {
        category: category.id,
        amount: numericAmount,
        month,
        year,
      };

      if (budget) {
        await updateBudget(budget.id, data);
      } else {
        await createBudget(data);
      }
      Alert.alert('Success', 'Budget saved');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to save budget');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!budget) return;
    setLoading(true);
    try {
      await deleteBudget(budget.id);
      Alert.alert('Deleted', 'Budget removed');
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
      title={budget ? 'EDIT BUDGET' : 'NEW BUDGET'}
      showBack={true}
      rightOption={
        budget
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
          <AppText style={[styles.sectionLabel, { color: colors.subtext }]}>BUDGET DETAILS</AppText>

          <View style={[styles.iconSection, { backgroundColor: `${entityColors.finance}14` }]}>
            <Icon name={IconChartPie} size={32} color={entityColors.finance} />
          </View>

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
                {category?.name || 'Select expense category'}
              </AppText>
            </View>
            <Icon name={IconChevronDown} size={16} color={colors.subtext} />
          </TouchableOpacity>

          {/* Month Picker */}
          <TouchableOpacity
            style={[styles.pickerField, { borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}
            onPress={() => setShowMonthPicker(true)}
            activeOpacity={0.8}
          >
            <Icon name={IconCalendar} size={18} color={colors.subtext} />
            <View style={styles.pickerCopy}>
              <AppText style={[styles.fieldLabel, { color: colors.subtext }]}>MONTH</AppText>
              <AppText style={[styles.fieldValue, { color: colors.text }]}>
                {MONTHS[month - 1]} {year}
              </AppText>
            </View>
            <Icon name={IconChevronDown} size={16} color={colors.subtext} />
          </TouchableOpacity>

          {/* Amount */}
          <View>
            <AppText style={[styles.fieldLabel, { color: colors.subtext }]}>BUDGET AMOUNT</AppText>
            <View style={[styles.balanceInput, { borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}>
              <AppText style={[styles.balanceCurrency, { color: entityColors.finance }]}>$</AppText>
              <TextInput
                style={[styles.balanceField, { color: colors.text }]}
                value={amount}
                onChangeText={(text) => setAmount(sanitizeAmountInput(text))}
                onBlur={() => setAmount(sanitizeAmountInput(amount))}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.subtext}
              />
            </View>
          </View>
        </View>

        <AuthButton title={budget ? 'Update Budget' : 'Create Budget'} onPress={saveBudget} loading={loading} />

        {/* Category Picker Modal */}
        <Modal visible={showCategoryPicker} transparent animationType="slide">
          <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowCategoryPicker(false)} activeOpacity={1}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <AppText bold style={[styles.modalTitle, { color: colors.text }]}>Select Category</AppText>
              <FlatList
                data={expenseCategories}
                keyExtractor={(item: any) => item.id.toString()}
                renderItem={({ item }: any) => {
                  const hasBudget = existingBudgets.some((b) => b.category === item.id && b.id !== budget?.id);
                  return (
                    <TouchableOpacity
                      style={[styles.modalItem, { borderBottomColor: colors.border, opacity: hasBudget ? 0.5 : 1 }]}
                      onPress={() => {
                        if (hasBudget) {
                          Alert.alert('Budget exists', 'A budget already exists for this category');
                          return;
                        }
                        setCategory(item);
                        setShowCategoryPicker(false);
                      }}
                      disabled={hasBudget}
                    >
                      <AppText style={[styles.modalItemText, { color: colors.text }]}>{item.name}</AppText>
                      {hasBudget && <AppText style={{ color: colors.subtext, fontSize: 12 }}>Has budget</AppText>}
                    </TouchableOpacity>
                  );
                }}
              />
              {expenseCategories.length === 0 && (
                <AppText style={[styles.modalEmpty, { color: colors.subtext }]}>No expense categories yet.</AppText>
              )}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Month Picker Modal */}
        <Modal visible={showMonthPicker} transparent animationType="slide">
          <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowMonthPicker(false)} activeOpacity={1}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <AppText bold style={[styles.modalTitle, { color: colors.text }]}>Select Month</AppText>
              <View style={styles.yearRow}>
                <TouchableOpacity onPress={() => setYear(year - 1)}>
                  <AppText style={{ color: entityColors.finance, fontSize: 24 }}>−</AppText>
                </TouchableOpacity>
                <AppText bold style={{ color: colors.text, fontSize: 20 }}>{year}</AppText>
                <TouchableOpacity onPress={() => setYear(year + 1)}>
                  <AppText style={{ color: entityColors.finance, fontSize: 24 }}>+</AppText>
                </TouchableOpacity>
              </View>
              <FlatList
                data={MONTHS.map((m, i) => ({ name: m, num: i + 1 }))}
                numColumns={3}
                keyExtractor={(item) => item.num.toString()}
                renderItem={({ item }) => {
                  const isSelected = month === item.num;
                  return (
                    <TouchableOpacity
                      style={[
                        styles.monthCell,
                        {
                          backgroundColor: isSelected ? entityColors.finance : colors.surfaceElevated,
                          borderColor: isSelected ? entityColors.finance : colors.border,
                        },
                      ]}
                      onPress={() => { setMonth(item.num); setShowMonthPicker(false); }}
                    >
                      <AppText style={{ color: isSelected ? '#FFF' : colors.text, fontWeight: '600', fontSize: 13 }}>
                        {item.name.slice(0, 3)}
                      </AppText>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </TouchableOpacity>
        </Modal>

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
    marginBottom: 8,
  },
  fieldValue: {
    fontSize: 16,
    fontWeight: '600',
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
  modalEmpty: { textAlign: 'center', paddingVertical: 24, fontSize: 14 },
  yearRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
    marginBottom: 16,
  },
  monthCell: {
    flex: 1,
    margin: 4,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
});
