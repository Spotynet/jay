import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
  StyleProp,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import ScreenLayout from './ScreenLayout';
import { AppHeader } from './AppHeader';
import { AuthButton } from '../../screens/auth/components/AuthButton';
import { ErrorMessage } from '../ui/ErrorMessage';

const DESKTOP_EDITOR_MIN_WIDTH = 720;
const DESKTOP_EDITOR_MAX_WIDTH = 640;
const DESKTOP_EDITOR_CLEARANCE = 28;

interface FormScreenProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  rightOption?: { icon?: any; render?: () => React.ReactNode; onPress?: () => void };
  submitTitle: string;
  onSubmit: () => void;
  loading?: boolean;
  error?: string | null;
  submitStyle?: StyleProp<ViewStyle>;
  scrollStyle?: StyleProp<ViewStyle>;
  scrollContentStyle?: StyleProp<ViewStyle>;
  keyboardAvoiding?: boolean;
  /**
   * On wide web viewports, present as a centered dialog instead of a full page.
   * Phone / native always use the full-screen ScreenLayout.
   */
  containedOnWideWeb?: boolean;
}

/**
 * Reusable layout for create/edit form screens.
 * Pins the submit button to the bottom (above the keyboard)
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
  error,
  submitStyle,
  scrollStyle,
  scrollContentStyle,
  keyboardAvoiding = true,
  containedOnWideWeb = true,
}: FormScreenProps) {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const useDialog =
    containedOnWideWeb && Platform.OS === 'web' && width >= DESKTOP_EDITOR_MIN_WIDTH;

  const formBody = (
    <>
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
            <ErrorMessage message={error ?? null} />
            {children}
          </ScrollView>
          <View
            style={[
              styles.footer,
              {
                backgroundColor: colors.background,
                paddingBottom: Math.max(insets.bottom, 16),
              },
            ]}
          >
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
            <ErrorMessage message={error ?? null} />
            {children}
          </ScrollView>
          <View
            style={[
              styles.footer,
              {
                backgroundColor: colors.background,
                paddingBottom: Math.max(insets.bottom, 16),
              },
            ]}
          >
            <AuthButton title={submitTitle} onPress={onSubmit} loading={loading} style={submitStyle} />
          </View>
        </>
      )}
    </>
  );

  if (useDialog) {
    const dialogWidth = Math.min(DESKTOP_EDITOR_MAX_WIDTH, width - DESKTOP_EDITOR_CLEARANCE * 2);
    const dialogMaxHeight = height - DESKTOP_EDITOR_CLEARANCE * 2;
    // Header (~56) + footer (~72) leave the remainder for the scrolling body.
    const bodyMaxHeight = Math.max(240, dialogMaxHeight - 128);

    return (
      <View
        style={[styles.backdrop, { backgroundColor: 'rgba(0,0,0,0.45)' }]}
        accessibilityViewIsModal
      >
        <View
          style={[
            styles.dialog,
            {
              backgroundColor: colors.background,
              width: dialogWidth,
              maxHeight: dialogMaxHeight,
              borderColor: colors.border,
            },
          ]}
          accessible
          accessibilityLabel={title ? `${title} editor` : 'Item editor'}
        >
          <AppHeader title={title} showBack={showBack} rightOption={rightOption} />
          <View style={[styles.dialogBody, { paddingHorizontal: 24, maxHeight: bodyMaxHeight }]}>
            {formBody}
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScreenLayout title={title} showBack={showBack} rightOption={rightOption}>
      {formBody}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { paddingBottom: 24, paddingTop: 8 },
  footer: { paddingTop: 10 },
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: DESKTOP_EDITOR_CLEARANCE,
  },
  dialog: {
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    maxWidth: DESKTOP_EDITOR_MAX_WIDTH,
    flexShrink: 1,
    // Keep header + footer visible; body scrolls inside.
    flexDirection: 'column',
  },
  dialogBody: {
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
  },
});
