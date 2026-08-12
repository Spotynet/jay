import React from 'react';
import { View, StyleSheet, Switch, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Box from './Box';
import Label from './Label';
import { AppText } from './AppText';

interface ToggleBoxProps {
  label: string;
  summary?: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
  accentColor?: string;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Expandable toggle section — Label above, then a Box with summary + Switch header.
 * When toggled on, children are revealed below a subtle divider.
 */
export default function ToggleBox({
  label,
  summary,
  value,
  onValueChange,
  accentColor,
  children,
  style,
}: ToggleBoxProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.root, style]}>
      <Label style={styles.label}>{label}</Label>
      <Box>
        <View style={styles.header}>
          {summary && (
            <AppText style={[styles.summary, { color: value ? colors.text : colors.subtext }]}>
              {summary}
            </AppText>
          )}
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ true: accentColor }}
            thumbColor="#FFFFFF"
            ios_backgroundColor={colors.border}
          />
        </View>
        {value && children && (
          <View style={[styles.content, { borderTopColor: colors.border }]}>
            {children}
          </View>
        )}
      </Box>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
  },
  label: {
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summary: {
    fontSize: 17,
    fontWeight: '400',
  },
  content: {
    marginTop: 20,
    width: '100%',
    borderTopWidth: 1,
    paddingTop: 20,
  },
});