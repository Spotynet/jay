import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useResponsiveLayout } from '../../layout/responsive';
import { AppHeader } from './AppHeader';

interface ScreenLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  /** Full-screen modal dismiss control (X). Mutually preferred over showBack for details. */
  showClose?: boolean;
  leadingLabel?: string;
  onLeadingPress?: () => void;
  rightOption?: { icon?: any; render?: () => React.ReactNode; onPress?: () => void };
  onTitlePress?: () => void;
  showPicker?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  /**
   * When true (default), tablet widths center content to `contentMaxWidth`.
   * Timeline/home can opt out and manage their own column.
   */
  constrainWidth?: boolean;
}

export default function ScreenLayout({
  children,
  title,
  showBack = false,
  showClose = false,
  leadingLabel,
  onLeadingPress,
  rightOption,
  onTitlePress,
  showPicker,
  style,
  contentStyle,
  constrainWidth = true,
}: ScreenLayoutProps) {
  const { colors } = useTheme();
  const layout = useResponsiveLayout();

  const contentSizing =
    constrainWidth && layout.isTablet
      ? {
          maxWidth: layout.contentMaxWidth,
          width: '100%' as const,
          alignSelf: 'center' as const,
          paddingHorizontal: layout.screenPadding,
        }
      : {
          paddingHorizontal: layout.screenPadding,
        };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }, style]}>
      {(title || showBack || showClose || leadingLabel || rightOption) && (
        <AppHeader
          title={title}
          showBack={showBack}
          showClose={showClose}
          leadingLabel={leadingLabel}
          onLeadingPress={onLeadingPress}
          rightOption={rightOption}
          onTitlePress={onTitlePress}
          showPicker={showPicker}
        />
      )}
      <View style={[styles.content, contentSizing, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});
