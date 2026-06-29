import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import ScreenLayout from '../../components/common/ScreenLayout';
import Card from '../../components/common/Card';
import { getAccounts, getCategories } from '../../api/finance';

export default function FinanceSettingsScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [data, setData] = useState({ accounts: [], categories: [] });
  const isFocused = useIsFocused();

  const fetchData = async () => {
    const [accounts, categories] = await Promise.all([getAccounts(), getCategories()]);
    setData({ accounts, categories });
  };

  useEffect(() => {
    if (isFocused) fetchData();
  }, [isFocused]);

  const Section = ({ title, items, icon }: { title: string, items: any[], icon: string }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.subtext }]}>{title}</Text>
      {items.map((item) => (
        <Card key={item.id} style={styles.item}>
          <View style={styles.itemContent}>
            <Ionicons name={icon as any} size={20} color={colors.accent} />
            <Text style={[styles.itemText, { color: colors.text }]}>{item.name}</Text>
          </View>
        </Card>
      ))}
      <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.card, borderColor: colors.accent }]}>
        <Ionicons name="add" size={20} color={colors.accent} />
        <Text style={{ color: colors.accent, marginLeft: 8 }}>Add {title.slice(0, -1)}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenLayout title="Finance Settings" showBack={true}>
      <Section title="Accounts" items={data.accounts} icon="wallet-outline" />
      <Section title="Categories" items={data.categories} icon="pricetag-outline" />
      <Section title="Budgets" items={[]} icon="pie-chart-outline" />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', marginBottom: 12, marginLeft: 4 },
  item: { marginBottom: 8, padding: 16 },
  itemContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  itemText: { fontSize: 16 },
  addButton: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, marginTop: 8, justifyContent: 'center', borderStyle: 'dashed' },
});
