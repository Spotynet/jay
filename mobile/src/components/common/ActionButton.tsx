import React, { useState } from 'react';
import { Pressable, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Icon } from '../ui/Icon';
import { TablerIcon } from 'tabler-icons-react-native';

export type ActionButtonVariant = 'chrome' | 'plain';

interface ActionButtonProps {
  icon: TablerIcon;
  onPress?: () => void;
  /** Visual diameter of the control (default 40). Hit target is at least 44. */
  size?: number;
  /** Icon glyph size; defaults to a weight that matches native tab icons. */
  iconSize?: number;
  disabled?: boolean;
  accessibilityLabel?: string;
  /**
   * `chrome` — subtle filled chip for primary header actions (profile, +).
   * `plain` — quieter control for Back / Close / overflow (no competing fill).
   */
  variant?: ActionButtonVariant;
  style?: StyleProp<ViewStyle>;
}

/**
 * Shared header / toolbar icon control.
 * Intentionally custom (not Liquid Glass): JAY keeps a compact AppHeader rather
 * than a native UINavigationBar, and genuine glass header items need stack
 * `headerRightItems` / Expo UI packages we are not adding here.
 */
export const ActionButton = ({
  icon,
  onPress,
  size = 40,
  iconSize,
  disabled = false,
  accessibilityLabel,
  variant = 'chrome',
  style,
}: ActionButtonProps) => {
  const { colors, isDark } = useTheme();
  const [pressed, setPressed] = useState(false);
  const visual = Math.max(36, size);
  const glyph = iconSize ?? Math.round(visual * 0.5);
  const hit = Math.max(44, visual);

  const chromeBg = pressed
    ? colors.surfaceElevated
    : isDark
      ? 'rgba(255,255,255,0.06)'
      : 'rgba(0,0,0,0.04)';
  const chromeBorder = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)';
  const plainBg = pressed
    ? isDark
      ? 'rgba(255,255,255,0.08)'
      : 'rgba(0,0,0,0.06)'
    : 'transparent';

  const isChrome = variant === 'chrome';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      hitSlop={Math.max(0, Math.ceil((hit - visual) / 2))}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled }}
      style={[
        styles.button,
        {
          width: visual,
          height: visual,
          borderRadius: visual / 2,
          backgroundColor: isChrome ? chromeBg : plainBg,
          borderColor: isChrome ? chromeBorder : 'transparent',
          borderWidth: isChrome ? StyleSheet.hairlineWidth : 0,
          opacity: disabled ? 0.4 : 1,
        },
        style,
      ]}
    >
      <Icon
        name={icon}
        size={glyph}
        color={colors.text}
        stroke={isChrome ? 1.7 : 1.8}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
