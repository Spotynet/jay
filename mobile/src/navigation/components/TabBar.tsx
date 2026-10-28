import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Icon } from '../../components/ui/Icon';
import {
  IconCalendar,
  IconChecklist,
  IconBook,
  IconBarbell,
  IconWallet,
} from 'tabler-icons-react-native';
import { useTheme } from '../../context/ThemeContext';

const icons = {
  Today: IconCalendar,
  Plan: IconChecklist,
  Journal: IconBook,
  Fitness: IconBarbell,
  Financial: IconWallet,
};

export const TabBar = ({ state, descriptors, navigation }: any) => {
  const { colors, accentColor } = useTheme();
  const insets = useSafeAreaInsets();
  // Apply the home-indicator inset once; keep a compact icon row above it.
  const bottomPad = Math.max(insets.bottom, 8);

  return (
    <View
      style={[
        styles.outerContainer,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: bottomPad,
        },
      ]}
    >
      <View style={styles.content}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;
          const IconComponent = icons[route.name as keyof typeof icons];

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tab}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={route.name}
            >
              <TabIcon
                name={IconComponent}
                focused={isFocused}
                accentColor={accentColor}
                colors={colors}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const TabIcon = ({
  name,
  focused,
  accentColor,
  colors,
}: {
  name: any;
  focused: boolean;
  accentColor: string;
  colors: any;
}) => {
  const scale = useSharedValue(focused ? 1.1 : 1);

  React.useEffect(() => {
    scale.value = withSpring(focused ? 1.1 : 1, { damping: 16, stiffness: 220 });
  }, [focused, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: withTiming(focused ? 1 : 0.65, { duration: 180 }),
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Icon
        name={name}
        size={focused ? 26 : 24}
        color={focused ? accentColor : colors.subtext}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  content: {
    height: 52,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
});
