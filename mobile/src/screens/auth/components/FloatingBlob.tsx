import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withRepeat, withSequence, withTiming, useSharedValue } from 'react-native-reanimated';

export const FloatingBlob = ({ size, color }: { size: number, color: string }) => {
  const x = useSharedValue(0);
  const y = useSharedValue(0);

  React.useEffect(() => {
    x.value = withRepeat(withSequence(withTiming(30, { duration: 4000 }), withTiming(-30, { duration: 4000 })), -1, true);
    y.value = withRepeat(withSequence(withTiming(50, { duration: 5000 }), withTiming(-50, { duration: 5000 })), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }]
  }));

  return (
    <Animated.View style={[styles.blob, { width: size, height: size, backgroundColor: color, opacity: 0.3 }, animatedStyle]} />
  );
};

const styles = StyleSheet.create({
  blob: { borderRadius: 1000, position: 'absolute' }
});
