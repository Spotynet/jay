import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../ui/AppText';
import { Icon } from '../ui/Icon';
import { IconWallet, IconPencil, IconTrash } from 'tabler-icons-react-native';

interface AccountCardProps {
  name: string;
  balance: number;
  onEdit?: () => void;
  onDelete?: () => void;
}

const formatMoney = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);

export function AccountCard({ name, balance, onEdit, onDelete }: AccountCardProps) {
  const { colors, entityColors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.left}>
        <View style={[styles.iconWrap, { backgroundColor: `${entityColors.finance}14` }]}>
          <Icon name={IconWallet} size={20} color={entityColors.finance} />
        </View>
        <View>
          <AppText bold style={[styles.name, { color: colors.text }]}>{name}</AppText>
          <AppText style={[styles.balance, { color: colors.subtext }]}>
            {formatMoney(balance)}
          </AppText>
        </View>
      </View>
      <View style={styles.actions}>
        {onEdit && (
          <TouchableOpacity onPress={onEdit} style={[styles.actionBtn, { backgroundColor: colors.surfaceElevated }]} activeOpacity={0.6}>
            <Icon name={IconPencil} size={16} color={colors.text} />
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity onPress={onDelete} style={[styles.actionBtn, { backgroundColor: 'rgba(255,59,48,0.12)' }]} activeOpacity={0.6}>
            <Icon name={IconTrash} size={16} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 15,
  },
  balance: {
    fontSize: 13,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
