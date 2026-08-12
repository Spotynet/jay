import React from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import ScreenLayout from './ScreenLayout';
import { AuthButton } from '../../screens/auth/components/AuthButton';

interface FormScreenProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  rightOption?: { icon?: any; render?: () => React.ReactNode; onPress?: () => void };
  submitTitle: string;
  onSubmit: () => void;
  loading?: boolean;
  submitStyle?: StyleProp<ViewStyle>;
  scrollStyle?: StyleProp<ViewStyle>;
  scrollContentStyle?: StyleProp<ViewStyle>;
  keyboardAvoiding?: boolean;
}

/**
 * Reusable layout for create/edit form screens.
 * Pins the submit button to the bottom of the screen (above the keyboard)
 * while the form fields scroll. Always use this for new create/edit forms.
 */
export default function FormScreen({
  children,
  title,
  showBack,
  rightOption,
  submitTitle,
  onSubmit,
  loading,
  submitStyle,
  scrollStyle,
  scrollContentStyle,
  keyboardAvoiding = true,
}: FormScreenProps) {
  const { colors } = useTheme();

  return (
    <ScreenLayout title={title} showBack={showBack} rightOption={rightOption}>
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={[styles.flex, scrollStyle]}
            contentContainerStyle={[styles.scrollContent, scrollContentStyle]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
          <View style={[styles.footer, { backgroundColor: colors.background }]}>
            <AuthButton title={submitTitle} onPress={onSubmit} loading={loading} style={submitStyle} />
          </View>
        </KeyboardAvoidingView>
      ) : (
        <>
          <ScrollView
            style={[styles.flex, scrollStyle]}
            contentContainerStyle={[styles.scrollContent, scrollContentStyle]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
          <View style={[styles.footer, { backgroundColor: colors.background }]}>
            <AuthButton title={submitTitle} onPress={onSubmit} loading={loading} style={submitStyle} />
          </View>
        </>
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  footer: { paddingBottom: 20, paddingTop: 10 },
});