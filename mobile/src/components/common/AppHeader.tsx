import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../ui/AppText';
import { Icon } from '../ui/Icon';
import { IconChevronLeft, IconChevronDown, IconX } from 'tabler-icons-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { ActionButton } from './ActionButton';

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  /** Modal-style dismiss (X). Prefer over showBack for full-screen detail modals. */
  showClose?: boolean;
  /**
   * Text leading action (e.g. Cancel). When set, replaces the back/close icon
   * in the leading slot — opt-in for editors that match modal Cancel/Save chrome.
   */
  leadingLabel?: string;
  onLeadingPress?: () => void;
  rightOption?: { icon?: any; render?: () => React.ReactNode; onPress?: () => void };
  onTitlePress?: () => void;
  showPicker?: boolean;
}

function dismissOrFallback(navigation: ReturnType<typeof useNavigation>) {
  if (navigation.canGoBack()) {
    navigation.goBack();
    return;
  }
  // Direct / deep-link entry without modal history.
  (navigation as any).navigate('Tabs', { screen: 'Today' });
}

export const AppHeader = ({
  title,
  showBack = false,
  showClose = false,
  leadingLabel,
  onLeadingPress,
  rightOption,
  onTitlePress,
  showPicker,
}: AppHeaderProps) => {
  const { colors, accentColor, isDark } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const showLeading = showBack || showClose || !!leadingLabel;

  const gradientColors = (
    isDark
      ? [accentColor + '14', 'rgba(0,0,0,0)']
      : [accentColor + '1A', 'rgba(255,255,255,0)']
  ) as [string, string];

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: withTiming(showPicker ? '180deg' : '0deg') }],
  }));

  const renderRight = () => {
    if (!rightOption) return null;
    if (rightOption.render) return rightOption.render();
    if (rightOption.icon) {
      return (
        <ActionButton
          icon={rightOption.icon}
          onPress={rightOption.onPress}
          size={40}
          accessibilityLabel="More options"
        />
      );
    }
    return null;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={styles.content}>
        {showLeading ? (
          <>
            <View style={styles.sideSlot}>
              {leadingLabel ? (
                <Pressable
                  onPress={onLeadingPress ?? (() => dismissOrFallback(navigation))}
                  hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
                  style={({ pressed }) => [styles.textActionHit, pressed && { opacity: 0.55 }]}
                  accessibilityRole="button"
                  accessibilityLabel={leadingLabel}
                >
                  <AppText style={[styles.textAction, { color: colors.text }]}>
                    {leadingLabel}
                  </AppText>
                </Pressable>
              ) : (
                <ActionButton
                  icon={showClose ? IconX : IconChevronLeft}
                  onPress={() => dismissOrFallback(navigation)}
                  size={40}
                  variant="plain"
                  accessibilityLabel={showClose ? 'Close' : 'Back'}
                />
              )}
            </View>
            <AppText
              style={[styles.title, styles.titleCenter, { color: colors.subtext }]}
              numberOfLines={1}
              accessibilityRole="header"
            >
              {title?.toUpperCase()}
            </AppText>
            <View style={[styles.sideSlot, styles.sideSlotEnd]}>{renderRight()}</View>
          </>
        ) : (
          <View style={styles.leftAlignedContent}>
            <View style={styles.textGroup}>
              <AppText style={[styles.brandTitle, { color: colors.text }]}>JUST A DAY</AppText>
              <View style={[styles.separator, { backgroundColor: colors.subtext }]} />
              <Pressable
                onPress={onTitlePress}
                disabled={!onTitlePress}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
                style={styles.titleRow}
                accessibilityRole={onTitlePress ? 'button' : undefined}
                accessibilityLabel={
                  onTitlePress
                    ? `Select date, ${title ?? 'Today'}${showPicker ? ', expanded' : ''}`
                    : undefined
                }
                accessibilityState={onTitlePress ? { expanded: !!showPicker } : undefined}
              >
                <AppText style={[styles.pageTitle, { color: colors.subtext }]}>
                  {title?.toUpperCase()}
                </AppText>
                {onTitlePress !== undefined && (
                  <Animated.View style={[styles.chevron, iconStyle]}>
                    <Icon name={IconChevronDown} size={16} color={colors.subtext} stroke={1.8} />
                  </Animated.View>
                )}
              </Pressable>
            </View>
            <View style={styles.actions}>{renderRight()}</View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%' },
  // Header row only — safe-area inset is applied once via paddingTop on container.
  content: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 6,
  },
  sideSlot: {
    minWidth: 48,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  sideSlotEnd: {
    alignItems: 'flex-end',
  },
  textActionHit: {
    minHeight: 44,
    justifyContent: 'center',
    paddingVertical: 4,
  },
  textAction: {
    fontSize: 17,
    fontWeight: '400',
    letterSpacing: -0.2,
  },
  leftAlignedContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 0,
    gap: 8,
  },
  textGroup: { flexDirection: 'row', alignItems: 'center', flexShrink: 1, minWidth: 0 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    minHeight: 44,
    paddingVertical: 4,
  },
  separator: { width: 1, height: 18, marginHorizontal: 8 },
  brandTitle: { fontSize: 16, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase' },
  pageTitle: { fontSize: 13, fontWeight: '400', letterSpacing: 2, textTransform: 'uppercase' },
  title: { fontSize: 13, fontWeight: '400', letterSpacing: 1.5, textTransform: 'uppercase' },
  titleCenter: { flex: 1, textAlign: 'center' },
  chevron: { marginLeft: 2 },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
});
