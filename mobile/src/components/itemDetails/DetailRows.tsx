import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../ui/AppText';
import { Icon } from '../ui/Icon';

interface DetailSectionProps {
  title: string;
  children: React.ReactNode;
}

export function DetailSection({ title, children }: DetailSectionProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.section}>
      <AppText style={[styles.sectionTitle, { color: colors.subtext }]}>{title}</AppText>
      <View style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {children}
      </View>
    </View>
  );
}

interface DetailRowProps {
  icon?: any;
  iconColor?: string;
  label?: string;
  value: string;
  isLast?: boolean;
}

export function DetailRow({ icon, iconColor, label, value, isLast }: DetailRowProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[styles.row, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}
      accessible
      accessibilityLabel={label ? `${label}, ${value}` : value}
    >
      {icon ? (
        <View style={[styles.iconWrap, { backgroundColor: colors.surfaceElevated }]}>
          <Icon name={icon} size={16} color={iconColor || colors.subtext} stroke={1.6} />
        </View>
      ) : null}
      <View style={styles.rowText}>
        {label ? (
          <AppText style={[styles.rowLabel, { color: colors.subtext }]}>{label}</AppText>
        ) : null}
        <AppText style={[styles.rowValue, { color: colors.text }]}>{value}</AppText>
      </View>
    </View>
  );
}

/** Compact label/value without decorative icon boxes — for dense Schedule groups. */
export function DetailMetaRow({
  label,
  value,
  isLast,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.metaRow,
        !isLast && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
      ]}
      accessible
      accessibilityLabel={`${label}, ${value}`}
    >
      <AppText style={[styles.metaLabel, { color: colors.subtext }]}>{label}</AppText>
      <AppText style={[styles.metaValue, { color: colors.text }]}>{value}</AppText>
    </View>
  );
}

interface DetailPlainProps {
  children: React.ReactNode;
}

export function DetailPlain({ children }: DetailPlainProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.section}>
      <View style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.border, padding: 16 }]}>
        {typeof children === 'string' ? (
          <AppText style={[styles.rowValue, { color: colors.text }]}>{children}</AppText>
        ) : (
          children
        )}
      </View>
    </View>
  );
}

interface ReadOnlyDaysProps {
  selected: number[];
  accentColor: string;
  accessibilitySummary: string;
}

export function ReadOnlyDays({ selected, accentColor, accessibilitySummary }: ReadOnlyDaysProps) {
  const { colors } = useTheme();
  const labels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  return (
    <View
      style={styles.daysRow}
      accessible
      accessibilityRole="text"
      accessibilityLabel={accessibilitySummary}
    >
      {labels.map((label, idx) => {
        const on = selected.includes(idx);
        return (
          <View
            key={label}
            style={[
              styles.dayChip,
              {
                backgroundColor: on ? accentColor + '22' : 'transparent',
                borderColor: on ? accentColor : colors.border,
              },
            ]}
            importantForAccessibility="no"
          >
            <AppText
              style={{
                fontSize: 12,
                fontWeight: on ? '600' : '400',
                color: on ? colors.text : colors.subtext,
              }}
            >
              {label}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 22 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
    marginBottom: 8,
    marginLeft: 2,
  },
  group: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 52,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, gap: 2 },
  rowLabel: { fontSize: 12 },
  rowValue: { fontSize: 15, fontWeight: '500' },
  metaRow: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 48,
    justifyContent: 'center',
    gap: 2,
  },
  metaLabel: { fontSize: 12, fontWeight: '500' },
  metaValue: { fontSize: 15, fontWeight: '500' },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  dayChip: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
