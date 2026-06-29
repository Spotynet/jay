import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import ScreenLayout from '../../components/common/ScreenLayout';
import { SystemManagementCell } from '../../components/manage/SystemManagementCell';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { IconPlus, IconWallet, IconTrendingUp, IconTrendingDown, IconChartPie } from 'tabler-icons-react-native';
import { ActionButton } from '../../components/common/ActionButton';
import { AppText } from '../../components/ui/AppText';
import { getFinanceEntries } from '../../api/finance';
export default function ManageFinanceScreen() {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { colors, entityColors } = useTheme();

  const [entries, setEntries] = useState<any[]>([]);

  const fetchFinanceEntries = async () => {
    try {
        const data = await getFinanceEntries();
        setEntries(data);
    } catch (e) {
        console.error('Failed to fetch finance entries', e);
    }
  };

  useEffect(() => {
    if (isFocused) {
        fetchFinanceEntries();
    }
  }, [isFocused]);

  const income = entries
    .filter(e => e.type === 'INCOME')
    .reduce((sum, e) => sum + parseFloat(e.value || e.amount || 0), 0);
    
  const expenses = entries
    .filter(e => e.type === 'EXPENSE')
    .reduce((sum, e) => sum + parseFloat(e.value || e.amount || 0), 0);

  const balance = income - expenses;

  return (
    <ScreenLayout 
        title="FINANCE" 
        showBack={true}
        rightOption={{ 
            icon: () => <ActionButton icon={IconPlus} onPress={() => {}} size={40} />,
            onPress: () => {} 
        }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
            <View style={styles.summaryItem}>
                <AppText style={{ color: colors.subtext }}>Balance</AppText>
                <AppText style={[styles.summaryValue, { color: balance >= 0 ? colors.text : colors.error }]}>${balance.toFixed(2)}</AppText>
            </View>
            <View style={styles.summaryItem}>
                <AppText style={{ color: colors.subtext }}>Income</AppText>
                <AppText style={[styles.summaryValue, { color: '#34C759' }]}>+${income.toFixed(2)}</AppText>
            </View>
            <View style={styles.summaryItem}>
                <AppText style={{ color: colors.subtext }}>Expenses</AppText>
                <AppText style={[styles.summaryValue, { color: '#FF3B30' }]}>-${expenses.toFixed(2)}</AppText>
            </View>
        </View>

        <AppText style={[styles.sectionTitle, { color: colors.subtext, marginTop: 30, marginBottom: 10 }]}>HISTORY</AppText>
        <View style={[styles.slab, { borderColor: colors.border }]}>
            {entries.length === 0 ? (
                <View style={styles.emptyState}>
                    <SystemManagementCell title="No History" icon={IconWallet} onPress={() => {}} isLast />
                </View>
            ) : (
                entries.map((entry, index) => (
                    <SystemManagementCell 
                        key={entry.id}
                        title={entry.type} 
                        icon={entry.type === 'INCOME' ? IconTrendingUp : IconTrendingDown} 
                        status={`$${entry.value || entry.amount || 0}`} 
                        meta={entry.date || 'No Date'}
                        onPress={() => navigation.navigate('FinanceEntry', { entry })} 
                        isLast={index === entries.length - 1} 
                    />
                ))
            )}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 20, paddingHorizontal: 20 },
  slab: { borderTopWidth: 1, borderBottomWidth: 1, overflow: 'hidden', position: 'relative' },
  emptyState: { padding: 20 },
  summaryCard: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderRadius: 16, marginTop: 10 },
  summaryItem: { alignItems: 'center' },
  summaryValue: { fontSize: 18, fontWeight: 'bold', marginTop: 4 },
  sectionTitle: { fontSize: 13, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase' },
});
