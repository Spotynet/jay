import React from 'react';
import { View, TextInput, TextInputProps, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { Icon } from '../../../components/ui/Icon';
import { TablerIcon } from 'tabler-icons-react-native';

interface AuthInputProps extends TextInputProps {
  icon: TablerIcon;
}

export const AuthInput = ({ icon, style, ...props }: AuthInputProps) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderColor: colors.border }, style]}>
      <Icon name={icon} size={22} color={colors.subtext} />
      <TextInput
        style={[styles.input, { color: colors.text }]}
        placeholderTextColor={colors.subtext}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 20, borderWidth: 1.5, gap: 12 },
  input: { flex: 1, fontSize: 16 }
});
