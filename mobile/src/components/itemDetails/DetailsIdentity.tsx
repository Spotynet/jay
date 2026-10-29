import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { IconCheck } from 'tabler-icons-react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../ui/AppText';
import { Icon } from '../ui/Icon';

type CompletionControl = {
  completed: boolean;
  completing?: boolean;
  onToggle: () => void;
  /** Describes habit + selected date for VoiceOver. */
  accessibilityLabel: string;
};

type DetailsIdentityProps = {
  title: string;
  iconComponent: any;
  accent: string;
  /** Quiet supporting line under the title (optional). */
  supportingText?: string | null;
  /**
   * Binary completion checkbox at the trailing edge.
   * Omit for measurable habits and non-habit types.
   */
  completion?: CompletionControl | null;
};

/**
 * Compact identity: [icon] title [optional checkbox].
 * Type is expected in the navigation header — do not repeat it here.
 */
export function DetailsIdentity({
  title,
  iconComponent,
  accent,
  supportingText,
  completion,
}: DetailsIdentityProps) {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.surface,
            borderColor: colors.border,
          },
        ]}
        accessible={false}
        importantForAccessibility="no"
      >
        <Icon name={iconComponent} size={22} color={accent} stroke={1.7} />
      </View>

      <View style={styles.textCol}>
        <AppText style={[styles.title, { color: colors.text }]} accessibilityRole="header">
          {title}
        </AppText>
        {supportingText ? (
          <AppText style={[styles.support, { color: colors.subtext }]}>{supportingText}</AppText>
        ) : null}
      </View>

      {completion ? (
        <Pressable
          onPress={completion.onToggle}
          disabled={!!completion.completing}
          style={({ pressed }) => [
            styles.checkHit,
            pressed && { opacity: 0.7 },
            completion.completing && { opacity: 0.45 },
          ]}
          accessibilityRole="checkbox"
          accessibilityState={{
            checked: completion.completed,
            busy: !!completion.completing,
            disabled: !!completion.completing,
          }}
          accessibilityLabel={completion.accessibilityLabel}
        >
          <View
            style={[
              styles.checkbox,
              {
                borderColor: completion.completed ? accent : colors.border,
                backgroundColor: completion.completed ? accent : 'transparent',
              },
            ]}
          >
            {completion.completed ? (
              <Icon name={IconCheck} size={14} color="#FFFFFF" stroke={2.6} />
            ) : null}
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textCol: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  support: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  checkHit: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    // Nudge to align with ScreenLayout content right margin without absolute layout.
    marginRight: -6,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
