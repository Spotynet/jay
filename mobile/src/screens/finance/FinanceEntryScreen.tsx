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

export default function FinanceEntryScreen() {
  const { colors, entityColors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const entry = route.params?.entry;

  const [name, setName] = useState(entry?.name || '');
  const [type, setType] = useState(entry?.type || 'EXPENSE');
  const [value, setValue] = useState(entry?.value ? entry.value.toString() : '');
  const [date, setDate] = useState(entry?.date ? new Date(entry.date) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const saveEntry = async () => {
    if (!name || !value) {
        Alert.alert('Error', 'Please fill in name and value');
        return;
    }
    setLoading(true);
    try {
        const data = { name, type, value, date: date.toISOString().split('T')[0] };
        if (entry) {
            await updateFinanceEntry(entry.id, data);
        } else {
            await createFinanceEntry(data);
        }
        Alert.alert('Success', 'Entry saved');
        navigation.goBack();
    } catch(e) {
        Alert.alert('Error', 'Failed to save');
    } finally {
        setLoading(false);
    }
  };

  return (
    <ScreenLayout title={entry ? "Edit Finance" : "New Finance"} showBack={true}>
      <ScrollView contentContainerStyle={styles.container}>
        <TextInput 
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
            placeholder="Name"
            value={name}
            onChangeText={setName}
        />
        <TextInput 
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
            placeholder="Value"
            value={value}
            onChangeText={setValue}
            keyboardType="numeric"
        />
        <TouchableOpacity 
            style={[styles.input, { justifyContent: 'center', borderColor: colors.border, backgroundColor: colors.surface }]}
            onPress={() => setShowDatePicker(true)}
        >
            <AppText>{date.toDateString()}</AppText>
        </TouchableOpacity>
        
        <View style={[styles.typeContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {['INCOME', 'EXPENSE'].map((t) => {
            const isSelected = type === t;
            return (
              <TouchableOpacity
                key={t}
                activeOpacity={0.8}
                onPress={() => setType(t)}
                style={[
                  styles.typeBtn,
                  isSelected && {
                    backgroundColor: entityColors.finance,
                  },
                ]}
              >
                <AppText
                  style={[
                    styles.typeText,
                    { color: isSelected ? '#FFFFFF' : colors.subtext },
                    isSelected && { fontWeight: '700' },
                  ]}
                  numberOfLines={1}
                >
                  {t}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>

        <AuthButton title={loading ? "Saving..." : "Save"} onPress={saveEntry} />
        
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
  container: { padding: 20, gap: 16 },
  input: { height: 56, borderWidth: 1, borderRadius: 16, paddingHorizontal: 20, fontSize: 16, fontWeight: '500' },
  typeContainer: { flexDirection: 'row', borderRadius: 16, padding: 4, borderWidth: 1, height: 56, alignItems: 'center' },
  typeBtn: { flex: 1, height: '100%', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  typeText: { fontSize: 14, letterSpacing: 0.8, textTransform: 'uppercase' },
});
