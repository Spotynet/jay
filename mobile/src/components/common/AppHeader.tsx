import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../ui/AppText';
import { Icon } from '../ui/Icon';
import { IconChevronLeft, IconChevronDown } from 'tabler-icons-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { ActionButton } from './ActionButton';

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  rightOption?: { icon?: any; render?: () => React.ReactNode; onPress?: () => void };
  onTitlePress?: () => void;
  showPicker?: boolean;
}

export const AppHeader = ({ title, showBack = false, rightOption, onTitlePress, showPicker }: AppHeaderProps) => {
  const { colors, accentColor, isDark } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const gradientColors = (
    isDark
      ? [accentColor + '14', 'rgba(0,0,0,0)']
      : [accentColor + '1A', 'rgba(255,255,255,0)']
  ) as [string, string];

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: withTiming(showPicker ? '180deg' : '0deg') }]
  }));

  const renderRight = () => {
    if (!rightOption) return null;
    if (rightOption.render) return rightOption.render();
    if (rightOption.icon) return <ActionButton icon={rightOption.icon} onPress={rightOption.onPress} size={40} />;
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
        {showBack ? (
          <>
            <View style={styles.leftContainer}>
              <ActionButton icon={IconChevronLeft} onPress={() => navigation.goBack()} size={40} />
            </View>
            <AppText style={[styles.title, styles.titleCenter, { color: colors.subtext }]}>
              {title?.toUpperCase()}
            </AppText>
            <View style={styles.rightContainer}>
              {renderRight()}
            </View>
          </>
        ) : (
          <View style={styles.leftAlignedContent}>
            <View style={styles.textGroup}>
              <AppText style={[styles.brandTitle, { color: colors.text }]}>
                JUST A DAY
              </AppText>
              <View style={[styles.separator, { backgroundColor: colors.subtext }]} />
              <TouchableOpacity onPress={onTitlePress} style={styles.titleRow} disabled={!onTitlePress}>
                <AppText style={[styles.pageTitle, { color: colors.subtext }]}>
                  {title?.toUpperCase()}
                </AppText>
                {onTitlePress !== undefined && (
                  <Animated.View style={[styles.chevron, iconStyle]}>
                    <Icon name={IconChevronDown} size={16} color={colors.subtext} />
                  </Animated.View>
                )}
              </TouchableOpacity>
            </View>
            {renderRight()}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%' },
  content: { height: 85, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15 },
  leftContainer: { width: 50, alignItems: 'flex-start' },
  rightContainer: { width: 50, alignItems: 'flex-end' },
  leftAlignedContent: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  textGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  separator: { width: 1, height: 18 },
  brandTitle: { fontSize: 16, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase' },
  pageTitle: { fontSize: 14, fontWeight: '400', letterSpacing: 3, textTransform: 'uppercase' },
  title: { fontSize: 14, fontWeight: '400', letterSpacing: 1.5, textTransform: 'uppercase' },
  titleCenter: { flex: 1, textAlign: 'center' },
  chevron: { marginLeft: 2 }
});
