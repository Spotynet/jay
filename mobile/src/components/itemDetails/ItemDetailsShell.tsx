import React from 'react';
import { StyleSheet, ScrollView, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../ui/AppText';

type ItemDetailsShellProps = {
  loading?: boolean;
  loadError?: string | null;
  /** Identity + primary-action region (type-specific; built by the screen). */
  lead?: React.ReactNode;
  children?: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

/**
 * Shared reading chrome for timeline item details.
 * Type-specific identity / actions / sections are composed by the screen
 * and typeBodies — this shell only handles scroll, loading, and errors.
 */
export function ItemDetailsShell({
  loading,
  loadError,
  lead,
  children,
  contentContainerStyle,
}: ItemDetailsShellProps) {
  const { colors } = useTheme();

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {loading ? (
        <AppText style={{ color: colors.subtext, marginTop: 8 }}>Loading…</AppText>
      ) : null}
      {loadError ? (
        <AppText style={{ color: colors.error, marginTop: 8 }}>{loadError}</AppText>
      ) : null}

      {!loading && !loadError ? (
        <>
          {lead}
          {children}
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 32,
  },
});
