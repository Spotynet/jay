import React, { useState } from 'react';
import { View, StyleSheet, TextInput, ScrollView, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import ScreenLayout from '../../components/common/ScreenLayout';
import { AuthButton } from '../auth/components/AuthButton';
import { useNavigation, useRoute } from '@react-navigation/native';
import AppDatePicker from '../../components/common/AppDatePicker';
import { AppText } from '../../components/ui/AppText';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { createFinanceEntry, updateFinanceEntry } from '../../api/finance';
import { IconCalendar, IconMinus, IconPlus, IconTrendingDown, IconTrendingUp } from 'tabler-icons-react-native';

const ENTRY_TYPES = [
  {
    value: 'INCOME',
    title: 'Income',
    subtitle: 'Money coming in',
    icon: IconTrendingUp,
  },
  {
    value: 'EXPENSE',
    title: 'Expense',
    subtitle: 'Money going out',
    icon: IconTrendingDown,
  },
];

const PRESET_AMOUNTS = [5, 10, 25, 50, 100, 250];

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

export default function FinanceEntryScreen() {
  const { colors, entityColors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const entry = route.params?.entry;

  const [name, setName] = useState(entry?.name || '');
  const [type, setType] = useState(entry?.type || 'EXPENSE');
  const [value, setValue] = useState(entry?.value != null ? Number(entry.value).toFixed(2) : '0.00');
  const [date, setDate] = useState(entry?.date ? new Date(entry.date) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const updateAmount = (nextAmount: number) => {
    setValue(toAmountString(Math.max(0, nextAmount)));
  };

  const saveEntry = async () => {
    const numericValue = normalizeAmount(value);

    if (!name || numericValue <= 0) {
      Alert.alert('Error', 'Please fill in name and choose a value');
      return;
    }

    setLoading(true);
    try {
      const data = { name, type, value: numericValue.toFixed(2), date: date.toISOString().split('T')[0] };
      if (entry) {
        await updateFinanceEntry(entry.id, data);
      } else {
        await createFinanceEntry(data);
      }
      Alert.alert('Success', 'Entry saved');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const selectedAmount = normalizeAmount(value);

  return (
    <ScreenLayout title={entry ? 'EDIT FINANCE ENTRY' : 'NEW FINANCE ENTRY'} showBack={true}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <AppText style={[styles.sectionLabel, { color: colors.subtext }]}>DETAILS</AppText>
          <TextInput 
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}
            placeholder="Name"
            placeholderTextColor={colors.subtext}
            value={name}
            onChangeText={setName}
          />
          <TouchableOpacity 
            style={[styles.dateField, { borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.8}
          >
            <IconCalendar size={18} color={colors.subtext} />
            <View style={styles.dateCopy}>
              <AppText style={[styles.fieldLabel, { color: colors.subtext }]}>DATE</AppText>
              <AppText style={[styles.fieldValue, { color: colors.text }]}>{date.toDateString()}</AppText>
            </View>
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <AppText style={[styles.sectionLabel, { color: colors.subtext }]}>AMOUNT</AppText>
          <View style={[styles.amountCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}> 
            <View style={styles.amountHeader}>
              <View style={styles.amountHeaderCopy}>
                <AppText style={[styles.amountLabel, { color: colors.subtext }]}>VALUE</AppText>
              </View>
            </View>

            <View style={styles.amountRow}>
              <TouchableOpacity
                onPress={() => updateAmount(selectedAmount - 5)}
                activeOpacity={0.8}
                style={[styles.adjustButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
              >
                <IconMinus size={18} color={colors.text} />
              </TouchableOpacity>

              <View style={[styles.amountDisplay, { borderColor: colors.border, backgroundColor: colors.surface }]}> 
                <AppText style={[styles.amountCurrency, { color: entityColors.finance }]}>$</AppText>
                <TextInput
                  style={[styles.amountInput, { color: colors.text }]}
                  value={value}
                  onChangeText={(text) => setValue(sanitizeAmountInput(text))}
                  onBlur={() => setValue(toAmountString(normalizeAmount(value)))}
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
                style={[styles.adjustButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
              >
                <IconPlus size={18} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.presetWrap}>
              {PRESET_AMOUNTS.map((preset) => {
                const isSelected = selectedAmount === preset;
                return (
                  <TouchableOpacity
                    key={preset}
                    onPress={() => updateAmount(preset)}
                    activeOpacity={0.85}
                    style={[
                      styles.presetChip,
                      {
                        backgroundColor: isSelected ? 'rgba(26, 173, 70, 0.14)' : colors.surface,
                        borderColor: isSelected ? entityColors.finance : colors.border,
                      },
                    ]}
                  >
                    <AppText style={[styles.presetText, { color: isSelected ? entityColors.finance : colors.text }]}> 
                      {formatMoney(preset)}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <AppText style={[styles.sectionLabel, { color: colors.subtext }]}>TYPE</AppText>
          <View style={styles.typeContainer}>
            {ENTRY_TYPES.map((option) => {
              const isSelected = type === option.value;
              const IconComponent = option.icon;

              return (
                <TouchableOpacity
                  key={option.value}
                  activeOpacity={0.85}
                  onPress={() => setType(option.value)}
                  style={[
                    styles.typeOption,
                    {
                      backgroundColor: isSelected ? colors.background : colors.surfaceElevated,
                      borderColor: isSelected ? entityColors.finance : colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.typeIconWrap,
                      {
                        backgroundColor: isSelected ? 'rgba(26, 173, 70, 0.14)' : colors.surface,
                        borderColor: isSelected ? 'rgba(26, 173, 70, 0.18)' : colors.border,
                      },
                    ]}
                  >
                    <IconComponent size={18} color={isSelected ? entityColors.finance : colors.subtext} />
                  </View>
                  <AppText style={[styles.typeTitle, { color: colors.text }]} numberOfLines={1}>
                    {option.title}
                  </AppText>
                  <AppText style={[styles.typeSubtitle, { color: isSelected ? colors.text : colors.subtext }]} numberOfLines={1}>
                    {option.subtitle}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <AuthButton title="Save" onPress={saveEntry} loading={loading} />

        <AppDatePicker 
          visible={showDatePicker} 
          onClose={() => setShowDatePicker(false)} 
          value={date} 
          onChange={setDate} 
          mode="date" 
          label="Date" 
        />
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 20, gap: 16 },
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
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  dateField: {
    minHeight: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateCopy: {
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
  amountCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 16,
  },
  amountHeader: {
    gap: 12,
  },
  amountHeaderCopy: {
    flex: 1,
    gap: 4,
  },
  amountLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  adjustButton: {
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  amountCurrency: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  amountInput: {
    flex: 1,
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 38,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  presetWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetChip: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
  },
  presetText: {
    fontSize: 13,
    fontWeight: '700',
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  typeOption: {
    flex: 1,
    minHeight: 92,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  typeIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 8,
  },
  typeSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
});
