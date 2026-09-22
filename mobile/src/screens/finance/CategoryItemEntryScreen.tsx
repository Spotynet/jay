import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import FormScreen from '../../components/common/FormScreen';
import Label from '../../components/ui/Label';
import Input from '../../components/ui/Input';
import AmountInput from '../../components/ui/AmountInput';
import SelectPicker from '../../components/ui/SelectPicker';
import { Icon } from '../../components/ui/Icon';
import { createCategory, updateCategory, deleteCategory, getCategories } from '../../api/finance';
import { IconTrash, IconPlus, IconX, IconBell, IconArrowsSplit } from 'tabler-icons-react-native';
import DeleteConfirm from '../../components/ui/DeleteConfirm';
import { AppText } from '../../components/ui/AppText';
import Box from '../../components/ui/Box';
import IconCircle from '../../components/ui/IconCircle';
import ColorSwatchPicker, { DEFAULT_COLOR_PALETTE } from '../../components/ui/ColorSwatchPicker';
import { IconPickerModal } from '../habits/components/IconPickerModal';
import { FINANCE_ICONS } from '../../constants/financeIcons';

const resolveIcon = (name?: string) =>
  (name && FINANCE_ICONS.find((i) => i.name === name)?.icon) || null;

const formatMoney = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

export default function CategoryItemEntryScreen() {
  const { colors, entityColors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const item = route.params?.item;
  const preselectedParent = route.params?.parent;

  const [name, setName] = useState(item?.name || '');
  const [type, setType] = useState<'EXPENSE' | 'EARNING'>(item?.type || preselectedParent?.type || 'EXPENSE');
  const [budget, setBudget] = useState(
    item?.budget != null ? parseFloat(item.budget).toFixed(2) : '0.00'
  );
  const [parent, setParent] = useState<any>(preselectedParent || null);
  const [isActive, setIsActive] = useState(item?.is_active ?? true);
  const [iconName, setIconName] = useState(item?.icon || 'Wallet');
  const [color, setColor] = useState(item?.color || DEFAULT_COLOR_PALETTE[5]);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [isDebt, setIsDebt] = useState(item?.is_debt ?? false);
  const [debtMonths, setDebtMonths] = useState(String(item?.debt_months || 12));
  const [dueDates, setDueDates] = useState<any[]>(item?.due_dates || []);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [showSplitOptions, setShowSplitOptions] = useState(false);
  const [showParentPicker, setShowParentPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const c = await getCategories();
        const list = Array.isArray(c) ? c : [];
        setAllCategories(list);
        if (item?.parent) {
          const parentId = Number(item.parent);
          const flat = list.flatMap((x: any) => [x, ...(Array.isArray(x.children) ? x.children : [])]);
          const match = flat.find((x: any) => Number(x.id) === parentId);
          if (match) {
            setParent(match);
            setType(match.type);
          }
        }
      } catch (err) {
        console.error('Failed to fetch categories', err);
      }
    };
    fetchData();
  }, []);

  const parentId = parent?.id || (item?.parent != null ? item.parent : null);

  const parentOptions = allCategories
    .filter((c: any) => {
      if (c.id === item?.id) return false;
      if (c.parent != null) return false;
      return true;
    })
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const addDueDate = () => {
    const total = parseFloat(budget) || 0;
    const current = dueDates.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
    const remaining = Math.max(0, total - current);

    setDueDates(prev => [...prev, { 
      amount: (remaining > 0 ? remaining : total).toFixed(2), 
      frequency: 'MONTHLY', 
      day_of_month: 1, 
      day_of_week: 0,
      week_of_month: null,
      description: '' 
    }]);
  };

  const splitDueDates = () => {
    const total = parseFloat(budget) || 0;
    if (total <= 0) {
      Alert.alert('Budget Required', 'Please set a budget amount before splitting.');
      return;
    }
    setShowSplitOptions(!showSplitOptions);
  };

  const applySplit = (parts: number) => {
    const total = parseFloat(budget) || 0;
    const splitAmt = (total / parts).toFixed(2);
    const newDueDates = [];
    
    let days = [1, 15];
    if (parts === 3) days = [1, 10, 20];
    if (parts === 4) days = [1, 8, 15, 22];
    
    for (let i = 0; i < parts; i++) {
      newDueDates.push({
        amount: splitAmt,
        frequency: 'MONTHLY',
        day_of_month: days[i] || 1,
        day_of_week: 0,
        week_of_month: null,
        description: `Split ${i + 1}/${parts}`
      });
    }
    setDueDates(newDueDates);
    setShowSplitOptions(false);
  };

  const removeDueDate = (index: number) => {
    setDueDates(prev => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  };

  const updateDueDate = (index: number, updates: any) => {
    setDueDates(prev => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
  };

  const saveItem = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter an item name');
      return;
    }
    if (!parentId) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    setLoading(true);
    try {
      const data = {
        name: name.trim(),
        type,
        budget: parseFloat(budget).toFixed(2),
        parent: parentId,
        icon: iconName,
        color: color,
        is_active: isActive,
        is_debt: isDebt,
        debt_months: isDebt && parseInt(debtMonths) > 0 ? parseInt(debtMonths) : null,
        due_dates: dueDates.map(r => ({
          ...r,
          amount: dueDates.length === 1 ? parseFloat(budget).toFixed(2) : parseFloat(r.amount).toFixed(2),
          day_of_month: r.frequency === 'MONTHLY' ? (r.day_of_month === undefined ? 1 : r.day_of_month) : null,
          day_of_week: r.day_of_week !== null && r.day_of_week !== undefined ? parseInt(String(r.day_of_week)) : null,
          week_of_month: r.week_of_month !== null && r.week_of_month !== undefined ? parseInt(String(r.week_of_month)) : null,
        }))
      };
      if (item) {
        await updateCategory(item.id, data);
      } else {
        await createCategory(data);
      }
      Alert.alert('Success', 'Item saved');
      navigation.goBack();
    } catch (e: any) {
      const msg = e?.message || 'Failed to save item';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    setLoading(true);
    try {
      await deleteCategory(item.id);
      Alert.alert('Deleted', 'Item removed');
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
      title={item ? 'EDIT ITEM' : 'NEW ITEM'}
      showBack={true}
      rightOption={
        item
          ? {
              render: () => (
                <TouchableOpacity onPress={() => setShowDeleteConfirm(true)} style={styles.headerBtn}>
                  <Icon name={IconTrash} size={20} color={colors.error} />
                </TouchableOpacity>
              ),
            }
          : undefined
      }
      submitTitle={item ? 'Update Item' : 'Add Item'}
      onSubmit={saveItem}
      loading={loading}
      scrollContentStyle={styles.container}
    >
      <Label>CATEGORY</Label>
      <SelectPicker
        value={parent ? { id: parent.id, label: parent.name } : null}
        options={parentOptions.map((c: any) => ({
          id: c.id,
          label: c.name,
          tag: Array.isArray(c.children) && c.children.length > 0 ? 'GROUP' : undefined,
        }))}
        onSelect={(opt) => {
          const match = parentOptions.find((c: any) => c.id === opt.id);
          if (match) { setParent(match); setType(match.type); }
        }}
        placeholder="Select a category"
        isOpen={showParentPicker}
        onToggle={() => setShowParentPicker(!showParentPicker)}
      />

      <View style={styles.sectionHeader}>
        <Label style={{ marginBottom: 0 }}>STATUS</Label>
        <TouchableOpacity 
          onPress={() => setIsActive(!isActive)}
          style={[styles.statusToggle, { backgroundColor: isActive ? `${entityColors.finance}15` : `${colors.error}15` }]}
        >
          <AppText bold style={{ color: isActive ? entityColors.finance : colors.error, fontSize: 12 }}>
            {isActive ? 'ACTIVE' : 'DISABLED'}
          </AppText>
        </TouchableOpacity>
      </View>

      {type === 'EXPENSE' && (
        <View style={styles.sectionHeader}>
          <Label style={{ marginBottom: 0 }}>TRACK AS DEBT</Label>
          <TouchableOpacity 
            onPress={() => setIsDebt(!isDebt)}
            style={[styles.statusToggle, { backgroundColor: isDebt ? '#007AFF15' : `${colors.surfaceElevated}` }]}
          >
            <AppText bold style={{ color: isDebt ? '#007AFF' : colors.subtext, fontSize: 12 }}>
              {isDebt ? 'DEBT' : 'OFF'}
            </AppText>
          </TouchableOpacity>
        </View>
      )}

      <Label>NAME</Label>
      <View style={styles.nameRow}>
        <IconCircle
          icon={resolveIcon(iconName)}
          accentColor={color}
          onPress={() => setShowIconPicker(true)}
        />
        <Input
          style={{ flex: 1 }}
          placeholder="Item name"
          value={name}
          onChangeText={setName}
        />
      </View>

      <IconPickerModal
        visible={showIconPicker}
        onClose={() => setShowIconPicker(false)}
        onSelect={setIconName}
        icons={FINANCE_ICONS}
      />

      <Label>COLOR</Label>
      <Box>
        <ColorSwatchPicker value={color} onChange={setColor} />
      </Box>

      <Label>{isDebt ? 'MONTHLY PAYMENT' : 'MONTHLY BUDGET'}</Label>
      <AmountInput value={budget} onChangeValue={setBudget} />

      {isDebt && (
        <>
          <Label>DEBT DURATION (MONTHS)</Label>
          <Input
            placeholder="e.g. 12"
            value={debtMonths}
            onChangeText={(t) => setDebtMonths(t.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
          />
          {parseFloat(budget) > 0 && parseInt(debtMonths) > 0 && (
            <Box style={{ width: '100%', padding: 12 }}>
              <AppText style={{ color: colors.subtext, fontSize: 12 }}>
                Total debt: {formatMoney(parseFloat(budget) * parseInt(debtMonths))} ({formatMoney(parseFloat(budget))} × {debtMonths} months)
              </AppText>
            </Box>
          )}
        </>
      )}

      {/* Due Dates Section */}
      <View style={styles.dueDatesHeader}>
        <Label style={{ marginBottom: 0 }}>PAYMENT DUE DATES</Label>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={[styles.addButton, { backgroundColor: `${entityColors.finance}15` }]} onPress={splitDueDates}>
            <Icon name={IconArrowsSplit} size={14} color={entityColors.finance} />
            <AppText bold style={{ color: entityColors.finance, fontSize: 12, marginLeft: 4 }}>SPLIT</AppText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.addButton, { backgroundColor: `${entityColors.finance}15` }]} onPress={addDueDate}>
            <Icon name={IconPlus} size={14} color={entityColors.finance} />
            <AppText bold style={{ color: entityColors.finance, fontSize: 12, marginLeft: 4 }}>ADD DUE DATE</AppText>
          </TouchableOpacity>
        </View>
      </View>

      {showSplitOptions && (
        <Box style={styles.splitOptionsBox}>
          <AppText bold style={{ color: colors.text, fontSize: 13, marginBottom: 10 }}>How many ways to split?</AppText>
          <View style={styles.splitButtonsRow}>
            {[2, 3, 4].map(num => (
              <TouchableOpacity 
                key={num} 
                onPress={() => applySplit(num)}
                style={[styles.splitChoiceBtn, { backgroundColor: colors.surfaceElevated }]}
              >
                <AppText bold style={{ color: colors.text }}>{num}x</AppText>
              </TouchableOpacity>
            ))}
            <TouchableOpacity 
              onPress={() => setShowSplitOptions(false)}
              style={[styles.splitChoiceBtn, { backgroundColor: `${colors.error}15` }]}
            >
              <Icon name={IconX} size={16} color={colors.error} />
            </TouchableOpacity>
          </View>
        </Box>
      )}

      {dueDates.length === 0 ? (
        <Box style={styles.emptyDueDates}>
          <Icon name={IconBell} size={20} color={colors.subtext} />
          <AppText style={{ color: colors.subtext, fontSize: 13, marginTop: 8 }}>No due dates set for this item</AppText>
        </Box>
      ) : (
        <View style={{ width: '100%', gap: 16 }}>
          {dueDates.map((r, i) => {
            const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
            const ordinals = [
              { label: '1st', value: 1 },
              { label: '2nd', value: 2 },
              { label: '3rd', value: 3 },
              { label: '4th', value: 4 },
              { label: 'Last', value: -1 },
            ];

            return (
              <Box key={i} style={styles.dueDateCard}>
                <View style={styles.dueDateTop}>
                  {dueDates.length > 1 ? (
                    <View style={{ flex: 1 }}>
                      <AmountInput 
                        value={String(r.amount)} 
                        onChangeValue={(val) => updateDueDate(i, { amount: val })}
                        containerStyle={{ height: 44, backgroundColor: colors.surface }}
                      />
                    </View>
                  ) : (
                    <View style={{ flex: 1, paddingVertical: 10 }}>
                      <AppText bold style={{ color: colors.subtext, fontSize: 13 }}>
                        Paid in full (${parseFloat(budget).toFixed(2)})
                      </AppText>
                    </View>
                  )}
                  <TouchableOpacity onPress={() => removeDueDate(i)} style={styles.removeBtn}>
                    <Icon name={IconX} size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>

                <View style={styles.monthlyConfig}>
                  <View style={styles.configToggleRow}>
                     <TouchableOpacity 
                       onPress={() => updateDueDate(i, { day_of_month: 1, week_of_month: null })}
                       style={[styles.configOption, { backgroundColor: colors.surfaceElevated }, !r.week_of_month && r.day_of_month !== -1 && { backgroundColor: colors.border }]}
                     >
                       <AppText style={[styles.configOptionText, { color: colors.subtext }, !r.week_of_month && r.day_of_month !== -1 && { color: colors.text, fontWeight: '700' }]}>Date</AppText>
                     </TouchableOpacity>
                     <TouchableOpacity 
                       onPress={() => updateDueDate(i, { day_of_month: -1, week_of_month: null })}
                       style={[styles.configOption, { backgroundColor: colors.surfaceElevated }, r.day_of_month === -1 && { backgroundColor: colors.border }]}
                     >
                       <AppText style={[styles.configOptionText, { color: colors.subtext }, r.day_of_month === -1 && { color: colors.text, fontWeight: '700' }]}>Last Day</AppText>
                     </TouchableOpacity>
                     <TouchableOpacity 
                       onPress={() => updateDueDate(i, { week_of_month: 1, day_of_week: 0, day_of_month: null })}
                       style={[styles.configOption, { backgroundColor: colors.surfaceElevated }, !!r.week_of_month && { backgroundColor: colors.border }]}
                     >
                       <AppText style={[styles.configOptionText, { color: colors.subtext }, !!r.week_of_month && { color: colors.text, fontWeight: '700' }]}>Ordinal</AppText>
                     </TouchableOpacity>
                  </View>

                  {!r.week_of_month && r.day_of_month !== -1 && (
                    <View style={{ height: 40, width: '100%' }}>
                      <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false} 
                        style={styles.dateScroll}
                        contentContainerStyle={styles.dateScrollContent}
                      >
                        {Array.from({ length: 31 }, (_, idx) => idx + 1).map((d) => (
                          <TouchableOpacity
                            key={d}
                            onPress={() => updateDueDate(i, { day_of_month: d })}
                            style={[
                              styles.dateChip,
                              { backgroundColor: colors.surfaceElevated },
                              r.day_of_month === d && { backgroundColor: entityColors.finance }
                            ]}
                          >
                            <AppText style={[styles.dateText, { color: colors.text }, r.day_of_month === d && { color: '#FFF' }]}>{d}</AppText>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}

                  {!!r.week_of_month && (
                    <View style={{ gap: 10, marginTop: 4 }}>
                      <View style={styles.ordinalRow}>
                        {ordinals.map((o) => (
                          <TouchableOpacity
                            key={o.value}
                            onPress={() => updateDueDate(i, { week_of_month: o.value })}
                            style={[
                              styles.ordinalChip,
                              { backgroundColor: colors.surfaceElevated },
                              r.week_of_month === o.value && { backgroundColor: entityColors.finance }
                            ]}
                          >
                            <AppText style={[styles.ordinalText, { color: colors.text }, r.week_of_month === o.value && { color: '#FFF' }]}>{o.label}</AppText>
                          </TouchableOpacity>
                        ))}
                      </View>
                      <View style={styles.daySelector}>
                        {daysOfWeek.map((day, idx) => (
                          <TouchableOpacity
                            key={idx}
                            onPress={() => updateDueDate(i, { day_of_week: idx })}
                            style={[
                              styles.dayChip,
                              { borderColor: colors.border },
                              r.day_of_week === idx && { backgroundColor: entityColors.finance, borderColor: entityColors.finance }
                            ]}
                          >
                            <AppText style={[
                              styles.dayText,
                              { color: colors.subtext },
                              r.day_of_week === idx && { color: '#FFF', fontWeight: '700' }
                            ]}>{day}</AppText>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}
                </View>

                <Input
                  placeholder="Notes (e.g. Split due date)"
                  value={r.description}
                  onChangeText={(val) => updateDueDate(i, { description: val })}
                  style={{ height: 38, fontSize: 13, marginTop: 4, backgroundColor: colors.surface }}
                />
              </Box>
            );
          })}
        </View>
      )}

      <DeleteConfirm visible={showDeleteConfirm} onCancel={() => setShowDeleteConfirm(false)} onConfirm={handleDelete} />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  headerBtn: { padding: 8 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  container: { gap: 16, paddingVertical: 20, alignItems: 'center', paddingBottom: 60 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  dueDatesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  emptyDueDates: {
    width: '100%',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.2)',
  },
  dueDateCard: {
    gap: 8,
    padding: 12,
  },
  dueDateTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  removeBtn: {
    padding: 8,
    borderRadius: 20,
  },
  daySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 4,
  },
  dayChip: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 11,
  },
  monthlyConfig: {
    gap: 12,
    paddingVertical: 4,
  },
  configToggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  configOption: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  configOptionText: {
    fontSize: 11,
  },
  dateScroll: {
    width: '100%',
    height: 40,
  },
  dateScrollContent: {
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  dateChip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  dateText: {
    fontSize: 12,
  },
  ordinalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ordinalChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  ordinalText: {
    fontSize: 11,
  },
  splitOptionsBox: {
    padding: 16,
    marginBottom: 8,
    width: '100%',
  },
  splitButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  splitChoiceBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
