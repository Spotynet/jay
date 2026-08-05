import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppHeader } from './AppHeader';

interface ScreenLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  rightOption?: { icon?: any; render?: () => React.ReactNode; onPress?: () => void };
  onTitlePress?: () => void;
  showPicker?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

export default function ScreenLayout({ children, title, showBack = false, rightOption, onTitlePress, showPicker, style, contentStyle }: ScreenLayoutProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }, style]}>
      {(title || showBack || rightOption) && (
        <AppHeader title={title} showBack={showBack} rightOption={rightOption} onTitlePress={onTitlePress} showPicker={showPicker} />
      )}
      <View style={[styles.content, { paddingHorizontal: 15 }, contentStyle]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});
