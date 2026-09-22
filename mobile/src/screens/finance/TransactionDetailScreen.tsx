import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AppText } from '../../components/ui/AppText';
import { Icon } from '../../components/ui/Icon';
import ScreenLayout from '../../components/common/ScreenLayout';
import { TouchableOpacity } from 'react-native';
import {
  IconTrendingUp,
  IconTrendingDown,
  IconCalendar,
  IconEdit,
  IconTag,
  IconFileText,
} from 'tabler-icons-react-native';

const formatMoney = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

const formatDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

const Divider = ({ color }: { color: string }) => (
  <View style={[styles.divider, { borderBottomColor: color }]} />
);

const DashedDivider = ({ color }: { color: string }) => (
  <View style={styles.dashedContainer}>
    {Array.from({ length: 30 }).map((_, i) => (
      <View key={i} style={[styles.dash, { backgroundColor: color }]} />
    ))}
  </View>
);

export default function TransactionDetailScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const transaction = route.params?.transaction;
  const categoryMapObj = route.params?.categoryMapObj || {};

  if (!transaction) return null;

  const isIncome = transaction.type === 'EARNING';
  // New schema: category = parent, subcategory = child; legacy: category = leaf child
  let categoryLabel: string | null = null;
  let subcategoryLabel: string | null = null;
  if (transaction.subcategory) {
    categoryLabel = categoryMapObj[transaction.category]?.name || null;
    subcategoryLabel = categoryMapObj[transaction.subcategory]?.name || null;
  } else if (transaction.category) {
    const catObj = categoryMapObj[transaction.category];
    if (catObj) {
      if (catObj.parent) {
        categoryLabel = categoryMapObj[catObj.parent]?.name || catObj.name;
        subcategoryLabel = catObj.name;
      } else {
        categoryLabel = catObj.name;
      }
    }
  }

  return (
    <ScreenLayout
      title="Details"
      showBack
      rightOption={{
        render: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate('TransactionEntry', { transaction })}
            style={styles.editBtn}
          >
            <Icon name={IconEdit} size={20} color={colors.text} />
          </TouchableOpacity>
        ),
      }}
      contentStyle={{ paddingHorizontal: 0 }}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Receipt Card */}
        <View style={[styles.receipt, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Type Badge */}
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: isIncome ? 'rgba(52,199,89,0.12)' : 'rgba(255,59,48,0.12)' }]}>
              <Icon name={isIncome ? IconTrendingUp : IconTrendingDown} size={14} color={isIncome ? '#34C759' : '#FF3B30'} />
              <AppText bold style={[styles.badgeText, { color: isIncome ? '#34C759' : '#FF3B30' }]}>
                {isIncome ? 'INCOME' : 'EXPENSE'}
              </AppText>
            </View>
          </View>

          {/* Amount */}
          <View style={styles.amountSection}>
            <AppText style={[styles.amountSign, { color: isIncome ? '#34C759' : '#FF3B30' }]}>
              {isIncome ? '+' : '-'}
            </AppText>
            <AppText bold style={[styles.amount, { color: colors.text }]}>
              {formatMoney(transaction.amount)}
            </AppText>
          </View>

          <DashedDivider color={colors.border} />

          {/* Details */}
          <View style={styles.details}>
            {/* Description */}
            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <Icon name={IconFileText} size={16} color={colors.subtext} />
                <AppText style={[styles.detailLabel, { color: colors.subtext }]}>Description</AppText>
              </View>
              <AppText style={[styles.detailValue, { color: colors.text }]}>
                {transaction.description || '—'}
              </AppText>
            </View>

            <Divider color={colors.border} />

            {/* Category */}
            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <Icon name={IconTag} size={16} color={colors.subtext} />
                <AppText style={[styles.detailLabel, { color: colors.subtext }]}>Category</AppText>
              </View>
              <AppText style={[styles.detailValue, { color: colors.text }]}>
                {categoryLabel || '—'}
              </AppText>
            </View>

            <Divider color={colors.border} />

            {/* Subcategory */}
            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <Icon name={IconTag} size={16} color={colors.subtext} />
                <AppText style={[styles.detailLabel, { color: colors.subtext }]}>Subcategory</AppText>
              </View>
              <AppText style={[styles.detailValue, { color: colors.text }]}>
                {subcategoryLabel || '—'}
              </AppText>
            </View>

            <Divider color={colors.border} />

            {/* Date */}
            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <Icon name={IconCalendar} size={16} color={colors.subtext} />
                <AppText style={[styles.detailLabel, { color: colors.subtext }]}>Date</AppText>
              </View>
              <AppText style={[styles.detailValue, { color: colors.text }]}>
                {formatDate(transaction.date)}
              </AppText>
            </View>
          </View>

          {/* Receipt Footer */}
          <View style={[styles.receiptFooter, { borderTopColor: colors.border }]}>
            <AppText style={[styles.footerText, { color: colors.subtext }]}>
              JAY Finance
            </AppText>
          </View>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    paddingBottom: 40,
  },
  editBtn: {
    padding: 8,
  },
  receipt: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  badgeRow: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    letterSpacing: 1,
  },
  amountSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  amountSign: {
    fontSize: 22,
    fontWeight: '600',
    marginRight: 4,
  },
  amount: {
    fontSize: 36,
    letterSpacing: -1,
  },
  dashedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  dash: {
    width: 6,
    height: 1,
    borderRadius: 0.5,
  },
  divider: {
    borderBottomWidth: 1,
    marginVertical: 12,
    marginHorizontal: 20,
  },
  details: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: 12,
  },
  detailId: {
    fontSize: 12,
    fontWeight: '500',
  },
  receiptFooter: {
    borderTopWidth: 1,
    borderTopStyle: 'dashed',
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
  },
});
