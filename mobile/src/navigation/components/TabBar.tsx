import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Text } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  useSharedValue, 
  withTiming
} from 'react-native-reanimated';
import { Icon } from '../../components/ui/Icon';
import { 
  IconCalendar, 
  IconLayoutGrid, 
  IconSettings, 
  IconBrain, 
  IconUser 
} from 'tabler-icons-react-native';
import { useTheme } from '../../context/ThemeContext';

const icons = {
  Today: IconCalendar,
  Manage: IconLayoutGrid,
  Jay: null, 
  Reflect: IconBrain,
  Profile: IconUser,
};

export const TabBar = ({ state, descriptors, navigation }) => {
  const { colors, accentColor } = useTheme();

  return (
    <View style={[styles.outerContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      <View style={styles.container}>
        <TabContent state={state} navigation={navigation} colors={colors} accentColor={accentColor} />
      </View>
    </View>
  );
};

const TabContent = ({ state, navigation, colors, accentColor }) => (
  <View style={styles.content}>
    {state.routes.map((route, index) => {
      const isFocused = state.index === index;
      
      if (index === 2) {
        return (
          <TouchableOpacity 
            key="JAY" 
            style={styles.centerTab} 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Jay')}
          >
            <View style={[styles.centerButton, { backgroundColor: colors.background, borderColor: isFocused ? accentColor : colors.subtext }]}>
              <Text style={[styles.centerButtonText, { color: isFocused ? accentColor : colors.subtext }]}>JAY</Text>
            </View>
          </TouchableOpacity>
        );
      }

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
        >
          <TabIcon name={IconComponent} focused={isFocused} accentColor={accentColor} colors={colors} />
        </TouchableOpacity>
      );
    })}
  </View>
);

const TabIcon = ({ name, focused, accentColor, colors }) => {
  const scale = useSharedValue(focused ? 1.15 : 1);
  const translateY = useSharedValue(focused ? -4 : 0);

  React.useEffect(() => {
    scale.value = withSpring(focused ? 1.15 : 1, { damping: 15, stiffness: 200 });
    translateY.value = withSpring(focused ? -4 : 0, { damping: 15, stiffness: 200 });
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: withTiming(focused ? 1 : 0.6, { duration: 200 }),
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
    height: 70,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 15 : 0,
    overflow: 'visible',
  },
  container: {
    flex: 1,
    overflow: 'visible',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
    overflow: 'visible',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    top: -30,
  },
  centerButton: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
