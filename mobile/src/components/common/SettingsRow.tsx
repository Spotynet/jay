import React from 'react';
import { View, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../ui/AppText';

interface SettingsRowProps {
  label: string;
  summary?: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
  accentColor?: string;
  children?: React.ReactNode;
  onSummaryPress?: () => void;
}

export const SettingsRow = ({ label, summary, value, onValueChange, accentColor, children, onSummaryPress }: SettingsRowProps) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={styles.labelContainer}>
          <AppText style={[styles.label, { color: colors.subtext }]}>{label}</AppText>
          <TouchableOpacity onPress={onSummaryPress} disabled={!onSummaryPress || !value} activeOpacity={0.7}>
            <AppText style={[styles.summary, { color: value ? colors.text : colors.subtext }]}>
              {summary || (value ? 'Enabled' : 'Off')}
            </AppText>
          </TouchableOpacity>
        </View>
        <Switch 
          value={value} 
          onValueChange={onValueChange} 
          trackColor={{ true: accentColor }} 
          thumbColor="#FFFFFF"
          ios_backgroundColor={colors.border}
        />
      </View>
      {value && children && (
        <View style={styles.content}>
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    width: '100%',
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  summary: {
    fontSize: 17,
    fontWeight: '400',
  },
  content: {
    marginTop: 20,
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 20,
  },
});
