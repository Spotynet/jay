import React from 'react';
import { View, StyleSheet, TouchableOpacity, LayoutChangeEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../ui/AppText';

interface SegmentedTabsProps {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
}

const TRACK_PADDING = 4;
const SEGMENT_GAP = 6;

export default function SegmentedTabs({ tabs, active, onChange }: SegmentedTabsProps) {
  const { colors, isDark } = useTheme();

  const activeIndex = Math.max(0, tabs.indexOf(active));
  const trackWidth = useSharedValue(0);

  const onLayout = (e: LayoutChangeEvent) => {
    trackWidth.value = e.nativeEvent.layout.width;
  };

  const animatedStyle = useAnimatedStyle(() => {
    const seg = trackWidth.value / tabs.length;
    const left = seg > 0 ? activeIndex * seg + SEGMENT_GAP / 2 : 0;
    const width = seg > 0 ? seg - SEGMENT_GAP : 0;
    return {
      width,
      transform: [{ translateX: withTiming(left, { duration: 240 }) }],
    };
  });

  return (
    <View
      style={[
        styles.track,
        {
          backgroundColor: isDark ? '#161618' : '#E9E9EE',
          borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
          shadowColor: isDark ? '#000000' : '#000000',
          shadowOpacity: isDark ? 0.45 : 0.12,
        },
      ]}
      onLayout={onLayout}
    >
      {/* Active pill indicator */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.indicator,
          {
            borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)',
            shadowColor: isDark ? '#000000' : '#000000',
            shadowOpacity: isDark ? 0.5 : 0.18,
            elevation: 6,
          },
          animatedStyle,
        ]}
      >
        <LinearGradient
          colors={
            isDark
              ? ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.04)']
              : ['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.02)']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[StyleSheet.absoluteFill, styles.indicatorFill]}
        />
      </Animated.View>

      <View style={styles.innerRow}>
        {tabs.map((tab) => {
          const isActive = tab === active;
          return (
            <TouchableOpacity
              key={tab}
              style={styles.tab}
              onPress={() => onChange(tab)}
              activeOpacity={0.8}
            >
              <AppText style={[styles.tabText, { color: isActive ? colors.text : colors.subtext }]}>
                {tab.toUpperCase()}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: TRACK_PADDING,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
  },
  innerRow: {
    flexDirection: 'row',
    flex: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  indicator: {
    position: 'absolute',
    top: TRACK_PADDING,
    bottom: TRACK_PADDING,
    left: 0,
    borderRadius: 12,
    borderWidth: 0.5,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
  },
  indicatorFill: {
    borderRadius: 12,
  },
});