import React from 'react';
import { View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../ui/AppText';
import { Icon } from '../ui/Icon';
import { IconLock, IconCrown, IconX } from 'tabler-icons-react-native';

interface PremiumGateProps {
  children: React.ReactNode;
  isPremium: boolean;
}

export function PremiumGate({ children, isPremium }: PremiumGateProps) {
  if (isPremium) return <>{children}</>;
  return <PremiumOverlay />;
}

function PremiumOverlay() {
  const { colors, accentColor } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.iconWrap, { backgroundColor: `${entityColors.finance}14` }]}>
          <Icon name={IconLock} size={32} color={entityColors.finance} />
        </View>
        <AppText bold style={[styles.title, { color: colors.text }]}>
          PREMIUM FEATURE
        </AppText>
        <AppText style={[styles.description, { color: colors.subtext }]}>
          Financial tracking is a premium feature. Upgrade to access budgets, transactions, and full financial insights.
        </AppText>
        <TouchableOpacity style={[styles.upgradeButton, { backgroundColor: entityColors.finance }]}>
          <Icon name={IconCrown} size={18} color="#FFFFFF" />
          <AppText bold style={styles.upgradeText}>Upgrade to Premium</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const entityColors = { finance: '#1aad46' };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  card: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
    gap: 16,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    letterSpacing: 2,
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 16,
    marginTop: 8,
  },
  upgradeText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
});
