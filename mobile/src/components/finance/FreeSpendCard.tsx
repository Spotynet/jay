import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../ui/AppText';
import { Icon } from '../ui/Icon';
import { IconWallet } from 'tabler-icons-react-native';

const FREE_SPEND_KEY = '@jay_free_spend_amount';

const formatMoney = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

const formatCompact = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);

interface FreeSpendCardProps {
  spent: number;
  onAmountChange?: (amount: number) => void;
}

export default function FreeSpendCard({ spent, onAmountChange }: FreeSpendCardProps) {
  const { colors, isDark } = useTheme();
  const [budget, setBudget] = useState(0);
  const [showEditor, setShowEditor] = useState(false);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    loadBudget();
  }, []);

  const loadBudget = async () => {
    try {
      const stored = await AsyncStorage.getItem(FREE_SPEND_KEY);
      if (stored != null) {
        const parsed = parseFloat(stored);
        if (!isNaN(parsed)) setBudget(parsed);
      }
    } catch {}
  };

  const saveBudget = async () => {
    const parsed = parseFloat(editValue) || 0;
    const rounded = parseFloat(parsed.toFixed(2));
    setBudget(rounded);
    try {
      await AsyncStorage.setItem(FREE_SPEND_KEY, String(rounded));
    } catch {}
    onAmountChange?.(rounded);
    setShowEditor(false);
  };

  const pct = budget > 0 ? Math.max(0, Math.min(spent / budget, 1)) : 0;
  const over = budget > 0 && spent > budget;

  const gradient = (
    isDark
      ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0)']
      : ['rgba(0,0,0,0.04)', 'rgba(0,0,0,0)']
  ) as [string, string];

  return (
    <>
      <TouchableOpacity
        style={[styles.card, { borderColor: colors.border }]}
        onPress={() => { setEditValue(budget > 0 ? budget.toFixed(2) : ''); setShowEditor(true); }}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <View style={styles.header}>
          <View style={[styles.iconWrap, { backgroundColor: `${colors.accent}1A` }]}>
            <Icon name={IconWallet} size={18} color={colors.accent} />
          </View>
          <View style={styles.headerText}>
            <AppText bold style={[styles.title, { color: colors.text }]}>Free Spend</AppText>
            <AppText style={[styles.subtitle, { color: colors.subtext }]}>
              {budget > 0 ? `${formatCompact(spent)} / ${formatCompact(budget)}` : 'Tap to set amount'}
            </AppText>
          </View>
          {budget > 0 && (
            <View style={styles.amountWrap}>
              <AppText style={[styles.amount, { color: over ? colors.error : colors.accent }]}>
                {formatCompact(budget - spent)}
              </AppText>
              <AppText style={[styles.amountLabel, { color: colors.subtext }]}>
                {over ? 'over' : 'left'}
              </AppText>
            </View>
          )}
        </View>

        {budget > 0 && (
          <View style={styles.progressSection}>
            <View style={[styles.progressTrack, { backgroundColor: colors.surfaceElevated }]}>
              <LinearGradient
                colors={over ? [colors.error, colors.error + 'CC'] : [colors.accent, colors.accent + '99']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${pct * 100}%` }]}
              />
            </View>
            <View style={styles.progressHeader}>
              <AppText style={[styles.progressPct, { color: over ? colors.error : colors.subtext }]}>
                {Math.round(pct * 100)}%
              </AppText>
            </View>
          </View>
        )}
      </TouchableOpacity>

      <Modal visible={showEditor} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowEditor(false)}
          activeOpacity={1}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <AppText bold style={[styles.modalTitle, { color: colors.text }]}>Free Spend Amount</AppText>
            <AppText style={[styles.modalHint, { color: colors.subtext }]}>
              Set a monthly limit for unplanned expenses
            </AppText>
            <View style={[styles.modalInputWrap, { borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}>
              <AppText style={[styles.modalPrefix, { color: colors.accent }]}>$</AppText>
              <TextInput
                style={[styles.modalInput, { color: colors.text }]}
                value={editValue}
                onChangeText={(t) => setEditValue(t.replace(/[^0-9.]/g, ''))}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.subtext}
                autoFocus
              />
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { borderColor: colors.border }]}
                onPress={() => setShowEditor(false)}
                activeOpacity={0.7}
              >
                <AppText style={[styles.modalBtnText, { color: colors.text }]}>Cancel</AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.accent, borderColor: colors.accent }]}
                onPress={saveBudget}
                activeOpacity={0.7}
              >
                <AppText bold style={[styles.modalBtnText, { color: '#fff' }]}>Save</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  amountWrap: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 14,
    fontWeight: '700',
  },
  amountLabel: {
    fontSize: 10,
    marginTop: 1,
  },
  progressSection: {
    marginTop: 12,
  },
  progressHeader: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  progressPct: {
    fontSize: 10,
    fontWeight: '700',
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
  },
  modalTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  modalHint: {
    fontSize: 12,
    marginBottom: 20,
  },
  modalInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
  },
  modalPrefix: {
    fontSize: 16,
    fontWeight: '800',
    marginRight: 8,
  },
  modalInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  modalBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
