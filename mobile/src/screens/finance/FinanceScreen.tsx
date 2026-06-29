import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import ScreenLayout from '../../components/common/ScreenLayout';
import { getTransactions, getAccounts } from '../../api/finance';
import Card from '../../components/common/Card';

export default function FinanceScreen() {
  const { colors } = useTheme();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const isFocused = useIsFocused();
  const navigation = useNavigation<any>();

  const fetchData = async () => {
    const [tData, aData] = await Promise.all([getTransactions(), getAccounts()]);
    setTransactions(tData);
    setAccounts(aData);
  };

  useEffect(() => {
    if (isFocused) fetchData();
  }, [isFocused]);

  const totalBalance = accounts.reduce((acc, curr) => acc + parseFloat(curr.initial_balance), 0);

  return (
    <ScreenLayout 
      title="Finance" 
      rightOption={{ icon: 'add', onPress: () => navigation.navigate('TransactionEntry') }}
    >
      <Card style={styles.balanceCard}>
        <Text style={[styles.balanceLabel, { color: colors.subtext }]}>Total Balance</Text>
        <Text style={[styles.balanceValue, { color: colors.text }]}>${totalBalance.toFixed(2)}</Text>
      </Card>

      <Text style={[styles.sectionTitle, { color: colors.subtext }]}>Recent Transactions</Text>
      
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card style={styles.transactionCard}>
            <View style={styles.row}>
              <View>
                <Text style={[styles.title, { color: colors.text }]}>{item.description || item.category}</Text>
                <Text style={{ color: colors.subtext }}>{item.date}</Text>
              </View>
              <Text style={{ color: item.type === 'EARNING' ? '#34C759' : '#FF3B30', fontWeight: 'bold' }}>
                {item.type === 'EARNING' ? '+' : '-'}${item.amount}
              </Text>
            </View>
          </Card>
        )}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  balanceCard: { marginBottom: 20, alignItems: 'center', padding: 25 },
  balanceLabel: { fontSize: 14, marginBottom: 5 },
  balanceValue: { fontSize: 32, fontWeight: 'bold' },
  sectionTitle: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', marginBottom: 10, marginLeft: 4 },
  transactionCard: { marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: 'bold' },
});
