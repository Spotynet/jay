import React from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from './AppText';

interface LabelProps {
  children: React.ReactNode;
  style?: object;
}

/**
 * Standard section label — uppercase, small, semibold.
 * fontSize: 11, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase'.
 */
export default function Label({ children, style }: LabelProps) {
  const { colors } = useTheme();
  return (
    <AppText style={[styles.label, { color: colors.subtext }, style]}>
      {children}
    </AppText>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'left',
    width: '100%',
  },
});