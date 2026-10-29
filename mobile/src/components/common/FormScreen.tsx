import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
  StyleProp,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useResponsiveLayout } from '../../layout/responsive';
import ScreenLayout from './ScreenLayout';
import { AppHeader } from './AppHeader';
import { AuthButton } from '../../screens/auth/components/AuthButton';
import { ErrorMessage } from '../ui/ErrorMessage';
import { AppText } from '../ui/AppText';

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
   * On tablet / wide web viewports, present as a centered dialog instead of a full page.
   * Phones always use the full-screen ScreenLayout.
   */
  containedOnWideWeb?: boolean;
  /**
   * `footer` (default) — pinned bottom Save via AuthButton (existing forms).
   * `header` — Cancel + Save as header text actions; no footer (opt-in compact editors).
   */
  submitPlacement?: 'footer' | 'header';
  /** Leading label when `submitPlacement="header"`. Defaults to Cancel. */
  cancelLabel?: string;
  onCancel?: () => void;
}

/**
 * Reusable layout for create/edit form screens.
 * Default: pins the submit button to the bottom while fields scroll.
 * Opt-in `submitPlacement="header"` for Cancel / Save chrome that matches
 * details-modal editors — does not change other forms.
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
  submitPlacement = 'footer',
  cancelLabel = 'Cancel',
  onCancel,
}: FormScreenProps) {
  const { colors } = useTheme();
  const layout = useResponsiveLayout();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const useDialog = containedOnWideWeb && layout.useContainedSheet;
  const headerSubmit = submitPlacement === 'header';

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
      return;
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    (navigation as any).navigate('Tabs', { screen: 'Today' });
  };

  const headerRight =
    headerSubmit
      ? {
          render: () => (
            <Pressable
              onPress={onSubmit}
              disabled={!!loading}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 4 }}
              style={({ pressed }) => [
                styles.headerSaveHit,
                (pressed || loading) && { opacity: 0.45 },
              ]}
              accessibilityRole="button"
              accessibilityLabel={submitTitle}
              accessibilityState={{ disabled: !!loading, busy: !!loading }}
            >
              <AppText style={[styles.headerSave, { color: colors.text }]}>
                {submitTitle}
              </AppText>
            </Pressable>
          ),
        }
      : rightOption;

  const scrollBody = (
    <ScrollView
      style={[styles.flex, scrollStyle]}
      contentContainerStyle={[
        styles.scrollContent,
        headerSubmit && styles.scrollContentHeaderSubmit,
        scrollContentStyle,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <ErrorMessage message={error ?? null} />
      {children}
    </ScrollView>
  );

  const formBody = headerSubmit ? (
    keyboardAvoiding ? (
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        {scrollBody}
      </KeyboardAvoidingView>
    ) : (
      scrollBody
    )
  ) : keyboardAvoiding ? (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {scrollBody}
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
      {scrollBody}
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
  );

  if (useDialog) {
    const dialogWidth = Math.min(
      layout.sheetMaxWidth,
      layout.width - layout.sheetClearance * 2,
    );
    const dialogMaxHeight = layout.height - layout.sheetClearance * 2;
    // Header (~56) + optional footer (~72) leave the remainder for the scrolling body.
    const chromeReserve = headerSubmit ? 56 : 128;
    const bodyMaxHeight = Math.max(240, dialogMaxHeight - chromeReserve);

    return (
      <View
        style={[
          styles.backdrop,
          {
            backgroundColor: 'rgba(0,0,0,0.45)',
            padding: layout.sheetClearance,
          },
        ]}
        accessibilityViewIsModal
      >
        <View
          style={[
            styles.dialog,
            {
              backgroundColor: colors.background,
              width: dialogWidth,
              maxWidth: layout.sheetMaxWidth,
              maxHeight: dialogMaxHeight,
              borderColor: colors.border,
            },
          ]}
          accessible
          accessibilityLabel={title ? `${title} editor` : 'Item editor'}
        >
          <AppHeader
            title={title}
            showBack={!headerSubmit && showBack}
            leadingLabel={headerSubmit ? cancelLabel : undefined}
            onLeadingPress={headerSubmit ? handleCancel : undefined}
            rightOption={headerRight}
          />
          <View style={[styles.dialogBody, { paddingHorizontal: 24, maxHeight: bodyMaxHeight }]}>
            {formBody}
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScreenLayout
      title={title}
      showBack={!headerSubmit && showBack}
      leadingLabel={headerSubmit ? cancelLabel : undefined}
      onLeadingPress={headerSubmit ? handleCancel : undefined}
      rightOption={headerRight}
    >
      {formBody}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { paddingBottom: 24, paddingTop: 8 },
  scrollContentHeaderSubmit: {
    // No footer — keep a modest end pad for the last controls / keyboard.
    paddingBottom: 40,
  },
  footer: { paddingTop: 10 },
  headerSaveHit: {
    minHeight: 44,
    justifyContent: 'center',
    paddingVertical: 4,
  },
  headerSave: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialog: {
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    flexShrink: 1,
    flexDirection: 'column',
  },
  dialogBody: {
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
  },
});
