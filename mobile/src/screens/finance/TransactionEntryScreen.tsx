import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/common/Button';
import { useNavigation } from '@react-navigation/native';
import AppDatePicker from '../../components/common/AppDatePicker';
import { createTransaction } from '../../api/finance';
import ScreenLayout from '../../components/common/ScreenLayout';

export default function TransactionEntryScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'EXPENSE' | 'EARNING'>('EXPENSE');
  const [category, setCategory] = useState('General');
  const [date, setDate] = useState(new Date());
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const saveTransaction = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await createTransaction({
        amount: parseFloat(amount),
        type,
        category,
        date: date.toISOString().split('T')[0],
        description
      });
      Alert.alert('Success', 'Transaction saved!');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenLayout title="New Transaction" showBack={true}>
      <ScrollView>
        <Text style={[styles.label, { color: colors.subtext }]}>Amount</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          placeholder="0.00"
          keyboardType="numeric"
          placeholderTextColor={colors.subtext}
          value={amount}
          onChangeText={setAmount}
        />

        <Text style={[styles.label, { color: colors.subtext }]}>Type</Text>
        <View style={styles.row}>
          {(['EXPENSE', 'EARNING'] as const).map(t => (
            <TouchableOpacity key={t} onPress={() => setType(t)} style={[styles.pill, type === t && { backgroundColor: colors.accent }]}>
              <Text style={{ color: type === t ? 'white' : colors.text }}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { color: colors.subtext }]}>Category</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          placeholder="e.g. Food, Salary"
          placeholderTextColor={colors.subtext}
          value={category}
          onChangeText={setCategory}
        />

        <AppDatePicker label="Date" value={date} onChange={setDate} includeDate={true} includeTime={false} />

        <Button title={loading ? "Saving..." : "Save Transaction"} onPress={saveTransaction} style={{ marginTop: 20 }} disabled={loading} />
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 10 },
  input: { padding: 16, borderRadius: 12, borderWidth: 1 },
  row: { flexDirection: 'row', gap: 10, marginVertical: 10 },
  pill: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, borderWidth: 1, borderColor: '#ccc' },
});
