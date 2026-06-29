import React from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { AppText } from '../../../components/ui/AppText';
import { Icon } from '../../../components/ui/Icon';
import { IconBrandGoogle, IconBrandApple } from 'tabler-icons-react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

export const AuthLayout = ({ title, subtitle, children, showSocial = true, progress }: { title: string, subtitle?: string, children: React.ReactNode, showSocial?: boolean, progress?: number }) => {
  const { colors } = useTheme();

  const progressStyle = useAnimatedStyle(() => ({
    width: withTiming(`${(progress || 0) * 100}%`, { duration: 400 }),
  }));
  
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
        <AppText style={[styles.brand, { color: colors.text }]}>J A Y</AppText>
        
        <View style={styles.headerContainer}>
          <AppText style={[styles.title, { color: colors.text }]}>{title}</AppText>
          {subtitle && <AppText style={[styles.subtitle, { color: colors.subtext }]}>{subtitle}</AppText>}
        </View>
        
        <View style={styles.formContainer}>
            {progress !== undefined && (
              <View style={[styles.progressBarContainer, { backgroundColor: colors.border }]}>
                <Animated.View style={[styles.progressBar, progressStyle, { backgroundColor: colors.accent }]} />
              </View>
            )}
            {children}
        </View>

        {showSocial && (
          <>
            <View style={styles.dividerContainer}>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <AppText style={[styles.dividerText, { color: colors.subtext }]}>OR</AppText>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            </View>

            <View style={styles.socialContainer}>
              <TouchableOpacity style={[styles.socialButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Icon name={IconBrandGoogle} size={20} color={colors.text} />
                <AppText style={[styles.socialText, { color: colors.text }]}>Continue with Google</AppText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Icon name={IconBrandApple} size={20} color={colors.text} />
                <AppText style={[styles.socialText, { color: colors.text }]}>Continue with Apple</AppText>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 32, justifyContent: 'center' },
  brand: { fontSize: 40, fontWeight: '900', letterSpacing: 4, textAlign: 'center', marginBottom: 8 },
  headerContainer: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 14, fontWeight: '400', textAlign: 'center' },
  formContainer: { gap: 16 },
  progressBarContainer: { height: 4, borderRadius: 2, marginBottom: 24, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 2 },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 32 },
  divider: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 12, fontSize: 12, fontWeight: '700' },
  socialContainer: { gap: 12 },
  socialButton: { padding: 16, borderRadius: 16, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  socialText: { fontSize: 16, fontWeight: '600' }
});
